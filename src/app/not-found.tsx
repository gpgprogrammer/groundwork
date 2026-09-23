import Link from "next/link";

export default function RootNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-32 text-center">
      <p className="font-serif text-6xl italic text-faint">404</p>
      <h1 className="headline mt-6 text-2xl text-ink">We couldn&apos;t find that page</h1>
      <Link href="/" className="mt-6 text-sm font-medium text-ink underline underline-offset-4">
        Go home
      </Link>
    </div>
  );
}
