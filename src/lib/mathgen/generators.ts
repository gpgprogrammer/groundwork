import { dec, frac, fracPi, MINUS, n, pi, plus, poly, signed, sup } from "./format";

/**
 * Math problem generators. Each one builds a fresh problem from a random source: the correct answer,
 * three wrong answers that come from real mistakes (each with the mistake named), and a worked
 * solution. Everything is computed, so answers are always right and there is no limit on problems.
 */

export type Rng = { int: (lo: number, hi: number) => number; pick: <T>(xs: readonly T[]) => T; nz: (lo: number, hi: number) => number };

export type Draft = {
  stem: string;
  answer: string;
  /** Wrong answers and the mistake behind each. */
  wrong: [string, string][];
  /** The worked solution, one step per line. */
  steps: string[];
  difficulty: "easy" | "medium" | "hard";
};

export type Generator = { id: string; label: string; make: (r: Rng) => Draft };

const g = (id: string, label: string, make: (r: Rng) => Draft): Generator => ({ id, label, make });

// ── Algebra: expressions and equations ──────────────────────────────────────

const orderOfOps = g("order-of-ops", "Order of operations", (r) => {
  const a = r.int(2, 9), b = r.int(2, 6), c = r.int(2, 6), d = r.int(1, 5);
  const e = r.int(2, 4);
  const ans = a + b * c - d * e;
  return {
    stem: `Evaluate: ${a} + ${b} × ${c} ${MINUS} ${d} × ${e}`,
    answer: n(ans),
    wrong: [
      [n((a + b) * c - d * e), "Added before multiplying. Multiplication comes first."],
      [n(((a + b) * c - d) * e), "Worked left to right, ignoring the order of operations."],
      [n(a + b * c - d + e), "Treated the last × as +."],
    ],
    steps: [`Multiply first: ${b} × ${c} = ${b * c} and ${d} × ${e} = ${d * e}.`, `Then add and subtract left to right: ${a} + ${b * c} ${MINUS} ${d * e} = ${n(ans)}.`],
    difficulty: "easy",
  };
});

const twoStep = g("two-step", "Two-step equations", (r) => {
  const a = r.nz(-9, 9), x = r.int(-10, 10), b = r.int(-15, 15);
  const c = a * x + b;
  return {
    stem: `Solve for x: ${poly([a, b])} = ${n(c)}`,
    answer: `x = ${n(x)}`,
    wrong: [
      [`x = ${frac(c + b, a)}`, `Added ${n(b)} to both sides instead of subtracting it.`],
      [`x = ${n(c - b)}`, `Forgot to divide by ${n(a)}.`],
      [`x = ${frac(-(c - b), a)}`, "Sign error when dividing."],
    ],
    steps: [`Undo the ${b >= 0 ? "+" : MINUS} ${Math.abs(b)}: ${poly([a, 0])} = ${n(c)}${signed(-b)} = ${n(c - b)}.`, `Divide both sides by ${n(a)}: x = ${n(c - b)} ÷ ${n(a)} = ${n(x)}.`],
    difficulty: "easy",
  };
});

const bothSides = g("both-sides", "Variables on both sides", (r) => {
  const x = r.int(-8, 8);
  const a = r.nz(-9, 9);
  let c = r.nz(-9, 9);
  if (a === c) c = a + r.pick([1, 2, -1]);
  if (c === 0) c = 3;
  const b = r.int(-12, 12);
  const d = (a - c) * x + b;
  return {
    stem: `Solve for x: ${poly([a, b])} = ${poly([c, d])}`,
    answer: `x = ${n(x)}`,
    wrong: [
      [`x = ${frac(d - b, a + c)}`, `Added ${n(c)}x to both sides instead of subtracting it.`],
      [`x = ${frac(d + b, a - c)}`, `Added ${n(b)} instead of subtracting it.`],
      [`x = ${frac(b - d, a - c)}`, "Moved the constants to the wrong side (sign error)."],
    ],
    steps: [`Get x on one side (subtract ${n(c)}x from both sides): ${poly([a - c, b])} = ${n(d)}.`, `Subtract ${n(b)} from both sides: ${poly([a - c, 0])} = ${n(d - b)}.`, `Divide by ${n(a - c)}: x = ${n(x)}.`],
    difficulty: "medium",
  };
});

const distribute = g("distribute", "Distribute and combine like terms", (r) => {
  const a = r.nz(-6, 6), b = r.nz(-8, 8), c = r.nz(-7, 7), d = r.int(-9, 9);
  const k = a + c, m = a * b + d;
  return {
    stem: `Simplify: ${n(a)}(${plus("x", b)}) ${c < 0 ? MINUS : "+"} ${Math.abs(c) === 1 ? "" : Math.abs(c)}x${signed(d)}`,
    answer: poly([k, m]),
    wrong: [
      [poly([k, b + d]), `Only multiplied ${n(a)} by x, not by ${n(b)}.`],
      [poly([a - c, m]), "Subtracted the x terms instead of adding them."],
      [poly([k, a * b - d]), `Sign error on the ${n(d)}.`],
    ],
    steps: [`Distribute: ${n(a)} · x + ${n(a)} · ${n(b)} = ${poly([a, a * b])}.`, `Combine x terms: ${n(a)}x + ${n(c)}x = ${poly([k, 0])}.`, `Combine constants: ${n(a * b)} + ${n(d)} = ${n(m)}. Result: ${poly([k, m])}.`],
    difficulty: "easy",
  };
});

const absValue = g("abs-eq", "Absolute value equations", (r) => {
  const a = r.int(-9, 9), b = r.int(1, 10);
  const lo = a - b, hi = a + b;
  return {
    stem: `Solve: |x ${a >= 0 ? MINUS : "+"} ${Math.abs(a)}| = ${b}`,
    answer: `x = ${n(lo)} or x = ${n(hi)}`,
    wrong: [
      [`x = ${n(hi)} only`, "Missed the negative case: x − a can equal −b too."],
      [`x = ${n(-hi)} or x = ${n(-lo)}`, "Flipped the signs of both solutions."],
      [`x = ${n(b - a)} or x = ${n(-b - a)}`, `Added ${n(a)} with the wrong sign.`],
    ],
    steps: [`Split into two equations: x ${a >= 0 ? MINUS : "+"} ${Math.abs(a)} = ${b} or x ${a >= 0 ? MINUS : "+"} ${Math.abs(a)} = ${MINUS}${b}.`, `Solve each: x = ${n(hi)} or x = ${n(lo)}.`],
    difficulty: "medium",
  };
});

const proportion = g("proportion", "Ratios and proportions", (r) => {
  const a = r.int(2, 9), b = r.int(a + 1, 15), k = r.int(2, 6);
  const c = b * k, x = a * k;
  return {
    stem: `Solve the proportion: ${a}/${b} = x/${c}`,
    answer: `x = ${x}`,
    wrong: [
      [`x = ${frac(b * c, a)}`, "Cross-multiplied the wrong pair."],
      [`x = ${c - (b - a)}`, "Kept the difference the same instead of the ratio."],
      [`x = ${a + k}`, `Added ${k} instead of multiplying by ${k}.`],
    ],
    steps: [`Cross-multiply: ${b} · x = ${a} · ${c} = ${a * c}.`, `Divide by ${b}: x = ${x}.`],
    difficulty: "easy",
  };
});

const inequality = g("inequality", "Solving linear inequalities", (r) => {
  const a = r.nz(-6, 6), x = r.int(-8, 8), b = r.int(-10, 10);
  const op = r.pick(["<", ">", "≤", "≥"] as const);
  const flip: Record<string, string> = { "<": ">", ">": "<", "≤": "≥", "≥": "≤" };
  const c = a * x + b;
  const res = a < 0 ? flip[op] : op;
  return {
    stem: `Solve: ${poly([a, b])} ${op} ${n(c)}`,
    answer: `x ${res} ${n(x)}`,
    wrong: [
      [`x ${a < 0 ? op : flip[op]} ${n(x)}`, a < 0 ? "Forgot to flip the sign when dividing by a negative." : "Flipped the sign, but you only flip when dividing by a negative."],
      [`x ${res} ${frac(c + b, a)}`, `Added ${n(b)} instead of subtracting it.`],
      [`x ${res} ${n(-x)}`, "Sign error in the last step."],
    ],
    steps: [`Subtract ${n(b)}: ${poly([a, 0])} ${op} ${n(c - b)}.`, `Divide by ${n(a)}${a < 0 ? " and flip the inequality, because you divided by a negative" : ""}: x ${res} ${n(x)}.`],
    difficulty: "medium",
  };
});

// ── Linear functions ────────────────────────────────────────────────────────

const slope2pts = g("slope-points", "Slope from two points", (r) => {
  const x1 = r.int(-8, 8), y1 = r.int(-8, 8);
  let x2 = r.int(-8, 8);
  if (x2 === x1) x2 = x1 + r.pick([2, 3, -3]);
  const y2 = r.int(-8, 8);
  const ans = frac(y2 - y1, x2 - x1);
  const opts = [frac(x2 - x1, y2 - y1 || 1), frac(-(y2 - y1), x2 - x1), frac(y2 + y1, x2 + x1 || 1)];
  return {
    stem: `What is the slope of the line through (${n(x1)}, ${n(y1)}) and (${n(x2)}, ${n(y2)})?`,
    answer: ans,
    wrong: [
      [opts[0], "Used run over rise. Slope is rise over run: change in y ÷ change in x."],
      [opts[1], "Subtracted the coordinates in opposite orders (sign error)."],
      [opts[2], "Added the coordinates instead of subtracting."],
    ],
    steps: [`m = (y₂ − y₁) / (x₂ − x₁) = (${n(y2)} − ${n(y1)}) / (${n(x2)} − ${n(x1)}).`, `= ${n(y2 - y1)} / ${n(x2 - x1)} = ${ans}.`],
    difficulty: "easy",
  };
});

