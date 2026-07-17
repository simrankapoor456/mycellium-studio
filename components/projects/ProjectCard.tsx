import Link from "next/link";

import { ProjectCardActions } from "@/components/projects/ProjectCardActions";
import type { Project } from "@/lib/domain/project/schemas";

export function ProjectCard({ project }: { project: Project }) {
  const updatedAt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
    new Date(project.updated_at),
  );

  return (
    <article className="rounded-[1.75rem] border border-line bg-paper/85 p-6 shadow-sm shadow-forest/5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-clay">{project.status}</p>
          <h2 className="mt-2 font-serif text-2xl text-forest">
            <Link className="hover:text-ocean" href={`/projects/${project.id}`}>
              {project.name}
            </Link>
          </h2>
        </div>
        <span className="rounded-full bg-sage/30 px-3 py-1 text-xs font-bold text-forest">
          {project.project_type?.replaceAll("-", " ") ?? "Unspecified"}
        </span>
      </div>
      <p className="mt-4 line-clamp-3 min-h-12 text-sm leading-6 text-forest/70">
        {project.description || "No description yet."}
      </p>
      <p className="mt-4 text-xs text-forest/50">Updated {updatedAt}</p>
      <ProjectCardActions projectId={project.id} projectName={project.name} />
    </article>
  );
}
