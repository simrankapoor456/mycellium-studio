import Link from "next/link";

import { ProjectCardActions } from "@/components/projects/ProjectCardActions";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ReadinessAssessmentSchema } from "@/lib/domain/discovery/schemas";
import type { Project } from "@/lib/domain/project/schemas";

export function ProjectCard({ project }: { project: Project }) {
  const updatedAt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(project.updated_at));
  const readiness = ReadinessAssessmentSchema.safeParse(project.readiness_state);
  const unresolved = readiness.success
    ? readiness.data.criticalGaps.length + readiness.data.contradictions.length + readiness.data.openChallenges.length
    : null;
  const stage = project.blueprint_version > 0
    ? "Product Blueprint"
    : project.discovery_approved_at
      ? "Architecture"
      : project.discovery_context
        ? "Discovery"
        : "Starting point";
  const foundation = project.discovery_approved_at
    ? "Approved"
    : readiness.success
      ? readiness.data.status === "ready" ? "Ready for review" : "Taking root"
      : "Not assessed";
  const growthStage = project.blueprint_version > 0 ? 3 : project.discovery_approved_at ? 2 : project.discovery_context ? 1 : 0;

  return (
    <Card className="project-card interactive-lift">
      <div className="project-card__topline">
        <Badge tone={project.status === "ready" ? "success" : "warning"}>{project.status}</Badge>
        <span>{project.project_type?.replaceAll("-", " ") ?? "Type not set"}</span>
      </div>
      <h2>
        <Link className="underline-offset-4 hover:underline" href={`/projects/${project.id}`}>{project.name}</Link>
      </h2>
      <p className="project-card__description">{project.description || "Add a short product description to give this project more context."}</p>
      <ol aria-label={`Product growth: ${stage}`} className="project-card__growth">
        {["Context", "Discovery", "Foundation", "Blueprint"].map((label, index) => <li data-active={index <= growthStage} data-current={index === growthStage} key={label}><span aria-hidden="true" />{label}</li>)}
      </ol>
      <dl className="project-card__state">
        <div><dt>Journey</dt><dd>{stage}</dd></div>
        <div><dt>Foundation</dt><dd>{foundation}</dd></div>
        <div><dt>Open decisions</dt><dd>{unresolved === null ? "Not assessed" : unresolved}</dd></div>
        <div><dt>Blueprint</dt><dd>{project.blueprint_version > 0 ? `Version ${project.blueprint_version}` : "Not formed"}</dd></div>
      </dl>
      <p className="project-card__updated">Updated {updatedAt}</p>
      <ProjectCardActions projectId={project.id} projectName={project.name} />
    </Card>
  );
}