const lineThrough = g("line-equation", "Writing the equation of a line", (r) => {
  const m = r.nz(-5, 5), x1 = r.int(-6, 6), y1 = r.int(-9, 9);
  const b = y1 - m * x1;
  return {
    stem: `Which is the equation of the line with slope ${n(m)} through the point (${n(x1)}, ${n(y1)})?`,
    answer: `y = ${poly([m, b])}`,
    wrong: [
      [`y = ${poly([m, y1 + m * x1])}`, "Sign error finding b: b = y₁ − m·x₁."],
      [`y = ${poly([m, y1])}`, "Used the y-coordinate of the point as the y-intercept."],
      [`y = ${poly([-m, b === 0 ? 1 : b])}`, "Flipped the sign of the slope."],
    ],
    steps: [`Start with y = mx + b and plug in the point: ${n(y1)} = ${n(m)}(${n(x1)}) + b.`, `${n(y1)} = ${n(m * x1)} + b, so b = ${n(b)}.`, `The line is y = ${poly([m, b])}.`],
    difficulty: "medium",
  };
});

const standardSlope = g("standard-form", "Slope and intercepts from standard form", (r) => {
  const A = r.nz(-6, 6), B = r.nz(-6, 6), x0 = r.int(-4, 4), y0 = r.int(-4, 4);
  const C = A * x0 + B * y0;
  return {
    stem: `What is the slope of the line ${poly([A, 0])}${B < 0 ? ` ${MINUS} ` : " + "}${Math.abs(B) === 1 ? "" : Math.abs(B)}y = ${n(C)}?`,
    answer: frac(-A, B),
    wrong: [
      [frac(A, B), "Forgot the negative: solving for y gives y = (−A/B)x + C/B."],
      [frac(-B, A), "Used −B/A. The slope is −A/B."],
      [frac(C, B), "That's the y-intercept, not the slope."],
    ],
    steps: [`Solve for y: ${Math.abs(B) === 1 ? (B < 0 ? MINUS : "") : n(B)}y = ${poly([-A, C])}.`, `Divide by ${n(B)}: y = (${frac(-A, B)})x + ${frac(C, B)}.`, `The slope is ${frac(-A, B)}.`],
    difficulty: "medium",
  };
});

const perpendicular = g("perp-slope", "Parallel and perpendicular slopes", (r) => {
  const p = r.nz(-6, 6), q = r.int(1, 5);
  const kind = r.pick(["perpendicular", "parallel"] as const);
  const ans = kind === "parallel" ? frac(p, q) : frac(-q, p);
  return {
    stem: `A line has slope ${frac(p, q)}. What is the slope of a line ${kind} to it?`,
    answer: ans,
    wrong: kind === "parallel"
      ? [[frac(-q, p), "That's the perpendicular slope. Parallel lines have equal slopes."], [frac(-p, q), "Parallel lines keep the same sign."], [frac(q, p), "Parallel lines have the same slope, not the reciprocal."]]
      : [[frac(q, p), "Took the reciprocal but forgot to change the sign."], [frac(-p, q), "Changed the sign but forgot the reciprocal."], [frac(p, q), "That's the parallel slope."]],
    steps: kind === "parallel" ? ["Parallel lines have the same slope.", `Slope = ${ans}.`] : ["Perpendicular slopes are negative reciprocals: flip the fraction and change the sign.", `${frac(p, q)} → ${ans}.`],
    difficulty: "easy",
  };
});

const systems = g("systems", "Systems of linear equations", (r) => {
  const x = r.int(-6, 6), y = r.int(-6, 6);
  let a = r.nz(-5, 5), b = r.nz(-5, 5), c = r.nz(-5, 5), d = r.nz(-5, 5);
  if (a * d - b * c === 0) d = d + 1 || 2;
  if (a * d - b * c === 0) { a = 2; b = 1; c = 1; d = -1; }
  const e = a * x + b * y, f = c * x + d * y;
  const eq = (p: number, q: number, s: number) => `${poly([p, 0])}${q < 0 ? ` ${MINUS} ` : " + "}${Math.abs(q) === 1 ? "" : Math.abs(q)}y = ${n(s)}`;
  return {
    stem: `Solve the system:\n${eq(a, b, e)}\n${eq(c, d, f)}`,
    answer: `(${n(x)}, ${n(y)})`,
    wrong: [
      [`(${n(y)}, ${n(x)})`, "Swapped x and y."],
      [`(${n(-x)}, ${n(y)})`, "Sign error when solving for x."],
      [`(${n(x)}, ${n(-y)})`, "Sign error when solving for y."],
    ],
    steps: [
      `Eliminate one variable: multiply and subtract so y cancels: (${n(a * d - b * c)})x = ${n(e * d - b * f)}, so x = ${n(x)}.`,
      `Substitute back into the first equation: ${n(a)}(${n(x)}) + ${n(b)}y = ${n(e)}, so y = ${n(y)}.`,
      `Check in the second equation: ${n(c)}(${n(x)}) + ${n(d)}(${n(y)}) = ${n(f)}. ✓`,
    ],
    difficulty: "medium",
  };
});

const funcEval = g("function-eval", "Function notation", (r) => {
  const a = r.nz(-4, 4), b = r.int(-6, 6), c = r.int(-9, 9), k = r.int(-4, 4);
  const val = a * k * k + b * k + c;
  return {
    stem: `If f(x) = ${poly([a, b, c])}, what is f(${n(k)})?`,
    answer: n(val),
    wrong: [
      [n(a * -(k * k) + b * k + c), `Squared ${n(k)} without the parentheses: (${n(k)})² = ${k * k}.`],
      [n(a * 2 * k + b * k + c), "Multiplied by 2 instead of squaring."],
      [n(a * k * k - b * k + c), "Sign error on the middle term."],
    ].filter(([w]) => w !== n(val)) as [string, string][],
    steps: [`Replace every x with (${n(k)}): f(${n(k)}) = ${n(a)}(${n(k)})² + ${n(b)}(${n(k)}) + ${n(c)}.`, `= ${n(a * k * k)} + ${n(b * k)} + ${n(c)} = ${n(val)}.`],
    difficulty: "easy",
  };
});

const composition = g("composition", "Composition of functions", (r) => {
  const a = r.nz(-4, 4), b = r.int(-6, 6), c = r.nz(-3, 3), d = r.int(-5, 5), k = r.int(-3, 4);
  const gk = c * k + d, fg = a * gk + b, gf = c * (a * k + b) + d;
  return {
    stem: `f(x) = ${poly([a, b])} and g(x) = ${poly([c, d])}. What is f(g(${n(k)}))?`,
    answer: n(fg),
    wrong: [
      [n(gf), "That's g(f(x)). Work from the inside out: g first, then f."],
      [n((a * k + b) * (c * k + d)), "Multiplied f(k) and g(k). Composition plugs one into the other."],
      [n(a * k + b + gk), "Added f(k) and g(k)."],
    ],
    steps: [`Inside first: g(${n(k)}) = ${n(c)}(${n(k)}) + ${n(d)} = ${n(gk)}.`, `Then f(${n(gk)}) = ${n(a)}(${n(gk)}) + ${n(b)} = ${n(fg)}.`],
    difficulty: "medium",
  };
});

const inverse = g("inverse", "Inverse functions", (r) => {
  const a = r.nz(-6, 6), b = r.nz(-9, 9);
  const ans = Math.abs(a) === 1 ? (a === 1 ? `f⁻¹(x) = ${plus("x", -b)}` : `f⁻¹(x) = ${poly([-1, b])}`) : `f⁻¹(x) = (${plus("x", -b)})/${n(a)}`;
  return {
    stem: `Find the inverse of f(x) = ${poly([a, b])}.`,
    answer: ans,
    wrong: [
      [`f⁻¹(x) = (${plus("x", b)})/${n(a)}`, `Added ${n(b)} instead of subtracting it.`],
      [`f⁻¹(x) = 1/(${poly([a, b])})`, "The inverse is not the reciprocal."],
      [`f⁻¹(x) = ${n(a)}x ${b > 0 ? MINUS : "+"} ${Math.abs(b)}`, `Undid the ${n(b)} but multiplied by ${n(a)} instead of dividing.`],
    ],
    steps: [`Write y = ${poly([a, b])}, then swap x and y: x = ${poly([a, b], "y")}.`, `Solve for y: ${n(a)}y = ${plus("x", -b)}, so y = (${plus("x", -b)})/${n(a)}.`],
    difficulty: "medium",
  };
});

// ── Exponents, polynomials, quadratics ──────────────────────────────────────

