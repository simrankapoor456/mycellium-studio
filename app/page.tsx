import { FaqSection } from "@/components/marketing/FaqSection";
import { FinalCtaSection } from "@/components/marketing/FinalCtaSection";
import { JourneySection } from "@/components/marketing/JourneySection";
import { LandingHero } from "@/components/marketing/LandingHero";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingMotionProvider } from "@/components/marketing/MarketingMotionProvider";
import { PhilosophySection } from "@/components/marketing/PhilosophySection";
import { PricingSection } from "@/components/marketing/PricingSection";
import { ScrollProductNarrative } from "@/components/marketing/ScrollProductNarrative";
import { TrustSection } from "@/components/marketing/TrustSection";

export default function HomePage() {
  return (
    <MarketingMotionProvider>
      <div className="public-experience">
        <a className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-surface focus:px-4 focus:py-3" href="#main-content">
          Skip to main content
        </a>
        <MarketingHeader />
        <main id="main-content">
          <LandingHero />
          <ScrollProductNarrative />
          <JourneySection />
          <PhilosophySection />
          <TrustSection />
          <PricingSection />
          <FaqSection />
          <FinalCtaSection />
        </main>
        <MarketingFooter />
      </div>
    </MarketingMotionProvider>
  );
}
