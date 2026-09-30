// Visual QA for Merit 2.0: screenshots of routes at desktop and phone widths, light and dark.
// Usage: node scripts/shots.mjs <outDir> [--dark] [--mobile-only|--desktop-only] [--auth=<cookie>] [--full] /path /other ...
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const args = process.argv.slice(2);
const out = args.shift();
const flags = new Set(args.filter((a) => a.startsWith("--")));
const auth = [...flags].find((f) => f.startsWith("--auth="))?.slice(7);
const paths = args.filter((a) => !a.startsWith("--"));
const base = process.env.BASE_URL ?? "http://127.0.0.1:3200";
mkdirSync(out, { recursive: true });

const sizes = [
  !flags.has("--mobile-only") && { name: "desktop", width: 1280, height: 800 },
  !flags.has("--desktop-only") && { name: "mobile", width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
].filter(Boolean);

const browser = await chromium.launch();
const problems = [];
for (const size of sizes) {
  const ctx = await browser.newContext({ viewport: { width: size.width, height: size.height }, isMobile: size.isMobile, hasTouch: size.hasTouch, deviceScaleFactor: size.deviceScaleFactor ?? 1, colorScheme: flags.has("--dark") ? "dark" : "light" });
  await ctx.addInitScript(() => localStorage.setItem("merit:welcome-dismissed", "9999999999999"));
  if (auth) await ctx.addCookies([{ name: auth.split("=")[0], value: auth.split("=").slice(1).join("="), url: base }]);
  const page = await ctx.newPage();
  page.on("console", (m) => m.type() === "error" && problems.push(`[${size.name}] console: ${m.text().slice(0, 200)}`));
  page.on("pageerror", (e) => problems.push(`[${size.name}] pageerror: ${e.message.slice(0, 200)}`));
  for (const p of paths) {
    const res = await page.goto(base + p, { waitUntil: "networkidle" }).catch((e) => (problems.push(`${p}: ${e.message}`), null));
    await page.waitForTimeout(700);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 1) problems.push(`[${size.name}] ${p}: horizontal overflow ${overflow}px`);
    // Elements poking past the viewport edge (hidden by a clipping ancestor), ignoring intentional horizontal scrollers.
    const pokes = await page.evaluate(() => {
      const out = [];
      for (const el of document.querySelectorAll("main *")) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.right <= innerWidth + 2) continue;
        let a = el.parentElement, skip = false;
        while (a && a !== document.body) {
          const s = getComputedStyle(a);
          if (/(auto|scroll)/.test(s.overflowX) || s.position === "fixed" || a.getAttribute("aria-hidden") === "true") { skip = true; break; }
          a = a.parentElement;
        }
        if (!skip && el.getAttribute("aria-hidden") !== "true") out.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)} right=${Math.round(r.right)}`);
        if (out.length > 3) break;
      }
      return out;
    });
    for (const x of pokes) problems.push(`[${size.name}] ${p}: pokes out: ${x}`);
    const name = `${p.replace(/[/?=&]+/g, "_").replace(/^_|_$/g, "") || "home"}-${size.name}${flags.has("--dark") ? "-dark" : ""}.png`;
    await page.screenshot({ path: `${out}/${name}`, fullPage: flags.has("--full") });
    console.log(`${res?.status() ?? "ERR"} ${p} -> ${name}`);
  }
  await ctx.close();
}
await browser.close();
if (problems.length) console.log("PROBLEMS:\n" + problems.join("\n"));