const exponentRules = g("exponents", "Properties of exponents", (r) => {
  const a = r.int(2, 9), b = r.int(2, 9), c = r.int(1, 6);
  const e = a + b - c;
  return {
    stem: `Simplify: (x${sup(a)} · x${sup(b)}) / x${sup(c)}`,
    answer: `x${sup(e)}`,
    wrong: [
      [`x${sup(a * b - c)}`, "Multiplied the exponents. When you multiply powers, you add exponents."],
      [`x${sup(a + b + c)}`, "Added the exponent in the denominator. Dividing subtracts it."],
      [`x${sup(Math.max(1, Math.round((a * b) / c)))}`, "Multiplied and divided the exponents."],
      [`x${sup(a + b)}`, `Forgot to divide by x${sup(c)}.`],
      [`x${sup(a * b)}`, "Multiplied the exponents and ignored the denominator."],
      [`x${sup(e + 1)}`, "Off by one when subtracting the exponents."],
      [`x${sup(Math.abs(e - 1) || 2)}`, "Off by one when subtracting the exponents."],
    ].filter(([w]) => w !== `x${sup(e)}`) as [string, string][],
    steps: [`Multiplying: add exponents. x${sup(a)} · x${sup(b)} = x${sup(a + b)}.`, `Dividing: subtract exponents. x${sup(a + b)} / x${sup(c)} = x${sup(e)}.`],
    difficulty: "easy",
  };
});

const multiplyBinomials = g("foil", "Multiplying polynomials", (r) => {
  const p = r.nz(-9, 9), q = r.nz(-9, 9);
  return {
    stem: `Multiply: (${plus("x", p)})(${plus("x", q)})`,
    answer: poly([1, p + q, p * q]),
    wrong: [
      [poly([1, 0, p * q]), "Forgot the middle (outer + inner) terms."],
      [poly([1, p * q, p + q]), "Swapped the middle term and the constant."],
      [poly([1, p + q, -(p * q)]), "Sign error on the constant."],
    ],
    steps: [`First: x · x = x². Outer + inner: ${n(q)}x + ${n(p)}x = ${n(p + q)}x. Last: ${n(p)} · ${n(q)} = ${n(p * q)}.`, `Result: ${poly([1, p + q, p * q])}.`],
    difficulty: "easy",
  };
});

const factorTrinomial = g("factor", "Factoring trinomials", (r) => {
  const p = r.nz(-9, 9);
  let q = r.nz(-9, 9);
  if (q === -p) q = q + 1 || 2;
  const b = p + q, c = p * q;
  return {
    stem: `Factor: ${poly([1, b, c])}`,
    answer: `(${plus("x", p)})(${plus("x", q)})`,
    wrong: [
      [`(${plus("x", -p)})(${plus("x", -q)})`, "Right numbers, wrong signs. Check: they must add to the middle coefficient."],
      [`(${plus("x", p)})(${plus("x", -q)})`, "One sign is off: the product must match the constant."],
      [`(${plus("x", b)})(${plus("x", 1)})`, "The numbers must multiply to the constant and add to the middle term."],
    ].filter(([w]) => w !== `(${plus("x", p)})(${plus("x", q)})` && w !== `(${plus("x", q)})(${plus("x", p)})`) as [string, string][],
    steps: [`Find two numbers that multiply to ${n(c)} and add to ${n(b)}: ${n(p)} and ${n(q)}.`, `So ${poly([1, b, c])} = (${plus("x", p)})(${plus("x", q)}).`],
    difficulty: "medium",
  };
});

const solveFactoring = g("quad-roots", "Solving quadratics by factoring", (r) => {
  const p = r.int(-9, 9);
  let q = r.int(-9, 9);
  if (q === p) q = p + 2;
  const b = -(p + q), c = p * q;
  const [lo, hi] = [Math.min(p, q), Math.max(p, q)];
  return {
    stem: `Solve: ${poly([1, b, c])} = 0`,
    answer: `x = ${n(lo)} or x = ${n(hi)}`,
    wrong: [
      [`x = ${n(-hi)} or x = ${n(-lo)}`, "Used the numbers in the factors as the solutions. If (x − 3) = 0, x = 3, not −3."],
      [`x = ${n(lo)} only`, "A quadratic like this has two solutions."],
      [`x = ${n(b)} or x = ${n(c)}`, "Read the coefficients as answers instead of factoring."],
    ],
    steps: [`Factor: (${plus("x", -p)})(${plus("x", -q)}) = 0.`, `Set each factor to zero: x = ${n(p)} or x = ${n(q)}.`],
    difficulty: "medium",
  };
});

const discriminant = g("discriminant", "The discriminant", (r) => {
  const a = r.nz(-4, 4), b = r.int(-8, 8), c = r.int(-8, 8);
  const D = b * b - 4 * a * c;
  const count = D > 0 ? "2 real solutions" : D === 0 ? "1 real solution" : "No real solutions (2 complex)";
  const others = ["2 real solutions", "1 real solution", "No real solutions (2 complex)"].filter((x) => x !== count);
  return {
    stem: `How many real solutions does ${poly([a, b, c])} = 0 have?`,
    answer: count,
    wrong: [
      [others[0], `Check the discriminant: b² − 4ac = ${n(D)}.`],
      [others[1], `b² − 4ac = ${n(D)}: ${D > 0 ? "positive means two" : D === 0 ? "zero means one" : "negative means none"}.`],
      ["Infinitely many", "A nonzero quadratic has at most two solutions."],
    ],
    steps: [`Discriminant: b² − 4ac = (${n(b)})² − 4(${n(a)})(${n(c)}) = ${b * b} ${signed(-4 * a * c).trim()} = ${n(D)}.`, `${D > 0 ? "Positive" : D === 0 ? "Zero" : "Negative"}, so: ${count.toLowerCase()}.`],
    difficulty: "medium",
  };
});

const quadFormula = g("quad-formula", "The quadratic formula", (r) => {
  // Roots of the form h ± √k with k not a perfect square.
  const h = r.int(-5, 5);
  const k = r.pick([2, 3, 5, 6, 7, 10, 11, 13]);
  const b = -2 * h, c = h * h - k;
  return {
    stem: `Solve with the quadratic formula: ${poly([1, b, c])} = 0`,
    answer: `x = ${n(h)} ± √${k}`,
    wrong: [
      [`x = ${n(-h)} ± √${k}`, "Forgot the − in −b."],
      [`x = ${n(h)} ± √${4 * k}`, "Didn't simplify: √(4·k)/2 = √k."],
      [`x = ${n(b)} ± √${k}`, "Forgot to divide −b by 2a."],
    ],
    steps: [`a = 1, b = ${n(b)}, c = ${n(c)}. Discriminant: ${b * b} − 4(${n(c)}) = ${4 * k}.`, `x = (${n(-b)} ± √${4 * k}) / 2 = ${n(h)} ± √${k}.`],
    difficulty: "hard",
  };
});

const vertex = g("vertex", "Vertex of a parabola", (r) => {
  const a = r.nz(-3, 3), h = r.int(-6, 6), k = r.int(-9, 9);
  const b = -2 * a * h, c = a * h * h + k;
  return {
    stem: `What is the vertex of y = ${poly([a, b, c])}?`,
    answer: `(${n(h)}, ${n(k)})`,
    wrong: [
      [`(${n(-h)}, ${n(a * h * h + b * -h + c)})`, "Forgot the negative in x = −b/(2a)."],
      [`(${n(h)}, ${n(c)})`, "Used c as the y-value. Plug the x-value back in."],
      [`(${frac(-b, a)}, ${n(k)})`, "Forgot to divide by 2a."],
    ],
    steps: [`x = −b/(2a) = ${n(-b)}/${n(2 * a)} = ${n(h)}.`, `y = ${n(a)}(${n(h)})² + ${n(b)}(${n(h)}) + ${n(c)} = ${n(k)}.`, `Vertex: (${n(h)}, ${n(k)}).`],
    difficulty: "medium",
  };
});

const completeSquare = g("complete-square", "Completing the square", (r) => {
  const h = r.nz(-7, 7), k = r.int(-12, 12);
  const b = 2 * h, c = h * h + k;
  return {
    stem: `Rewrite ${poly([1, b, c])} in vertex form.`,
    answer: `(${plus("x", h)})² ${k >= 0 ? "+" : MINUS} ${Math.abs(k)}`,
    wrong: [
      [`(${plus("x", b)})² ${c - b * b >= 0 ? "+" : MINUS} ${Math.abs(c - b * b)}`, "Used b instead of b/2."],
      [`(${plus("x", -h)})² ${k >= 0 ? "+" : MINUS} ${Math.abs(k)}`, "Sign error inside the parentheses."],
      [`(${plus("x", h)})² ${c + h * h >= 0 ? "+" : MINUS} ${Math.abs(c + h * h)}`, "Added (b/2)² instead of subtracting it to balance."],
    ],
    steps: [`Half of ${n(b)} is ${n(h)}; square it: ${h * h}.`, `${poly([1, b, c])} = (${poly([1, b, h * h])}) + ${n(c)} − ${h * h} = (${plus("x", h)})²${signed(k)}.`],
    difficulty: "hard",
  };
});

const complexMult = g("complex", "Complex numbers", (r) => {
  const a = r.int(-6, 6), b = r.nz(-6, 6), c = r.int(-6, 6), d = r.nz(-6, 6);
  const re = a * c - b * d, im = a * d + b * c;
  const cx = (x: number, y: number) => `${n(x)} ${y < 0 ? MINUS : "+"} ${Math.abs(y)}i`;
  return {
    stem: `Multiply: (${cx(a, b)})(${cx(c, d)})`,
    answer: cx(re, im),
    wrong: [
      [cx(a * c + b * d, im), "Forgot that i² = −1."],
      [cx(a * c, b * d), "Multiplied only the matching parts. Use FOIL."],
      [cx(re, a * d - b * c), "Sign error on the imaginary part."],
    ],
    steps: [`FOIL: ${n(a * c)} + ${n(a * d)}i + ${n(b * c)}i + ${n(b * d)}i².`, `Since i² = −1: ${n(a * c)} ${signed(-b * d).trim()} + (${n(a * d + b * c)})i = ${cx(re, im)}.`],
    difficulty: "medium",
  };
});

