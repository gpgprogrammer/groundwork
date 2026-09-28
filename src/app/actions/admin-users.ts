"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { removeAdminUserAccount, type RemoveAdminUserResult } from "@/lib/admin-users";
import { env } from "@/lib/env";
import { getViewer } from "@/lib/viewer";

const userIdSchema = z.string().uuid();

export async function deleteAdminUserAccount(userId: string): Promise<RemoveAdminUserResult> {
  const parsed = userIdSchema.safeParse(userId);
  if (!parsed.success) return { ok: false, error: "That account could not be identified." };

  const viewer = await getViewer();
  if (!viewer?.isAdmin) return { ok: false, error: "You do not have permission to remove accounts." };

  const result = await removeAdminUserAccount({ actorId: viewer.user.id, targetId: parsed.data, adminEmails: env.adminEmails });
  if (result.ok) {
    revalidatePath("/admin/users");
    revalidatePath("/", "layout");
  }
  return result;
}
