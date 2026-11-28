import { Download, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, buttonClass, cn } from "@/components/ui";
import { FILTERS, filterUsers, listAdminUsers, type FilterKey } from "@/lib/admin-users";
import { env } from "@/lib/env";
import { recentEvents } from "@/lib/analytics";
import { duration, summarizeByUser } from "@/lib/user-activity";
import { getViewer } from "@/lib/viewer";
import { DeleteUserButton } from "./delete-user-button";

export const metadata: Metadata = { title: "Users", robots: { index: false } };

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York" }) + " ET" : "Never";

export default async function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  const viewer = await getViewer();
  if (!viewer?.isAdmin) notFound();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 100) : "";
  const filter = (typeof sp.filter === "string" && sp.filter in FILTERS ? sp.filter : "all") as FilterKey;
  const [all, events] = await Promise.all([listAdminUsers(env.adminEmails), recentEvents(180).catch(() => [])]);
  const activity = summarizeByUser(events);
  const shown = filterUsers(all, q, filter);
  const qs = (f: FilterKey) => `/admin/users?${new URLSearchParams({ ...(q ? { q } : {}), ...(f !== "all" ? { filter: f } : {}) })}`;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-8 sm:px-6 sm:pt-10 lg:px-8">
      <PageHeader
        back={{ href: "/admin", label: "Admin" }}
        title="Users"
        lede={
          <span className="tabular text-sm">
            {all.length.toLocaleString()} {all.length === 1 ? "account" : "accounts"} · newest first · activity from the last 180 days · click an email for everything they did
          </span>
        }
        actions={
          <a href={`/admin/users.csv?${new URLSearchParams({ ...(q ? { q } : {}), ...(filter !== "all" ? { filter } : {}) })}`} className={buttonClass("outline")}>
            <Download className="size-4" /> Download CSV
          </a>
        }
      />

      <form className="mt-6 flex max-w-xl items-center gap-2" role="search">
        {filter !== "all" ? <input type="hidden" name="filter" value={filter} /> : null}
        <label className="press font-brand flex h-11 min-w-0 flex-1 items-center gap-2 rounded-2xl bg-surface px-4 ring-2 ring-inset ring-line focus-within:ring-2 focus-within:ring-accent font-extrabold [--ledge:var(--line)]">
          <Search className="size-4 shrink-0 text-muted" />
          <span className="sr-only">Search by email or name</span>
          <input name="q" defaultValue={q} placeholder="Search by email or name" className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-faint" />
        </label>
        <button className={buttonClass("primary", "md", "h-11 px-5")}>Search</button>
      </form>

      <nav aria-label="Filter users" className="scrollbar-none -mx-4 mt-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {(Object.keys(FILTERS) as FilterKey[]).map((f) => (
          <Link
            key={f}
            href={qs(f)}
            aria-current={f === filter ? "page" : undefined}
            className={cn(
              "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold transition-[background-color,color] duration-150 active:scale-[0.97]",
              f === filter ? "bg-ink text-bg" : "bg-bg-subtle text-ink-2 hover:bg-line hover:text-ink",
            )}
          >
            {FILTERS[f].label} <span className="tabular opacity-60">{filterUsers(all, q, f).length}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-surface ring-2 ring-line">
        <table className="w-full min-w-[1300px] text-left text-[13.5px]">
          <thead className="border-b border-line bg-bg-subtle/60 text-[12px] text-muted">
            <tr>
              {["Email", "Name", "Signed up", "Last active", "Time on Merit", "Days active", "Pages", "Type", "Courses", "Plan", "Sprint", "Calendar"].map((h) => (
                <th key={h} scope="col" className="whitespace-nowrap px-3 py-2.5 font-semibold first:pl-5 last:pr-5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {shown.map((u) => (
              <tr key={u.id} className="align-top transition-colors duration-150 hover:bg-bg-subtle/50 [&>td:first-child]:pl-5 [&>td:last-child]:pr-5">
                <td className="px-3 py-2.5 font-medium text-ink">
                  <Link href={`/admin/users/${u.id}`} className="text-accent-ink underline-offset-2 hover:underline">
                    {u.email}
                  </Link>
                  {!u.onboarded ? <span className="ml-1.5 inline-flex rounded-full bg-warn-soft px-2 py-px text-[11px] font-semibold text-warn">setup unfinished</span> : null}
                  {u.roles.includes("admin") ? (
                    <span className="mt-1.5 block text-[11.5px] font-semibold text-muted" title="Admin accounts cannot be removed here">
                      Protected admin
                    </span>
                  ) : (
                    <DeleteUserButton userId={u.id} email={u.email} roles={u.roles} paid={u.plan === "Plus (paid)"} />
                  )}
                </td>
                <td className="px-3 py-2.5 text-ink-2">{u.name || <span className="text-muted">·</span>}</td>
                <td className="tabular whitespace-nowrap px-3 py-2.5 text-ink-2">{fmt(u.signedUpAt)}</td>
                <td className="tabular whitespace-nowrap px-3 py-2.5 text-ink-2">{activity.get(u.id) ? fmt(activity.get(u.id)!.lastActive) : <span className="text-muted">{u.lastSignInAt ? `Signed in ${fmt(u.lastSignInAt)}` : "Never"}</span>}</td>
                <td className="tabular whitespace-nowrap px-3 py-2.5 text-ink-2">{activity.get(u.id)?.seconds ? duration(activity.get(u.id)!.seconds) : <span className="text-muted">·</span>}</td>
                <td className="tabular px-3 py-2.5 text-ink-2">{activity.get(u.id)?.days ?? 0}</td>
                <td className="tabular px-3 py-2.5 text-ink-2">{activity.get(u.id)?.views ?? 0}</td>
                <td className="px-3 py-2.5 capitalize text-ink-2">{u.roles.join(", ")}</td>
                <td className="max-w-[240px] px-3 py-2.5 text-ink-2">{u.courses.length ? u.courses.join(", ") : <span className="text-muted">None</span>}</td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  <span className={cn("rounded-full px-2 py-0.5 text-[12px] font-semibold", u.plan === "Plus (paid)" ? "bg-positive-soft text-positive" : u.plan === "Plus trial" ? "bg-accent-soft text-accent-ink" : "bg-bg-subtle text-muted")}>{u.plan}</span>
                </td>
                <td className="px-3 py-2.5 text-ink-2">{u.sprint ?? <span className="text-muted">·</span>}</td>
                <td className="px-3 py-2.5">{u.calendar ? <span className="font-medium text-positive">Connected</span> : <span className="text-muted">No</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!shown.length ? <p className="px-5 py-10 text-center text-sm text-muted">{q ? `No accounts match “${q}”.` : "No accounts here yet."}</p> : null}
      </div>
    </div>
  );
}
