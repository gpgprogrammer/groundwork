// Visual QA: screenshots of key pages at desktop and mobile widths.
//   node scripts/screens.mjs [outDir] [baseUrl]
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const out = process.argv[2] ?? "screens";
const base = process.argv[3] ?? "http://localhost:3000";
mkdirSync(out, { recursive: true });

const anon = ["/", "/courses", "/courses/ap-calculus-bc", "/courses/ap-calculus-bc/chain-rule", "/courses/ap-world-history/champa-rice", "/educators", "/educators/sarah-chen", "/search?q=chain%20rule", "/pricing", "/how-ranking-works", "/login", "/signup", "/creator/join", "/nope"];
const student = ["/dashboard", "/library", "/library?tab=history", "/settings", "/settings/billing"];
const creator = ["/creator", "/creator/new", "/creator/profile"];

const browser = await chromium.launch();
const errors = [];

async function shoot(ctx, path, tag) {
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${tag} ${path}: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && errors.push(`${tag} ${path}: console ${m.text()}`));
  const res = await page.goto(base + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const name = `${tag}${path.replace(/[/?=&%]+/g, "_") || "_home"}.png`;
  await page.screenshot({ path: `${out}/${name}`, fullPage: true });
  console.log(res?.status(), tag, path);
  await page.close();
}

async function login(ctx, who) {
  const page = await ctx.newPage();
  await page.goto(base + "/login");
  await page.getByRole("button", { name: who === "creator" ? /Educator/ : /Student/ }).click();
  await page.waitForURL(/dashboard|creator/);
  await page.close();
}

for (const [tag, viewport] of [["d", { width: 1440, height: 900 }], ["m", { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  for (const p of anon) await shoot(ctx, p, `${tag}-anon`);
  await ctx.close();

  const s = await browser.newContext({ viewport });
  await login(s, "student");
  for (const p of student) await shoot(s, p, `${tag}-student`);
  const vid = await (async () => {
    const pg = await s.newPage();
    await pg.goto(base + "/courses/ap-calculus-bc/chain-rule");
    const href = await pg.locator('a[href^="/watch/"]').first().getAttribute("href");
    await pg.close();
    return href;
  })();
  await shoot(s, vid, `${tag}-student`);
  await s.close();

  const c = await browser.newContext({ viewport });
  await login(c, "creator");
  for (const p of creator) await shoot(c, p, `${tag}-creator`);
  await c.close();
}

await browser.close();
console.log(errors.length ? `\nErrors:\n${errors.join("\n")}` : "\nNo page errors.");
