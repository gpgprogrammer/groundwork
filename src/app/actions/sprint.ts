"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { gradeFrq, frqPrompt, practiceSet, questionsForTopic } from "@/lib/ai/content";
import { aiAvailable } from "@/lib/ai/runtime";
import { consumeCredit } from "@/lib/sprint-store";
import { startSprintTrial } from "@/lib/billing/access";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { diagnosticTopics, readiness, topicAccuracy } from "@/lib/sprint";
import type { FrqAttempt, Question, Sprint, SprintAnswer } from "@/lib/types";
import { getViewer } from "@/lib/viewer";

async function ownSprint(id: string) {
  const viewer = await getViewer();
  if (!viewer) redirect(`/login?next=/sprint`);
  const sprint = await (await getStore()).getDoc<Sprint>("sprints", id);
  if (!sprint || sprint.userId !== viewer.user.id) throw new Error("Sprint not found.");
  return { viewer, sprint: await consumeCredit(sprint) };
}

async function save(s: Sprint) {
  await (await getStore()).putDoc("sprints", s.id, s, s.userId);
}

const tryUnlock = consumeCredit;

const createSchema = z.object({
  courseId: z.string().min(1),
  examDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick your exam date."),
  minutesPerDay: z.coerce.number({ message: "Enter how much time you have: 10 minutes to 8 hours." }).int().min(10, "At least 10 minutes a day.").max(480, "Up to 8 hours a day."),
});

export type CreateState = { error?: string };

export async function createSprint(_: CreateState, form: FormData): Promise<CreateState> {
  const viewer = await getViewer();
  if (!viewer) redirect("/signup?next=/sprint");
  const parsed = createSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const catalog = await getCatalog();
  if (!catalog.course(parsed.data.courseId)) return { error: "Pick a course." };
  const exam = new Date(`${parsed.data.examDate}T12:00:00`).getTime();
  if (exam < Date.now() - 86400000) return { error: "That date has already passed." };
  if (exam > Date.now() + 400 * 86400000) return { error: "Pick a date within the next year." };

  const store = await getStore();
  const existing = (await store.listDocs<Sprint>("sprints", { owner: viewer.user.id })).find(
    (s) => s.courseId === parsed.data.courseId && new Date(`${s.examDate}T12:00:00`).getTime() > Date.now() - 86400000,
  );
  if (existing) redirect(`/sprint/${existing.id}`);

  let sprint: Sprint = {
    id: `spr_${randomUUID().slice(0, 12)}`,
    userId: viewer.user.id,
    ...parsed.data,
    createdAt: new Date().toISOString(),
    unlocked: false,
    confidence: {},
    answers: [],
    done: {},
    frq: [],
  };
  await save(sprint);
  sprint = await tryUnlock(sprint);
  redirect(`/sprint/${sprint.id}/diagnostic`);
}

export async function unlockWithCredit(id: string) {
  const { sprint } = await ownSprint(id);
  await tryUnlock(sprint);
  revalidatePath(`/sprint/${id}`);
}

export async function saveConfidence(id: string, confidence: Record<string, number>) {
  const { sprint } = await ownSprint(id);
  const clean: Record<string, number> = {};
  for (const [k, v] of Object.entries(confidence)) if (typeof v === "number" && v >= 1 && v <= 5) clean[k] = Math.round(v);
  await save({ ...sprint, confidence: clean });
}

export type Mode = "diagnostic" | "daily" | "checkpoint" | "topic";

