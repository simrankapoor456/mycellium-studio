const DEFAULT_AUTH_RETURN_PATH = "/dashboard";

const allowedExactPaths = new Set([
  "/dashboard",
  "/projects/new",
  "/settings/profile",
]);

const allowedProjectPath = /^\/projects\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(?:\/(?:discover|review|edit|export))?$/i;

export function getSafeReturnPath(
  value: FormDataEntryValue | string | null | undefined,
  fallback = DEFAULT_AUTH_RETURN_PATH,
): string {
  if (typeof value !== "string") return fallback;

  const candidate = value.trim();

  if (
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\") ||
    candidate.includes(":") ||
    candidate.includes("\0")
  ) {
    return fallback;
  }

  const [pathname] = candidate.split(/[?#]/, 1);

  if (!pathname || (!allowedExactPaths.has(pathname) && !allowedProjectPath.test(pathname))) {
    return fallback;
  }

  return candidate;
}

export function getAuthHref(route: "/login" | "/signup", returnPath: string): string {
  const safeReturnPath = getSafeReturnPath(returnPath);
  return `${route}?next=${encodeURIComponent(safeReturnPath)}`;
}
