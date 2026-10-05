import type { CourseSpec } from "../spec";

/**
 * AP Precalculus, following the College Board Course and Exam Description (units and topics in CED order).
 */
export const precalc: CourseSpec = {
  "course": {
    "slug": "ap-precalculus",
    "title": "AP Precalculus",
    "shortTitle": "Precalc",
    "exam": "AP",
    "category": "Math & Computer Science",
    "description": "Functions as models of change: polynomial, rational, exponential, logarithmic, trigonometric, and polar, plus parameters, vectors, and matrices.",
    "hue": 250,
    "examMonth": "May",
    "query": "AP Precalculus",
    "keywords": [
      "ap precalc",
      "ap precalculus",
      "precalculus",
      "precalc",
      "pre calc"
    ]
  },
  "units": [
    {
      "slug": "polynomial-and-rational-functions",
      "title": "Polynomial and Rational Functions",
      "summary": "Rates of change, polynomials, rational functions, and modeling.",
      "concepts": [
        {
          "title": "Polynomial and Rational Functions",
          "topics": [
            {
              "slug": "rates-of-change",
              "title": "Rates of Change",
              "summary": "Average rate of change is the slope between two points; a function is increasing or decreasing when that rate is positive or negative.",
              "aliases": [
                "average rate of change"
              ]
            },
            {
              "slug": "polynomial-functions-and-their-zeros",
              "title": "Polynomial Functions and Their Zeros",
              "summary": "The degree and leading coefficient set a polynomial's end behavior, and its real zeros are where the graph meets the x-axis.",
              "aliases": [
                "zeros of polynomials",
                "end behavior",
                "multiplicity"
              ]
            },
            {
              "slug": "end-behavior-of-polynomial-and-rational-functions",
              "title": "End Behavior of Polynomial and Rational Functions",
              "summary": "The leading terms decide what happens as x → ±∞: polynomials rise or fall, and rational functions level off or grow.",
              "points": [
                "Leading-term behavior",
                "Horizontal and slant asymptotes",
                "Comparing degrees"
              ],
              "aliases": [
                "end behavior"
              ]
            },
            {
              "slug": "rational-functions-and-asymptotes",
              "title": "Rational Functions and Asymptotes",
              "summary": "Rational functions have vertical asymptotes where the denominator is zero and holes where factors cancel.",
              "aliases": [
                "vertical asymptote",
                "horizontal asymptote",
                "holes"
              ]
            },
            {
              "slug": "equivalent-representations-and-long-division",
              "title": "Equivalent Representations and Long Division",
              "summary": "Rewrite polynomial and rational expressions by factoring, long division, and the binomial theorem to reveal key features.",
              "points": [
                "Polynomial long division",
                "Factoring",
                "Binomial theorem"
              ],
              "aliases": [
                "polynomial long division",
                "binomial theorem"
              ]
            },
            {
              "slug": "transformations-of-functions",
              "title": "Transformations of Functions",
              "summary": "Shifts, stretches, and reflections change a parent graph in predictable ways depending on whether the change is inside or outside the function.",
              "aliases": [
                "function transformations",
                "shifts and stretches"
              ]
            },
            {
              "slug": "function-model-selection",
              "title": "Function Model Selection",
              "summary": "Choose a linear, quadratic, cubic, or other model by looking at how the data's rates of change behave.",
              "aliases": [
                "modeling with functions",
                "regression"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "exponential-and-logarithmic-functions",
      "title": "Exponential and Logarithmic Functions",
      "summary": "Sequences, exponentials, logarithms, and data modeling.",
      "concepts": [
        {
          "title": "Exponential and Logarithmic Functions",
          "topics": [
            {
              "slug": "arithmetic-and-geometric-sequences",
              "title": "Arithmetic and Geometric Sequences",
              "summary": "Arithmetic sequences add a constant difference; geometric sequences multiply by a constant ratio.",
              "aliases": [
                "sequences"
              ]
            },
            {
              "slug": "exponential-functions",
              "title": "Exponential Functions",
              "summary": "Exponential functions grow by equal factors over equal intervals, which is why they eventually outrun any polynomial.",
              "aliases": [
                "exponential growth",
                "exponential decay"
              ]
            },
            {
              "slug": "exponential-modeling-and-model-validation",
              "title": "Exponential Modeling and Model Validation",
              "summary": "Fit exponential models to data and check them with residuals; compare linear and exponential fits.",
              "points": [
                "Exponential regression",
                "Residual plots",
                "Choosing between models"
              ],
              "aliases": [
                "exponential modeling",
                "residuals"
              ]
            },
            {
              "slug": "composition-and-inverse-functions",
              "title": "Composition and Inverse Functions",
              "summary": "An inverse undoes a function, swapping inputs and outputs; composition feeds one function's output into another.",
              "aliases": [
                "inverse functions",
                "function composition"
              ]
            },
            {
              "slug": "logarithmic-functions",
              "title": "Logarithmic Functions",
              "summary": "A logarithm is the inverse of an exponential: log base b of x is the exponent you raise b to in order to get x.",
              "aliases": [
                "logarithms",
                "log rules",
                "properties of logarithms"
              ]
            },
            {
              "slug": "exponential-and-logarithmic-equations",
              "title": "Exponential and Logarithmic Equations",
              "summary": "Solve exponential equations by taking logs of both sides, and logarithmic equations by rewriting them as exponentials.",
              "aliases": [
                "solving log equations"
              ]
            },
            {
              "slug": "semi-log-plots",
              "title": "Semi-log Plots",
              "summary": "On a semi-log plot, exponential data looks linear, which makes growth rates easy to read.",
              "aliases": [
                "semi log",
                "logarithmic scale"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "trigonometric-and-polar-functions",
      "title": "Trigonometric and Polar Functions",
      "summary": "Periodic functions, sinusoids, trig equations, and polar graphs.",
      "concepts": [
        {
          "title": "Trigonometric and Polar Functions",
          "topics": [
            {
              "slug": "periodic-phenomena-and-the-unit-circle",
              "title": "Periodic Phenomena and the Unit Circle",
              "summary": "Sine and cosine come from coordinates on the unit circle, which is why they repeat every 2π.",
              "aliases": [
                "unit circle",
                "radians"
              ]
            },
            {
              "slug": "sine-and-cosine-graphs",
              "title": "Sine and Cosine Graphs",
              "summary": "Amplitude, period, phase shift, and vertical shift describe every sinusoidal graph.",
              "aliases": [
                "sinusoidal functions",
                "amplitude period phase shift"
              ]
            },
            {
              "slug": "sinusoidal-models",
              "title": "Sinusoidal Models",
              "summary": "Model periodic data like tides and temperatures with f(t) = a sin(b(t + c)) + d, reading amplitude, period, and midline from context.",
              "points": [
                "Amplitude, period, phase shift",
                "Midline",
                "Fitting a sinusoid to data"
              ],
              "aliases": [
                "sinusoidal models"
              ]
            },
            {
              "slug": "tangent-and-inverse-trig-functions",
              "title": "Tangent and Inverse Trig Functions",
              "summary": "Tangent is sine over cosine and has vertical asymptotes; inverse trig functions return angles on restricted domains.",
              "aliases": [
                "tangent function",
                "arcsin",
                "inverse trigonometric functions"
              ]
            },
            {
              "slug": "trigonometric-equations-and-identities",
              "title": "Trigonometric Equations and Identities",
              "summary": "Use identities like sin² + cos² = 1 to rewrite and solve trig equations over an interval.",
              "aliases": [
                "trig identities",
                "pythagorean identity",
                "solving trig equations"
              ]
            },
            {
              "slug": "secant-cosecant-and-cotangent",
              "title": "Secant, Cosecant, and Cotangent",
              "summary": "The reciprocal trig functions and their graphs, with vertical asymptotes where the original function is zero.",
              "points": [
                "Reciprocal identities",
                "Graphs and asymptotes",
                "Pythagorean identities"
              ],
              "aliases": [
                "secant cosecant cotangent"
              ]
            },
            {
              "slug": "polar-coordinates-and-graphs",
              "title": "Polar Coordinates and Graphs",
              "summary": "Polar coordinates locate points by distance and angle, and polar graphs show how r changes as θ turns.",
              "aliases": [
                "polar coordinates",
                "polar graphs",
                "rose curves"
              ]
            },
            {
              "slug": "rates-of-change-in-polar-functions",
              "title": "Rates of Change in Polar Functions",
              "summary": "As θ changes, r grows or shrinks; where r is positive and increasing, the curve moves away from the pole.",
              "points": [
                "Increasing and decreasing r",
                "Distance from the pole",
                "Average rate of change"
              ],
              "aliases": [
                "polar rates of change"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "functions-involving-parameters-vectors-and-matrices",
      "title": "Functions Involving Parameters, Vectors, and Matrices",
      "summary": "Parametric functions, conics, vectors, and matrices. Not assessed on the AP exam.",
      "concepts": [
        {
          "title": "Functions Involving Parameters, Vectors, and Matrices",
          "topics": [
            {
              "slug": "parametric-functions",
              "title": "Parametric Functions",
              "summary": "Parametric equations give x and y separately in terms of t, tracing motion along a path.",
              "aliases": [
                "parametric equations"
              ]
            },
            {
              "slug": "implicitly-defined-functions-and-conic-sections",
              "title": "Implicitly Defined Functions and Conic Sections",
              "summary": "Circles, ellipses, parabolas, and hyperbolas are defined by equations in x and y rather than y = f(x).",
              "aliases": [
                "conic sections",
                "ellipse",
                "hyperbola"
              ]
            },
            {
              "slug": "vectors",
              "title": "Vectors",
              "summary": "A vector has magnitude and direction; add them tip to tail and scale them by multiplying.",
              "aliases": [
                "vectors",
                "dot product"
              ]
            },
            {
              "slug": "matrices-and-linear-transformations",
              "title": "Matrices and Linear Transformations",
              "summary": "A matrix can represent a transformation of the plane, and its determinant tells you how areas scale.",
              "aliases": [
                "matrices",
                "determinant",
                "matrix multiplication",
                "inverse matrix"
              ]
            },
            {
              "slug": "matrices-as-functions-and-models",
              "title": "Matrices as Functions and Models",
              "summary": "Matrices transform vectors (rotations, dilations, reflections) and model change over time, like Markov chains.",
              "points": [
                "Inverse and determinant",
                "Composing transformations",
                "Transition matrices"
              ],
              "aliases": [
                "matrix inverse",
                "transition matrix"
              ]
            }
          ]
        }
      ]
    }
  ]
};