const radicals = g("radicals", "Simplifying radicals", (r) => {
  const s = r.pick([2, 3, 5, 6, 7]);
  const k = r.int(2, 7);
  const inside = k * k * s;
  return {
    stem: `Simplify: √${inside}`,
    answer: `${k}√${s}`,
    wrong: [
      [`${s}√${k}`, `Swapped: the perfect square ${k * k} comes out as ${k}.`],
      [`${k * k}√${s}`, `√${k * k} = ${k}, not ${k * k}.`],
      [`${Math.round(inside / 2)}`, "Divided by 2 instead of taking a square root."],
    ],
    steps: [`Find the largest perfect square factor: ${inside} = ${k * k} · ${s}.`, `√${inside} = √${k * k} · √${s} = ${k}√${s}.`],
    difficulty: "easy",
  };
});

// ── Exponential, logs, sequences ────────────────────────────────────────────

const percentChange = g("percent-change", "Percent change", (r) => {
  const old = r.int(4, 40) * 5, pct = r.pick([10, 15, 20, 25, 30, 40, 50]), up = r.pick([true, false]);
  const next = old * (1 + (up ? pct : -pct) / 100);
  return {
    stem: `A price ${up ? "rises" : "falls"} from $${old} to $${dec(next)}. What is the percent ${up ? "increase" : "decrease"}?`,
    answer: `${pct}%`,
    wrong: [
      [`${dec(Math.abs(next - old))}%`, "Used the dollar change as the percent. Divide by the original."],
      [`${dec((Math.abs(next - old) / next) * 100, 1)}%`, "Divided by the new price. Percent change uses the original."],
      [`${pct * 2}%`, "Doubled the change."],
    ],
    steps: [`Change = ${dec(next)} − ${old} = ${dec(next - old)}.`, `Percent change = change ÷ original = ${dec(Math.abs(next - old))} ÷ ${old} = ${pct / 100} = ${pct}%.`],
    difficulty: "easy",
  };
});

const expGrowth = g("exp-growth", "Exponential growth and decay", (r) => {
  const P = r.int(2, 20) * 100, rate = r.pick([2, 3, 4, 5, 6, 8, 10, 12]), t = r.int(2, 8), up = r.pick([true, true, false]);
  const f = 1 + (up ? rate : -rate) / 100;
  const val = P * f ** t;
  return {
    stem: `A quantity starts at ${P} and ${up ? "grows" : "decays"} by ${rate}% per year. To the nearest whole number, what is it after ${t} years?`,
    answer: `${Math.round(val)}`,
    wrong: [
      [`${Math.round(P * (1 + ((up ? 1 : -1) * rate * t) / 100))}`, "Used simple (linear) growth. It compounds: multiply by the factor each year."],
      [`${Math.round(P * (up ? rate / 100 : 1 - rate / 100) ** t)}`, up ? `The growth factor is 1 + ${rate / 100}, not ${rate / 100}.` : "Right factor idea, but check the base: 1 − r."],
      [`${Math.round(P * (1 + (up ? -rate : rate) / 100) ** t)}`, up ? "Used decay instead of growth." : "Used growth instead of decay."],
    ],
    steps: [`Model: A = P(1 ${up ? "+" : MINUS} r)ᵗ = ${P}(${f})${sup(t)}.`, `= ${dec(val, 2)} ≈ ${Math.round(val)}.`],
    difficulty: "medium",
  };
});

const logEval = g("logs", "Logarithms", (r) => {
  const b = r.pick([2, 3, 4, 5, 10]), k = r.int(-2, 5);
  const x = b ** k;
  const xs = k < 0 ? `1/${b ** -k}` : `${x}`;
  return {
    stem: `Evaluate: log${b === 10 ? "" : `_${b}`}(${xs})`,
    answer: n(k),
    wrong: [
      [n(-k || 1), "Sign error. log_b(1/bⁿ) is negative; log_b(bⁿ) is positive."],
      [`${dec(k < 0 ? 1 / (b ** -k * b) : x / b, 3)}`, "Divided by the base. A log asks: what power of the base gives this number?"],
      [n(k + 1), `Off by one: ${b}${sup(k)} = ${xs}.`],
    ].filter(([w]) => w !== n(k)) as [string, string][],
    steps: [`Ask: ${b} to what power equals ${xs}?`, `${b}${sup(k)} = ${xs}, so the answer is ${n(k)}.`],
    difficulty: "easy",
  };
});

const logEquation = g("log-equation", "Solving exponential and log equations", (r) => {
  const b = r.pick([2, 3, 5]), k = r.int(2, 5), m = r.int(1, 4);
  const rhs = b ** k;
  return {
    stem: `Solve: ${b}^(x ${m ? `+ ${m}` : ""}) = ${rhs}`,
    answer: `x = ${n(k - m)}`,
    wrong: [
      [`x = ${n(k + m)}`, `Added ${m} instead of subtracting it.`],
      [`x = ${frac(rhs, b) }`, "Divided by the base. Rewrite both sides with the same base."],
      [`x = ${n(k)}`, `That's the exponent x + ${m}; subtract ${m}.`],
    ],
    steps: [`Write ${rhs} as ${b}${sup(k)}.`, `Same base, so the exponents match: x + ${m} = ${k}, so x = ${n(k - m)}.`],
    difficulty: "medium",
  };
});

const arithSeq = g("arith-seq", "Arithmetic sequences", (r) => {
  const a1 = r.int(-10, 15), d = r.nz(-6, 8), k = r.int(8, 30);
  const ak = a1 + (k - 1) * d;
  return {
    stem: `An arithmetic sequence starts ${n(a1)}, ${n(a1 + d)}, ${n(a1 + 2 * d)}, … What is term ${k}?`,
    answer: n(ak),
    wrong: [
      [n(a1 + k * d), "Used k·d. The first term already counts, so it's (k − 1)·d."],
      [n(a1 * d ** 0 + (k - 2) * d), "Off by one: use (k − 1)·d."],
      [n(k * d), "Forgot to start from the first term."],
    ].filter(([w]) => w !== n(ak)) as [string, string][],
    steps: [`aₙ = a₁ + (n − 1)d, with a₁ = ${n(a1)} and d = ${n(d)}.`, `a${k} = ${n(a1)} + ${k - 1}(${n(d)}) = ${n(ak)}.`],
    difficulty: "easy",
  };
});

const geoSeq = g("geo-seq", "Geometric sequences", (r) => {
  const a1 = r.int(1, 6), q = r.pick([2, 3, -2]), k = r.int(4, 8);
  const ak = a1 * q ** (k - 1);
  return {
    stem: `A geometric sequence starts ${a1}, ${n(a1 * q)}, ${n(a1 * q * q)}, … What is term ${k}?`,
    answer: n(ak),
    wrong: [
      [n(a1 * q ** k), "Used rⁿ. It's r^(n − 1), because the first term has no factor of r."],
      [n(a1 + (k - 1) * q), "Treated it as arithmetic (adding) instead of multiplying."],
      [n(-ak), "Sign error with the negative ratio."],
    ].filter(([w]) => w !== n(ak)) as [string, string][],
    steps: [`aₙ = a₁ · r^(n − 1), with a₁ = ${a1} and r = ${n(q)}.`, `a${k} = ${a1} · (${n(q)})${sup(k - 1)} = ${n(ak)}.`],
    difficulty: "medium",
  };
});

const infiniteSeries = g("infinite-geo", "Infinite geometric series", (r) => {
  const a = r.int(2, 12), [p, q] = r.pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [-1, 2], [-1, 3]] as const);
  return {
    stem: `Find the sum: ${a} + ${a}(${frac(p, q)}) + ${a}(${frac(p, q)})² + …`,
    answer: frac(a * q, q - p),
    wrong: [
      [frac(a * q, q + p), "Used 1 + r in the denominator. The sum is a / (1 − r)."],
      [frac(a * p, q - p), "Used r in the numerator. The numerator is the first term, a."],
      ["The series diverges", `|r| = ${frac(Math.abs(p), q)} < 1, so it converges.`],
    ],
    steps: [`First term a = ${a}, ratio r = ${frac(p, q)}. Since |r| < 1 the series converges.`, `S = a / (1 − r) = ${a} / (${frac(q - p, q)}) = ${frac(a * q, q - p)}.`],
    difficulty: "medium",
  };
});

// ── Geometry ────────────────────────────────────────────────────────────────

const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15], [20, 21, 29]] as const;

const pythagorean = g("pythagorean", "The Pythagorean theorem", (r) => {
  const [a, b, c] = r.pick(TRIPLES);
  const findLeg = r.pick([true, false]);
  return findLeg
    ? {
        stem: `A right triangle has hypotenuse ${c} and one leg ${a}. How long is the other leg?`,
        answer: `${b}`,
        wrong: [[`√${a * a + c * c}`, "Added the squares. To find a leg, subtract: c² − a²."], [`${c - a}`, "Subtracted the sides instead of their squares."], [`${c + a}`, "Added the sides."]],
        steps: [`a² + b² = c², so b² = ${c}² − ${a}² = ${c * c} − ${a * a} = ${b * b}.`, `b = √${b * b} = ${b}.`],
        difficulty: "easy",
      }
    : {
        stem: `A right triangle has legs ${a} and ${b}. How long is the hypotenuse?`,
        answer: `${c}`,
        wrong: [[`${a + b}`, "Added the legs. Add their squares, then take the root."], [`${a * a + b * b}`, "Forgot the square root."], [`√${Math.abs(b * b - a * a)}`, "Subtracted the squares. For the hypotenuse, add them."]],
        steps: [`c² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c}.`, `c = √${c * c} = ${c}.`],
        difficulty: "easy",
      };
});

