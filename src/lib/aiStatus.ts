/**
 * Detect whether the configured AI provider has the credentials it needs.
 * Runs server-side only (reads process.env).
 *
 * - openai/anthropic/groq → require their respective API key
 * - ollama (or unset)     → considered "local" and always connected
 */
export function isAiConnected(): boolean {
  const provider = (process.env.ACTIVE_LLM_PROVIDER || "ollama").toLowerCase().trim();

  switch (provider) {
    case "openai":
      return Boolean(process.env.OPENAI_API_KEY?.trim());
    case "anthropic":
      return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
    case "groq":
      return Boolean(process.env.GROQ_API_KEY?.trim());
    case "ollama":
    case "":
      return Boolean(process.env.OLLAMA_BASE_URL?.trim());
    default:
      return false;
  }
}
