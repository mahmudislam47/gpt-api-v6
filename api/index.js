const express = require("express");
const cors = require("cors");
const getGPT4js = require("gpt4js");

const app = express();

app.use(cors());
app.use(express.json());

// Root endpoint
app.get("/", (req, res) => res.send("Server is running..."));

// Chat endpoint with improved error handling and optimization
app.post("/chat", async (req, res) => {
  const { messages, options } = req.body;

  if (!Array.isArray(messages) || typeof options !== "object") {
    return res.status(400).json({ error: "Invalid input. 'messages' must be an array and 'options' an object." });
  }

  try {
    const GPT4js = await getGPT4js();
    const provider = GPT4js.createProvider(options.provider);

    if (!provider) {
      return res.status(500).json({ error: "Failed to initialize provider." });
    }

    const text = await provider.chatCompletion(messages, options, (data) => {
      console.log(data);
    });

    res.json({ response: text });
  } catch (error) {
    console.error("Error in /chat:", error.message || error);
    res.status(500).json({ error: "An error occurred during chat processing." });
  }
});

// Image generation endpoint with enhanced validation
app.post("/generate-image", async (req, res) => {
  const { prompt, options } = req.body;

  if (typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "Invalid input. 'prompt' must be a non-empty string." });
  }
  if (typeof options !== "object" || !options.provider) {
    return res.status(400).json({ error: "Invalid input. 'options' must be an object with a 'provider' property." });
  }

  try {
    const GPT4js = await getGPT4js();
    const provider = GPT4js.createProvider(options.provider);

    if (!provider) {
      return res.status(500).json({ error: "Failed to initialize provider." });
    }

    const base64 = await provider.imageGeneration(prompt, options);
    res.json({ image: base64 });
  } catch (error) {
    console.error("Error in /generate-image:", error.message || error);
    res.status(500).json({ error: "An error occurred during image generation." });
  }
});

// Export the app for Vercel serverless functions
module.exports = app;
