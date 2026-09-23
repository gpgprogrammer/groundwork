"use client";

import { createContext, useContext, type ReactNode } from "react";

/** Which videos the signed-in student has saved or voted on, for card menus. */
export type ViewerMarks = { signedIn: boolean; saved: string[]; votes: Record<string, 1 | -1> };

const Ctx = createContext<ViewerMarks>({ signedIn: false, saved: [], votes: {} });

export function ViewerMarksProvider({ value, children }: { value: ViewerMarks; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useViewerMarks = () => useContext(Ctx);
