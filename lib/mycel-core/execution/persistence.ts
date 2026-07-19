import "server-only";

import { getCurrentUser } from "@/lib/auth/current-user";
import { ProductBlueprintSchema } from "@/lib/domain/blueprint/schemas";
import { PressureTestSchema, type PressureTest } from "@/lib/domain/pressure-test/schemas";
import { getProjectById } from "@/lib/projects/operations";
import { createClient } from "@/lib/supabase/server";
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
  if (error) throw error;
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
  if (error) throw error;
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
