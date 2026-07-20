import Link from "next/link";
import { notFound } from "next/navigation";

import { BlueprintExportPanel } from "@/components/blueprint/BlueprintExportPanel";
import { ProjectWorkspaceNav } from "@/components/projects/ProjectWorkspaceNav";
import { requireUser } from "@/lib/auth/current-user";
import { ProductBlueprintSchema } from "@/lib/domain/blueprint/schemas";
import { getProjectById } from "@/lib/projects/operations";

export default async function ExportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const user = await requireUser(); const project = await getProjectById(id, user.id);
  if (!project) notFound();
  const blueprint = project.plan_schema_version === "2.0" ? ProductBlueprintSchema.safeParse(project.plan) : null;
  const available = Boolean(blueprint?.success);
  const next = project.discovery_approved_at ? { href: `/projects/${project.id}/review`, label: "Retry blueprint generation" } : project.discovery_context ? { href: `/projects/${project.id}/review`, label: "Review foundation and resolve blockers" } : { href: `/projects/${project.id}/discover`, label: "Continue discovery" };
  return <main className="project-export-page"><Link className="project-back-link" href={`/projects/${project.id}`}>← {project.name}</Link><ProjectWorkspaceNav active="export" blueprintAvailable={available} discoveryStarted={Boolean(project.discovery_context)} foundationApproved={Boolean(project.discovery_approved_at)} projectId={project.id} /><header><span className="eyebrow">Portable by design</span><h1>Your product, ready to move.</h1><p>Download a human-readable handoff, structured source data, or spreadsheet-ready planning rows.</p></header><BlueprintExportPanel available={available} projectId={project.id} projectName={project.name} />{!available ? <Link className="project-export-page__next" href={next.href}>{next.label} →</Link> : null}</main>;
}
