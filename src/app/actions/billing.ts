"use server";

import { revalidatePath } from "next/cache";
import { saveBilling } from "@/lib/billing/access";
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
