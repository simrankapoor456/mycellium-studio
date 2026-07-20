import type { DecisionResult } from "@/lib/mycel-core/types";

type OwnedProject = Readonly<{ id: string; user_id: string }>;

export function authorizeOwnedProject<Value extends OwnedProject>(
  authenticatedUserId: string | null,
  project: Value | null,
): DecisionResult<Value> {
  if (!authenticatedUserId) {
    return { status: "denied", explanation: "Sign in to continue." };
  }

  if (!project || project.user_id !== authenticatedUserId) {
    return { status: "denied", explanation: "Project not found." };
  }

  return { status: "allowed", explanation: "Project access confirmed.", value: project };
}

export function authorizeEntityId(entityId: string, validIds: ReadonlySet<string>): DecisionResult<string> {
  if (!validIds.has(entityId)) {
    return { status: "denied", explanation: "That item is not part of this project." };
  }

  return { status: "allowed", explanation: "Project item confirmed.", value: entityId };
}
