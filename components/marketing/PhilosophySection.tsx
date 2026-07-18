import { Container } from "@/components/ui/Container";

const growthModel = [
  ["Seed", "The first product idea"],
  ["Roots", "Questions and shared context"],
  ["Branches", "Requirements and architecture"],
  ["Leaves", "Features and stories"],
  ["Seasons", "Sprints and review cycles"],
  ["Growth", "Learning from what ships"],
] as const;

export function PhilosophySection() {
  return (
    <section className="bg-forest py-24 text-paper sm:py-32" id="philosophy">
      <Container className="grid items-center gap-16 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <h2 className="display-type balanced-text text-4xl leading-[1.05] sm:text-6xl">
            Visible structure is only as strong as the understanding beneath it.
          </h2>
          <p className="mt-7 max-w-[60ch] text-lg leading-8 text-paper/70">
            Every product starts as a seed. The right questions establish roots; reviewed requirements create branches; features become leaves; sprints become seasons; shipping creates the next cycle of growth.
          </p>
        </div>
        <dl className="grid grid-cols-2 border border-paper/20 sm:grid-cols-3">
          {growthModel.map(([term, description]) => (
            <div className="min-h-36 border-b border-r border-paper/20 p-5 sm:p-6" key={term}>
              <dt className="text-xl font-bold text-sage">{term}</dt>
              <dd className="mt-3 text-sm leading-6 text-paper/65">{description}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
