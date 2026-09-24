import { course, t, u } from "./spec";

export const precalc = course(
  {
    slug: "ap-precalculus",
    title: "AP Precalculus",
    shortTitle: "Precalc",
    category: "Math & Computer Science",
    hue: 250,
    description: "Functions as models of change: polynomial, rational, exponential, logarithmic, trigonometric, and polar, plus parameters, vectors, and matrices.",
    keywords: ["ap precalc", "ap precalculus", "precalculus", "precalc", "pre calc"],
  },
  [
    u("Polynomial and Rational Functions", "How functions change, and the behavior of polynomials and rational functions.", [
      t("Rates of Change", "Average rate of change is the slope between two points; a function is increasing or decreasing when that rate is positive or negative.", ["average rate of change"]),
      t("Polynomial Functions and Their Zeros", "The degree and leading coefficient set a polynomial's end behavior, and its real zeros are where the graph meets the x-axis.", ["zeros of polynomials", "end behavior", "multiplicity"]),
      t("Rational Functions and Asymptotes", "Rational functions have vertical asymptotes where the denominator is zero and holes where factors cancel.", ["vertical asymptote", "horizontal asymptote", "holes"]),
      t("Transformations of Functions", "Shifts, stretches, and reflections change a parent graph in predictable ways depending on whether the change is inside or outside the function.", ["function transformations", "shifts and stretches"]),
      t("Function Model Selection", "Choose a linear, quadratic, cubic, or other model by looking at how the data's rates of change behave.", ["modeling with functions", "regression"]),
    ]),
    u("Exponential and Logarithmic Functions", "Sequences, exponential growth, logarithms, and semi-log plots.", [
      t("Arithmetic and Geometric Sequences", "Arithmetic sequences add a constant difference; geometric sequences multiply by a constant ratio.", ["sequences"]),
      t("Exponential Functions", "Exponential functions grow by equal factors over equal intervals, which is why they eventually outrun any polynomial.", ["exponential growth", "exponential decay"]),
      t("Composition and Inverse Functions", "An inverse undoes a function, swapping inputs and outputs; composition feeds one function's output into another.", ["inverse functions", "function composition"]),
      t("Logarithmic Functions", "A logarithm is the inverse of an exponential: log base b of x is the exponent you raise b to in order to get x.", ["logarithms", "log rules", "properties of logarithms"]),
      t("Exponential and Logarithmic Equations", "Solve exponential equations by taking logs of both sides, and logarithmic equations by rewriting them as exponentials.", ["solving log equations"]),
      t("Semi-log Plots", "On a semi-log plot, exponential data looks linear, which makes growth rates easy to read.", ["semi log", "logarithmic scale"]),
    ]),
    u("Trigonometric and Polar Functions", "Periodic behavior, the unit circle, trig functions, and polar coordinates.", [
      t("Periodic Phenomena and the Unit Circle", "Sine and cosine come from coordinates on the unit circle, which is why they repeat every 2π.", ["unit circle", "radians"]),
      t("Sine and Cosine Graphs", "Amplitude, period, phase shift, and vertical shift describe every sinusoidal graph.", ["sinusoidal functions", "amplitude period phase shift"]),
      t("Tangent and Inverse Trig Functions", "Tangent is sine over cosine and has vertical asymptotes; inverse trig functions return angles on restricted domains.", ["tangent function", "arcsin", "inverse trigonometric functions"]),
      t("Trigonometric Equations and Identities", "Use identities like sin² + cos² = 1 to rewrite and solve trig equations over an interval.", ["trig identities", "pythagorean identity", "solving trig equations"]),
      t("Polar Coordinates and Graphs", "Polar coordinates locate points by distance and angle, and polar graphs show how r changes as θ turns.", ["polar coordinates", "polar graphs", "rose curves"]),
    ]),
    u("Functions Involving Parameters, Vectors, and Matrices", "Parametric motion, vectors, and matrices as transformations.", [
      t("Parametric Functions", "Parametric equations give x and y separately in terms of t, tracing motion along a path.", ["parametric equations"]),
      t("Implicitly Defined Functions and Conic Sections", "Circles, ellipses, parabolas, and hyperbolas are defined by equations in x and y rather than y = f(x).", ["conic sections", "ellipse", "hyperbola"]),
      t("Vectors", "A vector has magnitude and direction; add them tip to tail and scale them by multiplying.", ["vectors", "dot product"]),
      t("Matrices and Linear Transformations", "A matrix can represent a transformation of the plane, and its determinant tells you how areas scale.", ["matrices", "determinant", "matrix multiplication", "inverse matrix"]),
    ]),
  ],
);

