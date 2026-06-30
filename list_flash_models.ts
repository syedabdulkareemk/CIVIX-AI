import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function listModels() {
  try {
    const models = await ai.models.list();
    const flashModels = models.models.filter(m => m.name.includes("gemini") && m.name.includes("flash"));
    console.log("Flash models:", flashModels.map(m => m.name));
  } catch (err) {
    console.error("Error listing models:", err);
  }
}

listModels();
