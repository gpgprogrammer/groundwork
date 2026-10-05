import type { CourseSpec } from "../spec";

/**
 * SAT Reading and Writing, following the College Board Course and Exam Description (units and topics in CED order).
 * Domains and skills from the College Board's digital SAT specifications.
 */
export const satRW: CourseSpec = {
  "course": {
    "slug": "sat-reading-writing",
    "title": "SAT Reading and Writing",
    "shortTitle": "SAT R&W",
    "exam": "SAT",
    "category": "SAT",
    "description": "Short passages and one question each. Vocabulary in context, evidence, structure, and the grammar rules that come up again and again.",
    "hue": 330,
    "examMonth": "Mar · May · Jun · Aug · Oct · Nov · Dec",
    "query": "SAT Reading and Writing",
    "keywords": [
      "sat reading",
      "sat writing",
      "sat english",
      "sat verbal",
      "sat rw",
      "sat r w"
    ]
  },
  "units": [
    {
      "slug": "information-and-ideas",
      "title": "Information and Ideas",
      "summary": "Reading for central ideas, evidence, and inferences.",
      "concepts": [
        {
          "title": "Information and Ideas",
          "topics": [
            {
              "slug": "central-ideas-and-details",
              "title": "Central Ideas and Details",
              "summary": "Identify a text's main point and the details that support it.",
              "points": [
                "Main idea vs. details",
                "Paraphrasing",
                "Eliminating too-broad answers"
              ],
              "aliases": [
                "central ideas",
                "main idea sat"
              ]
            },
            {
              "slug": "command-of-evidence-textual",
              "title": "Command of Evidence: Textual",
              "summary": "Pick the quotation or finding that best supports, weakens, or illustrates a claim.",
              "points": [
                "Supporting a claim",
                "Weakening a claim",
                "Matching evidence precisely"
              ],
              "aliases": [
                "command of evidence textual",
                "supporting evidence"
              ]
            },
            {
              "slug": "command-of-evidence",
              "title": "Command of Evidence: Quantitative",
              "glyph": "▥",
              "summary": "These questions pair a claim with a table or graph. The answer has to be true according to the data and has to support the specific claim being made.",
              "points": [
                "Restate the claim",
                "Read the exact data point",
                "True but irrelevant traps"
              ],
              "aliases": [
                "graphs",
                "data questions",
                "quantitative evidence",
                "tables"
              ]
            },
            {
              "slug": "inferences",
              "title": "Inferences",
              "glyph": "∴",
              "summary": "Complete the passage's reasoning with the choice that must follow logically. Anything that goes beyond the passage is wrong, even if it sounds plausible.",
              "points": [
                "Tracing the argument",
                "Must be true vs. could be true",
                "Hedged language"
              ],
              "aliases": [
                "logical completion",
                "inference questions"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "craft-and-structure",
      "title": "Craft and Structure",
      "summary": "Word meaning, text structure, and connections between texts.",
      "concepts": [
        {
          "title": "Craft and Structure",
          "topics": [
            {
              "slug": "words-in-context",
              "title": "Words in Context",
              "glyph": "___",
              "summary": "Predict a word for the blank before you look at the choices, then match. The right answer fits the logic of the passage, not only its tone.",
              "points": [
                "Predict first",
                "Contrast and continuation clues",
                "Eliminating near-synonyms"
              ],
              "aliases": [
                "vocabulary",
                "vocab in context",
                "fill in the blank"
              ]
            },
            {
              "slug": "text-structure-purpose",
              "title": "Text Structure and Purpose",
              "glyph": "¶ → ¶",
              "summary": "Ask what each sentence does, not what it says. Structure questions reward naming the move the author is making.",
              "points": [
                "Function vs. content",
                "Common structures",
                "Main purpose"
              ],
              "aliases": [
                "purpose",
                "function of sentence",
                "structure"
              ]
            },
            {
              "slug": "cross-text-connections",
              "title": "Cross-Text Connections",
              "summary": "Compare two short texts on the same topic: how would one author respond to the other?",
              "points": [
                "Finding the point of disagreement",
                "Predicting a response",
                "Paired passages"
              ],
              "aliases": [
                "cross text connections",
                "paired passages"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "expression-of-ideas",
      "title": "Expression of Ideas",
      "summary": "Revising for logic, purpose, and audience.",
      "concepts": [
        {
          "title": "Expression of Ideas",
          "topics": [
            {
              "slug": "rhetorical-synthesis",
              "title": "Rhetorical Synthesis",
              "summary": "Use a list of notes to write the sentence that accomplishes a specific goal.",
              "points": [
                "Reading the goal first",
                "Picking the right notes",
                "Avoiding true-but-irrelevant answers"
              ],
              "aliases": [
                "rhetorical synthesis",
                "student notes questions"
              ]
            },
            {
              "slug": "transitions",
              "title": "Transitions",
              "glyph": "→",
              "summary": "Figure out how the two sentences relate (contrast, continuation, cause, or example) before you look at the words. Then pick the transition that names that relationship.",
              "points": [
                "Name the relationship",
                "Contrast vs. concession",
                "Rhetorical synthesis"
              ],
              "aliases": [
                "transition words",
                "however therefore",
                "rhetorical synthesis"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "standard-english-conventions",
      "title": "Standard English Conventions",
      "summary": "Grammar, usage, and punctuation.",
      "concepts": [
        {
          "title": "Standard English Conventions",
          "topics": [
            {
              "slug": "boundaries-sentences-and-clauses",
              "title": "Boundaries: Sentences and Clauses",
              "summary": "Join or separate clauses correctly: periods, semicolons, commas with conjunctions, and no comma splices.",
              "points": [
                "Independent vs. dependent clauses",
                "Comma splices",
                "Run-ons and fragments"
              ],
              "aliases": [
                "boundaries",
                "comma splice",
                "run on sentence"
              ]
            },
            {
              "slug": "semicolons-colons",
              "title": "Semicolons, Colons, and Dashes",
              "glyph": "; : —",
              "summary": "A semicolon joins two complete sentences. A colon introduces something that explains what came before it. Test each side for independence.",
              "points": [
                "Independent clause test",
                "Colon as an arrow",
                "Paired dashes"
              ],
              "aliases": [
                "punctuation",
                "semicolon",
                "colon",
                "boundaries",
                "run on"
              ]
            },
            {
              "slug": "subject-verb-agreement",
              "title": "Subject–Verb Agreement",
              "glyph": "S ↔ V",
              "summary": "Find the true subject by crossing out the prepositional phrases and the interrupters in between. Then match the verb to it.",
              "points": [
                "Cross out the middle",
                "Collective nouns",
                "Inverted sentences"
              ],
              "aliases": [
                "agreement",
                "verbs",
                "grammar"
              ]
            },
            {
              "slug": "form-structure-and-sense",
              "title": "Form, Structure, and Sense",
              "summary": "Verb tense, pronoun agreement, modifiers, and plurals and possessives.",
              "points": [
                "Verb tense",
                "Pronoun–antecedent agreement",
                "Modifier placement and possessives"
              ],
              "aliases": [
                "form structure and sense",
                "pronoun agreement",
                "verb tense"
              ]
            }
          ]
        }
      ]
    }
  ]
};
