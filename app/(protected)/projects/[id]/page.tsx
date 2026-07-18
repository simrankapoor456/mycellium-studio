import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectCardActions } from "@/components/projects/ProjectCardActions";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { requireUser } from "@/lib/auth/current-user";
import { getProjectById } from "@/lib/projects/operations";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const project = await getProjectById(id, user.id);

  if (!project) {
    notFound();
  }

  const metadata = [
    ["Project type", project.project_type],
    ["Target users", project.target_users],
    ["Team size", project.team_size],
    ["Sprint duration", project.sprint_length],
    ["Team capacity", project.capacity],
    ["Planning depth", project.planning_depth],
    ["Constraints", project.constraints],
  ] as const;

  const discoveryContext = project.discovery_context;

  return (
    <main>
      <Link className="inline-flex min-h-11 items-center font-bold text-forest underline-offset-4 hover:underline" href="/dashboard">← Back to projects</Link>
      <header className="mt-5 border-b border-line pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={project.status === "ready" ? "success" : "warning"}>{project.status}</Badge>
          <span className="text-sm capitalize text-ink/70">{project.project_type?.replaceAll("-", " ") ?? "Project type not set"}</span>
        </div>
        <h1 className="display-type mt-4 max-w-5xl break-words text-4xl text-forest sm:text-6xl">{project.name}</h1>
        <p className="mt-5 max-w-3xl whitespace-pre-wrap text-lg leading-8 text-ink/65">{project.description || "Add a product description to make the project context easier to review."}</p>
      </header>

      <nav className="flex gap-1 overflow-x-auto border-b border-line py-3" aria-label="Project sections">
        <span aria-current="page" className="min-h-11 whitespace-nowrap border-b-2 border-forest px-4 py-3 text-sm font-bold text-forest">Overview</span>
        <span aria-disabled="true" className="min-h-11 whitespace-nowrap px-4 py-3 text-sm font-bold text-ink/70">Discovery (Phase 3B)</span>
        <span aria-disabled="true" className="min-h-11 whitespace-nowrap px-4 py-3 text-sm font-bold text-ink/70">Architecture (planned)</span>
        <span aria-disabled="true" className="min-h-11 whitespace-nowrap px-4 py-3 text-sm font-bold text-ink/70">Plan (planned)</span>
      </nav>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_21rem]">
        <div className="space-y-6">
          <Card className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="display-type text-2xl text-forest">Project foundation</h2>
              <ButtonLink href={`/projects/${project.id}/edit`} variant="secondary">Edit metadata</ButtonLink>
            </div>
            <dl className="mt-7 grid gap-x-8 gap-y-6 border-t border-line pt-7 sm:grid-cols-2">
              {metadata.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-sm font-bold text-ink/70">{label}</dt>
                  <dd className="mt-2 whitespace-pre-wrap leading-7 text-ink">{value === null || value === "" ? "Not specified" : String(value).replaceAll("-", " ")}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="p-6 sm:p-8">
            <h2 className="display-type text-2xl text-forest">Saved discovery context</h2>
            {discoveryContext && typeof discoveryContext === "object" && !Array.isArray(discoveryContext) ? (
              <dl className="mt-6 divide-y divide-line border-y border-line">
                {Object.entries(discoveryContext).map(([key, value]) => (
                  <div className="grid gap-2 py-4 sm:grid-cols-[12rem_1fr]" key={key}>
                    <dt className="font-bold capitalize text-ink/70">{key.replaceAll("_", " ")}</dt>
                    <dd className="break-words text-ink/75">{typeof value === "string" ? value : JSON.stringify(value)}</dd>
                  </div>
                ))}
              </dl>
            ) : <p className="mt-4 leading-7 text-ink/70">No discovery context has been saved yet.</p>}
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="p-6">
            <h2 className="display-type text-2xl text-forest">Project actions</h2>
            <ProjectCardActions projectId={project.id} projectName={project.name} />
          </Card>
          <section className="border border-gold/50 bg-gold/10 p-6">
            <Badge tone="warning">Phase 3B continuation</Badge>
            <h2 className="display-type mt-4 text-2xl text-forest">Guided discovery begins here</h2>
            <p className="mt-3 text-sm leading-6 text-ink/65">The project and message persistence boundaries are ready. Adaptive questions, readiness assessment, and AI provider calls remain intentionally unimplemented.</p>
          </section>
        </aside>
      </div>
    </main>
  );
}
