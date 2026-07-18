import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const audiences = [
  ["Startup founders", "Pressure-test a product direction before the first backlog becomes a commitment."],
  ["Product managers", "Keep discovery evidence, scope decisions, and delivery planning connected."],
  ["Engineering leads", "Surface technical boundaries and risks while there is still room to change them."],
  ["Agencies", "Turn client conversations into reviewable product context and clearer delivery expectations."],
  ["Freelancers", "Create a credible project foundation without maintaining a heavy process stack."],
  ["Student and capstone teams", "Learn how product understanding becomes architecture and executable work."],
] as const;

export function IdealUsersSection() {
  return (
    <section className="border-y border-line bg-surface-quiet/45 py-24 sm:py-32">
      <Container>
        <SectionHeading
          description="The workflow scales down to one thoughtful builder and up to a product team preparing shared work."
          title="For people responsible for turning ambiguity into a plan."
        />
        <div className="mt-14 columns-1 gap-6 md:columns-2 lg:columns-3">
          {audiences.map(([title, description], index) => (
            <article className={index % 2 === 0 ? "mb-6 break-inside-avoid bg-surface p-6" : "mb-6 break-inside-avoid border border-line bg-canvas p-6 lg:py-9"} key={title}>
              <h3 className="text-xl font-bold text-forest">{title}</h3>
              <p className="mt-3 leading-7 text-ink/65">{description}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
