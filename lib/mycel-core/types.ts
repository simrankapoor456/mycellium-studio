import { z } from "zod";

export const DecisionStatusSchema = z.enum([
  "allowed",
  "denied",
  "requires_review",
  "requires_clarification",
  "fallback_required",
]);

export type DecisionStatus = z.infer<typeof DecisionStatusSchema>;

export type DecisionResult<Value = undefined, Details = undefined> =
  | Readonly<{ status: "allowed"; explanation: string; value: Value }>
  | Readonly<{
    status: "denied" | "requires_review" | "requires_clarification" | "fallback_required";
    explanation: string;
    details?: Details | undefined;
  }>;

export type CoreOutcome<Value, Details = undefined> =
  | Readonly<{ ok: true; status: 200; data: Value }>
  | Readonly<{
    ok: false;
    status: 400 | 401 | 404 | 409 | 429 | 500;
    error: string;
    decision: Exclude<DecisionStatus, "allowed">;
    details?: Details | undefined;
  }>;

export const EngineStateSchema = z.enum([
  "ai_enhanced",
  "reliable",
  "ai_unavailable_reliable",
]);

export const WorkflowOperationSchema = z.enum([
  "blueprint_generation",
  "pressure_test",
]);

export const WorkflowRequestInputSchema = z.object({
  requestId: z.string().uuid(),
});

export type EngineState = z.infer<typeof EngineStateSchema>;
export type WorkflowOperation = z.infer<typeof WorkflowOperationSchema>;
