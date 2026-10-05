import { expect, test, type Page } from "@playwright/test";
import { greetingName } from "../src/lib/names";

test("greeting names keep titles with the surname", () => {
  expect(greetingName("Maya Alvarez")).toBe("Maya");
  expect(greetingName("Ms. Rivera")).toBe("Ms. Rivera");
  expect(greetingName("Dr Ada Okafor")).toBe("Dr Okafor");
  expect(greetingName("Coach  Lee")).toBe("Coach Lee");
  expect(greetingName("Ms.")).toBe("Ms.");
  expect(greetingName("  ")).toBe("");
});

const unique = () => `e2e+teacher${Date.now()}${Math.floor(Math.random() * 1000)}@example.com`;

async function signUpTeacher(page: Page, name = "Ms. Rivera") {
  await page.goto("/");
  await page.getByRole("link", { name: "Create a teacher account" }).click();
  await page.waitForURL(/\/signup\?as=teacher/);
  await expect(page.getByText(/You'll set up your teacher profile next/)).toBeVisible();
  await page.getByLabel("Your name").fill(name);
  await page.getByLabel("Email").fill(unique());
  await page.getByLabel("Password").fill("correct-horse-battery");
  await page.getByRole("button", { name: "Create teacher account" }).click();
  await page.waitForURL(/\/studio\?welcome=teacher/);
}

test("teacher sign-up: studio first, a teacher home, and no student onboarding", async ({ page }) => {
  await signUpTeacher(page);
  await expect(page.getByText("Welcome to Merit! Your teacher account is ready.")).toBeVisible();

  await page.goto("/");
  await expect(page.getByText("Welcome, Ms. Rivera")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Let's set up your teacher profile." })).toBeVisible();
  await expect(page.getByText("2 steps left")).toBeVisible();

  // The student course picker isn't for teachers.
  await page.goto("/onboarding");
  await page.waitForURL(/\/studio$/);

  // Uploading without a profile points to the teacher profile first.
  await page.goto("/studio/upload");
  await expect(page.getByRole("link", { name: "Set up my teacher profile" })).toBeVisible();
});

test("teacher profile: a missed course doesn't wipe the form, then saving opens the studio", async ({ page }) => {
  await signUpTeacher(page, "Dr. Okafor");
  await page.getByLabel("Headline").fill("AP Chemistry teacher, 12 years");
  await page.locator('textarea[name="bio"]').fill("Stoichiometry, step by step.");
  await page.locator('input[name="pledge"]').check();
  await page.getByRole("button", { name: "Save and open my studio" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Pick at least one course you teach." })).toBeVisible();
  await expect(page.getByLabel("Headline")).toHaveValue("AP Chemistry teacher, 12 years");
  await expect(page.locator('textarea[name="bio"]')).toHaveValue("Stoichiometry, step by step.");
  await expect(page.locator('input[name="pledge"]')).toBeChecked();

  await page.locator('label:has(input[name="courseIds"][value="ap-chemistry"])').click();
  await expect(page.getByRole("alert").filter({ hasText: "Pick at least one course" })).toHaveCount(0);
  await page.getByRole("button", { name: "Save and open my studio" }).click();
  await expect(page.getByText("Your studio is ready. Add your first lesson below.")).toBeVisible();

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Your teacher studio" })).toBeVisible();
  await expect(page.getByText("1 step left")).toBeVisible();
});
