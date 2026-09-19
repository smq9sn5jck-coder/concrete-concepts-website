const BOOKING_TOKEN_PATTERN = /^[a-f0-9]{64}$/;
const DEFAULT_TIMEOUT_MS = 10_000;

export type BookingLinkGatewayStatus =
  | "sent"
  | "already_sent"
  | "invalid"
  | "expired"
  | "failed"
  | "unknown"
  | "unavailable";

export type BookingDeliveryCreateResult = {
  token: string;
};

type FetchLike = typeof fetch;

function gatewayBaseUrl() {
  return (process.env.BOOKING_GATE_URL || "").replace(/\/+$/, "");
}

function gatewaySecret() {
  return process.env.BOOKING_GATE_SECRET || "";
}

export function isBookingGatewayConfigured() {
  return Boolean(gatewayBaseUrl() && gatewaySecret());
}

function endpoint(path: string) {
  return `${gatewayBaseUrl()}${path}`;
}

async function postJson(path: string, body: unknown, fetchImpl: FetchLike = fetch) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    return await fetchImpl(endpoint(path), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-booking-gate-secret": gatewaySecret(),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function readJson(response: Response) {
  return response.json().catch(() => ({})) as Promise<Record<string, unknown>>;
}

export async function createBookingDeliveryViaGateway(input: {
  customerName: string;
  customerPhone: string;
  fetchImpl?: FetchLike;
}): Promise<BookingDeliveryCreateResult> {
  if (!isBookingGatewayConfigured()) {
    throw new Error("Booking gateway is not configured");
  }

  const response = await postJson(
    "/api/public/booking-link/create",
    {
      customerName: input.customerName,
      customerPhone: input.customerPhone,
    },
    input.fetchImpl
  );
  const data = await readJson(response);
  if (!response.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Booking gateway create failed");
  }
  if (typeof data.token !== "string" || !BOOKING_TOKEN_PATTERN.test(data.token)) {
    throw new Error("Booking gateway returned an invalid token");
  }
  return { token: data.token };
}

export async function sendBookingLinkViaGateway(input: {
  token: string;
  fetchImpl?: FetchLike;
}): Promise<{ status: BookingLinkGatewayStatus }> {
  if (!isBookingGatewayConfigured()) return { status: "unavailable" };

  try {
    const response = await postJson(
      "/api/public/booking-link/send",
      { token: input.token },
      input.fetchImpl
    );
    const data = await readJson(response);
    if (!response.ok) {
      return { status: response.status === 503 ? "unavailable" : "failed" };
    }
    const status = data.status;
    if (
      status === "sent" ||
      status === "already_sent" ||
      status === "invalid" ||
      status === "expired" ||
      status === "failed" ||
      status === "unknown" ||
      status === "unavailable"
    ) {
      return { status };
    }
    return { status: "unknown" };
  } catch {
    return { status: "unavailable" };
  }
}
