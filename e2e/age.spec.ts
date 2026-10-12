import { expect, test } from "@playwright/test";
import { ageFrom } from "../src/lib/company";

const unique = () => `age-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`;

test.describe("signup age check (COPPA)", () => {
  test("ages are never overstated", () => {
    const now = new Date(2026, 9, 12); // October 12, 2026
    expect(ageFrom(10, 2013, now)).toBe(12); // birthday this month: could still be 12
    expect(ageFrom(9, 2013, now)).toBe(13);
    expect(ageFrom(12, 2013, now)).toBe(12);
  });

  test("students under 13 are turned away before an account exists", async ({ page }) => {
    const email = unique();
    await page.goto("/signup");
    await page.getByText("I'm a student").click();
    await page.getByLabel("Your name").fill("Young Student");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("correct-horse-battery");
    await page.getByLabel("Birth month").selectOption("1");
    await page.getByLabel("Birth year").selectOption(String(new Date().getFullYear() - 10));
    await expect(page.getByRole("alert")).toContainText("13 and older");
    await expect(page.getByRole("button", { name: "Create student account" })).toBeDisabled();

    // No account was created.
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("correct-horse-battery");
    await page.getByRole("button", { name: /Sign in/ }).click();
    await expect(page.getByText(/don't match/)).toBeVisible();
  });

  test("students 13 and older sign up and go on to onboarding", async ({ page }) => {
    await page.goto("/signup");
    await page.getByText("I'm a student").click();
    await page.getByLabel("Your name").fill("Teen Student");
    await page.getByLabel("Email").fill(unique());
    await page.getByLabel("Password").fill("correct-horse-battery");
    await page.getByLabel("Birth month").selectOption("1");
    await page.getByLabel("Birth year").selectOption(String(new Date().getFullYear() - 15));
    await page.getByRole("button", { name: "Create student account" }).click();
    await page.waitForURL("**/onboarding");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("What are you studying?");
  });
});
