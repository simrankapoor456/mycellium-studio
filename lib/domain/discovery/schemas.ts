import { z } from "zod";

import type { Json } from "@/lib/supabase/database.types";

export const DiscoveryRoleSchema = z.enum(["user", "assistant", "system"]);
export const DiscoveryModeSchema = z.enum(["ai", "fallback"]);
export const FactCategorySchema = z.enum([
  "business_objective",
  "problem",
  "target_users",
  "use_cases",
  "success_metrics",
  "functional_requirements",
  "non_functional_requirements",
  "constraints",
  "assumptions",
  "risks",
  "architecture_decisions",
  "unknowns",
]);
export const FactStatusSchema = z.enum(["confirmed", "inferred", "unknown", "rejected"]);
export const ContradictionStatusSchema = z.enum(["open", "resolved"]);

export const DiscoveryFactSchema = z.object({
  id: z.string().min(1).max(96),
  category: FactCategorySchema,
  label: z.string().trim().min(1).max(120),
  value: z.string().trim().min(1).max(2_000),
  status: FactStatusSchema,
  confidence: z.number().min(0).max(1),
  sourceMessageIds: z.array(z.string().uuid()).max(20),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  manuallyEdited: z.boolean(),
});

export const DiscoveryContradictionSchema = z.object({
  id: z.string().min(1).max(96),
  factIds: z.array(z.string().min(1)).min(2).max(8),
  description: z.string().trim().min(1).max(1_000),
  status: ContradictionStatusSchema,
  resolution: z.string().trim().max(2_000).nullable(),
  sourceMessageIds: z.array(z.string().uuid()).max(20),
});

export const GraphNodeSchema = z.object({
  id: z.string().min(1),
  category: FactCategorySchema,
  label: z.string().min(1),
  value: z.string().min(1),
  state: z.enum(["confirmed", "inferred", "unknown", "contradicted", "resolved"]),
  sourceFactIds: z.array(z.string().min(1)).min(1),
});

export const GraphEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  kind: z.enum(["supports", "depends_on", "contradicts", "generated_from"]),
  state: z.enum(["active", "resolved"]),
});

export const ProductGraphSchema = z.object({
  nodes: z.array(GraphNodeSchema).max(120),
  edges: z.array(GraphEdgeSchema).max(240),
});

export const GraphChangesSchema = z.object({
  addedNodes: z.array(GraphNodeSchema).max(30),
  updatedNodes: z.array(GraphNodeSchema).max(30),
  addedEdges: z.array(GraphEdgeSchema).max(60),
  resolvedEdgeIds: z.array(z.string().min(1)).max(30),
});

export const ReadinessAssessmentSchema = z.object({
  score: z.number().int().min(0).max(100),
  status: z.enum(["discovering", "needs_review", "ready"]),
  confirmedFields: z.array(FactCategorySchema),
  explicitlyUnknownFields: z.array(FactCategorySchema),
  criticalGaps: z.array(FactCategorySchema),
  contradictions: z.array(z.string().min(1)),
  recommendedNextQuestion: z.string().trim().min(1).max(500),
  explanation: z.string().trim().min(1).max(1_000),
  rootedAreas: z.array(FactCategorySchema),
  areasNeedingClarification: z.array(FactCategorySchema),
});

export const DiscoveryContextSchema = z.object({
  schemaVersion: z.literal("1.0"),
  projectId: z.string().uuid(),
  version: z.number().int().nonnegative(),
  facts: z.array(DiscoveryFactSchema).max(120),
  contradictions: z.array(DiscoveryContradictionSchema).max(30),
  acceptedUnknownFactIds: z.array(z.string().min(1)).max(40),
  graph: ProductGraphSchema,
  updatedAt: z.string().datetime({ offset: true }),
});

export const DiscoveryTurnInputSchema = z.object({
  requestId: z.string().uuid(),
  message: z.string().trim().min(1, "Share a little more context.").max(4_000),
});

export const DiscoveryTurnResponseSchema = z.object({
  assistantMessage: z.string().trim().min(1).max(2_000),
  assistantQuestion: z.string().trim().min(1).max(500),
  extractedFacts: z.array(DiscoveryFactSchema).max(20),
  updatedFacts: z.array(DiscoveryFactSchema).max(20),
  unresolvedItems: z.array(z.string().trim().min(1).max(500)).max(20),
  contradictions: z.array(DiscoveryContradictionSchema).max(20),
  readinessAssessment: ReadinessAssessmentSchema,
  graphChanges: GraphChangesSchema,
  discoveryMode: DiscoveryModeSchema,
  context: DiscoveryContextSchema,
});

export const AiDiscoveryFactSchema = z.object({
  category: FactCategorySchema,
  label: z.string().trim().min(1).max(120),
  value: z.string().trim().min(1).max(2_000),
  status: FactStatusSchema,
  confidence: z.number().min(0).max(1),
});

export const AiDiscoveryResponseSchema = z.object({
  acknowledgement: z.string().trim().min(1).max(1_000),
  nextQuestion: z.string().trim().min(1).max(500),
  facts: z.array(AiDiscoveryFactSchema).max(12),
});

export const DiscoveryReviewInputSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("edit_fact"),
    factId: z.string().min(1),
    value: z.string().trim().min(1).max(2_000),
    status: FactStatusSchema,
  }),
  z.object({ action: z.literal("reject_assumption"), factId: z.string().min(1) }),
  z.object({ action: z.literal("accept_unknown"), factId: z.string().min(1) }),
  z.object({
    action: z.literal("resolve_contradiction"),
    contradictionId: z.string().min(1),
    resolution: z.string().trim().min(1).max(2_000),
    confirmedFactId: z.string().min(1),
  }),
  z.object({ action: z.literal("approve") }),
]);

export const DiscoveryMessageCreateSchema = z.object({
  projectId: z.string().uuid(),
  role: DiscoveryRoleSchema,
  content: z.string().trim().min(1).max(20_000),
  structuredFacts: z
    .custom<Json>((value) => typeof value === "object" && value !== null && !Array.isArray(value))
    .nullable()
    .default(null),
  sequenceNumber: z.number().int().positive(),
});

export type FactCategory = z.infer<typeof FactCategorySchema>;
export type DiscoveryFact = z.infer<typeof DiscoveryFactSchema>;
export type DiscoveryContradiction = z.infer<typeof DiscoveryContradictionSchema>;
export type ProductGraph = z.infer<typeof ProductGraphSchema>;
export type GraphChanges = z.infer<typeof GraphChangesSchema>;
export type ReadinessAssessment = z.infer<typeof ReadinessAssessmentSchema>;
export type DiscoveryContext = z.infer<typeof DiscoveryContextSchema>;
export type DiscoveryTurnInput = z.infer<typeof DiscoveryTurnInputSchema>;
export type DiscoveryTurnResponse = z.infer<typeof DiscoveryTurnResponseSchema>;
export type AiDiscoveryResponse = z.infer<typeof AiDiscoveryResponseSchema>;
export type DiscoveryReviewInput = z.infer<typeof DiscoveryReviewInputSchema>;
export type DiscoveryMessageCreateInput = z.infer<typeof DiscoveryMessageCreateSchema>;
