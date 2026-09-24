import { signInWithProvider } from "@/app/actions/auth";
import { env, oauthProviders } from "@/lib/env";

let cached: { at: number; enabled: string[] } | null = null;

/** Providers actually switched on in Supabase Auth (so a button never leads to "provider is not enabled"). */
async function enabledProviders(): Promise<string[]> {
  if (!oauthProviders.length) return [];
  if (cached && Date.now() - cached.at < 5 * 60000) return cached.enabled;
  try {
    const res = await fetch(`${env.supabaseUrl}/auth/v1/settings`, { headers: { apikey: env.supabaseAnonKey }, signal: AbortSignal.timeout(4000) });
    const j = (await res.json()) as { external?: Record<string, boolean> };
    cached = { at: Date.now(), enabled: oauthProviders.filter((p) => j.external?.[p]) };
  } catch {
    cached = { at: Date.now(), enabled: [] };
  }
  return cached.enabled;
}

/** Google and Apple sign-in (shown when Supabase Auth has the providers switched on). */
export async function OAuthButtons({ next }: { next?: string }) {
  const providers = await enabledProviders();
  if (!providers.length) return null;
  return (
    <div className="space-y-2">
      {providers.map((p) => (
        <form key={p} action={signInWithProvider}>
          <input type="hidden" name="provider" value={p} />
          <input type="hidden" name="next" value={next ?? ""} />
          <button className="flex h-11 w-full items-center justify-center gap-2.5 rounded-full bg-bg text-[15px] font-medium text-ink ring-1 ring-line-strong hover:bg-bg-subtle">
            {p === "google" ? <GoogleMark /> : <AppleMark />} Continue with {p === "google" ? "Google" : "Apple"}
          </button>
        </form>
      ))}
      <div className="flex items-center gap-3 py-3 text-xs text-faint">
        <span className="h-px flex-1 bg-line" /> or use email <span className="h-px flex-1 bg-line" />
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.96 10.96 0 0 0 12 1 11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden>
      <path d="M16.37 12.53c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.18-1.73-1.35-.14-2.64.8-3.33.8-.69 0-1.74-.78-2.87-.76-1.47.02-2.83.86-3.59 2.18-1.54 2.66-.39 6.6 1.1 8.76.73 1.06 1.6 2.24 2.73 2.2 1.1-.04 1.51-.71 2.84-.71 1.32 0 1.7.71 2.86.69 1.18-.02 1.93-1.07 2.65-2.13.84-1.22 1.18-2.41 1.2-2.47-.03-.01-2.3-.88-2.32-3.52zM14.18 6.07c.6-.73 1.01-1.75.9-2.76-.87.04-1.92.58-2.54 1.3-.56.64-1.05 1.67-.92 2.66.97.08 1.96-.49 2.56-1.2z" />
    </svg>
  );
}
