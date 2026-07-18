import { SprintTimeline } from "@/components/marketing/diagrams/SprintTimeline";
import { WorkHierarchyDiagram } from "@/components/marketing/diagrams/WorkHierarchyDiagram";
import { WorkflowStageHeader } from "@/components/marketing/WorkflowStageHeader";
import { executionSummary } from "@/lib/marketing/signature-experience";

export function ExecuteWorkflowStage() {
  return (
    <div className="workflow-stage">
      <WorkflowStageHeader
        description="Approved architecture becomes a traceable hierarchy and a dependency-aware sprint sequence. People still review every proposed output."
        label="Execute"
        output="Epics, stories, tasks, sprints"
        title="Resolve architecture into work a team can challenge."
      />
      <div className="execution-register">
        <section><span>Epic</span><strong>{executionSummary.epic}</strong></section>
        <section><span>Stories</span><strong>{executionSummary.stories.length} reviewable outcomes</strong></section>
        <section><span>Tasks</span><strong>{executionSummary.tasks.length} implementation checks</strong></section>
        <section><span>Sequence</span><strong>{executionSummary.sprints.length} proposed sprints</strong></section>
      </div>
      <div className="workflow-diagram-grid">
        <WorkHierarchyDiagram />
        <SprintTimeline />
      </div>
    </div>
  );
}
