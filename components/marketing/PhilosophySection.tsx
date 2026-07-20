import { Container } from "@/components/ui/Container";

const principles = [
  ["Living", "Understanding changes as the product changes. The system keeps context open to revision."],
  ["Connected", "Facts, decisions, requirements, and outputs retain visible relationships."],
  ["Grounded", "Human approval remains the boundary between a proposal and an accepted foundation."],
] as const;

export function PhilosophySection() {
  return (
    <section className="living-principles" id="philosophy">
      <Container>
        <div className="living-principles__statement">
          <h2>Understanding should keep moving through the work.</h2>
          <p>Context becomes structure. Structure becomes action. What you learn returns to strengthen the next decision.</p>
        </div>
        <div className="living-principles__orbit" role="img" aria-label="Context flows through discovery, foundation, architecture, and an editable blueprint before returning as stronger product understanding.">
          <svg aria-hidden="true" viewBox="0 0 920 420">
            <path d="M96 220C96 88 266 44 424 104S712 87 826 182C919 260 792 375 622 326S338 363 178 306C126 287 96 258 96 220Z" />
            <path d="M178 306C243 258 270 178 424 104M622 326C575 262 570 182 712 87" />
            <circle cx="96" cy="220" r="8" /><circle cx="424" cy="104" r="8" /><circle cx="712" cy="87" r="8" /><circle cx="826" cy="182" r="8" /><circle cx="622" cy="326" r="8" /><circle cx="178" cy="306" r="8" />
          </svg>
          <span className="living-principles__label living-principles__label--context">Context</span>
          <span className="living-principles__label living-principles__label--discover">Discovery</span>
          <span className="living-principles__label living-principles__label--foundation">Foundation</span>
          <span className="living-principles__label living-principles__label--architecture">Architecture</span>
          <span className="living-principles__label living-principles__label--blueprint">Blueprint</span>
          <span className="living-principles__label living-principles__label--learning">Learning returns</span>
        </div>
        <div className="living-principles__list">
          {principles.map(([name, description]) => <article key={name}><h3>{name}</h3><p>{description}</p></article>)}
        </div>
      </Container>
    </section>
  );
}
