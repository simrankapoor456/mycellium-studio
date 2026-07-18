import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const principles = [
  ["AI drafts, humans approve", "Generated proposals remain editable and require deliberate review."],
  ["Projects stay user-owned", "Authentication and row-level security keep personal project data isolated."],
  ["Keys stay server-side", "Provider credentials never belong in browser code or project content."],
  ["Validation and fallback", "Schema checks and deterministic planning provide an explicit recovery path."],
  ["No silent publishing", "External systems receive nothing without a future, user-initiated integration flow."],
] as const;

export function TrustSection() {
  return (
    <section className="py-24 sm:py-32">
      <Container className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr]">
        <SectionHeading
          description="Product judgment cannot be delegated to a model. Mycellium is designed to make uncertainty and approval visible."
          eyebrow="Human review and security"
          title="Useful assistance, explicit authority."
        />
        <div className="divide-y divide-line border-y border-line">
          {principles.map(([title, description]) => (
            <article className="grid gap-2 py-6 sm:grid-cols-[11rem_1fr] sm:gap-8" key={title}>
              <h3 className="font-bold text-forest">{title}</h3>
              <p className="leading-7 text-ink/65">{description}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
