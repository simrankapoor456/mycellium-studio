import "server-only";

import { getCurrentUser } from "@/lib/auth/current-user";
import { ProductBlueprintSchema } from "@/lib/domain/blueprint/schemas";
import { PressureTestSchema, type PressureTest } from "@/lib/domain/pressure-test/schemas";
import { getProjectById } from "@/lib/projects/operations";
import { createClient } from "@/lib/supabase/server";
import { shouldRestartWorkflowRequest } from "@/lib/mycel-core/decision/workflow";
import { toJson } from "@/lib/discovery/persistence";
import type { WorkflowOperation } from "@/lib/mycel-core/types";

export async function loadAuthenticatedUser() {
  return getCurrentUser();
}

export async function loadOwnedProject(projectId: string, userId: string) {
  return getProjectById(projectId, userId);
}

export async function beginWorkflowRequest(
  projectId: string,
  userId: string,
  requestId: string,
  operation: WorkflowOperation,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workflow_requests")
    .insert({ request_id: requestId, operation, project_id: projectId, user_id: userId })
    .select("*")
    .single();

  if (!error) {
    return { kind: "started" as const, request: data };
  }

  if (isUnavailableBlueprintRequestLedger(error, operation)) {
    return { kind: "untracked" as const };
  }

  if (error.code !== "23505") {
    throw error;
  }

  const { data: existing, error: existingError } = await supabase
    .from("workflow_requests")
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .eq("operation", operation)
    .eq("request_id", requestId)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (!existing) {
    throw error;
  }

  if (existing.status === "completed" && existing.response_payload) {
    return { kind: "completed" as const, response: existing.response_payload };
  }

  if (shouldRestartWorkflowRequest(existing.status, existing.updated_at)) {
    const { data: restarted, error: restartError } = await supabase
      .from("workflow_requests")
      .update({ status: "pending", response_payload: null })
      .eq("id", existing.id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (restartError) {
      throw restartError;
    }

    return { kind: "started" as const, request: restarted };
  }

  return { kind: "pending" as const };
}

export async function completeWorkflowRequest(
  projectId: string,
  userId: string,
  requestId: string,
  operation: WorkflowOperation,
  response: unknown,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("workflow_requests")
    .update({ status: "completed", response_payload: toJson(response) })
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .eq("operation", operation)
    .eq("request_id", requestId);
  if (error && !isUnavailableBlueprintRequestLedger(error, operation)) throw error;
}

export async function failWorkflowRequest(
  projectId: string,
  userId: string,
  requestId: string,
  operation: WorkflowOperation,
): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("workflow_requests")
    .update({ status: "failed" })
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .eq("operation", operation)
    .eq("request_id", requestId);
}

export async function countRecentWorkflowRequests(
  projectId: string,
  userId: string,
  operation: WorkflowOperation,
  since: string,
): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("workflow_requests")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .eq("operation", operation)
    .gte("created_at", since);
  if (error && !isUnavailableBlueprintRequestLedger(error, operation)) throw error;
  return count ?? 0;
}

export async function persistPressureTest(
  projectId: string,
  userId: string,
  blueprintInput: unknown,
  pressureTestInput: PressureTest,
): Promise<void> {
  const blueprint = ProductBlueprintSchema.parse(blueprintInput);
  const pressureTest = PressureTestSchema.parse(pressureTestInput);
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({
      pressure_test: toJson(pressureTest),
      pressure_tested_at: new Date().toISOString(),
      pressure_test_blueprint_version: blueprint.version,
    })
    .eq("id", projectId)
    .eq("user_id", userId);
  if (error) throw error;
}

export function isUnavailableBlueprintRequestLedger(
  error: unknown,
  operation: WorkflowOperation,
): boolean {
  return operation === "blueprint_generation"
    && typeof error === "object"
    && error !== null
    && "code" in error
    && error.code === "PGRST205";
}
