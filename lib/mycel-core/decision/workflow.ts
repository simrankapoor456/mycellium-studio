const STALE_REQUEST_MILLISECONDS = 120_000;

export function shouldRestartWorkflowRequest(status: string, updatedAt: string, now = Date.now()): boolean {
  if (status === "failed") return true;
  if (status !== "pending") return false;
  const updated = new Date(updatedAt).valueOf();
  return Number.isFinite(updated) && now - updated > STALE_REQUEST_MILLISECONDS;
}
