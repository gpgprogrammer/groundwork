import type { CourseSpec } from "../spec";

/**
 * AP Research, following the College Board Course and Exam Description (units and topics in CED order).
 * AP Research is organized by five big ideas rather than numbered units.
 */
export const research: CourseSpec = {
  "course": {
    "slug": "ap-research",
    "title": "AP Research",
    "shortTitle": "AP Research",
    "exam": "AP",
    "category": "AP Capstone",
    "description": "The second AP Capstone course: design and carry out a year-long research project and defend a 4,000–5,000 word academic paper.",
    "hue": 170,
    "examMonth": "May",
    "query": "AP Research",
    "keywords": [
      "ap research"
    ]
  },
  "units": [
    {
      "slug": "question-and-explore",
      "title": "Big Idea 1: Question and Explore",
      "summary": "Finding a gap and asking a research question.",
      "concepts": [
        {
          "title": "Big Idea 1: Question and Explore",
          "topics": [
            {
              "slug": "research-questions-and-gaps",
              "title": "Research Questions and Gaps",
              "summary": "Find a gap in the scholarly conversation and turn it into a focused question.",
              "aliases": [
                "research question",
                "gap in research"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "understand-and-analyze",
      "title": "Big Idea 2: Understand and Analyze",
      "summary": "Choosing and applying a research method.",
      "concepts": [
        {
          "title": "Big Idea 2: Understand and Analyze",
          "topics": [
            {
              "slug": "research-methods",
              "title": "Research Methods",
              "summary": "Choose a method (survey, experiment, content analysis, and others) that fits your question.",
              "aliases": [
                "research methods",
                "qualitative quantitative"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "evaluate-multiple-perspectives",
      "title": "Big Idea 3: Evaluate Multiple Perspectives",
      "summary": "Reviewing and weighing the existing research.",
      "concepts": [
        {
          "title": "Big Idea 3: Evaluate Multiple Perspectives",
          "topics": [
            {
              "slug": "literature-review",
              "title": "Literature Review",
              "summary": "Summarize and synthesize existing research to show where your study fits.",
              "aliases": [
                "literature review"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "synthesize-ideas",
      "title": "Big Idea 4: Synthesize Ideas",
      "summary": "Writing the academic paper.",
      "concepts": [
        {
          "title": "Big Idea 4: Synthesize Ideas",
          "topics": [
            {
              "slug": "writing-the-academic-paper",
              "title": "Writing the Academic Paper",
              "summary": "Organize your paper with methods, results, discussion, and limitations.",
              "aliases": [
                "academic paper",
                "ap research paper"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "team-transform-and-transmit",
      "title": "Big Idea 5: Team, Transform, and Transmit",
      "summary": "Presenting and defending your research.",
      "concepts": [
        {
          "title": "Big Idea 5: Team, Transform, and Transmit",
          "topics": [
            {
              "slug": "presentation-and-oral-defense",
              "title": "Presentation and Oral Defense",
              "summary": "Present your findings and answer questions about your process.",
              "aliases": [
                "POD",
                "oral defense"
              ]
            }
          ]
        }
      ]
    }
  ]
};
