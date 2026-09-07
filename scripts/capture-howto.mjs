// Regenerates the /how-to-play screenshots into src/assets/how-to/*.webp.
// One-off dev tool (Playwright is NOT a project dependency). To run:
//   npm i -D playwright && npx playwright install chromium
//   node scripts/capture-howto.mjs           # captures from production
//   CAP_BASE=http://localhost:8080 node scripts/capture-howto.mjs   # from local dev
// Captures PNGs then converts them to .webp via python+Pillow (already used by
// the media pipeline); the .webp files are what the page imports.
import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";

const BASE = process.env.CAP_BASE || "https://terra.fortomorrow.life";
const OUT = path.resolve("src/assets/how-to");
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 810 }, deviceScaleFactor: 1.5 });

// Suppress first-visit tour + tier bookend videos on every navigation.
await ctx.addInitScript(() => {
  try {
    localStorage.setItem("tm-tour-firstgame-v1", "1");
    localStorage.setItem("tm-tour-mystery-v1", "1");
    localStorage.setItem("tm-bookends-shown-v1", JSON.stringify(
      ["intro-T1","intro-T2","intro-T3","intro-T4","outro-T1","outro-T2","outro-T3","outro-T4"]));
  } catch {}
});

const page = await ctx.newPage();
const done = [];
const settle = async (ms = 1300) => { await page.waitForLoadState("networkidle").catch(() => {}); await page.waitForTimeout(ms); };
const snap = async (name) => { await page.screenshot({ path: path.join(OUT, name) }); done.push(name); console.log("shot", name); };
const step = async (name, fn) => { try { await fn(); } catch (e) { console.log("FAIL", name, e.message); } };

// 2. Mode select
await step("mode-select", async () => { await page.goto(BASE + "/mode-select"); await settle(); await snap("mode-select.png"); });

// 3. Role select (pick a role so the detail panel populates)
await step("role-select", async () => {
  await page.goto(BASE + "/role-select"); await settle();
  await page.getByRole("button", { name: /Scientist/i }).first().click({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(700);
  await snap("role-select.png");
});

// Establish game state: confirm the role -> lands on /play
await step("confirm-role", async () => {
  await page.getByRole("button", { name: /Confirm role/i }).click({ timeout: 5000 });
  await page.waitForURL("**/play", { timeout: 15000 }).catch(() => {});
  await settle(1600);
});

// Dismiss the one-time Role Orientation Challenge modal so it doesn't cover shots.
await step("dismiss-orientation", async () => {
  for (let i = 0; i < 4; i++) {
    const skip = page.getByText(/Skip question/i).first();
    if (await skip.isVisible().catch(() => false)) { await skip.click().catch(() => {}); await page.waitForTimeout(400); }
    else break;
  }
  await page.waitForTimeout(500);
});

// 1. HUD / play home
await step("hud", async () => { await snap("hud.png"); });

// 4. Card sequence puzzle
await step("card-puzzle", async () => {
  await page.goto(BASE + "/play/mysteries/m01"); await settle(1600);
  // dismiss the intro overlay if it is open
  for (const label of [/Skip/i, /Start/i, /Continue/i]) {
    await page.getByRole("button", { name: label }).first().click({ timeout: 1200 }).catch(() => {});
  }
  await page.keyboard.press("Escape").catch(() => {});
  await page.waitForTimeout(700);
  // scroll so the "System chain puzzle" (cards + Validate) sits in frame
  await page.mouse.move(720, 500);
  await page.mouse.wheel(0, 560);
  await page.waitForTimeout(700);
  await snap("card-puzzle.png");
});

// 5. Butterfly network
await step("network", async () => { await page.goto(BASE + "/play/network"); await settle(2000); await snap("network.png"); });

// 7. Marketplace / interventions
await step("marketplace", async () => { await page.goto(BASE + "/play/marketplace"); await settle(1600); await snap("marketplace.png"); });

// 8. Map + dashboard
await step("map", async () => { await page.goto(BASE + "/play/map"); await settle(1600); await snap("map.png"); });
await step("dashboard", async () => { await page.goto(BASE + "/play/dashboard"); await settle(1600); await snap("dashboard.png"); });

// 6. Crisis prompt (force via persisted state)
await step("crisis", async () => {
  await page.evaluate(() => {
    const raw = localStorage.getItem("tomorrow-matrix-game");
    if (!raw) return;
    const obj = JSON.parse(raw);
    obj.state = obj.state || {};
    obj.state.pendingCrisisId = "coastal-flood";
    localStorage.setItem("tomorrow-matrix-game", JSON.stringify(obj));
  });
  await page.goto(BASE + "/play"); await settle(1700);
  await snap("crisis.png");
});

// 9. Multiplayer lobby
await step("multiplayer", async () => { await page.goto(BASE + "/lobby"); await settle(1700); await snap("multiplayer-lobby.png"); });

await browser.close();
console.log("\nCAPTURED:", done.join(", "));

// Convert the freshly captured PNGs to WebP (what the page imports) and drop the PNGs.
try {
  execSync(
    `python -c "` +
    `from PIL import Image; import glob, os; ` +
    `[ (lambda p: (Image.open(p).convert('RGB').save(p[:-4]+'.webp','WEBP',quality=82,method=6), os.remove(p)))(p) for p in glob.glob(os.path.join(r'${OUT}','*.png')) ]"`,
    { stdio: "inherit" },
  );
  console.log("Converted to .webp");
} catch (e) {
  console.log("WebP conversion skipped (needs python + Pillow):", e.message);
}
