const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const app = express();
const upload = multer({ dest: 'tmp/' });
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const PROMPTS_DIR = path.join(__dirname, 'prompts');
const RESULTS_FILE = path.join(UPLOAD_DIR, 'results.json');
const MAX_IMAGES = 500; // Increased for ZIP support

let processor, model;
let queue = [];
let processing = false;
let paused = false;
let results = [];
let currentJob = null;
let totalBatchCount = 0;

// Ensure dirs exist
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

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
    // If it's an array of strings, deduplicate
    if (obj.every(item => typeof item === 'string')) {
      return [...new Set(obj)];
    }
    // If it's an array of objects, try to deep deduplicate or leave as is
    return obj.map(item => deduplicateArrays(item));
  } else if (typeof obj === 'object' && obj !== null) {
    const newObj = {};
    for (const key in obj) {
      newObj[key] = deduplicateArrays(obj[key]);
    }
    return newObj;
  }
  return obj;
}

function saveResult(imageId, metadata) {
  // Extract and deduplicate if it's a JSON string
  let cleanedMeta = metadata;
  try {
    const jsonMatch = metadata.description.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
       const parsed = JSON.parse(jsonMatch[0]);
       const deduped = deduplicateArrays(parsed);
       cleanedMeta.description = JSON.stringify(deduped, null, 2);
    }
  } catch (e) { }

  results.push({ imageId, metadata: cleanedMeta });
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
        fs.unlinkSync(file.path); // Cleanup zip
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
    const csvHeader = 'id,filename,description\n';
    const csvRows = results.map(r => 
      `${r.imageId},"${r.metadata.filename}","${(r.metadata.description || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
    ).join('\n');
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
      do_sample: true,
      temperature: 0.1,
      repetition_penalty: 1.2,
    });

    const decoded = await processor.batch_decode(
      outputs.slice(null, [inputs.input_ids.dims.at(-1), null]),
      { skip_special_tokens: true }
    );

    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.json({ description: decoded[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Batch processing server running on port ${PORT}`);
});