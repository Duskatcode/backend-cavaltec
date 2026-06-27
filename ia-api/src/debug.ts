import dotenv from 'dotenv';

dotenv.config();

console.log({
  OPENAI_API_KEY:
    process.env.OPENAI_API_KEY?.slice(0, 12) + "...",
  OPENAI_BASE_URL: process.env.OPENAI_BASE_URL,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
});
