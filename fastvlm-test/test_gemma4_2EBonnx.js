import {
  AutoProcessor,
  Gemma4ForConditionalGeneration,
  TextStreamer,
  load_image,
//   read_audio,
} from "@huggingface/transformers";

// Load processor and model
const model_id = "onnx-community/gemma-4-E2B-it-ONNX";
const processor = await AutoProcessor.from_pretrained(model_id);
const model = await Gemma4ForConditionalGeneration.from_pretrained(model_id, {
  dtype: "q4",
  device: "cpu",
  use_external_data_format: true,
  progress_callback: (info) => {
    if (info.status === "progress_total") {
      console.log(`Loading model: ${info.progress}%`);
    }
  },
});

// Prepare inputs
const image = await load_image("https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/artemis.jpeg");

// Prepare prompt
const messages = [
  {
    role: "user",
    content: [
      {
        type: "image",
        image: image, // explicitly bind image
      },
      {
        type: "text",
        text: "Describe this image in detail",
      },
    ],
  },
];

const prompt = processor.apply_chat_template(messages, {
  enable_thinking: false,
  add_generation_prompt: true,
});

// const audio = await read_audio("https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/jfk.wav");
const inputs = await processor(
  prompt,
  {
    images: image,   // explicitly named
    // audio: undefined  // optional explicit nulling
  },
  {
    add_special_tokens: false,
  }
);

// Generate output
const outputs = await model.generate({
  ...inputs,
  max_new_tokens: 512,
  do_sample: false,
  streamer: new TextStreamer(processor.tokenizer, {
    skip_prompt: true,
    skip_special_tokens: false,
    // callback_function: (text) => { /* Do something with the streamed output */ },
  }),
});

// Decode output
const decoded = processor.batch_decode(
  outputs.slice(null, [inputs.input_ids.dims.at(-1), null]),
  { skip_special_tokens: true },
);
console.log(decoded[0]);
