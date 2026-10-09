import { hsPair } from "./outline";

/**
 * Algebra 1 and Honors Algebra 1, following the Common Core Algebra I standards in the order
 * most textbooks teach them (Big Ideas, enVision, Glencoe): equations and inequalities, functions
 * and linear models, systems, exponents and exponential functions, polynomials, then quadratics.
 */
export const [algebra1, honorsAlgebra1] = hsPair(
  {
    slug: "algebra-1",
    title: "Algebra 1",
    shortTitle: "Algebra 1",
    category: "Math & Computer Science",
    hue: 28,
    grades: "Grade 9",
    description: "Equations, inequalities, functions, linear and exponential models, polynomials, and quadratics: the foundation for every math class after it.",
    keywords: ["algebra 1", "algebra i", "alg 1", "algebra one"],
  },
  {
    slug: "honors-algebra-1",
    title: "Honors Algebra 1",
    shortTitle: "Hon. Algebra 1",
    hue: 22,
    grades: "Grade 8 or 9",
    description: "Everything in Algebra 1 at a faster pace, plus radicals, rational expressions, and deeper work with functions.",
    keywords: ["honors algebra 1", "honors algebra i", "algebra 1 honors", "hon algebra 1"],
  },
  `
# Foundations of Algebra | The language of algebra: expressions, real numbers, and the properties that let you rewrite them.
- Variables and Expressions | Expressions use variables to stand for numbers; translating words into expressions is the first skill of algebra. | Writing expressions from words; Evaluating expressions; Terms, coefficients, and constants | algebraic expressions; writing expressions
- Order of Operations | Parentheses, exponents, multiplication and division, then addition and subtraction, left to right. | PEMDAS; Grouping symbols; Evaluating with exponents | order of operations; PEMDAS
- Real Numbers and the Number Line | Natural, whole, integer, rational, and irrational numbers nest inside the real numbers. | Classifying numbers; Square roots; Comparing and ordering | real number system; rational and irrational numbers
- Properties of Real Numbers | Commutative, associative, identity, and inverse properties justify every algebra step. | Commutative and associative; Identity and inverse; Proving expressions equivalent | properties of real numbers; commutative property
- The Distributive Property and Combining Like Terms | Distributing and collecting like terms simplify expressions before you solve. | Distributing a negative; Like terms; Simplifying expressions | distributive property; combining like terms

# Solving Equations | Undoing operations to find the value that makes an equation true.
- One-Step and Two-Step Equations | Inverse operations isolate the variable, keeping both sides balanced. | Inverse operations; Checking solutions; Equations with fractions | two step equations; one step equations
- Multi-Step Equations | Distribute and combine like terms first, then isolate the variable. | Clearing fractions and decimals; Distributing; Word problems | multi step equations
- Equations with Variables on Both Sides | Collect variable terms on one side; some equations have no solution or infinitely many. | Identities; No-solution equations; Choosing which side | variables on both sides
- Literal Equations and Formulas | Solving a formula for one variable in terms of the others. | Rearranging formulas; Area and distance formulas; Solving for y | literal equations; rearranging formulas
- Ratios, Rates, and Proportions | Proportions set two ratios equal; cross products solve them. | Unit rates; Cross multiplication; Percent problems | proportions; ratios and rates
- Absolute Value Equations | An absolute value equation usually splits into two equations, one for each sign. | Distance from zero; Two cases; Extraneous solutions | absolute value equations

# Solving Inequalities | Solving and graphing inequalities, including compound and absolute value inequalities.
- Writing and Graphing Inequalities | Inequalities describe ranges of values, graphed with open and closed circles. | Inequality symbols; Open vs. closed circles; Writing from words | graphing inequalities
- Solving Linear Inequalities | Solve like an equation, but flip the sign when multiplying or dividing by a negative. | Flipping the inequality; Multi-step inequalities; Interval notation | solving inequalities; linear inequalities
- Compound Inequalities | "And" inequalities overlap; "or" inequalities combine. | And vs. or; Graphing compound inequalities; Three-part inequalities | compound inequalities
- Absolute Value Inequalities | Less-than becomes an "and" inequality; greater-than becomes an "or". | Less than: and; Greater than: or; Graphing solutions | absolute value inequalities

# Functions | What makes a relation a function, and how to read, write, and graph functions.
- Relations and Functions | A function assigns exactly one output to each input. | Mapping diagrams; Vertical line test; Ordered pairs | relations and functions; vertical line test; what is a function
- Function Notation | f(x) names a function and its output; evaluating means substituting the input. | Evaluating f(x); Solving f(x) = k; Reading notation in context | function notation
- Domain and Range | The domain is every allowed input; the range is every output. | From a graph; From a table; Reasonable domains in context | domain and range
- Graphing Functions and Key Features | Intercepts, increasing and decreasing intervals, and maximums tell a function's story. | Intercepts; Increasing and decreasing; Rate of change from a graph | key features of functions; interpreting graphs
- Arithmetic Sequences | Sequences that add the same amount each time are linear functions on the whole numbers. | Common difference; Explicit formula; Recursive formula | arithmetic sequences

# Linear Functions | Slope, the forms of a line, and modeling with linear functions.
- Rate of Change and Slope | Slope is rise over run: how much y changes for each unit of x. | Slope from two points; Slope from a graph; Positive, negative, zero, undefined | slope; rate of change; finding slope
- Slope-Intercept Form | y = mx + b shows a line's slope and y-intercept at a glance. | Graphing from y = mx + b; Writing the equation; Interpreting m and b | slope intercept form
- Point-Slope Form | y - y1 = m(x - x1) writes a line from one point and the slope. | Writing from a point and slope; Writing from two points; Converting forms | point slope form
- Standard Form and Intercepts | Ax + By = C makes the x- and y-intercepts quick to find. | Finding intercepts; Graphing with intercepts; Converting forms | standard form of a linear equation
- Parallel and Perpendicular Lines | Parallel lines share a slope; perpendicular slopes are negative reciprocals. | Same slope; Negative reciprocals; Writing equations | parallel and perpendicular lines
- Transformations of Linear Functions | Changing m and b stretches, flips, and shifts the parent function f(x) = x. | Vertical shifts; Changing the slope; Reflections | transforming linear functions
- Scatter Plots and Lines of Best Fit | A line of best fit models a linear trend in data and makes predictions. | Correlation; Line of best fit; Interpolation and extrapolation | scatter plots; line of best fit; linear regression
- Piecewise and Absolute Value Functions | Absolute value graphs make a V; piecewise functions use different rules on different intervals. | Graphing y = abs(x); Shifting the vertex; Step functions | absolute value functions; piecewise functions

# Systems of Equations and Inequalities | Finding where two equations or inequalities are true at once.
- Solving Systems by Graphing | The solution of a system is where the lines intersect. | Intersection point; One, none, or infinitely many solutions; Checking a solution | solving systems by graphing; systems of equations
- Solving Systems by Substitution | Solve one equation for a variable and substitute it into the other. | Isolating a variable; Substituting; Special cases | substitution method
- Solving Systems by Elimination | Add or subtract equations to eliminate a variable. | Multiplying to match coefficients; Eliminating; Special cases | elimination method
- Applications of Linear Systems | Mixture, cost, and break-even problems are systems in disguise. | Defining variables; Writing two equations; Interpreting the solution | systems of equations word problems
- Linear Inequalities in Two Variables | A linear inequality is a half-plane, shaded above or below a boundary line. | Dashed vs. solid lines; Shading; Testing a point | graphing linear inequalities
- Systems of Linear Inequalities | The solution is the region where the shaded half-planes overlap. | Overlapping regions; Writing systems from graphs; Constraints | systems of inequalities

# Exponents and Exponential Functions | Exponent rules, radicals, and functions that grow by multiplying.
- Properties of Exponents | Product, quotient, and power rules, plus zero and negative exponents. | Product and quotient rules; Power rules; Zero and negative exponents | exponent rules; laws of exponents
- Radicals and Rational Exponents | A fractional exponent is a root: x^(1/n) is the nth root of x. | Simplifying square roots; Rational exponents; Converting forms | rational exponents; simplifying radicals
- Exponential Functions | y = ab^x changes by a constant factor, not a constant amount. | Initial value and base; Graphs; Linear vs. exponential | exponential functions
- Exponential Growth and Decay | Growth and decay rates model populations, money, and half-life. | Growth factor 1 + r; Decay factor 1 - r; Compound interest | exponential growth and decay
- Geometric Sequences | Sequences with a common ratio are exponential functions on the whole numbers. | Common ratio; Explicit formula; Recursive formula | geometric sequences

# Polynomials and Factoring | Adding, multiplying, and factoring polynomials.
- Adding and Subtracting Polynomials | Polynomials are added by combining like terms; degree and standard form describe them. | Degree and leading coefficient; Standard form; Subtracting carefully | adding and subtracting polynomials
- Multiplying Polynomials | Distribute every term; FOIL is a shortcut for two binomials. | FOIL; Box method; Special products | multiplying polynomials; FOIL method
- Special Products | Squares of binomials and the product of a sum and difference follow patterns. | (a + b)^2; (a + b)(a - b); Using patterns | special products; difference of squares
- Factoring the Greatest Common Factor | Factoring starts by pulling out what every term shares. | GCF of terms; Factoring by grouping; Checking by multiplying | factoring gcf; factoring by grouping
- Factoring Trinomials | x^2 + bx + c factors into two binomials whose numbers multiply to c and add to b. | Leading coefficient 1; ax^2 + bx + c; The AC method | factoring trinomials; factoring quadratics
- Factoring Special Cases | Difference of squares and perfect square trinomials factor on sight. | Difference of squares; Perfect square trinomials; Factoring completely | factoring special cases; factoring difference of squares

# Quadratic Functions and Equations | Parabolas and four ways to solve quadratic equations.
- Graphing Quadratic Functions | A parabola has a vertex, an axis of symmetry, and opens up or down. | Vertex and axis of symmetry; Standard form; Effect of a | graphing quadratic functions; graphing parabolas
- Vertex Form and Transformations | y = a(x - h)^2 + k shifts and stretches the parent function y = x^2. | Vertex form; Shifts; Stretches and reflections | vertex form; transformations of quadratics
- Solving Quadratics by Factoring | Set the equation to zero, factor, and use the zero product property. | Zero product property; Standard form first; Roots and zeros | solving quadratics by factoring
- Solving Quadratics with Square Roots | When there's no x term, isolate x^2 and take both square roots. | Isolating the square; Plus or minus; Simplifying roots | solving quadratics with square roots
- Completing the Square | Rewriting x^2 + bx as a perfect square solves any quadratic and finds the vertex. | Adding (b/2)^2; Solving; Converting to vertex form | completing the square
- The Quadratic Formula and the Discriminant | The quadratic formula solves any quadratic; the discriminant counts the real solutions. | x = (-b ± √(b² - 4ac)) / 2a; The discriminant; Choosing a method | quadratic formula; discriminant
- Comparing Linear, Exponential, and Quadratic Models | Constant differences, constant ratios, and constant second differences identify the model. | First and second differences; Ratios; Choosing a model | linear exponential quadratic models
+ Linear-Quadratic Systems | A line can meet a parabola at zero, one, or two points. | Substitution; Graphing; Counting solutions | linear quadratic systems

# Data and Statistics | Summarizing data with center, spread, and displays.
- Measures of Center and Spread | Mean and median describe the center; range, IQR, and standard deviation describe spread. | Mean vs. median; Interquartile range; Standard deviation | mean median mode; measures of center and spread
- Box Plots and Histograms | Box plots show the five-number summary; histograms show shape. | Five-number summary; Outliers; Skewed vs. symmetric | box and whisker plots; histograms
- Two-Way Tables | Two-way tables organize two categorical variables and their relative frequencies. | Joint and marginal frequencies; Conditional relative frequency; Associations | two way tables
- Correlation and Causation | Correlation measures how linear a relationship is; it doesn't prove cause. | Correlation coefficient r; Residuals; Correlation vs. causation | correlation coefficient; correlation vs causation

#+ Radicals and Rational Expressions | Honors: operations with radicals, radical equations, and rational expressions.
- Operations with Radicals | Radicals are added like like terms and multiplied by combining under one root. | Adding like radicals; Multiplying radicals; Rationalizing denominators | operations with radicals; rationalizing the denominator
- Solving Radical Equations | Isolate the radical, raise both sides to a power, and check for extraneous roots. | Squaring both sides; Extraneous solutions; Two radicals | radical equations
- Inverse Variation | In inverse variation, y = k/x: as one quantity doubles, the other halves. | Constant of variation; Graphs of y = k/x; Applications | inverse variation; direct and inverse variation
- Simplifying Rational Expressions | Factor the numerator and denominator, cancel common factors, and note excluded values. | Excluded values; Factoring first; Simplifying | simplifying rational expressions
- Multiplying and Dividing Rational Expressions | Multiply like fractions; divide by multiplying by the reciprocal. | Factoring and canceling; Reciprocals; Restrictions | multiplying rational expressions
- Adding and Subtracting Rational Expressions | Rational expressions need a common denominator, just like fractions. | Least common denominator; Combining numerators; Simplifying | adding rational expressions
- Solving Rational Equations | Multiply through by the LCD, then check for solutions that make a denominator zero. | Clearing denominators; Extraneous solutions; Work and rate problems | rational equations
`,
);