/** Questions for a session. Everything but the diagnostic needs an unlocked sprint. */
export async function loadQuestions(id: string, mode: Mode, topicIds: string[] = []): Promise<{ questions: Question[]; unavailable?: boolean; locked?: boolean }> {
  const { sprint } = await ownSprint(id);
  if (mode !== "diagnostic" && !sprint.unlocked) return { questions: [], locked: true };
  const catalog = await getCatalog();
  const seen = new Set(sprint.answers.map((a) => a.questionId));
  let topics: string[];
  let count: number;
  if (mode === "diagnostic") {
    // One question per sampled topic.
    const ts = diagnosticTopics(catalog, sprint.courseId, 12, sprint.unitIds);
    const banks = await Promise.all(ts.map((t) => questionsForTopic(t.id)));
    const questions = banks.map((b) => b.find((q) => !seen.has(q.id)) ?? b[0]).filter((q): q is Question => Boolean(q));
    return { questions, unavailable: !questions.length && !(await aiAvailable()) };
  }
  if (mode === "checkpoint") {
    // Weighted toward weaker, heavier units.
    const r = readiness(catalog, sprint).sort((a, b) => (1 - b.score) * b.weight - (1 - a.score) * a.weight);
    topics = r.slice(0, 6).flatMap((u) => {
      const ts = catalog.topicsForUnit(u.unit.id);
      return ts.length ? [ts[(sprint.answers.length + u.unit.order) % ts.length].id] : [];
    });
    count = 10;
  } else {
    const valid = topicIds.filter((t) => catalog.topic(t)?.courseId === sprint.courseId).slice(0, 4);
    if (!valid.length) {
      // Default: the topics you're weakest on.
      const acc = topicAccuracy(sprint);
      valid.push(
        ...[...acc.entries()]
          .sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total)
          .slice(0, 3)
          .map(([t]) => t),
      );
    }
    topics = valid;
    count = mode === "topic" ? 5 : 6;
  }
  const questions = await practiceSet(topics, count, seen);
  return { questions, unavailable: !questions.length && !(await aiAvailable()) };
}

export async function recordAnswer(id: string, questionId: string, choice: number, kind: SprintAnswer["kind"]) {
  const { sprint } = await ownSprint(id);
  // Look the question up server-side so correctness can't be spoofed.
  const store = await getStore();
  const catalog = await getCatalog();
  let q: Question | undefined;
  for (const t of catalog.topicsForCourse(sprint.courseId)) {
    const bank = await store.getDoc<{ questions: Question[] }>("qbank", t.id);
    q = bank?.questions.find((x) => x.id === questionId);
    if (q) break;
  }
  if (!q) throw new Error("Question not found.");
  const answer: SprintAnswer = { questionId, topicId: q.topicId, choice, correct: choice === q.answer, at: new Date().toISOString(), kind };
  await save({ ...sprint, answers: [...sprint.answers, answer].slice(-2000) });
  return { correct: answer.correct };
}

export async function finishSession(id: string, taskId: string | null) {
  const { sprint } = await ownSprint(id);
  if (taskId && /^\d{4}-\d{2}-\d{2}:/.test(taskId)) await save({ ...sprint, done: { ...sprint.done, [taskId]: new Date().toISOString() } });
  revalidatePath(`/sprint/${id}`);
}

export async function toggleSprintTask(id: string, taskId: string, done: boolean) {
  const { sprint } = await ownSprint(id);
  if (!/^\d{4}-\d{2}-\d{2}:/.test(taskId)) return;
  const next = { ...sprint.done };
  if (done) next[taskId] = new Date().toISOString();
  else delete next[taskId];
  await save({ ...sprint, done: next });
  revalidatePath(`/sprint/${id}`);
}

export async function updateSprintSettings(id: string, form: FormData) {
  const { sprint } = await ownSprint(id);
  const examDate = String(form.get("examDate") ?? "");
  const minutes = Number(form.get("minutesPerDay"));
  await save({
    ...sprint,
    examDate: /^\d{4}-\d{2}-\d{2}$/.test(examDate) ? examDate : sprint.examDate,
    minutesPerDay: minutes >= 10 && minutes <= 480 ? Math.round(minutes) : sprint.minutesPerDay,
  });
  revalidatePath(`/sprint/${id}`);
}

export async function newFrq(id: string, unitId: string) {
  const { sprint } = await ownSprint(id);
  if (!sprint.unlocked) return { error: "Unlock your Sprint to use the free-response coach." };
  const prompt = await frqPrompt(unitId);
  return prompt ? { prompt } : { error: "The free-response coach isn't available right now. Try again soon." };
}

