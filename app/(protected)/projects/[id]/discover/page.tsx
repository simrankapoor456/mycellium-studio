import { notFound } from "next/navigation";

import { DiscoveryWorkspace } from "@/components/discovery/DiscoveryWorkspace";
import { calculateReadiness, createInitialDiscoveryContext } from "@/lib/discovery/engine";
import { listDiscoveryMessages } from "@/lib/discovery/operations";
import { DiscoveryContextSchema, ReadinessAssessmentSchema } from "@/lib/domain/discovery/schemas";
import { requireUser } from "@/lib/auth/current-user";
import { getProjectById } from "@/lib/projects/operations";

export default async function DiscoverPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const project = await getProjectById(id, user.id);
  if (!project) notFound();
  const now = new Date().toISOString();
  const context = project.discovery_context ? DiscoveryContextSchema.parse(project.discovery_context) : createInitialDiscoveryContext({ id: project.id, description: project.description, targetUsers: project.target_users, constraints: project.constraints }, now);
  const readiness = project.readiness_state ? ReadinessAssessmentSchema.parse(project.readiness_state) : calculateReadiness(context);
  const messages = await listDiscoveryMessages(project.id, user.id);
  return <DiscoveryWorkspace initialContext={context} initialMessages={messages.map((message) => ({ id: message.id, role: message.role, content: message.content }))} initialReadiness={readiness} projectId={project.id} projectName={project.name} />;
}
