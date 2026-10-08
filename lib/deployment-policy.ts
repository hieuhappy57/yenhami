export function isPreviewDeployment(env: string | undefined): boolean {
  return env === "preview";
}
