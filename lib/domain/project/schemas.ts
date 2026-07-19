import { z } from "zod";

import { PlanningDepthSchema, ProjectTypeSchema } from "@/lib/domain/plan/schemas";
import type { Json } from "@/lib/supabase/database.types";

export const SprintLengthSchema = z.enum([
  "1-week",
  "2-weeks",
  "3-weeks",
  "4-weeks",
]);
export const ProjectStatusSchema = z.enum(["discovery", "ready", "planned", "archived"]);

const OptionalTextSchema = (maximum: number) =>
  z.string().trim().max(maximum).optional().transform((value) => value || null);

const ProjectInputFieldsSchema = z.object({
  name: z.string().trim().min(1, "Enter a project name.").max(120),
  description: OptionalTextSchema(20_000),
  projectType: ProjectTypeSchema,
  customProjectType: OptionalTextSchema(120),
  targetUsers: OptionalTextSchema(1_000),
  teamSize: z.coerce.number().int().min(1).max(50),
  sprintLength: SprintLengthSchema,
  capacity: z.coerce.number().int().min(1).max(200),
  planningDepth: PlanningDepthSchema,
  constraints: OptionalTextSchema(5_000),
});

function validateCustomProjectType(input: { projectType: z.infer<typeof ProjectTypeSchema>; customProjectType: string | null }, context: z.core.$RefinementCtx) {
  if (input.projectType === "custom" && !input.customProjectType) {
    context.addIssue({
      code: "custom",
      message: "Describe the custom product type.",
      path: ["customProjectType"],
    });
  }
}

export const ProjectCreateInputSchema = ProjectInputFieldsSchema.superRefine(validateCustomProjectType);

export const ProjectRenameInputSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().trim().min(1, "Enter a project name.").max(120),
});

export const ProjectIdInputSchema = z.object({
  projectId: z.string().uuid(),
});

export const ProjectMetadataUpdateInputSchema = ProjectInputFieldsSchema.omit({
  name: true,
}).extend({
  projectId: z.string().uuid(),
}).superRefine(validateCustomProjectType);

const JsonObjectSchema = z.custom<Json>((value) => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}, "Expected a JSON object.");

export const ProjectOutputSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1).max(120),
  description: z.string().nullable(),
  project_type: ProjectTypeSchema.nullable(),
  custom_project_type: z.string().nullable().default(null),
  target_users: z.string().nullable(),
  team_size: z.number().int().nullable(),
  sprint_length: SprintLengthSchema.nullable(),
  capacity: z.number().int().nullable(),
  planning_depth: PlanningDepthSchema.nullable(),
  constraints: z.string().nullable(),
  status: ProjectStatusSchema,
  discovery_context: JsonObjectSchema.nullable(),
  readiness_state: JsonObjectSchema.nullable(),
  plan: JsonObjectSchema.nullable(),
  plan_schema_version: z.string().nullable(),
  generation_source: z.string().nullable(),
  approved_discovery_context: JsonObjectSchema.nullable().default(null),
  discovery_approved_at: z.string().datetime({ offset: true }).nullable().default(null),
  context_version: z.number().int().nonnegative().default(0),
  blueprint_version: z.number().int().nonnegative().default(0),
  pressure_test: JsonObjectSchema.nullable().default(null),
  pressure_tested_at: z.string().datetime({ offset: true }).nullable().default(null),
  pressure_test_blueprint_version: z.number().int().positive().nullable().default(null),
  last_generation_request_id: z.string().uuid().nullable().default(null),
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }),
});

export type ProjectCreateInput = z.infer<typeof ProjectCreateInputSchema>;
export type Project = z.infer<typeof ProjectOutputSchema>;
