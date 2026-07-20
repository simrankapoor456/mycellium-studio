import { BrandMark } from "@/components/brand/BrandMark";
import { Container } from "@/components/ui/Container";

const layers = [
  ["Context and persisted state", "The product reads only the owned, visible material needed for the current task."],
  ["Proposal layer", "Configured AI can propose structured output. Reliable mode supplies schema-valid deterministic output without a provider."],
  ["Decision layer", "Identity, ownership, validation, readiness, and approval policies determine what may continue."],
  ["Deterministic execution", "Only trusted application code persists graph changes, blueprints, lineage, and exports."],
] as const;

export function TrustSection() {
  return (
    <section className="mycel-core-section">
      <Container>
        <header><h2>Intelligence with explicit authority.</h2><p>Mycel Core separates proposals from decisions and execution, so product judgment remains visible.</p></header>
        <div className="mycel-core-section__system">
          <ol>
            {layers.map(([name, description], index) => (
              <li key={name}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><div><h3>{name}</h3><p>{description}</p></div></li>
            ))}
          </ol>
          <aside className="human-review-panel">
            <div className="human-review-panel__heading">
              <BrandMark className="human-review-panel__mark" />
              <div>
                <span>Capability rules</span>
                <strong>Human review controls what advances.</strong>
              </div>
            </div>
            <p>This is a map of product behavior, not a live project status. Proposals stay editable, data remains owner-scoped, and external publishing is not implemented.</p>
            <dl>
              <div><dt><span>Condition</span>AI provider unavailable</dt><dd><span>System response</span>Reliable mode remains available</dd></div>
              <div><dt><span>Condition</span>Foundation unresolved</dt><dd><span>System response</span>Continue discovery or resolve decisions</dd></div>
              <div><dt><span>Condition</span>Foundation approved</dt><dd><span>System response</span>Architect the product</dd></div>
              <div><dt><span>Condition</span>Blueprint available</dt><dd><span>System response</span>Review, edit, or export saved state</dd></div>
            </dl>
          </aside>
        </div>
      </Container>
    </section>
  );
}
