import type { Booking } from "@/lib/types";
import { cn } from "./ui";

const LABEL: Record<Booking["status"], string> = { requested: "Waiting for tutor", confirmed: "Confirmed", declined: "Declined", completed: "Completed", canceled: "Canceled" };

export function BookingStatus({ b }: { b: Booking }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-semibold",
        b.status === "confirmed" && "bg-positive-soft text-positive",
        b.status === "requested" && "bg-warn-soft text-warn",
        b.status === "completed" && "bg-accent-soft text-accent",
        (b.status === "declined" || b.status === "canceled") && "bg-bg-subtle text-muted",
      )}
    >
      {LABEL[b.status]}
    </span>
  );
}

export const money = (n: number) => `$${n.toFixed(2).replace(/\.00$/, "")}`;