const specialRight = g("special-right", "Special right triangles", (r) => {
  const s = r.int(2, 12);
  return r.pick([true, false])
    ? {
        stem: `In a 45°-45°-90° triangle, each leg is ${s}. How long is the hypotenuse?`,
        answer: `${s}√2`,
        wrong: [[`${s}√3`, "√3 belongs to the 30-60-90 triangle."], [`${2 * s}`, "Doubling is the 30-60-90 hypotenuse rule."], [`${s}/√2`, "Divided instead of multiplied by √2."]],
        steps: ["In a 45-45-90 triangle, hypotenuse = leg · √2.", `${s} · √2 = ${s}√2.`],
        difficulty: "easy",
      }
    : {
        stem: `In a 30°-60°-90° triangle, the short leg is ${s}. How long is the long leg?`,
        answer: `${s}√3`,
        wrong: [[`${2 * s}`, "That's the hypotenuse (2 × short leg)."], [`${s}√2`, "√2 belongs to the 45-45-90 triangle."], [`${s}/√3`, "Divided by √3 instead of multiplying."]],
        steps: ["In a 30-60-90 triangle: short leg x, long leg x√3, hypotenuse 2x.", `Long leg = ${s}√3.`],
        difficulty: "easy",
      };
});

const trigRatio = g("trig-ratio", "Trigonometric ratios", (r) => {
  const [a, b, c] = r.pick(TRIPLES);
  const fn = r.pick(["sin", "cos", "tan"] as const);
  const ans = fn === "sin" ? frac(a, c) : fn === "cos" ? frac(b, c) : frac(a, b);
  const all = { sin: frac(a, c), cos: frac(b, c), tan: frac(a, b) };
  const wrongs = (["sin", "cos", "tan"] as const).filter((f) => f !== fn).map((f) => [all[f], `That's ${f}. ${fn} = ${fn === "sin" ? "opposite/hypotenuse" : fn === "cos" ? "adjacent/hypotenuse" : "opposite/adjacent"}.`] as [string, string]);
  return {
    stem: `In right triangle ABC with the right angle at C, the side opposite angle A is ${a}, the side adjacent to A is ${b}, and the hypotenuse is ${c}. What is ${fn} A?`,
    answer: ans,
    wrong: [...wrongs, [fn === "tan" ? frac(b, a) : frac(c, fn === "sin" ? a : b), "Flipped the ratio."]],
    steps: ["SOH CAH TOA: sin = opposite/hypotenuse, cos = adjacent/hypotenuse, tan = opposite/adjacent.", `${fn} A = ${ans}.`],
    difficulty: "easy",
  };
});

const distanceMid = g("distance-midpoint", "Distance and midpoint", (r) => {
  const [a, b, c] = r.pick(TRIPLES);
  const x1 = r.int(-6, 6), y1 = r.int(-6, 6), sx = r.pick([1, -1]), sy = r.pick([1, -1]);
  const x2 = x1 + sx * a, y2 = y1 + sy * b;
  if (r.pick([true, false])) {
    return {
      stem: `What is the distance between (${n(x1)}, ${n(y1)}) and (${n(x2)}, ${n(y2)})?`,
      answer: `${c}`,
      wrong: [[`${a + b}`, "Added the changes in x and y. Use the Pythagorean theorem."], [`${c * c}`, "Forgot the square root."], [`√${Math.abs(a * a - b * b)}`, "Subtracted the squares instead of adding."]],
      steps: [`Δx = ${n(x2 - x1)}, Δy = ${n(y2 - y1)}.`, `d = √(${a * a} + ${b * b}) = √${c * c} = ${c}.`],
      difficulty: "easy",
    };
  }
  const mx = frac(x1 + x2, 2), my = frac(y1 + y2, 2);
  return {
    stem: `What is the midpoint of (${n(x1)}, ${n(y1)}) and (${n(x2)}, ${n(y2)})?`,
    answer: `(${mx}, ${my})`,
    wrong: [[`(${frac(x2 - x1, 2)}, ${frac(y2 - y1, 2)})`, "Subtracted. The midpoint averages: add, then divide by 2."], [`(${n(x1 + x2)}, ${n(y1 + y2)})`, "Forgot to divide by 2."], [`(${my}, ${mx})`, "Swapped x and y."]],
    steps: [`Average the x's: (${n(x1)} + ${n(x2)})/2 = ${mx}.`, `Average the y's: (${n(y1)} + ${n(y2)})/2 = ${my}.`],
    difficulty: "easy",
  };
});

const triangleAngles = g("triangle-angles", "Triangle angle sum", (r) => {
  const A = r.int(25, 80), B = r.int(25, 150 - A);
  const C = 180 - A - B;
  return r.pick([true, false])
    ? {
        stem: `Two angles of a triangle measure ${A}° and ${B}°. What is the third angle?`,
        answer: `${C}°`,
        wrong: [[`${360 - A - B}°`, "Used 360°. A triangle's angles add to 180°."], [`${A + B}°`, "That's the exterior angle at the third vertex."], [`${90 - Math.min(A, B)}°`, "This isn't necessarily a right triangle."]],
        steps: ["The angles of a triangle add to 180°.", `180° − ${A}° − ${B}° = ${C}°.`],
        difficulty: "easy",
      }
    : {
        stem: `Two interior angles of a triangle measure ${A}° and ${B}°. What is the exterior angle at the third vertex?`,
        answer: `${A + B}°`,
        wrong: [[`${C}°`, "That's the interior angle. The exterior angle is 180° minus it."], [`${360 - A - B}°`, "The exterior angle equals the sum of the two remote interior angles."], [`${180 - A}°`, "Only used one remote angle."]],
        steps: ["An exterior angle equals the sum of the two remote interior angles.", `${A}° + ${B}° = ${A + B}°.`],
        difficulty: "medium",
      };
});

const polygonAngles = g("polygon-angles", "Angles of polygons", (r) => {
  const sides = r.pick([5, 6, 8, 9, 10, 12]);
  const names: Record<number, string> = { 5: "pentagon", 6: "hexagon", 8: "octagon", 9: "nonagon", 10: "decagon", 12: "dodecagon" };
  const sum = (sides - 2) * 180, each = sum / sides;
  return {
    stem: `What is the measure of each interior angle of a regular ${names[sides]}?`,
    answer: `${dec(each, 1)}°`,
    wrong: [[`${dec(360 / sides, 1)}°`, "That's each exterior angle."], [`${sum}°`, "That's the sum of all the interior angles."], [`${dec((sides * 180) / sides - 360 / (sides * 2), 1)}°`, "Use (n − 2) · 180° ÷ n."]],
    steps: [`Interior angle sum = (n − 2) · 180° = ${sides - 2} · 180° = ${sum}°.`, `Each angle = ${sum}° ÷ ${sides} = ${dec(each, 1)}°.`],
    difficulty: "easy",
  };
});

const circleMeasure = g("circle", "Circumference and area of circles", (r) => {
  const rad = r.int(2, 12), kind = r.pick(["area", "circumference"] as const);
  return kind === "area"
    ? { stem: `A circle has radius ${rad}. What is its area?`, answer: pi(rad * rad), wrong: [[pi(2 * rad), "That's the circumference (2πr)."], [pi(4 * rad * rad), "Used the diameter in πr²."], [pi(rad), "Forgot to square the radius."]], steps: ["A = πr².", `A = π · ${rad}² = ${pi(rad * rad)}.`], difficulty: "easy" }
    : { stem: `A circle has radius ${rad}. What is its circumference?`, answer: pi(2 * rad), wrong: [[pi(rad * rad), "That's the area (πr²)."], [pi(rad), "Used πr. Circumference is 2πr."], [pi(4 * rad), "Doubled the diameter."]], steps: ["C = 2πr.", `C = 2π · ${rad} = ${pi(2 * rad)}.`], difficulty: "easy" };
});

const arcSector = g("arc-sector", "Arc length and sector area", (r) => {
  const rad = r.int(2, 12), deg = r.pick([30, 45, 60, 90, 120, 135, 150, 180, 240, 270]);
  const kind = r.pick(["arc", "sector"] as const);
  const arc = fracPi(2 * rad * deg, 360), sector = fracPi(rad * rad * deg, 360);
  return kind === "arc"
    ? { stem: `A circle has radius ${rad}. What is the length of an arc with a central angle of ${deg}°?`, answer: arc, wrong: [[sector, "That's the sector area."], [fracPi(rad * deg, 360), "Used r instead of 2πr for the full circle."], [`${rad * deg}`, "Multiplied radius by degrees. Convert to a fraction of the circle."], [fracPi(2 * rad, 1), "That's the whole circumference."]], steps: [`Fraction of the circle: ${deg}/360.`, `Arc = (${deg}/360) · 2π(${rad}) = ${arc}.`], difficulty: "medium" }
    : { stem: `A circle has radius ${rad}. What is the area of a sector with a central angle of ${deg}°?`, answer: sector, wrong: [[arc, "That's the arc length."], [fracPi(2 * rad * rad * deg, 360), "Used 2πr²."], [fracPi(rad * rad, 1), "That's the whole circle's area."], [fracPi(rad * deg, 360), "Forgot to square the radius."]], steps: [`Fraction of the circle: ${deg}/360.`, `Sector = (${deg}/360) · π(${rad})² = ${sector}.`], difficulty: "medium" };
});

