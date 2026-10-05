import type { CourseSpec } from "../spec";

/**
 * AP English Language and Composition, following the College Board Course and Exam Description (units and topics in CED order).
 * The CED's nine units spiral the same skills; titles here name each unit's focus.
 */
export const lang: CourseSpec = {
  "course": {
    "slug": "ap-english-language",
    "title": "AP English Language and Composition",
    "shortTitle": "AP Lang",
    "exam": "AP",
    "category": "English",
    "description": "Rhetoric and argument: analyzing how writers persuade, and writing synthesis, rhetorical analysis, and argument essays.",
    "hue": 10,
    "examMonth": "May",
    "query": "AP Lang",
    "keywords": [
      "ap lang",
      "ap language",
      "ap english language",
      "ap english lang"
    ]
  },
  "units": [
    {
      "slug": "unit-1-claims-and-evidence",
      "title": "Unit 1: Claims and Evidence",
      "summary": "Identify a writer's claims and whether reasoning and evidence back them up.",
      "concepts": [
        {
          "title": "Unit 1: Claims and Evidence",
          "topics": [
            {
              "slug": "the-rhetorical-situation",
              "title": "The Rhetorical Situation",
              "summary": "Every text has a speaker, audience, purpose, context, and message; analysis starts there.",
              "aliases": [
                "SPACECAT",
                "rhetorical situation"
              ]
            },
            {
              "slug": "identifying-claims-and-evidence",
              "title": "Identifying Claims and Evidence",
              "summary": "Find the writer's claim, then judge whether the evidence and reasoning actually support it.",
              "points": [
                "Claims that need defending",
                "Kinds of evidence",
                "Writing a claim-and-evidence paragraph"
              ],
              "aliases": [
                "claims and evidence",
                "ap lang unit 1"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "unit-2-organizing-for-an-audience",
      "title": "Unit 2: Organizing an Argument for an Audience",
      "summary": "How writers organize information and evidence to reach a particular audience.",
      "concepts": [
        {
          "title": "Unit 2: Organizing an Argument for an Audience",
          "topics": [
            {
              "slug": "rhetorical-choices-and-appeals",
              "title": "Rhetorical Choices and Appeals",
              "summary": "Writers choose evidence, diction, and appeals to ethos, pathos, and logos to reach their audience.",
              "aliases": [
                "ethos pathos logos",
                "rhetorical appeals"
              ]
            },
            {
              "slug": "audience-purpose-and-organization",
              "title": "Audience, Purpose, and Organization",
              "summary": "Writers order their reasons and evidence for a specific audience and purpose; the same argument looks different for different readers.",
              "points": [
                "Audience and purpose",
                "Ordering reasons",
                "Choosing evidence for readers"
              ],
              "aliases": [
                "audience and purpose",
                "ap lang unit 2"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "unit-3-perspectives-and-sources",
      "title": "Unit 3: Perspectives and How Arguments Relate",
      "summary": "The range of perspectives on a topic and how arguments respond to each other.",
      "concepts": [
        {
          "title": "Unit 3: Perspectives and How Arguments Relate",
          "topics": [
            {
              "slug": "the-synthesis-essay",
              "title": "The Synthesis Essay",
              "summary": "Use at least three sources to support your own argument, not to summarize them.",
              "aliases": [
                "synthesis essay",
                "ap lang synthesis"
              ]
            },
            {
              "slug": "using-sources-to-join-a-conversation",
              "title": "Using Sources to Join a Conversation",
              "summary": "Arguments respond to other arguments; strong writers summarize, quote, and respond to sources fairly.",
              "points": [
                "Summarizing sources",
                "Agreeing, disagreeing, qualifying",
                "Citing and attributing"
              ],
              "aliases": [
                "using sources",
                "ap lang unit 3"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "unit-4-developing-arguments",
      "title": "Unit 4: Introductions, Conclusions, and Methods of Development",
      "summary": "How writers choose methods of development and craft openings and closings.",
      "concepts": [
        {
          "title": "Unit 4: Introductions, Conclusions, and Methods of Development",
          "topics": [
            {
              "slug": "writing-a-defensible-thesis",
              "title": "Writing a Defensible Thesis",
              "summary": "A strong thesis makes a claim someone could disagree with and previews your line of reasoning.",
              "aliases": [
                "thesis statement",
                "ap lang thesis"
              ]
            },
            {
              "slug": "introductions-conclusions-and-methods-of-development",
              "title": "Introductions, Conclusions, and Methods of Development",
              "summary": "Writers choose how to develop an argument (comparison, cause and effect, narration) and frame it with an introduction and conclusion that fit.",
              "points": [
                "Methods of development",
                "Effective introductions",
                "Conclusions that go beyond summary"
              ],
              "aliases": [
                "introductions and conclusions",
                "methods of development",
                "ap lang unit 4"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "unit-5-cohesion-and-precision",
      "title": "Unit 5: Cohesion and Precise Choices",
      "summary": "The small choices that hold an argument together.",
      "concepts": [
        {
          "title": "Unit 5: Cohesion and Precise Choices",
          "topics": [
            {
              "slug": "commentary-and-line-of-reasoning",
              "title": "Commentary and Line of Reasoning",
              "summary": "Commentary explains how evidence supports your claim; it's where most of the points are.",
              "aliases": [
                "commentary",
                "line of reasoning"
              ]
            },
            {
              "slug": "organization-and-transitions",
              "title": "Organization and Transitions",
              "summary": "Arrangement and transitions guide readers through an argument.",
              "aliases": [
                "organization"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "unit-6-position-perspective-bias",
      "title": "Unit 6: Position, Perspective, and Bias",
      "summary": "Telling position from perspective, considering bias, and addressing other views.",
      "concepts": [
        {
          "title": "Unit 6: Position, Perspective, and Bias",
          "topics": [
            {
              "slug": "position-perspective-and-bias",
              "title": "Position, Perspective, and Bias",
              "summary": "A position is what a writer argues; a perspective is where they stand. Good arguments recognize bias and address other views.",
              "points": [
                "Position vs. perspective",
                "Recognizing bias",
                "Counterarguments and concessions"
              ],
              "aliases": [
                "bias",
                "counterargument",
                "ap lang unit 6"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "unit-7-complexity-of-arguments",
      "title": "Unit 7: Complexity in Arguments",
      "summary": "What makes arguments on a topic succeed or fail.",
      "concepts": [
        {
          "title": "Unit 7: Complexity in Arguments",
          "topics": [
            {
              "slug": "the-rhetorical-analysis-essay",
              "title": "The Rhetorical Analysis Essay",
              "summary": "Explain how the writer's choices achieve their purpose, not just what the choices are.",
              "aliases": [
                "rhetorical analysis essay",
                "ap lang rhetorical analysis"
              ]
            },
            {
              "slug": "qualifying-and-complicating-an-argument",
              "title": "Qualifying and Complicating an Argument",
              "summary": "Sophisticated arguments acknowledge tensions and limits, qualify their claims, and explain why the complexity matters.",
              "points": [
                "Qualifying claims",
                "Tensions and limitations",
                "Earning the sophistication point"
              ],
              "aliases": [
                "complexity",
                "sophistication point",
                "ap lang unit 7"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "unit-8-style",
      "title": "Unit 8: Style and Its Effects",
      "summary": "How stylistic choices shape an argument.",
      "concepts": [
        {
          "title": "Unit 8: Style and Its Effects",
          "topics": [
            {
              "slug": "syntax-and-diction",
              "title": "Syntax and Diction",
              "summary": "Sentence structure and word choice create tone and emphasis.",
              "aliases": [
                "syntax",
                "diction",
                "tone"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "unit-9-complex-argument",
      "title": "Unit 9: Developing a Complex Argument",
      "summary": "Bringing every skill together for a nuanced argument.",
      "concepts": [
        {
          "title": "Unit 9: Developing a Complex Argument",
          "topics": [
            {
              "slug": "the-argument-essay",
              "title": "The Argument Essay",
              "summary": "Defend a position with specific evidence and commentary drawn from your own knowledge.",
              "aliases": [
                "argument essay",
                "ap lang argument"
              ]
            },
            {
              "slug": "multiple-choice-strategies",
              "title": "Multiple Choice Strategies",
              "summary": "Reading and writing questions reward careful attention to purpose and function.",
              "aliases": [
                "ap lang multiple choice"
              ]
            }
          ]
        }
      ]
    }
  ]
};
