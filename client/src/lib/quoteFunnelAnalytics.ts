export type QuoteFunnelEventName =
  | "quote_page_view"
  | "quote_step_reached"
  | "quote_validation_blocked"
  | "quote_submit_started"
  | "quote_submit_confirmed"
  | "quote_submit_failed";

export type QuoteFunnelValue = string | number | boolean;
export type QuoteFunnelDispatch = (
  name: QuoteFunnelEventName,
  data: Record<string, QuoteFunnelValue>
) => void;

type UnsafePayload = Record<string, unknown>;

declare global {
  interface Window {
    umami?: {
      track: (name: string, data?: Record<string, QuoteFunnelValue>) => void;
    };
  }
}

const EVENT_NAMES = new Set<QuoteFunnelEventName>([
  "quote_page_view",
  "quote_step_reached",
  "quote_validation_blocked",
  "quote_submit_started",
  "quote_submit_confirmed",
  "quote_submit_failed",
]);

const STEP_NAMES = new Set([
  "contact",
  "location",
  "job_brief",
  "measure_photos",
  "review",
]);

const TRAFFIC_CLASSES = new Set(["paid", "organic", "referral", "direct", "other"]);
const VALIDATION_CODES = new Set([
  "name_missing",
  "mobile_invalid",
  "email_invalid",
  "suburb_missing",
  "postcode_invalid",
  "outside_service_area",
  "service_missing",
  "work_type_missing",
  "finish_missing",
  "timeframe_missing",
  "description_short",
  "dimensions_incomplete",
  "area_missing",
  "consent_missing",
  "photo_upload_pending",
  "quote_schema_invalid",
  "unknown",
]);
const PHOTO_STATES = new Set(["absent", "present", "pending"]);
const DELIVERY_PATHS = new Set(["primary", "fallback"]);
const FAILURE_STAGES = new Set([
  "primary_rejected",
  "primary_and_fallback",
  "schema",
  "unknown",
]);

function safeEnum(value: unknown, allowed: Set<string>, fallback: string) {
  return typeof value === "string" && allowed.has(value) ? value : fallback;
}

function safeStep(value: unknown) {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 5
    ? Number(value)
    : 0;
}

export function deriveQuoteTrafficClass(leadSource?: string): string {
  const source = (leadSource ?? "").toLowerCase();
  if (source.includes("ads") || source.includes("paid")) return "paid";
  if (source.includes("organic") || source.includes("maps")) return "organic";
  if (source.includes("referral") || source.includes("facebook") || source.includes("instagram")) {
    return "referral";
  }
  if (source === "direct") return "direct";
  return "other";
}

export function sanitizeQuoteFunnelEvent(
  name: QuoteFunnelEventName,
  payload: UnsafePayload
): { name: QuoteFunnelEventName; data: Record<string, QuoteFunnelValue> } {
  if (!EVENT_NAMES.has(name)) {
    throw new Error("Unsupported quote funnel event");
  }

  const trafficClass = safeEnum(payload.traffic_class, TRAFFIC_CLASSES, "other");
  let data: Record<string, QuoteFunnelValue>;

  switch (name) {
    case "quote_page_view":
      data = {
        traffic_class: trafficClass,
        page_variant: "comprehensive_quote",
      };
      break;
    case "quote_step_reached":
      data = {
        step: safeStep(payload.step),
        step_name: safeEnum(payload.step_name, STEP_NAMES, "unknown"),
        traffic_class: trafficClass,
      };
      break;
    case "quote_validation_blocked":
      data = {
        step: safeStep(payload.step),
        validation_code: safeEnum(payload.validation_code, VALIDATION_CODES, "unknown"),
        traffic_class: trafficClass,
      };
      break;
    case "quote_submit_started":
      data = {
        traffic_class: trafficClass,
        photo_state: safeEnum(payload.photo_state, PHOTO_STATES, "absent"),
      };
      break;
    case "quote_submit_confirmed":
      data = {
        delivery_path: safeEnum(payload.delivery_path, DELIVERY_PATHS, "primary"),
        traffic_class: trafficClass,
      };
      break;
    case "quote_submit_failed":
      data = {
        failure_stage: safeEnum(payload.failure_stage, FAILURE_STAGES, "unknown"),
        traffic_class: trafficClass,
      };
      break;
  }

  return { name, data };
}

