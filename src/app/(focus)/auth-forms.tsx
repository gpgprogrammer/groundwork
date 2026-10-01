"use client";

import { CalendarCheck, Check, GraduationCap, ListOrdered, Presentation, Sparkles, Target, Users } from "lucide-react";
import Link from "next/link";
import { useActionState, useState, type ReactNode } from "react";
import { requestPasswordReset, signIn, signUp, updatePassword, type AuthState } from "@/app/actions/auth";
import { Field, FormMessage } from "@/components/form";
import { LogoMark } from "@/components/logo";
import { cn } from "@/components/ui";

export type AccountType = "student" | "teacher";

/** Chunky text box for the account screens. */
const inputClass =
  "h-12 w-full rounded-2xl border-2 border-line-strong bg-surface px-4 text-[16px] text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-faint focus:border-accent focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent)_18%,transparent)]";

/** What Merit actually does. Every line is a real feature. */
const VALUE = [
  { Icon: ListOrdered, title: "The best lessons, ranked", body: "Every AP course and the SAT, with lessons ranked by how well they teach." },
  { Icon: CalendarCheck, title: "A learning plan for your classes", body: "The best videos for what you're covering in class, and for every quiz and test on your calendar." },
  { Icon: Sparkles, title: "Merit AI", body: "Explanations, practice questions, and the right lesson for any topic." },
  { Icon: Target, title: "Exam Sprints", body: "A day-by-day plan to exam day, starting with a free diagnostic." },
  { Icon: Users, title: "Real tutors", body: "Book tutors near you or online, right from Merit." },
] as const;

/**
 * Split layout for sign in, sign up, and password screens:
 * a blue brand panel with what Merit does, and the form in a chunky card.
 */
export function AuthSplit({ title, lede, panelTitle, children }: { title: ReactNode; lede?: ReactNode; panelTitle: string; children: ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-6xl flex-1 gap-6 px-4 pb-12 pt-2 sm:px-6 lg:grid-cols-[1fr_minmax(0,500px)] lg:gap-10 lg:pb-16 lg:pt-6 grid-cols-[minmax(0,1fr)]">
      <aside className="relative hidden overflow-hidden rounded-[32px] bg-[linear-gradient(145deg,#3d6bff,#1f47c9)] p-10 text-white shadow-[0_6px_0_0_var(--accent-press)] lg:flex lg:flex-col">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-[380px] rounded-full border-[52px] border-white/[0.08]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-28 -left-16 size-72 rounded-full border-[38px] border-white/[0.06]" />
        <p className="display relative text-[40px] xl:text-[46px]">{panelTitle}</p>
        <ul className="relative mt-8 space-y-3">
          {VALUE.map(({ Icon, title, body }, i) => (
            <li key={title} className="rise flex items-start gap-4 rounded-3xl bg-white/10 p-4 ring-2 ring-inset ring-white/15" style={{ ["--i" as string]: i + 1 }}>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#1f47c9]">
                <Icon className="size-5" strokeWidth={2.4} />
              </span>
              <span className="min-w-0">
                <span className="block font-brand text-[16px] font-extrabold">{title}</span>
                <span className="block text-[14px] leading-snug text-white/85">{body}</span>
              </span>
            </li>
          ))}
        </ul>
      </aside>
      <section className="rise flex min-w-0 flex-col justify-center">
        <div className="rounded-[32px] bg-surface p-6 ring-2 ring-line shadow-[0_6px_0_0_var(--line)] sm:p-9">
          <LogoMark className="size-12" />
          <h1 className="headline mt-5 text-[30px] text-ink sm:text-[36px]">{title}</h1>
          {lede ? <p className="mt-1.5 text-[15.5px] text-muted">{lede}</p> : null}
          <div className="mt-7">{children}</div>
        </div>
      </section>
    </div>
  );
}

const submitClass =
  "press flex h-[52px] w-full items-center justify-center rounded-2xl bg-accent font-brand text-[16.5px] font-extrabold text-white [--ledge:var(--accent-press)] hover:brightness-110 disabled:pointer-events-none disabled:opacity-50";

const TYPES: { key: AccountType; title: string; note: string; Icon: typeof GraduationCap }[] = [
  { key: "student", title: "I'm a student", note: "Study for AP and SAT exams", Icon: GraduationCap },
  { key: "teacher", title: "I'm a teacher or tutor", note: "Share lessons, videos, and tutoring", Icon: Presentation },
];

