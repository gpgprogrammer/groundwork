export type Exam = "AP" | "SAT";

export const CATEGORIES = [
  "Math & Computer Science",
  "Sciences",
  "History & Social Sciences",
  "English",
  "World Languages & Cultures",
  "Arts",
  "AP Capstone",
  "AP Career Kickstart",
  "SAT",
] as const;
export type Category = (typeof CATEGORIES)[number];

export type Course = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  exam: Exam;
  category: Category;
  description: string;
  /** Hue (0–360) used for subtle per-course accents. */
  hue: number;
  examMonth: string;
  /** Appended to topic titles when searching YouTube, e.g. "AP Psychology". */
  query: string;
  /** Lowercase phrases that identify the course in titles and calendar events. */
  keywords: string[];
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
  keyPoints: string[];
  aliases: string[];
  order: number;
  /** Cross-listed topic whose videos this one shares (e.g. Calc AB → Calc BC). */
  sameAs?: string;
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
  /** Set when an educator added this video on Merit. */
  addedBy?: { educatorId: string; name: string; note: string };
};

/** Engagement from Merit students (not YouTube). */
export type SiteStats = { opens: number; saves: number; helpful: number; notHelpful: number };

export type Curriculum = {
  courses: Course[];
  units: Unit[];
  concepts: Concept[];
  topics: Topic[];
};

export type Library = { generatedAt: string | null; channels: Channel[]; videos: YtVideo[] };

export type ScheduleEvent = {
  uid: string;
  title: string;
  start: string;
  end: string | null;
  allDay: boolean;
  kind: "test" | "assignment" | "class" | "other";
  courseId: string | null;
  topicIds: string[];
  /** Which connected calendar or import this came from. */
  sourceId?: string;
};

export type ScheduleSource = {
  id: string;
  kind: "ics-url" | "ics-file" | "document" | "text";
  /** Calendar feed URL (kept private to the owner). Null for uploads. */
  url: string | null;
  label: string;
  syncedAt: string;
  count: number;
};

export type Schedule = {
  sources: ScheduleSource[];
  events: ScheduleEvent[];
  /** Events the student removed. */
  hidden: string[];
  syncedAt: string;
};

export type Role = "student" | "tutor";

export type Location = { city: string; region: string; country: string; zip: string };

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
  location: Location | null;
  createdAt: string;
};

export type HistoryEntry = { videoId: string; openedAt: string; opens: number };

export type UserState = {
  profile: Profile;
  history: Record<string, HistoryEntry>;
  saves: Record<string, string>; // videoId -> savedAt
  votes: Record<string, 1 | -1>;
  /** Topics the student marked as understood (Khan-style mastery). */
  mastered: Record<string, string>; // topicId -> at
  schedule: Schedule | null;
};

/** An independent tutor who listed themselves on Merit. */
export type Tutor = {
  id: string;
  userId: string;
  name: string;
  headline: string;
  bio: string;
  courseIds: string[];
  /** USD per hour; null means free or volunteer. */
  hourlyRate: number | null;
  city: string;
  region: string;
  country: string;
  online: boolean;
  inPerson: boolean;
  /** Optional external scheduling link (Calendly, etc.). */
  bookingUrl: string | null;
  yearsExperience: number;
  credentials: string;
  createdAt: string;
};

export type TutorReview = { id: string; tutorId: string; userId: string; userName: string; rating: number; text: string; createdAt: string };

export type TutorWithStats = Tutor & { rating: number | null; reviewCount: number; score: number };

export type TutoringRequest = {
  id: string;
  tutorId: string;
  userId: string | null;
  name: string;
  email: string;
  courseId: string | null;
  message: string;
  availability: string;
  status: "new" | "replied" | "scheduled" | "archived";
  createdAt: string;
};

/** A tracked referral to a tutor or tutoring service (basis for partner commission). */
export type Referral = {
  id: string;
  partnerId: string;
  kind: "service" | "tutor-booking" | "tutor-request";
  userId: string | null;
  courseId: string | null;
  createdAt: string;
};

// ── Billing ──────────────────────────────────────────────────────────────────

export type PaymentSource = "stripe" | "test" | "gift";

export type Billing = {
  userId: string;
  stripeCustomerId: string | null;
  plus: {
    status: "none" | "active" | "past_due" | "canceled";
    interval: "month" | "year" | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    source: PaymentSource | null;
    stripeSubscriptionId: string | null;
  };
  /** Exam Sprint, bought once: unlocks every sprint, for every class and test, permanently (and calendar sync). */
  sprintPass: boolean;
  /** One free week of Exam Sprint per account. */
  sprintTrialEndsAt?: string | null;
  /** Legacy per-sprint credits from before the pass. */
  sprintCredits: number;
  purchases: { id: string; product: "plus-month" | "plus-year" | "sprint"; amount: number; at: string; source: PaymentSource; note?: string }[];
};

export type PlusAccess =
  | { kind: "anonymous" }
  | { kind: "trial"; daysLeft: number; endsAt: string }
  | { kind: "active"; renewsAt: string | null; cancelAtPeriodEnd: boolean; interval: "month" | "year" | null }
  | { kind: "expired" };

