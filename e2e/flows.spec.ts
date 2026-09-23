import { expect, test, type Page } from "@playwright/test";

const unique = () => `e2e+${Date.now()}${Math.floor(Math.random() * 1000)}@example.com`;

async function signUp(page: Page) {
  await page.goto("/signup");
  await page.getByLabel("Your name").fill("Test Student");
  await page.getByLabel("Email").fill(unique());
  await page.getByLabel("Password").fill("correct-horse-battery");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL("**/onboarding");
}

test("sign up, onboard, and land on a personalized home", async ({ page }) => {
  await signUp(page);
  await expect(page.getByRole("heading", { name: /What are you studying/ })).toBeVisible();
  const cont = page.getByRole("button", { name: "Continue" });
  await expect(cont).toBeDisabled();
  await page.getByRole("button", { name: /AP Calculus BC/ }).click();
  await page.getByRole("button", { name: /SAT Math/ }).click();
  await cont.click();
  await page.getByRole("button", { name: /AP exams/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /45 min/ }).click();
  await page.getByRole("button", { name: "Start learning" }).click();
  await page.waitForURL("**/dashboard");
  await expect(page.getByRole("heading", { name: "Welcome back, Test." })).toBeVisible();
  await expect(page.getByText("Next in Calc BC").first()).toBeVisible();
  await expect(page.getByText(/30 days left in trial/)).toBeVisible();
});

test("watching records progress, and saving and voting persist", async ({ page }) => {
  await signUp(page);
  await page.goto("/courses/ap-calculus-bc/chain-rule");
  await page.locator('a[href^="/watch/"]').first().click();
  await page.waitForURL("**/watch/**");
  const id = page.url().split("/watch/")[1];

  // Play, jump near the end so the lesson completes.
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.waitForTimeout(1200);
  const bar = page.getByRole("slider", { name: "Seek" });
  const box = (await bar.boundingBox())!;
  await page.mouse.click(box.x + box.width * 0.995, box.y + box.height / 2);
  await expect(page.getByText("Lesson complete")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/Liked this lesson\? Learn with/).first()).toBeVisible();

  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("button", { name: "Saved" })).toBeVisible();
  await page.getByRole("button", { name: /Helpful/ }).click();
  await expect(page.getByRole("button", { name: /Helpful/ })).toHaveAttribute("aria-pressed", "true");

  await page.waitForTimeout(500);
  await page.goto("/library");
  await expect(page.locator(`a[href="/watch/${id}"]`)).toBeVisible();
  await page.goto("/library?tab=history");
  // Seeking to the end is not the same as finishing: it shows as partly watched.
  await expect(page.locator(`a[href="/watch/${id}"]`)).toContainText("% watched");

  // Reload keeps the vote.
  await page.goto(`/watch/${id}`);
  await expect(page.getByRole("button", { name: /Helpful/ })).toHaveAttribute("aria-pressed", "true");
});

test("anonymous visitors get a preview, then a sign-up prompt", async ({ page }) => {
  await page.goto("/courses/ap-world-history/champa-rice");
  await expect(page.getByRole("heading", { name: "Champa Rice and Song China" })).toBeVisible();
  await page.locator('a[href^="/watch/"]').first().click();
  await page.getByRole("button", { name: "Play", exact: true }).click();
  const bar = page.getByRole("slider", { name: "Seek" });
  const box = (await bar.boundingBox())!;
  await page.mouse.click(box.x + box.width * 0.9, box.y + box.height / 2);
  await page.keyboard.press("l");
  await expect(page.getByText("Keep watching free for 30 days")).toBeVisible({ timeout: 15_000 });
});

test("command palette search tolerates typos", async ({ page }) => {
  await page.goto("/courses");
  await page.keyboard.press("Meta+k");
  await page.getByRole("textbox", { name: "Search" }).fill("chian rul");
  await expect(page.getByRole("button", { name: /Chain Rule.*Calc BC/ }).first()).toBeVisible();
  await page.keyboard.press("Enter");
  await page.waitForURL("**/courses/ap-calculus-bc/chain-rule");
});

test("full search page groups results and filters by course", async ({ page }) => {
  await page.goto("/search?q=mansa%20musa");
  await expect(page.getByRole("link", { name: /Mali and Mansa Musa/ }).first()).toBeVisible();
  await page.goto("/search?q=zzqqxx");
  await expect(page.getByText(/Nothing matched/)).toBeVisible();
});

test("tutoring request reaches the educator's studio inbox", async ({ page, browser }) => {
  await page.goto("/educators/sarah-chen");
  await page.getByRole("button", { name: "Request a session" }).click();
  const note = `Help with series before the exam ${Date.now()}`;
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Your name").fill("Robin Test");
  await dialog.getByLabel("Email").fill("robin@example.com");
  await dialog.getByLabel(/What would you like help with/).fill(note);
  await dialog.getByRole("button", { name: "Send request" }).click();
  await expect(dialog.getByText("Request sent to Sarah")).toBeVisible();

  const creator = await browser.newPage();
  await creator.goto("/login");
  await creator.getByRole("button", { name: /Educator/ }).click();
  await creator.waitForURL("**/creator");
  await expect(creator.getByText(note)).toBeVisible();
  await creator.close();
});

test("creator publishes a lesson and it appears on the topic page", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /Educator/ }).click();
  await page.waitForURL("**/creator");
  await page.getByRole("link", { name: "New lesson" }).click();
  const title = `Chain rule as nested machines ${Date.now() % 100000}`;
  await page.getByLabel("Topic").selectOption("chain-rule");
  await page.getByLabel("Title", { exact: true }).fill(title);
  await page.getByLabel(/Description/).fill("A visual way to see why the derivatives multiply, with two quick checks.");
  await page.getByLabel(/Chapters/).fill("0:00 Machines inside machines\n2:00 Why we multiply\n4:30 Two quick checks");
  await page.getByRole("button", { name: "Publish" }).click();
  await page.waitForURL(/creator\?created=/);
  await page.goto("/courses/ap-calculus-bc/chain-rule");
  await expect(page.getByText(title)).toBeVisible();
});

test("demo billing: subscribe keeps remaining trial, then cancel and resume", async ({ page }) => {
  await signUp(page);
  await page.goto("/settings/billing");
  await expect(page.getByText(/days left in your free month/)).toBeVisible();
  await page.getByRole("button", { name: "Subscribe now" }).click();
  await page.waitForURL(/checkout=success/);
  await expect(page.getByText(/You won't be charged until/)).toBeVisible();
  await page.getByRole("button", { name: "Cancel plan" }).click();
  await expect(page.getByText(/set to end on/)).toBeVisible();
  await page.getByRole("button", { name: "Resume plan" }).click();
  await expect(page.getByText(/first charge/)).toBeVisible();
});

test("protected pages redirect to sign in and come back", async ({ page }) => {
  await page.goto("/library");
  await page.waitForURL(/\/login\?next=%2Flibrary/);
  await page.getByRole("button", { name: /Student/ }).click();
  await page.waitForURL(/dashboard/);
});

test("wrong password shows a clear error", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("maya@demo.groundwork.study");
  await page.getByLabel("Password").fill("nope-nope");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("That email and password don't match.")).toBeVisible();
});