const volume = g("volume", "Volume", (r) => {
  const shape = r.pick(["cylinder", "cone", "sphere", "prism"] as const);
  const rad = r.int(2, 9), h = r.int(2, 12) * (shape === "cone" ? 3 : 1);
  if (shape === "cylinder") return { stem: `What is the volume of a cylinder with radius ${rad} and height ${h}?`, answer: pi(rad * rad * h), wrong: [[fracPi(rad * rad * h, 3), "That's a cone (⅓ of the cylinder)."], [pi(2 * rad * h), "Used 2πrh, the side area."], [pi(rad * h), "Forgot to square the radius."]], steps: ["V = πr²h.", `V = π · ${rad}² · ${h} = ${pi(rad * rad * h)}.`], difficulty: "easy" };
  if (shape === "cone") return { stem: `What is the volume of a cone with radius ${rad} and height ${h}?`, answer: pi((rad * rad * h) / 3), wrong: [[pi(rad * rad * h), "That's a cylinder. A cone is ⅓ of it."], [fracPi(rad * h, 3), "Forgot to square the radius."], [fracPi(rad * rad * h, 2), "Used ½ instead of ⅓."]], steps: ["V = ⅓πr²h.", `V = ⅓ · π · ${rad}² · ${h} = ${pi((rad * rad * h) / 3)}.`], difficulty: "medium" };
  if (shape === "sphere") return { stem: `What is the volume of a sphere with radius ${rad}?`, answer: fracPi(4 * rad ** 3, 3), wrong: [[pi(4 * rad * rad), "That's the surface area (4πr²)."], [fracPi(4 * rad * rad, 3), "Used r² instead of r³."], [pi(rad ** 3), "Forgot the 4/3."]], steps: ["V = (4/3)πr³.", `V = (4/3) · π · ${rad}³ = ${fracPi(4 * rad ** 3, 3)}.`], difficulty: "medium" };
  const l = r.int(2, 10), w = r.int(2, 10);
  return { stem: `What is the volume of a rectangular prism that is ${l} by ${w} by ${h}?`, answer: `${l * w * h}`, wrong: [[`${2 * (l * w + l * h + w * h)}`, "That's the surface area."], [`${l + w + h}`, "Added the dimensions."], [`${l * w}`, "That's the base area only."]], steps: ["V = length × width × height.", `${l} × ${w} × ${h} = ${l * w * h}.`], difficulty: "easy" };
});

const similar = g("similar", "Similar figures", (r) => {
  const a = r.int(2, 9), k = r.pick([2, 3, 4, 1.5, 2.5]), b = r.int(3, 12);
  return {
    stem: `Triangle ABC is similar to triangle DEF. AB = ${a}, DE = ${dec(a * k)}, and BC = ${b}. What is EF?`,
    answer: dec(b * k),
    wrong: [[dec(b + (a * k - a)), "Added the difference. Similar figures scale by multiplying."], [dec(b / k), "Divided by the scale factor instead of multiplying."], [dec(a * k * b), "Multiplied all three lengths."]],
    steps: [`Scale factor = DE / AB = ${dec(a * k)} / ${a} = ${k}.`, `EF = BC × ${k} = ${b} × ${k} = ${dec(b * k)}.`],
    difficulty: "easy",
  };
});

// ── Trig ────────────────────────────────────────────────────────────────────

const UNIT = [
  { d: 30, rad: "π/6", sin: "1/2", cos: "√3/2", tan: "√3/3" },
  { d: 45, rad: "π/4", sin: "√2/2", cos: "√2/2", tan: "1" },
  { d: 60, rad: "π/3", sin: "√3/2", cos: "1/2", tan: "√3" },
  { d: 120, rad: "2π/3", sin: "√3/2", cos: "−1/2", tan: "−√3" },
  { d: 135, rad: "3π/4", sin: "√2/2", cos: "−√2/2", tan: "−1" },
  { d: 150, rad: "5π/6", sin: "1/2", cos: "−√3/2", tan: "−√3/3" },
  { d: 210, rad: "7π/6", sin: "−1/2", cos: "−√3/2", tan: "√3/3" },
  { d: 225, rad: "5π/4", sin: "−√2/2", cos: "−√2/2", tan: "1" },
  { d: 240, rad: "4π/3", sin: "−√3/2", cos: "−1/2", tan: "√3" },
  { d: 300, rad: "5π/3", sin: "−√3/2", cos: "1/2", tan: "−√3" },
  { d: 315, rad: "7π/4", sin: "−√2/2", cos: "√2/2", tan: "−1" },
  { d: 330, rad: "11π/6", sin: "−1/2", cos: "√3/2", tan: "−√3/3" },
] as const;

const neg = (s: string) => (s.startsWith("−") ? s.slice(1) : `−${s}`);

const unitCircle = g("unit-circle", "The unit circle", (r) => {
  const u = r.pick(UNIT), fn = r.pick(["sin", "cos"] as const);
  const ans = u[fn], other = u[fn === "sin" ? "cos" : "sin"];
  const wrong: [string, string][] = [[neg(ans), "Right value, wrong sign. Check which quadrant the angle is in."]];
  if (other !== ans && other !== neg(ans)) wrong.push([other, `That's ${fn === "sin" ? "cos" : "sin"}. sin is the y-coordinate, cos is the x-coordinate.`]);
  if (other !== ans && neg(other) !== neg(ans) && neg(other) !== ans) wrong.push([neg(other), `Mixed up sin and cos and the sign.`]);
  wrong.push([ans.includes("√") ? ans.replace(/√\d/, "1") : "√3/2", "Check the reference angle's value."]);
  return {
    stem: `What is ${fn}(${u.rad})?`,
    answer: ans,
    wrong: wrong.slice(0, 3),
    steps: [`${u.rad} = ${u.d}°. Its point on the unit circle is (cos, sin) = (${u.cos}, ${u.sin}).`, `${fn}(${u.rad}) = ${ans}.`],
    difficulty: "medium",
  };
});

const radians = g("radians", "Degrees and radians", (r) => {
  const u = r.pick(UNIT);
  return {
    stem: `Convert ${u.d}° to radians.`,
    answer: u.rad,
    wrong: [[`(${frac(u.d, 360)})π`, "Divided by 360. Multiply by π/180."], [frac(u.d, 180), "Right fraction, but radians need the π: degrees × π/180."], [neg(u.rad), "Positive angles stay positive."]],
    steps: ["radians = degrees × π/180.", `${u.d} × π/180 = ${u.rad}.`],
    difficulty: "easy",
  };
});

// ── Statistics and probability ──────────────────────────────────────────────

const centerSpread = g("center", "Mean, median, and range", (r) => {
  const len = r.pick([5, 6, 7]);
  const data = Array.from({ length: len }, () => r.int(1, 30)).sort((a, b) => a - b);
  const kind = r.pick(["mean", "median", "range"] as const);
  const sum = data.reduce((a, b) => a + b, 0);
  const mean = sum / len;
  const median = len % 2 ? data[(len - 1) / 2] : (data[len / 2 - 1] + data[len / 2]) / 2;
  const range = data[len - 1] - data[0];
  const vals = { mean: dec(mean, 2), median: dec(median, 1), range: `${range}` };
  const shuffled = [...data].sort(() => r.int(-1, 1));
  const wrong: [string, string][] = (["mean", "median", "range"] as const).filter((k) => k !== kind && vals[k] !== vals[kind]).map((k) => [vals[k], `That's the ${k}.`]);
  wrong.push([`${data[Math.floor(len / 2)] + (kind === "median" ? 1 : 0)}`, kind === "median" ? "Put the data in order first, then find the middle." : "Re-add the values carefully."]);
  wrong.push([dec(sum / (len - 1), 2), "Divided by one less than the count."]);
  return {
    stem: `Data: ${shuffled.join(", ")}. What is the ${kind}?`,
    answer: vals[kind],
    wrong: wrong.filter(([w]) => w !== vals[kind]).slice(0, 3),
    steps: [
      `In order: ${data.join(", ")}.`,
      kind === "mean" ? `Mean = sum ÷ count = ${sum} ÷ ${len} = ${vals.mean}.` : kind === "median" ? `Median = middle value${len % 2 ? "" : " (average of the two middle values)"} = ${vals.median}.` : `Range = max − min = ${data[len - 1]} − ${data[0]} = ${range}.`,
    ],
    difficulty: "easy",
  };
});

