import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Mock storage
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://cdn.example.com/timelapse/test.jpg", key: "timelapse/test.jpg" }),
}));

// Mock sharp
vi.mock("sharp", () => ({
  default: vi.fn().mockReturnValue({
    resize: vi.fn().mockReturnThis(),
    jpeg: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from("fake-image-data")),
  }),
}));

import { generateTimelapse } from "./timelapse";
import { storagePut } from "./storage";

// Helper to create a mock Headers-like object
function createMockHeaders(entries: [string, string][]): any {
  const map = new Map(entries);
  return { get: (key: string) => map.get(key) || null };
}

// Standard mock implementation for all fetch calls
function setupFetchMock() {
  mockFetch.mockImplementation((url: string) => {
    // Original image download
    if (url === "https://example.com/photo.jpg") {
      return Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(Buffer.from("original-image").buffer),
      });
    }
    // BFL submit
    if (url.includes("api.bfl.ai/v1/flux-pro-1.0-fill")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: "test-id", polling_url: "https://api.bfl.ai/poll/test" }),
      });
    }
    // BFL poll - return Ready immediately
    if (url.includes("api.bfl.ai/poll")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: "Ready", result: { sample: "https://bfl.ai/result.jpg" } }),
      });
    }
    // Download generated image
    if (url.includes("bfl.ai/result.jpg")) {
      return Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(Buffer.from("generated-image").buffer),
        headers: createMockHeaders([["content-type", "image/jpeg"]]),
      });
    }
    return Promise.resolve({ ok: false });
  });
}

describe("Timelapse Generator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    process.env.BFL_API_KEY = "test-bfl-key";
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return the original image as the first stage", async () => {
    setupFetchMock();

    // Run the generation with fake timers advancing
    const promise = generateTimelapse(
      "https://example.com/photo.jpg",
      "base64maskdata",
      "exposed-aggregate"
    );

    // Advance timers to skip all polling delays (4 stages x 3000ms)
    for (let i = 0; i < 20; i++) {
      await vi.advanceTimersByTimeAsync(3000);
    }

    const result = await promise;

    // First stage should be the original image
    expect(result.stages[0].id).toBe("existing");
    expect(result.stages[0].imageUrl).toBe("https://example.com/photo.jpg");
    expect(result.stages[0].label).toBe("Existing");
  }, 30000);

  it("should generate at least 3 stages for a valid result", async () => {
    setupFetchMock();

    const promise = generateTimelapse(
      "https://example.com/photo.jpg",
      "base64maskdata",
      "plain"
    );

    for (let i = 0; i < 20; i++) {
      await vi.advanceTimersByTimeAsync(3000);
    }

    const result = await promise;

    expect(result.stages.length).toBeGreaterThanOrEqual(3);
    for (const stage of result.stages) {
      expect(stage.id).toBeDefined();
      expect(stage.label).toBeDefined();
      expect(stage.description).toBeDefined();
      expect(stage.imageUrl).toBeDefined();
    }
  }, 30000);

  it("should throw if BFL_API_KEY is not configured", async () => {
    delete process.env.BFL_API_KEY;

    // When BFL key is missing, callFluxFillForStage throws immediately (no polling)
    // So we just need the original image fetch to succeed
    mockFetch.mockImplementation((url: string) => {
      if (url === "https://example.com/photo.jpg") {
        return Promise.resolve({
          ok: true,
          arrayBuffer: () => Promise.resolve(Buffer.from("original-image").buffer),
        });
      }
      // BFL submit will never be called since key check happens first
      return Promise.resolve({ ok: false });
    });

    // No polling delays needed since BFL key check fails synchronously before fetch
    await expect(
      generateTimelapse("https://example.com/photo.jpg", "base64maskdata", "plain")
    ).rejects.toThrow("too few stages");
  }, 30000);

  it("should throw if original image cannot be fetched", async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url === "https://example.com/photo.jpg") {
        return Promise.resolve({ ok: false, status: 404 });
      }
      return Promise.resolve({ ok: false });
    });

    // No timers needed - the fetch failure happens before any polling
    await expect(
      generateTimelapse("https://example.com/photo.jpg", "base64maskdata", "plain")
    ).rejects.toThrow("Failed to fetch original image");
  }, 30000);

  it("should include correct stage labels in order", async () => {
    setupFetchMock();

    const promise = generateTimelapse(
      "https://example.com/photo.jpg",
      "base64maskdata",
      "broom-finish"
    );

    for (let i = 0; i < 20; i++) {
      await vi.advanceTimersByTimeAsync(3000);
    }

    const result = await promise;

    const expectedOrder = ["existing", "excavated", "formed", "poured", "finished"];
    const actualOrder = result.stages.map(s => s.id);

    // Check that whatever stages we got are in the correct order
    for (let i = 0; i < actualOrder.length - 1; i++) {
      const currentIdx = expectedOrder.indexOf(actualOrder[i]);
      const nextIdx = expectedOrder.indexOf(actualOrder[i + 1]);
      expect(currentIdx).toBeLessThan(nextIdx);
    }
  }, 30000);

  it("should use storagePut for generated images", async () => {
    setupFetchMock();

    const promise = generateTimelapse(
      "https://example.com/photo.jpg",
      "base64maskdata",
      "honed"
    );

    for (let i = 0; i < 20; i++) {
      await vi.advanceTimersByTimeAsync(3000);
    }

    await promise;

    // storagePut should be called for each generated stage (4 stages, not the original)
    expect(storagePut).toHaveBeenCalled();
    // Verify the key pattern
    const firstCall = (storagePut as any).mock.calls[0];
    expect(firstCall[0]).toMatch(/^timelapse\//);
  }, 30000);
});
