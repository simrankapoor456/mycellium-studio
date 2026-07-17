type ErrorLike = {
  code?: unknown;
  message?: unknown;
};

function asErrorLike(error: unknown): ErrorLike {
  return typeof error === "object" && error !== null ? error : {};
}

export function toAuthErrorMessage(error: unknown): string {
  const candidate = asErrorLike(error);
  const code = typeof candidate.code === "string" ? candidate.code : "";

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
