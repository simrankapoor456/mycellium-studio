import type { Metadata } from "next";

import { ProjectCard } from "@/components/projects/ProjectCard";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { requireUser } from "@/lib/auth/current-user";
import { listProjects } from "@/lib/projects/operations";

export const metadata: Metadata = {
  title: "Projects",
  description: "Manage private Mycellium Studio product projects.",
};

export default async function DashboardPage() {
  const user = await requireUser();
  const projects = await listProjects(user.id);

  return (
    <main>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="display-type text-4xl text-forest sm:text-5xl">Projects</h1>
          <p className="mt-3 max-w-2xl leading-7 text-ink/65">Build durable product context now, then continue into guided discovery in Phase 3B.</p>
        </div>
        <ButtonLink href="/projects/new">Create project</ButtonLink>
      </div>

      {projects.length === 0 ? (
        <div className="mt-10">
          <EmptyState actionHref="/projects/new" actionLabel="Create your first project" description="Capture the product idea, users, team shape, capacity, and constraints in one private foundation." title="Start with the product context" />
        </div>
      ) : (
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
      )}
    </main>
  );
}
