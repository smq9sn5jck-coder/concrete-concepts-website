import { describe, expect, it } from "vitest";
import { BAYSIDE_SOUTHEAST_REVIEW_PATH, BAYSIDE_SOUTHEAST_ROUTES } from "../shared/baysideSoutheastLocalJobsContent";
import { getBaysideSoutheastRouteAccess } from "../shared/baysideSoutheastPublication";

const candidateContext = { customerHost: false, previewEnabled: true, publishedEnabled: false };

describe("Bayside Southeast publication access policy", () => {
  it("returns baseline for every existing candidate route while both feature flags are off", () => {
    for (const path of BAYSIDE_SOUTHEAST_ROUTES) {
      expect(getBaysideSoutheastRouteAccess(path, {
        customerHost: false,
        previewEnabled: false,
        publishedEnabled: false,
      }), path).toBe("baseline");
    }
  });

  it("allows candidates only for a flagged non-customer preview or separately published customer request", () => {
    for (const path of BAYSIDE_SOUTHEAST_ROUTES) {
      expect(getBaysideSoutheastRouteAccess(path, candidateContext), path).toBe("preview");
      expect(getBaysideSoutheastRouteAccess(path, {
        customerHost: true,
        previewEnabled: true,
        publishedEnabled: false,
      }), path).toBe("baseline");
      expect(getBaysideSoutheastRouteAccess(path, {
        customerHost: true,
        previewEnabled: false,
        publishedEnabled: true,
      }), path).toBe("public");
    }
  });

  it("denies the review index on customer hosts and when preview is disabled, and denies unknown paths", () => {
    expect(getBaysideSoutheastRouteAccess(BAYSIDE_SOUTHEAST_REVIEW_PATH, candidateContext)).toBe("preview");
    expect(getBaysideSoutheastRouteAccess(BAYSIDE_SOUTHEAST_REVIEW_PATH, {
      customerHost: true,
      previewEnabled: true,
      publishedEnabled: true,
    })).toBe("not-found");
    expect(getBaysideSoutheastRouteAccess(BAYSIDE_SOUTHEAST_REVIEW_PATH, {
      customerHost: false,
      previewEnabled: false,
      publishedEnabled: true,
    })).toBe("not-found");
    expect(getBaysideSoutheastRouteAccess("/areas/unknown", candidateContext)).toBe("not-found");
    expect(getBaysideSoutheastRouteAccess("/areas/wynnum/extra", candidateContext)).toBe("not-found");
  });
});
