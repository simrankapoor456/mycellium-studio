import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PROJECT_START_HREF } from "@/lib/marketing/links";

export function PricingSection() {
  return (
    <section className="border-y border-line bg-surface py-24 sm:py-32" id="pricing">
      <Container>
        <SectionHeading
          description="Billing and shared workspaces are not implemented. The current experience supports one owner and private projects."
          title="Personal access is the current product."
        />
        <div className="mt-14 grid border border-line lg:grid-cols-2">
          <article className="p-7 sm:p-10 lg:border-r lg:border-line">
            <div className="flex items-center justify-between gap-4">
              <h3 className="display-type text-3xl text-forest">Personal</h3>
              <Badge tone="success">Available now</Badge>
            </div>
            <p className="mt-5 max-w-lg leading-7 text-ink/65">A private product-intelligence workspace for discovery, review, editable blueprints, and portable exports.</p>
            <ul className="mt-7 space-y-3 text-sm text-ink/75">
              <li>Secure email and password account</li>
              <li>Adaptive discovery with visible product foundations</li>
              <li>Editable Product Blueprints with Markdown, JSON, and CSV exports</li>
            </ul>
            <ButtonLink className="mt-8" href={PROJECT_START_HREF}>Start your project</ButtonLink>
          </article>
          <article className="bg-surface-quiet/55 p-7 sm:p-10">
            <div className="flex items-center justify-between gap-4">
              <h3 className="display-type text-3xl text-forest">Shared workspaces</h3>
              <Badge>Not available</Badge>
            </div>
            <p className="mt-5 max-w-lg leading-7 text-ink/65">Shared ownership, collaborative review, team controls, and organization-level administration are not yet available.</p>
            <Button className="mt-8" disabled variant="secondary">Not available</Button>
          </article>
        </div>
      </Container>
    </section>
  );
}
