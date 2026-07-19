import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const capabilities = [
  ["Conversational discovery", "Questions adapt to gaps and contradictions.", "Available"],
  ["Foundation strength", "See what is rooted, assumed, and still needs a decision.", "Available"],
  ["Requirements and scope", "Keep objectives, users, constraints, and boundaries reviewable.", "Available"],
  ["Architecture decisions", "Record technical choices with context and tradeoffs.", "Available"],
  ["Epics, stories, and tasks", "Develop approved requirements into connected delivery work.", "Available"],
  ["Sprint planning", "Propose work against duration, capacity, and dependencies.", "Available"],
  ["Deterministic fallback", "Keep a local, schema-valid path when an AI provider is unavailable.", "Available"],
  ["Editable output", "Human review remains the final authority before work moves forward.", "Available"],
  ["Markdown, JSON, and CSV", "Take the latest saved blueprint into the tools you already use.", "Available"],
] as const;

function statusTone(status: string) {
  return status === "Available" ? ("success" as const) : ("neutral" as const);
}

export function FeatureOverview() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <SectionHeading
          description="Every layer is available in one accountable path, from the first uncertain answer to the latest saved export."
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
