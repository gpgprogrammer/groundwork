import { Download, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cn } from "@/components/ui";
import { FILTERS, filterUsers, listAdminUsers, type FilterKey } from "@/lib/admin-users";
import { env } from "@/lib/env";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Users", robots: { index: false } };

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York" }) + " ET" : "Never";

export default async function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  const viewer = await getViewer();
  if (!viewer?.isAdmin) notFound();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 100) : "";
  const filter = (typeof sp.filter === "string" && sp.filter in FILTERS ? sp.filter : "all") as FilterKey;
  const all = await listAdminUsers(env.adminEmails);
  const shown = filterUsers(all, q, filter);
  const qs = (f: FilterKey) => `/admin/users?${new URLSearchParams({ ...(q ? { q } : {}), ...(f !== "all" ? { filter: f } : {}) })}`;

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-20 pt-8 sm:px-6">
      <Link href="/admin" className="text-sm text-muted hover:text-ink">
        ← Admin
      </Link>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">Users</h1>
          <p className="mt-1 text-sm text-muted">
            {all.length.toLocaleString()} {all.length === 1 ? "account" : "accounts"} · newest first
          </p>
        </div>
        <a href={`/admin/users.csv?${new URLSearchParams({ ...(q ? { q } : {}), ...(filter !== "all" ? { filter } : {}) })}`} className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold text-ink ring-1 ring-line-strong hover:bg-bg-subtle">
          <Download className="size-4" /> Download CSV
        </a>
      </div>

      <form className="mt-6 flex max-w-xl items-center gap-2" role="search">
        {filter !== "all" ? <input type="hidden" name="filter" value={filter} /> : null}
        <label className="flex h-11 flex-1 items-center gap-2 rounded-full bg-bg px-4 ring-1 ring-line-strong focus-within:ring-2 focus-within:ring-accent">
          <Search className="size-4 text-muted" />
          <span className="sr-only">Search by email or name</span>
          <input name="q" defaultValue={q} placeholder="Search by email or name" className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none" />
        </label>
        <button className="h-11 rounded-full bg-ink px-5 text-sm font-semibold text-bg">Search</button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {(Object.keys(FILTERS) as FilterKey[]).map((f) => (
          <Link key={f} href={qs(f)} className={cn("rounded-full px-3 py-1.5 text-[13px] font-medium", f === filter ? "bg-ink text-bg" : "bg-bg-subtle text-ink hover:bg-line")}>
            {FILTERS[f].label} <span className="tabular opacity-60">{filterUsers(all, q, f).length}</span>
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl ring-1 ring-line">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="bg-bg-subtle text-[12px] text-muted">
            <tr>
              {["Email", "Name", "Signed up", "Last sign-in", "Method", "Type", "Courses", "Plan", "Sprint", "Calendar"].map((h) => (
                <th key={h} className="px-3 py-2.5 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {shown.map((u) => (
              <tr key={u.id} className="align-top">
                <td className="px-3 py-2.5 font-medium text-ink">
                  {u.email}
                  {!u.onboarded ? <span className="ml-1.5 rounded bg-[#fff1e8] px-1.5 py-px text-[11px] font-semibold text-[#c2410c]">setup unfinished</span> : null}
                </td>
                <td className="px-3 py-2.5 text-ink-2">{u.name || <span className="text-muted">·</span>}</td>
                <td className="tabular whitespace-nowrap px-3 py-2.5 text-ink-2">{fmt(u.signedUpAt)}</td>
                <td className="tabular whitespace-nowrap px-3 py-2.5 text-muted">{fmt(u.lastSignInAt)}</td>
                <td className="px-3 py-2.5 text-ink-2">{u.method}</td>
                <td className="px-3 py-2.5 capitalize text-ink-2">{u.roles.join(", ")}</td>
                <td className="max-w-[240px] px-3 py-2.5 text-ink-2">{u.courses.length ? u.courses.join(", ") : <span className="text-muted">None</span>}</td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  <span className={cn("rounded-full px-2 py-0.5 text-[12px] font-medium", u.plan === "Plus (paid)" ? "bg-positive-soft text-positive" : u.plan === "Plus trial" ? "bg-accent-soft text-accent" : "bg-bg-subtle text-muted")}>{u.plan}</span>
                </td>
                <td className="px-3 py-2.5 text-ink-2">{u.sprint ?? <span className="text-muted">·</span>}</td>
                <td className="px-3 py-2.5">{u.calendar ? <span className="text-positive">Connected</span> : <span className="text-muted">No</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!shown.length ? <p className="p-6 text-sm text-muted">{q ? `No accounts match “${q}”.` : "No accounts here yet."}</p> : null}
      </div>
    </div>
  );
}
