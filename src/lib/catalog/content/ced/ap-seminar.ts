import type { CourseSpec } from "../spec";

/**
 * AP Seminar, following the College Board Course and Exam Description (units and topics in CED order).
 * AP Seminar is organized by five big ideas rather than numbered units.
 */
export const seminar: CourseSpec = {
  "course": {
    "slug": "ap-seminar",
    "title": "AP Seminar",
    "shortTitle": "AP Seminar",
    "exam": "AP",
    "category": "AP Capstone",
    "description": "The first AP Capstone course: investigate real-world issues from multiple perspectives through team projects, essays, and presentations.",
    "hue": 180,
    "examMonth": "May",
    "query": "AP Seminar",
    "keywords": [
      "ap seminar",
      "ap capstone"
    ]
  },
  "units": [
    {
      "slug": "question-and-explore",
      "title": "Big Idea 1: Question and Explore",
      "summary": "Asking questions and exploring a topic.",
      "concepts": [
        {
          "title": "Big Idea 1: Question and Explore",
          "topics": [
            {
              "slug": "question-and-explore",
              "title": "Question and Explore",
              "summary": "Start with a problem worth investigating and gather sources from several lenses.",
              "aliases": [
                "quest framework",
                "lenses"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "understand-and-analyze",
      "title": "Big Idea 2: Understand and Analyze",
      "summary": "Reading closely and analyzing arguments.",
      "concepts": [
        {
          "title": "Big Idea 2: Understand and Analyze",
          "topics": [
            {
              "slug": "evaluating-sources-and-arguments",
              "title": "Evaluating Sources and Arguments",
              "summary": "Judge credibility, relevance, and reasoning before using a source.",
              "aliases": [
                "source evaluation",
                "credibility"
              ]
            },
            {
              "slug": "the-ap-seminar-end-of-course-exam",
              "title": "The AP Seminar End-of-Course Exam",
              "summary": "Analyze an argument and write an evidence-based argument from provided sources.",
              "aliases": [
                "ap seminar exam",
                "EOC"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "evaluate-multiple-perspectives",
      "title": "Big Idea 3: Evaluate Multiple Perspectives",
      "summary": "Comparing perspectives and lenses on an issue.",
      "concepts": [
        {
          "title": "Big Idea 3: Evaluate Multiple Perspectives",
          "topics": [
            {
              "slug": "evaluating-multiple-perspectives",
              "title": "Evaluating Multiple Perspectives",
              "summary": "Look at an issue through different lenses (economic, ethical, scientific) and weigh how each perspective frames the problem.",
              "points": [
                "Lenses and perspectives",
                "Comparing arguments",
                "Credibility of sources"
              ],
              "aliases": [
                "perspectives",
                "lenses",
                "ap seminar"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "synthesize-ideas",
      "title": "Big Idea 4: Synthesize Ideas",
      "summary": "Building your own argument from evidence.",
      "concepts": [
        {
          "title": "Big Idea 4: Synthesize Ideas",
          "topics": [
            {
              "slug": "synthesizing-ideas",
              "title": "Synthesizing Ideas",
              "summary": "Combine perspectives into your own argument and solution.",
              "aliases": [
                "synthesis"
              ]
            },
            {
              "slug": "individual-research-based-essay-and-presentation",
              "title": "Individual Research-Based Essay and Presentation",
              "summary": "Write an argument connected to the stimulus materials and defend it orally.",
              "aliases": [
                "IWA",
                "IRR",
                "individual written argument"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "team-transform-and-transmit",
      "title": "Big Idea 5: Team, Transform, and Transmit",
      "summary": "Collaborating and communicating to an audience.",
      "concepts": [
        {
          "title": "Big Idea 5: Team, Transform, and Transmit",
          "topics": [
            {
              "slug": "team-multimedia-presentation",
              "title": "Team Multimedia Presentation",
              "summary": "Teams research a problem and present an evidence-based solution.",
              "aliases": [
                "TMP",
                "team multimedia presentation"
              ]
            }
          ]
        }
      ]
    }
  ]
};
