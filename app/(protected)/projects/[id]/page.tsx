import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectCardActions } from "@/components/projects/ProjectCardActions";
import { requireUser } from "@/lib/auth/current-user";
import { getProjectById } from "@/lib/projects/operations";

const labels: Record<string, string> = {
  project_type: "Project type",
  target_users: "Target users",
  team_size: "Team size",
  sprint_length: "Sprint length",
  capacity: "Sprint capacity",
  planning_depth: "Planning depth",
  constraints: "Constraints",
};

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const project = await getProjectById(id, user.id);

  if (!project) {
    notFound();
  }

  const metadata = [
    { label: labels.project_type, value: project.project_type },
    { label: labels.target_users, value: project.target_users },
    { label: labels.team_size, value: project.team_size },
    { label: labels.sprint_length, value: project.sprint_length },
    { label: labels.capacity, value: project.capacity },
    { label: labels.planning_depth, value: project.planning_depth },
    { label: labels.constraints, value: project.constraints },
  ];

  return (
    <main>
      <Link className="text-sm font-bold text-ocean hover:underline" href="/dashboard">← Back to projects</Link>
      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Project sections">
        <span className="rounded-full bg-forest px-4 py-2 text-xs font-bold text-white">Overview</span>
        <span className="rounded-full border border-line bg-paper/60 px-4 py-2 text-xs font-bold text-forest/45" aria-disabled="true">Discovery · Phase 3</span>
        <span className="rounded-full border border-line bg-paper/60 px-4 py-2 text-xs font-bold text-forest/45" aria-disabled="true">Plan · Later phase</span>
      </nav>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <section className="rounded-[2rem] border border-line bg-paper/85 p-6 sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay">{project.status}</p>
          <h1 className="mt-2 font-serif text-4xl text-forest sm:text-5xl">{project.name}</h1>
          <p className="mt-5 max-w-3xl whitespace-pre-wrap leading-7 text-forest/70">
            {project.description || "No description yet."}
          </p>
          <dl className="mt-9 grid gap-5 border-t border-line pt-7 sm:grid-cols-2">
            {metadata.map(({ label, value }) => (
              <div key={label}>
                <dt className="text-xs font-bold uppercase tracking-[0.14em] text-forest/45">{label}</dt>
                <dd className="mt-2 whitespace-pre-wrap text-sm leading-6 text-forest">
                  {value === null || value === "" ? "Not specified" : String(value).replaceAll("-", " ")}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[1.75rem] border border-line bg-paper/85 p-6">
            <h2 className="font-serif text-2xl text-forest">Project actions</h2>
            <Link className="mt-4 inline-block text-sm font-bold text-ocean hover:underline" href={`/projects/${project.id}/edit`}>
              Edit metadata
            </Link>
            <ProjectCardActions projectId={project.id} projectName={project.name} />
          </section>
          <section className="rounded-[1.75rem] border border-line bg-paper/85 p-6">
            <h2 className="font-serif text-2xl text-forest">Discovery context</h2>
            {project.discovery_context && typeof project.discovery_context === "object" && !Array.isArray(project.discovery_context) ? (
              <dl className="mt-4 space-y-3">
                {Object.entries(project.discovery_context).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-xs font-bold uppercase tracking-wide text-forest/50">{key.replaceAll("_", " ")}</dt>
                    <dd className="mt-1 break-words text-sm text-forest/75">
                      {typeof value === "string" ? value : JSON.stringify(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-3 text-sm leading-6 text-forest/65">No discovery context has been saved yet.</p>
            )}
          </section>
          <section className="rounded-[1.75rem] border border-sage/50 bg-sage/20 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-forest/55">Coming in Phase 3</p>
            <h2 className="mt-2 font-serif text-2xl text-forest">Guided discovery</h2>
            <p className="mt-3 text-sm leading-6 text-forest/70">
              The persistence model is ready. Conversational discovery and AI calls remain intentionally out of scope.
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}
