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
    <main className="dashboard">
      <div className="dashboard__heading">
        <div>
          <span>Your living systems</span>
          <h1>Projects</h1>
          <p>Open the product where it is now. Its context, decisions, and latest blueprint remain connected.</p>
        </div>
        <ButtonLink href="/projects/new">Create project</ButtonLink>
      </div>

      {projects.length === 0 ? (
        <div className="mt-10">
          <EmptyState actionHref="/projects/new" actionLabel="Plant the first idea" description="Start with the part you know. Mycellium will help uncover the user, the problem, and the plan from there." title="Every good product starts a little unfinished" />
        </div>
      ) : (
        <div className="dashboard__projects">
          {projects.map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
      )}
    </main>
  );
}
