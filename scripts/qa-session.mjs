// Creates a local test student (local file store only), onboards them, adds a calendar, and prints the session cookie.
// Usage: node scripts/qa-session.mjs [teacher]
import { chromium } from "@playwright/test";

const base = process.env.BASE_URL ?? "http://127.0.0.1:3200";
const teacher = process.argv[2] === "teacher";
const day = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10).replace(/-/g, "");
const ics = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  ...[
    [2, "qa-1", "AP Calc BC quiz: Chain Rule"],
    [5, "qa-2", "AP Bio Unit 3 Test: Cellular Energetics"],
    [9, "qa-3", "AP Calc BC Unit 2 Test"],
  ].flatMap(([d, uid, s]) => ["BEGIN:VEVENT", `DTSTART;VALUE=DATE:${day(d)}`, `UID:${uid}`, `SUMMARY:${s}`, "END:VEVENT"]),
  "END:VCALENDAR",
].join("\r\n");

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`${base}/signup${teacher ? "?as=teacher" : ""}`);
if (!teacher) await page.getByText("I'm a student").click();
await page.getByLabel("Your name").fill(teacher ? "Rosa Vega" : "Jordan Park");
await page.getByLabel("Email").fill(`qa+${Date.now()}@example.com`);
await page.getByLabel("Password").fill("correct-horse-battery");
await page.getByRole("button", { name: teacher ? "Create teacher account" : "Create student account" }).click();
if (!teacher) {
  await page.waitForURL("**/onboarding");
  await page.getByRole("button", { name: /AP Calculus BC/ }).click();
  await page.getByRole("button", { name: /AP Biology/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /AP exams/ }).click();
  await page.getByRole("button", { name: "Start learning" }).click();
  await page.waitForURL((u) => u.pathname === "/");
  await page.goto(`${base}/schedule`);
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Choose a calendar file").setInputFiles({ name: "school.ics", mimeType: "text/calendar", buffer: Buffer.from(ics) });
  await page.getByText(/Added \d+ tests?/).waitFor();
} else {
  await page.waitForURL(/\/studio/);
}
const cookie = (await page.context().cookies()).find((c) => c.name === "gw_session");
console.log(`${cookie.name}=${cookie.value}`);
await browser.close();
