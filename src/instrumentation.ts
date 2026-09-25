import type { Instrumentation } from "next";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateDeploymentConfig } = await import("@/lib/deploy");
    validateDeploymentConfig();
  }
}

/** Every server error is saved so admins can see it (Admin → Site errors). */
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { logError } = await import("@/lib/error-log");
  const e = err instanceof Error ? err : new Error(String(err));
  await logError({
    source: "server",
    message: e.message,
    digest: typeof err === "object" && err && "digest" in err ? String((err as { digest: unknown }).digest) : undefined,
    path: request.path,
    route: context.routePath,
    kind: context.routeType,
    stack: e.stack,
  });
};
