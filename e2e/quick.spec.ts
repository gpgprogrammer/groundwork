import { expect, test, type Page } from "@playwright/test";
import { CHECK_SIZE, gradeCheck, gradeSelfCheck, pickCheck, sessionMinutes } from "../src/lib/quick";
import type { Question } from "../src/lib/types";

const q = (id: string, answer = 0): Question => ({ id, topicId: "t", stem: id, choices: ["a", "b", "c", "d"], answer, explanations: ["", "", "", ""], difficulty: "easy" });
const bank = Array.from({ length: 10 }, (_, k) => q(`q${k}`, k % 4));

test.describe("quick session rules", () => {
  test("a check is four questions, and retries move along the bank", () => {
    expect(pickCheck(bank, 0).map((x) => x.id)).toEqual(["q0", "q1", "q2", "q3"]);
    expect(pickCheck(bank, 1).map((x) => x.id)).toEqual(["q4", "q5", "q6", "q7"]);
    expect(pickCheck(bank, 2).map((x) => x.id)).toEqual(["q8", "q9", "q0", "q1"]);
    expect(pickCheck(bank.slice(0, 3), 5)).toHaveLength(3);
    expect(CHECK_SIZE).toBe(4);
  });

  test("passing takes 3 of 4, graded against the bank", () => {
    const right = (id: string) => ({ questionId: id, choice: bank.find((x) => x.id === id)!.answer });
    const wrong = (id: string) => ({ questionId: id, choice: (bank.find((x) => x.id === id)!.answer + 1) % 4 });
    expect(gradeCheck(bank, [right("q0"), right("q1"), right("q2"), wrong("q3")])).toEqual({ correct: 3, total: 4, passed: true });
    expect(gradeCheck(bank, [right("q0"), right("q1"), wrong("q2"), wrong("q3")])).toEqual({ correct: 2, total: 4, passed: false });
    // Unknown and repeated questions don't count.
    expect(gradeCheck(bank, [right("q0"), right("q0"), right("q0"), { questionId: "nope", choice: 0 }]).passed).toBe(false);
    expect(gradeCheck(bank, []).passed).toBe(false);
  });

  test("the self-check needs every key idea", () => {
    expect(gradeSelfCheck(3, [true, true, true]).passed).toBe(true);
    expect(gradeSelfCheck(3, [true, false, true]).passed).toBe(false);
    expect(gradeSelfCheck(3, [true, true]).passed).toBe(false);
    expect(gradeSelfCheck(0, []).passed).toBe(false);
  });

  test("session length is the lesson plus five minutes", () => {
    expect(sessionMinutes(600)).toBe(15);
    expect(sessionMinutes(undefined)).toBe(5);
  });
});

const unique = () => `e2e+${Date.now()}${Math.floor(Math.random() * 1000)}@example.com`;

async function signUpAndOnboard(page: Page) {
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
  await page.waitForURL((u) => u.pathname === "/");
}

async function selfCheck(page: Page, answers: boolean[]) {
  const groups = page.getByRole("radiogroup");
  await expect(groups).toHaveCount(answers.length);
  for (const [k, yes] of answers.entries()) await groups.nth(k).getByRole("radio", { name: yes ? "I can explain it" : "Not yet" }).click();
  await page.getByRole("button", { name: "Finish" }).click();
}

test("quick session: learn, watch, check, retry, and master a topic", async ({ page }) => {
  await signUpAndOnboard(page);
  await page.goto("/courses/ap-calculus-bc/chain-rule");
  await page.getByRole("link", { name: /Master this topic/ }).click();
  await page.waitForURL("**/master/ap-calculus-bc/chain-rule");
  await expect(page.getByRole("heading", { level: 1, name: "Chain Rule" })).toBeVisible();

  await expect(page.getByRole("heading", { name: "The key ideas" })).toBeVisible();
  await page.getByRole("button", { name: "Next: watch the lesson" }).click();
  await expect(page.getByRole("heading", { name: "Watch the top lesson" })).toBeVisible();
  await expect(page.locator('a[href^="/go/"]').first()).toBeVisible();
  await page.getByRole("button", { name: "I already know this" }).click();

  // The local test server has no AI, so the check is the key-idea self-check.
  await expect(page.getByRole("heading", { name: "Can you explain each idea?" })).toBeVisible();
  const count = await page.getByRole("radiogroup").count();
  await selfCheck(page, [false, ...Array(count - 1).fill(true)]);
  await expect(page.getByText("Almost there")).toBeVisible();

  await page.getByRole("button", { name: "Review and try again" }).click();
  await page.getByRole("button", { name: "Start the check" }).click();
  await selfCheck(page, Array(count).fill(true));
  await expect(page.getByText("Topic mastered")).toBeVisible();
  await expect(page.getByRole("link", { name: /Next topic:/ })).toBeVisible();

  await page.goto("/courses/ap-calculus-bc");
  await expect(page.locator("p", { hasText: "topics understood" }).first()).toHaveText(/^1 \/ \d+ topics understood/);
  await page.goto("/courses/ap-calculus-bc/chain-rule");
  await expect(page.getByRole("link", { name: /Practice it again/ })).toBeVisible();
});

test("quick session picker: your next topics, any course, and topic search", async ({ page }) => {
  await signUpAndOnboard(page);
  await page.goto("/master");
  await expect(page.getByRole("heading", { name: "Up next for you" })).toBeVisible();
  await page.getByRole("link", { name: /AP Biology/ }).first().click();
  await page.waitForURL(/course=ap-biology/);
  await expect(page.getByText(/0 of \d+ topics mastered/)).toBeVisible();
  await page.getByLabel("Find a topic in AP Bio").fill("respiration");
  await page.keyboard.press("Enter");
  await page.waitForURL(/q=respiration/);
  await page.getByRole("link", { name: /Cellular Respiration/i }).first().click();
  await page.waitForURL(/\/master\/ap-biology\//);
  await expect(page.getByRole("heading", { name: "The key ideas" })).toBeVisible();
});

test("quick sessions ask visitors to sign in first", async ({ page }) => {
  await page.goto("/master/ap-calculus-bc/chain-rule");
  await page.waitForURL(/\/login\?next=%2Fmaster%2Fap-calculus-bc%2Fchain-rule/);
});
