import { ReadinessDiagram } from "@/components/marketing/diagrams/ReadinessDiagram";
import { WorkflowStageHeader } from "@/components/marketing/WorkflowStageHeader";
import { discoverConversation, discoveredFacts } from "@/lib/marketing/signature-experience";

export function DiscoverWorkflowStage() {
  return (
    <div className="workflow-stage">
      <WorkflowStageHeader
        description="A short exchange separates current evidence from open questions. No model request is made in this fixed sequence."
        label="Discover"
        output="Facts, uncertainty, readiness"
        title="Turn the first claim into grounded product context."
      />
      <div className="workflow-stage__grid">
        <section className="workflow-pane" aria-labelledby="discover-conversation-title">
          <h4 id="discover-conversation-title">Conversation</h4>
          <ol className="conversation-thread">
            {discoverConversation.map((message) => (
              <li data-speaker={message.speaker === "Builder" ? "human" : "system"} key={message.message}>
                <span>{message.speaker}</span>
                <p>{message.message}</p>
              </li>
            ))}
          </ol>
        </section>
        <section className="workflow-pane" aria-labelledby="discover-facts-title">
          <h4 id="discover-facts-title">Extracted understanding</h4>
          <ul className="artifact-list">
            {discoveredFacts.map((fact) => <li key={fact}>{fact}</li>)}
          </ul>
          <div className="uncertainty-callout">
            <span>Uncertainty to resolve</span>
            <p>Which primary user and boundary still need evidence before scope can settle?</p>
          </div>
        </section>
      </div>
      <ReadinessDiagram />
    </div>
  );
}