export const stats = course(
  {
    slug: "ap-statistics",
    title: "AP Statistics",
    shortTitle: "AP Stats",
    category: "Math & Computer Science",
    hue: 200,
    description: "Exploring data, collecting it well, probability, and inference: the reasoning behind every study and poll you'll read.",
    keywords: ["ap stats", "ap statistics", "statistics", "stats"],
  },
  [
    u("Exploring One-Variable Data", "Describing distributions with graphs and numbers.", [
      t("Describing Distributions", "Describe a distribution by its shape, center, spread, and any unusual features, always in context.", ["shape center spread", "SOCS"]),
      t("Summary Statistics and Boxplots", "The five-number summary and IQR resist outliers; the mean and standard deviation don't.", ["five number summary", "IQR", "boxplot", "outliers"]),
      t("The Normal Distribution and z-Scores", "A z-score measures how many standard deviations a value is from the mean, and the empirical rule describes normal data.", ["normal distribution", "z score", "empirical rule", "68 95 99.7"]),
    ]),
    u("Exploring Two-Variable Data", "Relationships between variables, correlation, and regression.", [
      t("Two-Way Tables", "Marginal and conditional relative frequencies show whether two categorical variables are associated.", ["two way tables", "conditional distribution"]),
      t("Scatterplots and Correlation", "Correlation measures the strength and direction of a linear relationship, and it isn't causation.", ["correlation coefficient", "scatterplot"]),
      t("Least-Squares Regression", "The regression line minimizes squared residuals; interpret its slope as the predicted change in y per unit of x.", ["linear regression", "LSRL", "slope interpretation"]),
      t("Residuals and r-squared", "Residual plots reveal whether a linear model fits, and r² is the share of variation in y the model explains.", ["residual plot", "coefficient of determination", "r squared"]),
    ]),
    u("Collecting Data", "Sampling, bias, and experimental design.", [
      t("Sampling Methods", "Simple random, stratified, cluster, and systematic samples each use chance in a different way.", ["random sampling", "stratified sample", "cluster sample"]),
      t("Bias in Sampling", "Undercoverage, nonresponse, and response bias skew results no matter how large the sample.", ["sampling bias", "voluntary response"]),
      t("Experimental Design", "Random assignment, control, replication, and blocking let an experiment show cause and effect.", ["experiments", "random assignment", "blocking", "confounding"]),
    ]),
    u("Probability, Random Variables, and Probability Distributions", "Chance, random variables, and the binomial and geometric models.", [
      t("Probability Rules", "The addition and multiplication rules, and conditional probability, handle combined events.", ["conditional probability", "independent events", "addition rule"]),
      t("Random Variables", "A random variable's expected value is its long-run average, and its standard deviation measures typical variation.", ["expected value", "discrete random variables"]),
      t("Binomial Distributions", "Binomial settings count successes in a fixed number of independent trials with the same probability.", ["binomial distribution", "binompdf", "binomcdf"]),
      t("Geometric Distributions", "Geometric settings count the trials until the first success.", ["geometric distribution"]),
    ]),
    u("Sampling Distributions", "How statistics vary from sample to sample.", [
      t("Sampling Distributions and the Central Limit Theorem", "The CLT says sample means are approximately normal for large samples, whatever the population's shape.", ["central limit theorem", "CLT", "sampling distribution"]),
      t("Sampling Distributions for Proportions", "Sample proportions center on p with standard deviation √(p(1−p)/n) when conditions are met.", ["sample proportion"]),
    ]),
    u("Inference for Categorical Data: Proportions", "Confidence intervals and significance tests for proportions.", [
      t("Confidence Intervals for Proportions", "A confidence interval is a point estimate plus or minus a margin of error, with a confidence level describing the method.", ["confidence interval", "margin of error"]),
      t("Significance Tests for Proportions", "A p-value is the probability of results at least this extreme if the null hypothesis were true.", ["hypothesis testing", "p value", "one proportion z test"]),
      t("Type I and Type II Errors and Power", "A Type I error rejects a true null; a Type II error misses a false one. Power is the chance of catching a real effect.", ["type 1 error", "type 2 error", "power"]),
      t("Two-Proportion Inference", "Compare two groups with a two-proportion z-interval or z-test.", ["two proportion z test"]),
    ]),
    u("Inference for Quantitative Data: Means", "t-procedures for one and two means.", [
      t("t-Intervals and t-Tests for a Mean", "Use t-procedures for means when σ is unknown, checking random, 10%, and normal/large sample conditions.", ["t test", "t interval", "degrees of freedom"]),
      t("Two-Sample and Paired t-Procedures", "Paired data gets a one-sample t on the differences; independent groups get a two-sample t.", ["paired t test", "two sample t test"]),
    ]),
    u("Inference for Categorical Data: Chi-Square", "Chi-square tests for distributions and associations.", [
      t("Chi-Square Goodness of Fit", "Tests whether one categorical variable matches a claimed distribution.", ["chi square goodness of fit"]),
      t("Chi-Square Tests for Homogeneity and Independence", "Tests whether distributions differ across groups or whether two variables are associated.", ["chi square independence", "chi square homogeneity"]),
    ]),
    u("Inference for Quantitative Data: Slopes", "Inference about the slope of a regression line.", [
      t("Inference for the Slope of a Regression Line", "A t-interval or t-test for slope asks whether the linear relationship could be due to chance.", ["regression inference", "t test for slope"]),
    ]),
  ],
);

