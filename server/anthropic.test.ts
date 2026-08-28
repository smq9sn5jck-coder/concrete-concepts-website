import { describe, it, expect } from "vitest";

describe("Anthropic API Key Validation", () => {
  it("should authenticate with the Anthropic API", { timeout: 30000 }, async () => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey!.startsWith("sk-ant-")).toBe(true);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey!,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 10,
        messages: [{ role: "user", content: "Hi" }],
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.type).toBe("message");
    expect(data.content).toBeDefined();
  });
});
