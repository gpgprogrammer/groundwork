import { CalendarDays, Check, ListVideo, Sigma } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/logo";
import { getViewer } from "@/lib/viewer";
import { SignUpForm } from "../auth-forms";

export const metadata: Metadata = { title: "Create your account" };

export default async function SignUpPage() {
  if (await getViewer()) redirect("/");
  return (
    <div className="flex flex-1 items-start justify-center px-4 pb-16 pt-[5vh]">
      <div className="rise grid w-full max-w-4xl overflow-hidden rounded-3xl bg-bg shadow-soft md:grid-cols-2">
        <div className="p-8 sm:p-10">
          <LogoMark className="size-10" />
          <h1 className="mt-5 text-[26px] font-bold tracking-tight text-ink">Create your account</h1>
          <p className="mt-1 text-[15px] text-muted">Free for every student. No card, no trial.</p>
          <div className="mt-8">
            <SignUpForm />
          </div>
          <p className="mt-6 text-xs leading-relaxed text-faint">
            By continuing you agree to the <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>. Students under 13 need a parent to create the account.
          </p>
          <p className="mt-6 text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </div>
        <div className="hidden flex-col justify-center gap-7 bg-[#0f0f0f] p-10 text-white md:flex">
          {[
            [ListVideo, "Every AP and SAT topic, organized", "The best YouTube lessons, sorted into units and topics so you never search twice."],
            [CalendarDays, "Synced to your class calendar", "Quiz on Friday? The videos for it are waiting on your home page."],
            [Sigma, "Ranked by how well they teach", "Helpfulness, likes, and relevance, not just views."],
            [Check, "Track what you've mastered", "Mark topics as understood and always know what's next."],
          ].map(([Icon, t, d]) => {
            const I = Icon as typeof Check;
            return (
              <div key={t as string} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <I className="size-5" />
                </span>
                <div>
                  <p className="font-medium">{t as string}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-white/60">{d as string}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
