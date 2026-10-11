declare global {
  interface Window {
    __CCG_CONTEXT_TRACKING_ALLOWED?: boolean;
  }
}

/** The raw bootstrap closes this gate until context cleanup is verified. */
export function contextTrackingAllowed(): boolean {
  return typeof window === "undefined" || window.__CCG_CONTEXT_TRACKING_ALLOWED !== false;
}
