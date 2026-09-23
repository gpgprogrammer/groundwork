import { chromium } from "@playwright/test";
const [,, out, path, who, width = "1440", height = "900", count = "3"] = process.argv;
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: +width, height: +height } });
if (who && who !== "anon") {
  const p = await ctx.newPage();
  await p.goto("http://localhost:3000/login");
  await p.getByRole("button", { name: who === "creator" ? /Educator/ : /Student/ }).click();
  await p.waitForURL(/dashboard|creator/);
}
const page = await ctx.newPage();
await page.goto("http://localhost:3000" + path, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
for (let i = 0; i < +count; i++) {
  await page.evaluate((y) => window.scrollTo(0, y), i * +height);
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${out}-${i}.png` });
}
await b.close();
