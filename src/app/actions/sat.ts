"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getStore } from "@/lib/data/store";
import { trackServer } from "@/lib/analytics";
import { bandToMastery, parseScoreText, SAT_COLLECTION, SAT_DOMAINS, scoreFromPercent, SECTION_QUESTIONS, type ParsedReport, type SatDomainId, type SatPrep, type ScoreEntry } from "@/lib/sat-prep";
import { getViewer } from "@/lib/viewer";

const PATH = "/sprint/sat";

async function me() {
  const viewer = await getViewer();
  if (!viewer) redirect(`/signup?next=${PATH}`);
  return viewer;
}

const int = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n) : null;
};
const section = (v: FormDataEntryValue | null) => {
  const n = int(v);
  return n != null && n >= 200 && n <= 800 ? Math.round(n / 10) * 10 : null;
};

/**
 * Where the student is now, from whichever way they told us: section scores, questions right per
 * section, or nothing (an estimate until their first practice test). Domain results are optional,
 * as questions right out of how many, or the 1–7 performance band from the score report.
 */
function readStanding(form: FormData): { entry: ScoreEntry | null; domains: Partial<Record<SatDomainId, number>>; error?: string } {
  const mode = String(form.get("mode") ?? "scores");
  let math: number | null = null;
  let rw: number | null = null;
  let source: ScoreEntry["source"] = form.get("source") === "official" ? "official" : "practice";
  if (mode === "scores" || mode === "upload") {
    math = section(form.get("math"));
    rw = section(form.get("rw"));
    if (math == null && rw == null) return { entry: null, domains: {}, error: "Enter at least one section score (200 to 800), or choose another way to tell us where you are." };
  } else if (mode === "right") {
    const mr = int(form.get("mathRight"));
    const rr = int(form.get("rwRight"));
    if (mr == null && rr == null) return { entry: null, domains: {}, error: "Enter how many questions you got right in at least one section." };
    if (mr != null && (mr < 0 || mr > SECTION_QUESTIONS.math)) return { entry: null, domains: {}, error: `Math has ${SECTION_QUESTIONS.math} questions.` };
    if (rr != null && (rr < 0 || rr > SECTION_QUESTIONS.rw)) return { entry: null, domains: {}, error: `Reading and Writing has ${SECTION_QUESTIONS.rw} questions.` };
    math = mr != null ? scoreFromPercent(mr / SECTION_QUESTIONS.math) : null;
    rw = rr != null ? scoreFromPercent(rr / SECTION_QUESTIONS.rw) : null;
  } else {
    source = "estimate";
  }
  const domains: Partial<Record<SatDomainId, number>> = {};
  for (const d of SAT_DOMAINS) {
    const band = int(form.get(`band_${d.id}`));
    const right = int(form.get(`right_${d.id}`));
    const of = int(form.get(`of_${d.id}`));
    if (right != null && of != null && of > 0 && right >= 0 && right <= of && of <= 30) domains[d.id] = right / of;
    else if (band != null && band >= 1 && band <= 7) domains[d.id] = bandToMastery(band);
  }
  const takenOn = String(form.get("takenOn") ?? "");
  const entry: ScoreEntry | null =
    source === "estimate"
      ? null
      : { at: new Date().toISOString(), ...(/^\d{4}-\d{2}-\d{2}$/.test(takenOn) ? { takenOn } : {}), math, rw, source, ...(Object.keys(domains).length ? { domains } : {}) };
  return { entry, domains };
}

export type SatFormState = { error?: string };

export async function saveSatPrep(_: SatFormState, form: FormData): Promise<SatFormState> {
  const viewer = await me();
  const testDate = String(form.get("testDate") ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(testDate)) return { error: "Pick your SAT date." };
  const t = new Date(`${testDate}T12:00:00`).getTime();
  if (t < Date.now() - 86_400_000) return { error: "That date has already passed. Pick your next SAT." };
  if (t > Date.now() + 2 * 366 * 86_400_000) return { error: "Pick a date within the next two years." };
  const target = int(form.get("target"));
  if (target == null || target < 400 || target > 1600) return { error: "Your target score is between 400 and 1600." };
  const minutesPerDay = int(form.get("minutesPerDay"));
  if (minutesPerDay == null || minutesPerDay < 10 || minutesPerDay > 480) return { error: "Study time is 10 minutes to 8 hours a day." };
  const daysPerWeek = Math.min(7, Math.max(3, int(form.get("daysPerWeek")) ?? 6));

  const store = await getStore();
  const existing = await store.getDoc<SatPrep>(SAT_COLLECTION, viewer.user.id);
  const now = new Date().toISOString();
  let scores = existing?.scores ?? [];
  let domains = existing?.domains ?? {};
  if (!existing || form.get("mode")) {
    const standing = readStanding(form);
    if (standing.error) return { error: standing.error };
    if (standing.entry) scores = [...scores, standing.entry];
    domains = { ...domains, ...standing.domains };
  }
  const prep: SatPrep = {
    id: viewer.user.id,
    userId: viewer.user.id,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    testDate,
    target: Math.round(target / 10) * 10,
    minutesPerDay,
    daysPerWeek,
    scores: scores.slice(-40),
    domains,
    done: existing?.done ?? {},
  };
  await store.putDoc(SAT_COLLECTION, prep.id, prep, viewer.user.id);
  await trackServer("act", { u: viewer.user.id, x: existing ? "sat_prep_updated" : "sat_prep_created", d: `Target ${prep.target} on ${prep.testDate}, ${prep.minutesPerDay} min/day` });
  revalidatePath(PATH);
  redirect(`${PATH}?${existing ? "updated" : "created"}=1`);
}

