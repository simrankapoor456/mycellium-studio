import { PlanOutputSchema, type PlanOutput } from "@/lib/domain/plan/schemas";

export function planToJson(plan: PlanOutput): string {
  return JSON.stringify(PlanOutputSchema.parse(plan), null, 2);
}
