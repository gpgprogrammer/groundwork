import type { CourseSpec } from "../spec";

/**
 * AP Computer Science Principles, following the College Board Course and Exam Description (units and topics in CED order).
 */
export const csp: CourseSpec = {
  "course": {
    "slug": "ap-computer-science-principles",
    "title": "AP Computer Science Principles",
    "shortTitle": "AP CSP",
    "exam": "AP",
    "category": "Math & Computer Science",
    "description": "The big ideas of computing: creative development, data, algorithms and programming, computer systems and networks, and computing's impact.",
    "hue": 270,
    "examMonth": "May",
    "query": "AP Computer Science Principles",
    "keywords": [
      "ap csp",
      "ap computer science principles",
      "computer science principles",
      "apcsp"
    ]
  },
  "units": [
    {
      "slug": "creative-development",
      "title": "Creative Development",
      "summary": "Collaboration, program design, and fixing errors.",
      "concepts": [
        {
          "title": "Creative Development",
          "topics": [
            {
              "slug": "collaboration-and-program-purpose",
              "title": "Collaboration and Program Purpose",
              "summary": "Programs are built by teams for a purpose; diverse perspectives and clear documentation make them better.",
              "points": [
                "Pair programming",
                "Program inputs and outputs",
                "Describing purpose and function"
              ],
              "aliases": [
                "collaboration",
                "program purpose"
              ]
            },
            {
              "slug": "program-design-and-development",
              "title": "Program Design and Development",
              "summary": "Programs are built iteratively: investigate, design, prototype, test, and refine.",
              "aliases": [
                "development process"
              ]
            },
            {
              "slug": "identifying-and-correcting-errors",
              "title": "Identifying and Correcting Errors",
              "summary": "Syntax, runtime, logic, and overflow errors each need a different debugging approach.",
              "aliases": [
                "debugging",
                "logic error"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "data",
      "title": "Data",
      "summary": "Binary, compression, and extracting information from data.",
      "concepts": [
        {
          "title": "Data",
          "topics": [
            {
              "slug": "binary-numbers",
              "title": "Binary Numbers",
              "summary": "Computers represent everything in bits; convert between binary and decimal with place values.",
              "aliases": [
                "binary",
                "bits and bytes"
              ]
            },
            {
              "slug": "data-compression",
              "title": "Data Compression",
              "summary": "Lossless compression can be reversed exactly; lossy compression trades detail for size.",
              "aliases": [
                "lossless",
                "lossy"
              ]
            },
            {
              "slug": "using-data-to-find-patterns",
              "title": "Using Data to Find Patterns",
              "summary": "Cleaning, filtering, and visualizing data reveals trends, but correlation isn't causation.",
              "aliases": [
                "big data",
                "metadata"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "algorithms-and-programming",
      "title": "Algorithms and Programming",
      "summary": "Variables, conditionals, loops, lists, procedures, and algorithms.",
      "concepts": [
        {
          "title": "Algorithms and Programming",
          "topics": [
            {
              "slug": "variables-lists-and-procedures",
              "title": "Variables, Lists, and Procedures",
              "summary": "Lists store collections, and procedures with parameters reduce repetition and hide complexity.",
              "aliases": [
                "procedures",
                "abstraction",
                "lists"
              ]
            },
            {
              "slug": "expressions-strings-and-data-abstraction",
              "title": "Expressions, Strings, and Data Abstraction",
              "summary": "Arithmetic and string operations build values; lists abstract many values into one name.",
              "points": [
                "MOD and arithmetic",
                "String concatenation and substrings",
                "Lists as abstraction"
              ],
              "aliases": [
                "data abstraction",
                "strings"
              ]
            },
            {
              "slug": "conditionals-iteration-and-boolean-logic",
              "title": "Conditionals, Iteration, and Boolean Logic",
              "summary": "Selection and iteration control what a program does and how many times.",
              "aliases": [
                "selection",
                "iteration"
              ]
            },
            {
              "slug": "developing-algorithms-and-binary-search",
              "title": "Developing Algorithms and Binary Search",
              "summary": "Combine sequencing, selection, and iteration into algorithms; binary search finds items in sorted lists by halving.",
              "points": [
                "Writing algorithms",
                "Linear vs. binary search",
                "Reusing existing algorithms"
              ],
              "aliases": [
                "binary search",
                "developing algorithms"
              ]
            },
            {
              "slug": "procedures-and-libraries",
              "title": "Procedures and Libraries",
              "summary": "Procedures with parameters manage complexity; libraries and APIs let programs reuse others' code.",
              "points": [
                "Parameters and return values",
                "Procedural abstraction",
                "APIs and libraries"
              ],
              "aliases": [
                "procedures",
                "procedural abstraction"
              ]
            },
            {
              "slug": "simulations-and-random-values",
              "title": "Simulations and Random Values",
              "summary": "Simulations model real-world systems with simplifying assumptions and random values.",
              "aliases": [
                "simulation"
              ]
            },
            {
              "slug": "algorithm-efficiency-and-undecidable-problems",
              "title": "Algorithm Efficiency and Undecidable Problems",
              "summary": "Some algorithms run in reasonable time and some don't; some problems can't be solved by any algorithm.",
              "aliases": [
                "efficiency",
                "heuristic",
                "undecidable",
                "binary search"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "computer-systems-and-networks",
      "title": "Computer Systems and Networks",
      "summary": "The internet, fault tolerance, and parallel computing.",
      "concepts": [
        {
          "title": "Computer Systems and Networks",
          "topics": [
            {
              "slug": "the-internet-and-protocols",
              "title": "The Internet and Protocols",
              "summary": "The Internet routes packets using open protocols like TCP/IP, DNS, and HTTP.",
              "aliases": [
                "internet",
                "packets",
                "TCP IP",
                "DNS"
              ]
            },
            {
              "slug": "fault-tolerance",
              "title": "Fault Tolerance",
              "summary": "Redundant paths let the Internet keep working when parts of it fail.",
              "aliases": [
                "redundancy"
              ]
            },
            {
              "slug": "parallel-and-distributed-computing",
              "title": "Parallel and Distributed Computing",
              "summary": "Splitting work across processors speeds it up, but the slowest sequential part limits the gain.",
              "aliases": [
                "parallel computing",
                "speedup"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "impact-of-computing",
      "title": "Impact of Computing",
      "summary": "Benefits, harms, bias, and safety.",
      "concepts": [
        {
          "title": "Impact of Computing",
          "topics": [
            {
              "slug": "beneficial-and-harmful-effects",
              "title": "Beneficial and Harmful Effects",
              "summary": "Innovations have intended and unintended effects, often both helping and harming different groups.",
              "points": [
                "Unintended consequences",
                "Effects on society",
                "Responsible innovation"
              ],
              "aliases": [
                "beneficial and harmful effects of computing"
              ]
            },
            {
              "slug": "the-digital-divide-and-computing-bias",
              "title": "The Digital Divide and Computing Bias",
              "summary": "Unequal access to technology and biased data can make computing innovations unfair.",
              "aliases": [
                "digital divide",
                "algorithmic bias"
              ]
            },
            {
              "slug": "crowdsourcing-legal-and-ethical-issues",
              "title": "Crowdsourcing, Legal, and Ethical Issues",
              "summary": "Open source, Creative Commons, and intellectual property shape how content is shared.",
              "aliases": [
                "creative commons",
                "open source",
                "intellectual property"
              ]
            },
            {
              "slug": "safe-computing-and-cybersecurity",
              "title": "Safe Computing and Cybersecurity",
              "summary": "Encryption, multifactor authentication, and awareness of phishing protect personal data.",
              "aliases": [
                "encryption",
                "phishing",
                "public key",
                "cybersecurity"
              ]
            }
          ]
        }
      ]
    }
  ]
};