const simpleProb = g("probability", "Probability", (r) => {
  const red = r.int(2, 9), blue = r.int(2, 9), green = r.int(1, 6), tot = red + blue + green;
  if (r.pick([true, false])) {
    return {
      stem: `A bag has ${red} red, ${blue} blue, and ${green} green marbles. One is drawn at random. What is P(red or green)?`,
      answer: frac(red + green, tot),
      wrong: [[frac(red * green, tot * tot), "Multiplied. For “or” with no overlap, add the probabilities."], [frac(red + green, blue), "Divided by the blue marbles. Use the total."], [frac(red, tot), "Only counted red."]],
      steps: [`Total marbles: ${tot}. Red or green: ${red} + ${green} = ${red + green}.`, `P = ${red + green}/${tot} = ${frac(red + green, tot)}.`],
      difficulty: "easy",
    };
  }
  return {
    stem: `A bag has ${red} red and ${blue} blue marbles. Two are drawn without replacement. What is P(both red)?`,
    answer: frac(red * (red - 1), (red + blue) * (red + blue - 1)),
    wrong: [[frac(red * red, (red + blue) ** 2), "Treated it as with replacement. After one red is drawn, there's one fewer red and one fewer marble."], [frac(2 * red, red + blue), "Added instead of multiplying."], [frac(red - 1, red + blue - 1), "Only used the second draw."]],
    steps: [`First red: ${red}/${red + blue}. Then: ${red - 1}/${red + blue - 1}.`, `Multiply: ${frac(red * (red - 1), (red + blue) * (red + blue - 1))}.`],
    difficulty: "medium",
  };
});

const conditional = g("conditional", "Conditional probability", (r) => {
  const a = r.int(10, 40), b = r.int(10, 40), c = r.int(10, 40), d = r.int(10, 40);
  return {
    stem: `A survey: of students who play a sport, ${a} like math and ${b} don't. Of those who don't play, ${c} like math and ${d} don't. If a student likes math, what is the probability they play a sport?`,
    answer: frac(a, a + c),
    wrong: [[frac(a, a + b), "That's P(likes math | plays). The condition is “likes math”, so divide by everyone who likes math."], [frac(a, a + b + c + d), "That's P(plays and likes math). Divide by the condition's total."], [frac(a + c, a + b + c + d), "That's P(likes math)."]],
    steps: [`Condition on “likes math”: ${a} + ${c} = ${a + c} students.`, `Of them, ${a} play a sport: ${a}/${a + c} = ${frac(a, a + c)}.`],
    difficulty: "medium",
  };
});

const fact = (k: number): number => (k <= 1 ? 1 : k * fact(k - 1));

const counting = g("counting", "Permutations and combinations", (r) => {
  const total = r.int(5, 10), k = r.int(2, Math.min(4, total - 1));
  const P = fact(total) / fact(total - k), C = P / fact(k);
  return r.pick([true, false])
    ? { stem: `How many ways can a committee of ${k} be chosen from ${total} people?`, answer: `${C}`, wrong: [[`${P}`, "That counts ordered lineups. A committee has no order: divide by k!."], [`${total * k}`, "Multiplied n by k."], [`${total ** k}`, "Allowed the same person to be picked more than once."]], steps: [`Order doesn't matter: C(${total}, ${k}) = ${total}! / (${k}! · ${total - k}!).`, `= ${C}.`], difficulty: "medium" }
    : { stem: `In how many ways can ${total} runners finish 1st through ${k === 2 ? "2nd" : k === 3 ? "3rd" : `${k}th`}?`, answer: `${P}`, wrong: [[`${C}`, "That ignores order, but places are ordered."], [`${total ** k}`, "The same runner can't finish in two places."], [`${fact(total)}`, `That orders all ${total} runners, not just the top ${k}.`]], steps: [`Order matters: P(${total}, ${k}) = ${Array.from({ length: k }, (_, i) => total - i).join(" × ")}.`, `= ${P}.`], difficulty: "medium" };
});

const zScore = g("z-score", "z-scores", (r) => {
  const mu = r.int(40, 90), sd = r.int(3, 12), z = r.pick([-2.5, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 2.5]);
  const x = mu + z * sd;
  return {
    stem: `A distribution has mean ${mu} and standard deviation ${sd}. What is the z-score of ${dec(x, 1)}?`,
    answer: dec(z, 2),
    wrong: [[dec(-z, 2), "Sign error: z = (x − μ) / σ."], [dec(z * sd, 2), "Forgot to divide by the standard deviation."], [dec((x - mu) / (sd * sd), 2), "Divided by the variance. Use the standard deviation."]],
    steps: ["z = (x − μ) / σ.", `z = (${dec(x, 1)} − ${mu}) / ${sd} = ${dec(z, 2)}.`],
    difficulty: "easy",
  };
});

const binomial = g("binomial", "The binomial distribution", (r) => {
  const trials = r.int(4, 8), k = r.int(1, trials - 1), p = r.pick([0.2, 0.25, 0.3, 0.4, 0.5, 0.6]);
  const C = fact(trials) / (fact(k) * fact(trials - k));
  const val = C * p ** k * (1 - p) ** (trials - k);
  return {
    stem: `A free throw goes in with probability ${p}. In ${trials} independent shots, what is P(exactly ${k} go in)? Round to 3 decimals.`,
    answer: dec(val, 3),
    wrong: [[dec(p ** k * (1 - p) ** (trials - k), 3), `Forgot the C(${trials}, ${k}) = ${C} ways to arrange the makes.`], [dec(C * p ** k, 3), "Left out the misses' probability."], [dec(k / trials, 3), "That's the sample proportion, not a probability."]].filter(([w]) => w !== dec(val, 3)) as [string, string][],
    steps: [`P(X = ${k}) = C(${trials}, ${k}) · p${sup(k)} · (1 − p)${sup(trials - k)}.`, `= ${C} · ${p}${sup(k)} · ${dec(1 - p, 2)}${sup(trials - k)} ≈ ${dec(val, 3)}.`],
    difficulty: "hard",
  };
});

const expectedValue = g("expected-value", "Expected value", (r) => {
  const xs = [r.int(0, 3), r.int(4, 7), r.int(8, 12)];
  const ps = r.pick([[0.5, 0.3, 0.2], [0.2, 0.5, 0.3], [0.6, 0.3, 0.1], [0.25, 0.25, 0.5], [0.4, 0.4, 0.2]]);
  const ev = xs.reduce((s, x, i) => s + x * ps[i], 0);
  return {
    stem: `X takes the values ${xs.join(", ")} with probabilities ${ps.join(", ")}. What is E(X)?`,
    answer: dec(ev, 2),
    wrong: [[dec((xs[0] + xs[1] + xs[2]) / 3, 2), "Averaged the values without weighting by probability."], [dec(xs[ps.indexOf(Math.max(...ps))], 2), "Picked the most likely value."], [dec(ev + xs[0] * ps[0], 2), "Counted the first term twice."]].filter(([w]) => w !== dec(ev, 2)) as [string, string][],
    steps: ["E(X) = Σ x · P(x).", `= ${xs.map((x, i) => `${x}(${ps[i]})`).join(" + ")} = ${dec(ev, 2)}.`],
    difficulty: "medium",
  };
});

// ── Calculus ────────────────────────────────────────────────────────────────

const limitAlgebraic = g("limits", "Evaluating limits", (r) => {
  const a = r.nz(-6, 6), c = r.int(-5, 5);
  return {
    stem: `Find: lim (x → ${n(a)}) of (x² − ${a * a}) / (${plus("x", -a)})${c ? ` ${c > 0 ? "+" : MINUS} ${Math.abs(c)}` : ""}`,
    answer: n(2 * a + c),
    wrong: [["Does not exist", "0/0 means simplify, not “no limit”: factor and cancel."], [n(c), "Plugged in to get 0/0 and treated it as 0."], [n(a + c), "Canceled incorrectly: (x² − a²)/(x − a) = x + a."]],
    steps: [`Plugging in gives 0/0, so factor: x² − ${a * a} = (${plus("x", -a)})(${plus("x", a)}).`, `Cancel (${plus("x", -a)}): the limit is ${n(a)} + ${n(a)}${c ? signed(c) : ""} = ${n(2 * a + c)}.`],
    difficulty: "medium",
  };
});

const powerRule = g("power-rule", "The power rule", (r) => {
  const a = r.nz(-5, 6), p = r.int(2, 6), b = r.nz(-8, 8), c = r.int(-9, 9);
  return {
    stem: `Find the derivative of f(x) = ${poly([a, ...Array(p - 2).fill(0), b, c])}`,
    answer: `f′(x) = ${poly([a * p, ...Array(p - 2).fill(0), b])}`,
    wrong: [
      [`f′(x) = ${poly([a * p, ...Array(p - 2).fill(0), b, c])}`, "The derivative of a constant is 0."],
      [`f′(x) = ${poly([a, ...Array(p - 2).fill(0), b])}`, "Lowered the power but forgot to multiply by it."],
      [`f′(x) = ${poly([a * p, ...Array(p - 1).fill(0), b])}`, "Forgot to subtract 1 from the exponent."],
    ],
    steps: [`Power rule: d/dx xⁿ = n·xⁿ⁻¹. Constants go to 0.`, `d/dx ${poly([a, ...Array(p).fill(0)])} = ${poly([a * p, ...Array(p - 1).fill(0)])}; d/dx ${poly([b, 0])} = ${n(b)}.`],
    difficulty: "easy",
  };
});

const derivAtPoint = g("derivative-value", "Derivative at a point", (r) => {
  const a = r.nz(-4, 4), b = r.int(-6, 6), c = r.int(-9, 9), k = r.int(-3, 3);
  const slope = 2 * a * k + b;
  return {
    stem: `f(x) = ${poly([a, b, c])}. What is the slope of the tangent line at x = ${n(k)}?`,
    answer: n(slope),
    wrong: [[n(a * k * k + b * k + c), "That's f(k), the height, not the slope."], [n(a * k * k + b), "Didn't apply the power rule to x²."], [n(2 * a * k), "Dropped the derivative of the linear term."]].filter(([w]) => w !== n(slope)) as [string, string][],
    steps: [`f′(x) = ${poly([2 * a, b])}.`, `f′(${n(k)}) = ${n(2 * a)}(${n(k)}) + ${n(b)} = ${n(slope)}.`],
    difficulty: "medium",
  };
});

