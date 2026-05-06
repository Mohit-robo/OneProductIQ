const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const csv = require('csv-parser');

const app = express();
const upload = multer({ dest: 'tmp/' });
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const PROMPTS_DIR = path.join(__dirname, 'prompts');
const RESULTS_FILE = path.join(UPLOAD_DIR, 'results.json');
const GT_FILE = path.join(__dirname, '..', 'ml-fastvlm', 'test_images', 'styles.csv');
const MAX_IMAGES = 500;

let processor, model;
let queue = [];
let processing = false;
let paused = false;
let results = [];
let groundTruth = new Map();
let currentJob = null;
let totalBatchCount = 0;

// Ensure dirs exist
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Load Ground Truth
function loadGroundTruth() {
  if (!fs.existsSync(GT_FILE)) {
    console.warn("Ground Truth file not found:", GT_FILE);
    return;
  }
  fs.createReadStream(GT_FILE)
    .pipe(csv())
    .on('data', (data) => {
      groundTruth.set(data.id, data);
    })
    .on('end', () => {
      console.log(`Loaded ${groundTruth.size} Ground Truth records.`);
    });
}

async function initModel() {
  const { AutoProcessor, AutoModelForImageTextToText } = await import('@huggingface/transformers');
  processor = await AutoProcessor.from_pretrained("onnx-community/FastVLM-0.5B-ONNX");
  model = await AutoModelForImageTextToText.from_pretrained(
    "onnx-community/FastVLM-0.5B-ONNX",
    {
      device: "cuda",
      dtype: {
        embed_tokens: "fp16",
        vision_encoder: "q4",
        decoder_model_merged: "q4",
      },
    }
  );
  console.log("FastVLM loaded on CUDA");
  loadGroundTruth();
}

initModel().catch((e) => {
  console.error("Failed to load models:", e);
});

const getPrompt = () => {
  try {
    return fs.readFileSync(path.join(PROMPTS_DIR, 'product_identification.txt'), 'utf8');
  } catch (e) {
    return "Analyze this product image.";
  }
};

function deduplicateArrays(obj) {
  if (Array.isArray(obj)) {
    const flattened = obj.map(item => {
      if (typeof item === 'object' && item !== null) {
        if (item.text) return item.text;
        return Object.values(item).filter(v => typeof v !== 'object' && v !== null).join(" ");
      }
      return deduplicateArrays(item);
    });
    // Cap arrays (especially color hallucinations) to 8 unique meaningful elements
    return [...new Set(flattened.filter(v => v !== null && v !== undefined))].slice(0, 8);
  } else if (typeof obj === 'object' && obj !== null) {
    const newObj = {};
    const seenKeys = new Set();
    
    // Semantic aliases for key merging to maintain table consistency
    const aliases = {
      'brand_name': 'brand', 'brand': 'brand', 'Brand': 'brand',
      'product_type': 'product_type', 'type': 'product_type', 
      'main_category': 'main_category', 'category': 'main_category',
      'subcategory': 'subcategory', 'sub_category': 'subcategory',
      'primary_color': 'primary_color', 'color': 'primary_color',
      'target_gender': 'target_gender', 'gender': 'target_gender'
    };

    for (const key in obj) {
      const cleanKey = key.trim();
      const lowerKey = cleanKey.toLowerCase().replace(/[\s_]/g, '');
      
      // 1. Drop obvious hallucinations (repetitive booleans)
      if (lowerKey.startsWith('is') && (obj[key] === false || obj[key] === 'false')) continue;
      if (lowerKey === 'isrelevant' || lowerKey.includes('relevant')) continue;
      
      // 2. Schema mapping / Duplicate merging
      let targetKey = cleanKey;
      for (const [alias, real] of Object.entries(aliases)) {
        if (lowerKey === alias.replace(/_/g, '')) {
          targetKey = real;
          break;
        }
      }

      if (seenKeys.has(targetKey.toLowerCase())) continue;
      seenKeys.add(targetKey.toLowerCase());

      const value = deduplicateArrays(obj[key]);
      if (value !== null && value !== undefined && value !== "" && 
          !(Array.isArray(value) && value.length === 0)) {
        newObj[targetKey] = value;
      }

      // Safety: stop if model is spiraling into hundreds of keys
      if (seenKeys.size > 15) break; 
    }
    return newObj;
  }
  return obj;
}

