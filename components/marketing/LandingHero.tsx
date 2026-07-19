import { ProductGraphHero } from "@/components/marketing/ProductGraphHero";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function LandingHero() {
  return <section className="signature-hero overflow-hidden border-b border-line py-20 sm:py-28 lg:min-h-[calc(100dvh-5rem)] lg:py-24">
    <div aria-hidden="true" className="signature-hero__atmosphere" />
    <Container className="grid items-center gap-14 lg:grid-cols-[0.78fr_1.22fr] xl:gap-20">
      <div className="reveal max-w-3xl lg:py-12"><p className="mb-6 font-mono text-sm font-bold text-moss">Mycel Core · Product intelligence</p><h1 className="display-type balanced-text text-[clamp(3.5rem,7vw,8.5rem)] leading-[0.87] text-forest">Intelligence that <em>grows</em> with you.</h1><p className="mt-8 max-w-[62ch] text-xl leading-9 text-ink/70">Bring the scattered context. Mycel Core turns it into grounded discovery, traceable architecture, and a Product Blueprint that keeps its reasoning.</p><div className="mt-9 flex flex-wrap gap-3"><ButtonLink href="/signup">Start your project</ButtonLink><ButtonLink href="#how-it-works" variant="secondary">See how it works</ButtonLink></div><p className="mt-5 text-sm text-ink/70">Start privately. Use AI-guided discovery or Mycellium’s reliable built-in planning engine.</p></div>
      <ProductGraphHero />
    </Container>
  </section>;
}
