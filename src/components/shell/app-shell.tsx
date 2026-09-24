import type { ReactNode } from "react";
import { getCatalog } from "@/lib/catalog";
import { getViewer } from "@/lib/viewer";
import { getStore } from "@/lib/data/store";
import { ViewerMarksProvider } from "../viewer-marks";
import { ShellFrame, type ShellData } from "./shell-frame";

/** YouTube-style chrome: top bar with search, collapsible sidebar, content area. */
export async function AppShell({ children }: { children: ReactNode }) {
  const [viewer, catalog] = await Promise.all([getViewer(), getCatalog()]);
  const topChannels = [...catalog.channels]
    .map((c) => ({ c, n: catalog.videosForChannel(c.id).filter((v) => !v.isShort).length }))
    .filter((x) => x.n >= 3)
    .sort((a, b) => b.n - a.n)
    .slice(0, 7)
    .map(({ c }) => ({ id: c.id, title: c.title, thumbnail: c.thumbnail }));

  const data: ShellData = {
    user: viewer ? { name: viewer.user.name, email: viewer.user.email } : null,
    isTutor: viewer?.state.profile.role === "tutor",
    isEducator: Boolean(viewer && (await (await getStore()).getDoc("educators", viewer.user.id))),
    isAdmin: viewer?.isAdmin ?? false,
    plus: viewer?.plus.kind ?? "anonymous",
    hasSchedule: Boolean(viewer?.state.schedule),
    courses: [...catalog.courses]
      .sort((a, b) => catalog.videosForCourse(b.id).length - catalog.videosForCourse(a.id).length)
      .map((c) => ({ slug: c.slug, title: c.title, hue: c.hue })),
    myCourses: viewer?.state.profile.courseIds ?? [],
    channels: topChannels,
  };

  return (
    <ViewerMarksProvider
      value={{ signedIn: Boolean(viewer), saved: Object.keys(viewer?.state.saves ?? {}), votes: viewer?.state.votes ?? {} }}
    >
      <ShellFrame data={data}>{children}</ShellFrame>
    </ViewerMarksProvider>
  );
}
