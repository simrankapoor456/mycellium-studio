import { z } from "zod";

export const PublicEnvironmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().trim().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .trim()
    .startsWith("sb_publishable_")
    .min(24),
  NEXT_PUBLIC_SITE_URL: z.string().trim().url(),
});

export const ServerEnvironmentSchema = PublicEnvironmentSchema.extend({
  OPENAI_API_KEY: z.string().trim().optional(),
  OPENAI_MODEL: z.string().trim().optional(),
});

export type PublicEnvironment = z.infer<typeof PublicEnvironmentSchema>;
export type ServerEnvironment = z.infer<typeof ServerEnvironmentSchema>;

export function parsePublicEnvironment(input: unknown): PublicEnvironment {
  return PublicEnvironmentSchema.parse(input);
}

export function parseServerEnvironment(input: unknown): ServerEnvironment {
  return ServerEnvironmentSchema.parse(input);
}
