import Link from "next/link";

import { ProjectForm } from "@/components/projects/ProjectForm";

export default function NewProjectPage() {
  return (
    <main className="mx-auto max-w-3xl">
      <Link className="text-sm font-bold text-ocean hover:underline" href="/dashboard">← Back to projects</Link>
      <section className="mt-6 rounded-[2rem] border border-line bg-paper/85 p-6 shadow-sm sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay">Project foundation</p>
        <h1 className="mt-2 font-serif text-4xl text-forest">Create a project</h1>
        <p className="mt-3 leading-7 text-forest/70">Capture the durable inputs that later discovery and planning will build on.</p>
        <ProjectForm />
      </section>
    </main>
  );
}
