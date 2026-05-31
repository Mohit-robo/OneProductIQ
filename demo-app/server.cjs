'use strict';
const express = require('express');
const multer  = require('multer');
const fs      = require('fs');
const path    = require('path');
const AdmZip  = require('adm-zip');
const csv     = require('csv-parser');
const FormData = require('form-data');
const cors = require('cors');

// ─── Config ─────────────────────────────────────────────────────────────────
const VLM_SERVICE_URL = 'http://127.0.0.1:8000'; // Python FastAPI VLM service
const PORT       = 3000;
const MAX_IMAGES = 500;
const UPLOAD_DIR  = path.join(__dirname, 'uploads');
const GT_FILE     = path.join(__dirname, '..', 'ml-fastvlm', 'test_images', 'styles.csv');

const app    = express();
app.use(cors());

// Serve the frontend if it's built
app.use(express.static(path.join(__dirname, '../demo-app-client/dist')));

const upload = multer({ dest: 'tmp/' });

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ─── State ───────────────────────────────────────────────────────────────────
let queue          = [];
let processing     = false;
let paused         = false;
let results        = [];
let groundTruth    = new Map();
let currentJob     = null;
let totalBatchCount = 0;
const RESULTS_FILE = path.join(UPLOAD_DIR, 'results.json');

// ─── Ground Truth ────────────────────────────────────────────────────────────
function loadGroundTruth() {
  if (!fs.existsSync(GT_FILE)) {
    console.warn('Ground Truth file not found:', GT_FILE);
    return;
  }
  fs.createReadStream(GT_FILE)
    .pipe(csv())
    .on('data', (row) => groundTruth.set(row.id, row))
    .on('end', () => console.log(`Loaded ${groundTruth.size} GT records.`));
}
loadGroundTruth();

// ─── VLM Proxy Helper ────────────────────────────────────────────────────────
/**
 * Send an image file (from disk path) to the Python VLM service.
 * Returns the parsed JSON metadata or a {raw_output: string} fallback.
 */
async function callVLMService(imagePath, originalName) {
  const b64 = fs.readFileSync(imagePath, 'base64');

  const response = await fetch(`${VLM_SERVICE_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_base64: b64 }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`VLM service error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.metadata; // { product_type, brand, ... } or { raw_output }
}

// ─── GT Comparison ───────────────────────────────────────────────────────────
function compareWithGT(imageId, vlmData) {
  const idMatch = imageId.toString().match(/\d+/);
  if (!idMatch) return null;
  const gt = groundTruth.get(idMatch[0]);
  if (!gt) return null;

  const mapping = {
    gender:         ['gender', 'target_gender'],
    masterCategory: ['main_category', 'category'],
    subCategory:    ['subcategory', 'sub_category'],
    articleType:    ['product_type', 'article_type'],
    baseColour:     ['primary_color', 'color'],
    usage:          ['occasions', 'usage'],
  };

  const comparison = {};
  for (const [gtKey, vlmKeys] of Object.entries(mapping)) {
    const gtVal = gt[gtKey]?.toLowerCase();
    let vlmVal  = null;

    for (const k of vlmKeys) {
      const match = Object.keys(vlmData).find(x => x.toLowerCase() === k);
      if (match) {
        vlmVal = Array.isArray(vlmData[match]) ? vlmData[match][0] : vlmData[match];
        break;
      }
    }

    if (vlmVal) {
      vlmVal = vlmVal.toString().toLowerCase();
      comparison[gtKey] = {
        gt: gt[gtKey],
        vlm: vlmVal,
        match: gtVal === vlmVal || gtVal.includes(vlmVal) || vlmVal.includes(gtVal),
      };
    }
  }

  return Object.keys(comparison).length > 0 ? comparison : null;
}

// ─── Save Result ─────────────────────────────────────────────────────────────
function saveResult(imageId, metadata, gtComparison = null) {
  results.push({ imageId, metadata, gt: gtComparison });
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results));
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// Health — also checks if VLM service is reachable
app.get('/health', async (req, res) => {
  try {
    const vlm = await fetch(`${VLM_SERVICE_URL}/health`);
    const vlmStatus = await vlm.json();
    res.json({ status: 'ok', vlmService: vlmStatus });
  } catch (e) {
    res.status(503).json({ status: 'degraded', vlmService: 'unreachable', error: e.message });
  }
});

