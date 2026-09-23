import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container, LinkButton } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { getViewer } from "@/lib/viewer";
import { JoinForm } from "./join-form";

export const metadata: Metadata = { title: "Teach on Groundwork" };

export default async function JoinPage() {
  const [viewer, catalog] = await Promise.all([getViewer(), getCatalog()]);
  if (viewer?.state.profile.educatorId) redirect("/creator");

  return (
    <Container size="lg" className="grid gap-14 py-16 lg:grid-cols-[1fr_1.1fr]">
      <div className="rise">
        <p className="eyebrow">For educators</p>
        <h1 className="display mt-3 text-4xl text-ink sm:text-5xl">Teach the topic you teach best.</h1>
        <p className="mt-5 text-[16px] leading-relaxed text-muted">
          Publish short lessons on specific AP and SAT topics. Students find them when they&apos;re stuck on exactly that idea, and
          your lesson rises if it helps them. When they want more, they can book you directly.
        </p>
        <ul className="mt-10 space-y-6">
          {[
            ["Ranked on teaching", "Completion, helpful votes, and saves decide placement. You don't need a following or a clever thumbnail."],
            ["Tutoring on your terms", "Set your own rate and availability. Requests come to your inbox or your own booking page."],
            ["Useful analytics", "See where students drop off and which lessons they save, with a plain-language suggestion for each lesson."],
          ].map(([t, d]) => (
            <li key={t}>
              <p className="text-[15px] font-medium text-ink">{t}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{d}</p>
            </li>
          ))}
        </ul>
      </div>
      <div>
        {viewer ? (
          <JoinForm courses={catalog.courses.map((c) => ({ id: c.id, title: c.title }))} />
        ) : (
          <div className="rounded-2xl border border-line bg-surface p-8 text-center">
            <p className="text-[15px] font-medium text-ink">Create an account to apply</p>
            <p className="mt-2 text-sm text-muted">It takes a minute. You&apos;ll set up your educator profile right after.</p>
            <div className="mt-6 flex justify-center gap-2">
              <LinkButton href="/signup">Create account</LinkButton>
              <LinkButton href="/login?next=/creator/join" variant="secondary">
                Sign in
              </LinkButton>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
