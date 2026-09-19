import { describe, expect, it } from "vitest";
import {
  QUOTE_EMAIL_FROM,
  assertQuotePdfSendAllowed,
  quotePdfEmailBrand,
} from "./quotePdfEmail";

describe("quote PDF email policy", () => {
  it("uses the approved sender and Gold/Navy identity", () => {
    expect(QUOTE_EMAIL_FROM).toBe("Concrete Concepts <info@concreteconceptsgroup.com>");
    expect(quotePdfEmailBrand).toEqual({ gold: "#C9A44D", navy: "#0F2A44" });
  });

  it("allows only owner-built formal quote references", () => {
    expect(() => assertQuotePdfSendAllowed("CCG-QB-0083")).not.toThrow();
    expect(() => assertQuotePdfSendAllowed("CCG-0083")).toThrow(/legacy/i);
    expect(() => assertQuotePdfSendAllowed("CCG-EST-0083")).toThrow(/owner-built/i);
  });
});
