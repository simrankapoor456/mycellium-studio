import type { Metadata } from "next";
import Link from "next/link";

import { ProjectForm } from "@/components/projects/ProjectForm";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Create a project",
  description: "Create a private product foundation in Mycellium Studio.",
};

export default function NewProjectPage() {
  return (
    <main className="mx-auto max-w-3xl">
      <Link className="inline-flex min-h-11 items-center font-bold text-forest underline-offset-4 hover:underline" href="/dashboard">← Back to projects</Link>
      <Card className="mt-5 p-6 sm:p-9">
        <p className="font-mono text-sm font-bold text-moss">A place for the idea to grow</p>
        <h1 className="display-type mt-3 text-4xl text-forest">Give the product a starting point</h1>
        <p className="mt-4 max-w-2xl leading-7 text-ink/65">Share what is already known. It does not need to be polished — discovery will help uncover the rest.</p>
        <ProjectForm />
      </Card>
    </main>
  );
}
