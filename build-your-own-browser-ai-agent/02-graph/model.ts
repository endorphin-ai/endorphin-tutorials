// Picks the brain: real Gemini, or a scripted fake (MODEL=fake) for runs without a key.
import { ChatGoogle } from "@langchain/google/node";
import { fakeFor } from "./fake.ts";

export const MODEL_ID = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

export function chatModel(lesson: string) {
  if (process.env.MODEL === "fake") {
    console.log(`[model simulated, browser real] lesson ${lesson}`);
    return fakeFor(lesson);
  }
  // Without a key, ChatGoogle would quietly use your gcloud login (Vertex AI) instead. Be explicit.
  if (!process.env.GOOGLE_API_KEY) throw new Error("Set GOOGLE_API_KEY in .env (see .env.example), or run with MODEL=fake");
  return new ChatGoogle({ model: MODEL_ID, temperature: 0 });
}
