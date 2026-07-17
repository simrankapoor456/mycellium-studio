import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectForm } from "@/components/projects/ProjectForm";
import { requireUser } from "@/lib/auth/current-user";
import { getProjectById } from "@/lib/projects/operations";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const project = await getProjectById(id, user.id);

  if (!project) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl">
      <Link className="text-sm font-bold text-ocean hover:underline" href={`/projects/${project.id}`}>← Back to project</Link>
      <section className="mt-6 rounded-[2rem] border border-line bg-paper/85 p-6 shadow-sm sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay">Project foundation</p>
        <h1 className="mt-2 font-serif text-4xl text-forest">Edit metadata</h1>
        <ProjectForm project={project} />
      </section>
    </main>
  );
}
