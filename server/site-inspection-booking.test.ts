import { describe, expect, it } from "vitest";
import { buildSiteInspectionBookingUrl, maskAustralianMobile } from "@shared/siteInspectionBooking";

describe("site inspection booking presentation", () => {
  it("masks the submitted mobile while keeping enough digits for recognition", () => {
    expect(maskAustralianMobile("0424 463 268")).toBe("04•• ••• 268");
    expect(maskAustralianMobile("+61 424 463 268")).toBe("61•• ••• 268");
    expect(maskAustralianMobile("123")).toBe("your mobile");
  });

  it("prefills only the client name and email on the approved Calendly URL", () => {
    const url = new URL(buildSiteInspectionBookingUrl("Sarah Taylor", "sarah@example.com"));

    expect(`${url.origin}${url.pathname}`).toBe(
      "https://calendly.com/concreteconceptsgroup-info/free-site-inspection-fixed-quote"
    );
    expect(url.searchParams.get("name")).toBe("Sarah Taylor");
    expect(url.searchParams.get("email")).toBe("sarah@example.com");
    expect([...url.searchParams.keys()]).toEqual(["name", "email"]);
  });

  it("omits empty prefill values", () => {
    expect(buildSiteInspectionBookingUrl(" ", " ")).toBe(
      "https://calendly.com/concreteconceptsgroup-info/free-site-inspection-fixed-quote"
    );
  });
});
