import { NextResponse, type NextRequest } from "next/server";
import { FILTERS, filterUsers, listAdminUsers, type FilterKey } from "@/lib/admin-users";
import { env } from "@/lib/env";
import { getViewer } from "@/lib/viewer";

const cell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

/** The signed-up users list as a spreadsheet. Admin only. */
export async function GET(req: NextRequest) {
  const viewer = await getViewer();
  if (!viewer?.isAdmin) return new NextResponse("Not found", { status: 404 });
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const f = req.nextUrl.searchParams.get("filter") ?? "all";
  const users = filterUsers(await listAdminUsers(env.adminEmails), q, (f in FILTERS ? f : "all") as FilterKey);
  const rows = [
    ["Email", "Name", "Signed up (UTC)", "Last sign-in (UTC)", "Method", "Type", "Courses", "Plan", "Sprint", "Calendar connected", "Finished setup"],
    ...users.map((u) => [u.email, u.name, u.signedUpAt, u.lastSignInAt ?? "", u.method, u.roles.join(" "), u.courses.join("; "), u.plan, u.sprint ?? "", u.calendar ? "yes" : "no", u.onboarded ? "yes" : "no"]),
  ];
  const csv = rows.map((r) => r.map(cell).join(",")).join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="merit-users-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
