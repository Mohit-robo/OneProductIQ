import {
  AutoProcessor,
  AutoModelForImageTextToText,
  load_image,
} from "@huggingface/transformers";

const model_id = "onnx-community/FastVLM-0.5B-ONNX";

console.log("Loading processor...");
const processor = await AutoProcessor.from_pretrained(model_id);

console.log("Loading model...");
const model = await AutoModelForImageTextToText.from_pretrained(model_id, {
  dtype: {
    embed_tokens: "fp16",
    vision_encoder: "q4",
    decoder_model_merged: "q4",
  },
});

console.log("Loading image...");

const image = await load_image(
  "../test_images/large_dataset/large_fashion/images/1163.jpg"
);

const messages = [
  {
    role: "user",
    content: "<image>Describe this image in detail.",
  },
];

const prompt = processor.apply_chat_template(messages, {
  add_generation_prompt: true,
});

const inputs = await processor(image, prompt, {
  add_special_tokens: false,
});

console.log("Generating...");

const outputs = await model.generate({
  ...inputs,
  max_new_tokens: 128,
  do_sample: false,
});

const decoded = processor.batch_decode(outputs.slice(null, [inputs.input_ids.dims.at(-1), null]), 
  {skip_special_tokens: true});

console.log("\nRESULT:\n");
console.log(decoded[0]);
