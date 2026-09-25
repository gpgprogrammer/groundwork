import { Tracker } from "@/components/tracker";

/** The public landing page: no app chrome, just the first impression. */
export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Tracker uid={null} />
    </>
  );
}
