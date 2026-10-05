import type { CourseSpec } from "../spec";

/**
 * AP Latin, following the College Board Course and Exam Description (units and topics in CED order).
 */
export const latin: CourseSpec = {
  "course": {
    "slug": "ap-latin",
    "title": "AP Latin",
    "shortTitle": "AP Latin",
    "exam": "AP",
    "category": "World Languages & Cultures",
    "description": "The College Board course revised for 2025–26: Pliny's letters and Vergil's Aeneid, plus reading Latin prose and poetry at sight.",
    "hue": 25,
    "examMonth": "May",
    "query": "AP Latin",
    "keywords": [
      "ap latin",
      "latin"
    ]
  },
  "units": [
    {
      "slug": "latin-prose",
      "title": "Unit 1: Latin Prose",
      "summary": "Reading Latin prose, including passages you haven't seen before.",
      "concepts": [
        {
          "title": "Unit 1: Latin Prose",
          "topics": [
            {
              "slug": "latin-translation-strategies",
              "title": "Latin Translation Strategies",
              "summary": "Parse each verb and noun ending to translate literally and accurately.",
              "aliases": [
                "latin translation",
                "latin grammar"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "pliny-vesuvius",
      "title": "Unit 2: Pliny's Letters: Eruption of Mt. Vesuvius",
      "summary": "Pliny the Younger's eyewitness letters to Tacitus.",
      "concepts": [
        {
          "title": "Unit 2: Pliny's Letters: Eruption of Mt. Vesuvius",
          "topics": [
            {
              "slug": "pliny-on-the-eruption-of-vesuvius",
              "title": "Pliny on the Eruption of Vesuvius",
              "summary": "Pliny's two letters to Tacitus describe his uncle's death and his own escape when Vesuvius erupted in 79 CE.",
              "points": [
                "Letters 6.16 and 6.20",
                "Pliny the Elder's rescue attempt",
                "Style and self-presentation"
              ],
              "aliases": [
                "pliny vesuvius",
                "pliny letters",
                "eruption of vesuvius"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "pliny-letters",
      "title": "Unit 3: Pliny's Letters: Ghosts, Trajan, and Calpurnia",
      "summary": "Pliny on the supernatural, on governing, and on his marriage.",
      "concepts": [
        {
          "title": "Unit 3: Pliny's Letters: Ghosts, Trajan, and Calpurnia",
          "topics": [
            {
              "slug": "plinys-letters-ghosts-trajan-and-calpurnia",
              "title": "Pliny's Letters: Ghosts, Trajan, and Calpurnia",
              "summary": "Pliny writes about a haunted house, asks the emperor Trajan how to handle Christians, and writes love letters to his wife Calpurnia.",
              "points": [
                "The haunted house (7.27)",
                "Letters to Trajan on the Christians",
                "Letters to Calpurnia"
              ],
              "aliases": [
                "pliny ghosts",
                "pliny trajan",
                "pliny calpurnia"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "aeneid-books-1-2",
      "title": "Unit 4: Vergil's Aeneid, Books 1 and 2",
      "summary": "The storm, Carthage, and the fall of Troy.",
      "concepts": [
        {
          "title": "Unit 4: Vergil's Aeneid, Books 1 and 2",
          "topics": [
            {
              "slug": "aeneid-book-1",
              "title": "Aeneid Book 1",
              "summary": "Juno's anger, the storm, and Aeneas's arrival at Carthage.",
              "aliases": [
                "aeneid book 1"
              ]
            },
            {
              "slug": "aeneid-book-2",
              "title": "Aeneid Book 2",
              "summary": "The fall of Troy, told by Aeneas.",
              "aliases": [
                "aeneid book 2",
                "fall of troy"
              ]
            },
            {
              "slug": "dactylic-hexameter-and-poetic-devices",
              "title": "Dactylic Hexameter and Poetic Devices",
              "summary": "Scansion and devices like chiasmus and synchysis are fair game on the exam.",
              "aliases": [
                "scansion",
                "dactylic hexameter",
                "latin poetic devices"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "aeneid-books-4-6-7-11-12",
      "title": "Unit 5: Vergil's Aeneid, Books 4, 6, 7, 11, and 12",
      "summary": "Dido, the underworld, war in Italy, and the end of the epic.",
      "concepts": [
        {
          "title": "Unit 5: Vergil's Aeneid, Books 4, 6, 7, 11, and 12",
          "topics": [
            {
              "slug": "aeneid-book-4",
              "title": "Aeneid Book 4",
              "summary": "The tragedy of Dido and Aeneas.",
              "aliases": [
                "aeneid book 4",
                "dido"
              ]
            },
            {
              "slug": "aeneid-book-6",
              "title": "Aeneid Book 6",
              "summary": "Aeneas's journey to the underworld.",
              "aliases": [
                "aeneid book 6",
                "underworld"
              ]
            },
            {
              "slug": "aeneid-books-7-11-and-12",
              "title": "Aeneid Books 7, 11, and 12",
              "summary": "War comes to Latium: Juno stirs up Allecto, Camilla fights and falls, and the epic ends with Aeneas killing Turnus.",
              "points": [
                "Allecto and the outbreak of war",
                "Camilla",
                "The death of Turnus"
              ],
              "aliases": [
                "aeneid book 12",
                "aeneid book 7",
                "turnus",
                "camilla"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "course-project-latin-poetry",
      "title": "Unit 6: Course Project and Latin Poetry",
      "summary": "A course project and reading Latin poetry at sight.",
      "concepts": [
        {
          "title": "Unit 6: Course Project and Latin Poetry",
          "topics": [
            {
              "slug": "reading-latin-poetry-at-sight",
              "title": "Reading Latin Poetry at Sight",
              "summary": "Sight-reading poetry means using meter, word endings, and context to make sense of lines you've never seen.",
              "points": [
                "Scansion as a reading tool",
                "Word order in poetry",
                "Sight passages on the exam"
              ],
              "aliases": [
                "sight reading latin",
                "latin poetry"
              ]
            }
          ]
        }
      ]
    }
  ]
};
