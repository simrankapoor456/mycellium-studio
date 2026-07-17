import Link from "next/link";

import { ProjectCard } from "@/components/projects/ProjectCard";
import { requireUser } from "@/lib/auth/current-user";
import { listProjects } from "@/lib/projects/operations";

export default async function DashboardPage() {
  const user = await requireUser();
  const projects = await listProjects(user.id);

  return (
    <main>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay">Your workspace</p>
          <h1 className="mt-2 font-serif text-4xl text-forest sm:text-5xl">Projects</h1>
          <p className="mt-3 max-w-2xl leading-7 text-forest/70">
            Shape project context now; discovery and generated planning arrive in later phases.
          </p>
        </div>
        <Link className="rounded-full bg-ocean px-5 py-3 text-sm font-bold text-white hover:bg-forest" href="/projects/new">
          New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <section className="mt-10 rounded-[2rem] border border-dashed border-forest/25 bg-paper/60 px-6 py-16 text-center">
          <h2 className="font-serif text-3xl text-forest">Plant the first project.</h2>
          <p className="mx-auto mt-3 max-w-md leading-7 text-forest/65">
            Capture its shape, users, team capacity, and constraints in a private workspace.
          </p>
          <Link className="mt-6 inline-block rounded-full bg-forest px-5 py-3 text-sm font-bold text-white" href="/projects/new">
            Create a project
          </Link>
        </section>
      ) : (
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
      )}
    </main>
  );
}
