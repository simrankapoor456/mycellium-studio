import Link from "next/link";

type Props = Readonly<{
  active: "overview" | "discovery" | "review" | "export";
  blueprintAvailable: boolean;
  discoveryStarted?: boolean;
  foundationApproved?: boolean;
  projectId: string;
}>;

export function ProjectWorkspaceNav({ active, blueprintAvailable, discoveryStarted = active !== "overview", foundationApproved = blueprintAvailable, projectId }: Props) {
  const steps = [
    { id: "starting", label: "Starting point", meta: "Seed", href: `/projects/${projectId}`, available: true, complete: discoveryStarted, active: active === "overview" && !blueprintAvailable },
    { id: "discovery", label: "Discovery", meta: "Roots", href: `/projects/${projectId}/discover`, available: true, complete: discoveryStarted, active: active === "discovery" },
    { id: "review", label: "Foundation review", meta: "Foundation", href: `/projects/${projectId}/review`, available: discoveryStarted, complete: foundationApproved, active: active === "review" && !foundationApproved },
    { id: "architecture", label: "Architecture", meta: "Structure", href: `/projects/${projectId}/review`, available: foundationApproved, complete: blueprintAvailable, active: active === "review" && foundationApproved },
    { id: "blueprint", label: "Product Blueprint", meta: "Canopy", href: `/projects/${projectId}`, available: blueprintAvailable, complete: blueprintAvailable, active: active === "overview" && blueprintAvailable },
    { id: "export", label: "Export", meta: blueprintAvailable ? "Harvest" : "After blueprint", href: `/projects/${projectId}/export`, available: true, complete: false, active: active === "export" },
  ] as const;

  return <nav aria-label="Project journey" className="project-journey"><ol>{steps.map((step, index) => <li data-active={step.active} data-complete={step.complete} key={step.id}>
    <span aria-hidden="true" className="project-journey__index">{step.complete ? "✓" : index + 1}</span>
    {step.available ? <Link aria-current={step.active ? "step" : undefined} href={step.href}><strong>{step.label}</strong><small>{step.meta}</small></Link> : <span aria-disabled="true" title={lockedReason(step.id)}><strong>{step.label}</strong><small>{lockedReason(step.id)}</small></span>}
  </li>)}</ol></nav>;
}

function lockedReason(id: string): string {
  if (id === "review") return "Continue discovery first";
  if (id === "architecture") return "Approve the foundation first";
  return "Create a persisted blueprint first";
}
