import { ProductStageExperience } from "@/components/marketing/ProductStageExperience";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function JourneySection() {
  return (
    <section className="border-y border-line bg-surface-quiet/55 py-24 sm:py-32" id="product">
      <Container>
        <SectionHeading
          description="Move through a realistic fixed-data workflow. Each stage exposes the conversation, decisions, boundaries, dependencies, and delivery structure it creates."
          eyebrow="Discover → Architect → Execute"
          title="Work the same idea from first question to sprint allocation."
        />
        <div className="mt-14"><ProductStageExperience /></div>
      </Container>
    </section>
  );
}
