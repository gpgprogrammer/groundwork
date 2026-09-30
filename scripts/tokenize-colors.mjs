// One-off codemod for Merit 2.0: replace hardcoded Sprint/danger colors and orange gradients with design tokens.
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const files = execSync("grep -rlE '#[0-9a-fA-F]{6}' src --include='*.tsx'", { encoding: "utf8" }).trim().split("\n").filter(Boolean);
let total = 0;
for (const f of files) {
  const before = readFileSync(f, "utf8");
  const lines = before.split("\n").map((line) => {
    let l = line;
    // Sprint gradients on buttons and small marks become the solid ember token.
    l = l.replace(/bg-gradient-to-(?:r|br) from-\[#ff8a3d\] to-\[#(?:e0531c|c2410c)\]/g, "bg-sprint");
    // Error text vs. Sprint text share a hex today; context decides.
    if (/error|Error|alert|couldn|Couldn|At least|wrong/.test(l)) l = l.replace(/text-\[#c2410c\]/g, "text-danger");
    l = l.replace(/text-\[#c2410c\]/g, "text-sprint-ink");
    l = l.replace(/text-\[#e0531c\]/g, "text-sprint");
    l = l.replace(/text-\[#9a2d0e\]/g, "text-sprint-ink");
    l = l.replace(/ ?dark:bg-\[#3a1d0c\]/g, "").replace(/ ?dark:text-\[#ffb489\]/g, "").replace(/ ?dark:bg-\[#3a1215\]/g, "");
    l = l.replace(/bg-\[#fff1e8\]/g, "bg-sprint-soft");
    l = l.replace(/bg-\[#fde8e8\] text-\[#b42318\]/g, "bg-danger-soft text-danger");
    l = l.replace(/bg-\[#fde8e8\]/g, "bg-danger-soft");
    l = l.replace(/ring-\[#e5484d\]/g, "ring-danger").replace(/text-\[#e5484d\]/g, "text-danger").replace(/bg-\[#e5484d\]/g, "bg-danger");
    l = l.replace(/ring-\[#ff8a3d\]/g, "ring-sprint");
    return l;
  });
  const after = lines.join("\n");
  if (after !== before) {
    writeFileSync(f, after);
    const n = before.split("\n").filter((l, i) => l !== lines[i]).length;
    total += n;
    console.log(`${n.toString().padStart(3)} ${f}`);
  }
}
console.log(`${total} lines changed`);
