import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const capabilities = [
  ["Conversational discovery", "Questions adapt to gaps and contradictions.", "Phase 3B next"],
  ["Readiness assessment", "See what is known, assumed, and still blocking a sound plan.", "Phase 3B next"],
  ["Requirements and scope", "Keep objectives, users, constraints, and boundaries reviewable.", "Foundation ready"],
  ["Architecture decisions", "Record technical choices with context and tradeoffs.", "Planned"],
  ["Epics, stories, and tasks", "Develop approved requirements into connected delivery work.", "Planner ready"],
  ["Sprint planning", "Propose work against duration, capacity, and dependencies.", "Planner ready"],
  ["Deterministic fallback", "Keep a local, schema-valid path when an AI provider is unavailable.", "Available"],
  ["Editable output", "Human review remains the final authority before work moves forward.", "Planned UI"],
  ["Markdown, JSON, and CSV", "Preserve portable outputs without locking plans to one tool.", "Export core ready"],
] as const;

function statusTone(status: string) {
  if (status === "Available" || status.includes("ready")) {
    return "success" as const;
  }

  if (status.includes("next")) {
    return "warning" as const;
  }

  return "neutral" as const;
}

export function FeatureShowcase() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <SectionHeading
          description="The foundation is deliberately honest about what works today and what enters the product in the next phase."
          title="A complete product architecture, built in accountable layers."
        />
        <div className="capability-ledger mt-14">
          <aside className="capability-ledger__context">
            <p>The operating rule</p>
            <strong>Understanding stays connected to every artifact created from it.</strong>
            <dl>
              <div><dt>Input</dt><dd>Reviewed product context</dd></div>
              <div><dt>Boundary</dt><dd>Human approval</dd></div>
              <div><dt>Output</dt><dd>Portable, validated work</dd></div>
            </dl>
          </aside>
          <ol className="capability-ledger__list">
            {capabilities.map(([title, description, status]) => (
              <li key={title}>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
                <Badge tone={statusTone(status)}>{status}</Badge>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
