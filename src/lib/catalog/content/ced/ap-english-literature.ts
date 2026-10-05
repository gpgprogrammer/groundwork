import type { CourseSpec } from "../spec";

/**
 * AP English Literature and Composition, following the College Board Course and Exam Description (units and topics in CED order).
 */
export const lit: CourseSpec = {
  "course": {
    "slug": "ap-english-literature",
    "title": "AP English Literature and Composition",
    "shortTitle": "AP Lit",
    "exam": "AP",
    "category": "English",
    "description": "Close reading of fiction, poetry, and drama, and the literary argument essays built on it.",
    "hue": 355,
    "examMonth": "May",
    "query": "AP Lit",
    "keywords": [
      "ap lit",
      "ap literature",
      "ap english literature",
      "ap english lit"
    ]
  },
  "units": [
    {
      "slug": "short-fiction-i",
      "title": "Unit 1: Short Fiction I",
      "summary": "Character, setting, and plot in short stories.",
      "concepts": [
        {
          "title": "Unit 1: Short Fiction I",
          "topics": [
            {
              "slug": "character-and-characterization",
              "title": "Character and Characterization",
              "summary": "Characters reveal values and tensions through what they say, do, and want.",
              "aliases": [
                "characterization"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "poetry-i",
      "title": "Unit 2: Poetry I",
      "summary": "Speaker, structure, and word choice in poems.",
      "concepts": [
        {
          "title": "Unit 2: Poetry I",
          "topics": [
            {
              "slug": "poetic-form-and-structure",
              "title": "Poetic Form and Structure",
              "summary": "Sonnets, meter, line breaks, and shifts contribute to a poem's meaning.",
              "aliases": [
                "poetry analysis",
                "sonnet",
                "meter",
                "tone shift"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "longer-fiction-or-drama-i",
      "title": "Unit 3: Longer Fiction or Drama I",
      "summary": "How characters develop across a novel or play.",
      "concepts": [
        {
          "title": "Unit 3: Longer Fiction or Drama I",
          "topics": [
            {
              "slug": "drama",
              "title": "Drama",
              "summary": "Dialogue, conflict, and staging reveal character in plays.",
              "aliases": [
                "drama analysis",
                "shakespeare"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "short-fiction-ii",
      "title": "Unit 4: Short Fiction II",
      "summary": "Narration, perspective, and structure.",
      "concepts": [
        {
          "title": "Unit 4: Short Fiction II",
          "topics": [
            {
              "slug": "setting-structure-and-narration",
              "title": "Setting, Structure, and Narration",
              "summary": "Point of view, setting, and plot structure shape how readers understand a story.",
              "aliases": [
                "point of view",
                "narrator",
                "plot structure"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "poetry-ii",
      "title": "Unit 5: Poetry II",
      "summary": "Figurative language: simile, metaphor, and imagery.",
      "concepts": [
        {
          "title": "Unit 5: Poetry II",
          "topics": [
            {
              "slug": "figurative-language-and-imagery",
              "title": "Figurative Language and Imagery",
              "summary": "Metaphor, simile, and imagery create meaning beyond the literal.",
              "aliases": [
                "figurative language",
                "metaphor",
                "imagery"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "longer-fiction-or-drama-ii",
      "title": "Unit 6: Longer Fiction or Drama II",
      "summary": "Narrators, contrasts, and structure in longer works.",
      "concepts": [
        {
          "title": "Unit 6: Longer Fiction or Drama II",
          "topics": [
            {
              "slug": "narration-and-structure-in-longer-works",
              "title": "Narration and Structure in Longer Works",
              "summary": "In a novel or play, the narrator's reliability and the work's structure (flashbacks, juxtaposition, pacing) shape meaning.",
              "points": [
                "Reliable and unreliable narrators",
                "Juxtaposition and contrast",
                "Structure across a whole work"
              ],
              "aliases": [
                "unreliable narrator",
                "structure in novels",
                "ap lit unit 6"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "short-fiction-iii",
      "title": "Unit 7: Short Fiction III",
      "summary": "Complexity, ambiguity, and interpretation in short fiction.",
      "concepts": [
        {
          "title": "Unit 7: Short Fiction III",
          "topics": [
            {
              "slug": "the-prose-fiction-analysis-essay",
              "title": "The Prose Fiction Analysis Essay",
              "summary": "Analyze how a passage's literary elements convey complexity.",
              "aliases": [
                "prose essay",
                "ap lit q2"
              ]
            },
            {
              "slug": "ambiguity-and-complexity-in-short-fiction",
              "title": "Ambiguity and Complexity in Short Fiction",
              "summary": "Strong interpretations account for tensions and ambiguity instead of flattening a story into one simple message.",
              "points": [
                "Ambiguity",
                "Competing interpretations",
                "Writing about complexity"
              ],
              "aliases": [
                "ambiguity",
                "complexity in literature",
                "ap lit unit 7"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "poetry-iii",
      "title": "Unit 8: Poetry III",
      "summary": "Extended metaphor, conceit, and complex form.",
      "concepts": [
        {
          "title": "Unit 8: Poetry III",
          "topics": [
            {
              "slug": "the-poetry-analysis-essay",
              "title": "The Poetry Analysis Essay",
              "summary": "Argue how the poem's choices build its meaning, with specific textual evidence.",
              "aliases": [
                "poetry essay",
                "ap lit q1"
              ]
            },
            {
              "slug": "extended-metaphor-and-complex-imagery",
              "title": "Extended Metaphor and Complex Imagery",
              "summary": "Extended metaphors and conceits carry an idea through a whole poem; tracing them reveals the poem's argument.",
              "points": [
                "Extended metaphor and conceit",
                "Shifts and turns",
                "Tracing an image through a poem"
              ],
              "aliases": [
                "extended metaphor",
                "conceit",
                "ap lit unit 8"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "longer-fiction-or-drama-iii",
      "title": "Unit 9: Longer Fiction or Drama III",
      "summary": "Theme, complexity, and the literary argument.",
      "concepts": [
        {
          "title": "Unit 9: Longer Fiction or Drama III",
          "topics": [
            {
              "slug": "theme-and-complexity",
              "title": "Theme and Complexity",
              "summary": "Strong readings trace how a work develops ideas and complexity, not just a one-word theme.",
              "aliases": [
                "theme",
                "literary argument"
              ]
            },
            {
              "slug": "the-literary-argument-essay",
              "title": "The Literary Argument Essay",
              "summary": "Choose a work you know well and argue how it addresses the prompt's idea.",
              "aliases": [
                "open question",
                "literary argument essay",
                "ap lit q3"
              ]
            }
          ]
        }
      ]
    }
  ]
};
