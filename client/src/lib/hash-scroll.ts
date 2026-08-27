export function scrollToCurrentHash() {
  if (typeof window === "undefined" || !window.location.hash) return false;

  const targetId = decodeURIComponent(window.location.hash.slice(1));
  const target = document.getElementById(targetId);
  if (!target) return false;

  target.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}
