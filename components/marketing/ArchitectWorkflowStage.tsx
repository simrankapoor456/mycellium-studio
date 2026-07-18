import { ArchitectureDependencyMap } from "@/components/marketing/diagrams/ArchitectureDependencyMap";
import { ScopeBoundaryMap } from "@/components/marketing/diagrams/ScopeBoundaryMap";
import { WorkflowStageHeader } from "@/components/marketing/WorkflowStageHeader";
import { architectureSummary } from "@/lib/marketing/signature-experience";

const architectureRegisters = [
  ["Goal", [architectureSummary.goal]],
  ["In scope", architectureSummary.inScope],
  ["Risks", architectureSummary.risks],
  ["Decisions", architectureSummary.decisions],
] as const;

export function ArchitectWorkflowStage() {
  return (
    <div className="workflow-stage">
      <WorkflowStageHeader
        description="Confirmed context becomes a goal, a release boundary, named risks, and architecture decisions with explicit dependencies."
        label="Architect"
        output="Scope and decision map"
        title="Give every system decision a reason and a boundary."
      />
      <div className="architecture-register">
        {architectureRegisters.map(([label, items]) => (
          <section key={label}>
            <h4>{label}</h4>
            <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
        ))}
      </div>
      <div className="workflow-diagram-grid">
        <ScopeBoundaryMap />
        <ArchitectureDependencyMap />
      </div>
    </div>
  );
}
