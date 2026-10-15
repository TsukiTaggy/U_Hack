import { describe, expect, it } from "vitest";
import { resolveModel } from "../lib/llm";

describe("resolveModel", () => {
  it("migrates the retired Groq Llama model to its supported replacement", () => {
    expect(
      resolveModel("https://api.groq.com/openai/v1", "llama-3.3-70b-versatile"),
    ).toBe("openai/gpt-oss-120b");
  });

  it("preserves models for other providers", () => {
    expect(
      resolveModel(
        "https://generativelanguage.googleapis.com/v1beta/openai",
        "gemini-2.5-flash",
      ),
    ).toBe("gemini-2.5-flash");
  });
});
