import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOllama } from "ollama-ai-provider";
import { LanguageModel } from "ai";

export function getAIModel(): LanguageModel {
  const provider = process.env.ACTIVE_LLM_PROVIDER?.toLowerCase();

  // OpenAI Configuration
  if (provider === "openai" && process.env.OPENAI_API_KEY) {
    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    return openai("gpt-4-turbo") as unknown as LanguageModel; // Default model, ideally configurable
  }

  // Anthropic Configuration
  if (provider === "anthropic" && process.env.ANTHROPIC_API_KEY) {
    const anthropic = createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    return anthropic("claude-3-opus-20240229") as unknown as LanguageModel;
  }

  // Groq Configuration (uses OpenAI-compatible endpoint)
  if (provider === "groq" && process.env.GROQ_API_KEY) {
    const groq = createOpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });
    // llama-3.3-70b-versatile does not support JSON mode on Groq yet.
    // llama-3.1-8b-instant is fully supported for structured outputs.
    return groq.chat("llama-3.1-8b-instant") as unknown as LanguageModel;
  }

  // Fallback to local Ollama instance if no valid cloud API key is found
  const ollama = createOllama({
    baseURL: process.env.OLLAMA_BASE_URL || "http://localhost:11434/api",
  });
  
  return ollama("llama3") as unknown as LanguageModel;
}
