import type { CourseSpec } from "./spec";

/**
 * AP Calculus BC, following the College Board Course and Exam Description: ten units, in order.
 * Topics follow the CED's topic list (closely related CED topics share one lesson topic).
 * Calc AB is derived from this course in build.ts by dropping the BC-only units and topics below.
 */
export const calcBC: CourseSpec = {
  course: {
    slug: "ap-calculus-bc",
    title: "AP Calculus BC",
    shortTitle: "Calc BC",
    exam: "AP",
    category: "Math & Computer Science",
    description:
      "All ten units of the College Board course: limits through infinite series, including everything in AB plus parametric, polar, and vector functions and series.",
    hue: 232,
    examMonth: "May",
    query: "AP Calculus BC",
    keywords: [
      "ap calculus bc",
      "ap calc bc",
      "calc bc",
      "calculus bc",
      "ap calc",
      "calculus",
      "calc",
    ],
  },
  units: [
    {
      slug: "limits-and-continuity",
      title: "Limits and Continuity",
      summary: "What a function approaches, and when it actually gets there.",
      concepts: [
        {
          title: "Limits",
          topics: [
            {
              slug: "introducing-calculus",
              title: "Introducing Calculus: Change at an Instant",
              glyph: "Δy/Δx → ?",
              summary:
                "Calculus starts with a puzzle: how can something change at a single instant? Limits answer it by looking at what average rates approach over smaller and smaller intervals.",
              points: [
                "Average vs. instantaneous change",
                "Why limits are needed",
                "Zooming in on a point",
              ],
              aliases: [
                "introduction to calculus",
                "what is calculus",
                "change at an instant",
              ],
            },
            {
              slug: "limit-definition",
              title: "What a Limit Means",
              glyph: "lim x→a",
              summary:
                "A limit is the value a function approaches as the input gets close to a point. The function never has to reach it, and it doesn't even have to be defined there.",
              points: [
                "Approach, not arrival",
                "Reading limits from graphs and tables",
                "When a limit does not exist",
              ],
              aliases: ["limits", "limit intuition", "limit notation"],
            },
            {
              slug: "estimating-limits",
              title: "Estimating Limits from Graphs and Tables",
              glyph: "x → a⁻, a⁺",
              summary:
                "Read a limit off a graph by tracing toward the point from both sides, or off a table by watching the outputs settle as inputs close in.",
              points: [
                "One-sided limits",
                "When left and right disagree",
                "Tables that approach a value",
              ],
              aliases: [
                "one sided limits",
                "limits from graphs",
                "limits from tables",
                "estimating limits",
              ],
            },
            {
              slug: "limit-laws",
              title: "Finding Limits Algebraically",
              glyph: "(x²−a²)/(x−a)",
              summary:
                "Most limits come from limit laws plus algebra: factor and cancel, rationalize, or simplify complex fractions until direct substitution works.",
              points: [
                "Limit laws",
                "Factoring and canceling",
                "Rationalizing and conjugates",
              ],
              aliases: [
                "limit laws",
                "properties of limits",
                "algebraic limits",
                "evaluating limits",
                "factoring limits",
              ],
            },
            {
              slug: "squeeze-theorem",
              title: "The Squeeze Theorem",
              glyph: "g ≤ f ≤ h",
              summary:
                "If a function is trapped between two functions that approach the same limit, it has to approach that limit too. It's the standard way to prove sin(x)/x → 1.",
              points: [
                "Building the bounds",
                "sin(x)/x as x→0",
                "Writing the justification",
              ],
              aliases: ["sandwich theorem"],
            },
          ],
        },
        {
          title: "Continuity and asymptotes",
          topics: [
            {
              slug: "types-of-discontinuity",
              title: "Types of Discontinuity",
              glyph: "○ ●",
              summary:
                "Discontinuities come in three kinds: removable (a hole), jump, and infinite. Each one breaks a different part of the three-part definition of continuity.",
              points: [
                "The three conditions",
                "Holes vs. jumps vs. asymptotes",
                "Fixing a removable discontinuity",
              ],
              aliases: [
                "removable discontinuity",
                "jump discontinuity",
                "continuity",
              ],
            },
            {
              slug: "continuity",
              title: "Continuity at a Point and on an Interval",
              glyph: "lim f = f(a)",
              summary:
                "A function is continuous at a point when the limit exists, the value exists, and they're equal. Removable discontinuities can be fixed by redefining a single point.",
              points: [
                "The three-part definition",
                "Continuity on an interval",
                "Removing a discontinuity",
              ],
              aliases: [
                "continuity",
                "continuous functions",
                "removable discontinuity",
                "piecewise continuity",
              ],
            },
            {
              slug: "infinite-limits",
              title: "Infinite Limits and Vertical Asymptotes",
              glyph: "→ ±∞",
              summary:
                "When a function grows without bound near a point, its limit is infinite and the graph has a vertical asymptote there.",
              points: [
                "Limits that equal ±∞",
                "Finding vertical asymptotes",
                "Sign analysis near the asymptote",
              ],
              aliases: ["infinite limits", "vertical asymptotes"],
            },
            {
              slug: "limits-at-infinity",
              title: "Limits at Infinity",
              glyph: "x→∞",
              summary:
                "Limits at infinity describe end behavior. For rational functions, compare the highest powers in the numerator and denominator.",
              points: [
                "Horizontal asymptotes",
                "Dominant terms",
                "Growth rates: log < poly < exp",
              ],
              aliases: ["end behavior", "horizontal asymptote"],
            },
            {
              slug: "intermediate-value-theorem",
              title: "Intermediate Value Theorem",
              glyph: "f(c) = k",
              summary:
                "A continuous function on a closed interval takes every value between its endpoint values. The IVT guarantees a solution exists but doesn't tell you where it is.",
              points: [
                "Hypotheses you must state",
                "Existence, not location",
                "Free-response phrasing",
              ],
              aliases: ["IVT"],
            },
          ],
        },
      ],
    },
    {
      slug: "differentiation",
      title: "Differentiation: Definition and Fundamental Properties",
      summary: "What a derivative is, and the basic rules for finding one.",
      concepts: [
        {
          title: "The derivative",
          topics: [
            {
              slug: "average-and-instantaneous-rate",
              title: "Average and Instantaneous Rates of Change",
              glyph: "Δy/Δx",
              summary:
                "Average rate of change is a slope between two points; instantaneous rate is the limit of those slopes as the points come together.",
              points: [
                "Secant line slopes",
                "Difference quotients",
                "From average to instantaneous",
              ],
              aliases: [
                "average rate of change",
                "instantaneous rate of change",
                "secant line",
                "difference quotient",
              ],
            },
            {
              slug: "derivative-definition",
              title: "The Definition of the Derivative",
              glyph: "lim (f(x+h)−f(x))/h",
              summary:
                "The derivative is the limit of the difference quotient. It gives the slope of the tangent line and the instantaneous rate of change.",
              points: [
                "The limit definition",
                "Notation: f′(x), dy/dx",
                "Tangent line equations",
              ],
              aliases: [
                "definition of derivative",
                "limit definition of derivative",
                "derivative notation",
                "tangent line",
              ],
            },
            {
              slug: "estimating-derivatives",
              title: "Estimating Derivatives from Graphs and Tables",
              glyph: "≈ f′(a)",
              summary:
                "When you don't have a formula, estimate a derivative with the slope of a nearby secant line from a table or graph.",
              points: [
                "Symmetric difference quotients",
                "Reading slopes from graphs",
                "Units of a derivative",
              ],
              aliases: [
                "estimating derivatives",
                "derivative from a table",
                "numerical derivative",
              ],
            },
            {
              slug: "differentiability-and-continuity",
              title: "Differentiability and Continuity",
              glyph: "corner ≠ f′",
              summary:
                "Differentiable implies continuous, but not the other way around: corners, cusps, and vertical tangents are continuous but have no derivative.",
              points: [
                "Where derivatives fail",
                "Corners, cusps, vertical tangents",
                "Piecewise differentiability",
              ],
              aliases: [
                "differentiability",
                "differentiable vs continuous",
                "corner cusp",
              ],
            },
          ],
        },
        {
          title: "Derivative rules",
          topics: [
            {
              slug: "power-rule",
              title: "The Power Rule",
              glyph: "nxⁿ⁻¹",
              summary:
                "To differentiate xⁿ, bring the exponent down and subtract one from it. It works for any real exponent, so rewrite roots and fractions as powers first.",
              points: [
                "Rewriting radicals as exponents",
                "Negative and fractional powers",
                "Linearity of the derivative",
              ],
              aliases: ["derivative of x^n", "basic derivatives"],
            },
            {
              slug: "derivatives-of-sin-cos-exp-ln",
              title: "Derivatives of sin x, cos x, eˣ, and ln x",
              glyph: "(eˣ)′ = eˣ",
              summary:
                "Four derivatives to know cold: sin x → cos x, cos x → −sin x, eˣ → eˣ, and ln x → 1/x.",
              points: [
                "sin and cos",
                "eˣ and ln x",
                "Combining with the basic rules",
              ],
              aliases: [
                "derivative of sin",
                "derivative of cos",
                "derivative of e^x",
                "derivative of ln x",
                "derivatives of trig functions",
              ],
            },
            {
              slug: "product-and-quotient-rules",
              title: "Product and Quotient Rules",
              glyph: "f′g + fg′",
              summary:
                "The derivative of a product isn't the product of the derivatives. The product rule and quotient rule tell you how two changing factors combine.",
              points: [
                "Product rule pattern",
                "Low d-high minus high d-low",
                "When to simplify first instead",
              ],
              aliases: ["product rule", "quotient rule"],
            },
            {
              slug: "derivatives-of-tan-sec",
              title: "Derivatives of tan, cot, sec, and csc",
              glyph: "(tan x)′ = sec²x",
              summary:
                "The other four trig derivatives all come from the quotient rule: tan → sec², cot → −csc², sec → sec·tan, csc → −csc·cot.",
              points: [
                "Deriving them with the quotient rule",
                "The pattern of signs",
                "Using them in context",
              ],
              aliases: [
                "derivative of tan",
                "derivative of sec",
                "derivative of csc",
                "derivative of cot",
              ],
            },
          ],
        },
      ],
    },
    {
      slug: "composite-implicit-and-inverse-functions",
      title: "Differentiation: Composite, Implicit, and Inverse Functions",
      summary: "The chain rule and everything it unlocks.",
      concepts: [
        {
          title: "Advanced derivatives",
          topics: [
            {
              slug: "chain-rule",
              title: "Chain Rule",
              glyph: "f(g(x))′",
              summary:
                "The chain rule differentiates a composition. Take the derivative of the outside function, keep the inside the same, then multiply by the derivative of the inside.",
              points: [
                "Spotting the inner function",
                "Outside-in, then multiply",
                "Chains of three or more",
              ],
              aliases: [
                "composite functions",
                "derivative of composition",
                "chain",
              ],
            },
            {
              slug: "implicit-differentiation",
              title: "Implicit Differentiation",
              glyph: "dy/dx",
              summary:
                "When y isn't isolated, differentiate both sides with respect to x and treat y as a function of x. Every y term picks up a dy/dx.",
              points: [
                "Why y gets a dy/dx",
                "Solving for dy/dx",
                "Second derivatives implicitly",
              ],
              aliases: ["implicit", "implicitly defined functions"],
            },
            {
              slug: "inverse-function-derivatives",
              title: "Derivatives of Inverse Functions",
              glyph: "1 / f′(g(x))",
              summary:
                "At corresponding points, the slope of an inverse function is the reciprocal of the original function's slope. Swap the coordinates, then flip the slope.",
              points: [
                "Corresponding points",
                "The reciprocal-slope formula",
                "Inverse trig derivatives",
              ],
              aliases: [
                "inverse derivative",
                "arcsin derivative",
                "inverse trig",
              ],
            },
            {
              slug: "inverse-trig-derivatives",
              title: "Derivatives of Inverse Trig Functions",
              glyph: "(arcsin x)′",
              summary:
                "arcsin, arccos, and arctan have algebraic derivatives: 1/√(1−x²), −1/√(1−x²), and 1/(1+x²).",
              points: [
                "arcsin, arccos, arctan",
                "With the chain rule",
                "Where the formulas come from",
              ],
              aliases: [
                "inverse trig derivatives",
                "derivative of arcsin",
                "derivative of arctan",
              ],
            },
            {
              slug: "choosing-derivative-rules",
              title: "Choosing the Right Derivative Rule",
              glyph: "which rule?",
              summary:
                "Most exam derivatives combine several rules. Read the function from the outside in to decide which rule applies first.",
              points: [
                "Outside-in thinking",
                "Simplify before differentiating",
                "Mixed practice",
              ],
              aliases: [
                "selecting derivative rules",
                "mixed derivatives practice",
              ],
            },
            {
              slug: "higher-order-derivatives",
              title: "Higher-Order Derivatives",
              glyph: "f″(x)",
              summary:
                "The second derivative is the derivative of the derivative. It measures how the rate of change is itself changing.",
              points: [
                "Notation for f″ and beyond",
                "Second derivatives of implicit relations",
                "Meaning in context",
              ],
              aliases: ["second derivative", "higher order derivatives"],
            },
          ],
        },
      ],
    },
    {
      slug: "contextual-applications-of-differentiation",
      title: "Contextual Applications of Differentiation",
      summary:
        "Derivatives as rates in the real world: motion, related rates, and approximation.",
      concepts: [
        {
          title: "Rates in context",
          topics: [
            {
              slug: "derivative-in-context",
              title: "Interpreting the Derivative in Context",
              glyph: "units/time",
              summary:
                "A derivative is a rate with units. Interpreting one means saying what's changing, how fast, in which units, at what moment.",
              points: [
                "Units of a derivative",
                "Writing the interpretation sentence",
                "Sign and meaning",
              ],
              aliases: [
                "interpreting derivatives",
                "derivative in context",
                "meaning of the derivative",
              ],
            },
            {
              slug: "straight-line-motion",
              title: "Position, Velocity, and Acceleration",
              glyph: "s′ = v, v′ = a",
              summary:
                "Velocity is the derivative of position and acceleration is the derivative of velocity. Speed increases when velocity and acceleration share a sign.",
              points: [
                "Velocity and acceleration",
                "Speeding up vs. slowing down",
                "Changing direction",
              ],
              aliases: [
                "position velocity acceleration",
                "particle motion",
                "rectilinear motion",
                "speeding up slowing down",
              ],
            },
            {
              slug: "rates-of-change-in-context",
              title: "Rates of Change in Applied Contexts",
              glyph: "dP/dt",
              summary:
                "Derivatives model rates far beyond motion: population growth, cost, temperature, and any quantity that changes.",
              points: [
                "Reading rate problems",
                "Marginal cost and revenue",
                "Rates from tables",
              ],
              aliases: [
                "rates of change applications",
                "applied rates of change",
              ],
            },
            {
              slug: "related-rates",
              title: "Related Rates",
              glyph: "dV/dt",
              summary:
                "When two quantities are linked by an equation and both change over time, differentiate with respect to t to connect their rates. Plug in the numbers only at the end.",
              points: [
                "Draw, label, relate",
                "Differentiate before substituting",
                "Ladders, cones, and shadows",
              ],
              aliases: ["rates of change", "ladder problem", "cone problem"],
            },
          ],
        },
        {
          title: "Approximation and limits",
          topics: [
            {
              slug: "linearization",
              title: "Local Linearity and Linearization",
              glyph: "L(x) = f(a) + f′(a)(x−a)",
              summary:
                "Up close, a differentiable function looks like its tangent line, so the tangent line gives quick approximations. Concavity tells you if it's an over- or underestimate.",
              points: [
                "The tangent line approximation",
                "Over- or underestimate",
                "Approximating values",
              ],
              aliases: [
                "linear approximation",
                "linearization",
                "tangent line approximation",
                "local linearity",
              ],
            },
            {
              slug: "lhopitals-rule",
              title: "L'Hôpital's Rule",
              glyph: "0/0",
              summary:
                "For indeterminate forms like 0/0 or ∞/∞, the limit of a quotient equals the limit of the quotient of the derivatives. Check the form before you use it.",
              points: [
                "Verify the indeterminate form",
                "Rewriting 0·∞ and 1^∞",
                "Repeated application",
              ],
              aliases: ["lhopital", "l'hospital", "indeterminate forms"],
            },
          ],
        },
      ],
    },
    {
      slug: "analytical-applications-of-differentiation",
      title: "Analytical Applications of Differentiation",
      summary:
        "What derivatives tell you about a graph: extrema, concavity, and optimization.",
      concepts: [
        {
          title: "Theorems and extrema",
          topics: [
            {
              slug: "mean-value-theorem",
              title: "Mean Value Theorem",
              glyph: "f′(c)",
              summary:
                "Somewhere on a smooth interval, the instantaneous rate of change equals the average rate of change. Continuity and differentiability are the entry fee.",
              points: [
                "Secant slope equals tangent slope",
                "Checking the hypotheses",
                "MVT vs. IVT on the exam",
              ],
              aliases: ["MVT", "Rolle's theorem"],
            },
            {
              slug: "extreme-value-theorem",
              title: "Extreme Value Theorem and Critical Points",
              glyph: "f′(c) = 0",
              summary:
                "A continuous function on a closed interval has a max and a min. They happen at critical points, where f′ is zero or undefined, or at the endpoints.",
              points: [
                "The Extreme Value Theorem",
                "Finding critical points",
                "Local vs. global extrema",
              ],
              aliases: [
                "extreme value theorem",
                "critical points",
                "local and absolute extrema",
              ],
            },
            {
              slug: "increasing-and-decreasing",
              title: "Increasing and Decreasing Intervals",
              glyph: "f′ > 0",
              summary:
                "Where f′ is positive the function rises, and where f′ is negative it falls. A sign chart of f′ shows the whole picture.",
              points: [
                "Sign charts of f′",
                "Justifying with the derivative",
                "Reading f′ graphs",
              ],
              aliases: [
                "increasing and decreasing functions",
                "sign chart",
                "first derivative sign",
              ],
            },
            {
              slug: "first-derivative-test",
              title: "The First Derivative Test",
              glyph: "+ → −",
              summary:
                "A local max happens where f′ changes from positive to negative, and a local min where it changes from negative to positive.",
              points: [
                "Sign changes of f′",
                "Writing the justification",
                "When there's no extremum",
              ],
              aliases: [
                "first derivative test",
                "relative extrema",
                "local max and min",
              ],
            },
            {
              slug: "candidates-test",
              title: "Absolute Extrema: The Candidates Test",
              glyph: "max{f(c), f(a), f(b)}",
              summary:
                "To find the absolute max and min on a closed interval, evaluate the function at every critical point and both endpoints, then compare.",
              points: [
                "Listing the candidates",
                "Comparing values",
                "Justifying absolute extrema",
              ],
              aliases: [
                "candidates test",
                "closed interval method",
                "absolute extrema",
                "global max and min",
              ],
            },
          ],
        },
        {
          title: "Concavity and graphs",
          topics: [
            {
              slug: "concavity",
              title: "Concavity and Inflection Points",
              glyph: "f″ > 0 ∪",
              summary:
                "Concave up means f′ is increasing; concave down means f′ is decreasing. Inflection points are where concavity changes.",
              points: [
                "Using f″",
                "Inflection points",
                "Concavity from f′ graphs",
              ],
              aliases: [
                "concavity",
                "inflection points",
                "concave up concave down",
              ],
            },
            {
              slug: "second-derivative-test",
              title: "The Second Derivative Test",
              glyph: "f″(c) < 0 ⇒ max",
              summary:
                "At a critical point, a positive second derivative means a local min and a negative one means a local max. If f″ is zero, the test says nothing.",
              points: [
                "Applying the test",
                "When it fails",
                "First vs. second derivative test",
              ],
              aliases: ["second derivative test"],
            },
            {
              slug: "connecting-f-f-prime-f-double-prime",
              title: "Connecting f, f′, and f″",
              glyph: "f ↔ f′ ↔ f″",
              summary:
                "A favorite exam skill: read one graph and describe the others. Zeros of f′ are candidates for extrema of f, and zeros of f″ for inflection points.",
              points: [
                "Sketching f from f′",
                "Reading f′ graphs",
                "Justifying with the right derivative",
              ],
              aliases: [
                "graphs of f and f prime",
                "sketching derivatives",
                "analyzing graphs",
                "curve sketching",
              ],
            },
            {
              slug: "optimization",
              title: "Optimization",
              glyph: "max / min",
              summary:
                "Optimization problems ask for the biggest or smallest possible value. Write the quantity as a function of one variable, find its critical points, and justify the extremum.",
              points: [
                "Constraint to one variable",
                "Candidates test",
                "Justifying with the first derivative",
              ],
              aliases: ["max min problems", "extrema", "absolute maximum"],
            },
            {
              slug: "implicit-relations-behavior",
              title: "Behavior of Implicit Relations",
              glyph: "dy/dx = 0",
              summary:
                "Implicit differentiation finds where a curve like x² + xy + y² = 7 has horizontal or vertical tangents and how it bends.",
              points: [
                "Horizontal and vertical tangents",
                "Second derivatives implicitly",
                "Analyzing curves",
              ],
              aliases: [
                "implicit relations",
                "horizontal tangent implicit",
                "vertical tangent",
              ],
            },
          ],
        },
      ],
    },
    {
      slug: "integration",
      title: "Integration and Accumulation of Change",
      summary:
        "Adding up rates to find totals, and the Fundamental Theorem that links it all.",
      concepts: [
        {
          title: "Accumulation",
          topics: [
            {
              slug: "accumulation-of-change",
              title: "Accumulation of Change",
              glyph: "rate × time",
              summary:
                "Multiply a rate by time and you get an amount. Area under a rate graph is the total change in the quantity.",
              points: [
                "Area under a rate curve",
                "Units of accumulation",
                "Positive and negative change",
              ],
              aliases: [
                "accumulation",
                "area under a curve",
                "net change",
              ],
            },
            {
              slug: "riemann-sums",
              title: "Riemann Sums",
              glyph: "Σ f(xᵢ)Δx",
              summary:
                "A Riemann sum estimates area with rectangles or trapezoids. As the widths shrink, the sum approaches the definite integral.",
              points: [
                "Left, right, midpoint",
                "Trapezoidal sums",
                "Over- or under-estimate?",
              ],
              aliases: ["rectangles", "trapezoidal rule", "area approximation"],
            },
            {
              slug: "fundamental-theorem-of-calculus",
              title: "Fundamental Theorem of Calculus",
              glyph: "∫ₐᵇ f′ = f(b)−f(a)",
              summary:
                "Differentiation and integration undo each other. Part 1 differentiates an accumulation function; Part 2 evaluates a definite integral with an antiderivative.",
              points: [
                "Accumulation functions",
                "d/dx of an integral with variable bounds",
                "Net change",
              ],
              aliases: ["FTC", "ftc part 1", "ftc part 2"],
            },
            {
              slug: "accumulation-functions",
              title: "Accumulation Functions",
              glyph: "g(x) = ∫ₐˣ f(t) dt",
              summary:
                "A function defined by an integral grows when the integrand is positive and has extrema where the integrand changes sign.",
              points: [
                "Reading accumulation functions",
                "g′(x) = f(x)",
                "Extrema and concavity of g",
              ],
              aliases: [
                "accumulation functions",
                "integral defined functions",
                "ftc part 1",
              ],
            },
            {
              slug: "definite-integral-properties",
              title: "Properties of Definite Integrals",
              glyph: "∫ₐᶜ = ∫ₐᵇ + ∫ᵦᶜ",
              summary:
                "Integrals split across intervals, flip sign when the limits flip, and scale with constants. These properties turn hard integrals into easy ones.",
              points: [
                "Splitting intervals",
                "Reversing limits",
                "Integrals of piecewise functions",
              ],
              aliases: [
                "properties of integrals",
                "definite integral rules",
              ],
            },
          ],
        },
        {
          title: "Antiderivatives",
          topics: [
            {
              slug: "antiderivative-basics",
              title: "Antiderivatives and Indefinite Integrals",
              glyph: "∫xⁿ dx",
              summary:
                "An antiderivative undoes a derivative. Basic rules reverse the power, trig, exponential, and log derivatives, plus a constant of integration.",
              points: [
                "Reverse power rule",
                "Basic trig and exponential integrals",
                "The + C",
              ],
              aliases: [
                "antiderivatives",
                "indefinite integrals",
                "basic integration rules",
              ],
            },
            {
              slug: "u-substitution",
              title: "u-Substitution",
              glyph: "u = g(x)",
              summary:
                "u-substitution is the chain rule run backwards. Choose an inner function whose derivative also appears in the integrand, and the integral gets simpler.",
              points: [
                "Choosing u",
                "Changing the bounds",
                "When it won't work",
              ],
              aliases: ["substitution", "u sub"],
            },
            {
              slug: "long-division-completing-square",
              title: "Integrating with Long Division and Completing the Square",
              glyph: "∫ 1/(x²+2x+5)",
              summary:
                "Some rational integrals need algebra first: divide when the top's degree is high, or complete the square to reach an arctan.",
              points: [
                "Polynomial long division",
                "Completing the square",
                "Ending at arctan or ln",
              ],
              aliases: [
                "integration long division",
                "completing the square integral",
              ],
            },
            {
              slug: "integration-by-parts",
              title: "Integration by Parts",
              glyph: "∫u dv",
              summary:
                "Integration by parts is the product rule run backwards: ∫u dv = uv − ∫v du. Choose u to be the factor that gets simpler when you differentiate it.",
              points: [
                "LIATE as a heuristic",
                "Tabular method",
                "Loops that solve themselves",
              ],
              aliases: ["by parts", "LIATE", "tabular integration"],
            },
            {
              slug: "partial-fractions",
              title: "Partial Fractions",
              glyph: "A/(x−a) + B/(x−b)",
              summary:
                "Split a rational function into simpler fractions that each integrate to a logarithm. BC only tests nonrepeated linear factors.",
              points: [
                "Factoring the denominator",
                "Solving for A and B",
                "Logistic connections",
              ],
              aliases: ["partial fraction decomposition"],
            },
            {
              slug: "improper-integrals",
              title: "Improper Integrals",
              glyph: "∫₁^∞ 1/x² dx",
              summary:
                "An integral with an infinite limit, or an integrand that blows up, is defined as a limit. It converges if that limit is finite.",
              points: [
                "Infinite limits of integration",
                "Infinite discontinuities",
                "Convergence and divergence",
              ],
              aliases: [
                "improper integrals",
                "convergence of integrals",
              ],
            },
            {
              slug: "choosing-integration-techniques",
              title: "Choosing an Integration Technique",
              glyph: "which method?",
              summary:
                "Decide fast: basic rule, substitution, algebra first, or (in BC) parts or partial fractions. The structure of the integrand tells you.",
              points: [
                "Spotting substitutions",
                "When to use algebra first",
                "Mixed practice",
              ],
              aliases: [
                "selecting integration techniques",
                "integration practice",
              ],
            },
          ],
        },
      ],
    },
    {
      slug: "differential-equations",
      title: "Differential Equations",
      summary: "Equations about rates of change, and how to solve them.",
      concepts: [
        {
          title: "Differential equations",
          topics: [
            {
              slug: "modeling-differential-equations",
              title: "Modeling with Differential Equations",
              glyph: "dy/dt = ky",
              summary:
                "A differential equation describes how a quantity changes. You can check a proposed solution by plugging it in.",
              points: [
                "Writing a model from words",
                "Verifying solutions",
                "Reading what an equation says",
              ],
              aliases: [
                "differential equations introduction",
                "modeling differential equations",
                "verifying solutions",
              ],
            },
            {
              slug: "slope-fields",
              title: "Slope Fields",
              glyph: "⟋⟍⟋",
              summary:
                "A slope field shows a differential equation's solutions without solving it. Every tiny segment has the slope dy/dx at that point.",
              points: [
                "Sketching by hand",
                "Matching fields to equations",
                "Tracing a particular solution",
              ],
              aliases: ["direction fields"],
            },
            {
              slug: "eulers-method",
              title: "Euler's Method",
              glyph: "yₙ₊₁ = yₙ + hf′",
              summary:
                "Euler's method approximates a solution by taking small tangent-line steps. Concavity tells you whether each step over- or under-shoots.",
              points: [
                "The step table",
                "Step size tradeoffs",
                "Over or under?",
              ],
              aliases: ["euler method", "numerical approximation"],
            },
            {
              slug: "separation-of-variables",
              title: "Separation of Variables",
              glyph: "dy/y = k dt",
              summary:
                "Get every y on one side and every x on the other, integrate both sides, then use the initial condition to find the constant. It's the most reliable free-response points on the exam.",
              points: [
                "Separating cleanly",
                "+C at the right moment",
                "Solving for y explicitly",
              ],
              aliases: ["separable differential equations", "separable"],
            },
            {
              slug: "exponential-models",
              title: "Exponential Growth and Decay",
              glyph: "y = Ce^{kt}",
              summary:
                "When a quantity changes at a rate proportional to itself, dy/dt = ky, and the solution is exponential growth or decay.",
              points: [
                "dy/dt = ky",
                "Half-life and doubling time",
                "Finding k from data",
              ],
              aliases: [
                "exponential growth and decay",
                "exponential models",
              ],
            },
            {
              slug: "logistic-growth",
              title: "Logistic Growth",
              glyph: "kP(1 − P/L)",
              summary:
                "Logistic models grow fastest at half the carrying capacity and level off at L. You can read a lot from the equation without solving it.",
              points: [
                "Carrying capacity",
                "Fastest growth at L/2",
                "Reading the equation",
              ],
              aliases: ["logistic differential equation", "carrying capacity"],
            },
          ],
        },
      ],
    },
    {
      slug: "applications-of-integration",
      title: "Applications of Integration",
      summary:
        "Using integrals for average value, motion, area, volume, and length.",
      concepts: [
        {
          title: "Accumulation in context",
          topics: [
            {
              slug: "average-value",
              title: "Average Value of a Function",
              glyph: "1/(b−a)∫ f",
              summary:
                "The average value of a function on [a, b] is the integral divided by the interval's length.",
              points: [
                "The formula",
                "Average value vs. average rate of change",
                "In context",
              ],
              aliases: [
                "average value of a function",
                "mean value theorem for integrals",
              ],
            },
            {
              slug: "motion-with-integrals",
              title: "Motion with Integrals",
              glyph: "∫|v(t)| dt",
              summary:
                "Integrate velocity for displacement and integrate speed for total distance. Add the starting position to get where an object ends up.",
              points: [
                "Displacement vs. distance",
                "Position from velocity",
                "Particle motion problems",
              ],
              aliases: [
                "particle motion integrals",
                "total distance traveled",
                "displacement",
              ],
            },
            {
              slug: "integrals-in-context",
              title: "Definite Integrals in Applied Contexts",
              glyph: "∫ rate = amount",
              summary:
                "Rates in, rates out, and net change: integrals answer 'how much' questions about water tanks, populations, and more.",
              points: [
                "Rate in minus rate out",
                "Total change from a rate",
                "Interpreting with units",
              ],
              aliases: [
                "applications of definite integrals",
                "rate in rate out",
                "net change theorem",
              ],
            },
          ],
        },
        {
          title: "Area, volume, and length",
          topics: [
            {
              slug: "area-between-curves",
              title: "Area Between Curves",
              glyph: "∫(top − bottom)",
              summary:
                "The area between two curves is the integral of top minus bottom, or right minus left if you slice horizontally. Find the intersections first.",
              points: [
                "Vertical vs. horizontal slices",
                "Finding bounds",
                "Regions that switch",
              ],
              aliases: ["area between two curves"],
            },
            {
              slug: "volumes-with-cross-sections",
              title: "Volumes with Known Cross Sections",
              glyph: "∫ A(x) dx",
              summary:
                "Slice a solid perpendicular to an axis, find the area of a typical cross section (square, rectangle, triangle, semicircle), and integrate.",
              points: [
                "Square and rectangle cross sections",
                "Triangles and semicircles",
                "Setting up A(x)",
              ],
              aliases: [
                "cross sections volume",
                "volumes of known cross sections",
              ],
            },
            {
              slug: "volumes-of-revolution",
              title: "Volumes of Revolution",
              glyph: "π∫R² − r²",
              summary:
                "Spinning a region around an axis makes a solid. Use disks or washers with slices perpendicular to the axis, and measure each radius from the axis of rotation.",
              points: [
                "Disks and washers",
                "Rotating about y = k",
                "Known cross sections",
              ],
              aliases: ["disk method", "washer method", "cross sections"],
            },
            {
              slug: "arc-length",
              title: "Arc Length",
              glyph: "∫√(1 + (f′)²) dx",
              summary:
                "The length of a curve is the integral of √(1 + (dy/dx)²). For a moving object, it's the total distance traveled.",
              points: [
                "The arc length formula",
                "Setting up the integral",
                "Using a calculator",
              ],
              aliases: ["arc length", "length of a curve"],
            },
          ],
        },
      ],
    },
    {
      slug: "parametric-polar-vector",
      title:
        "Parametric Equations, Polar Coordinates, and Vector-Valued Functions",
      summary:
        "Curves that move: parametric, polar, and vector motion. BC only.",
      concepts: [
        {
          title: "Parametric and vector functions",
          topics: [
            {
              slug: "parametric-derivatives",
              title: "Parametric Derivatives",
              glyph: "(dy/dt)/(dx/dt)",
              summary:
                "For a curve given by x(t) and y(t), the slope is dy/dt divided by dx/dt. The second derivative takes one more careful step.",
              points: [
                "Slope from parametric equations",
                "d²y/dx² without mistakes",
                "Horizontal and vertical tangents",
              ],
              aliases: ["parametric equations", "parametric second derivative"],
            },
            {
              slug: "parametric-arc-length",
              title: "Arc Length of Parametric Curves",
              glyph: "∫√(x′² + y′²) dt",
              summary:
                "The length of a parametric curve is the integral of √((dx/dt)² + (dy/dt)²), which is also the distance a moving particle travels.",
              points: ["The formula", "Distance traveled", "Calculator setup"],
              aliases: ["parametric arc length"],
            },
            {
              slug: "vector-valued-motion",
              title: "Motion with Vectors",
              glyph: "⟨x′(t), y′(t)⟩",
              summary:
                "Position, velocity, and acceleration become vectors. Speed is the magnitude of the velocity vector, and total distance is the integral of speed.",
              points: [
                "Velocity and acceleration vectors",
                "Speed vs. velocity",
                "Arc length as distance",
              ],
              aliases: ["particle motion", "vector functions", "arc length"],
            },
          ],
        },
        {
          title: "Polar coordinates",
          topics: [
            {
              slug: "polar-derivatives",
              title: "Polar Coordinates and Derivatives",
              glyph: "x = r cos θ",
              summary:
                "Polar curves are written r = f(θ). Convert with x = r cos θ and y = r sin θ to find slopes and how r changes.",
              points: [
                "Polar to rectangular",
                "dy/dx for polar curves",
                "dr/dθ and moving away from the origin",
              ],
              aliases: [
                "polar coordinates",
                "polar derivatives",
                "polar curves",
              ],
            },
            {
              slug: "polar-area",
              title: "Area in Polar Coordinates",
              glyph: "½∫r² dθ",
              summary:
                "In polar coordinates, area comes from thin sectors, so the formula is ½∫r² dθ. Getting the θ bounds right is most of the work.",
              points: [
                "Where the formula comes from",
                "Finding θ bounds",
                "Area between two polar curves",
              ],
              aliases: ["polar", "polar curves", "polar area"],
            },
          ],
        },
      ],
    },
    {
      slug: "infinite-series",
      title: "Infinite Sequences and Series",
      summary:
        "When adding infinitely many terms gives a finite answer, and Taylor series. BC only.",
      concepts: [
        {
          title: "Convergence",
          topics: [
            {
              slug: "convergent-and-divergent-series",
              title: "Convergent and Divergent Series",
              glyph: "Σ aₙ",
              summary:
                "A series converges if its partial sums approach a finite number. Otherwise it diverges.",
              points: [
                "Sequences vs. series",
                "Partial sums",
                "What convergence means",
              ],
              aliases: [
                "infinite series",
                "convergence and divergence",
                "partial sums",
              ],
            },
            {
              slug: "geometric-series",
              title: "Geometric Series",
              glyph: "a/(1 − r)",
              summary:
                "A geometric series converges exactly when |r| < 1, and its sum is the first term over 1 − r.",
              points: [
                "Finding a and r",
                "The sum formula",
                "When it diverges",
              ],
              aliases: ["geometric series"],
            },
            {
              slug: "nth-term-test",
              title: "The nth Term Test for Divergence",
              glyph: "aₙ ↛ 0 ⇒ diverges",
              summary:
                "If the terms don't go to zero, the series diverges. If they do, the test tells you nothing.",
              points: [
                "Using the test",
                "Why it can't prove convergence",
                "Common traps",
              ],
              aliases: ["nth term test", "divergence test"],
            },
            {
              slug: "integral-and-comparison-tests",
              title: "Integral and Comparison Tests",
              glyph: "Σ 1/nᵖ",
              summary:
                "Compare an unfamiliar series to one you already know, like a p-series or a geometric series, or to an improper integral. The trick is picking the right comparison.",
              points: [
                "p-series benchmark",
                "Direct vs. limit comparison",
                "Integral test conditions",
              ],
              aliases: ["comparison test", "p-series", "limit comparison"],
            },
            {
              slug: "p-series",
              title: "Harmonic Series and p-Series",
              glyph: "Σ 1/nᵖ",
              summary:
                "A p-series converges when p > 1 and diverges otherwise. The harmonic series, p = 1, diverges.",
              points: [
                "The p-series rule",
                "Why the harmonic series diverges",
                "Using p-series for comparisons",
              ],
              aliases: ["p series", "harmonic series"],
            },
            {
              slug: "alternating-series",
              title: "Alternating Series",
              glyph: "Σ(−1)ⁿbₙ",
              summary:
                "An alternating series converges if its terms shrink to zero in size. The error from stopping early is at most the first term you left out.",
              points: [
                "The two conditions",
                "Alternating series error bound",
                "Absolute vs. conditional",
              ],
              aliases: [
                "alternating series test",
                "AST",
                "conditional convergence",
              ],
            },
            {
              slug: "ratio-test",
              title: "The Ratio Test",
              glyph: "|aₙ₊₁/aₙ|",
              summary:
                "The ratio test compares each term to the one before it. If the limiting ratio is below 1 the series converges; if it equals 1, the test tells you nothing.",
              points: [
                "Factorials and exponentials",
                "The inconclusive case",
                "Setting up radius problems",
              ],
              aliases: ["ratio test series"],
            },
            {
              slug: "absolute-and-conditional-convergence",
              title: "Absolute and Conditional Convergence",
              glyph: "Σ|aₙ|",
              summary:
                "A series converges absolutely if the series of absolute values converges, and conditionally if only the original does.",
              points: [
                "Testing |aₙ|",
                "Conditional convergence",
                "Alternating harmonic series",
              ],
              aliases: [
                "absolute convergence",
                "conditional convergence",
              ],
            },
            {
              slug: "alternating-series-error-bound",
              title: "Alternating Series Error Bound",
              glyph: "|error| ≤ |aₙ₊₁|",
              summary:
                "For an alternating series that passes the test, the error after n terms is no bigger than the first term left out.",
              points: [
                "The bound",
                "How many terms you need",
                "Over- or underestimate",
              ],
              aliases: [
                "alternating series error bound",
                "alternating series remainder",
              ],
            },
          ],
        },
        {
          title: "Taylor and power series",
          topics: [
            {
              slug: "taylor-polynomials",
              title: "Taylor Polynomials",
              glyph: "f⁽ⁿ⁾(a)/n!",
              summary:
                "A Taylor polynomial matches a function's value and derivatives at one point. The more terms you include, the longer it follows the curve.",
              points: [
                "Building from derivatives",
                "Maclaurin series to memorize",
                "Manipulating known series",
              ],
              aliases: ["taylor series", "maclaurin series", "power series"],
            },
            {
              slug: "lagrange-error-bound",
              title: "Lagrange Error Bound",
              glyph: "|Rₙ| ≤ M/(n+1)!",
              summary:
                "The Lagrange error bound caps how far a Taylor polynomial can be from the true value. You need a bound M on the next derivative across the interval.",
              points: [
                "Choosing M",
                "The (n+1) details",
                "Lagrange vs. alternating bound",
              ],
              aliases: ["error bound", "taylor remainder"],
            },
            {
              slug: "radius-of-convergence",
              title: "Radius and Interval of Convergence",
              glyph: "|x − a| < R",
              summary:
                "A power series converges within some radius of its center. Use the ratio test to find the radius, then test each endpoint on its own.",
              points: [
                "Ratio test for radius",
                "Checking endpoints",
                "Interval notation",
              ],
              aliases: ["interval of convergence", "radius"],
            },
            {
              slug: "taylor-and-maclaurin-series",
              title: "Taylor and Maclaurin Series",
              glyph: "Σ f⁽ⁿ⁾(a)/n! (x−a)ⁿ",
              summary:
                "A Taylor series writes a function as an infinite polynomial built from its derivatives at one point. Maclaurin series are centered at 0.",
              points: [
                "Building the series",
                "Series for eˣ, sin x, cos x, 1/(1−x)",
                "Center and general term",
              ],
              aliases: ["taylor series", "maclaurin series"],
            },
            {
              slug: "power-series-representations",
              title: "Representing Functions as Power Series",
              glyph: "1/(1−x) = Σ xⁿ",
              summary:
                "Build new series from known ones by substituting, multiplying, differentiating, or integrating term by term.",
              points: [
                "Substitution into known series",
                "Term-by-term derivatives and integrals",
                "Finding the interval of convergence",
              ],
              aliases: [
                "power series",
                "representing functions as power series",
              ],
            },
          ],
        },
      ],
    },
  ],
};

/** BC-only units (9 and 10). */
export const BC_ONLY_UNITS = new Set([
  "parametric-polar-vector",
  "infinite-series",
]);
/** BC-only topics inside units shared with AB. */
export const BC_ONLY_TOPICS = new Set([
  "integration-by-parts",
  "partial-fractions",
  "improper-integrals",
  "eulers-method",
  "logistic-growth",
  "arc-length",
]);
