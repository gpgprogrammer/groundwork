import type { CourseSpec } from "./spec";

export const satRW: CourseSpec = {
  course: {
    slug: "sat-reading-writing",
    title: "SAT Reading and Writing",
    shortTitle: "SAT R&W",
    exam: "SAT",
    category: "SAT",
    description:
      "Short passages and one question each. Vocabulary in context, evidence, structure, and the grammar rules that come up again and again.",
    hue: 330,
    examMonth: "Mar · May · Jun · Aug · Oct · Nov · Dec",
    query: "SAT Reading and Writing",
    keywords: ["sat reading", "sat writing", "sat english", "sat verbal", "sat rw", "sat r w"],
  },
  units: [
    {
      slug: "craft-and-structure",
      title: "Craft and Structure",
      summary: "Words in context, text structure, and cross-text connections.",
      concepts: [
        {
          title: "Vocabulary and Purpose",
          topics: [
            {
              slug: "words-in-context",
              title: "Words in Context",
              glyph: "___",
              summary:
                "Predict a word for the blank before you look at the choices, then match. The right answer fits the logic of the passage, not only its tone.",
              points: ["Predict first", "Contrast and continuation clues", "Eliminating near-synonyms"],
              aliases: ["vocabulary", "vocab in context", "fill in the blank"],
            },
            {
              slug: "text-structure-purpose",
              title: "Text Structure and Purpose",
              glyph: "¶ → ¶",
              summary:
                "Ask what each sentence does, not what it says. Structure questions reward naming the move the author is making.",
              points: ["Function vs. content", "Common structures", "Main purpose"],
              aliases: ["purpose", "function of sentence", "structure"],
            },
          ],
        },
      ],
    },
    {
      slug: "information-and-ideas",
      title: "Information and Ideas",
      summary: "Central ideas, inferences, and evidence, including from data.",
      concepts: [
        {
          title: "Evidence",
          topics: [
            {
              slug: "command-of-evidence",
              title: "Command of Evidence: Quantitative",
              glyph: "▥",
              summary:
                "These questions pair a claim with a table or graph. The answer has to be true according to the data and has to support the specific claim being made.",
              points: ["Restate the claim", "Read the exact data point", "True but irrelevant traps"],
              aliases: ["graphs", "data questions", "quantitative evidence", "tables"],
            },
            {
              slug: "inferences",
              title: "Inferences",
              glyph: "∴",
              summary:
                "Complete the passage's reasoning with the choice that must follow logically. Anything that goes beyond the passage is wrong, even if it sounds plausible.",
              points: ["Tracing the argument", "Must be true vs. could be true", "Hedged language"],
              aliases: ["logical completion", "inference questions"],
            },
          ],
        },
      ],
    },
    {
      slug: "standard-english-conventions",
      title: "Standard English Conventions",
      summary: "Boundaries, form, structure, and sense. These are the fastest points on the test.",
      concepts: [
        {
          title: "Punctuation and Grammar",
          topics: [
            {
              slug: "semicolons-colons",
              title: "Semicolons, Colons, and Dashes",
              glyph: "; : —",
              summary:
                "A semicolon joins two complete sentences. A colon introduces something that explains what came before it. Test each side for independence.",
              points: ["Independent clause test", "Colon as an arrow", "Paired dashes"],
              aliases: ["punctuation", "semicolon", "colon", "boundaries", "run on"],
            },
            {
              slug: "subject-verb-agreement",
              title: "Subject–Verb Agreement",
              glyph: "S ↔ V",
              summary:
                "Find the true subject by crossing out the prepositional phrases and the interrupters in between. Then match the verb to it.",
              points: ["Cross out the middle", "Collective nouns", "Inverted sentences"],
              aliases: ["agreement", "verbs", "grammar"],
            },
            {
              slug: "transitions",
              title: "Transitions",
              glyph: "→",
              summary:
                "Figure out how the two sentences relate (contrast, continuation, cause, or example) before you look at the words. Then pick the transition that names that relationship.",
              points: ["Name the relationship", "Contrast vs. concession", "Rhetorical synthesis"],
              aliases: ["transition words", "however therefore", "rhetorical synthesis"],
            },
          ],
        },
      ],
    },
  ],
};