export async function submitFrq(id: string, unitId: string, prompt: string, answer: string) {
  const { sprint } = await ownSprint(id);
  if (!sprint.unlocked) return { error: "Unlock your Sprint to use the free-response coach." };
  if (answer.trim().length < 40) return { error: "Write a bit more first. Aim for a full answer to each part." };
  const graded = await gradeFrq(unitId, prompt.slice(0, 6000), answer.slice(0, 8000));
  if (!graded) return { error: "Grading isn't available right now. Your answer is still here; try again soon." };
  const attempt: FrqAttempt = { id: `frq_${randomUUID().slice(0, 10)}`, unitId, prompt, answer, feedback: graded.feedback, score: graded.score, outOf: graded.outOf, at: new Date().toISOString() };
  await save({ ...sprint, frq: [attempt, ...sprint.frq].slice(0, 30) });
  revalidatePath(`/sprint/${id}`);
  return { attempt };
}

export async function deleteSprint(id: string) {
  const { sprint } = await ownSprint(id);
  await (await getStore()).deleteDoc("sprints", sprint.id);
  redirect("/sprint");
}

const testSchema = z.object({
  courseId: z.string().min(1, "Pick the class this test is for."),
  title: z.string().trim().min(2, "Name the test.").max(120),
  examDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick the test date."),
  minutesPerDay: z.coerce.number({ message: "Enter how much time you have: 10 minutes to 8 hours." }).int().min(10, "At least 10 minutes a day.").max(480, "Up to 8 hours a day."),
  eventUid: z.string().max(300).optional(),
  unitIds: z.array(z.string()).min(1, "Pick at least one unit the test covers."),
});

/** A Sprint for a class test or quiz on the student's calendar, scoped to the units it covers. */
export async function createTestSprint(_: CreateState, form: FormData): Promise<CreateState> {
  const viewer = await getViewer();
  if (!viewer) redirect("/signup?next=/sprint");
  const parsed = testSchema.safeParse({ ...Object.fromEntries(form), unitIds: form.getAll("unitIds").map(String) });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const catalog = await getCatalog();
  if (!catalog.course(d.courseId)) return { error: "Pick a class." };
  const unitIds = d.unitIds.filter((u) => catalog.unit(u)?.courseId === d.courseId);
  if (!unitIds.length) return { error: "Pick at least one unit the test covers." };
  if (new Date(`${d.examDate}T12:00:00`).getTime() < Date.now() - 86400000) return { error: "That test date has passed." };
  const store = await getStore();
  if (d.eventUid) {
    const existing = (await store.listDocs<Sprint>("sprints", { owner: viewer.user.id })).find((s) => s.eventUid === d.eventUid);
    if (existing) redirect(`/sprint/${existing.id}`);
  }
  let sprint: Sprint = {
    id: `spr_${randomUUID().slice(0, 12)}`,
    userId: viewer.user.id,
    courseId: d.courseId,
    kind: "test",
    title: d.title,
    unitIds,
    eventUid: d.eventUid,
    examDate: d.examDate,
    minutesPerDay: d.minutesPerDay,
    createdAt: new Date().toISOString(),
    unlocked: false,
    confidence: {},
    answers: [],
    done: {},
    frq: [],
  };
  await save(sprint);
  sprint = await tryUnlock(sprint);
  redirect(`/sprint/${sprint.id}/diagnostic`);
}

/** Starts the one free week of Exam Sprint for this account. */
export async function beginSprintTrial(returnTo: string) {
  const viewer = await getViewer();
  if (!viewer) redirect(`/signup?next=${encodeURIComponent(returnTo)}`);
  await startSprintTrial(viewer.user.id);
  revalidatePath("/", "layout");
  redirect(returnTo.startsWith("/") && !returnTo.startsWith("//") ? `${returnTo}${returnTo.includes("?") ? "&" : "?"}trial=started` : "/sprint");
}
