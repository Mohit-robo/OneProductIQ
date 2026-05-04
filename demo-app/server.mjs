import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

let processor, model;

async function init() {
  const tf = await import("@huggingface/transformers");
  processor = await tf.AutoProcessor.from_pretrained("onnx-community/FastVLM-0.5B-ONNX");
  model = await tf.AutoModelForImageTextToText.from_pretrained(
    "onnx-community/FastVLM-0.5B-ONNX",
    {
      dtype: {
        embed_tokens: "fp16",
        vision_encoder: "q4",
        decoder_model_merged: "q4",
      },
    }
  );
  console.log("Models loaded");
}

init().catch((e) => {
  console.error("Failed to load models:", e);
  process.exit(1);
});

const app = express();
const upload = multer({ dest: "tmp/" });

// Serve available prompts (filenames + content)
app.get("/prompts", (req, res) => {
  try {
    const promptsDir = path.join(process.cwd(), "prompts");
    const files = fs.readdirSync(promptsDir).filter((f) => f.endsWith(".txt"));
    
    const prompts = files.map((file) => {
      const content = fs.readFileSync(path.join(promptsDir, file), "utf8");
      return {
        title: file.replace(".txt", ""),
        content,
      };
    });
    
    res.json({ prompts });
  } catch (err) {
    console.error("Error reading prompts:", err);
    res.status(500).json({ error: "Could not read prompts" });
  }
});

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;
    const selectedPrompt = req.body.prompt || "Describe this image in detail.";
    
    // Dynamic import for load_image to avoid ESM export issue
    const transformers = await import("@huggingface/transformers");
    const image = await transformers.load_image(`./tmp/${file.filename}`);

    const messages = [{ role: "user", content: `<image>${selectedPrompt}` }];
    const prompt = await processor.apply_chat_template(messages, {
      add_generation_prompt: true,
    });
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
    res.json({ description: decoded[0] });
  } catch (err) {
    console.error("Error processing upload:", err);
    res.status(500).json({ error: "Processing failed" });
  }
});

app.listen(3000, () => console.log("Demo server running on :3000"));