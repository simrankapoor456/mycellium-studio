import { BrandMark } from "@/components/brand/BrandMark";
import SplitText from "@/components/react-bits/SplitText";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PROJECT_START_HREF } from "@/lib/marketing/links";

export function FinalCtaSection() {
  return (
    <section className="final-cta living-final-cta">
      <Container className="living-final-cta__layout">
        <div>
          <SplitText tag="h2" text="Give the next product decision a living foundation." />
          <p>Bring the context you have. Keep every useful question, decision, and output connected as the product takes shape.</p>
          <ButtonLink className="final-cta__action" href={PROJECT_START_HREF}>Start your project</ButtonLink>
        </div>
        <BrandMark animated className="living-final-cta__mark" />
      </Container>
    </section>
  );
}
