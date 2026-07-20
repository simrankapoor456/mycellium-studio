import { BrandMark } from "@/components/brand/BrandMark";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function FinalCtaSection() {
  return (
    <section className="final-cta living-final-cta">
      <Container className="living-final-cta__layout">
        <div>
          <h2>Give the next product decision a living foundation.</h2>
          <p>Bring the context you have. Keep every useful question, decision, and output connected as the product takes shape.</p>
          <ButtonLink className="final-cta__action" href="/signup">Start your project</ButtonLink>
        </div>
        <BrandMark animated className="living-final-cta__mark" />
      </Container>
    </section>
  );
}
