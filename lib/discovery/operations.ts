import "server-only";

import type { DiscoveryMessageCreateInput } from "@/lib/domain/discovery/schemas";
import { createClient } from "@/lib/supabase/server";

export async function listDiscoveryMessages(projectId: string, userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("discovery_messages")
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .order("sequence_number", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

export async function createDiscoveryMessage(
  input: DiscoveryMessageCreateInput,
  userId: string,
  messageId?: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("discovery_messages")
    .insert({
      ...(messageId ? { id: messageId } : {}),
      project_id: input.projectId,
      user_id: userId,
      role: input.role,
      content: input.content,
      structured_facts: input.structuredFacts,
      sequence_number: input.sequenceNumber,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}
