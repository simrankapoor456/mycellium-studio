import { BrandMark } from "@/components/brand/BrandMark";
import { Container } from "@/components/ui/Container";

const lifecycle = [
  { name: "Context gathers", artifact: "Notes, constraints, source material", description: "Bring the product context that already exists without forcing it into a template first." },
  { name: "Discovery connects", artifact: "Facts, gaps, contradictions", description: "Mycel Core separates what is grounded from what still needs a deliberate decision." },
  { name: "Foundation settles", artifact: "Approved product understanding", description: "Review the product foundation, challenge assumptions, and keep unresolved areas visible." },
  { name: "Architecture forms", artifact: "Boundaries, requirements, decisions", description: "Develop an accountable system structure with traceable reasons and dependencies." },
  { name: "Blueprint lives", artifact: "Editable and portable output", description: "Carry the latest approved structure forward without losing its source or lineage." },
] as const;

export function JourneySection() {
  return (
    <section className="lifecycle" id="product">
      <Container className="lifecycle__layout">
        <div className="lifecycle__intro">
          <h2>One product, understood as a living system.</h2>
          <p>Every artifact stays connected to the context and decisions that shaped it.</p>
          <div className="lifecycle__core" aria-hidden="true">
            <BrandMark />
            <span>Mycel Core</span>
          </div>
        </div>
        <ol className="lifecycle__path">
          {lifecycle.map((phase) => (
            <li key={phase.name}>
              <span aria-hidden="true" className="lifecycle__node" />
              <div>
                <h3>{phase.name}</h3>
                <p>{phase.description}</p>
                <small>{phase.artifact}</small>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
