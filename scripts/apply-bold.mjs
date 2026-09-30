// One-off codemod for the bold Merit 2.0 direction: pill buttons become chunky "press" buttons,
// hairline panels become 2px-outlined tiles. Operates on className string literals only.
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const files = execSync("find src -name '*.tsx'", { encoding: "utf8" }).trim().split("\n");

const LEDGE = [
  [/\bbg-accent\b/, "[--ledge:var(--accent-press)]"],
  [/\bbg-sprint\b/, "[--ledge:var(--sprint-press)]"],
  [/\bbg-positive\b/, "[--ledge:var(--positive-press)]"],
  [/\bbg-ink\b/, "[--ledge:color-mix(in_oklab,var(--ink)_60%,black)]"],
  [/\bbg-white\b/, "[--ledge:rgb(0_0_0/0.2)]"],
  [/\b(ring-line-strong|ring-line|bg-surface|bg-bg\b|bg-bg-subtle)\b/, "[--ledge:var(--line)]"],
];

function fix(c) {
  let s = c;
  const isButton = /\brounded-full\b/.test(s) && /\bh-(9|10|11|12)\b/.test(s) && /\bpx-\d/.test(s) && !/\bpress\b/.test(s) && !/\bsize-/.test(s);
  if (isButton) {
    const ledge = LEDGE.find(([re]) => re.test(s))?.[1];
    if (ledge) {
      s = s
        .replace(/\brounded-full\b/, "rounded-2xl")
        .replace(/\s*\btransition-\[[^\]]+\]/g, "")
        .replace(/\s*\bduration-150\b/g, "")
        .replace(/\s*\bactive:scale-\[0\.9\d\]/g, "")
        .replace(/\bfont-(semibold|medium|bold)\b/, "font-extrabold")
        .replace(/\bring-1 ring-inset ring-line-strong\b/, "ring-2 ring-inset ring-line")
        .replace(/\bring-1 ring-line-strong\b/, "ring-2 ring-inset ring-line")
        .replace(/\bhover:bg-accent-hover\b/, "hover:brightness-110");
      if (!/\bfont-extrabold\b/.test(s)) s += " font-extrabold";
      s = `press font-brand ${s} ${ledge}`;
    }
  }
  // Tiles: hairline outlines become 2px.
  if (/\brounded-(2xl|3xl|\[28px\]|\[32px\])\b/.test(s) && /\bring-1\b/.test(s) && /\bring-line\b/.test(s) && !/ring-inset/.test(s)) s = s.replace(/\bring-1\b/, "ring-2");
  return s.replace(/\s+/g, " ").trim();
}

let n = 0;
for (const f of files) {
  const before = readFileSync(f, "utf8");
  const after = before.replace(/className="([^"]+)"/g, (_, c) => `className="${fix(c)}"`).replace(/((?:cn|clsx)\(\s*)"([^"]+)"/g, (_, p, c) => `${p}"${fix(c)}"`);
  if (after !== before) {
    writeFileSync(f, after);
    n++;
  }
}
console.log(`${n} files updated`);
