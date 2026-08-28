import { describe, expect, it } from "vitest";
import {
  createQuoteDraft,
  parseQuoteDraft,
  QUOTE_DRAFT_MAX_AGE_MS,
} from "../client/src/lib/quoteDraft";

describe("quote draft handoff", () => {
  it("preserves qualified homepage answers for the detailed wizard", () => {
    const serialized = createQuoteDraft(
      {
        name: "Jordan Client",
        mobile: "0412 345 678",
        email: "jordan@example.com",
        suburb: "Camp Hill 4152",
        services: ["driveway"],
        description: "Replace the existing driveway with exposed aggregate concrete.",
      },
      1_000
    );

    expect(parseQuoteDraft(serialized, 2_000)).toMatchObject({
      name: "Jordan Client",
      mobile: "0412 345 678",
      email: "jordan@example.com",
      suburb: "Camp Hill 4152",
      services: ["driveway"],
    });
  });

  it("returns null for expired drafts", () => {
    const serialized = createQuoteDraft({ name: "Old Lead" }, 1_000);

    expect(parseQuoteDraft(serialized, 1_000 + QUOTE_DRAFT_MAX_AGE_MS + 1)).toBeNull();
  });

  it("returns null for malformed or unsupported draft data", () => {
    expect(parseQuoteDraft("not-json", 2_000)).toBeNull();
    expect(parseQuoteDraft(JSON.stringify({ version: 99, savedAt: 1_000, data: {} }), 2_000)).toBeNull();
  });
});
