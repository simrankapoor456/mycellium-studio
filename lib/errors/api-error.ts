export function safeApiError(error: unknown, fallback = "We could not complete that request. Please try again.") {
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
  if (code === "23505") return "That request has already been received.";
  return fallback;
}
