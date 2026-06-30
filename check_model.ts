import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function checkModel(modelName: string) {
  try {
    const model = await ai.models.get({ model: modelName });
    console.log(JSON.stringify(model, null, 2));
  } catch (err) {
    console.error("Error checking model:", err);
  }
}

checkModel("models/gemini-3.5-flash");
