import type { Project } from "@/lib/domain/project/schemas";
import { assertProjectOwnership } from "@/lib/domain/project/ownership";
import type { Database } from "@/lib/supabase/database.types";

const MAX_PROJECT_NAME_LENGTH = 120;

export function duplicateProjectName(name: string): string {
  const suffix = " Copy";
  return `${name.slice(0, MAX_PROJECT_NAME_LENGTH - suffix.length)}${suffix}`;
}

export function createProjectDuplicate(
  source: Project,
  authenticatedUserId: string,
  createId: () => string = () => crypto.randomUUID(),
): Database["public"]["Tables"]["projects"]["Insert"] {
  assertProjectOwnership(source, authenticatedUserId);

  return {
    id: createId(),
    user_id: authenticatedUserId,
    name: duplicateProjectName(source.name),
    description: source.description,
    project_type: source.project_type,
    target_users: source.target_users,
    team_size: source.team_size,
    sprint_length: source.sprint_length,
    capacity: source.capacity,
    planning_depth: source.planning_depth,
    constraints: source.constraints,
    status: source.status,
    discovery_context: source.discovery_context,
    readiness_state: source.readiness_state,
    plan: source.plan,
    plan_schema_version: source.plan_schema_version,
    generation_source: source.generation_source,
    approved_discovery_context: source.approved_discovery_context,
    discovery_approved_at: source.discovery_approved_at,
    context_version: source.context_version,
    blueprint_version: source.blueprint_version,
  };
}
