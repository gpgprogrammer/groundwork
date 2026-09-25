import { CalendarCheck, Sparkles, Target, Users } from "lucide-react";
import { OAuthButtons } from "@/components/oauth-buttons";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/logo";
import { getViewer } from "@/lib/viewer";
import { SignUpForm } from "../auth-forms";

export const metadata: Metadata = { title: "Create your account" };

export default async function SignUpPage({ searchParams }: PageProps<"/signup">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") && !sp.next.startsWith("//") ? sp.next : undefined;
  if (await getViewer()) redirect(next ?? "/");
  const initialType = sp.as === "teacher" || sp.as === "student" ? sp.as : undefined;
  return (
    <div className="flex flex-1 items-start justify-center px-4 pb-16 pt-[5vh]">
      <div className="rise grid w-full max-w-4xl overflow-hidden rounded-3xl bg-bg shadow-soft md:grid-cols-2">
        <div className="p-8 sm:p-10">
          <LogoMark className="size-10" />
          <h1 className="mt-5 text-[26px] font-bold tracking-tight text-ink">Know what to study tonight.</h1>
          <p className="mt-1 text-[15px] text-muted">Free account. Merit Plus free for your first month. No card.</p>
          <div className="mt-8">
            <OAuthButtons next={next} />
            <SignUpForm next={next} initialType={initialType} />
          </div>
          <p className="mt-6 text-xs leading-relaxed text-faint">
            By continuing you agree to the <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>. Students under 13 need a parent to create the account.
          </p>
          <p className="mt-6 text-sm text-muted">
            Already have an account?{" "}
            <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="font-medium text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </div>
        <div className="hidden flex-col justify-center gap-7 bg-gradient-to-br from-[#2d5ff0] via-[#2346c7] to-[#172a7a] p-10 text-white md:flex">
          {[
            [CalendarCheck, "A plan for tonight", "Your class calendar and exam date become a nightly plan: the exact lessons to watch, in order."],
            [Sparkles, "An AI study partner", "Explanations, practice questions, and the best lesson for any topic, any time."],
            [Target, "Exam Sprints", "A day-by-day plan to AP and SAT exam day with a live readiness score."],
            [Users, "Real tutors when you want one", "Book top-rated tutors near you or online, right from Merit."],
          ].map(([Icon, t, d]) => {
            const I = Icon as typeof Users;
            return (
              <div key={t as string} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <I className="size-5" />
                </span>
                <div>
                  <p className="font-medium">{t as string}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-white/75">{d as string}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
