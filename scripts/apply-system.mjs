// One-off codemod for Merit 2.0: move recurring page-level class patterns onto the new design system.
// Operates on className string literals only; files that were hand-rebuilt are skipped.
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const SKIP = /shell-frame|home\/|upgrade\.tsx|components\/ui\.tsx|components\/form\.tsx|course-finder|globals/;
const files = execSync("find src -name '*.tsx'", { encoding: "utf8" }).trim().split("\n").filter((f) => !SKIP.test(f));

function fixClass(c) {
  let s = c;
  // Panels: hairline containers get the surface fill so they lift off the off-white page.
  if (/\bring-1\b/.test(s) && /\bring-line\b/.test(s) && /\brounded-(xl|2xl|3xl)\b/.test(s) && !/\bbg-/.test(s)) s = s.replace(/\bring-1\b/, "bg-surface ring-1");
  if (/\brounded-3xl\b/.test(s) && /\bring-line\b/.test(s)) s = s.replace(/\brounded-3xl\b/, "rounded-[28px]");
  // Titles onto the headline scale (weight 650, tight tracking, balanced wrapping).
  s = s.replace(/\btext-(?:\[2[68]px\]|\[3[24]px\]|3xl) font-(?:bold|extrabold) tracking-tight\b/g, "headline text-[28px] sm:text-[34px]");
  s = s.replace(/\btext-3xl font-(?:bold|extrabold) tracking-tight sm:text-(?:\[40px\]|4xl)\b/g, "headline text-[30px] sm:text-[40px]");
  s = s.replace(/\btext-4xl font-(?:bold|extrabold) tracking-tight(?: sm:text-5xl)?\b/g, "headline text-[34px] sm:text-[44px]");
  s = s.replace(/\btext-2xl font-(?:bold|extrabold) tracking-tight\b/g, "headline text-2xl");
  s = s.replace(/\btext-xl font-(?:bold|extrabold) tracking-tight\b/g, "headline text-[20px]");
  s = s.replace(/\btext-lg font-bold tracking-tight\b/g, "headline text-lg");
  s = s.replace(/\bfont-extrabold\b/g, "font-bold");
  // Links and small accents use the higher-contrast accent ink.
  s = s.replace(/\btext-accent(?![-\w/])/g, "text-accent-ink");
  // Primary buttons: brand blue, with press feedback.
  if (/\bbg-ink\b/.test(s) && /\btext-bg\b/.test(s) && /\brounded-(full|lg)\b/.test(s) && /\bh-(8|9|10|11|12)\b/.test(s)) {
    s = s.replace(/\bbg-ink\b/, "bg-accent").replace(/\btext-bg\b/, "text-white").replace(/\bhover:bg-ink\/85\b/, "hover:bg-accent-hover");
    if (!/hover:/.test(s)) s += " hover:bg-accent-hover";
  }
  s = s.replace(/\bhover:brightness-110\b/g, (m) => (/\bbg-accent\b/.test(s) ? "hover:bg-accent-hover" : m));
  if (/\brounded-full\b/.test(s) && /\bh-(9|10|11|12)\b/.test(s) && /\b(bg-accent|bg-sprint|bg-ink|ring-line-strong)\b/.test(s) && !/active:scale/.test(s)) s += " transition-[background-color,transform] duration-150 active:scale-[0.97]";
  // Softer, rounder tags.
  s = s.replace(/\brounded px-1\.5 py-0\.5 text-\[1[01](?:\.5)?px\] font-bold uppercase\b/g, "rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase");
  return s;
}

let changed = 0;
for (const f of files) {
  const before = readFileSync(f, "utf8");
  const after = before.replace(/className="([^"]+)"/g, (_, c) => `className="${fixClass(c)}"`).replace(/(cn\(|clsx\()"([^"]+)"/g, (_, p, c) => `${p}"${fixClass(c)}"`);
  if (after !== before) {
    writeFileSync(f, after);
    changed++;
  }
}
console.log(`${changed} files updated`);