// Single image upload & analyze
app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const metadata = await callVLMService(req.file.path, req.file.originalname);
    const gt = compareWithGT(req.file.originalname, metadata);
    res.json({ metadata, gt });
  } catch (err) {
    console.error('/upload error:', err.message);
    res.status(500).json({ error: err.message });
  } finally {
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
  }
});

// Queue images (files + ZIPs) for batch processing
app.post('/batch-process', upload.array('images'), (req, res) => {
  const filesToAdd = [];

  req.files.forEach(file => {
    if (file.originalname.toLowerCase().endsWith('.zip')) {
      try {
        const zip = new AdmZip(file.path);
        zip.getEntries().forEach(entry => {
          if (!entry.isDirectory && entry.name.match(/\.(jpg|jpeg|png|webp|bmp)$/i)) {
            const dest = path.join('tmp', `zip_${Date.now()}_${entry.name}`);
            fs.writeFileSync(dest, entry.getData());
            filesToAdd.push({ path: dest, originalName: entry.name });
          }
        });
        fs.unlinkSync(file.path);
      } catch (e) {
        console.error('ZIP extraction failed:', e);
      }
    } else {
      filesToAdd.push({ path: file.path, originalName: file.originalname });
    }
  });

  if (queue.length + filesToAdd.length > MAX_IMAGES)
    return res.status(400).json({ error: 'Queue limit exceeded' });

  const startId = results.length + queue.length + (currentJob ? 1 : 0) + 1;
  filesToAdd.forEach((f, i) => queue.push({ id: startId + i, ...f }));
  totalBatchCount = (totalBatchCount || results.length) + filesToAdd.length;

  if (!processing && !paused) startProcessing();
  res.json({ status: 'queued', count: filesToAdd.length });
});

app.post('/batch-process/resume', (req, res) => {
  paused = false;
  if (!processing) startProcessing();
  res.json({ status: 'resumed' });
});

app.post('/batch-process/pause', (req, res) => {
  paused = true;
  res.json({ status: 'paused' });
});

// Batch status
app.get('/batch-status', (req, res) => {
  res.json({
    queueLength: queue.length,
    processing: processing || !!currentJob,
    paused,
    resultsCount: results.length,
    currentFileName: currentJob?.originalName ?? null,
    totalCount: totalBatchCount || results.length,
    latestResults: results.slice(-5),
  });
});

// Export results as JSON or CSV
app.get('/batch-results', (req, res) => {
  if (req.query.format === 'csv') {
    const header = 'id,filename,description,gt_matches\n';
    const rows = results.map(r => {
      const summary = r.gt
        ? Object.values(r.gt).map(v => (v.match ? 'MATCH' : 'MISMATCH')).join('; ')
        : 'N/A';
      const desc = JSON.stringify(r.metadata).replace(/"/g, '""');
      return `${r.imageId},"${r.metadata.filename || ''}","${desc}","${summary}"`;
    }).join('\n');
    res.set('Content-Type', 'text/csv');
    return res.send(header + rows);
  }
  res.json(results);
});

// ─── Batch Queue Processor ───────────────────────────────────────────────────
async function startProcessing() {
  if (!queue.length || processing || paused) { processing = false; return; }
  processing = true;

  while (queue.length > 0 && !paused) {
    currentJob = queue.shift();
    console.log(`Processing ${currentJob.id}: ${currentJob.originalName}`);
    try {
      const metadata  = await callVLMService(currentJob.path, currentJob.originalName);
      const gt        = compareWithGT(currentJob.originalName, metadata);
      saveResult(currentJob.id, { filename: currentJob.originalName, ...metadata }, gt);
    } catch (err) {
      console.error(`Failed on ${currentJob.originalName}:`, err.message);
      saveResult(currentJob.id, { filename: currentJob.originalName, error: err.message });
    } finally {
      if (fs.existsSync(currentJob.path)) fs.unlinkSync(currentJob.path);
      currentJob = null;
    }
  }

  processing = false;
}

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`OneProductIQ server on http://localhost:${PORT}`);
  console.log(`VLM service expected at ${VLM_SERVICE_URL}`);
});