"use client";

import { GraduationCap, Presentation } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { requestPasswordReset, signIn, signUp, updatePassword, type AuthState } from "@/app/actions/auth";
import { Field, FormMessage, inputClass } from "@/components/form";
import { Button, cn } from "@/components/ui";

export type AccountType = "student" | "teacher";

const TYPES: { key: AccountType; title: string; note: string; Icon: typeof GraduationCap }[] = [
  { key: "student", title: "I'm a student", note: "Study for AP and SAT exams", Icon: GraduationCap },
  { key: "teacher", title: "I'm a teacher or tutor", note: "Share lessons, videos, and tutoring", Icon: Presentation },
];

export function SignInForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(signIn, {});
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <Field label="Email">
        <input name="email" type="email" required autoComplete="email" autoFocus defaultValue={state.fields?.email} className={inputClass} />
      </Field>
      <Field label="Password">
        <input name="password" type="password" required autoComplete="current-password" className={inputClass} />
      </Field>
      <p className="-mt-2 text-right text-[13px]">
        <Link href="/forgot-password" className="text-accent hover:underline">
          Forgot password?
        </Link>
      </p>
      <FormMessage error={state.error} />
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

export function SignUpForm({ next, initialType }: { next?: string; initialType?: AccountType }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(signUp, {});
  const [type, setType] = useState<AccountType | null>(initialType ?? null);
  if (state.message) {
    return (
      <div className="rounded-xl border border-line bg-surface p-5 text-sm leading-relaxed text-ink-2">
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
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <fieldset>
        <legend className="mb-2 text-[13px] font-medium text-ink-2">What kind of account are you making?</legend>
        <div className="grid grid-cols-2 gap-2">
          {TYPES.map(({ key, title, note, Icon }) => (
            <label key={key} className={cn("cursor-pointer rounded-xl p-3.5 transition-all", type === key ? "bg-accent-soft ring-2 ring-accent" : "bg-bg-subtle ring-1 ring-line hover:bg-line")}>
              <input type="radio" name="accountType" value={key} checked={type === key} onChange={() => setType(key)} required className="sr-only" />
              <Icon className={cn("size-5", type === key ? "text-accent" : "text-ink")} />
              <span className="mt-2 block text-[14px] font-semibold text-ink">{title}</span>
              <span className="block text-[12px] leading-snug text-muted">{note}</span>
            </label>
          ))}
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
      <Button type="submit" size="lg" className="w-full" disabled={pending || !type}>
        {pending ? "Creating account…" : type === "teacher" ? "Create teacher account" : type === "student" ? "Create student account" : "Choose an account type"}
      </Button>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(requestPasswordReset, {});
  if (state.message) {
    return (
      <div role="status" className="rounded-xl border border-line bg-surface p-5 text-sm leading-relaxed text-ink-2">
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
    <form action={action} className="space-y-4">
      <Field label="Email">
        <input name="email" type="email" required autoComplete="email" autoFocus defaultValue={state.fields?.email} className={inputClass} />
      </Field>
      <FormMessage error={state.error} />
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Email me a reset link"}
      </Button>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(updatePassword, {});
  return (
    <form action={action} className="space-y-4">
      <Field label="New password" hint="8+ characters">
        <input name="password" type="password" required minLength={8} autoComplete="new-password" autoFocus className={inputClass} />
      </Field>
      <Field label="Type it again">
        <input name="confirm" type="password" required minLength={8} autoComplete="new-password" className={inputClass} />
      </Field>
      <FormMessage error={state.error} />
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Saving…" : "Save new password"}
      </Button>
    </form>
  );
}
