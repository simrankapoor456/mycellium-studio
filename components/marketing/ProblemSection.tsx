import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const problems = [
  ["Scattered conversations", "Decisions live across calls, messages, documents, and memory."],
  ["Vague assumptions", "Early guesses quietly harden into commitments without review."],
  ["Premature tickets", "Teams describe work before agreeing on the product problem or boundary."],
  ["Missing risks", "Dependencies and unknowns appear after estimates have already shaped expectations."],
  ["Unclear scope", "A growing backlog can look precise while the intended outcome remains uncertain."],
] as const;

export function ProblemSection() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <SectionHeading
          description="Most delivery tools are excellent once the work is understood. The costly gap comes earlier, while a team is still deciding what the product should be."
          title="Project tools begin after the hardest thinking."
        />
        <div className="mt-14 grid border-y border-line md:grid-cols-2 xl:grid-cols-5">
          {problems.map(([title, description]) => (
            <article className="border-b border-line px-0 py-7 md:px-6 xl:border-b-0 xl:border-r xl:last:border-r-0" key={title}>
              <h3 className="text-lg font-bold text-forest">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-ink/65">{description}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
