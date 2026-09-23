export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateDeploymentConfig } = await import("@/lib/deploy");
    validateDeploymentConfig();
  }
}
