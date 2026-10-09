import { expect, test, type Page } from "@playwright/test";
import { PAID_PLANS } from "../src/lib/billing/plans";
import { plusAccess, hasPlus } from "../src/lib/billing/trial";
import type { Billing, Profile } from "../src/lib/types";

// While paid plans are off, every Plus and Exam Sprint feature is free and nothing is for sale.
test.skip(PAID_PLANS, "paid plans are on");

const unique = () => `free-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`;

async function signUp(page: Page) {
  await page.goto("/signup");
  await page.getByText("I'm a student").click();
  await page.getByLabel("Your name").fill("Free Student");
  await page.getByLabel("Email").fill(unique());
  await page.getByLabel("Password").fill("correct-horse-battery");
  await page.getByRole("button", { name: "Create student account" }).click();
  await page.waitForURL("**/onboarding");
  await page.getByRole("button", { name: /AP Calculus BC/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /AP exams/ }).click();
  await page.getByRole("button", { name: "Start learning" }).click();
  await page.waitForURL((u) => u.pathname === "/");
}

test.describe("everything free", () => {
  test("every signed-in student has Plus; visitors still need an account", () => {
    const fresh = plusAccess({ createdAt: new Date().toISOString() } as Profile, null);
    expect(fresh.kind).toBe("included");
    expect(hasPlus(fresh)).toBe(true);
    const lapsed = plusAccess({ createdAt: "2020-01-01T00:00:00Z" } as Profile, { plusTrialEndsAt: "2020-02-01T00:00:00Z" } as Billing);
    expect(hasPlus(lapsed)).toBe(true);
    expect(plusAccess(null, null).kind).toBe("anonymous");
  });

  test("pricing says it's free and sells nothing", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByRole("heading", { level: 1, name: "Everything on Merit is free." })).toBeVisible();
    await expect(page.getByText(/\$4\.99|\$39\.99|\$14\.99/)).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Find a tutor" }).first()).toBeVisible();
    await page.goto("/sprint");
    await expect(page.getByText(/\$14\.99|7 days free/)).toHaveCount(0);
  });

  test("a new student gets the learning plan, calendar, and full Sprint with no trial", async ({ page }) => {
    await signUp(page);
    await page.goto("/plan");
    await page.getByRole("heading", { level: 1 }).first().waitFor();
    await expect(page.getByText(/free trial|Merit Plus|Unlock/)).toHaveCount(0);
    await page.goto("/schedule");
    await expect(page.getByText(/Plus or Exam Sprint|Unlock/)).toHaveCount(0);
    await page.goto("/settings/billing");
    await expect(page.getByRole("heading", { name: "Everything on Merit is free" })).toBeVisible();

    // A Sprint is fully open: no unlock button and no price.
    await page.goto("/sprint?course=ap-calculus-bc");
    await page.getByRole("button", { name: "Start the free diagnostic" }).click();
    await page.waitForURL(/\/sprint\/[^/?]+/);
    await expect(page.getByText(/Unlock|\$14\.99|free trial/)).toHaveCount(0);
  });

  test("checkout can't be reached", async ({ request }) => {
    const res = await request.post("/api/billing/checkout", { form: { product: "plus-month", returnTo: "/plan" }, maxRedirects: 0 });
    expect(res.status()).toBe(303);
    expect(res.headers().location).toMatch(/\/plan$/);
  });
});
