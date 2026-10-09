import { hsPair } from "./outline";

/**
 * Precalculus and Honors Precalculus, in the order most precalculus textbooks follow (Larson,
 * Sullivan, Blitzer): functions, polynomial and rational functions, exponentials and logarithms,
 * trigonometry, trigonometric identities and equations, triangle trigonometry, conics, and
 * sequences. Honors adds vectors, polar and parametric equations, matrices, and limits.
 */
export const [precalculus, honorsPrecalculus] = hsPair(
  {
    slug: "precalculus",
    title: "Precalculus",
    shortTitle: "Precalc",
    category: "Math & Computer Science",
    hue: 262,
    grades: "Grade 11 or 12",
    description: "Functions of every kind, trigonometry and identities, conic sections, and sequences: everything you need before calculus.",
    keywords: ["precalculus", "pre calculus", "precalc", "pre calc"],
  },
  {
    slug: "honors-precalculus",
    title: "Honors Precalculus",
    shortTitle: "Hon. Precalc",
    hue: 255,
    grades: "Grade 10 or 11",
    description: "Everything in Precalculus at a faster pace, plus vectors, polar and parametric equations, matrices, and an introduction to limits.",
    keywords: ["honors precalculus", "honors precalc", "precalculus honors", "hon precalc"],
  },
  `
# Functions and Their Graphs | Function language, transformations, and building new functions from old.
- Functions and Their Properties | Domain, range, continuity, symmetry, and intervals of increase and decrease. | Domain and range; Even and odd functions; Increasing and decreasing | properties of functions; even and odd functions
- Average Rate of Change | The slope between two points on a graph measures how fast a function changes. | Difference quotient; Secant lines; Interpreting rates | average rate of change; difference quotient
- Parent Functions and Transformations | Shifts, stretches, and reflections of the basic functions. | Parent functions; Shifts and reflections; Stretches | transformations of functions
- Combining and Composing Functions | Functions can be added, multiplied, divided, and composed. | Arithmetic of functions; Composition; Decomposing functions | composition of functions
- Inverse Functions | One-to-one functions have inverses whose graphs reflect over y = x. | Horizontal line test; Finding inverses; Verifying with composition | inverse functions
- Piecewise Functions and Continuity | Piecewise functions can be continuous or jump at their boundaries. | Graphing piecewise functions; Continuity; Step functions | piecewise functions

# Polynomial and Rational Functions | Zeros, end behavior, and asymptotes.
- Quadratic Functions and Models | Vertex form and modeling with parabolas. | Vertex form; Maximum and minimum problems; Quadratic regression | quadratic functions
- Polynomial Functions and Their Graphs | End behavior, zeros, multiplicity, and turning points. | End behavior; Multiplicity; Intermediate value theorem | polynomial functions; end behavior
- Dividing Polynomials | Long and synthetic division, and the remainder and factor theorems. | Synthetic division; Remainder theorem; Factor theorem | synthetic division; dividing polynomials
- Real and Complex Zeros | The Rational Zero Theorem and the Fundamental Theorem of Algebra find all zeros. | Rational zero theorem; Complex conjugate zeros; Linear factorization | zeros of polynomial functions; rational zero theorem
- Rational Functions and Asymptotes | Vertical, horizontal, and slant asymptotes and holes shape a rational graph. | Vertical asymptotes and holes; Horizontal asymptotes; Slant asymptotes | rational functions; asymptotes
- Polynomial and Rational Inequalities | Sign charts solve inequalities involving polynomials and rational expressions. | Critical values; Sign charts; Interval notation | polynomial inequalities; rational inequalities

# Exponential and Logarithmic Functions | Exponential growth, logarithms, and modeling.
- Exponential Functions | Exponential functions, the number e, and their graphs. | Graphs and asymptotes; The number e; Compound interest | exponential functions
- Logarithmic Functions | Logarithms are inverses of exponentials. | Converting forms; Common and natural logs; Graphs | logarithmic functions
- Properties of Logarithms | Product, quotient, and power rules, and change of base. | Expanding and condensing; Change of base; Simplifying | properties of logarithms; log rules
- Exponential and Logarithmic Equations | Solving equations with exponents and logs. | Taking logs of both sides; Exponential form; Extraneous solutions | solving exponential and logarithmic equations
- Exponential and Logarithmic Models | Growth, decay, Newton's law of cooling, and logistic models. | Half-life; Newton's law of cooling; Logistic growth | exponential models; logistic growth

# Trigonometric Functions | Radians, the unit circle, and graphs of the six trig functions.
- Angles and Radian Measure | Radians, coterminal angles, arc length, and angular speed. | Degrees and radians; Arc length; Linear and angular speed | radian measure; arc length; angular velocity
- Right Triangle Trigonometry | The six trig ratios and special right triangles. | Six trig ratios; Special angles; Cofunctions | right triangle trigonometry
- Trig Functions on the Unit Circle | Reference angles and the unit circle define trig functions for every real number. | Unit circle values; Reference angles; Signs by quadrant | unit circle; trig functions of any angle
- Graphs of Sine and Cosine | Amplitude, period, phase shift, and vertical shift. | Amplitude and period; Phase shift; Sinusoidal models | graphing sine and cosine; sinusoidal functions
- Graphs of Other Trig Functions | Tangent, cotangent, secant, and cosecant graphs and their asymptotes. | Tangent; Reciprocal functions; Damped trig graphs | graphing tangent; graphs of secant and cosecant
- Inverse Trigonometric Functions | Restricted domains make arcsine, arccosine, and arctangent functions. | Restricted domains; Evaluating inverse trig; Compositions | inverse trig functions

# Trigonometric Identities and Equations | Rewriting trig expressions and solving trig equations.
- Fundamental Trig Identities | Reciprocal, quotient, Pythagorean, and even-odd identities. | Reciprocal and quotient identities; Pythagorean identities; Simplifying | fundamental trig identities
- Verifying Trig Identities | Proving that two trig expressions are equal for every angle. | Working one side; Factoring and common denominators; Strategy | verifying trigonometric identities
- Solving Trig Equations | Trig equations have infinitely many solutions; find them all in one period, then generalize. | Isolating the function; Factoring; Using identities | solving trig equations
- Sum and Difference Formulas | sin(a ± b), cos(a ± b), and tan(a ± b) give exact values. | Sum and difference formulas; Exact values; Proving identities | sum and difference identities
- Double-Angle and Half-Angle Formulas | Formulas for sin 2θ, cos 2θ, and half angles. | Double angle formulas; Power reducing; Half angle formulas | double angle formulas; half angle formulas

# Applications of Trigonometry | Solving any triangle.
- The Law of Sines | Solving triangles given AAS, ASA, or SSA, including the ambiguous case. | Law of sines; The ambiguous case; Applications | law of sines
- The Law of Cosines | Solving triangles given SAS or SSS. | Law of cosines; Choosing a law; Navigation and surveying | law of cosines
- Area of Oblique Triangles | ½ab sin C and Heron's formula find the area of any triangle. | SAS area; Heron's formula; Applications | area of oblique triangles; herons formula
+ Vectors in the Plane | Vectors have magnitude and direction; they are added, scaled, and resolved into components. | Component form; Magnitude and direction; Vector addition | vectors
+ The Dot Product | The dot product finds angles between vectors and projections. | Dot product; Angle between vectors; Projections and work | dot product
+ Trigonometric Form of Complex Numbers | Complex numbers in polar form multiply by multiplying moduli and adding angles. | Polar form; Multiplying and dividing; De Moivre's theorem | polar form of complex numbers; de moivres theorem

#+ Polar and Parametric Equations | Honors: describing curves with angles and with a parameter.
- Polar Coordinates | A point can be located by its distance from the origin and its angle. | Plotting polar points; Converting to rectangular; Multiple representations | polar coordinates
- Graphs of Polar Equations | Roses, limaçons, cardioids, and lemniscates in polar form. | Symmetry tests; Rose curves; Limaçons and cardioids | graphing polar equations
- Parametric Equations | x and y as functions of a parameter t describe motion along a curve. | Graphing parametric equations; Eliminating the parameter; Projectile motion | parametric equations

# Conic Sections | Parabolas, ellipses, and hyperbolas.
- Parabolas | Focus, directrix, and the standard equations of parabolas. | Focus and directrix; Vertex form; Reflective property | parabolas conic sections
- Circles and Ellipses | Circles and ellipses, their foci, and their equations. | Standard form; Foci and eccentricity; Completing the square | ellipses; circles conic sections
- Hyperbolas | Hyperbolas, their foci and asymptotes, and their equations. | Standard form; Asymptotes; Foci | hyperbolas
- Classifying Conics | Completing the square identifies any conic from its general equation. | General form; Discriminant test; Graphing | classifying conic sections

# Sequences, Series, and Probability | Sequences, sums, induction, and counting.
- Sequences and Summation Notation | Explicit and recursive sequences and sigma notation. | Recursive sequences; Factorials; Sigma notation | sequences and series; summation notation
- Arithmetic and Geometric Series | Sums of arithmetic and geometric sequences, finite and infinite. | Arithmetic series; Geometric series; Infinite series | arithmetic and geometric series; infinite geometric series
- Mathematical Induction | Proving a statement for every whole number by a base case and an inductive step. | Base case; Inductive step; Proving sum formulas | mathematical induction; proof by induction
- The Binomial Theorem | Expanding (a + b)^n with binomial coefficients. | Pascal's triangle; Binomial coefficients; Specific terms | binomial theorem
- Counting and Probability | Permutations, combinations, and probability. | Permutations; Combinations; Probability of compound events | permutations and combinations

#+ Systems and Matrices | Honors: solving systems with matrices.
- Systems of Equations and Partial Fractions | Systems in several variables, and splitting a rational expression into partial fractions. | Gaussian elimination; Nonlinear systems; Partial fractions | systems of equations; partial fraction decomposition
- Matrices and Matrix Operations | Adding, scaling, and multiplying matrices. | Matrix arithmetic; Multiplication; Identity matrix | matrix operations
- Inverse Matrices and Determinants | Inverses and determinants solve matrix equations. | Finding inverses; Determinants; Cramer's rule | inverse matrices; determinants

#+ Introduction to Limits | Honors: the idea calculus is built on.
- Limits Numerically and Graphically | A limit is the value a function approaches as x approaches a number. | Tables of values; Reading limits from graphs; One-sided limits | introduction to limits
- Evaluating Limits Algebraically | Direct substitution, factoring, and rationalizing evaluate limits. | Direct substitution; Factoring and canceling; Rationalizing | evaluating limits
- Limits at Infinity and Tangent Lines | Limits at infinity give end behavior; limits of slopes give tangent lines. | Limits at infinity; Slope of a tangent line; The derivative idea | limits at infinity; tangent line problem
`,
);
