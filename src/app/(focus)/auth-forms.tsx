"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, signUp, type AuthState } from "@/app/actions/auth";
import { Field, FormMessage, inputClass } from "@/components/form";
import { Button } from "@/components/ui";

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
      <FormMessage error={state.error} />
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

export function SignUpForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(signUp, {});
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
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