export const csa = course(
  {
    slug: "ap-computer-science-a",
    title: "AP Computer Science A",
    shortTitle: "AP CSA",
    category: "Math & Computer Science",
    hue: 30,
    description: "Object-oriented programming in Java: variables, objects, control flow, arrays, ArrayLists, 2D arrays, inheritance, and recursion.",
    query: "AP Computer Science A Java",
    keywords: ["ap csa", "ap computer science a", "ap comp sci a", "apcsa", "java"],
  },
  [
    u("Primitive Types", "Variables, data types, and expressions in Java.", [
      t("Variables and Primitive Data Types", "int, double, and boolean store values directly; each has a size and a range.", ["java variables", "data types"]),
      t("Expressions, Assignment, and Casting", "Integer division truncates, % gives the remainder, and casting converts between int and double.", ["integer division", "modulo", "casting"]),
    ]),
    u("Using Objects", "Creating objects, calling methods, and working with Strings and Math.", [
      t("Objects, Classes, and Constructors", "A class is a blueprint, an object is an instance, and new calls a constructor to build it.", ["java objects", "constructors"]),
      t("String Methods", "substring, indexOf, length, and equals are the String methods the exam uses most.", ["java strings", "substring", "indexOf"]),
      t("The Math Class and Wrapper Classes", "Math.random, Math.abs, and Math.pow are static methods; Integer and Double wrap primitives.", ["Math.random", "wrapper classes", "autoboxing"]),
    ]),
    u("Boolean Expressions and if Statements", "Making decisions in code.", [
      t("if, else if, and else", "Conditionals run code only when a boolean expression is true.", ["if statements", "conditionals"]),
      t("Compound Boolean Expressions and De Morgan's Law", "&& and || short-circuit, and De Morgan's laws rewrite negated compound conditions.", ["de morgans law", "logical operators", "short circuit"]),
      t("Comparing Objects", "== compares references for objects; use .equals to compare their contents.", ["equals vs ==", "object equality"]),
    ]),
    u("Iteration", "Loops and common loop algorithms.", [
      t("while and for Loops", "Loops repeat code; watch the loop condition to avoid off-by-one errors and infinite loops.", ["java loops", "for loop", "while loop"]),
      t("Nested Loops and String Algorithms", "Nested loops and character-by-character traversals power counting, reversing, and searching Strings.", ["nested loops", "string traversal"]),
    ]),
    u("Writing Classes", "Designing your own classes.", [
      t("Instance Variables, Constructors, and Methods", "Private instance variables hold state; public methods expose behavior; constructors set the initial state.", ["writing classes", "encapsulation", "accessor mutator"]),
      t("Static Variables and Methods, and this", "Static members belong to the class, not an object; this refers to the current object.", ["static keyword", "this keyword"]),
      t("Scope and Access", "Local variables live only inside their block; private hides details from other classes.", ["variable scope", "private public"]),
    ]),
    u("Arrays", "Fixed-size collections and array algorithms.", [
      t("Creating and Traversing Arrays", "Arrays have a fixed length, zero-based indexes, and can be traversed with for or enhanced for loops.", ["java arrays", "enhanced for loop"]),
      t("Array Algorithms", "Find a max or min, sum, count, shift, and reverse elements with standard traversal patterns.", ["array algorithms"]),
    ]),
    u("ArrayList", "Resizable lists, searching, and sorting.", [
      t("ArrayList Methods", "add, get, set, remove, and size manage a list that grows and shrinks.", ["arraylist", "java arraylist"]),
      t("Removing While Traversing", "Removing elements during a forward loop skips elements; loop backward or adjust the index.", ["arraylist remove loop"]),
      t("Searching and Sorting", "Linear and binary search find elements; selection and insertion sort order them.", ["selection sort", "insertion sort", "binary search", "linear search"]),
    ]),
    u("2D Array", "Grids of data.", [
      t("2D Arrays", "A 2D array is an array of rows; traverse it with nested loops in row-major or column-major order.", ["2d arrays", "row major"]),
    ]),
    u("Inheritance", "Superclasses, subclasses, and polymorphism.", [
      t("Superclasses and Subclasses", "A subclass extends a superclass, inherits its methods, and calls super to reuse its constructor.", ["inheritance", "extends", "super"]),
      t("Overriding and Polymorphism", "A subclass can override a method, and Java picks the version based on the object's actual type at run time.", ["polymorphism", "method overriding"]),
    ]),
    u("Recursion", "Methods that call themselves.", [
      t("Recursion", "A recursive method needs a base case and a step that moves toward it; merge sort and binary search can be written recursively.", ["recursive methods", "merge sort", "base case"]),
    ]),
  ],
);

