import { FoundationPreview } from "@/components/marketing/FoundationPreview";
import { Hero } from "@/components/marketing/Hero";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { generatePlan } from "@/lib/planner/generate-plan";

const samplePlan = generatePlan({
  brief:
    "Build a calm planning tool for small product teams that turns a rough software brief into sprint-ready stories, review questions, and downloadable plan files.",
  projectName: "mycellium studio",
  projectType: "ai-product",
  teamSize: 3,
  sprintDurationWeeks: 2,
  sprintCapacityPoints: 24,
  planningDepth: "balanced",
});

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-canvas text-ink">
      <SiteHeader />
      <Hero />
      <FoundationPreview plan={samplePlan} />
      <SiteFooter />
    </main>
  );
}
