import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { sendQuoteNotificationEmail } from "./email";

// Mock the notification module
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// Mock the db module
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null), // Return null to skip DB insert in test
}));

// Mock the email module to prevent actual email sending
vi.mock("./email", () => ({
  sendQuoteNotificationEmail: vi.fn().mockResolvedValue({ id: "test" }),
  sendCustomerConfirmationEmail: vi.fn().mockResolvedValue({ id: "test" }),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("quote.submit", () => {
  it("accepts a valid quote submission and returns success", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.quote.submit({
      name: "John Smith",
      phone: "0424 463 268",
      email: "john@example.com",
      suburb: "Manly West",
      service: "Driveway",
      details: "Need a new concrete driveway, approx 50sqm",
    });

    expect(result).toMatchObject({
      success: true,
      message: "Quote request submitted successfully!",
      serviceAreaStatus: "in_area",
    });
  });

  it("accepts a submission without optional details", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.quote.submit({
      name: "Jane Doe",
      phone: "0400 000 000",
      email: "jane@example.com",
      suburb: "Runcorn",
      service: "Exposed Aggregate",
    });

    expect(result).toMatchObject({
      success: true,
      message: "Quote request submitted successfully!",
    });
  });

  it("rejects submission with missing required fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.quote.submit({
        name: "",
        phone: "0424 463 268",
        email: "john@example.com",
        suburb: "Manly West",
        service: "Driveway",
      })
    ).rejects.toThrow();
  });

  it("rejects submission with invalid email", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.quote.submit({
        name: "John Smith",
        phone: "0424 463 268",
        email: "not-an-email",
        suburb: "Manly West",
        service: "Driveway",
      })
    ).rejects.toThrow();
  });

  it("rejects an overseas phone number at the server boundary", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.quote.submit({
        name: "Overseas Test",
        phone: "+52 55 1234 5678",
        email: "overseas@example.com",
        suburb: "Carindale 4152",
        service: "Driveway",
        formStartedAt: Date.now() - 10_000,
      })
    ).rejects.toThrow(/Australian phone number/i);
  });

  it("rejects a clearly interstate location at the server boundary", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.quote.submit({
        name: "Interstate Test",
        phone: "0412 345 678",
        email: "interstate@example.com",
        suburb: "Sydney NSW 2000",
        service: "Driveway",
        formStartedAt: Date.now() - 10_000,
      })
    ).rejects.toThrow(/South East Queensland/i);
  });

  it("accepts a plausible Queensland boundary location and flags it for review", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    const result = await caller.quote.submit({
      name: "Boundary Client",
      phone: "0413 987 654",
      email: "boundary@example.com",
      suburb: "Toowoomba QLD 4350",
      service: "Concrete Slab",
      formStartedAt: Date.now() - 10_000,
    });

    expect(result).toMatchObject({
      success: true,
      serviceAreaStatus: "service_area_review",
    });
  });

  it("rejects a filled honeypot at the server boundary", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.quote.submit({
        name: "Bot Test",
        phone: "0414 987 654",
        email: "bot@example.com",
        suburb: "Brisbane 4000",
        service: "Driveway",
        website: "https://spam.example",
        formStartedAt: Date.now() - 10_000,
      })
    ).rejects.toThrow(/try again/i);
  });

  it("rejects an implausibly fast submission at the server boundary", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.quote.submit({
        name: "Fast Bot",
        phone: "0415 987 654",
        email: "fast@example.com",
        suburb: "Brisbane 4000",
        service: "Driveway",
        formStartedAt: Date.now() - 100,
      })
    ).rejects.toThrow(/try again/i);
  });

  it("rejects a hero lead that uses an 07 landline-style number", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.quote.submit({
        formType: "hero_quick_quote",
        name: "Stephen Example",
        phone: "0794 483 241",
        email: "stephen@example.com",
        suburb: "Brisbane 4000",
        service: "Driveway",
        details: "Replace an existing residential driveway",
        formStartedAt: Date.now() - 10_000,
      } as any)
    ).rejects.toThrow(/mobile number/i);
  });

  it("rejects the incomplete legacy hero payload with a placeholder email", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.quote.submit({
        formType: "hero_quick_quote",
        name: "Incomplete Lead",
        phone: "0412 222 333",
        email: "not-provided@via-quick-form.com",
        suburb: "Carindale 4152",
        service: "General Enquiry",
        details: "Quick quote from hero form — follow up for full details",
        formStartedAt: Date.now() - 10_000,
      } as any)
    ).rejects.toThrow(/email/i);
  });

  it("accepts a complete hero lead with mobile, email, location, service, and details", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    const result = await caller.quote.submit({
      formType: "hero_quick_quote",
      name: "Complete Lead",
      phone: "0412 444 555",
      email: "complete@example.com",
      suburb: "Camp Hill 4152",
      service: "Driveway",
      details: "New exposed aggregate driveway around 55 square metres",
      formStartedAt: Date.now() - 10_000,
    } as any);

    expect(result).toMatchObject({
      success: true,
      serviceAreaStatus: "in_area",
    });
  });

  it("accepts a comprehensive job brief and forwards the structured requirements to the owner email", async () => {
    vi.mocked(sendQuoteNotificationEmail).mockClear();
    const caller = appRouter.createCaller(createPublicContext());
    const jobBrief = {
      version: 1,
      contact: {
        name: "Jordan Client",
        mobile: "0412 345 678",
        email: "jordan@example.com",
        preferredContact: "sms",
        company: "",
      },
      location: {
        streetAddress: "",
        suburb: "Camp Hill",
        postcode: "4152",
      },
      scope: {
        services: ["driveway"],
        workType: "replacement",
        finish: "exposed",
        timeframe: "within_1_month",
        description: "Remove the existing driveway and replace it with exposed aggregate concrete.",
      },
      measurements: { mode: "not_sure" },
      siteConditions: {
        existingConcreteRemoval: true,
        accessWidthM: 3.2,
        vehicleAccess: "easy",
        slope: "slight",
        drainage: "existing_drain",
        pumpAccess: "not_sure",
        knownServices: "Water line near the garage",
        approvalStatus: "not_sure",
        specialRequirements: "Keep access to the side gate",
      },
      photos: [],
      consents: { contact: true, privacy: true, marketing: false },
    };

    const result = await caller.quote.submit({
      name: "Jordan Client",
      phone: "0412 345 678",
      email: "jordan@example.com",
      suburb: "Camp Hill 4152",
      service: "Driveway",
      details: "Remove the existing driveway and replace it with exposed aggregate concrete.",
      jobBrief,
      formStartedAt: Date.now() - 10_000,
    } as any);

    expect(result).toMatchObject({ success: true, serviceAreaStatus: "in_area" });
    expect(sendQuoteNotificationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        jobBrief: expect.objectContaining({
          location: expect.objectContaining({ suburb: "Camp Hill", postcode: "4152" }),
          measurements: expect.objectContaining({ mode: "not_sure" }),
        }),
      })
    );
  });

  it("rejects a comprehensive quote when contact or privacy consent is missing", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.quote.submit({
        name: "No Consent Client",
        phone: "0412 888 999",
        email: "no-consent@example.com",
        suburb: "Camp Hill 4152",
        service: "Driveway",
        details: "Replace a cracked driveway with plain concrete across approximately 40 square metres.",
        jobBrief: {
          version: 1,
          contact: {
            name: "No Consent Client",
            mobile: "0412 888 999",
            email: "no-consent@example.com",
            preferredContact: "phone",
          },
          location: { suburb: "Camp Hill", postcode: "4152" },
          scope: {
            services: ["driveway"],
            workType: "replacement",
            finish: "plain",
            timeframe: "within_1_month",
            description: "Replace a cracked driveway with plain concrete across approximately 40 square metres.",
          },
          measurements: { mode: "not_sure" },
          siteConditions: {},
          photos: [],
          consents: { contact: false, privacy: false, marketing: false },
        },
        formStartedAt: Date.now() - 10_000,
      } as any)
    ).rejects.toThrow(/consent|privacy/i);
  });
});
