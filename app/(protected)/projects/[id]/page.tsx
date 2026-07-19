import Link from "next/link";
import { notFound } from "next/navigation";

import { BlueprintWorkspace } from "@/components/blueprint/BlueprintWorkspace";
import { ProjectCardActions } from "@/components/projects/ProjectCardActions";
import { ProjectWorkspaceNav } from "@/components/projects/ProjectWorkspaceNav";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { requireUser } from "@/lib/auth/current-user";
import { ProductBlueprintSchema } from "@/lib/domain/blueprint/schemas";
import { DiscoveryContextSchema } from "@/lib/domain/discovery/schemas";
import { PressureTestSchema } from "@/lib/domain/pressure-test/schemas";
import { getProjectById } from "@/lib/projects/operations";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const user = await requireUser(); const project = await getProjectById(id, user.id); if (!project) notFound();
  const blueprint = project.plan && project.plan_schema_version === "2.0" ? ProductBlueprintSchema.parse(project.plan) : null;
  const discovery = project.discovery_context ? DiscoveryContextSchema.safeParse(project.discovery_context) : null;
  const pressureTest = project.pressure_test && project.pressure_test_blueprint_version === blueprint?.version ? PressureTestSchema.parse(project.pressure_test) : null;
  return <main><Link className="inline-flex min-h-11 items-center font-bold text-forest underline-offset-4 hover:underline" href="/dashboard">← Back to projects</Link><header className="project-identity mt-5 border-b border-line pb-8"><div className="flex flex-wrap items-center gap-3"><Badge tone={project.status === "planned" || project.status === "ready" ? "success" : "warning"}>{project.status}</Badge><span className="text-sm capitalize text-ink/70">{project.project_type?.replaceAll("-", " ") ?? "Project type not set"}</span></div><h1 className="display-type mt-4 max-w-5xl break-words text-4xl text-forest sm:text-6xl">{project.name}</h1><p className="mt-5 max-w-3xl whitespace-pre-wrap text-lg leading-8 text-ink/65">{project.description || "Add a product description to make the project context easier to review."}</p></header>
    <ProjectWorkspaceNav active="overview" blueprintAvailable={Boolean(blueprint)} projectId={project.id} />
    {blueprint ? <nav aria-label="Blueprint sections" className="blueprint-section-nav">{["Overview", "Understanding", "Requirements", "Architecture", "Scope", "Epics", "Stories", "Tasks", "Sprint plan", "Risks", "Review", "Pressure Test", "Export"].map((label) => <a href={`#${label.toLowerCase().replaceAll(" ", "-")}`} key={label}>{label}</a>)}</nav> : null}
    {blueprint ? <BlueprintWorkspace facts={discovery?.success ? discovery.data.facts : []} initialBlueprint={blueprint} initialPressureTest={pressureTest} projectId={project.id} projectName={project.name} /> : <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_21rem]"><Card className="p-6 sm:p-8"><span className="eyebrow">Product foundation</span><h2 className="display-type mt-3 text-3xl text-forest">Begin with what you know.</h2><p className="mt-4 max-w-2xl leading-7 text-ink/70">Tell Mycellium what feels clear. It will ask one useful question at a time, keep uncertainty honest, and show the product taking shape as you talk.</p><div className="mt-7 flex flex-wrap gap-3"><ButtonLink href={`/projects/${project.id}/discover`}>Begin discovery</ButtonLink><ButtonLink href={`/projects/${project.id}/edit`} variant="secondary">Edit starting context</ButtonLink></div><p className="mt-5 text-sm text-ink/55">Exports become available after your first Product Blueprint is created.</p></Card><aside><Card className="p-6"><h2 className="display-type text-2xl text-forest">Project actions</h2><ProjectCardActions projectId={project.id} projectName={project.name} /></Card></aside></div>}
  </main>;
}
