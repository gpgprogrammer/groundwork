export type Exam = "AP" | "SAT";

export type Course = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  exam: Exam;
  subject: "Math" | "Science" | "History" | "English";
  description: string;
  /** Hue (0–360) used for subtle per-course tints. */
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
  /** One or two sentences. Shown at the top of the topic page. */
  summary: string;
  /** A short typographic mark used on thumbnails, e.g. "f(g(x))". */
  glyph: string;
  keyPoints: string[];
  aliases: string[];
  order: number;
};

export type Educator = {
  id: string;
  handle: string;
  name: string;
  firstName: string;
  headline: string;
  bio: string;
  subjects: string[];
  courseIds: string[];
  credentials: string[];
  rating: number;
  ratingCount: number;
  hourlyRate: number;
  yearsTeaching: number;
  location: string;
  responseTime: string;
  acceptingStudents: boolean;
  bookingUrl: string | null;
  hue: number;
};

export type VideoStyle = "Concept" | "Practice" | "Exam strategy" | "Common mistakes";

export type Chapter = { t: number; title: string };

export type VideoStats = {
  views: number;
  /** Viewers who reached ≥90% of the video. */
  completions: number;
  /** Mean fraction of the video watched, 0–1. */
  avgWatchFraction: number;
  helpful: number;
  notHelpful: number;
  saves: number;
  /** Share of viewers who rewatched a section or the whole lesson. */
  rewatchRate: number;
  /** Share of viewers who left in the first 15% of the video. */
  earlyDropRate: number;
};

export type Video = {
  id: string;
  topicId: string;
  educatorId: string;
  title: string;
  description: string;
  style: VideoStyle;
  durationSec: number;
  publishedAt: string;
  chapters: Chapter[];
  /** Optional real media. Seeded lessons use the built-in lesson player. */
  mediaUrl: string | null;
  status: "published" | "draft";
  stats: VideoStats;
};

export type Catalog = {
  courses: Course[];
  units: Unit[];
  concepts: Concept[];
  topics: Topic[];
  educators: Educator[];
  videos: Video[];
};

export type Role = "student" | "creator";

export type Profile = {
  id: string;
  email: string;
  name: string;
  role: Role;
  educatorId: string | null;
  onboarded: boolean;
  courseIds: string[];
  examDate: string | null;
  goal: string | null;
  dailyMinutes: number | null;
  createdAt: string;
  trialEndsAt: string;
};

export type Progress = {
  videoId: string;
  position: number;
  secondsWatched: number;
  duration: number;
  completed: boolean;
  watchCount: number;
  updatedAt: string;
};

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
  progress: Record<string, Progress>;
  saves: Record<string, string>; // videoId -> savedAt
  votes: Record<string, 1 | -1>;
  subscription: Subscription;
};

export type TutoringRequest = {
  id: string;
  educatorId: string;
  userId: string | null;
  name: string;
  email: string;
  courseId: string | null;
  message: string;
  availability: string;
  status: "new" | "replied" | "scheduled" | "archived";
  createdAt: string;
  sourceVideoId: string | null;
};

export type Access =
  | { kind: "anonymous" }
  | { kind: "trial"; daysLeft: number; endsAt: string }
  | { kind: "active"; renewsAt: string | null; cancelAtPeriodEnd: boolean }
  | { kind: "expired" };
