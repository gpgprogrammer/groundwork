import { hsPair } from "./outline";

/**
 * Algebra 2 and Honors Algebra 2, following the Common Core Algebra II standards in the usual
 * textbook order: functions and transformations, quadratics and complex numbers, polynomials,
 * radicals and inverses, exponentials and logarithms, rational functions, sequences and series,
 * trigonometric functions, and statistics. Honors adds conic sections, matrices, and the
 * binomial theorem.
 */
export const [algebra2, honorsAlgebra2] = hsPair(
  {
    slug: "algebra-2",
    title: "Algebra 2",
    shortTitle: "Algebra 2",
    category: "Math & Computer Science",
    hue: 300,
    grades: "Grade 10 or 11",
    description: "Polynomial, radical, exponential, logarithmic, rational, and trigonometric functions, plus sequences, series, and statistics.",
    keywords: ["algebra 2", "algebra ii", "alg 2", "algebra two"],
  },
  {
    slug: "honors-algebra-2",
    title: "Honors Algebra 2",
    shortTitle: "Hon. Algebra 2",
    hue: 292,
    grades: "Grade 10 or 11",
    description: "Everything in Algebra 2 at greater depth, plus conic sections, matrices, and the binomial theorem.",
    keywords: ["honors algebra 2", "honors algebra ii", "algebra 2 honors", "algebra 2 trig", "hon algebra 2"],
  },
  `
# Functions and Transformations | Parent functions, transformations, and linear systems.
- Parent Functions | Linear, quadratic, absolute value, square root, and cubic parent functions are the building blocks. | Recognizing parent graphs; Domain and range; Key points | parent functions
- Transformations of Functions | f(x - h) + k shifts a graph; a·f(x) and f(bx) stretch and reflect it. | Shifts; Stretches and compressions; Reflections | transformations of functions; function transformations
- Piecewise and Absolute Value Functions | Piecewise functions use different rules on different intervals of the domain. | Graphing piecewise functions; Absolute value transformations; Step functions | piecewise functions; absolute value functions
- Systems of Equations in Three Variables | Three equations in x, y, and z are solved by elimination, one variable at a time. | Elimination in three variables; Interpreting solutions; Applications | systems of three equations; three variable systems
- Linear Programming | Optimizing an objective over the region defined by a system of inequalities. | Constraints; Feasible region; Testing vertices | linear programming

# Quadratic Functions and Complex Numbers | Forms of quadratics, solving them, and the complex numbers.
- Forms of Quadratic Functions | Standard, vertex, and intercept form each reveal different features of a parabola. | Standard form; Vertex form; Intercept form | forms of quadratic functions
- Solving Quadratic Equations | Factoring, square roots, completing the square, and the quadratic formula. | Choosing a method; Completing the square; The discriminant | solving quadratic equations
- Complex Numbers | i = √-1 extends the number system so every quadratic has solutions. | Imaginary unit i; Adding and multiplying; Dividing with conjugates | complex numbers; imaginary numbers
- Quadratics with Complex Solutions | A negative discriminant means two complex conjugate solutions. | Negative discriminant; Conjugate pairs; Graphs with no x-intercepts | complex solutions of quadratics
- Quadratic Inequalities | Solving and graphing inequalities like x² - 4 > 0. | Sign analysis; Graphing; Interval notation | quadratic inequalities
- Modeling with Quadratic Functions | Quadratics model projectiles and areas; regression fits data. | Projectile motion; Maximizing area; Quadratic regression | quadratic word problems; quadratic regression

# Polynomial Functions | Graphs, division, zeros, and identities of polynomials.
- Graphs of Polynomial Functions | Degree and leading coefficient set end behavior; zeros and turning points shape the middle. | End behavior; Turning points; Multiplicity of zeros | graphing polynomial functions; end behavior
- Adding, Subtracting, and Multiplying Polynomials | Polynomial operations and patterns like the cube of a binomial. | Combining like terms; Multiplying; Pascal's triangle | polynomial operations
- Dividing Polynomials | Long division and synthetic division divide a polynomial by a linear factor. | Polynomial long division; Synthetic division; Remainders | dividing polynomials; synthetic division; polynomial long division
- The Remainder and Factor Theorems | f(a) is the remainder when dividing by x - a; a zero remainder means a factor. | Remainder theorem; Factor theorem; Finding factors | remainder theorem; factor theorem
- Factoring Polynomials | Sums and differences of cubes, grouping, and quadratic form. | Sum and difference of cubes; Factoring by grouping; Quadratic form | factoring polynomials; sum of cubes
- Finding Zeros of Polynomials | The Rational Root Theorem lists possible zeros to test. | Rational root theorem; Descartes' rule of signs; Solving polynomial equations | rational root theorem; zeros of polynomials
- The Fundamental Theorem of Algebra | A degree-n polynomial has exactly n complex zeros, counting multiplicity. | Counting zeros; Conjugate pairs; Writing a polynomial from its zeros | fundamental theorem of algebra
- Polynomial Identities | Identities like (a + b)² = a² + 2ab + b² hold for every value and prove number facts. | Proving identities; Pythagorean triples; Using identities | polynomial identities
+ The Binomial Theorem | Pascal's triangle and combinations expand (a + b)^n without multiplying it out. | Pascal's triangle; Binomial coefficients; Finding one term | binomial theorem; binomial expansion

# Radical Functions and Inverses | Rational exponents, radical equations, composition, and inverses.
- nth Roots and Rational Exponents | a^(m/n) is the nth root of a to the m. | Converting forms; Properties of rational exponents; Simplifying | nth roots; rational exponents
- Simplifying Radical Expressions | Radicals are simplified, combined, and rationalized much like polynomials. | Simplifying; Adding and multiplying radicals; Rationalizing denominators | simplifying radical expressions
- Graphing Radical Functions | Square root and cube root functions and their transformations. | Square root graphs; Cube root graphs; Domain | graphing square root functions; radical functions
- Solving Radical Equations | Isolate the radical, raise both sides to a power, and check for extraneous solutions. | Squaring both sides; Extraneous solutions; Rational exponent equations | solving radical equations
- Function Operations and Composition | Functions can be added, multiplied, and composed: f(g(x)). | Operations on functions; Composition; Domain of a composition | composition of functions; function operations
- Inverse Functions | An inverse undoes a function; its graph is the reflection over y = x. | Finding an inverse; Verifying with composition; One-to-one functions | inverse functions

# Exponential and Logarithmic Functions | Growth, decay, logarithms, and solving exponential equations.
- Exponential Growth and Decay Functions | f(x) = ab^x grows or decays by a constant factor. | Growth and decay factors; Graphs and asymptotes; Compound interest | exponential growth and decay
- The Natural Base e | e ≈ 2.718 is the base for continuous growth. | Defining e; Continuous compounding; Graphs of e^x | natural base e; continuous compound interest
- Logarithms and Logarithmic Functions | A logarithm is an exponent: log_b(x) = y means b^y = x. | Converting forms; Evaluating logs; Graphing log functions | logarithms; logarithmic functions
- Properties of Logarithms | Product, quotient, and power rules expand and condense logs. | Product and quotient rules; Power rule; Change of base | properties of logarithms; log rules
- Solving Exponential and Logarithmic Equations | Take a log of both sides, or rewrite a log equation in exponential form. | Same base; Taking logs; Extraneous solutions | solving exponential equations; solving logarithmic equations
- Modeling with Exponential and Logarithmic Functions | Exponential regression and logs model populations, half-life, and pH. | Exponential regression; Half-life; Logarithmic scales | exponential modeling

# Rational Functions | Inverse variation, graphs of rational functions, and rational equations.
- Inverse Variation | y = k/x: as one quantity grows, the other shrinks proportionally. | Direct, inverse, and joint variation; Constant of variation; Applications | inverse variation; direct and inverse variation
- Graphing Rational Functions | Rational functions have vertical asymptotes, horizontal asymptotes, and holes. | Vertical asymptotes; Horizontal asymptotes; Holes | graphing rational functions; asymptotes
- Multiplying and Dividing Rational Expressions | Factor, cancel common factors, and note excluded values. | Simplifying; Multiplying and dividing; Excluded values | multiplying rational expressions
- Adding and Subtracting Rational Expressions | Rational expressions combine over a least common denominator. | Least common denominator; Complex fractions; Simplifying | adding rational expressions; complex fractions
- Solving Rational Equations | Multiply by the LCD, solve, and throw out extraneous solutions. | Clearing denominators; Extraneous solutions; Work and rate problems | solving rational equations

# Sequences and Series | Patterns, sums, and sigma notation.
- Defining and Using Sequences | Sequences are functions on the whole numbers, written explicitly or recursively. | Explicit formulas; Recursive formulas; Sigma notation | sequences and series; sigma notation
- Arithmetic Sequences and Series | Arithmetic sequences add a common difference; their sums average the first and last term. | nth term; Sum of an arithmetic series; Applications | arithmetic series; arithmetic sequences
- Geometric Sequences and Series | Geometric sequences multiply by a common ratio; their sums have a closed formula. | nth term; Finite geometric series; Loan and annuity problems | geometric series; geometric sequences
- Infinite Geometric Series | An infinite geometric series converges when the ratio is between -1 and 1. | Convergence; Sum a/(1 - r); Repeating decimals | infinite geometric series

# Trigonometric Functions | The unit circle, radians, and graphs of periodic functions.
- Angles and Radian Measure | Angles in standard position, coterminal angles, and converting degrees to radians. | Standard position; Coterminal angles; Converting to radians | radian measure; coterminal angles
- Right Triangle Trigonometry | The six trig functions as ratios of the sides of a right triangle. | Six trig ratios; Special angles; Solving right triangles | six trig functions; right triangle trigonometry
- Trigonometric Functions of Any Angle | Reference angles extend trig functions to every angle. | Reference angles; Signs by quadrant; Finding values | reference angles; trig functions of any angle
- The Unit Circle | On the unit circle, cos θ and sin θ are the coordinates of a point. | Special angle coordinates; Radians on the circle; Periodicity | unit circle
- Graphing Sine and Cosine | Amplitude, period, and midline describe sine and cosine graphs. | Amplitude; Period; Phase and vertical shifts | graphing sine and cosine; amplitude and period
- Graphing Other Trig Functions | Tangent, cotangent, secant, and cosecant graphs have asymptotes. | Tangent graphs; Reciprocal function graphs; Asymptotes | graphing tangent; graphing secant and cosecant
- Modeling Periodic Phenomena | Sine and cosine model tides, temperature, and Ferris wheels. | Writing a trig model; Sinusoidal regression; Interpreting parameters | modeling with trig functions; sinusoidal functions
- The Pythagorean Identity | sin²θ + cos²θ = 1 finds one trig value from another. | Deriving the identity; Finding values; Simplifying expressions | pythagorean identity
+ Verifying Trigonometric Identities | Reciprocal, quotient, and Pythagorean identities rewrite trig expressions. | Fundamental identities; Verifying identities; Simplifying | trig identities; verifying trigonometric identities
+ Sum and Difference Formulas | Formulas for sin(a ± b) and cos(a ± b) give exact values of new angles. | Sum and difference formulas; Exact values; Double angle formulas | sum and difference identities; double angle formulas

# Probability and Statistics | Probability, normal distributions, and drawing conclusions from data.
- Probability and Counting | Permutations, combinations, and probability rules. | Permutations and combinations; Independent events; Conditional probability | probability and counting principles
- The Normal Distribution | Bell-shaped data follow the 68-95-99.7 rule; z-scores compare values. | Empirical rule; z-scores; Areas under the curve | normal distribution; empirical rule; z scores
- Populations, Samples, and Surveys | How data is collected determines what conclusions it can support. | Random sampling; Bias; Surveys, experiments, and observational studies | sampling methods; types of studies
- Margin of Error and Inference | A sample estimate comes with a margin of error from its sampling variability. | Margin of error; Simulations; Confidence | margin of error
- Analyzing Experiments | Randomized experiments and simulations test whether a difference is real. | Treatment and control groups; Randomization; Resampling | randomized experiments

#+ Conic Sections | Honors: parabolas, circles, ellipses, and hyperbolas as slices of a cone.
- Parabolas | A parabola is every point equidistant from a focus and a directrix. | Focus and directrix; Standard equations; Graphing | parabolas conic sections
- Circles | A circle's equation comes from the distance formula. | Standard form; Completing the square; Graphing | circles conic sections
- Ellipses | An ellipse is every point whose distances to two foci add to a constant. | Foci and vertices; Standard form; Graphing | ellipses
- Hyperbolas | A hyperbola is every point whose distances to two foci differ by a constant. | Foci and asymptotes; Standard form; Graphing | hyperbolas
- Classifying Conics and Nonlinear Systems | The general second-degree equation identifies a conic; systems find where conics meet. | Classifying conics; Completing the square; Solving nonlinear systems | classifying conic sections; nonlinear systems

#+ Matrices | Honors: matrix operations and solving systems with matrices.
- Matrix Operations | Matrices are added entry by entry and multiplied row by column. | Adding and scalar multiplication; Matrix multiplication; Dimensions | matrix operations; matrix multiplication
- Determinants and Inverse Matrices | The determinant tells whether a matrix has an inverse. | 2×2 and 3×3 determinants; Inverse matrices; Cramer's rule | determinants; inverse matrices
- Solving Systems with Matrices | Inverse matrices and row reduction solve linear systems. | Matrix equations; Augmented matrices; Row reduction | solving systems with matrices; row reduction
`,
);
