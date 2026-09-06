import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";

function seen(key: string): boolean {
  try { return !!localStorage.getItem(key); } catch { return false; }
}
function mark(key: string) {
  try { localStorage.setItem(key, "1"); } catch { /* storage unavailable */ }
}

/** A step is usable if it has no element (centered) or its element is on-screen. */
function usable(step: DriveStep): boolean {
  const el = step.element;
  if (!el) return true;
  const node = typeof el === "string" ? document.querySelector(el) : el;
  if (!node) return false;
  const r = (node as HTMLElement).getBoundingClientRect();
  return r.width > 0 && r.height > 0;
}

/**
 * Run a guided tour once per browser (tracked by `key`). Steps whose target
 * isn't visible on the current screen size are skipped, so it degrades
 * gracefully on mobile. If nothing is showable yet, it does nothing and stays
 * un-seen so it can run on a later visit.
 */
export function runTourOnce(key: string, steps: DriveStep[]) {
  if (seen(key)) return;
  const steps2 = steps.filter(usable);
  if (steps2.length === 0) return;
  const d = driver({
    showProgress: steps2.length > 1,
    allowClose: true,
    overlayColor: "#0c2318",
    overlayOpacity: 0.7,
    stagePadding: 6,
    stageRadius: 12,
    nextBtnText: "Next →",
    prevBtnText: "← Back",
    doneBtnText: "Got it!",
    steps: steps2,
    onDestroyed: () => mark(key),
  });
  d.drive();
}

export type { DriveStep };
