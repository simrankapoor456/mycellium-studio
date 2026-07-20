const STOP_WORDS = new Set([
  "build",
  "create",
  "from",
  "have",
  "idea",
  "into",
  "project",
  "rough",
  "should",
  "simple",
  "that",
  "this",
  "user",
  "users",
  "want",
  "where",
  "with",
]);

export function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !STOP_WORDS.has(word))
    .slice(0, 8);
}

export function inferProjectName(brief: string): string {
  const words = extractKeywords(brief);

  if (words.length === 0) {
    return "Untitled Project";
  }

  return words.slice(0, 2).map(toTitleCase).join(" ");
}

export function summarizeBrief(brief: string, projectName: string): string {
  const cleanedBrief = brief.replace(/\s+/g, " ").trim();
  const excerpt = cleanedBrief.length > 220 ? `${cleanedBrief.slice(0, 220).trim()}…` : cleanedBrief;

  return `${projectName} is shaped as a focused plan with clear scope, review points, and portable delivery. Source brief: ${excerpt}`;
}

export function inferTargetUsers(brief: string): string[] {
  const normalizedBrief = brief.toLowerCase();

  if (normalizedBrief.includes("student")) {
    return ["students", "project collaborators"];
  }

  if (normalizedBrief.includes("founder")) {
    return ["founders", "small product teams"];
  }

  if (normalizedBrief.includes("team")) {
    return ["small product teams", "project leads"];
  }

  return ["project planners", "solo builders", "small teams"];
}

function toTitleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}
