import { notFound } from "next/navigation";

import { DiscoveryWorkspace } from "@/components/discovery/DiscoveryWorkspace";
import { requireUser } from "@/lib/auth/current-user";
import { calculateReadiness, createInitialDiscoveryContext } from "@/lib/discovery/engine";
import { listDiscoveryMessages } from "@/lib/discovery/operations";
import { ProductBlueprintSchema, type ProductBlueprint } from "@/lib/domain/blueprint/schemas";
import { DiscoveryContextSchema, DiscoveryTurnResponseSchema, ReadinessAssessmentSchema } from "@/lib/domain/discovery/schemas";
import { getProductTypeLabel } from "@/lib/domain/project/labels";
import { getProjectById } from "@/lib/projects/operations";

export default async function DiscoverPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const project = await getProjectById(id, user.id);
  if (!project) notFound();
  const now = new Date().toISOString();
  const context = project.discovery_context ? DiscoveryContextSchema.parse(project.discovery_context) : createInitialDiscoveryContext({ id: project.id, description: project.description, targetUsers: project.target_users, constraints: project.constraints, productTypeLabel: getProductTypeLabel(project.project_type, project.custom_project_type) }, now);
  const readiness = project.readiness_state ? ReadinessAssessmentSchema.parse(project.readiness_state) : calculateReadiness(context);
  const messages = await listDiscoveryMessages(project.id, user.id);
  const lastTurn = messages.toReversed().flatMap((message) => {
    const parsed = DiscoveryTurnResponseSchema.safeParse(message.structured_facts);
    return parsed.success ? [parsed.data] : [];
  })[0];
  const blueprint = project.plan ? ProductBlueprintSchema.safeParse(project.plan) : null;
  const downstreamItems = blueprint?.success ? buildDownstreamItems(blueprint.data) : {};

  return <DiscoveryWorkspace blueprintAvailable={project.plan_schema_version === "2.0" && Boolean(project.plan)} downstreamItems={downstreamItems} foundationApproved={Boolean(project.discovery_approved_at)} initialContext={context} initialEngineState={lastTurn?.engineState ?? "reliable"} initialMessages={messages.map((message) => {
    const turn = DiscoveryTurnResponseSchema.safeParse(message.structured_facts);
    return { id: message.id, role: message.role, content: turn.success ? turn.data.assistantMessage : message.content };
  })} initialReadiness={readiness} projectId={project.id} projectName={project.name} />;
}

function buildDownstreamItems(blueprint: ProductBlueprint): Record<string, string[]> {
  const items = [...blueprint.goals, ...blueprint.requirements, ...blueprint.architectureDecisions, ...blueprint.scope.inScope, ...blueprint.scope.outOfScope, ...blueprint.epics, ...blueprint.stories, ...blueprint.tasks, ...blueprint.sprintPlan, ...blueprint.risks];
  const downstream: Record<string, string[]> = {};

  for (const item of items) {
    for (const factId of item.lineage.factIds) {
      downstream[factId] = [...(downstream[factId] ?? []), `${item.id}: ${item.title}`];
    }
  }

  return downstream;
}
