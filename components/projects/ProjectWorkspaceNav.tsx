import Link from "next/link";

type ProjectWorkspaceNavProps = Readonly<{
  active: "overview" | "discovery" | "review" | "export";
  blueprintAvailable: boolean;
  projectId: string;
}>;

const WORKSPACE_SECTIONS = [
  { id: "overview", label: "Overview", path: "" },
  { id: "discovery", label: "Discovery", path: "/discover" },
  { id: "review", label: "Review", path: "/review" },
  { id: "export", label: "Export", path: "/export" },
] as const;

export function ProjectWorkspaceNav({ active, blueprintAvailable, projectId }: ProjectWorkspaceNavProps) {
  return (
    <nav aria-label="Project workspace" className="project-workspace-nav">
      {WORKSPACE_SECTIONS.map((section) => (
        <Link
          aria-current={active === section.id ? "page" : undefined}
          data-available={section.id !== "export" || blueprintAvailable}
          href={`/projects/${projectId}${section.path}`}
          key={section.id}
        >
          {section.label}
          {section.id === "export" && !blueprintAvailable ? <span>After blueprint</span> : null}
        </Link>
      ))}
    </nav>
  );
}
