"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteAdminUserAccount } from "@/app/actions/admin-users";

export function DeleteUserButton({ userId, email, roles, paid }: { userId: string; email: string; roles: string[]; paid: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const accountType = roles.filter((role) => role !== "admin").join(" and ") || "user";

  function remove() {
    const paymentNote = paid ? " Their active Merit Plus subscription will also be canceled immediately." : "";
    if (!window.confirm(`Permanently remove ${email}'s ${accountType} account? Their sign-in, profile, learning history, calendar, and published content will be deleted.${paymentNote} This cannot be undone.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteAdminUserAccount(userId);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="flex max-w-56 flex-col items-start gap-1.5">
      <button
        type="button"
        onClick={remove}
        disabled={pending}
        className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-[12.5px] font-semibold text-danger transition-colors hover:bg-danger-soft disabled:pointer-events-none disabled:opacity-50"
      >
        <Trash2 className="size-3.5" /> {pending ? "Removing…" : "Remove account"}
      </button>
      {error ? <span role="alert" className="text-[11.5px] leading-snug text-danger">{error}</span> : null}
    </div>
  );
}
