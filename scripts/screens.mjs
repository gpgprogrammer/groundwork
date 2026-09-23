// Visual QA: screenshots of key pages at desktop and mobile widths.
//   node scripts/screens.mjs [outDir] [baseUrl]
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const out = process.argv[2] ?? "screens";
const base = process.argv[3] ?? "http://127.0.0.1:3000";
mkdirSync(out, { recursive: true });

const anon = ["/", "/?chip=ap-world-history&sort=views", "/shorts", "/courses", "/courses/ap-calculus-bc", "/courses/ap-calculus-bc?view=videos", "/courses/ap-calculus-bc/chain-rule", "/courses/ap-world-history/champa-rice", "/search?q=chain%20rule", "/pricing", "/about", "/how-ranking-works", "/login", "/signup"];
const student = ["/", "/schedule", "/library?tab=history", "/settings", "/settings/billing"];

const browser = await chromium.launch();
const errors = [];

async function shoot(ctx, path, tag, full = false) {
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${tag} ${path}: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && errors.push(`${tag} ${path}: console ${m.text()}`));
  const res = await page.goto(base + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const name = `${tag}${path.replace(/[/?=&%]+/g, "_") || "_home"}.png`;
  await page.screenshot({ path: `${out}/${name}`, fullPage: full });
  console.log(res?.status(), tag, path);
  await page.close();
}

async function onboard(ctx) {
  const page = await ctx.newPage();
  await page.goto(base + "/signup");
  await page.getByLabel("Your name").fill("Maya Alvarez");
  await page.getByLabel("Email").fill(`maya+${Date.now()}@example.com`);
  await page.getByLabel("Password").fill("groundwork-demo");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL("**/onboarding");
  await page.getByRole("button", { name: /AP Calculus BC/ }).click();
  await page.getByRole("button", { name: /AP World/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /AP exams/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${out}/onboarding-schedule.png` });
  const day = (d) => new Date(Date.now() + d * 86400000).toISOString().slice(0, 10).replace(/-/g, "");
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0",
    "BEGIN:VEVENT", `DTSTART;VALUE=DATE:${day(2)}`, "UID:a", "SUMMARY:AP Calc BC quiz: Chain Rule and Implicit Differentiation", "END:VEVENT",
    "BEGIN:VEVENT", `DTSTART;VALUE=DATE:${day(5)}`, "UID:b", "SUMMARY:APWH DBQ: Champa rice and the Song dynasty", "END:VEVENT",
    "BEGIN:VEVENT", `DTSTART;VALUE=DATE:${day(9)}`, "UID:c", "SUMMARY:AP Calc Unit 4 test - Related rates & optimization", "END:VEVENT",
    "END:VCALENDAR"].join("\r\n");
  await page.getByRole("button", { name: "Upload .ics file" }).click();
  await page.locator("input[type=file]").setInputFiles({ name: "school.ics", mimeType: "text/calendar", buffer: Buffer.from(ics) });
  await page.getByRole("button", { name: "Import" }).click();
  await page.getByText(/Synced/).waitFor();
  await page.getByRole("button", { name: "Go to my feed" }).click();
  await page.waitForURL((u) => u.pathname === "/");
  await page.close();
}

for (const [tag, viewport] of [["d", { width: 1440, height: 900 }], ["m", { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport });
  for (const p of anon) await shoot(ctx, p, `${tag}-anon`);
  await ctx.close();
  const s = await browser.newContext({ viewport });
  await onboard(s);
  for (const p of student) await shoot(s, p, `${tag}-student`);
  await s.close();
}
await browser.close();
console.log(errors.length ? `\nErrors:\n${errors.join("\n")}` : "\nNo page errors.");
