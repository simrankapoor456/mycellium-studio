import { Container } from "@/components/ui/Container";

export function PhilosophySection() {
  return <section className="philosophy-system" id="philosophy"><Container>
    <div className="philosophy-system__intro"><span className="eyebrow">A living product system</span><h2 className="display-type">Understanding should keep moving through the work.</h2><p>Context becomes structure. Structure becomes action. What you learn returns to strengthen the next decision.</p></div>
    <div className="philosophy-system__flow" role="img" aria-label="Source context connects to discovery, requirements, work items, sprint groups, and reusable learning."><svg aria-hidden="true" viewBox="0 0 1000 310"><path d="M55 165C155 165 160 65 270 65S390 245 500 245 610 80 735 80 835 165 945 165" /><path d="M270 65C360 65 380 155 470 155M500 245C590 245 620 170 710 170" /></svg><ol><li><b>01</b><strong>Source context</strong><span>Everything you already know</span></li><li><b>02</b><strong>Discovery</strong><span>Material questions take root</span></li><li><b>03</b><strong>Requirements</strong><span>Decisions form structure</span></li><li><b>04</b><strong>Work items</strong><span>Traceable action branches out</span></li><li><b>05</b><strong>Learning returns</strong><span>The next cycle starts stronger</span></li></ol></div>
  </Container></section>;
}
