import Link from "next/link";

import { ProjectCardActions } from "@/components/projects/ProjectCardActions";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { Project } from "@/lib/domain/project/schemas";

export function ProjectCard({ project }: { project: Project }) {
  const updatedAt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(project.updated_at));

  return (
    <Card className="project-card interactive-lift flex min-h-80 flex-col p-6 transition-transform duration-200">
      <div className="flex items-start justify-between gap-4">
        <Badge tone={project.status === "ready" ? "success" : "warning"}>{project.status}</Badge>
        <span className="text-xs font-semibold capitalize text-ink/70">{project.project_type?.replaceAll("-", " ") ?? "Type not set"}</span>
      </div>
      <h2 className="display-type mt-5 break-words text-2xl text-forest">
        <Link className="underline-offset-4 hover:underline" href={`/projects/${project.id}`}>{project.name}</Link>
      </h2>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink/65">{project.description || "Add a short product description to give this project more context."}</p>
      <p className="mt-auto pt-6 text-xs text-ink/70">Updated {updatedAt}</p>
      <ProjectCardActions projectId={project.id} projectName={project.name} />
    </Card>
  );
}
