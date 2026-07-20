import type { ActionErrorKind, ActionState } from "@/lib/actions/action-state";

type ErrorLike = {
  code?: unknown;
  message?: unknown;
  status?: unknown;
};

function asErrorLike(error: unknown): ErrorLike {
  return typeof error === "object" && error !== null ? error : {};
}

export function classifySafeError(error: unknown): Exclude<ActionErrorKind, "validation"> {
  const candidate = asErrorLike(error);
  const code = typeof candidate.code === "string" ? candidate.code.toLowerCase() : "";
  const message = typeof candidate.message === "string" ? candidate.message.toLowerCase() : "";
  const status = typeof candidate.status === "number" ? candidate.status : null;

  if (
    status === 401
    || code.includes("jwt")
    || code.includes("session")
    || code === "refresh_token_not_found"
  ) {
    return "authentication";
  }

  if (status === 403 || code === "42501" || code.includes("permission")) {
    return "permission";
  }

  if (
    error instanceof TypeError
    || status === 0
    || code.includes("fetch")
    || message.includes("failed to fetch")
    || message.includes("network")
  ) {
    return "network";
  }

  if ((status !== null && status >= 500) || /^\d{5}$/.test(code) || code.startsWith("pgrst")) {
    return "database";
  }

  return "unknown";
}

export function toActionFailure(
  error: unknown,
  messages: Readonly<Partial<Record<Exclude<ActionErrorKind, "validation">, string>>>,
): ActionState {
  const errorKind = classifySafeError(error);
  const fallbackMessages: Record<Exclude<ActionErrorKind, "validation">, string> = {
    network: "Could not reach the server. Check your connection and retry.",
    authentication: "Your session expired. Sign in again, then retry.",
    database: "The change could not be saved. Retry in a moment.",
    permission: "You do not have permission to make this change.",
    unknown: "The change could not be completed. Retry.",
  };

  return {
    status: "error",
    message: messages[errorKind] ?? fallbackMessages[errorKind],
    errorKind,
    retryable: errorKind !== "permission",
  };
}

export function toAuthErrorMessage(error: unknown): string {
  const candidate = asErrorLike(error);
  const code = typeof candidate.code === "string" ? candidate.code : "";
  const status = typeof candidate.status === "number" ? candidate.status : 0;

  if (code === "email_address_invalid" || code === "validation_failed") {
    return "Enter a valid email address.";
  }

  if (code === "invalid_credentials") {
    return "Email or password is incorrect.";
  }

  if (code === "email_not_confirmed") {
    return "Confirm your email before signing in.";
  }

  if (code === "user_already_exists" || code === "email_exists") {
    return "An account with this email already exists.";
  }

  if (code === "over_email_send_rate_limit" || code === "over_request_rate_limit") {
    return "Too many attempts. Wait a moment and try again.";
  }

  if (code === "weak_password") {
    return "Choose a stronger password and try again.";
  }

  if (code === "signup_disabled") {
    return "New account creation is currently unavailable.";
  }

  if (code === "provider_disabled") {
    return "Email sign-in is currently unavailable.";
  }

  if (status === 429) {
    return "Too many attempts. Wait a moment and try again.";
  }

  return "We could not complete that request. Please try again.";
}

export function toProjectErrorMessage(error: unknown): string {
  const candidate = asErrorLike(error);
  const code = typeof candidate.code === "string" ? candidate.code : "";

  if (code === "23505") {
    return "That project conflicts with an existing record.";
  }

  return "The project could not be saved. Please try again.";
}

export function toSafeErrorMessage(_error: unknown, fallback: string): string {
  return fallback;
}
