import { z } from "zod";

export const PlanningDepthSchema = z.enum(["lean", "balanced", "detailed"]);
export const ProjectTypeSchema = z.enum([
  "web-app",
  "mobile-app",
  "desktop-app",
  "api",
  "developer-tool",
  "ai-agent",
  "browser-extension",
  "internal-tool",
  "marketplace",
  "game",
  "firmware",
  "hardware-connected",
  "custom",
  "ai-product",
  "data-pipeline",
  "other",
]);
export const PrioritySchema = z.enum(["low", "medium", "high"]);
export const ImpactSchema = z.enum(["low", "medium", "high"]);
export const OwnerTypeSchema = z.enum([
  "frontend",
  "backend",
  "fullstack",
  "qa",
  "devops",
  "data",
  "design",
  "product",
]);
export const EstimatePointsSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(5),
  z.literal(8),
]);

export const PlanningInputSchema = z.object({
  brief: z.string().trim().min(20).max(10_000),
  projectName: z.string().trim().min(1).max(120).optional(),
  projectType: ProjectTypeSchema.default("web-app"),
  teamSize: z.number().int().min(1).max(50).default(3),
  sprintDurationWeeks: z.number().int().min(1).max(4).default(2),
  sprintCapacityPoints: z.number().int().min(1).max(200).default(24),
  planningDepth: PlanningDepthSchema.default("balanced"),
});

export const TaskSchema = z.object({
  task_id: z.string().min(1),
  task_title: z.string().min(1),
  description: z.string().min(1),
  owner_type: OwnerTypeSchema,
  subtasks: z.array(z.string().min(1)),
  dependency_task_id: z.string().min(1).nullable(),
  needs_review: z.boolean(),
});

export const StorySchema = z.object({
  story_id: z.string().min(1),
  story_title: z.string().min(1),
  user_story: z.string().min(1),
  acceptance_criteria: z.array(z.string().min(1)).min(1),
  priority: PrioritySchema,
  estimate_points: EstimatePointsSchema,
  dependencies: z.array(z.string().min(1)),
  needs_review: z.boolean(),
  tasks: z.array(TaskSchema).min(1),
});

export const EpicSchema = z.object({
  epic_id: z.string().min(1),
  epic_name: z.string().min(1),
  description: z.string().min(1),
  priority: PrioritySchema,
  stories: z.array(StorySchema).min(1),
});

export const RiskSchema = z.object({
  risk: z.string().min(1),
  impact: ImpactSchema,
  mitigation: z.string().min(1),
});

export const SprintStorySchema = z.object({
  story_id: z.string().min(1),
  story_title: z.string().min(1),
  reason: z.string().min(1),
});

export const SprintSchema = z.object({
  sprint_id: z.string().min(1),
  sprint_name: z.string().min(1),
  goal: z.string().min(1),
  duration_weeks: z.number().int().min(1),
  capacity_points: z.number().int().min(1),
  allocated_points: z.number().int().min(0),
  stories: z.array(SprintStorySchema).min(1),
  risks: z.array(z.string().min(1)),
});

export const ReviewSchema = z.object({
  quality_score: z.number().int().min(0).max(100),
  duplicate_story_warnings: z.array(z.string().min(1)),
  missing_acceptance_criteria: z.array(z.string().min(1)),
  oversized_stories: z.array(z.string().min(1)),
  unsupported_assumptions: z.array(z.string().min(1)),
  clarifying_questions: z.array(z.string().min(1)),
});

export const PlanOutputSchema = z.object({
  schema_version: z.literal("1.0"),
  project_name: z.string().min(1),
  project_summary: z.string().min(1),
  project_type: ProjectTypeSchema,
  business_objective: z.string().min(1),
  target_users: z.array(z.string().min(1)).min(1),
  goals: z.array(z.string().min(1)).min(1),
  assumptions: z.array(z.string().min(1)),
  constraints: z.array(z.string().min(1)),
  missing_requirements: z.array(z.string().min(1)),
  risks: z.array(RiskSchema),
  epics: z.array(EpicSchema).min(1),
  sprints: z.array(SprintSchema).min(1),
  review: ReviewSchema,
});

export type PlannerInput = z.input<typeof PlanningInputSchema>;
export type NormalizedPlannerInput = z.output<typeof PlanningInputSchema>;
export type PlanningDepth = z.infer<typeof PlanningDepthSchema>;
export type Priority = z.infer<typeof PrioritySchema>;
export type OwnerType = z.infer<typeof OwnerTypeSchema>;
export type EstimatePoints = z.infer<typeof EstimatePointsSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type Story = z.infer<typeof StorySchema>;
export type Epic = z.infer<typeof EpicSchema>;
export type Sprint = z.infer<typeof SprintSchema>;
export type Risk = z.infer<typeof RiskSchema>;
export type Review = z.infer<typeof ReviewSchema>;
export type PlanOutput = z.infer<typeof PlanOutputSchema>;
