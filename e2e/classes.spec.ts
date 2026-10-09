import { expect, test } from "@playwright/test";
import { buildCurriculum, LAUNCHED_CLASSES } from "../src/lib/catalog/build";
import { examDateFor } from "../src/lib/exams";
import { paceFraction } from "../src/lib/pace";

const cur = buildCurriculum({ allClasses: true });
const topicsOf = (id: string) => cur.topics.filter((t) => t.courseId === id);

test.describe("high school classes", () => {
  test("every class has units and topics, and topic ids are unique", () => {
    const classes = cur.courses.filter((c) => c.exam === "Class");
    expect(classes.length).toBe(20);
    for (const c of classes) {
      expect(topicsOf(c.id).length, c.id).toBeGreaterThan(30);
      expect(c.grades, c.id).toBeTruthy();
    }
    expect(new Set(cur.topics.map((t) => t.id)).size).toBe(cur.topics.length);
  });

  test("honors classes share the regular class's topics and own only their honors topics", () => {
    const regular = topicsOf("chemistry");
    const honors = topicsOf("honors-chemistry");
    // Every regular topic is in honors and borrows its videos.
    for (const t of regular) expect(honors.find((h) => h.slug === t.slug)?.sameAs).toBe(t.id);
    // Honors-only topics are the honors class's own.
    const own = honors.filter((t) => !t.sameAs);
    expect(own.map((t) => t.title)).toContain("Hess's Law and Heats of Formation");
    expect(regular.some((t) => t.title === "Hess's Law and Heats of Formation")).toBe(false);
    expect(honors.length).toBe(regular.length + own.length);
  });

  test("classes have no default exam date, and pace runs to late May", () => {
    const algebra = cur.courses.find((c) => c.id === "algebra-1")!;
    expect(examDateFor(algebra, { examDate: "2099-05-04" })).toBeNull();
    expect(paceFraction(Date.parse("2026-10-05T12:00:00"), "Class")).toBeGreaterThan(0.12);
    expect(paceFraction(Date.parse("2026-10-05T12:00:00"), "Class")).toBeLessThan(paceFraction(Date.parse("2026-10-05T12:00:00"), "AP"));
    expect(paceFraction(Date.parse("2027-05-25T12:00:00"), "Class")).toBe(1);
  });

  test("only launched classes are on the site", () => {
    const live = buildCurriculum({ allClasses: false });
    for (const c of live.courses.filter((x) => x.exam === "Class")) expect(LAUNCHED_CLASSES.has(c.honorsOf ?? c.id), c.id).toBe(true);
    expect(live.courses.filter((x) => x.exam !== "Class").length).toBe(cur.courses.filter((x) => x.exam !== "Class").length);
  });

  test("class pages show the grade level and a class-test Sprint", async ({ page }) => {
    // Needs a preview server with every class (MERIT_ALL_CLASSES=1) or with Geometry launched.
    test.skip(process.env.MERIT_ALL_CLASSES !== "1" && !LAUNCHED_CLASSES.has("geometry"), "Geometry isn't launched");
    await page.goto("/courses/honors-geometry");
    await expect(page.getByRole("heading", { level: 1, name: "Honors Geometry" })).toBeVisible();
    await expect(page.getByText(/Grade 9 or 10/)).toBeVisible();
    await page.goto("/courses/honors-geometry/the-law-of-sines");
    await expect(page.getByText(/Big Hon\. Geometry test coming up/)).toBeVisible();
    // Honors-only topics aren't part of the regular class.
    const res = await page.goto("/courses/geometry");
    expect(res?.ok()).toBe(true);
    await expect(page.getByText("The Law of Sines")).toHaveCount(0);
  });
});
