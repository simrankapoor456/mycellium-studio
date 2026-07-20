import { AuthArchitectureMotif } from "@/components/auth/AuthArchitectureMotif";
import { BrandLogo } from "@/components/brand/BrandLogo";

const productPath = [
  ["Discover", "Clarify the idea, evidence, assumptions, and gaps."],
  ["Architect", "Develop requirements, boundaries, and decisions."],
  ["Execute", "Prepare reviewed work, risks, and sprint direction."],
] as const;

export function AuthValuePanel() {
  return (
    <aside className="auth-value-panel">
      <AuthArchitectureMotif />
      <BrandLogo light />
      <div className="mt-8 max-w-xl lg:my-20">
        <p className="auth-value-panel__kicker">Living product intelligence</p>
        <h2>Build the understanding beneath the plan.</h2>
        <p className="auth-value-panel__summary">A private workspace for developing product context before delivery structure takes over.</p>
        <dl className="auth-value-panel__path">
          {productPath.map(([term, description]) => (
            <div className="grid gap-2 py-5 sm:grid-cols-[7rem_1fr]" key={term}>
              <dt>{term}</dt><dd>{description}</dd>
            </div>
          ))}
        </dl>
      </div>
      <p className="auth-value-panel__note">Secure personal foundation available now.</p>
    </aside>
  );
}
