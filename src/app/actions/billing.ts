"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { saveBilling, startPlusTrial } from "@/lib/billing/access";
import { getViewer } from "@/lib/viewer";

/** Cancel or resume Plus that was granted in test mode or as a gift (Stripe subscriptions use the Stripe portal). */
export async function setPlusCancel(cancel: boolean) {
  const viewer = await getViewer();
  if (!viewer) return;
  const b = viewer.billing;
  if (b.plus.source === "stripe") return;
  await saveBilling({ ...b, plus: { ...b.plus, cancelAtPeriodEnd: cancel } });
  revalidatePath("/settings/billing");
}

const safeReturn = (v: FormDataEntryValue | null) => {
  const s = typeof v === "string" ? v : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : "/plan";
};

/** Starts the free Merit Plus trial from any Plus feature, then returns to it. Visitors sign up first. */
export async function startTrial(form: FormData) {
  const returnTo = safeReturn(form.get("returnTo"));
  const viewer = await getViewer();
  if (!viewer) redirect(`/signup?as=student&next=${encodeURIComponent(returnTo)}`);
  await startPlusTrial(viewer.user.id, viewer.state.profile);
  revalidatePath("/", "layout");
  redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}trial=started`);
}
