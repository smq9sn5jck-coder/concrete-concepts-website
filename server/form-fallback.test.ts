import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { submitFormFallback } from "../client/src/lib/formFallback";

describe("submitFormFallback", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {
      location: { pathname: "/get-quote", href: "" },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("rejects an overseas number before contacting the fallback endpoint", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      submitFormFallback({
        name: "Overseas Lead",
        phone: "+52 55 1234 5678",
        suburb: "Carindale 4152",
      })
    ).rejects.toThrow(/Australian phone number/i);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects an 07 landline-style number for the homepage hero form", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      submitFormFallback({
        formType: "hero_quick_quote",
        name: "False Hero Lead",
        phone: "0794 483 241",
        email: "lead@example.com",
        suburb: "Brisbane 4000",
        service: "Driveway",
        details: "Replace an existing driveway",
        formStartedAt: Date.now() - 10_000,
      })
    ).rejects.toThrow(/mobile number/i);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends every required hero lead field to the edge endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await submitFormFallback({
      formType: "hero_quick_quote",
      name: "Complete Hero Lead",
      phone: "0412 345 678",
      email: "complete@example.com",
      suburb: "Camp Hill 4152",
      service: "Driveway",
      details: "New exposed aggregate driveway around 55 square metres",
      formStartedAt: Date.now() - 10_000,
    });

    const request = fetchMock.mock.calls[0][1];
    const payload = JSON.parse(request.body);
    expect(payload).toMatchObject({
      formType: "hero_quick_quote",
      phone: "0412345678",
      email: "complete@example.com",
      suburb: "Camp Hill 4152",
      service: "Driveway",
      details: "New exposed aggregate driveway around 55 square metres",
    });
  });

  it("reports confirmed API delivery as successful", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));

    await expect(
      submitFormFallback({
        name: "Local Lead",
        phone: "0424 463 268",
        suburb: "Carindale 4152",
        formStartedAt: Date.now() - 10_000,
      })
    ).resolves.toEqual({ success: true, method: "api" });
  });

  it("does not claim success when the endpoint fails and mail must be sent manually", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({ error: "Delivery failed" }),
    }));

    const result = await submitFormFallback({
      name: "Local Lead",
      phone: "0424 463 268",
      suburb: "Brisbane 4000",
      formStartedAt: Date.now() - 10_000,
    });

    expect(result).toMatchObject({ success: false, method: "mailto" });
    expect(window.location.href).toContain("mailto:");
  });
});
