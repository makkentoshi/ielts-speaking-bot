import dotenv from "dotenv";

dotenv.config();

export const config = {
  BOT_TOKEN: process.env.BOT_TOKEN || "",
  MONGODB_URI:
    process.env.MONGODB_URI || "mongodb://localhost:27017/ielts_spanish_bot",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || "",
DEEPSEEK_BASE_URL: 'https://api.deepseek.com/v1'
};
