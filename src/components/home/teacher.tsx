import { ArrowRight, BookOpen, Check, FileText, MonitorPlay, Plus, SquarePlay, Upload, UserRound, Users } from "lucide-react";
import Link from "next/link";
import { cn, panel } from "@/components/ui";
import { getStore } from "@/lib/data/store";
import { getEducator } from "@/lib/educators";
import { greetingName } from "@/lib/names";
import type { Contribution } from "@/lib/types";
import type { Viewer } from "@/lib/viewer";

const heroWhite = "press flex h-12 items-center gap-2 rounded-2xl bg-white px-5 font-brand text-[15.5px] font-extrabold text-[#1d4ed8] [--ledge:rgb(0_0_0/0.22)] hover:brightness-95";
const heroGlass = "press flex h-12 items-center gap-2 rounded-2xl bg-white/15 px-5 font-brand text-[15.5px] font-extrabold text-white ring-2 ring-inset ring-white/30 [--ledge:rgb(0_0_0/0.18)] hover:bg-white/25";

/** Home for a teacher account: setting up and running their studio comes first. */
export async function TeacherHome({ viewer }: { viewer: Viewer }) {
  const id = viewer.user.id;
  const store = await getStore();
  // Any lesson counts, including ones still waiting for review.
  const [educator, items, tutor] = await Promise.all([getEducator(id), store.listDocs<Contribution>("contributions", { owner: id }), store.listTutors().then((ts) => ts.find((t) => t.userId === id))]);
  const hasProfile = Boolean(educator);
  const hasLesson = items.length > 0;
  const name = greetingName(educator?.name ?? viewer.user.name);

  const steps = [
    {
      done: hasProfile,
      title: "Set up your teacher profile",
      body: "Your name, the courses you teach, and a line about you. Students see it next to everything you add.",
      action: { href: "/studio", label: hasProfile ? "Edit profile" : "Set up my profile" },
      Icon: UserRound,
    },
    {
      done: hasLesson,
      title: "Add your first lesson",
      body: "Upload a video you recorded, add a YouTube lesson you trust, or write a study guide.",
      action: { href: "/studio", label: hasLesson ? "Add another" : "Add a lesson" },
      Icon: SquarePlay,
    },
    {
      done: Boolean(tutor),
      optional: true,
      title: "Tutor privately? List yourself",
      body: "Students on Merit can find and book you for one-on-one help.",
      action: { href: tutor ? `/tutors/${tutor.id}` : "/tutors/join", label: tutor ? "View my listing" : "Create a tutor listing" },
      Icon: Users,
    },
  ];
  const remaining = steps.filter((s) => !s.done && !s.optional).length;

  return (
    <div className="pb-8">
      <header className="relative overflow-hidden bg-[linear-gradient(135deg,#3b82f6,#1d4ed8)] text-white">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full border-[56px] border-white/[0.08]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-9 sm:px-6 lg:px-8 lg:pt-12">
          <p className="rise font-brand text-[16px] font-extrabold text-white/85">Welcome, {name}</p>
          <h1 className="rise display mt-2 max-w-3xl text-[38px] sm:text-6xl" style={{ ["--i" as string]: 1 }}>
            {hasProfile ? "Your teacher studio" : "Let's set up your teacher profile."}
          </h1>
          <p className="rise mt-3 max-w-2xl text-[17px] leading-relaxed text-white/90" style={{ ["--i" as string]: 2 }}>
            {hasProfile
              ? "Add lessons and study guides for the courses you teach. They show up on topic pages for every student on Merit."
              : "It takes about a minute. Then you can add lessons, upload your own videos, and write study guides for your students."}
          </p>
          <div className="rise mt-7 flex flex-wrap gap-2.5" style={{ ["--i" as string]: 3 }}>
            <Link href="/studio" className={heroWhite}>
              {hasProfile ? "Open my studio" : "Set up my profile"} <ArrowRight className="size-4" />
            </Link>
            {educator ? (
              <Link href={`/educators/${educator.id}`} className={heroGlass}>
                <UserRound className="size-4" /> My public profile
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 pt-8 sm:px-6 lg:grid-cols-[1fr_340px] lg:px-8 grid-cols-[minmax(0,1fr)]">
        <section className="min-w-0">
          <div className="flex items-end justify-between gap-4">
            <h2 className="headline text-[26px] text-ink">Getting started</h2>
            <p className="tabular font-brand text-[14px] font-extrabold text-muted">{remaining ? `${remaining} ${remaining === 1 ? "step" : "steps"} left` : "All set"}</p>
          </div>
          <ol className="mt-4 space-y-3">
            {steps.map((s, i) => (
              <li key={s.title} className={cn(panel, "rise flex flex-col gap-4 p-5 sm:flex-row sm:items-center")} style={{ ["--i" as string]: i }}>
                <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-2xl", s.done ? "bg-positive text-white" : "bg-accent-soft text-accent-ink")}>
                  {s.done ? <Check className="size-6" strokeWidth={3} /> : <s.Icon className="size-6" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2 font-brand text-[17px] font-extrabold text-ink">
                    {s.title}
                    {s.optional ? <span className="rounded-full bg-bg-subtle px-2 py-0.5 text-[11.5px] font-extrabold text-muted">Optional</span> : null}
                    {s.done ? <span className="rounded-full bg-positive-soft px-2 py-0.5 text-[11.5px] font-extrabold text-positive">Done</span> : null}
                  </span>
                  <span className="mt-0.5 block text-[14px] leading-relaxed text-muted">{s.body}</span>
                </span>
                <Link
                  href={s.action.href}
                  className={cn(
                    "press inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-2xl px-4 font-brand text-[14.5px] font-extrabold",
                    s.done ? "bg-surface text-ink ring-2 ring-inset ring-line [--ledge:var(--line)] hover:bg-bg-subtle" : "bg-accent text-white [--ledge:var(--accent-press)] hover:brightness-110",
                  )}
                >
                  {s.action.label} <ArrowRight className="size-4" />
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <aside className="space-y-4">
          {hasProfile ? (
            <section className={cn(panel, "rise p-5")} style={{ ["--i" as string]: 1 }}>
              <h2 className="font-brand text-[18px] font-black text-ink">Add to your studio</h2>
              <div className="mt-3 grid gap-2">
                {[
                  { href: "/studio/upload", label: "Upload a video", Icon: Upload },
                  { href: "/studio/video", label: "Add from YouTube", Icon: Plus },
                  { href: "/studio/guide", label: "Write a study guide", Icon: FileText },
                ].map(({ href, label, Icon }) => (
                  <Link key={href} href={href} className="flex min-h-11 items-center gap-3 rounded-2xl px-3 font-brand text-[15px] font-extrabold text-ink transition-colors hover:bg-bg-subtle">
                    <Icon className="size-5 text-accent-ink" /> {label}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
          <section className={cn(panel, "rise p-5")} style={{ ["--i" as string]: 2 }}>
            <h2 className="font-brand text-[18px] font-black text-ink">See what students see</h2>
            <div className="mt-3 grid gap-2">
              {[
                { href: "/courses", label: "Courses and topics", Icon: BookOpen },
                { href: "/lessons", label: "Top-ranked lessons", Icon: SquarePlay },
                { href: "/videos", label: "Merit Tutors' Videos", Icon: MonitorPlay },
              ].map(({ href, label, Icon }) => (
                <Link key={href} href={href} className="flex min-h-11 items-center gap-3 rounded-2xl px-3 font-brand text-[15px] font-extrabold text-ink transition-colors hover:bg-bg-subtle">
                  <Icon className="size-5 text-muted" /> {label}
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