export const csp = course(
  {
    slug: "ap-computer-science-principles",
    title: "AP Computer Science Principles",
    shortTitle: "AP CSP",
    category: "Math & Computer Science",
    hue: 270,
    description: "The big ideas of computing: creative development, data, algorithms and programming, computer systems and networks, and computing's impact.",
    keywords: ["ap csp", "ap computer science principles", "computer science principles", "apcsp"],
  },
  [
    u("Creative Development", "How programs are designed, built, and debugged collaboratively.", [
      t("Program Design and Development", "Programs are built iteratively: investigate, design, prototype, test, and refine.", ["development process"]),
      t("Identifying and Correcting Errors", "Syntax, runtime, logic, and overflow errors each need a different debugging approach.", ["debugging", "logic error"]),
    ]),
    u("Data", "Binary, compression, and extracting information from data.", [
      t("Binary Numbers", "Computers represent everything in bits; convert between binary and decimal with place values.", ["binary", "bits and bytes"]),
      t("Data Compression", "Lossless compression can be reversed exactly; lossy compression trades detail for size.", ["lossless", "lossy"]),
      t("Using Data to Find Patterns", "Cleaning, filtering, and visualizing data reveals trends, but correlation isn't causation.", ["big data", "metadata"]),
    ]),
    u("Algorithms and Programming", "Variables, lists, procedures, and algorithm efficiency.", [
      t("Variables, Lists, and Procedures", "Lists store collections, and procedures with parameters reduce repetition and hide complexity.", ["procedures", "abstraction", "lists"]),
      t("Conditionals, Iteration, and Boolean Logic", "Selection and iteration control what a program does and how many times.", ["selection", "iteration"]),
      t("Algorithm Efficiency and Undecidable Problems", "Some algorithms run in reasonable time and some don't; some problems can't be solved by any algorithm.", ["efficiency", "heuristic", "undecidable", "binary search"]),
      t("Simulations and Random Values", "Simulations model real-world systems with simplifying assumptions and random values.", ["simulation"]),
    ]),
    u("Computer Systems and Networks", "The Internet, fault tolerance, and parallel computing.", [
      t("The Internet and Protocols", "The Internet routes packets using open protocols like TCP/IP, DNS, and HTTP.", ["internet", "packets", "TCP IP", "DNS"]),
      t("Fault Tolerance", "Redundant paths let the Internet keep working when parts of it fail.", ["redundancy"]),
      t("Parallel and Distributed Computing", "Splitting work across processors speeds it up, but the slowest sequential part limits the gain.", ["parallel computing", "speedup"]),
    ]),
    u("Impact of Computing", "Benefits, harms, bias, and security.", [
      t("The Digital Divide and Computing Bias", "Unequal access to technology and biased data can make computing innovations unfair.", ["digital divide", "algorithmic bias"]),
      t("Crowdsourcing, Legal, and Ethical Issues", "Open source, Creative Commons, and intellectual property shape how content is shared.", ["creative commons", "open source", "intellectual property"]),
      t("Safe Computing and Cybersecurity", "Encryption, multifactor authentication, and awareness of phishing protect personal data.", ["encryption", "phishing", "public key", "cybersecurity"]),
    ]),
  ],
);