type QueuedEvent = ReturnType<typeof sanitizeQuoteFunnelEvent>;

interface BufferedDispatchOptions {
  getCollector?: () => Window["umami"] | undefined;
  schedule?: (callback: () => void, delayMs: number) => number;
  maxAttempts?: number;
  maxQueueSize?: number;
}

export function createBufferedQuoteFunnelDispatch(
  options: BufferedDispatchOptions = {}
) {
  const getCollector =
    options.getCollector ??
    (() => (typeof window === "undefined" ? undefined : window.umami));
  const schedule =
    options.schedule ??
    ((callback: () => void, delayMs: number) => window.setTimeout(callback, delayMs));
  const maxAttempts = options.maxAttempts ?? 20;
  const maxQueueSize = options.maxQueueSize ?? 20;
  const queue: QueuedEvent[] = [];
  let attempts = 0;
  let scheduled = false;

  const flush = () => {
    scheduled = false;
    const collector = getCollector();
    if (collector?.track) {
      while (queue.length) {
        const event = queue.shift();
        if (event) collector.track(event.name, event.data);
      }
      attempts = 0;
      return;
    }

    attempts += 1;
    if (attempts >= maxAttempts) {
      queue.length = 0;
      return;
    }
    if (queue.length) scheduleFlush();
  };

  const scheduleFlush = () => {
    if (scheduled) return;
    scheduled = true;
    schedule(flush, 500);
  };

  const dispatch: QuoteFunnelDispatch = (name, payload) => {
    const event = sanitizeQuoteFunnelEvent(name, payload);
    const collector = getCollector();
    if (collector?.track) {
      flush();
      collector.track(event.name, event.data);
      return;
    }
    if (queue.length >= maxQueueSize) queue.shift();
    queue.push(event);
    scheduleFlush();
  };

  return { dispatch, pendingCount: () => queue.length };
}

const bufferedDispatch = createBufferedQuoteFunnelDispatch();
export const dispatchQuoteFunnelEvent = bufferedDispatch.dispatch;

export function createQuoteFunnelTracker(
  dispatch: QuoteFunnelDispatch = dispatchQuoteFunnelEvent
) {
  const sent = new Set<string>();

  const sendOnce = (
    key: string,
    name: QuoteFunnelEventName,
    payload: UnsafePayload
  ) => {
    if (sent.has(key)) return;
    sent.add(key);
    const event = sanitizeQuoteFunnelEvent(name, payload);
    dispatch(event.name, event.data);
  };

  return {
    pageView(trafficClass: string) {
      sendOnce("page", "quote_page_view", { traffic_class: trafficClass });
    },
    stepReached(step: number, stepName: string, trafficClass: string) {
      sendOnce(`step:${step}`, "quote_step_reached", {
        step,
        step_name: stepName,
        traffic_class: trafficClass,
      });
    },
    validationBlocked(step: number, code: string, trafficClass = "other") {
      sendOnce(`validation:${step}:${code}`, "quote_validation_blocked", {
        step,
        validation_code: code,
        traffic_class: trafficClass,
      });
    },
    submitStarted(trafficClass: string, photoState: string) {
      const event = sanitizeQuoteFunnelEvent("quote_submit_started", {
        traffic_class: trafficClass,
        photo_state: photoState,
      });
      dispatch(event.name, event.data);
    },
    submitConfirmed(deliveryPath: string, trafficClass: string) {
      sendOnce("submit:confirmed", "quote_submit_confirmed", {
        delivery_path: deliveryPath,
        traffic_class: trafficClass,
      });
    },
    submitFailed(failureStage: string, trafficClass: string) {
      const event = sanitizeQuoteFunnelEvent("quote_submit_failed", {
        failure_stage: failureStage,
        traffic_class: trafficClass,
      });
      dispatch(event.name, event.data);
    },
  };
}