function compareWithGT(imageId, vlmData) {
  // Extract number from filename (e.g. 1163.jpg or img_1163.png -> 1163)
  const idMatch = imageId.toString().match(/\d+/);
  if (!idMatch) return null;
  
  const idStr = idMatch[0];
  const gt = groundTruth.get(idStr);
  if (!gt) return null;

  const comparison = {};
  const mapping = {
    'gender': ['gender', 'target_gender'],
    'masterCategory': ['master_category', 'masterCategory', 'category', 'main_category'],
    'subCategory': ['sub_category', 'subCategory', 'type', 'subtype'],
    'articleType': ['article_type', 'articleType', 'product_type'],
    'baseColour': ['base_colour', 'baseColour', 'color', 'primary_color'],
    'usage': ['usage', 'best_occasion']
  };

  for (const [gtKey, vlmPossibleKeys] of Object.entries(mapping)) {
    const gtVal = gt[gtKey]?.toLowerCase();
    let vlmVal = null;

    // Find matching key in VLM output (case-insensitive check)
    const vlmKeys = Object.keys(vlmData);
    for (const possible of vlmPossibleKeys) {
      const matchKey = vlmKeys.find(k => k.toLowerCase().trim() === possible.toLowerCase());
      if (matchKey) {
        vlmVal = Array.isArray(vlmData[matchKey]) ? vlmData[matchKey][0] : vlmData[matchKey];
        break;
      }
    }

    if (vlmVal) {
      vlmVal = vlmVal.toString().toLowerCase();
      comparison[gtKey] = {
        gt: gt[gtKey],
        vlm: vlmVal,
        match: gtVal === vlmVal || gtVal.includes(vlmVal) || vlmVal.includes(gtVal)
      };
    }
  }

  return Object.keys(comparison).length > 0 ? comparison : null;
}

function extractJSON(text) {
  const jsonMatch = text.match(/\{[\s\S]*\}/) || text.match(/\{[\s\S]*/);
  if (!jsonMatch) return null;

  let rawJson = jsonMatch[0];
  try {
    return JSON.parse(rawJson);
  } catch (e) {
    let repaired = rawJson.trim();
    if ((repaired.match(/"/g) || []).length % 2 !== 0) repaired += '"';
    repaired = repaired.replace(/,\s*([\}\]])/g, '$1');
    const balance = (str, openChar, closeChar) => {
      const count = (str.match(new RegExp(`\\${openChar}`, 'g')) || []).length - 
                    (str.match(new RegExp(`\\${closeChar}`, 'g')) || []).length;
      return str + closeChar.repeat(Math.max(0, count));
    };
    repaired = balance(repaired, '[', ']');
    repaired = balance(repaired, '{', '}');
    try { return JSON.parse(repaired); } catch (err) { return null; }
  }
}

function saveResult(imageId, metadata) {
  let cleanedMeta = metadata;
  let gtComparison = null;
  const parsed = extractJSON(metadata.description);

  if (parsed) {
    const deduped = deduplicateArrays(parsed);
    cleanedMeta.description = JSON.stringify(deduped, null, 2);
    gtComparison = compareWithGT(metadata.filename, deduped);
  }

  results.push({
    imageId,
    metadata: cleanedMeta,
    gt: gtComparison
  });
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results));
}

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', modelLoaded: !!model }));

// Handle image queueing from files and ZIPS
app.post('/batch-process', upload.array('images'), (req, res) => {
  const filesToAdd = [];

  req.files.forEach(file => {
    if (file.originalname.toLowerCase().endsWith('.zip')) {
      try {
        const zip = new AdmZip(file.path);
        const zipEntries = zip.getEntries();
        zipEntries.forEach(entry => {
          if (!entry.isDirectory && entry.name.match(/\.(jpg|jpeg|png|webp|bmp)$/i)) {
            const entryPath = path.join('tmp', `zip_${Date.now()}_${entry.name}`);
            fs.writeFileSync(entryPath, entry.getData());
            filesToAdd.push({ path: entryPath, originalName: entry.name });
          }
        });
        fs.unlinkSync(file.path);
      } catch (e) {
        console.error("ZIP extraction failed:", e);
      }
    } else {
      filesToAdd.push({ path: file.path, originalName: file.originalname });
    }
  });

  if (queue.length + filesToAdd.length > MAX_IMAGES) {
    return res.status(400).json({ error: 'Queue limit exceeded' });
  }

  const startId = results.length + queue.length + (currentJob ? 1 : 0) + 1;
  filesToAdd.forEach((f, i) => {
    queue.push({ id: startId + i, path: f.path, originalName: f.originalName });
  });

  totalBatchCount = (totalBatchCount || results.length) + filesToAdd.length;

  if (!processing && !paused) startProcessing();
  res.json({ status: 'queued', count: filesToAdd.length });
});

