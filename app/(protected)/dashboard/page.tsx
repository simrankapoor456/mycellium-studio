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
          <p className="mt-3 max-w-2xl leading-7 text-ink/65">Each project is a living product foundation: discover the idea, make the hard calls, then shape a blueprint you can use.</p>
        </div>
        <ButtonLink href="/projects/new">Create project</ButtonLink>
      </div>

      {projects.length === 0 ? (
        <div className="mt-10">
          <EmptyState actionHref="/projects/new" actionLabel="Plant the first idea" description="Start with the part you know. Mycellium will help uncover the user, the problem, and the plan from there." title="Every good product starts a little unfinished" />
        </div>
      ) : (
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
      )}
    </main>
  );
}
