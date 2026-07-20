import "server-only";

type GenerationLogValue = string | number | boolean | null;

export function logBlueprintGeneration(
  event: string,
  fields: Readonly<Record<string, GenerationLogValue>> = {},
  level: "info" | "warn" | "error" = "info",
): void {
  const entry = JSON.stringify({ scope: "blueprint_generation", event, ...fields });
  if (level === "error") console.error(entry);
  else if (level === "warn") console.warn(entry);
  else console.info(entry);
}

export function safeGenerationErrorCode(error: unknown): string {
  if (typeof error !== "object" || error === null) return "UNKNOWN";
  const value = "code" in error ? error.code : "name" in error ? error.name : "UNKNOWN";
  return String(value).replace(/[^A-Za-z0-9_-]/g, "").slice(0, 48) || "UNKNOWN";
}
