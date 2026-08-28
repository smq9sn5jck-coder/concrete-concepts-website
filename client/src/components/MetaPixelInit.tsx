/*
  Meta Pixel Initialization
  Reads VITE_META_PIXEL_ID from environment and initializes fbq.
  Drop this component once in App.tsx — it runs on mount and fires PageView.
*/
import { useEffect } from "react";

const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined;

export default function MetaPixelInit() {
  useEffect(() => {
    if (!PIXEL_ID || typeof window === "undefined" || !window.fbq) return;

    window.fbq("init", PIXEL_ID);
    window.fbq("track", "PageView");
    console.log("[Meta Pixel] Initialized with ID:", PIXEL_ID);
  }, []);

  return null; // Render nothing — side-effect only
}
