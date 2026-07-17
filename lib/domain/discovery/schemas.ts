import { z } from "zod";

import type { Json } from "@/lib/supabase/database.types";

export const DiscoveryRoleSchema = z.enum(["user", "assistant", "system"]);

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

export type DiscoveryMessageCreateInput = z.infer<typeof DiscoveryMessageCreateSchema>;
