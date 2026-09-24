import {
  Box,
  Brain,
  BookOpen,
  BookOpenText,
  BookText,
  Braces,
  Calculator,
  Castle,
  ChartColumn,
  ChartSpline,
  Coins,
  Dna,
  Earth,
  Feather,
  FlaskConical,
  Flag,
  Frame,
  GraduationCap,
  Infinity as InfinityIcon,
  Landmark,
  Leaf,
  MapPinned,
  MessagesSquare,
  Microscope,
  Music,
  Network,
  Orbit,
  Palette,
  PenLine,
  PenTool,
  Rocket,
  Scale,
  Scroll,
  TrendingUp,
  Waves,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "./ui";

type Mark = { icon?: LucideIcon; glyph?: string; serif?: boolean; from: string; to: string };

/** A symbol and color for every course, so each one is recognizable at a glance. */
const MARKS: Record<string, Mark> = {
  "ap-calculus-ab": { glyph: "∫", serif: true, from: "#4f7cff", to: "#2a4bd7" },
  "ap-calculus-bc": { icon: InfinityIcon, from: "#3d6bff", to: "#1f36b8" },
  "ap-precalculus": { icon: ChartSpline, from: "#6b7bff", to: "#3f46d6" },
  "ap-statistics": { icon: ChartColumn, from: "#16b3c7", to: "#0a7f9e" },
  "ap-computer-science-a": { icon: Braces, from: "#ff8a3d", to: "#e0531c" },
  "ap-computer-science-principles": { icon: Network, from: "#8b5cf6", to: "#5b30d6" },
  "ap-biology": { icon: Dna, from: "#2fcf7a", to: "#129656" },
  "ap-chemistry": { icon: FlaskConical, from: "#18c1b0", to: "#0a8a86" },
  "ap-environmental-science": { icon: Leaf, from: "#7cc93a", to: "#3f8f1c" },
  "ap-physics-1": { icon: Rocket, from: "#38a4ff", to: "#1668d9" },
  "ap-physics-2": { icon: Waves, from: "#3ab7ff", to: "#127fbf" },
  "ap-physics-c-mechanics": { icon: Orbit, from: "#4b8dff", to: "#2448c7" },
  "ap-physics-c-electricity-and-magnetism": { icon: Zap, from: "#ffb72b", to: "#e07b00" },
  "ap-us-history": { icon: Flag, from: "#f0515b", to: "#b8233a" },
  "ap-world-history": { icon: Earth, from: "#f08a3c", to: "#c2531b" },
  "ap-european-history": { icon: Castle, from: "#c057d9", to: "#8a2aa8" },
  "ap-us-government": { icon: Landmark, from: "#4a6cf0", to: "#2a3fae" },
  "ap-comparative-government": { icon: Scale, from: "#20a5b5", to: "#136f86" },
  "ap-human-geography": { icon: MapPinned, from: "#e9a526", to: "#b86f0c" },
  "ap-macroeconomics": { icon: TrendingUp, from: "#23b37a", to: "#0f7a52" },
  "ap-microeconomics": { icon: Coins, from: "#e8b320", to: "#b17a06" },
  "ap-psychology": { icon: Brain, from: "#e35ea8", to: "#b02a77" },
  "ap-african-american-studies": { icon: BookOpenText, from: "#d9722b", to: "#9c4613" },
  "ap-english-language": { icon: PenLine, from: "#e25548", to: "#a8281f" },
  "ap-english-literature": { icon: BookOpen, from: "#c2415d", to: "#8a1f3a" },
  "ap-spanish-language": { glyph: "ñ", from: "#f5a524", to: "#d9480f" },
  "ap-spanish-literature": { icon: Feather, from: "#e9772b", to: "#b0400f" },
  "ap-french-language": { glyph: "é", from: "#3f73f0", to: "#2140a8" },
  "ap-german-language": { glyph: "ß", from: "#5b6474", to: "#2f3542" },
  "ap-italian-language": { glyph: "è", from: "#26b36b", to: "#137a45" },
  "ap-chinese-language": { glyph: "中", from: "#ef4b4b", to: "#b31d2a" },
  "ap-japanese-language": { glyph: "あ", from: "#f06b8f", to: "#c23a62" },
  "ap-latin": { icon: Scroll, from: "#b08a4a", to: "#7a5a24" },
  "ap-art-history": { icon: Frame, from: "#a45ce6", to: "#6c2fb8" },
  "ap-music-theory": { icon: Music, from: "#8a5cf6", to: "#5a2fd0" },
  "ap-2d-art-and-design": { icon: Palette, from: "#f25fa2", to: "#c02a73" },
  "ap-3d-art-and-design": { icon: Box, from: "#f07a3c", to: "#bf4a17" },
  "ap-drawing": { icon: PenTool, from: "#6e7686", to: "#394150" },
  "ap-seminar": { icon: MessagesSquare, from: "#1fb3a3", to: "#0e7d78" },
  "ap-research": { icon: Microscope, from: "#2f9fd6", to: "#1a6aa3" },
  "sat-math": { icon: Calculator, from: "#3f7cf5", to: "#233fb3" },
  "sat-reading-writing": { icon: BookText, from: "#ef5a6f", to: "#b52a45" },
};

export function courseColor(id: string) {
  return MARKS[id]?.from ?? "#3b82f6";
}

export function CourseIcon({ id, size = 48, className }: { id: string; size?: number; className?: string }) {
  const m = MARKS[id] ?? { icon: GraduationCap, from: "#4287f5", to: "#2346c7" };
  const Icon = m.icon;
  return (
    <span
      aria-hidden
      className={cn("relative flex shrink-0 items-center justify-center overflow-hidden text-white", className)}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: `linear-gradient(145deg, ${m.from}, ${m.to})`,
        boxShadow: size >= 40 ? `0 1px 0 rgb(255 255 255 / 0.25) inset, 0 6px 14px -6px ${m.to}` : undefined,
      }}
    >
      {/* soft highlight */}
      <span className="pointer-events-none absolute -left-1/4 -top-1/2 h-full w-[150%] rotate-[-12deg] bg-white/15" />
      {Icon ? (
        <Icon className="relative" style={{ width: size * 0.5, height: size * 0.5 }} strokeWidth={2.1} />
      ) : (
        <span className={cn("relative font-bold leading-none", m.serif ? "font-serif italic" : "font-brand")} style={{ fontSize: size * (m.glyph!.length > 1 ? 0.36 : m.serif ? 0.62 : 0.52) }}>
          {m.glyph}
        </span>
      )}
    </span>
  );
}
