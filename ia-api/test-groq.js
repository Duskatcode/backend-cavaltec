require("dotenv").config();

const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

(async () => {
  try {
    const r = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        {
          role: "user",
          content: "Responde únicamente con la palabra: hola"
        }
      ]
    });

    console.log(r.choices[0].message.content);

  } catch (e) {
    console.error(e.status);
    console.error(e.code);
    console.error(e.message);
  }
})();
