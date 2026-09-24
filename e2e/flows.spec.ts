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
  await expect(page.getByRole("heading", { name: /Every AP course\. The best lessons\. The best tutors\. Free\./ })).toBeVisible();
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
  await expect(page.locator("p", { hasText: "topics understood" }).first()).toHaveText(/^1 \/ \d+ topics understood/);
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

test("tutor lists themselves, a student finds them, requests a session, and reviews them", async ({ browser }) => {
  const tutorPage = await browser.newPage();
  await signUpAndOnboard(tutorPage);
  await tutorPage.goto("/tutors/join");
  await tutorPage.getByRole("textbox", { name: "Name", exact: true }).fill("Dana Whitfield");
  await tutorPage.getByLabel(/Headline/).fill("AP Chemistry teacher, 9 years in the classroom");
  await tutorPage.getByLabel("About you").fill("I break chemistry down into the few ideas that explain everything else. Equilibrium and kinetics are my specialty.");
  await tutorPage.locator('label:has(input[value="ap-chemistry"])').click();
  await tutorPage.getByLabel("In person").check();
  await tutorPage.getByRole("textbox", { name: "City" }).fill("Atlanta");
  await tutorPage.getByLabel("State / region").fill("GA");
  await tutorPage.getByLabel(/Rate/).fill("55");
  await tutorPage.getByRole("button", { name: "Publish my listing" }).click();
  await tutorPage.waitForURL(/\/tutors\/[^/]+\?saved=1/);
  const tutorUrl = new URL(tutorPage.url()).pathname;

  const student = await browser.newPage();
  await signUpAndOnboard(student);
  await student.goto("/tutors?course=ap-chemistry");
  await student.getByLabel("City").fill("Atlanta");
  await student.getByLabel("State or region").fill("GA");
  await student.getByLabel("ZIP code").fill("30305");
  await student.getByRole("button", { name: "Set", exact: true }).click();
  await expect(student.getByRole("heading", { name: /Top tutors near Atlanta, GA/ })).toBeVisible();
  await student.locator(`a[href="${tutorUrl}"]`).first().click();
  await student.waitForURL(`**${tutorUrl}`);
  await student.getByLabel("What do you need help with?").fill("Equilibrium and ICE tables before my unit test.");
  await student.getByRole("button", { name: "Request a session" }).click();
  await expect(student.getByText("Request sent to Dana")).toBeVisible();
  await student.getByRole("radio", { name: "5 stars" }).click();
  await student.getByRole("button", { name: "Post review" }).click();
  await expect(student.getByText("(1)").first()).toBeVisible();

  await tutorPage.goto("/tutor");
  await expect(tutorPage.getByText("Equilibrium and ICE tables before my unit test.")).toBeVisible();
  await tutorPage.close();
  await student.close();
});

test("tutoring service links redirect with the course and ZIP, and count the referral", async ({ page }) => {
  const res = await page.request.get("/r/wyzant?course=ap-chemistry&zip=30305", { maxRedirects: 0 });
  expect(res.status()).toBe(302);
  expect(res.headers().location).toBe("https://www.wyzant.com/match/search?kw=AP%20Chemistry&z=30305");
  const vt = await page.request.get("/r/varsity-tutors?course=ap-psychology", { maxRedirects: 0 });
  expect(vt.headers().location).toBe("https://www.varsitytutors.com/ap-psychology-tutoring");
});

test("courses page lists every AP course, grouped and searchable", async ({ page }) => {
  await page.goto("/courses");
  for (const name of ["AP Calculus AB", "AP Psychology", "AP Japanese Language and Culture", "AP Research", "AP Physics C: Mechanics"]) {
    await expect(page.getByRole("link", { name: new RegExp(name.replace(/[:()]/g, ".")) }).first()).toBeVisible();
  }
  await page.getByLabel("Find a course").fill("psych");
  await expect(page.locator("main").getByRole("link", { name: /AP Psychology/ })).toBeVisible();
  await expect(page.locator("main").getByRole("link", { name: /AP Biology/ })).toHaveCount(0);
});
