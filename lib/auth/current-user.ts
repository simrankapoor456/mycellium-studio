import "server-only";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const AuthClaimsSchema = z.object({
  sub: z.string().uuid(),
  email: z.string().email().optional(),
});

export type AuthenticatedUser = {
  id: string;
  email: string | null;
};

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    return null;
  }

  const parsed = AuthClaimsSchema.safeParse(data.claims);
  if (!parsed.success) {
    return null;
  }

  return {
    id: parsed.data.sub,
    email: parsed.data.email ?? null,
  };
}

export async function requireUser(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
