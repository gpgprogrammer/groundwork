import Link from "next/link";
import { Fragment, type ReactNode } from "react";

/**
 * A small, safe Markdown renderer for chat answers: paragraphs, headings,
 * lists, bold/italic, inline code, code blocks, and links (Merit paths or https only).
 * No raw HTML is ever rendered.
 *
 * `variant="chat"` (default) is compact for answers in a conversation; `variant="prose"` is the
 * reading layout for study guides and cram sheets: a ~68ch measure, larger body, heading rhythm.
 */

function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const k = `${key}-${i++}`;
    if (tok.startsWith("**")) out.push(<strong key={k} className="font-semibold text-ink">{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("`")) out.push(<code key={k} className="rounded-md bg-bg-subtle px-1.5 py-0.5 font-mono text-[0.88em] text-ink ring-1 ring-inset ring-line">{tok.slice(1, -1)}</code>);
    else if (tok.startsWith("[")) {
      const [, label, href] = tok.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/)!;
      if (href.startsWith("/") && !href.startsWith("//")) out.push(<Link key={k} href={href} className="font-medium text-accent-ink underline decoration-accent-ink/30 underline-offset-2 transition-colors hover:decoration-accent-ink">{label}</Link>);
      else if (/^https:\/\//.test(href)) out.push(<a key={k} href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-accent-ink underline decoration-accent-ink/30 underline-offset-2 transition-colors hover:decoration-accent-ink">{label}</a>);
      else out.push(label);
    } else out.push(<em key={k}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

type Variant = "chat" | "prose";

const styles = {
  chat: {
    root: "space-y-3 text-[15px] leading-relaxed text-ink-2",
    h: ["pt-1 text-[16px] font-semibold text-ink", "pt-1 text-[15.5px] font-semibold text-ink", "pt-1 font-semibold text-ink"],
    list: "space-y-1.5 pl-5 marker:text-faint",
    pre: "overflow-x-auto rounded-xl bg-bg-subtle p-3.5 font-mono text-[13px] leading-relaxed text-ink ring-1 ring-inset ring-line",
  },
  prose: {
    root: "max-w-[68ch] space-y-4 text-[16px] leading-[1.75] text-ink-2 sm:text-[17px] [&>*+:is(h2,h3)]:mt-9 [&>*+h4]:mt-6",
    h: ["headline text-[22px] text-ink sm:text-[24px]", "headline text-[19px] text-ink sm:text-[20px]", "text-[16px] font-semibold text-ink sm:text-[17px]"],
    list: "space-y-2 pl-6 marker:font-medium marker:text-faint",
    pre: "overflow-x-auto rounded-xl bg-bg-subtle px-4 py-3.5 font-mono text-[14px] leading-relaxed text-ink ring-1 ring-inset ring-line",
  },
} as const;

export function Markdown({ text, variant = "chat" }: { text: string; variant?: Variant }) {
  const st = styles[variant];
  const lines = text.replace(/\r/g, "").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let n = 0;
  while (i < lines.length) {
    const line = lines[i];
    const key = `b${n++}`;
    if (!line.trim()) {
      i++;
      continue;
    }
    if (line.startsWith("```")) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) body.push(lines[i++]);
      i++;
      blocks.push(
        <pre key={key} className={st.pre}>
          {body.join("\n")}
        </pre>,
      );
      continue;
    }
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      // #/## map to the top level, ### to the next, #### to the smallest.
      const level = Math.max(0, h[1].length - 2);
      const Tag = variant === "prose" ? (["h2", "h3", "h4"] as const)[level] : "p";
      blocks.push(
        <Tag key={key} className={st.h[level]}>
          {inline(h[2], key)}
        </Tag>,
      );
      i++;
      continue;
    }
    if (/^\s*([-*•]|\d+[.)])\s+/.test(line)) {
      const ordered = /^\s*\d+[.)]/.test(line);
      const items: string[] = [];
      while (i < lines.length && /^\s*([-*•]|\d+[.)])\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*([-*•]|\d+[.)])\s+/, ""));
      const Tag = ordered ? "ol" : "ul";
      blocks.push(
        <Tag key={key} className={`${ordered ? "list-decimal" : "list-disc"} ${st.list}`}>
          {items.map((it, j) => (
            <li key={j} className="pl-1">
              {inline(it, `${key}-${j}`)}
            </li>
          ))}
        </Tag>,
      );
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(```|#{1,4}\s|\s*([-*•]|\d+[.)])\s+)/.test(lines[i])) para.push(lines[i++]);
    blocks.push(
      <p key={key}>
        {para.map((p, j) => (
          <Fragment key={j}>
            {j ? <br /> : null}
            {inline(p, `${key}-${j}`)}
          </Fragment>
        ))}
      </p>,
    );
  }
  return <div className={st.root}>{blocks}</div>;
}
