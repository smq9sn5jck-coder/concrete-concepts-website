// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import { scrollToCurrentHash } from "./hash-scroll";

describe("post-render hash scrolling", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    window.history.replaceState({}, "", "/");
  });

  it("scrolls to a rendered target from the current URL hash", () => {
    const target = document.createElement("section");
    target.id = "refer-a-job";
    target.scrollIntoView = vi.fn();
    document.body.appendChild(target);
    window.history.replaceState({}, "", "/trade-referral-program#refer-a-job");

    expect(scrollToCurrentHash()).toBe(true);
    expect(target.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
  });

  it("does nothing when there is no hash target", () => {
    window.history.replaceState({}, "", "/construction-growth-systems");
    expect(scrollToCurrentHash()).toBe(false);
  });

  it("does not throw when the hash target is not yet rendered", () => {
    window.history.replaceState(
      {},
      "",
      "/construction-growth-systems#growth-review"
    );
    expect(scrollToCurrentHash()).toBe(false);
  });
});
