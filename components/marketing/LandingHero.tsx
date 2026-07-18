import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function LandingHero() {
  return (
    <section className="overflow-hidden border-b border-line py-20 sm:py-28 lg:py-36">
      <Container className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="reveal max-w-3xl">
          <p className="mb-6 font-mono text-sm font-bold text-moss">AI Product Architect</p>
          <h1 className="display-type balanced-text text-[clamp(3.5rem,7vw,7.5rem)] leading-[0.9] text-forest">
            Give your product idea roots.
          </h1>
          <p className="mt-8 max-w-[62ch] text-xl leading-9 text-ink/70">
            Mycellium Studio helps founders and product teams develop rough ideas into grounded product understanding, architecture, scope, requirements, and execution plans.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="/signup">Start your project</ButtonLink>
            <ButtonLink href="#how-it-works" variant="secondary">See how it works</ButtonLink>
          </div>
          <p className="mt-5 text-sm text-ink/70">Secure personal workspace available now. AI-guided discovery arrives in Phase 3B.</p>
        </div>

        <div className="relative min-h-[29rem] border border-line bg-surface p-6 sm:p-9" aria-label="A rough idea becoming structured product work">
          <div className="max-w-xs border-b border-line pb-5">
            <p className="font-mono text-xs font-bold text-moss">Rough idea</p>
            <p className="mt-3 text-lg leading-7">“A better way for small teams to plan a product before tickets take over.”</p>
          </div>
          <svg aria-hidden="true" className="absolute inset-x-8 top-36 h-52 w-[calc(100%-4rem)] text-gold" viewBox="0 0 460 220">
            <path d="M230 5v55c0 40-80 23-80 73v28M230 60c0 40 90 20 90 73v28M150 133H65v43M320 133h78v43M230 60v123" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3"/>
            <g fill="currentColor"><circle cx="230" cy="5" r="6"/><circle cx="65" cy="176" r="6"/><circle cx="150" cy="161" r="6"/><circle cx="230" cy="183" r="6"/><circle cx="320" cy="161" r="6"/><circle cx="398" cy="176" r="6"/></g>
          </svg>
          <div className="absolute inset-x-6 bottom-6 grid grid-cols-2 gap-x-5 gap-y-4 sm:inset-x-9 sm:grid-cols-3">
            {["Requirements", "Architecture", "Scope", "Risks", "Stories", "Sprints"].map((label) => (
              <span className="border-t border-line-strong pt-2 text-sm font-bold text-forest" key={label}>{label}</span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
