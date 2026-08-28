import { describe, it, expect } from "vitest";

describe("Windsor.ai API Key Validation", () => {
  it("should have WINDSOR_API_KEY configured", () => {
    const key = process.env.WINDSOR_API_KEY;
    expect(key).toBeDefined();
    expect(key!.length).toBeGreaterThan(5);
  });

  it("should successfully fetch data from Windsor.ai Google Ads connector", async () => {
    const key = process.env.WINDSOR_API_KEY;
    if (!key) {
      throw new Error("WINDSOR_API_KEY not set");
    }

    const url = `https://connectors.windsor.ai/google_ads?api_key=${key}&fields=campaign,clicks,spend&date_preset=last_7d`;
    const response = await fetch(url);

    expect(response.ok).toBe(true);

    const json = await response.json();
    // Windsor returns { data: [...] } or just an array
    const data = Array.isArray(json) ? json : (json.data ?? json);
    expect(Array.isArray(data)).toBe(true);
    // Should have at least one campaign (we know Performance Max is running)
    expect(data.length).toBeGreaterThan(0);
  }, 15000);
});
