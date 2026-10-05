import type { CourseSpec } from "../spec";

/**
 * SAT Math, following the College Board Course and Exam Description (units and topics in CED order).
 * Domains and skills from the College Board's digital SAT specifications.
 */
export const satMath: CourseSpec = {
  "course": {
    "slug": "sat-math",
    "title": "SAT Math",
    "shortTitle": "SAT Math",
    "exam": "SAT",
    "category": "SAT",
    "description": "The four domains of the digital SAT: Algebra, Advanced Math, Problem-Solving and Data Analysis, and Geometry and Trigonometry. Taught for speed and for Desmos.",
    "hue": 160,
    "examMonth": "Mar · May · Jun · Aug · Oct · Nov · Dec",
    "query": "SAT Math",
    "keywords": [
      "sat math"
    ]
  },
  "units": [
    {
      "slug": "algebra",
      "title": "Algebra",
      "summary": "Linear equations, functions, systems, and inequalities.",
      "concepts": [
        {
          "title": "Algebra",
          "topics": [
            {
              "slug": "linear-equations-in-one-variable",
              "title": "Linear Equations in One Variable",
              "summary": "Solve and interpret one-variable linear equations, including ones with no solution or infinitely many.",
              "points": [
                "Solving step by step",
                "No solution vs. infinitely many",
                "Writing equations from words"
              ],
              "aliases": [
                "linear equations one variable"
              ]
            },
            {
              "slug": "slope-intercept",
              "title": "Slope-Intercept Form",
              "glyph": "y = mx + b",
              "summary": "In y = mx + b, m is the rate of change and b is the starting value. Many SAT word problems are just asking you to read m and b from context.",
              "points": [
                "Interpreting slope in context",
                "From two points to an equation",
                "Parallel and perpendicular"
              ],
              "aliases": [
                "linear equations",
                "slope",
                "y intercept",
                "linear functions"
              ]
            },
            {
              "slug": "systems-of-equations",
              "title": "Systems of Linear Equations",
              "glyph": "{ 2x + y = 7",
              "summary": "A system of two linear equations has one solution, no solution, or infinitely many. You can tell which by comparing slopes and intercepts, often without solving.",
              "points": [
                "Elimination vs. substitution",
                "No solution / infinite solutions",
                "Solving in Desmos"
              ],
              "aliases": [
                "systems",
                "simultaneous equations",
                "infinitely many solutions"
              ]
            },
            {
              "slug": "linear-inequalities",
              "title": "Linear Inequalities",
              "glyph": "≤",
              "summary": "Inequalities work like equations, except the sign flips when you multiply or divide by a negative. SAT questions often pair them with a real-world constraint.",
              "points": [
                "Flipping the sign",
                "Graphing half-planes",
                "Constraint word problems"
              ],
              "aliases": [
                "inequalities",
                "systems of inequalities"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "advanced-math",
      "title": "Advanced Math",
      "summary": "Equivalent expressions, nonlinear equations, and functions.",
      "concepts": [
        {
          "title": "Advanced Math",
          "topics": [
            {
              "slug": "quadratic-forms",
              "title": "Three Forms of a Quadratic",
              "glyph": "a(x − h)² + k",
              "summary": "Standard, factored, and vertex form each show something different: the y-intercept, the zeros, or the vertex. Choose the form that answers the question.",
              "points": [
                "What each form reveals",
                "Completing the square",
                "Matching form to question"
              ],
              "aliases": [
                "vertex form",
                "factored form",
                "standard form",
                "parabola"
              ]
            },
            {
              "slug": "discriminant",
              "title": "The Discriminant",
              "glyph": "b² − 4ac",
              "summary": "b² − 4ac tells you how many real solutions a quadratic has without solving it. It shows up a lot on questions with an unknown constant.",
              "points": [
                "Positive, zero, negative",
                "Tangent-line questions",
                "Solving for the unknown constant"
              ],
              "aliases": [
                "number of solutions",
                "quadratic formula"
              ]
            },
            {
              "slug": "nonlinear-equations-and-systems",
              "title": "Nonlinear Equations and Systems",
              "summary": "Solve quadratic, radical, rational, and absolute-value equations, and systems with a line and a curve.",
              "points": [
                "Factoring and the quadratic formula",
                "Extraneous solutions",
                "Line–parabola systems"
              ],
              "aliases": [
                "nonlinear equations",
                "systems linear quadratic"
              ]
            },
            {
              "slug": "exponential-growth",
              "title": "Exponential Growth and Decay",
              "glyph": "a(1 + r)ᵗ",
              "summary": "Exponential functions change by the same percentage each period. Read the growth factor: 1.05 means 5% growth and 0.8 means 20% decay.",
              "points": [
                "Growth factor vs. rate",
                "Linear vs. exponential",
                "Changing the time unit"
              ],
              "aliases": [
                "exponential decay",
                "compound interest",
                "percent growth"
              ]
            },
            {
              "slug": "function-notation",
              "title": "Function Notation and Composition",
              "glyph": "f(g(2))",
              "summary": "f(x) is an output, not multiplication. Composition means working from the inside out, and transformations shift the graph in predictable ways.",
              "points": [
                "Evaluating from tables and graphs",
                "Inside-out composition",
                "Shifts and reflections"
              ],
              "aliases": [
                "functions",
                "composition",
                "transformations"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "problem-solving-data",
      "title": "Problem-Solving and Data Analysis",
      "summary": "Ratios, percentages, data, probability, and statistics.",
      "concepts": [
        {
          "title": "Problem-Solving and Data Analysis",
          "topics": [
            {
              "slug": "percent-change",
              "title": "Percent Change",
              "glyph": "%Δ",
              "summary": "Percent change is (new − old) / old. Stacked percent changes multiply rather than add, and that's where most SAT traps are.",
              "points": [
                "The multiplier method",
                "Successive changes",
                "Percent of vs. percent more than"
              ],
              "aliases": [
                "percentages",
                "percent increase",
                "percent decrease"
              ]
            },
            {
              "slug": "unit-conversion",
              "title": "Rates and Unit Conversion",
              "glyph": "mi/h → ft/s",
              "summary": "Chain the conversion factors so the unwanted units cancel. Writing out the units keeps you from dividing when you should multiply.",
              "points": [
                "Dimensional analysis",
                "Square and cubic units",
                "Density and rate problems"
              ],
              "aliases": [
                "unit conversions",
                "rates",
                "dimensional analysis"
              ]
            },
            {
              "slug": "center-and-spread",
              "title": "Mean, Median, and Spread",
              "glyph": "x̄  σ",
              "summary": "The mean is pulled by outliers and the median isn't. The SAT asks how adding or removing a value changes each one and the standard deviation.",
              "points": [
                "Outliers and the mean",
                "Reading spread",
                "Comparing distributions"
              ],
              "aliases": [
                "mean median mode",
                "standard deviation",
                "statistics",
                "outliers"
              ]
            },
            {
              "slug": "scatterplots-and-models",
              "title": "Scatterplots and Models",
              "summary": "Read scatterplots, lines of best fit, and linear vs. exponential models, and interpret slope and intercept in context.",
              "points": [
                "Line of best fit",
                "Linear vs. exponential growth",
                "Interpreting predictions"
              ],
              "aliases": [
                "scatterplots",
                "line of best fit"
              ]
            },
            {
              "slug": "two-way-tables",
              "title": "Two-Way Tables and Probability",
              "glyph": "P(A | B)",
              "summary": "Conditional probability means restricting to a row or a column first. Find the denominator the question describes before you compute anything.",
              "points": [
                "Finding the right total",
                "Conditional probability",
                "Sampling and inference"
              ],
              "aliases": [
                "probability",
                "conditional probability",
                "contingency table"
              ]
            },
            {
              "slug": "margin-of-error-and-study-design",
              "title": "Margin of Error and Study Design",
              "summary": "Use sample statistics and margin of error to make inferences, and judge which conclusions a study supports.",
              "points": [
                "Margin of error",
                "Random sampling and assignment",
                "Correlation vs. causation"
              ],
              "aliases": [
                "margin of error",
                "statistical claims",
                "study design"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "geometry-trig",
      "title": "Geometry and Trigonometry",
      "summary": "Area, volume, triangles, trigonometry, and circles.",
      "concepts": [
        {
          "title": "Geometry and Trigonometry",
          "topics": [
            {
              "slug": "area-and-volume",
              "title": "Area and Volume",
              "summary": "Use area and volume formulas (on the reference sheet) and see how scaling changes them.",
              "points": [
                "Reference sheet formulas",
                "Composite shapes",
                "Scale factors"
              ],
              "aliases": [
                "area and volume",
                "sat geometry"
              ]
            },
            {
              "slug": "lines-angles-and-triangles",
              "title": "Lines, Angles, and Triangles",
              "summary": "Angle relationships with parallel lines, triangle angle sums, and isosceles and equilateral triangles.",
              "points": [
                "Parallel lines and transversals",
                "Triangle angle sum",
                "Special triangles"
              ],
              "aliases": [
                "lines and angles",
                "triangles sat"
              ]
            },
            {
              "slug": "similar-triangles",
              "title": "Similar Triangles",
              "glyph": "△ ∼ △",
              "summary": "Similar triangles have equal angles and proportional sides. Match corresponding vertices carefully, then set up one proportion.",
              "points": [
                "AA similarity",
                "Setting up proportions",
                "Area scales with k²"
              ],
              "aliases": [
                "similarity",
                "proportional triangles"
              ]
            },
            {
              "slug": "right-triangle-trig",
              "title": "Right Triangle Trigonometry",
              "glyph": "SOH·CAH·TOA",
              "summary": "Sine, cosine, and tangent are ratios of sides. The SAT likes the identity sin(x) = cos(90° − x) and the special 30-60-90 and 45-45-90 triangles.",
              "points": [
                "SOH CAH TOA",
                "Complementary angle identity",
                "Special right triangles"
              ],
              "aliases": [
                "trigonometry",
                "sohcahtoa",
                "special right triangles",
                "trig"
              ]
            },
            {
              "slug": "circle-equations",
              "title": "Equations of Circles",
              "glyph": "(x − h)² + (y − k)²",
              "summary": "A circle centered at (h, k) with radius r is (x − h)² + (y − k)² = r². When it's given expanded, complete the square to find the center.",
              "points": [
                "Reading center and radius",
                "Completing the square twice",
                "Arc length and sectors"
              ],
              "aliases": [
                "circles",
                "equation of a circle",
                "arc length",
                "radians"
              ]
            }
          ]
        }
      ]
    }
  ]
};
