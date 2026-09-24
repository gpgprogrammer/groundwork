import { CalendarCheck, GraduationCap, NotebookPen, Sparkles, Target, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark, Wordmark } from "@/components/logo";
import { Faq } from "@/components/marketing";
import { getCatalog } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "About Merit",
  description: "Merit Learning helps high school students master every AP course and the SAT: the best lessons, an AI study partner, a plan for tonight, exam sprints, and real tutors.",
};

export default async function AboutPage() {
  const catalog = await getCatalog();
  const features = [
    { icon: GraduationCap, title: `${catalog.courses.length} courses, every topic`, body: `Every AP course and the SAT, organized the way the exam is: ${catalog.units.length} units and ${catalog.topics.length} topics, each with the lessons that teach it best.` },
    { icon: Sparkles, title: "Merit AI", body: "A study partner that explains, quizzes, and finds the right lesson, grounded in the curriculum and the page you're on." },
    { icon: CalendarCheck, title: "A plan for tonight", body: "Merit Plus turns your class calendar and exam date into a nightly plan, with reminders in the calendar you already use." },
    { icon: Target, title: "Exam Sprints", body: "A diagnostic, a day-by-day plan to exam day, unlimited exam-style practice, and a readiness score you can watch climb." },
    { icon: Users, title: "Real tutors", body: "Book top-rated tutors near you or online, or choose from trusted tutoring services, right where you study." },
    { icon: NotebookPen, title: "Built with teachers", body: "Teachers add the lessons they trust and write study guides for the topics students struggle with." },
  ];
  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-20 pt-12 sm:px-6">
      <div className="flex items-center gap-3 text-[34px]">
        <LogoMark className="size-14" />
        <Wordmark tagline />
      </div>
      <h1 className="mt-8 max-w-3xl text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Every student deserves a great teacher and a clear plan.</h1>
      <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-ink-2">
        Merit brings together the best lessons for every AP and SAT topic, an AI study partner, and real tutors, then tells you exactly what to study tonight. Learning is free. Planning and exam prep tools are affordable. And when you want a person, the best tutors are a click away.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/signup" className="inline-flex h-12 items-center rounded-full bg-accent px-6 text-[15px] font-semibold text-white">
          Get started free
        </Link>
        <Link href="/courses" className="inline-flex h-12 items-center rounded-full px-6 text-[15px] font-semibold text-ink ring-1 ring-line-strong hover:bg-bg-subtle">
          Browse courses
        </Link>
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="rounded-2xl p-6 ring-1 ring-line">
            <span className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <f.icon className="size-5" />
            </span>
            <p className="mt-4 font-semibold text-ink">{f.title}</p>
            <p className="mt-1 text-[14px] leading-relaxed text-muted">{f.body}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-20 max-w-3xl">
        <h2 className="text-2xl font-bold tracking-tight text-ink">Questions</h2>
        <div className="mt-4">
          <Faq />
        </div>
      </div>
      <p className="mt-12 text-[12.5px] text-muted">
        Lessons are created by their teachers and channels and play on YouTube. AP® and SAT® are trademarks of the College Board, which is not affiliated with Merit Learning.
      </p>
    </div>
  );
}
