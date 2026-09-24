import type { CourseSpec } from "./spec";

export const calcBC: CourseSpec = {
  course: {
    slug: "ap-calculus-bc",
    title: "AP Calculus BC",
    shortTitle: "Calc BC",
    exam: "AP",
    category: "Math & Computer Science",
    description:
      "Limits through infinite series. Everything in AB, plus parametric, polar, and vector motion, and the series unit that decides most 5s.",
    hue: 232,
    examMonth: "May",
    query: "AP Calculus BC",
    keywords: ["ap calculus bc", "ap calc bc", "calc bc", "calculus bc", "ap calc", "calculus", "calc"],
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
              slug: "limit-definition",
              title: "What a Limit Means",
              glyph: "lim x→a",
              summary:
                "A limit is the value a function approaches as the input gets close to a point. The function never has to reach it, and it doesn't even have to be defined there.",
              points: ["Approach, not arrival", "Reading limits from graphs and tables", "When a limit does not exist"],
              aliases: ["limits", "limit intuition", "limit notation"],
            },
            {
              slug: "limits-at-infinity",
              title: "Limits at Infinity",
              glyph: "x→∞",
              summary:
                "Limits at infinity describe end behavior. For rational functions, compare the highest powers in the numerator and denominator.",
              points: ["Horizontal asymptotes", "Dominant terms", "Growth rates: log < poly < exp"],
              aliases: ["end behavior", "horizontal asymptote"],
            },
            {
              slug: "squeeze-theorem",
              title: "The Squeeze Theorem",
              glyph: "g ≤ f ≤ h",
              summary:
                "If a function is trapped between two functions that approach the same limit, it has to approach that limit too. It's the standard way to prove sin(x)/x → 1.",
              points: ["Building the bounds", "sin(x)/x as x→0", "Writing the justification"],
              aliases: ["sandwich theorem"],
            },
          ],
        },
        {
          title: "Continuity",
          topics: [
            {
              slug: "types-of-discontinuity",
              title: "Types of Discontinuity",
              glyph: "○ ●",
              summary:
                "Discontinuities come in three kinds: removable (a hole), jump, and infinite. Each one breaks a different part of the three-part definition of continuity.",
              points: ["The three conditions", "Holes vs. jumps vs. asymptotes", "Fixing a removable discontinuity"],
              aliases: ["removable discontinuity", "jump discontinuity", "continuity"],
            },
            {
              slug: "intermediate-value-theorem",
              title: "Intermediate Value Theorem",
              glyph: "f(c) = k",
              summary:
                "A continuous function on a closed interval takes every value between its endpoint values. The IVT guarantees a solution exists but doesn't tell you where it is.",
              points: ["Hypotheses you must state", "Existence, not location", "Free-response phrasing"],
              aliases: ["IVT"],
            },
          ],
        },
      ],
    },
    {
      slug: "differentiation",
      title: "Differentiation",
      summary: "Rates of change, and the rules that make them fast to compute.",
      concepts: [
        {
          title: "Derivative Rules",
          topics: [
            {
              slug: "power-rule",
              title: "The Power Rule",
              glyph: "nxⁿ⁻¹",
              summary:
                "To differentiate xⁿ, bring the exponent down and subtract one from it. It works for any real exponent, so rewrite roots and fractions as powers first.",
              points: ["Rewriting radicals as exponents", "Negative and fractional powers", "Linearity of the derivative"],
              aliases: ["derivative of x^n", "basic derivatives"],
            },
            {
              slug: "product-and-quotient-rules",
              title: "Product and Quotient Rules",
              glyph: "f′g + fg′",
              summary:
                "The derivative of a product isn't the product of the derivatives. The product rule and quotient rule tell you how two changing factors combine.",
              points: ["Product rule pattern", "Low d-high minus high d-low", "When to simplify first instead"],
              aliases: ["product rule", "quotient rule"],
            },
            {
              slug: "chain-rule",
              title: "Chain Rule",
              glyph: "f(g(x))′",
              summary:
                "The chain rule differentiates a composition. Take the derivative of the outside function, keep the inside the same, then multiply by the derivative of the inside.",
              points: ["Spotting the inner function", "Outside-in, then multiply", "Chains of three or more"],
              aliases: ["composite functions", "derivative of composition", "chain"],
            },
          ],
        },
        {
          title: "Implicit and Inverse Differentiation",
          topics: [
            {
              slug: "implicit-differentiation",
              title: "Implicit Differentiation",
              glyph: "dy/dx",
              summary:
                "When y isn't isolated, differentiate both sides with respect to x and treat y as a function of x. Every y term picks up a dy/dx.",
              points: ["Why y gets a dy/dx", "Solving for dy/dx", "Second derivatives implicitly"],
              aliases: ["implicit", "implicitly defined functions"],
            },
            {
              slug: "inverse-function-derivatives",
              title: "Derivatives of Inverse Functions",
              glyph: "1 / f′(g(x))",
              summary:
                "At corresponding points, the slope of an inverse function is the reciprocal of the original function's slope. Swap the coordinates, then flip the slope.",
              points: ["Corresponding points", "The reciprocal-slope formula", "Inverse trig derivatives"],
              aliases: ["inverse derivative", "arcsin derivative", "inverse trig"],
            },
          ],
        },
        {
          title: "Applications of Derivatives",
          topics: [
            {
              slug: "related-rates",
              title: "Related Rates",
              glyph: "dV/dt",
              summary:
                "When two quantities are linked by an equation and both change over time, differentiate with respect to t to connect their rates. Plug in the numbers only at the end.",
              points: ["Draw, label, relate", "Differentiate before substituting", "Ladders, cones, and shadows"],
              aliases: ["rates of change", "ladder problem", "cone problem"],
            },
            {
              slug: "mean-value-theorem",
              title: "Mean Value Theorem",
              glyph: "f′(c)",
              summary:
                "Somewhere on a smooth interval, the instantaneous rate of change equals the average rate of change. Continuity and differentiability are the entry fee.",
              points: ["Secant slope equals tangent slope", "Checking the hypotheses", "MVT vs. IVT on the exam"],
              aliases: ["MVT", "Rolle's theorem"],
            },
            {
              slug: "optimization",
              title: "Optimization",
              glyph: "max / min",
              summary:
                "Optimization problems ask for the biggest or smallest possible value. Write the quantity as a function of one variable, find its critical points, and justify the extremum.",
              points: ["Constraint to one variable", "Candidates test", "Justifying with the first derivative"],
              aliases: ["max min problems", "extrema", "absolute maximum"],
            },
            {
              slug: "lhopitals-rule",
              title: "L'Hôpital's Rule",
              glyph: "0/0",
              summary:
                "For indeterminate forms like 0/0 or ∞/∞, the limit of a quotient equals the limit of the quotient of the derivatives. Check the form before you use it.",
              points: ["Verify the indeterminate form", "Rewriting 0·∞ and 1^∞", "Repeated application"],
              aliases: ["lhopital", "l'hospital", "indeterminate forms"],
            },
          ],
        },
      ],
    },
    {
      slug: "integration",
      title: "Integration and Accumulation",
      summary: "Adding up infinitely many tiny pieces, and how that connects back to derivatives.",
      concepts: [
        {
          title: "Accumulation",
          topics: [
            {
              slug: "riemann-sums",
              title: "Riemann Sums",
              glyph: "Σ f(xᵢ)Δx",
              summary:
                "A Riemann sum estimates area with rectangles or trapezoids. As the widths shrink, the sum approaches the definite integral.",
              points: ["Left, right, midpoint", "Trapezoidal sums", "Over- or under-estimate?"],
              aliases: ["rectangles", "trapezoidal rule", "area approximation"],
            },
            {
              slug: "fundamental-theorem-of-calculus",
              title: "Fundamental Theorem of Calculus",
              glyph: "∫ₐᵇ f′ = f(b)−f(a)",
              summary:
                "Differentiation and integration undo each other. Part 1 differentiates an accumulation function; Part 2 evaluates a definite integral with an antiderivative.",
              points: ["Accumulation functions", "d/dx of an integral with variable bounds", "Net change"],
              aliases: ["FTC", "ftc part 1", "ftc part 2"],
            },
          ],
        },
        {
          title: "Integration Techniques",
          topics: [
            {
              slug: "u-substitution",
              title: "u-Substitution",
              glyph: "u = g(x)",
              summary:
                "u-substitution is the chain rule run backwards. Choose an inner function whose derivative also appears in the integrand, and the integral gets simpler.",
              points: ["Choosing u", "Changing the bounds", "When it won't work"],
              aliases: ["substitution", "u sub"],
            },
            {
              slug: "integration-by-parts",
              title: "Integration by Parts",
              glyph: "∫u dv",
              summary:
                "Integration by parts is the product rule run backwards: ∫u dv = uv − ∫v du. Choose u to be the factor that gets simpler when you differentiate it.",
              points: ["LIATE as a heuristic", "Tabular method", "Loops that solve themselves"],
              aliases: ["by parts", "LIATE", "tabular integration"],
            },
            {
              slug: "partial-fractions",
              title: "Partial Fractions",
              glyph: "A/(x−a) + B/(x−b)",
              summary:
                "Split a rational function into simpler fractions that each integrate to a logarithm. BC only tests nonrepeated linear factors.",
              points: ["Factoring the denominator", "Solving for A and B", "Logistic connections"],
              aliases: ["partial fraction decomposition"],
            },
          ],
        },
        {
          title: "Applications of Integration",
          topics: [
            {
              slug: "area-between-curves",
              title: "Area Between Curves",
              glyph: "∫(top − bottom)",
              summary:
                "The area between two curves is the integral of top minus bottom, or right minus left if you slice horizontally. Find the intersections first.",
              points: ["Vertical vs. horizontal slices", "Finding bounds", "Regions that switch"],
              aliases: ["area between two curves"],
            },
            {
              slug: "volumes-of-revolution",
              title: "Volumes of Revolution",
              glyph: "π∫R² − r²",
              summary:
                "Spinning a region around an axis makes a solid. Use disks or washers with slices perpendicular to the axis, and measure each radius from the axis of rotation.",
              points: ["Disks and washers", "Rotating about y = k", "Known cross sections"],
              aliases: ["disk method", "washer method", "cross sections"],
            },
          ],
        },
      ],
    },
    {
      slug: "differential-equations",
      title: "Differential Equations",
      summary: "Equations about rates, and the functions that satisfy them.",
      concepts: [
        {
          title: "Modeling with Differential Equations",
          topics: [
            {
              slug: "slope-fields",
              title: "Slope Fields",
              glyph: "⟋⟍⟋",
              summary:
                "A slope field shows a differential equation's solutions without solving it. Every tiny segment has the slope dy/dx at that point.",
              points: ["Sketching by hand", "Matching fields to equations", "Tracing a particular solution"],
              aliases: ["direction fields"],
            },
            {
              slug: "separation-of-variables",
              title: "Separation of Variables",
              glyph: "dy/y = k dt",
              summary:
                "Get every y on one side and every x on the other, integrate both sides, then use the initial condition to find the constant. It's the most reliable free-response points on the exam.",
              points: ["Separating cleanly", "+C at the right moment", "Solving for y explicitly"],
              aliases: ["separable differential equations", "separable"],
            },
            {
              slug: "eulers-method",
              title: "Euler's Method",
              glyph: "yₙ₊₁ = yₙ + hf′",
              summary:
                "Euler's method approximates a solution by taking small tangent-line steps. Concavity tells you whether each step over- or under-shoots.",
              points: ["The step table", "Step size tradeoffs", "Over or under?"],
              aliases: ["euler method", "numerical approximation"],
            },
            {
              slug: "logistic-growth",
              title: "Logistic Growth",
              glyph: "kP(1 − P/L)",
              summary:
                "Logistic models grow fastest at half the carrying capacity and level off at L. You can read a lot from the equation without solving it.",
              points: ["Carrying capacity", "Fastest growth at L/2", "Reading the equation"],
              aliases: ["logistic differential equation", "carrying capacity"],
            },
          ],
        },
      ],
    },
    {
      slug: "parametric-polar-vector",
      title: "Parametric, Polar, and Vector Functions",
      summary: "Curves described by time, by angle, and by direction.",
      concepts: [
        {
          title: "Parametric and Vector Motion",
          topics: [
            {
              slug: "parametric-derivatives",
              title: "Parametric Derivatives",
              glyph: "(dy/dt)/(dx/dt)",
              summary:
                "For a curve given by x(t) and y(t), the slope is dy/dt divided by dx/dt. The second derivative takes one more careful step.",
              points: ["Slope from parametric equations", "d²y/dx² without mistakes", "Horizontal and vertical tangents"],
              aliases: ["parametric equations", "parametric second derivative"],
            },
            {
              slug: "vector-valued-motion",
              title: "Motion with Vectors",
              glyph: "⟨x′(t), y′(t)⟩",
              summary:
                "Position, velocity, and acceleration become vectors. Speed is the magnitude of the velocity vector, and total distance is the integral of speed.",
              points: ["Velocity and acceleration vectors", "Speed vs. velocity", "Arc length as distance"],
              aliases: ["particle motion", "vector functions", "arc length"],
            },
          ],
        },
        {
          title: "Polar Curves",
          topics: [
            {
              slug: "polar-area",
              title: "Area in Polar Coordinates",
              glyph: "½∫r² dθ",
              summary:
                "In polar coordinates, area comes from thin sectors, so the formula is ½∫r² dθ. Getting the θ bounds right is most of the work.",
              points: ["Where the formula comes from", "Finding θ bounds", "Area between two polar curves"],
              aliases: ["polar", "polar curves", "polar area"],
            },
          ],
        },
      ],
    },
    {
      slug: "infinite-series",
      title: "Infinite Sequences and Series",
      summary: "When adding infinitely many terms gives a finite answer, and how to use that.",
      concepts: [
        {
          title: "Convergence Tests",
          topics: [
            {
              slug: "ratio-test",
              title: "The Ratio Test",
              glyph: "|aₙ₊₁/aₙ|",
              summary:
                "The ratio test compares each term to the one before it. If the limiting ratio is below 1 the series converges; if it equals 1, the test tells you nothing.",
              points: ["Factorials and exponentials", "The inconclusive case", "Setting up radius problems"],
              aliases: ["ratio test series"],
            },
            {
              slug: "alternating-series",
              title: "Alternating Series",
              glyph: "Σ(−1)ⁿbₙ",
              summary:
                "An alternating series converges if its terms shrink to zero in size. The error from stopping early is at most the first term you left out.",
              points: ["The two conditions", "Alternating series error bound", "Absolute vs. conditional"],
              aliases: ["alternating series test", "AST", "conditional convergence"],
            },
            {
              slug: "integral-and-comparison-tests",
              title: "Integral and Comparison Tests",
              glyph: "Σ 1/nᵖ",
              summary:
                "Compare an unfamiliar series to one you already know, like a p-series or a geometric series, or to an improper integral. The trick is picking the right comparison.",
              points: ["p-series benchmark", "Direct vs. limit comparison", "Integral test conditions"],
              aliases: ["comparison test", "p-series", "limit comparison"],
            },
          ],
        },
        {
          title: "Taylor and Maclaurin Series",
          topics: [
            {
              slug: "taylor-polynomials",
              title: "Taylor Polynomials",
              glyph: "f⁽ⁿ⁾(a)/n!",
              summary:
                "A Taylor polynomial matches a function's value and derivatives at one point. The more terms you include, the longer it follows the curve.",
              points: ["Building from derivatives", "Maclaurin series to memorize", "Manipulating known series"],
              aliases: ["taylor series", "maclaurin series", "power series"],
            },
            {
              slug: "lagrange-error-bound",
              title: "Lagrange Error Bound",
              glyph: "|Rₙ| ≤ M/(n+1)!",
              summary:
                "The Lagrange error bound caps how far a Taylor polynomial can be from the true value. You need a bound M on the next derivative across the interval.",
              points: ["Choosing M", "The (n+1) details", "Lagrange vs. alternating bound"],
              aliases: ["error bound", "taylor remainder"],
            },
            {
              slug: "radius-of-convergence",
              title: "Radius and Interval of Convergence",
              glyph: "|x − a| < R",
              summary:
                "A power series converges within some radius of its center. Use the ratio test to find the radius, then test each endpoint on its own.",
              points: ["Ratio test for radius", "Checking endpoints", "Interval notation"],
              aliases: ["interval of convergence", "radius"],
            },
          ],
        },
      ],
    },
  ],
};
