import { z } from "zod";

export const PressureTestModeSchema = z.enum(["ai", "fallback"]);

export const PressureTestSchema = z.object({
  overallAssessment: z.string().trim().min(1).max(4_000),
  criticalFindings: z.array(z.string().trim().min(1).max(1_000)).max(30),
  scopeCuts: z.array(z.string().trim().min(1).max(1_000)).max(30),
  risks: z.array(z.string().trim().min(1).max(1_000)).max(30),
  questions: z.array(z.string().trim().min(1).max(1_000)).max(30),
  recommendedNextActions: z.array(z.string().trim().min(1).max(1_000)).max(30),
  pressureTestMode: PressureTestModeSchema,
}).strict();

export const PressureTestRequestSchema = z.object({
  requestId: z.string().uuid(),
});

export type PressureTest = z.infer<typeof PressureTestSchema>;
export type PressureTestRequest = z.infer<typeof PressureTestRequestSchema>;
