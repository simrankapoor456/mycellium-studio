import { Container } from "@/components/ui/Container";

const layers = [
  ["Context and persisted state", "The product reads only the owned, visible material needed for the current task."],
  ["Proposal layer", "Configured AI can propose structured output. Reliable mode provides the same contract without a provider."],
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
          <aside>
            <strong>Human review is the boundary.</strong>
            <p>Generated proposals stay editable. Product data remains owner-scoped. Nothing publishes to another system silently.</p>
            <dl>
              <div><dt>Provider unavailable</dt><dd>Reliable mode</dd></div>
              <div><dt>Foundation unresolved</dt><dd>Continue discovery</dd></div>
              <div><dt>Blueprint approved</dt><dd>Export current state</dd></div>
            </dl>
          </aside>
        </div>
      </Container>
    </section>
  );
}
