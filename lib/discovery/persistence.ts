import "server-only";

import { DiscoveryContextSchema, DiscoveryTurnResponseSchema, ReadinessAssessmentSchema, type DiscoveryContext, type DiscoveryTurnResponse, type ReadinessAssessment } from "@/lib/domain/discovery/schemas";
import type { Json } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

export async function beginDiscoveryRequest(projectId: string, userId: string, requestId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("discovery_requests").insert({ request_id: requestId, project_id: projectId, user_id: userId }).select("*").single();
  if (!error) return { kind: "started" as const, request: data };
  if (error.code !== "23505") throw error;
  const { data: existing, error: existingError } = await supabase.from("discovery_requests").select("*").eq("project_id", projectId).eq("request_id", requestId).eq("user_id", userId).maybeSingle();
  if (existingError) throw existingError;
  if (!existing) throw error;
  if (existing.status === "completed" && existing.response_payload) return { kind: "completed" as const, response: DiscoveryTurnResponseSchema.parse(existing.response_payload) };
  return { kind: "pending" as const };
}

export async function completeDiscoveryRequest(projectId: string, userId: string, requestId: string, response: DiscoveryTurnResponse) {
  const supabase = await createClient();
  const { error } = await supabase.from("discovery_requests").update({ status: "completed", response_payload: toJson(DiscoveryTurnResponseSchema.parse(response)) }).eq("project_id", projectId).eq("request_id", requestId).eq("user_id", userId);
  if (error) throw error;
}

export async function failDiscoveryRequest(projectId: string, userId: string, requestId: string) {
  const supabase = await createClient();
  await supabase.from("discovery_requests").update({ status: "failed" }).eq("project_id", projectId).eq("request_id", requestId).eq("user_id", userId);
}

export async function persistDiscoveryState(projectId: string, userId: string, contextInput: DiscoveryContext, readinessInput: ReadinessAssessment) {
  const context = DiscoveryContextSchema.parse(contextInput);
  const readiness = ReadinessAssessmentSchema.parse(readinessInput);
  const supabase = await createClient();
  const { error } = await supabase.from("projects").update({ discovery_context: toJson(context), readiness_state: toJson(readiness), context_version: context.version, status: readiness.status === "ready" ? "ready" : "discovery", approved_discovery_context: null, discovery_approved_at: null }).eq("id", projectId).eq("user_id", userId);
  if (error) throw error;
}

export async function approveDiscoveryState(projectId: string, userId: string, contextInput: DiscoveryContext) {
  const context = DiscoveryContextSchema.parse(contextInput);
  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").update({ discovery_context: toJson(context), approved_discovery_context: toJson(context), discovery_approved_at: new Date().toISOString(), context_version: context.version, status: "ready" }).eq("id", projectId).eq("user_id", userId).select("*").maybeSingle();
  if (error) throw error;
  return data;
}

export function toJson(value: unknown): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}
