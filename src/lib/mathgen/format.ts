/** Formatting helpers for generated math problems. Uses a real minus sign (−) everywhere. */

export const MINUS = "−";

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** An integer with a real minus sign. */
export const n = (x: number) => (x < 0 ? `${MINUS}${Math.abs(x)}` : `${x}`);

/** A reduced fraction, or an integer when it divides evenly. */
export function frac(num: number, den: number): string {
  if (den === 0) return "undefined";
  if (den < 0) [num, den] = [-num, -den];
  const g = gcd(num, den);
  num /= g;
  den /= g;
  if (den === 1) return n(num);
  return `${num < 0 ? MINUS : ""}${Math.abs(num)}/${den}`;
}

/** Rounds to `d` decimals and drops trailing zeros. */
export function dec(x: number, d = 2): string {
  const p = 10 ** d;
  const r = Math.round(x * p) / p;
  return n(Object.is(r, -0) ? 0 : r);
}

const SUP: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻" };
export const sup = (k: number) => `${k}`.split("").map((c) => SUP[c] ?? c).join("");

/** A term like 3x², −x, 5. */
function term(coef: number, power: number, v: string, first: boolean): string {
  if (coef === 0) return "";
  const abs = Math.abs(coef);
  const sign = coef < 0 ? (first ? MINUS : ` ${MINUS} `) : first ? "" : " + ";
  const body = power === 0 ? `${abs}` : `${abs === 1 ? "" : abs}${v}${power === 1 ? "" : sup(power)}`;
  return sign + body;
}

/** A polynomial from coefficients, highest power first: poly([3, -2, 5]) = "3x² − 2x + 5". */
export function poly(coefs: number[], v = "x"): string {
  const deg = coefs.length - 1;
  let out = "";
  coefs.forEach((c, i) => {
    out += term(c, deg - i, v, out === "");
  });
  return out || "0";
}

/** "x + 3", "x − 4", "x". */
export const plus = (v: string, k: number) => (k === 0 ? v : k > 0 ? `${v} + ${k}` : `${v} ${MINUS} ${Math.abs(k)}`);

/** Signed constant for appending: " + 3" or " − 3". */
export const signed = (k: number) => (k >= 0 ? ` + ${k}` : ` ${MINUS} ${Math.abs(k)}`);

export const pi = (k: number | string) => (k === 1 || k === "1" ? "π" : `${k}π`);

/** A reduced multiple of π: fracPi(2, 6) = "π/3", fracPi(8, 3) = "8π/3", fracPi(4, 1) = "4π". */
export function fracPi(num: number, den: number): string {
  const g = gcd(num, den);
  const [p, q] = [num / g, den / g];
  const top = p === 1 ? "π" : p === -1 ? `${MINUS}π` : `${n(p)}π`;
  return q === 1 ? top : `${top}/${q}`;
}
