import { chromium, Browser, Page } from "playwright";

export interface LLMConfig {
  provider: "openai" | "ollama";
  apiKey?: string;
  url?: string; // e.g. http://localhost:11434 for Ollama
}

export interface UserProfile {
  resumeText: string;
  basicDetails: Record<string, string>;
}

export interface ScrapedField {
  id: string | null;
  name: string | null;
  type: string | null;
  label: string | null;
}

export class LocalAutoApplier {
  private llmConfig: LLMConfig;
  private userProfile: UserProfile;

  constructor(llmConfig: LLMConfig, userProfile: UserProfile) {
    this.llmConfig = llmConfig;
    this.userProfile = userProfile;
  }

  public async runApplication(jobUrl: string, headless: boolean = true): Promise<string> {
    let browser: Browser | null = null;
    try {
      browser = await chromium.launch({ headless });
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.goto(jobUrl, { waitUntil: "networkidle" });

      const scrapedFields = await this.scrapeFormFields(page);
      
      if (scrapedFields.length === 0) {
        throw new Error("No form fields detected on the provided job URL.");
      }

      const mapping = await this._askLLMForMapping(scrapedFields);

      for (const [key, value] of Object.entries(mapping)) {
        // Try to locate by name first, then id
        let locator = page.locator(`[name="${key}"]`);
        
        if ((await locator.count()) === 0) {
          locator = page.locator(`[id="${key}"]`);
        }

        if ((await locator.count()) > 0) {
          // ensure the element is a string value before trying to fill it
          if (typeof value === "string") {
            await locator.first().fill(value);
          }
        } else {
          console.warn(`Could not find a form field mapped to ${key}`);
        }
      }

      // Take a screenshot as proof of work
      const buffer = await page.screenshot({ fullPage: true });
      const base64Image = buffer.toString("base64");
      
      return `data:image/png;base64,${base64Image}`;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Application failed: ${error.message}`);
      }
      throw new Error("Application failed due to an unknown error.");
    } finally {
      if (browser) {
        await browser.close().catch((err) => console.error("Error closing browser:", err));
      }
    }
  }

  private async scrapeFormFields(page: Page): Promise<ScrapedField[]> {
    return page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll("input, textarea, select"));
      
      return inputs.map((el) => {
        const id = el.getAttribute("id");
        const name = el.getAttribute("name");
        const type = el.getAttribute("type");
        
        let label = null;
        if (id) {
          const labelEl = document.querySelector(`label[for="${id}"]`);
          if (labelEl) {
            label = labelEl.textContent?.trim() || null;
          }
        }
        
        if (!label && el.parentElement?.tagName.toLowerCase() === "label") {
          label = el.parentElement.textContent?.trim() || null;
        }

        return { id, name, type, label };
      });
    });
  }

  private async _askLLMForMapping(scrapedFields: ScrapedField[]): Promise<Record<string, string>> {
    const prompt = `
You are an expert AI matching assistant helping a user apply for a job.
Below is the user's resume and basic details.
User Profile:
${JSON.stringify(this.userProfile, null, 2)}

Below are the scraped form fields from the job application page:
${JSON.stringify(scrapedFields, null, 2)}

Your goal is to map the user's information to each form field.
Return a STRICT JSON object where the 'key' is the form field 'name' (or 'id' if 'name' is null) and the 'value' is the exact string value to be typed into the field.
Provide ONLY valid JSON, wrapped in curly braces without markdown code blocks. Do not explain your thought process.
`;

    if (this.llmConfig.provider === "openai") {
      return this.callOpenAI(prompt);
    } else if (this.llmConfig.provider === "ollama") {
      return this.callOllama(prompt);
    }

    throw new Error("Unsupported LLM provider.");
  }

  private async callOpenAI(prompt: string): Promise<Record<string, string>> {
    if (!this.llmConfig.apiKey) {
      throw new Error("Missing OpenAI API key.");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.llmConfig.apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.2
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI Request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    return this.parseJSONSafely(content);
  }

  private async callOllama(prompt: string): Promise<Record<string, string>> {
    const baseUrl = this.llmConfig.url || "http://localhost:11434";
    
    // Note: ensure Ollama is running internally with standard CORS if frontend requests run it
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3", // Assuming a standard ollama model, might want to make configurable later
        prompt: prompt,
        format: "json",
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama Request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return this.parseJSONSafely(data.response);
  }

  private parseJSONSafely(content: string): Record<string, string> {
    try {
      const result = JSON.parse(content);
      if (typeof result === "object" && result !== null && !Array.isArray(result)) {
        return result as Record<string, string>;
      }
      return {};
    } catch (error: unknown) {
      console.error("Failed to parse LLM response as JSON:", content);
      return {};
    }
  }
}