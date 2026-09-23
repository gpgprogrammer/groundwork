import { expect, test, type Page } from "@playwright/test";

const unique = () => `e2e+${Date.now()}${Math.floor(Math.random() * 1000)}@example.com`;

const ICS = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "BEGIN:VEVENT",
  `DTSTART;VALUE=DATE:${new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10).replace(/-/g, "")}`,
  "UID:e2e-quiz",
  "SUMMARY:AP Calc BC quiz: Chain Rule",
  "END:VEVENT",
  "END:VCALENDAR",
].join("\r\n");

async function signUpAndOnboard(page: Page, opts: { calendar?: boolean } = {}) {
  await page.goto("/signup");
  await page.getByLabel("Your name").fill("Test Student");
  await page.getByLabel("Email").fill(unique());
  await page.getByLabel("Password").fill("correct-horse-battery");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL("**/onboarding");
  await page.getByRole("button", { name: /AP Calculus BC/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /AP exams/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Sync your schedule" })).toBeVisible();
  if (opts.calendar) {
    await page.getByRole("button", { name: "Upload .ics file" }).click();
    await page.locator('input[type=file]').setInputFiles({ name: "school.ics", mimeType: "text/calendar", buffer: Buffer.from(ICS) });
    await page.getByRole("button", { name: "Import" }).click();
    await expect(page.getByText(/Synced\. Found 1 school events/)).toBeVisible();
    await page.getByRole("button", { name: "Go to my feed" }).click();
  } else {
    await page.getByRole("button", { name: "Skip", exact: true }).click();
  }
  await page.waitForURL((u) => u.pathname === "/");
}

test("anonymous home: chips, sorting, and real YouTube thumbnails", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /best AP and SAT lessons on YouTube/ })).toBeVisible();
  const firstThumb = page.locator('main img[src*="ytimg.com"]').first();
  await expect(firstThumb).toBeVisible();
  await page.getByRole("tab", { name: "AP World History: Modern" }).click();
  await page.waitForURL(/chip=ap-world-history/);
  await page.getByRole("button", { name: /Sort by/ }).click();
  await page.getByRole("button", { name: "Most viewed" }).click();
  await page.waitForURL(/sort=views/);
  const views = await page.locator("main p.tabular").evaluateAll((els) =>
    els.slice(0, 6).map((e) => {
      const m = e.textContent!.match(/([\d.]+)([KMB]?) views/);
      if (!m) return 0;
      return Number(m[1]) * ({ K: 1e3, M: 1e6, B: 1e9 } as Record<string, number>)[m[2]] || Number(m[1]);
    }),
  );
  for (let i = 1; i < views.length; i++) expect(views[i - 1]).toBeGreaterThanOrEqual(views[i]);
});

test("clicking a video goes to YouTube and lands in history", async ({ page, context }) => {
  await signUpAndOnboard(page);
  await page.goto("/courses/ap-calculus-bc/chain-rule");
  const link = page.locator('main a[href^="/go/"]').first();
  const href = await link.getAttribute("href");
  const id = href!.split("/go/")[1];
  const res = await page.request.get(href!, { maxRedirects: 0 });
  expect(res.status()).toBe(302);
  expect(res.headers().location).toMatch(new RegExp(`youtube\\.com/(watch\\?v=|shorts/)${id}`));
  await page.goto("/library?tab=history");
  await expect(page.locator(`a[href="/go/${id}"]`).first()).toBeVisible();
  void context;
});

test("save to Watch later from the card menu", async ({ page }) => {
  await signUpAndOnboard(page);
  await page.goto("/courses/ap-calculus-bc/chain-rule");
  const row = page.locator("main .group").first();
  const href = await row.locator('a[href^="/go/"]').first().getAttribute("href");
  await row.hover();
  await row.getByRole("button", { name: "More actions" }).click();
  await page.getByRole("button", { name: "Save to Watch later" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Saved to Watch later" })).toBeVisible();
  await page.goto("/library?tab=saved");
  await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible();
});

test("calendar sync in onboarding puts the quiz's videos on the home page", async ({ page }) => {
  await signUpAndOnboard(page, { calendar: true });
  await expect(page.getByRole("heading", { name: "Coming up on your calendar" })).toBeVisible();
  await expect(page.getByText(/Before your AP Calc BC quiz: Chain Rule/).first()).toBeVisible();
  await page.goto("/schedule");
  await expect(page.getByText("AP Calc BC quiz: Chain Rule")).toBeVisible();
  await expect(page.getByRole("link", { name: "Chain Rule" }).first()).toBeVisible();
});

test("topic mastery updates course progress", async ({ page }) => {
  await signUpAndOnboard(page);
  await page.goto("/courses/ap-calculus-bc/chain-rule");
  await page.getByRole("button", { name: "I understand this" }).click();
  await expect(page.getByRole("button", { name: "Understood" })).toBeVisible();
  await page.goto("/courses/ap-calculus-bc");
  await expect(page.getByText(/1\/\d+ topics/)).toBeVisible();
});

test("search suggestions tolerate typos", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("combobox", { name: "Search" }).fill("chian rule");
  await expect(page.getByRole("option").filter({ hasText: "Chain Rule" }).first()).toBeVisible();
  await page.keyboard.press("Enter");
  await page.waitForURL(/\/search\?q=chian/);
  await expect(page.getByText(/Topic · Calc BC/).first()).toBeVisible();
});

test("protected pages redirect to sign in", async ({ page }) => {
  await page.goto("/library");
  await page.waitForURL(/\/login\?next=%2Flibrary/);
});

test("wrong password shows a clear error", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("nobody@example.com");
  await page.getByLabel("Password").fill("nope-nope-nope");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("That email and password don't match.")).toBeVisible();
});
