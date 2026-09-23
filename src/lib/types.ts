export type Exam = "AP" | "SAT";

export type Course = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  exam: Exam;
  subject: "Math" | "Science" | "History" | "English";
  description: string;
  /** Hue (0–360) used for subtle per-course accents. */
  hue: number;
  examMonth: string;
};

export type Unit = {
  id: string;
  courseId: string;
  slug: string;
  title: string;
  order: number;
  summary: string;
};

export type Concept = {
  id: string;
  unitId: string;
  courseId: string;
  slug: string;
  title: string;
  order: number;
};

export type Topic = {
  id: string;
  conceptId: string;
  unitId: string;
  courseId: string;
  slug: string;
  title: string;
  /** One or two sentences, shown at the top of the topic page. */
  summary: string;
  glyph: string;
  keyPoints: string[];
  aliases: string[];
  order: number;
};

/** A YouTube channel that publishes lessons in the library. */
export type Channel = {
  id: string;
  title: string;
  handle: string | null;
  thumbnail: string | null;
  subscribers: number | null;
  videoCount: number | null;
};

/** A YouTube video, as ingested by scripts/ingest-youtube.ts. */
export type YtVideo = {
  id: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  durationSec: number;
  views: number;
  likes: number | null;
  comments: number | null;
  thumbnail: string;
  courseId: string;
  topicId: string | null;
  /** How confidently the video matches its topic, 0–1. */
  relevance: number;
  isShort: boolean;
};

/** Engagement from Groundwork students (not YouTube). */
export type SiteStats = { opens: number; saves: number; helpful: number; notHelpful: number };

export type Curriculum = {
  courses: Course[];
  units: Unit[];
  concepts: Concept[];
  topics: Topic[];
};

export type Library = { generatedAt: string | null; channels: Channel[]; videos: YtVideo[] };

export type Role = "student" | "creator";

export type ScheduleEvent = {
  uid: string;
  title: string;
  start: string;
  end: string | null;
  allDay: boolean;
  kind: "test" | "assignment" | "class" | "other";
  courseId: string | null;
  topicIds: string[];
};

export type Schedule = {
  source: "ics-url" | "ics-file";
  /** Calendar feed URL (kept private to the owner). Null for uploaded files. */
  url: string | null;
  label: string;
  syncedAt: string;
  events: ScheduleEvent[];
};

export type Profile = {
  id: string;
  email: string;
  name: string;
  role: Role;
  onboarded: boolean;
  courseIds: string[];
  examDate: string | null;
  goal: string | null;
  /** Topics the student says they're covering in class right now. */
  focusTopicIds: string[];
  createdAt: string;
  trialEndsAt: string;
};

export type HistoryEntry = { videoId: string; openedAt: string; opens: number };

export type SubscriptionStatus = "none" | "trialing" | "active" | "past_due" | "canceled";

export type Subscription = {
  status: SubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

export type UserState = {
  profile: Profile;
  history: Record<string, HistoryEntry>;
  saves: Record<string, string>; // videoId -> savedAt
  votes: Record<string, 1 | -1>;
  /** Topics the student marked as understood (Khan-style mastery). */
  mastered: Record<string, string>; // topicId -> at
  schedule: Schedule | null;
  subscription: Subscription;
};

export type Access =
  | { kind: "anonymous" }
  | { kind: "trial"; daysLeft: number; endsAt: string }
  | { kind: "active"; renewsAt: string | null; cancelAtPeriodEnd: boolean }
  | { kind: "expired" };