// Resume processing
app.post('/batch-process/resume', (req, res) => {
  paused = false;
  if (!processing) startProcessing();
  res.json({ status: 'resumed' });
});

// Pause processing
app.post('/batch-process/pause', (req, res) => {
  paused = true;
  res.json({ status: 'paused' });
});

// Process queue sequentially
async function startProcessing() {
  if (!queue.length || processing || paused || !model) {
    processing = false;
    return;
  }

  processing = true;
  const { load_image } = await import('@huggingface/transformers');
  const selectedPrompt = getPrompt();

  while (queue.length > 0 && !paused) {
    currentJob = queue.shift();
    const imageId = currentJob.id;

    try {
      console.log(`Processing image ${imageId}: ${currentJob.originalName}`);
      const image = await load_image(currentJob.path);
      const messages = [{ role: "user", content: `<image>${selectedPrompt}` }];
      const prompt = await processor.apply_chat_template(messages, { add_generation_prompt: true });
      const inputs = await processor(image, prompt, { add_special_tokens: false });

      const outputs = await model.generate({
        ...inputs,
        max_new_tokens: 512,
        do_sample: true,
        temperature: 0.1,
        repetition_penalty: 1.2,
      });

      const decoded = await processor.batch_decode(
        outputs.slice(null, [inputs.input_ids.dims.at(-1), null]),
        { skip_special_tokens: true }
      );

      saveResult(imageId, {
        filename: currentJob.originalName,
        description: decoded[0]
      });

      if (fs.existsSync(currentJob.path)) fs.unlinkSync(currentJob.path);
    } catch (err) {
      console.error(`Error processing image ${imageId}:`, err);
      saveResult(imageId, {
        filename: currentJob.originalName,
        error: err.message
      });
    }
    currentJob = null;
  }

  processing = false;
}

// Get continuous results and status
app.get('/batch-status', (req, res) => {
  res.json({
    queueLength: queue.length,
    processing: processing || !!currentJob,
    paused,
    resultsCount: results.length,
    currentFileName: currentJob ? currentJob.originalName : null,
    totalCount: totalBatchCount || results.length,
    latestResults: results.slice(-5)
  });
});

// Export results
app.get('/batch-results', (req, res) => {
  const format = req.query.format === 'csv' ? 'csv' : 'json';
  if (format === 'csv') {
    const csvHeader = 'id,filename,description,gt_matches\n';
    const csvRows = results.map(r => {
      const matchSummary = r.gt ? Object.values(r.gt).map(v => `${v.match ? 'MATCH' : 'MISMATCH'}`).join('; ') : 'N/A';
      return `${r.imageId},"${r.metadata.filename}","${(r.metadata.description || '').replace(/"/g, '""').replace(/\n/g, ' ')}","${matchSummary}"`;
    }).join('\n');
    res.set('Content-Type', 'text/csv');
    return res.send(csvHeader + csvRows);
  }
  res.json(results);
});

// Single upload analysis
app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file || !model) return res.status(400).json({ error: 'No file or model not ready' });

  try {
    const { load_image } = await import('@huggingface/transformers');
    const image = await load_image(req.file.path);
    const selectedPrompt = getPrompt();
    const messages = [{ role: "user", content: `<image>${selectedPrompt}` }];
    const prompt = await processor.apply_chat_template(messages, { add_generation_prompt: true });
    const inputs = await processor(image, prompt, { add_special_tokens: false });

    const outputs = await model.generate({
      ...inputs,
      max_new_tokens: 512,
      do_sample: false, // Greedy decoding for stability
      repetition_penalty: 1.5, // Aggressive penalty for spirals
    });

    const decoded = await processor.batch_decode(
      outputs.slice(null, [inputs.input_ids.dims.at(-1), null]),
      { skip_special_tokens: true }
    );

    let vlmData = null;
    let gtComparison = null;
    try {
      const jsonMatch = decoded[0].match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        vlmData = JSON.parse(jsonMatch[0]);
        gtComparison = compareWithGT(req.file.originalname, vlmData);
      }
    } catch (e) { }

    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.json({ description: decoded[0], gt: gtComparison });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Batch processing server running on port ${PORT}`);
});