export function SignInForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(signIn, {});
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next ?? ""} />
      <Field label="Email">
        <input name="email" type="email" required autoComplete="email" autoFocus defaultValue={state.fields?.email} className={inputClass} />
      </Field>
      <Field label="Password">
        <input name="password" type="password" required autoComplete="current-password" className={inputClass} />
      </Field>
      <p className="-mt-2 text-right text-[13px]">
        <Link href="/forgot-password" className="font-brand font-extrabold text-accent-ink hover:underline">
          Forgot password?
        </Link>
      </p>
      <FormMessage error={state.error} />
      <button type="submit" className={submitClass} disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export function SignUpForm({ next, initialType }: { next?: string; initialType?: AccountType }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(signUp, {});
  const [type, setType] = useState<AccountType | null>(initialType ?? null);
  if (state.message) {
    return (
      <div className="fade rounded-3xl bg-positive-soft p-5 text-[15px] leading-relaxed text-ink">
        {state.message}
        <p className="mt-3">
          <Link href="/login" className="font-medium text-ink underline underline-offset-4">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next ?? ""} />
      <fieldset>
        <legend className="mb-2.5 font-brand text-[14px] font-extrabold text-ink">What kind of account are you making?</legend>
        <div className="grid grid-cols-2 gap-3">
          {TYPES.map(({ key, title, note, Icon }) => {
            const on = type === key;
            return (
              <label
                key={key}
                className={cn(
                  "press relative cursor-pointer rounded-3xl border-2 p-4 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
                  on ? "border-accent bg-accent text-white [--ledge:var(--accent-press)]" : "border-line bg-surface text-ink [--ledge:var(--line)] hover:bg-bg-subtle",
                )}
              >
                <input type="radio" name="accountType" value={key} checked={on} onChange={() => setType(key)} required className="sr-only" />
                <span className={cn("flex size-11 items-center justify-center rounded-2xl", on ? "bg-white/20 text-white" : "bg-accent-soft text-accent-ink")}>
                  <Icon className="size-6" strokeWidth={2.2} />
                </span>
                {on ? (
                  <span aria-hidden className="check-pop absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-white text-accent">
                    <Check className="size-4" strokeWidth={3.5} />
                  </span>
                ) : null}
                <span className="mt-3 block font-brand text-[15.5px] font-extrabold leading-tight">{title}</span>
                <span className={cn("mt-0.5 block text-[12.5px] leading-snug", on ? "text-white/85" : "text-muted")}>{note}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <Field label="Your name">
        <input name="name" required autoComplete="name" autoFocus defaultValue={state.fields?.name} className={inputClass} placeholder="Maya Alvarez" />
      </Field>
      <Field label="Email">
        <input name="email" type="email" required autoComplete="email" defaultValue={state.fields?.email} className={inputClass} placeholder="you@school.edu" />
      </Field>
      <Field label="Password" hint="8+ characters">
        <input name="password" type="password" required minLength={8} autoComplete="new-password" className={inputClass} />
      </Field>
      <FormMessage error={state.error} />
      <button type="submit" className={submitClass} disabled={pending || !type}>
        {pending ? "Creating account…" : type === "teacher" ? "Create teacher account" : type === "student" ? "Create student account" : "Choose an account type"}
      </button>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(requestPasswordReset, {});
  if (state.message) {
    return (
      <div role="status" className="fade rounded-3xl bg-positive-soft p-5 text-[15px] leading-relaxed text-ink">
        {state.message}
        <p className="mt-3">
          <Link href="/login" className="font-medium text-ink underline underline-offset-4">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-5">
      <Field label="Email">
        <input name="email" type="email" required autoComplete="email" autoFocus defaultValue={state.fields?.email} className={inputClass} />
      </Field>
      <FormMessage error={state.error} />
      <button type="submit" className={submitClass} disabled={pending}>
        {pending ? "Sending…" : "Email me a reset link"}
      </button>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(updatePassword, {});
  return (
    <form action={action} className="space-y-5">
      <Field label="New password" hint="8+ characters">
        <input name="password" type="password" required minLength={8} autoComplete="new-password" autoFocus className={inputClass} />
      </Field>
      <Field label="Type it again">
        <input name="confirm" type="password" required minLength={8} autoComplete="new-password" className={inputClass} />
      </Field>
      <FormMessage error={state.error} />
      <button type="submit" className={submitClass} disabled={pending}>
        {pending ? "Saving…" : "Save new password"}
      </button>
    </form>
  );
}
