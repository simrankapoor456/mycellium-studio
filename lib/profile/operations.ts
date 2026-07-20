import "server-only";

import type { ProfileUpdateInput } from "@/lib/domain/profile/schemas";
import { createClient } from "@/lib/supabase/server";

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, input: ProfileUpdateInput) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").update({ display_name: input.displayName, avatar_url: input.avatarUrl, timezone: input.timezone, location: input.location }).eq("id", userId).select("*").maybeSingle();
  if (error) throw error;
  return data;
}
