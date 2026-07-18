import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function PricingSection() {
  return (
    <section className="border-y border-line bg-surface py-24 sm:py-32" id="pricing">
      <Container>
        <SectionHeading
          description="Start with the secure personal project foundation. Collaboration and team administration remain a later phase."
          title="Begin personally. Grow deliberately."
        />
        <div className="mt-14 grid border border-line lg:grid-cols-2">
          <article className="p-7 sm:p-10 lg:border-r lg:border-line">
            <div className="flex items-center justify-between gap-4">
              <h3 className="display-type text-3xl text-forest">Personal</h3>
              <Badge tone="success">Available now</Badge>
            </div>
            <p className="mt-5 max-w-lg leading-7 text-ink/65">A private workspace for project foundations, metadata, ownership, and the upcoming guided discovery flow.</p>
            <ul className="mt-7 space-y-3 text-sm text-ink/75">
              <li>Secure email and password account</li>
              <li>User-owned projects and discovery persistence</li>
              <li>Deterministic planning and export foundation</li>
            </ul>
            <ButtonLink className="mt-8" href="/signup">Start free</ButtonLink>
          </article>
          <article className="bg-surface-quiet/55 p-7 sm:p-10">
            <div className="flex items-center justify-between gap-4">
              <h3 className="display-type text-3xl text-forest">Studio and Teams</h3>
              <Badge>Coming soon</Badge>
            </div>
            <p className="mt-5 max-w-lg leading-7 text-ink/65">Shared ownership, collaborative review, team controls, and organization-level administration are not yet available.</p>
            <Button className="mt-8" disabled variant="secondary">Coming soon</Button>
          </article>
        </div>
      </Container>
    </section>
  );
}
