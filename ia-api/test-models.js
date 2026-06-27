require("dotenv").config();

const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

(async () => {
  const models = await client.models.list();

  console.log(
    models.data
      .map(m => m.id)
      .sort()
      .join("\n")
  );
})();
