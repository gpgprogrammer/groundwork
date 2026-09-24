import type { IndexedCatalog } from "@/lib/catalog";
import type { ScheduleEvent, UserState } from "@/lib/types";

const DAY = 86400000;

/** A clearly labeled example student, for showing signed-out visitors what Plus does. */
export function sampleState(catalog: IndexedCatalog, now = Date.now()): UserState {
  const bio = catalog.course("ap-biology");
  const calc = catalog.course("ap-calculus-bc");
  const courseIds = [bio, calc].filter(Boolean).map((c) => c!.id);
  const bioUnit = bio ? catalog.unitsForCourse(bio.id)[2] : undefined;
  const bioTopics = bioUnit ? catalog.topicsForUnit(bioUnit.id).filter((t) => catalog.videosForTopic(t.id).length).slice(0, 3) : [];
  const chain = calc ? catalog.topicIn(calc.id, "chain-rule") : undefined;
  const at = (days: number, hour: number) => {
    const d = new Date(new Date(now + days * DAY).toDateString());
    d.setHours(hour);
    return d.toISOString();
  };
  const events: ScheduleEvent[] = [
    ...(chain ? [{ uid: "s1", title: "Calc BC quiz: Chain Rule", start: at(1, 10), end: null, allDay: false, kind: "test" as const, courseId: calc!.id, topicIds: [chain.id] }] : []),
    ...(bioUnit
      ? [{ uid: "s2", title: `AP Bio Unit ${bioUnit.order} test`, start: at(3, 9), end: null, allDay: false, kind: "test" as const, courseId: bio!.id, topicIds: bioTopics.map((t) => t.id) }]
      : []),
  ];
  return {
    profile: {
      id: "sample",
      email: "",
      name: "Sample student",
      role: "student",
      onboarded: true,
      courseIds,
      examDate: null,
      goal: null,
      focusTopicIds: [],
      location: null,
      createdAt: new Date(now).toISOString(),
    },
    history: {},
    saves: {},
    votes: {},
    mastered: {},
    schedule: { sources: [{ id: "sample", kind: "ics-url", url: null, label: "Sample calendar", syncedAt: new Date(now).toISOString(), count: events.length }], events, hidden: [], syncedAt: new Date(now).toISOString() },
  };
}
