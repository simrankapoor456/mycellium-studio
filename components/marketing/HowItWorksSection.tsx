import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const steps = [
  ["Adaptive discovery", "Questions respond to what is known, uncertain, contradictory, or still missing."],
  ["Requirements review", "Facts, assumptions, constraints, and open questions remain visible for approval."],
  ["Product architecture", "The system proposes boundaries, decisions, dependencies, and meaningful tradeoffs."],
  ["Execution planning", "Approved context becomes epics, stories, tasks, risks, and capacity-aware sprints."],
  ["Human approval", "Nothing publishes silently. People edit, accept, or reject every consequential output."],
] as const;

export function HowItWorksSection() {
  return (
    <section className="py-24 sm:py-32" id="how-it-works">
      <Container className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHeading
          description="Mycellium keeps understanding connected to execution, with explicit review points between each kind of work."
          title="A deliberate path from question to sprint."
        />
        <ol className="divide-y divide-line border-y border-line">
          {steps.map(([title, description]) => (
            <li className="grid gap-2 py-6 sm:grid-cols-[12rem_1fr] sm:gap-8" key={title}>
              <h3 className="font-bold text-forest">{title}</h3>
              <p className="leading-7 text-ink/65">{description}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
