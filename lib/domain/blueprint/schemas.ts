import { z } from "zod";

import { FactCategorySchema } from "@/lib/domain/discovery/schemas";
import { ImpactSchema, OwnerTypeSchema, PrioritySchema, ProjectTypeSchema } from "@/lib/domain/plan/schemas";

export const GenerationSourceSchema = z.enum(["ai", "fallback"]);
export const BlueprintStatusSchema = z.enum(["draft", "needs_review", "approved", "in_progress", "done"]);

export const LineageSchema = z.object({
  sourceMessageIds: z.array(z.string().uuid()).max(40),
  factIds: z.array(z.string().min(1)).max(40),
  requirementIds: z.array(z.string().min(1)).max(40),
  generatedFromIds: z.array(z.string().min(1)).max(40),
  source: z.enum(["ai", "fallback", "manual"]),
});

const EntityBaseSchema = z.object({
  id: z.string().min(1).max(96),
  title: z.string().trim().min(1).max(240),
  description: z.string().trim().min(1).max(4_000),
  status: BlueprintStatusSchema,
  priority: PrioritySchema,
  owner: z.string().trim().max(120).nullable(),
  estimate: z.number().int().min(0).max(100).nullable(),
  manuallyEdited: z.boolean(),
  lineage: LineageSchema,
});

export const GoalSchema = EntityBaseSchema;
export const RequirementSchema = EntityBaseSchema.extend({
  category: z.enum(["functional", "non_functional"]),
  acceptanceCriteria: z.array(z.string().trim().min(1).max(1_000)).min(1).max(20),
});
export const ArchitectureDecisionSchema = EntityBaseSchema.extend({
  rationale: z.string().trim().min(1).max(2_000),
  relatedRequirementIds: z.array(z.string().min(1)).min(1).max(30),
});
export const ScopeItemSchema = EntityBaseSchema.extend({
  boundary: z.enum(["in", "out"]),
});
export const EpicBlueprintSchema = EntityBaseSchema.extend({
  requirementIds: z.array(z.string().min(1)).min(1).max(30),
});
export const StoryBlueprintSchema = EntityBaseSchema.extend({
  epicId: z.string().min(1),
  userStory: z.string().trim().min(1).max(2_000),
  acceptanceCriteria: z.array(z.string().trim().min(1).max(1_000)).min(1).max(20),
});
export const TaskBlueprintSchema = EntityBaseSchema.extend({
  storyId: z.string().min(1),
  ownerType: OwnerTypeSchema,
  dependencyTaskIds: z.array(z.string().min(1)).max(20),
  sprintId: z.string().min(1).nullable(),
});
export const SprintBlueprintSchema = EntityBaseSchema.extend({
  goal: z.string().trim().min(1).max(1_000),
  capacity: z.number().int().min(1).max(200),
  taskIds: z.array(z.string().min(1)).max(100),
});
export const BlueprintRiskSchema = EntityBaseSchema.extend({
  impact: ImpactSchema,
  mitigation: z.string().trim().min(1).max(2_000),
});

export const ProductBlueprintSchema = z.object({
  schemaVersion: z.literal("2.0"),
  projectId: z.string().uuid(),
  projectName: z.string().trim().min(1).max(120),
  projectType: ProjectTypeSchema,
  summary: z.string().trim().min(1).max(4_000),
  generationSource: GenerationSourceSchema,
  version: z.number().int().positive(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  overview: z.object({
    businessObjective: z.string().trim().min(1).max(2_000),
    targetUsers: z.array(z.string().trim().min(1).max(500)).min(1).max(20),
    successMetrics: z.array(z.string().trim().min(1).max(500)).max(20),
  }),
  understanding: z.object({
    factIds: z.array(z.string().min(1)).max(120),
    unresolvedItems: z.array(z.string().trim().min(1).max(500)).max(40),
    acceptedUnknownFactIds: z.array(z.string().min(1)).max(40),
  }),
  goals: z.array(GoalSchema).min(1).max(20),
  requirements: z.array(RequirementSchema).min(1).max(60),
  architectureDecisions: z.array(ArchitectureDecisionSchema).min(1).max(40),
  scope: z.object({
    inScope: z.array(ScopeItemSchema).min(1).max(40),
    outOfScope: z.array(ScopeItemSchema).max(40),
  }),
  epics: z.array(EpicBlueprintSchema).min(1).max(30),
  stories: z.array(StoryBlueprintSchema).min(1).max(120),
  tasks: z.array(TaskBlueprintSchema).min(1).max(400),
  sprintPlan: z.array(SprintBlueprintSchema).min(1).max(30),
  risks: z.array(BlueprintRiskSchema).max(40),
  review: z.object({
    qualityScore: z.number().int().min(0).max(100),
    warnings: z.array(z.string().trim().min(1).max(1_000)).max(40),
    unresolvedFactCategories: z.array(FactCategorySchema),
  }),
});

export const BlueprintEditInputSchema = z.object({
  entityType: z.enum(["goal", "requirement", "architecture", "scope", "epic", "story", "task", "sprint", "risk"]),
  entityId: z.string().min(1),
  changes: z.object({
    title: z.string().trim().min(1).max(240).optional(),
    description: z.string().trim().min(1).max(4_000).optional(),
    status: BlueprintStatusSchema.optional(),
    priority: PrioritySchema.optional(),
    owner: z.string().trim().max(120).nullable().optional(),
    estimate: z.number().int().min(0).max(100).nullable().optional(),
    acceptanceCriteria: z.array(z.string().trim().min(1).max(1_000)).min(1).max(20).optional(),
    sprintId: z.string().min(1).nullable().optional(),
  }).refine((changes) => Object.keys(changes).length > 0, "Provide at least one change."),
});

export type Lineage = z.infer<typeof LineageSchema>;
export type ProductBlueprint = z.infer<typeof ProductBlueprintSchema>;
export type BlueprintEditInput = z.infer<typeof BlueprintEditInputSchema>;
export type BlueprintEntityType = BlueprintEditInput["entityType"];
