import { AuthArchitectureMotif } from "@/components/auth/AuthArchitectureMotif";
import { BrandLogo } from "@/components/brand/BrandLogo";

const productPath = [
  ["Discover", "Clarify the idea, evidence, assumptions, and gaps."],
  ["Architect", "Develop requirements, boundaries, and decisions."],
  ["Execute", "Prepare reviewed work, risks, and sprint direction."],
] as const;

export function AuthValuePanel() {
  return (
    <aside className="auth-value-panel bg-forest px-6 py-6 text-paper sm:px-10 sm:py-8 lg:flex lg:min-h-[100dvh] lg:flex-col lg:justify-between lg:px-14 lg:py-12">
      <AuthArchitectureMotif />
      <BrandLogo light />
      <div className="mt-8 max-w-xl lg:my-20">
        <p className="font-mono text-sm font-bold text-sage">AI Product Architect</p>
        <h2 className="display-type balanced-text mt-4 text-3xl leading-[1.02] sm:text-4xl lg:mt-5 lg:text-6xl">Build the understanding beneath the plan.</h2>
        <p className="mt-6 hidden max-w-lg text-lg leading-8 text-paper/70 sm:block">A private workspace for developing product context before the backlog becomes the product.</p>
        <dl className="mt-10 hidden divide-y divide-paper/20 border-y border-paper/20 lg:block">
          {productPath.map(([term, description]) => (
            <div className="grid gap-2 py-5 sm:grid-cols-[7rem_1fr]" key={term}>
              <dt className="font-bold text-sage">{term}</dt>
              <dd className="text-sm leading-6 text-paper/65">{description}</dd>
            </div>
          ))}
        </dl>
      </div>
      <p className="hidden text-sm text-paper/50 lg:block">Secure personal foundation available now.</p>
    </aside>
  );
}
