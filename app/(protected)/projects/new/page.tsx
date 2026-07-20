import type { Metadata } from "next";
import Link from "next/link";

import { ProjectForm } from "@/components/projects/ProjectForm";
import { requireUser } from "@/lib/auth/current-user";

export const metadata: Metadata = {
  title: "Create a project",
  description: "Create a private product foundation in Mycellium Studio.",
};

export default async function NewProjectPage() {
  const user = await requireUser();
  return (
    <main className="project-creation-page">
      <Link className="inline-flex min-h-11 items-center font-bold text-forest underline-offset-4 hover:underline" href="/dashboard">← Back to projects</Link>
      <header className="project-creation-page__header">
        <p className="font-mono text-sm font-bold text-moss">A place for the idea to grow</p>
        <h1 className="display-type mt-3 text-4xl text-forest">Give the product a starting point</h1>
        <p>Share what is already known. Four details are enough to begin, and discovery will help uncover the rest.</p>
      </header>
      <ProjectForm draftOwnerId={user.id} />
    </main>
  );
}
