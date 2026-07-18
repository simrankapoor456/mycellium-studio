import { notFound, redirect } from "next/navigation";

import { ReviewWorkspace } from "@/components/discovery/ReviewWorkspace";
import { calculateReadiness } from "@/lib/discovery/engine";
import { DiscoveryContextSchema, ReadinessAssessmentSchema } from "@/lib/domain/discovery/schemas";
import { requireUser } from "@/lib/auth/current-user";
import { getProjectById } from "@/lib/projects/operations";

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const user = await requireUser(); const project = await getProjectById(id, user.id);
  if (!project) notFound();
  if (!project.discovery_context) redirect(`/projects/${project.id}/discover`);
  const context = DiscoveryContextSchema.parse(project.discovery_context);
  const readiness = project.readiness_state ? ReadinessAssessmentSchema.parse(project.readiness_state) : calculateReadiness(context);
  return <ReviewWorkspace initialContext={context} initialReadiness={readiness} initiallyApproved={Boolean(project.discovery_approved_at)} projectId={project.id} projectName={project.name} />;
}
