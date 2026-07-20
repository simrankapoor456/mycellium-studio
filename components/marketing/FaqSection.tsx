import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const faqItems = [
  ["What is Mycellium Studio?", "Mycellium Studio is a personal product-intelligence workspace. It connects early context, discovery, reviewed foundations, architecture, and an editable Product Blueprint while keeping decisions visible."],
  ["How is this different from Jira or Linear?", "Jira and Linear manage understood work exceptionally well. Mycellium focuses on the earlier reasoning that establishes product context, scope, architecture, risks, and reviewable requirements before tickets become the center of gravity."],
  ["Is AI required?", "No. Mycellium can operate without an external AI provider through deterministic Reliable mode. When a provider is configured, it may enhance interpretation and generation while the same validation, review, and persistence boundaries continue to apply."],
  ["What is Reliable mode?", "Reliable mode is a typed deterministic fallback. It produces predictable, schema-valid planning output without an external model request; it is not presented as identical to AI-enhanced interpretation."],
  ["How is project data handled?", "Project access is authenticated and ownership-scoped. Server-side identity checks and PostgreSQL row-level security protect personal project data. Provider credentials remain server-side and are not exposed to the browser."],
  ["Can I edit and export the output?", "Yes. The Product Blueprint is editable, saved changes retain their source, and the current saved version can be downloaded as Markdown, JSON, or CSV."],
  ["What product types are supported?", "Mycellium includes validated choices for web, mobile, desktop, APIs, developer tools, connected hardware, and other product forms, plus a custom label. The workflow remains domain-agnostic."],
  ["Can I upload files?", "No. File upload is not supported. Source material is entered through the product's text fields and guided discovery flow."],
  ["Does Mycellium support shared workspaces?", "Not currently. Projects have one authenticated owner; shared ownership, collaboration, and organization administration are not available."],
  ["Is there billing or a paid plan?", "No billing flow is implemented. The Pricing section describes current access and unavailable shared-workspace capabilities without publishing a fabricated price."],
  ["Does it connect to external tools?", "No external integrations or publishing workflow are implemented. Markdown, JSON, and CSV downloads are the available portability paths."],
  ["Can I delete my account?", "Self-service account deletion is not implemented. The operator of the deployment must handle an account and owned-data removal request through a privileged server process."],
] as const;

export function FaqSection() {
  return (
    <section className="py-24 sm:py-32" id="faq">
      <Container className="grid gap-14 lg:grid-cols-[0.7fr_1.3fr]">
        <SectionHeading title="Questions worth answering before the work begins." />
        <div className="border-t border-line">
          {faqItems.map(([question, answer]) => (
            <details className="group border-b border-line" key={question}>
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-bold text-forest">
                {question}
                <span aria-hidden="true" className="text-gold transition-transform duration-200 group-open:rotate-45">+</span>
              </summary>
              <p className="max-w-[68ch] pb-6 pr-10 leading-7 text-ink/65">{answer}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
