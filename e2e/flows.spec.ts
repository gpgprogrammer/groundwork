import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

/** Stands in for an admin pressing Approve (the test account isn't an admin). */
async function approveAsAdmin(id: string) {
  const env = Object.fromEntries(
    readFileSync(".env.local", "utf8")
      .split("\n")
      .filter((l) => /^[A-Z_]+=/.test(l))
      .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^["']|["']$/g, "")]),
  );
  const h = { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, "Content-Type": "application/json" };
  const url = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/docs?collection=eq.contributions&id=eq.${id}`;
  const [row] = await (await fetch(`${url}&select=data`, { headers: h })).json();
  await fetch(url, { method: "PATCH", headers: h, body: JSON.stringify({ data: { ...row.data, status: "published" } }) });
}

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
  await page.getByText("I'm a student").click();
  await page.getByLabel("Your name").fill("Test Student");
  await page.getByLabel("Email").fill(unique());
  await page.getByLabel("Password").fill("correct-horse-battery");
  await page.getByRole("button", { name: "Create student account" }).click();
  await page.waitForURL("**/onboarding");
  await page.getByRole("button", { name: /AP Calculus BC/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /AP exams/ }).click();
  await page.getByRole("button", { name: "Start learning" }).click();
  await page.waitForURL((u) => u.pathname === "/home");
  if (opts.calendar) {
    await page.goto("/schedule");
    await page.getByRole("button", { name: "Upload .ics" }).click();
    await page.locator('input[type=file]').setInputFiles({ name: "school.ics", mimeType: "text/calendar", buffer: Buffer.from(ICS) });
    await page.getByRole("button", { name: "Import" }).click();
    await expect(page.getByText(/Added 1 test or assignment/)).toBeVisible();
    await page.goto("/home");
  }
}

test("anonymous home: chips, sorting, and real YouTube thumbnails", async ({ page }) => {
  await page.goto("/home");
  await expect(page.getByRole("link", { name: "Merit Learning home" }).first()).toBeVisible();
  await expect(page.getByText("The best AP and SAT lessons on YouTube")).toHaveCount(0);
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

test("calendar sync puts the quiz's videos on the home page", async ({ page }) => {
  await signUpAndOnboard(page, { calendar: true });
  await expect(page.getByRole("heading", { name: "Tonight's plan" })).toBeVisible();
  await expect(page.getByText(/AP Calc BC quiz: Chain Rule/).first()).toBeVisible();
  await page.goto("/schedule");
  await expect(page.getByText("AP Calc BC quiz: Chain Rule")).toBeVisible();
  await expect(page.getByRole("link", { name: "Chain Rule" }).first()).toBeVisible();
});

test("topic mastery updates course progress", async ({ page }) => {
  await signUpAndOnboard(page);
  await page.goto("/courses/ap-calculus-bc/chain-rule");
  await page.getByRole("button", { name: "I understand this" }).click();
  await expect(page.getByRole("button", { name: "Understood" })).toBeVisible();
  await page.waitForLoadState("networkidle");
  await page.goto("/courses/ap-calculus-bc");
  await expect(page.locator("p", { hasText: "topics understood" }).first()).toHaveText(/^1 \/ \d+ topics understood/);
});

test("search suggestions tolerate typos", async ({ page }) => {
  await page.goto("/home");
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
  await tutorPage.getByLabel("I agree to the Merit Partner Terms.").check();
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
  await expect(student.getByRole("heading", { name: /Merit tutors near Atlanta, GA/ })).toBeVisible();
  await student.locator(`a[href="${tutorUrl}"]`).first().click();
  await student.waitForURL(`**${tutorUrl}`);
  await student.getByText("Send a message instead").click();
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

test("pricing shows the three offers and a test-mode Sprint purchase unlocks the Sprint", async ({ page }) => {
  await page.goto("/pricing");
  await expect(page.getByRole("heading", { name: "Know what to study tonight." })).toBeVisible();
  await expect(page.getByText("$4.99").first()).toBeAttached();
  await expect(page.getByText("$14.99").first()).toBeVisible();
  await signUpAndOnboard(page);
  await page.goto("/sprint?course=ap-biology");
  await page.getByRole("button", { name: /Start the free diagnostic/ }).click();
  await page.waitForURL(/\/sprint\/spr_[^/]+\/diagnostic/);
  const sprintUrl = page.url().replace(/\/diagnostic$/, "");
  await expect(page.getByRole("heading", { name: /how do you feel about each unit/ })).toBeVisible();
  for (const group of await page.getByRole("radiogroup").all()) await group.getByRole("radio", { name: "Okay" }).click();
  await page.getByRole("button", { name: /Start the questions/ }).click();
  await page.goto(sprintUrl);
  await expect(page.getByText(/days to exam day/)).toBeVisible();
  await page.getByRole("button", { name: /Unlock for \$14.99/ }).click();
  await page.waitForURL(/checkout=success/);
  await expect(page.getByText(/Exam Sprint is ready/)).toBeVisible();
  await expect(page.getByRole("button", { name: /Unlock for/ })).toHaveCount(0);
  await page.goto("/settings/billing");
  await expect(page.getByText(/Your free month is active/)).toBeVisible();
});

test("a new account has Plus: tonight's plan, progress, and a reminders feed", async ({ page }) => {
  await signUpAndOnboard(page);
  await page.goto("/plan");
  await expect(page.getByRole("heading", { name: "Tonight" })).toBeVisible();
  const feed = await page.getByLabel("Private calendar link").inputValue();
  const res = await page.request.get(feed);
  expect(res.status()).toBe(200);
  expect(await res.text()).toContain("BEGIN:VCALENDAR");
  await page.goto("/progress");
  await expect(page.getByRole("heading", { name: "Your progress" })).toBeVisible();
});

test("signed-out visitors see a sample week on My schedule, then the offer", async ({ page }) => {
  await page.goto("/schedule");
  await expect(page.getByText("Sample week")).toBeVisible();
  await expect(page.getByText(/Calendar sync comes with Merit Plus or Exam Sprint/)).toBeVisible();
});

test("Merit AI answers with lessons (fallback mode without a model key)", async ({ page }) => {
  await page.goto("/ask");
  await page.getByLabel("Ask Merit AI").fill("chain rule");
  await page.keyboard.press("Enter");
  await expect(page.locator('main a[href^="/go/"]').first()).toBeVisible({ timeout: 30000 });
});

test("a teacher sets up a studio and publishes a study guide on a topic", async ({ page }) => {
  await signUpAndOnboard(page);
  await page.goto("/studio");
  await page.getByPlaceholder("AP Chemistry teacher, 12 years").fill("AP Calculus teacher, 10 years");
  await page.getByText(/only add accurate, school-appropriate material/).click();
  await page.getByRole("button", { name: "Save and open my studio" }).click();
  await page.waitForURL(/\/studio\?welcome=1/);
  await page.goto("/studio/guide");
  await page.getByLabel("Course").selectOption("ap-calculus-bc");
  await page.getByLabel("Topic").selectOption("ap-calculus-bc/chain-rule");
  await page.getByLabel("Title").fill("Chain rule in three steps");
  await page.locator('textarea[name="body"]').fill("### The idea\nDifferentiate the outside, keep the inside, then multiply by the derivative of the inside. Practice with sin(3x²) and e^(5x).");
  await page.getByRole("button", { name: "Publish guide" }).click();
  await page.waitForURL(/\/guides\/con_/);
  const guide = new URL(page.url()).pathname;
  await page.goto("/courses/ap-calculus-bc/chain-rule");
  await expect(page.locator(`a[href="${guide}"]`)).toBeVisible();
});

test("a student books a tutor's open hour; the tutor confirms and Merit's 10% fee is recorded", async ({ browser }) => {
  const tutor = await browser.newPage();
  await signUpAndOnboard(tutor);
  await tutor.goto("/tutors/join");
  await tutor.getByRole("textbox", { name: "Name", exact: true }).fill("Priya Raman");
  await tutor.getByLabel(/Headline/).fill("AP Physics tutor, former engineer");
  await tutor.getByLabel("About you").fill("I teach physics by drawing it first. Free-body diagrams, energy bar charts, and lots of practice problems.");
  await tutor.locator('label:has(input[value="ap-physics-1"])').click();
  await tutor.getByLabel(/Rate/).fill("60");
  await tutor.getByLabel("I agree to the Merit Partner Terms.").check();
  await tutor.getByRole("button", { name: "Publish my listing" }).click();
  await tutor.waitForURL(/\/tutors\/[^/]+\?saved=1/);
  const profile = new URL(tutor.url()).pathname;
  await tutor.goto("/tutor");
  // Default hours: Mondays 4 to 7pm.
  await tutor.getByRole("button", { name: "Save hours" }).click();
  await expect(tutor.getByText(/Saved. Students can book/)).toBeVisible();

  const student = await browser.newPage();
  await signUpAndOnboard(student);
  await student.goto(profile);
  await student.locator('button:has-text(":")').filter({ hasText: /AM|PM/ }).first().click();
  await student.getByPlaceholder(/What do you want to work on/).fill("Rotational motion before my test next week.");
  await student.getByRole("button", { name: /^Request/ }).click();
  await student.waitForURL(/\/bookings\/bk_/);
  await expect(student.getByText("Waiting for tutor")).toBeVisible();
  const booking = student.url().split("?")[0];

  await tutor.goto(booking);
  await expect(tutor.getByText(/Merit referral fee \(10%\): \$6/)).toBeVisible();
  await tutor.getByRole("button", { name: "Confirm" }).click();
  await expect(tutor.getByText("Confirmed")).toBeVisible();
  await tutor.getByRole("button", { name: "Mark completed" }).click();
  await expect(tutor.getByRole("button", { name: "Mark completed" })).toHaveCount(0);
  await tutor.goto("/tutor/payouts");
  await expect(tutor.getByRole("button", { name: "Pay $6" })).toBeVisible();
  await tutor.close();
  await student.close();
});

test("pasted assignments are reviewed before they're added, and a calendar test gets its own Sprint", async ({ page }) => {
  await signUpAndOnboard(page);
  await page.goto("/schedule");
  await page.getByRole("button", { name: "Paste text" }).click();
  const soon = new Date(Date.now() + 5 * 86400000);
  const md = `${soon.getMonth() + 1}/${soon.getDate()}`;
  await page.locator('textarea[name="text"]').fill(`${md}  AP Calc BC Unit 2 Test\n${md}  Soccer practice`);
  await page.getByRole("button", { name: "Find the dates" }).click();
  await expect(page.getByText("We found 2 dated items")).toBeVisible({ timeout: 15_000 });
  // Only the test is pre-checked.
  await expect(page.getByRole("button", { name: "Add 1 to my schedule" })).toBeVisible();
  await page.getByRole("button", { name: "Add 1 to my schedule" }).click();
  await expect(page.getByText("AP Calc BC Unit 2 Test").first()).toBeVisible();
  await expect(page.getByText("Soccer practice")).toHaveCount(0);
  await page.getByRole("link", { name: "Sprint for this test" }).first().click();
  await page.waitForURL(/\/sprint\/new\?event=/);
  await expect(page.locator('input[name="title"]')).toHaveValue("AP Calc BC Unit 2 Test");
  await page.getByLabel(/Unit 2/).first().check();
  await page.getByRole("button", { name: /Start the free diagnostic/ }).click();
  await page.waitForURL(/\/sprint\/spr_[^/]+\/diagnostic/);
});

test("calendar parsing drops canceled and removed occurrences and keeps only schoolwork", async ({ page }) => {
  await signUpAndOnboard(page);
  const d = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10).replace(/-/g, "");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT", "UID:quiz-weekly", `DTSTART;VALUE=DATE:${d(2)}`, "RRULE:FREQ=WEEKLY;COUNT=3", `EXDATE;VALUE=DATE:${d(9)}`, "SUMMARY:AP Bio Vocab Quiz", "END:VEVENT",
    "BEGIN:VEVENT", "UID:cancel", `DTSTART;VALUE=DATE:${d(3)}`, "STATUS:CANCELLED", "SUMMARY:AP Chem Test", "END:VEVENT",
    "BEGIN:VEVENT", "UID:class", `DTSTART;VALUE=DATE:${d(1)}`, "RRULE:FREQ=DAILY;COUNT=5", "SUMMARY:Period 3 English", "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  await page.goto("/schedule");
  await page.getByRole("button", { name: "Upload .ics" }).click();
  await page.locator('input[type=file]').setInputFiles({ name: "school.ics", mimeType: "text/calendar", buffer: Buffer.from(ics) });
  await page.getByRole("button", { name: "Import" }).click();
  await expect(page.getByText(/Added 2 tests and assignments/)).toBeVisible();
  await page.reload();
  await expect(page.getByText("AP Bio Vocab Quiz")).toHaveCount(2);
  await expect(page.getByText("AP Chem Test")).toHaveCount(0);
  await expect(page.getByText("Period 3 English")).toHaveCount(0);
});

test("a tutor uploads a video; it plays on Merit and shows on their profile", async ({ page }) => {
  test.setTimeout(120_000);
  await signUpAndOnboard(page);
  await page.goto("/tutors/join");
  await page.getByRole("textbox", { name: "Name", exact: true }).fill("Dana Okafor");
  await page.getByLabel(/Headline/).fill("AP Chemistry tutor");
  await page.getByLabel("About you").fill("I teach chemistry with worked examples and short practice sets for every unit.");
  await page.locator('label:has(input[value="ap-chemistry"])').click();
  await page.getByLabel(/Rate/).fill("50");
  await page.getByLabel("I agree to the Merit Partner Terms.").check();
  await page.getByRole("button", { name: "Publish my listing" }).click();
  await page.waitForURL(/\/tutors\/[^/]+\?saved=1/);
  const profile = new URL(page.url()).pathname;

  await page.goto("/studio/upload");
  // Record a short real video in the browser.
  const b64 = await page.evaluate(async () => {
    const c = document.createElement("canvas");
    c.width = 320;
    c.height = 180;
    const ctx = c.getContext("2d")!;
    const rec = new MediaRecorder(c.captureStream(15), { mimeType: "video/webm" });
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => chunks.push(e.data);
    rec.start();
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = `hsl(${i * 18} 70% 50%)`;
      ctx.fillRect(0, 0, 320, 180);
      await new Promise((r) => setTimeout(r, 60));
    }
    rec.stop();
    await new Promise((r) => (rec.onstop = r));
    const buf = new Uint8Array(await new Blob(chunks).arrayBuffer());
    let s = "";
    for (const x of buf) s += String.fromCharCode(x);
    return btoa(s);
  });
  await page.locator('input[type="file"]').setInputFiles({ name: "stoichiometry.webm", mimeType: "video/webm", buffer: Buffer.from(b64, "base64") });
  await page.getByRole("textbox", { name: "Title" }).fill("Stoichiometry in five steps");
  await page.getByRole("combobox", { name: "Course" }).selectOption("ap-chemistry");
  const topic = page.getByRole("combobox", { name: "Topic" });
  await topic.selectOption({ index: 1 });
  await page.locator("#rights").check();
  await page.getByRole("button", { name: "Publish video" }).click();
  await page.waitForURL(/\/videos\/up_[\w-]+\?submitted=1/, { timeout: 60_000 });
  const videoId = new URL(page.url()).pathname.split("/").pop()!;
  await expect(page.getByRole("heading", { name: "Stoichiometry in five steps" })).toBeVisible();
  await expect(page.locator("video")).toHaveAttribute("src", /merit-videos/);
  await expect(page.getByText("Waiting for review.")).toBeVisible();

  // Nobody else can see it until an admin approves it.
  const visitor = await page.context().browser()!.newPage();
  await visitor.goto(`/videos/${videoId}`);
  await expect(visitor.getByText("couldn't find that page")).toBeVisible();
  await visitor.goto("/videos");
  await expect(visitor.getByText("Stoichiometry in five steps")).toHaveCount(0);
  await approveAsAdmin(videoId);
  await visitor.goto(`/videos/${videoId}`);
  await expect(visitor.getByRole("heading", { name: "Stoichiometry in five steps" })).toBeVisible();
  // Viewers can report a video.
  await visitor.getByRole("button", { name: "Report" }).click();
  await visitor.getByLabel("Wrong or misleading").check();
  await visitor.getByRole("button", { name: "Send report" }).click();
  await expect(visitor.getByText("Thanks for letting us know")).toBeVisible();
  await visitor.close();

  await page.goto(profile);
  await expect(page.getByRole("heading", { name: /Videos/ })).toBeVisible();
  await expect(page.getByText("Stoichiometry in five steps")).toBeVisible();
  await page.goto("/videos");
  await expect(page.getByText("Stoichiometry in five steps").first()).toBeVisible();
  await page.goto("/search?q=stoichiometry&course=ap-chemistry&type=merit");
  await expect(page.getByText("Stoichiometry in five steps").first()).toBeVisible();

  // Clean up the stored file.
  await page.goto(page.url().replace(/\/search.*/, "/videos"));
  await page.getByText("Stoichiometry in five steps").first().click();
  await page.getByRole("button", { name: "Delete video" }).click();
  await page.waitForURL(/\/studio\/upload/);
});

test("signup skips calendar setup; the sync popup appears 5 minutes later, can be closed after 5 seconds, and stays closed", async ({ page }) => {
  await page.clock.install();
  await signUpAndOnboard(page);
  const popup = page.getByRole("dialog", { name: "Sync your schedule" });
  await expect(popup).toHaveCount(0);
  await page.clock.fastForward("05:05");
  await expect(popup).toBeVisible();
  await expect(popup.getByText(/Included with Merit Plus or Exam Sprint/)).toBeVisible();
  // The X appears only after 5 seconds; until then Escape and clicking outside don't close it.
  await expect(popup.getByRole("button", { name: "Close" })).toHaveCount(0);
  await expect(popup.getByRole("timer")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.mouse.click(10, 10);
  await expect(popup).toBeVisible();
  await page.clock.runFor(5000);
  await popup.getByRole("button", { name: "Close" }).click();
  await expect(popup).toHaveCount(0);
  await page.reload();
  await page.clock.fastForward("01:00");
  await expect(page.getByRole("heading", { name: /./ }).first()).toBeAttached();
  await expect(popup).toHaveCount(0);
});

test.describe("first visit", () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test("signed-out visitors are invited to create an account; the X closes it", async ({ page }) => {
    await page.goto("/courses");
    const welcome = page.getByRole("dialog", { name: "Welcome to Merit" });
    await expect(welcome).toBeVisible();
    await expect(welcome.getByRole("link", { name: /I'm a student/ })).toHaveAttribute("href", /\/signup\?as=student&next=%2Fcourses/);
    await welcome.getByRole("button", { name: "Close" }).click();
    await expect(welcome).toHaveCount(0);
    await page.reload();
    await page.waitForTimeout(1500);
    await expect(welcome).toHaveCount(0);
  });
});

test("a teacher account skips student setup and lands in the teacher studio", async ({ page }) => {
  await page.goto("/signup?as=teacher");
  await expect(page.getByRole("radio", { name: /teacher or tutor/ })).toBeChecked();
  await page.getByLabel("Your name").fill("Test Teacher");
  await page.getByLabel("Email").fill(unique());
  await page.getByLabel("Password").fill("correct-horse-battery");
  await page.getByRole("button", { name: "Create teacher account" }).click();
  await page.waitForURL(/\/studio\?welcome=teacher/);
  await expect(page.getByText("Your teacher account is ready")).toBeVisible();
  await expect(page.getByRole("link", { name: "Create a tutor listing" })).toBeVisible();
  // The home page doesn't send teachers to student onboarding.
  await page.goto("/home");
  expect(new URL(page.url()).pathname).toBe("/home");
});

test("sign-up requires choosing student or teacher", async ({ page }) => {
  await page.goto("/signup");
  await expect(page.getByRole("button", { name: "Choose an account type" })).toBeDisabled();
  await page.getByText("I'm a student").click();
  await expect(page.getByRole("button", { name: "Create student account" })).toBeEnabled();
});

test("forgot password: request a link, then set a new password from the reset page", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("link", { name: "Forgot password?" }).click();
  await page.waitForURL("**/forgot-password");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Email").fill("nobody-here@example.com");
  await page.getByRole("button", { name: "Email me a reset link" }).click();
  await expect(page.getByText(/If there's a Merit account for nobody-here@example.com/)).toBeVisible();
  // The emailed link signs you in and lands here; a signed-in user can set a new password.
  await signUpAndOnboard(page);
  await page.goto("/reset-password");
  await page.getByLabel("New password").fill("a-brand-new-password");
  await page.getByLabel("Type it again").fill("a-brand-new-password");
  await page.getByRole("button", { name: "Save new password" }).click();
  await expect(page.getByText("Your password is updated.")).toBeVisible();
});

test("the link preview image renders", async ({ request }) => {
  const res = await request.get("/opengraph-image");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("image/png");
});

test.describe("landing page", () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test("signed-out visitors land on the landing page; its paths lead to sign-up and lessons", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Know what to study");
    // No welcome popup here: the landing page is the invitation.
    await page.waitForTimeout(1200);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("main").getByText("Tonight's plan")).toBeVisible();
    await expect(page.getByRole("link", { name: /AP Business with Personal Finance|AP Calculus BC/ }).first()).toBeVisible();
    await expect(page.locator('img[src*="ytimg.com"]').first()).toBeVisible();
    await page.getByRole("link", { name: /Create a teacher account/ }).click();
    await page.waitForURL(/\/signup\?as=teacher/);
    await expect(page.getByRole("radio", { name: /teacher or tutor/ })).toBeChecked();
    await page.goto("/");
    await page.getByRole("link", { name: "Browse lessons" }).click();
    await page.waitForURL("**/home");
  });
});

test("signed-in visitors skip the landing page", async ({ page }) => {
  await signUpAndOnboard(page);
  await page.goto("/");
  await page.waitForURL("**/home");
});