/** A new score: a practice test, an official SAT, or results by domain. The plan rebuilds around it. */
export async function logSatScore(_: SatFormState, form: FormData): Promise<SatFormState> {
  const viewer = await me();
  const store = await getStore();
  const prep = await store.getDoc<SatPrep>(SAT_COLLECTION, viewer.user.id);
  if (!prep) redirect(PATH);
  const standing = readStanding(form);
  if (standing.error) return { error: standing.error };
  if (!standing.entry && !Object.keys(standing.domains).length) return { error: "Enter a score or your results by domain." };
  const next: SatPrep = {
    ...prep,
    updatedAt: new Date().toISOString(),
    scores: standing.entry ? [...prep.scores, fillMissing(standing.entry, prep.scores.at(-1))].slice(-40) : prep.scores,
    domains: { ...prep.domains, ...standing.domains },
  };
  await store.putDoc(SAT_COLLECTION, next.id, next, viewer.user.id);
  const e = standing.entry;
  await trackServer("act", { u: viewer.user.id, x: "sat_score_logged", d: e ? `Math ${e.math ?? "?"}, R&W ${e.rw ?? "?"} (${e.source})` : "Domain results" });
  revalidatePath(PATH);
  redirect(`${PATH}?logged=1#scores`);
}

/** A test that reports only one section keeps the other section's latest score. */
function fillMissing(e: ScoreEntry, prev: ScoreEntry | undefined): ScoreEntry {
  return { ...e, math: e.math ?? prev?.math ?? null, rw: e.rw ?? prev?.rw ?? null };
}

export async function toggleSatTask(taskId: string, done: boolean) {
  const viewer = await me();
  if (!/^\d{4}-\d{2}-\d{2}:[\w:/.-]{1,160}$/.test(taskId)) return;
  const store = await getStore();
  const prep = await store.getDoc<SatPrep>(SAT_COLLECTION, viewer.user.id);
  if (!prep) return;
  const next = { ...prep.done };
  if (done) next[taskId] = new Date().toISOString();
  else delete next[taskId];
  // Keep the map from growing forever: drop check-offs older than a year.
  const cutoff = new Date(Date.now() - 366 * 86_400_000).toISOString().slice(0, 10);
  for (const k of Object.keys(next)) if (k.slice(0, 10) < cutoff) delete next[k];
  await store.putDoc(SAT_COLLECTION, prep.id, { ...prep, done: next, updatedAt: new Date().toISOString() }, viewer.user.id);
  await trackServer("act", { u: viewer.user.id, x: done ? "sat_task_done" : "sat_task_undone", d: taskId.slice(11) });
  revalidatePath(PATH);
}

export async function deleteSatPrep() {
  const viewer = await me();
  await (await getStore()).deleteDoc(SAT_COLLECTION, viewer.user.id);
  revalidatePath(PATH);
  redirect(PATH);
}

/** Reads a score report: a PDF or pasted text from the College Board score report or Bluebook/My Practice results. */
export async function readSatReport(form: FormData): Promise<ParsedReport & { error?: string }> {
  await me();
  const empty: ParsedReport = { math: null, rw: null, total: null, domains: {}, found: [] };
  let text = String(form.get("text") ?? "").slice(0, 60_000);
  const file = form.get("file");
  if (file instanceof File && file.size) {
    if (file.size > 8 * 1024 * 1024) return { ...empty, error: "That file is over 8 MB. Try a smaller PDF, or paste the text instead." };
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      try {
        const { extractText } = await import("unpdf");
        const { text: pages } = await extractText(new Uint8Array(await file.arrayBuffer()), { mergePages: true });
        text = `${text}\n${pages}`;
      } catch {
        return { ...empty, error: "Couldn't read that PDF. Paste the text from your score report instead." };
      }
    } else if (file.type.startsWith("text/")) {
      text = `${text}\n${(await file.text()).slice(0, 60_000)}`;
    } else {
      return { ...empty, error: "Screenshots can't be read yet. Upload the PDF of your score report, paste its text, or type your scores below." };
    }
  }
  if (!text.trim()) return { ...empty, error: "Add a PDF or paste the text of your score report." };
  const parsed = parseScoreText(text);
  if (!parsed.found.length) return { ...parsed, error: "Couldn't find scores in that. Type them in below instead." };
  return parsed;
}
