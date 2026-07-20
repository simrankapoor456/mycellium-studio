export const BLUEPRINT_PROVIDER_TIMEOUT_MS = 15_000;

export class ProviderTimeoutError extends Error {
  readonly code = "PROVIDER_TIMEOUT";

  constructor() {
    super("The provider request exceeded its application timeout.");
    this.name = "ProviderTimeoutError";
  }
}

export async function withProviderTimeout<Value>(
  operation: (signal: AbortSignal) => Promise<Value>,
  timeoutMilliseconds = BLUEPRINT_PROVIDER_TIMEOUT_MS,
): Promise<Value> {
  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      const error = new ProviderTimeoutError();
      controller.abort(error);
      reject(error);
    }, timeoutMilliseconds);
  });

  try {
    return await Promise.race([operation(controller.signal), timeoutPromise]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export function isProviderTimeout(error: unknown): boolean {
  if (error instanceof ProviderTimeoutError) return true;
  if (typeof error !== "object" || error === null) return false;
  const name = "name" in error ? String(error.name) : "";
  const code = "code" in error ? String(error.code) : "";
  return name === "APIConnectionTimeoutError" || name === "AbortError" || code === "ETIMEDOUT" || code === "PROVIDER_TIMEOUT";
}
