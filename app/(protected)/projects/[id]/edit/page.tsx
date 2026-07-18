import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectForm } from "@/components/projects/ProjectForm";
import { Card } from "@/components/ui/Card";
import { requireUser } from "@/lib/auth/current-user";
import { getProjectById } from "@/lib/projects/operations";

export const metadata: Metadata = { title: "Edit project" };

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const project = await getProjectById(id, user.id);

  if (!project) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl">
      <Link className="inline-flex min-h-11 items-center font-bold text-forest underline-offset-4 hover:underline" href={`/projects/${project.id}`}>← Back to project</Link>
      <Card className="mt-5 p-6 sm:p-9">
        <p className="font-mono text-sm font-bold text-moss">Project foundation</p>
        <h1 className="display-type mt-3 break-words text-4xl text-forest">Edit {project.name}</h1>
        <p className="mt-4 leading-7 text-ink/65">Keep the product context current before guided discovery begins.</p>
        <ProjectForm project={project} />
      </Card>
    </main>
  );
}
