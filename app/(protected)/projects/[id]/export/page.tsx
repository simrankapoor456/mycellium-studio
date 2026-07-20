import Link from "next/link";
import { notFound } from "next/navigation";

import { BlueprintExportPanel } from "@/components/blueprint/BlueprintExportPanel";
import { ProjectWorkspaceNav } from "@/components/projects/ProjectWorkspaceNav";
import { ButtonLink } from "@/components/ui/Button";
import { requireUser } from "@/lib/auth/current-user";
import { calculateReadiness } from "@/lib/discovery/engine";
import { ProductBlueprintSchema } from "@/lib/domain/blueprint/schemas";
import { DiscoveryContextSchema, ReadinessAssessmentSchema, type FoundationApprovalDetails, type FoundationBlocker } from "@/lib/domain/discovery/schemas";
import { buildFoundationApprovalDetails } from "@/lib/mycel-core/decision/readiness";
import { getProjectById } from "@/lib/projects/operations";

export default async function ExportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const project = await getProjectById(id, user.id);
  if (!project) notFound();

  const blueprintResult = project.plan_schema_version === "2.0" ? ProductBlueprintSchema.safeParse(project.plan) : null;
  const blueprint = blueprintResult?.success ? blueprintResult.data : null;
  const contextResult = project.discovery_context ? DiscoveryContextSchema.safeParse(project.discovery_context) : null;
  const context = contextResult?.success ? contextResult.data : null;
  const persistedReadiness = project.readiness_state ? ReadinessAssessmentSchema.safeParse(project.readiness_state) : null;
  const readiness = context ? (persistedReadiness?.success ? persistedReadiness.data : calculateReadiness(context)) : null;
  const approvalDetails = context && readiness ? buildFoundationApprovalDetails(context, readiness) : null;

  return (
    <main className="project-export-page">
      <Link className="project-back-link" href={`/projects/${project.id}`}>← {project.name}</Link>
      <ProjectWorkspaceNav active="export" blueprintAvailable={Boolean(blueprint)} discoveryStarted={Boolean(context)} foundationApproved={Boolean(project.discovery_approved_at)} projectId={project.id} />
      <header><span className="eyebrow">Portable by design</span><h1>{blueprint ? "Your product, ready to move." : "Blueprint required before export."}</h1><p>{blueprint ? "Download a readable handoff, structured source data, or planning rows from the latest persisted version." : "Resolve the current progression state, create a persisted Product Blueprint, then export its real contents."}</p></header>
      {!blueprint ? <ExportReadiness approvalDetails={approvalDetails} foundationApproved={Boolean(project.discovery_approved_at)} projectId={project.id} readinessStatus={readiness?.status ?? "not_started"} /> : null}
      <BlueprintExportPanel available={Boolean(blueprint)} {...(blueprint ? { blueprintMeta: { version: blueprint.version, updatedAt: blueprint.updatedAt } } : {})} projectId={project.id} projectName={project.name} />
    </main>
  );
}

function ExportReadiness({ approvalDetails, foundationApproved, projectId, readinessStatus }: Readonly<{ approvalDetails: FoundationApprovalDetails | null; foundationApproved: boolean; projectId: string; readinessStatus: "discovering" | "needs_review" | "ready" | "not_started" }>) {
  const blockerGroups = groupBlockers(approvalDetails?.blockers ?? []);
  const primaryAction = foundationApproved
    ? { href: `/projects/${projectId}/review`, label: "Create Product Blueprint" }
    : readinessStatus === "not_started"
      ? { href: `/projects/${projectId}/discover`, label: "Begin discovery" }
      : { href: `/projects/${projectId}/review`, label: "Review foundation" };

  return (
    <section aria-labelledby="export-readiness-title" className="export-readiness">
      <div><span className="eyebrow">Current progression</span><h2 id="export-readiness-title">Foundation state: {readinessLabel(readinessStatus)}</h2><p>{foundationApproved ? "The approved foundation permits architecture now. A real persisted result is still required before download." : "Architecture is not yet permitted. Resolve or explicitly carry forward the items below, then approve the foundation."}</p></div>
      {blockerGroups.length > 0 ? <div className="export-readiness__groups">{blockerGroups.map((group) => <article key={group.kind}><h3>{blockerLabel(group.kind)}</h3><ul>{group.items.map((item) => <li key={item.id}><a href={`/projects/${projectId}/review#${item.targetId}`}><strong>{item.label}</strong><span>{item.detail}</span></a></li>)}</ul></article>)}</div> : <p className="export-readiness__clear">No blocking item is currently calculated. The foundation still needs explicit approval and a persisted blueprint.</p>}
      <div className="export-readiness__actions"><ButtonLink href={primaryAction.href}>{primaryAction.label}</ButtonLink><ButtonLink href={`/projects/${projectId}/discover`} variant="secondary">Open discovery</ButtonLink></div>
    </section>
  );
}

function groupBlockers(blockers: readonly FoundationBlocker[]) {
  const kinds: FoundationBlocker["kind"][] = ["missing_foundation", "unknown", "contradiction", "challenge"];
  return kinds.flatMap((kind) => {
    const items = blockers.filter((blocker) => blocker.kind === kind);
    return items.length > 0 ? [{ kind, items }] : [];
  });
}

function blockerLabel(kind: FoundationBlocker["kind"]): string {
  return { missing_foundation: "Essential decisions", unknown: "Open unknowns", contradiction: "Contradictions", challenge: "Challenges" }[kind];
}

function readinessLabel(status: "discovering" | "needs_review" | "ready" | "not_started"): string {
  return { discovering: "Building context", needs_review: "Ready for review", ready: "Ready for approval", not_started: "Not started" }[status];
}
