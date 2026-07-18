import { ProductStageExperience } from "@/components/marketing/ProductStageExperience";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function JourneySection() {
  return (
    <section className="border-y border-line bg-surface-quiet/55 py-24 sm:py-32" id="product">
      <Container>
        <SectionHeading
          description="Switch stages to see how one product idea develops without losing its original context. The demonstration is fixed and local; it makes no AI request."
          eyebrow="Discover → Architect → Execute"
          title="One idea, developed through a connected product journey."
        />
        <div className="mt-14"><ProductStageExperience /></div>
      </Container>
    </section>
  );
}