/** Bought by a parent (or anyone) for a student, claimed when that student signs in. */
export type Gift = {
  id: string;
  product: "plus-year" | "sprint";
  buyerName: string;
  buyerEmail: string;
  studentEmail: string;
  createdAt: string;
  source: PaymentSource;
  claimedBy: string | null;
  claimedAt: string | null;
};

// ── Exam Sprint ──────────────────────────────────────────────────────────────

export type Question = {
  id: string;
  topicId: string;
  stem: string;
  choices: string[];
  answer: number;
  /** Why each choice is right or wrong, same order as choices. */
  explanations: string[];
  difficulty: "easy" | "medium" | "hard";
};

export type SprintAnswer = { questionId: string; topicId: string; choice: number; correct: boolean; at: string; kind: "diagnostic" | "practice" | "checkpoint" };

export type FrqAttempt = { id: string; unitId: string; prompt: string; answer: string; feedback: string; score: number; outOf: number; at: string };

export type Sprint = {
  id: string;
  userId: string;
  courseId: string;
  /** "exam": the full AP/SAT exam. "test": a class test or quiz from the student's calendar. */
  kind?: "exam" | "test";
  /** For class tests: the event title, e.g. "Unit 3 Test". */
  title?: string;
  /** For class tests: the units it covers. Empty means the whole course. */
  unitIds?: string[];
  eventUid?: string;
  examDate: string; // YYYY-MM-DD
  minutesPerDay: number;
  createdAt: string;
  /** False until paid: the diagnostic and plan preview are free. */
  unlocked: boolean;
  confidence: Record<string, number>; // unitId -> 1..5
  answers: SprintAnswer[];
  /** Plan tasks checked off, by task id. */
  done: Record<string, string>;
  frq: FrqAttempt[];
};

// ── Educator content ─────────────────────────────────────────────────────────

export type Educator = {
  id: string; // same as the user id
  name: string;
  headline: string;
  bio: string;
  school: string;
  courseIds: string[];
  createdAt: string;
};

export type Contribution = {
  id: string;
  educatorId: string;
  /** video: a YouTube lesson a teacher recommends. guide: a written study guide. upload: a video hosted on Merit. */
  kind: "video" | "guide" | "upload";
  courseId: string;
  topicId: string;
  /** Uploaded videos wait as "pending" until an admin approves them. */
  status: "published" | "pending" | "removed";
  createdAt: string;
  /** For videos: why it's worth watching, what to look for, timestamps. */
  note: string;
  video?: Pick<YtVideo, "id" | "title" | "channelId" | "channelTitle" | "thumbnail" | "durationSec" | "views" | "publishedAt" | "isShort"> & { description: string };
  /** For study guides and uploads. */
  title?: string;
  body?: string;
  /** For videos uploaded to Merit. */
  media?: { videoUrl: string; posterUrl: string | null; durationSec: number; bytes: number; path: string };
  views?: number;
};

// ── Tutor bookings and commission ────────────────────────────────────────────

export type TutorMeta = {
  tutorId: string;
  /** When the tutor accepted the Merit Partner Terms (10% of sessions booked here). */
  agreedAt: string | null;
  commissionRate: number;
  vetted: boolean;
  stripeAccountId: string | null;
  payoutsEnabled: boolean;
  /** Weekly availability in the tutor's local time. */
  availability: { day: number; start: string; end: string }[];
  timezone: string;
};

export type Booking = {
  id: string;
  tutorId: string;
  tutorUserId: string;
  studentId: string | null;
  studentName: string;
  studentEmail: string;
  courseId: string | null;
  startsAt: string;
  minutes: number;
  hourlyRate: number;
  amount: number;
  fee: number;
  message: string;
  status: "requested" | "confirmed" | "declined" | "completed" | "canceled";
  /** "merit": the student paid through Merit (fee kept automatically). "direct": paid to the tutor, fee invoiced. */
  payment: "merit" | "direct";
  paid: boolean;
  feeSettled: boolean;
  source: PaymentSource | null;
  createdAt: string;
};

/** A student Merit referred to a tutor who might book off-platform. Fees apply for 12 months. */
export type Lead = {
  id: string;
  tutorId: string;
  tutorUserId: string;
  studentId: string | null;
  studentName: string;
  studentEmail: string;
  courseId: string | null;
  createdAt: string;
  /** open: contacted. reported: the student says they had a session. logged: the tutor logged it. dismissed: no session. */
  status: "open" | "reported" | "logged" | "dismissed";
  reportedAt: string | null;
};

export type ReportKind = "upload" | "tutor" | "educator" | "guide";
export type Report = {
  id: string;
  kind: ReportKind;
  targetId: string;
  /** Where the admin can see the reported thing. */
  href: string;
  title: string;
  reason: string;
  details: string;
  reporterId: string | null;
  reporterEmail: string | null;
  createdAt: string;
  status: "open" | "resolved" | "dismissed";
  resolvedAt?: string;
};
