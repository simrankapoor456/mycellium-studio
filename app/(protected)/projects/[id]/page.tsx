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
import { ProjectTypeSchema } from "@/lib/domain/plan/schemas";
import { PressureTestSchema } from "@/lib/domain/pressure-test/schemas";
import { getProductTypeLabel } from "@/lib/domain/project/labels";
import { getProjectById } from "@/lib/projects/operations";

const blueprintSections = ["Overview", "Understanding", "Requirements", "Architecture", "Scope", "Epics", "Stories", "Tasks", "Sprint plan", "Risks", "Review", "Pressure Test", "Export"] as const;

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const project = await getProjectById(id, user.id);
  if (!project) notFound();

  const blueprint = project.plan && project.plan_schema_version === "2.0" ? ProductBlueprintSchema.parse(project.plan) : null;
  const discovery = project.discovery_context ? DiscoveryContextSchema.safeParse(project.discovery_context) : null;
  const pressureTest = project.pressure_test && project.pressure_test_blueprint_version === blueprint?.version ? PressureTestSchema.parse(project.pressure_test) : null;
  const projectType = ProjectTypeSchema.safeParse(project.project_type);

  return (
    <main>
      <Link className="inline-flex min-h-11 items-center font-bold text-forest underline-offset-4 hover:underline" href="/dashboard">← Back to projects</Link>
      <header className="project-identity mt-5 border-b border-line pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={project.status === "planned" || project.status === "ready" ? "success" : "warning"}>{project.status}</Badge>
          <span className="text-sm text-ink/70">{getProductTypeLabel(projectType.success ? projectType.data : null, project.custom_project_type)}</span>
        </div>
        <h1 className="display-type mt-4 max-w-5xl break-words text-4xl text-forest sm:text-6xl">{project.name}</h1>
        <p className="mt-5 max-w-3xl whitespace-pre-wrap text-lg leading-8 text-ink/65">{project.description || "Add source material to make the product context easier to review."}</p>
      </header>
      <ProjectWorkspaceNav active="overview" blueprintAvailable={Boolean(blueprint)} discoveryStarted={Boolean(project.discovery_context)} foundationApproved={Boolean(project.discovery_approved_at)} projectId={project.id} />

      {blueprint ? (
        <div className="blueprint-editorial-layout">
          <nav aria-label="Blueprint sections" className="blueprint-section-nav" data-native-scroll>
            <span>Outline</span>
            {blueprintSections.map((label) => <a href={`#${label.toLowerCase().replaceAll(" ", "-")}`} key={label}>{label}</a>)}
          </nav>
          <BlueprintWorkspace facts={discovery?.success ? discovery.data.facts : []} initialBlueprint={blueprint} initialPressureTest={pressureTest} projectId={project.id} projectName={project.name} />
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_21rem]">
          <Card className="p-6 sm:p-8">
            <span className="eyebrow">Product foundation</span>
            <h2 className="display-type mt-3 text-3xl text-forest">Begin with what you know.</h2>
            <p className="mt-4 max-w-2xl leading-7 text-ink/70">Tell Mycellium what feels clear. It will ask one useful question at a time, keep uncertainty honest, and show the product taking shape as you talk.</p>
            <div className="mt-7 flex flex-wrap gap-3"><ButtonLink href={`/projects/${project.id}/discover`}>Begin discovery</ButtonLink><ButtonLink href={`/projects/${project.id}/edit`} variant="secondary">Edit starting context</ButtonLink></div>
            <p className="mt-5 text-sm text-ink/55">Exports become available after your first Product Blueprint is created.</p>
          </Card>
          <aside><Card className="p-6"><h2 className="display-type text-2xl text-forest">Project actions</h2><ProjectCardActions projectId={project.id} projectName={project.name} /></Card></aside>
        </div>
      )}
    </main>
  );
}
