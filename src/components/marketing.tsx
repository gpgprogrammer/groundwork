
export function Faq() {
  const faqs = [
    [
      "Where do the videos come from?",
      "Public YouTube lessons from educators and channels students already trust. We sort each one into the course, unit, and topic it teaches, and link straight to YouTube to watch.",
    ],
    [
      "How is this different from searching YouTube?",
      "YouTube ranks for watch time across everything. Groundwork only includes AP and SAT lessons, organizes them the way the exam is organized, and ranks them on how helpful they are for studying.",
    ],
    [
      "How does calendar sync work?",
      "Paste the private iCal link from Google Calendar, Canvas, Schoology, Apple Calendar, or Outlook, or upload an .ics file. We match quizzes, tests, and assignments to topics and put those videos at the top of your home page before they're due.",
    ],
    ["Is Groundwork free?", "Yes. Every course, video, calendar feature, and tutor listing is free for students."],
    [
      "How do I find a tutor?",
      "Open Tutors to see the best-rated tutors near you and online for every subject, plus the top free teachers on YouTube and trusted tutoring services. You can request a session right from Groundwork.",
    ],
    ["Which courses are covered?", "Every AP course offered to high school students, from Calculus and Biology to Art History and Japanese, plus SAT Math and SAT Reading and Writing."],
  ];
  return (
    <div className="divide-y divide-line">
      {faqs.map(([q, a]) => (
        <details key={q} className="group py-5 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-medium text-ink">
            {q}
            <span className="text-xl text-muted transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{a}</p>
        </details>
      ))}
    </div>
  );
}
