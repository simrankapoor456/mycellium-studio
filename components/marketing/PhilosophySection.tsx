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
      <Container>
        <div className="max-w-4xl">
          <h2 className="display-type balanced-text text-4xl leading-[1.05] sm:text-6xl">
            Visible structure is only as strong as the understanding beneath it.
          </h2>
          <p className="mt-7 max-w-[60ch] text-lg leading-8 text-paper/70">
            Every product starts as a seed. The right questions establish roots; reviewed requirements create branches; features become leaves; sprints become seasons; shipping creates the next cycle of growth.
          </p>
        </div>
        <dl className="growth-path mt-16">
          {growthModel.map(([term, description]) => (
            <div className="growth-path__step" key={term}>
              <dt>{term}</dt>
              <dd>{description}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
