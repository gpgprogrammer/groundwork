import { Search } from "lucide-react";

/** Search scoped to one course: topics, videos, Merit tutors' videos, guides, and tutors. */
export function CourseSearch({ courseId, courseTitle, defaultValue = "", className }: { courseId: string; courseTitle: string; defaultValue?: string; className?: string }) {
  return (
    <form action="/search" role="search" className={className}>
      <input type="hidden" name="course" value={courseId} />
      <label className="flex h-11 w-full max-w-xl items-center gap-2 rounded-full bg-bg px-4 ring-1 ring-line-strong focus-within:ring-2 focus-within:ring-accent">
        <Search className="size-4 shrink-0 text-muted" />
        <span className="sr-only">Search {courseTitle}</span>
        <input name="q" defaultValue={defaultValue} required placeholder={`Search ${courseTitle}: topics, videos, tutors…`} className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted" />
      </label>
    </form>
  );
}
