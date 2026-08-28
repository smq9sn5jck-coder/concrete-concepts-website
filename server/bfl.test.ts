import { describe, it, expect } from "vitest";

describe("BFL API Key Validation", () => {
  it("should authenticate with the BFL FLUX API", { timeout: 30000 }, async () => {
    const apiKey = process.env.BFL_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey!.startsWith("bfl_")).toBe(true);

    // Test with a minimal request to verify the key works
    const response = await fetch("https://api.bfl.ai/v1/flux-kontext-pro", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-key": apiKey!,
      },
      body: JSON.stringify({
        prompt: "A plain grey concrete slab",
        input_image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663224384481/UhcRVNGrN3cwmYDv2dLhdW/quote-photos/1780583714044-e1ef48809c3b.jpg",
        aspect_ratio: "4:3",
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    // BFL returns an id and polling_url on success
    expect(data.id).toBeDefined();
    expect(data.polling_url).toBeDefined();
  });
});