const chainRule = g("chain-rule", "The chain rule", (r) => {
  const a = r.nz(-5, 5), b = r.nz(-7, 7), p = r.int(2, 7);
  const inner = poly([a, b]);
  return {
    stem: `Find d/dx of (${inner})${sup(p)}`,
    answer: `${n(p * a)}(${inner})${sup(p - 1)}`,
    wrong: [[`${p}(${inner})${sup(p - 1)}`, `Forgot to multiply by the inner derivative, ${n(a)}.`], [`${n(p * a)}(${inner})${sup(p)}`, "Forgot to lower the power."], [`${n(p)}(${n(a)})${sup(p - 1)}`, "Differentiated the inside and outside separately and dropped the inside function."]],
    steps: [`Outside: d/du u${sup(p)} = ${p}u${sup(p - 1)}. Inside: d/dx (${inner}) = ${n(a)}.`, `Multiply: ${p}(${inner})${sup(p - 1)} · ${n(a)} = ${n(p * a)}(${inner})${sup(p - 1)}.`],
    difficulty: "medium",
  };
});

const productRule = g("product-rule", "Product and quotient rules", (r) => {
  const a = r.nz(-4, 4), b = r.int(-5, 5), c = r.nz(-4, 4), d = r.int(-5, 5), k = r.int(-2, 3);
  const f = a * k + b, gk = c * k + d;
  const ans = a * gk + f * c;
  return {
    stem: `h(x) = (${poly([a, b])})(${poly([c, d])}). What is h′(${n(k)})?`,
    answer: n(ans),
    wrong: [[n(a * c), "Multiplied the derivatives. Product rule: f′g + fg′."], [n(f * gk), "That's h(k), not h′(k)."], [n(a * gk - f * c), "Subtracted: that's the quotient rule's numerator."]].filter(([w]) => w !== n(ans)) as [string, string][],
    steps: [`Product rule: h′ = f′g + fg′, with f′ = ${n(a)} and g′ = ${n(c)}.`, `At x = ${n(k)}: f = ${n(f)}, g = ${n(gk)}. h′ = ${n(a)}(${n(gk)}) + (${n(f)})(${n(c)}) = ${n(ans)}.`],
    difficulty: "medium",
  };
});

const antiderivative = g("antiderivative", "Antiderivatives", (r) => {
  const p = r.int(1, 5), a = (p + 1) * r.nz(-4, 4), b = r.nz(-8, 8);
  return {
    stem: `Find ∫ (${poly([a, ...Array(p - 1).fill(0), b])}) dx${p === 1 ? "" : ""}`,
    answer: `${poly([a / (p + 1), ...Array(p - 1).fill(0), b, 0])} + C`,
    wrong: [
      [`${poly([a / (p + 1), ...Array(p - 1).fill(0), b, 0])}`, "Forgot the + C."],
      [`${poly([a * p, ...Array(p - 1).fill(0)])} + C`, "Took the derivative instead of the antiderivative."],
      [`${poly([a, ...Array(p - 1).fill(0), b, 0])} + C`, `Raised the power but forgot to divide by ${p + 1}.`],
    ],
    steps: ["Reverse power rule: ∫ xⁿ dx = xⁿ⁺¹/(n + 1) + C.", `∫ ${n(a)}x${p === 1 ? "" : sup(p)} dx = ${poly([a / (p + 1), ...Array(p + 1).fill(0)])}; ∫ ${n(b)} dx = ${n(b)}x.`],
    difficulty: "easy",
  };
});

const definiteIntegral = g("definite-integral", "Definite integrals", (r) => {
  const a = 3 * r.nz(-3, 3), b = 2 * r.int(-4, 4), lo = r.int(-2, 1), hi = lo + r.int(1, 3);
  const F = (x: number) => (a / 3) * x ** 3 + (b / 2) * x * x;
  const val = F(hi) - F(lo);
  return {
    stem: `Evaluate ∫ from ${n(lo)} to ${n(hi)} of (${poly([a, b, 0])}) dx`,
    answer: dec(val, 2),
    wrong: [[dec(F(lo) - F(hi), 2), "Subtracted in the wrong order: F(b) − F(a)."], [dec(F(hi), 2), "Forgot to subtract F(lower bound)."], [dec(a * hi * hi + b * hi - (a * lo * lo + b * lo), 2), "Evaluated the integrand, not the antiderivative."]].filter(([w]) => w !== dec(val, 2)) as [string, string][],
    steps: [`Antiderivative: F(x) = ${poly([a / 3, b / 2, 0, 0])}.`, `F(${n(hi)}) − F(${n(lo)}) = ${dec(F(hi), 2)} − ${dec(F(lo), 2)} = ${dec(val, 2)}.`],
    difficulty: "medium",
  };
});

const uSub = g("u-sub", "u-substitution", (r) => {
  const p = r.int(2, 6), c = r.nz(1, 9);
  return {
    stem: `Find ∫ 2x(x² + ${c})${sup(p)} dx`,
    answer: `(x² + ${c})${sup(p + 1)}/${p + 1} + C`,
    wrong: [[`(x² + ${c})${sup(p + 1)} + C`, `Forgot to divide by the new power, ${p + 1}.`], [`x²(x² + ${c})${sup(p + 1)}/${p + 1} + C`, "Integrated the 2x separately. With u = x² + c, du = 2x dx replaces it."], [`${2 * p}x(x² + ${c})${sup(p - 1)} + C`, "Took a derivative instead."]],
    steps: [`Let u = x² + ${c}, so du = 2x dx.`, `∫ u${sup(p)} du = u${sup(p + 1)}/${p + 1} + C = (x² + ${c})${sup(p + 1)}/${p + 1} + C.`],
    difficulty: "medium",
  };
});

const determinant = g("determinant", "Matrices and determinants", (r) => {
  const a = r.int(-6, 6), b = r.int(-6, 6), c = r.int(-6, 6), d = r.int(-6, 6);
  const det = a * d - b * c;
  return {
    stem: `Find the determinant of the matrix [[${n(a)}, ${n(b)}], [${n(c)}, ${n(d)}]].`,
    answer: n(det),
    wrong: [[n(a * d + b * c), "Added. The determinant is ad − bc."], [n(b * c - a * d), "Subtracted in the wrong order."], [n(a * b - c * d), "Multiplied across the rows instead of the diagonals."]].filter(([w]) => w !== n(det)) as [string, string][],
    steps: ["det = ad − bc.", `= (${n(a)})(${n(d)}) − (${n(b)})(${n(c)}) = ${n(a * d)} − ${n(b * c)} = ${n(det)}.`],
    difficulty: "easy",
  };
});

const dotProduct = g("dot-product", "Vectors and the dot product", (r) => {
  const a = r.int(-6, 6), b = r.int(-6, 6), c = r.int(-6, 6), d = r.int(-6, 6);
  const dot = a * c + b * d;
  return {
    stem: `Find u · v for u = ⟨${n(a)}, ${n(b)}⟩ and v = ⟨${n(c)}, ${n(d)}⟩.`,
    answer: n(dot),
    wrong: [[`⟨${n(a * c)}, ${n(b * d)}⟩`, "The dot product is a number: add the products."], [n(a * d + b * c), "Multiplied mismatched components."], [n(a * c - b * d), "Subtracted the second product."]].filter(([w]) => w !== n(dot)) as [string, string][],
    steps: ["u · v = u₁v₁ + u₂v₂.", `= (${n(a)})(${n(c)}) + (${n(b)})(${n(d)}) = ${n(dot)}.`],
    difficulty: "easy",
  };
});

const unitConvert = g("unit-conversion", "Unit conversion", (r) => {
  const mph = r.int(2, 9) * 10;
  const fps = (mph * 5280) / 3600;
  return {
    stem: `A car travels ${mph} miles per hour. How many feet per second is that? (1 mile = 5,280 feet) Round to the nearest tenth.`,
    answer: dec(fps, 1),
    wrong: [[dec(mph * 5280, 0), "Converted miles to feet but not hours to seconds."], [dec((mph * 5280) / 60, 1), "Divided by 60, which converts to feet per minute."], [dec((mph * 3600) / 5280, 1), "Flipped the conversion factors."]],
    steps: [`${mph} mi/h × 5,280 ft/mi = ${mph * 5280} ft/h.`, `÷ 3,600 s/h = ${dec(fps, 1)} ft/s.`],
    difficulty: "easy",
  };
});

export const GENERATORS: Generator[] = [
  orderOfOps, twoStep, bothSides, distribute, absValue, proportion, inequality,
  slope2pts, lineThrough, standardSlope, perpendicular, systems, funcEval, composition, inverse,
  exponentRules, multiplyBinomials, factorTrinomial, solveFactoring, discriminant, quadFormula, vertex, completeSquare, complexMult, radicals,
  percentChange, expGrowth, logEval, logEquation, arithSeq, geoSeq, infiniteSeries,
  pythagorean, specialRight, trigRatio, distanceMid, triangleAngles, polygonAngles, circleMeasure, arcSector, volume, similar,
  unitCircle, radians,
  centerSpread, simpleProb, conditional, counting, zScore, binomial, expectedValue,
  limitAlgebraic, powerRule, derivAtPoint, chainRule, productRule, antiderivative, definiteIntegral, uSub,
  determinant, dotProduct, unitConvert,
];
