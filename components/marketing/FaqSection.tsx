import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const questions = [
  ["What is Mycellium Studio?", "Mycellium Studio is an AI Product Architect in development. It is designed to help teams move from a rough idea through discovery, product architecture, requirements, and execution planning while keeping human review explicit."],
  ["How is this different from Jira or Linear?", "Jira and Linear manage understood work exceptionally well. Mycellium focuses on the earlier reasoning that establishes product context, scope, architecture, risks, and reviewable requirements before tickets become the center of gravity."],
  ["Is AI required?", "No. Mycellium's reliable built-in planning engine supports the complete discovery and blueprint path without an AI provider. When AI is configured, it adds another guided interpretation layer behind the same validated contracts."],
  ["What is Reliable mode?", "Reliable mode is Mycellium's deterministic planning engine. The same validated input produces the same structured result without randomness or an external model request."],
  ["How is project data handled?", "Personal projects use cookie-based authentication, server-side identity verification, ownership-scoped queries, and PostgreSQL row-level security. Provider API keys are not exposed to the browser."],
  ["Can I edit and export the output?", "Yes. The Product Blueprint is editable, every change is saved with lineage, and the current saved version can be downloaded as Markdown, JSON, or CSV."],
] as const;

export function FaqSection() {
  return (
    <section className="py-24 sm:py-32" id="faq">
      <Container className="grid gap-14 lg:grid-cols-[0.7fr_1.3fr]">
        <SectionHeading title="Questions worth answering before the work begins." />
        <div className="border-t border-line">
          {questions.map(([question, answer]) => (
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
