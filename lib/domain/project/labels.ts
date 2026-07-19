import type { z } from "zod";

import type { ProjectTypeSchema } from "@/lib/domain/plan/schemas";

type ProjectType = z.infer<typeof ProjectTypeSchema>;

export const PRODUCT_TYPE_OPTIONS = [
  { value: "web-app", label: "Web application" },
  { value: "mobile-app", label: "Mobile application" },
  { value: "desktop-app", label: "Desktop application" },
  { value: "api", label: "API" },
  { value: "developer-tool", label: "Developer tool" },
  { value: "ai-agent", label: "AI agent" },
  { value: "browser-extension", label: "Browser extension" },
  { value: "internal-tool", label: "Internal tool" },
  { value: "marketplace", label: "Marketplace" },
  { value: "game", label: "Game" },
  { value: "firmware", label: "Firmware" },
  { value: "hardware-connected", label: "Hardware-connected product" },
  { value: "custom", label: "Custom product type" },
] as const satisfies readonly Readonly<{ value: ProjectType; label: string }>[];

const PRODUCT_TYPE_LABELS: Record<ProjectType, string> = {
  "web-app": "Web application",
  "mobile-app": "Mobile application",
  "desktop-app": "Desktop application",
  api: "API",
  "developer-tool": "Developer tool",
  "ai-agent": "AI agent",
  "browser-extension": "Browser extension",
  "internal-tool": "Internal tool",
  marketplace: "Marketplace",
  game: "Game",
  firmware: "Firmware",
  "hardware-connected": "Hardware-connected product",
  custom: "Custom product type",
  "ai-product": "AI product",
  "data-pipeline": "Data pipeline",
  other: "Other product type",
};

export function getProductTypeLabel(
  projectType: ProjectType | null,
  customProductType: string | null,
): string {
  if (projectType === "custom" && customProductType) {
    return customProductType;
  }

  return projectType ? PRODUCT_TYPE_LABELS[projectType] : "Product type not set";
}
