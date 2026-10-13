import { expect, test } from "@playwright/test";
import { ruleTier, withFloor } from "../src/lib/ai/router-rules";

const tierOf = (q: string, previous: Parameters<typeof ruleTier>[1] = null) => ruleTier(q, previous)?.tier ?? "classifier";

test.describe("Merit AI router rules", () => {
  test("lookups, definitions, and small talk go to the light tier", () => {
    for (const q of ["Find me a short video on the chain rule", "What should I study tonight?", "What is a mitochondrion?", "Define osmosis", "thanks!", "Who was Mansa Musa?", "What's on the AP Biology exam?"]) {
      expect(tierOf(q), q).toBe("light");
    }
  });

  test("proofs, worked problems, and writing feedback go to the expert", () => {
    for (const q of [
      "Prove that the derivative of sin x is cos x using limits",
      "A ladder 10 ft long slides down a wall at 2 ft/s. How fast is the angle changing when the bottom is 6 ft away? This is a related rates problem",
      "Solve 3x^2 + 5x - 2 = 0 and then find f(2) + f(3) if f(x) = x^2 - 4x + 7",
      "Can you grade my DBQ thesis using the rubric?",
      "Review my rhetorical analysis paragraph",
    ]) {
      expect(tierOf(q), q).toBe("expert");
    }
  });

  test("a student who's still stuck moves up", () => {
    expect(tierOf("I still don't get it", "light")).toBe("standard");
    expect(tierOf("that's wrong", "standard")).toBe("expert");
  });

  test("short follow-ups keep the conversation's level; the expert's next answer stays at least standard", () => {
    expect(tierOf("why?", "expert")).toBe("expert");
    expect(tierOf("what about the second one?", "standard")).toBe("standard");
    expect(withFloor("light", "expert")).toBe("standard");
    expect(withFloor("light", "standard")).toBe("light");
  });

  test("ordinary explanations are left to the classifier", () => {
    for (const q of ["Explain how the Treaty of Versailles led to World War II", "How does natural selection differ from genetic drift?", "Can you explain supply and demand with an example from everyday life?"]) {
      expect(tierOf(q), q).toBe("classifier");
    }
  });
});
