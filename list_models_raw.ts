import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function listModels() {
  try {
    const modelsResponse = await ai.models.list();
    // Assuming modelsResponse is the object returned
    console.log(JSON.stringify(modelsResponse, null, 2));
  } catch (err) {
    console.error("Error listing models:", err);
  }
}

listModels();
