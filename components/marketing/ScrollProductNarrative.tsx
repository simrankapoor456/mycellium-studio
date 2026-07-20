"use client";

import { useEffect, useRef, useState } from "react";

import { SignatureGrowthVisual } from "@/components/marketing/SignatureGrowthVisual";
import { Container } from "@/components/ui/Container";
import { signatureStoryConfig, signatureStoryStages } from "@/lib/marketing/signature-experience";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion/gsap-client";

export function ScrollProductNarrative() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const chapterRefs = useRef<Array<HTMLLIElement | null>>([]);
  const activeStage = signatureStoryStages[activeIndex] ?? signatureStoryStages[0];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = window.requestAnimationFrame(() => setActiveIndex(signatureStoryStages.length - 1));
      return () => window.cancelAnimationFrame(frame);
    }
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let nextIndex: number | null = null;
        let strongestRatio = 0;

        for (const entry of entries) {
          if (!entry.isIntersecting || entry.intersectionRatio < strongestRatio || !(entry.target instanceof HTMLElement)) continue;
          const candidateIndex = Number(entry.target.dataset.storyIndex);
          if (!Number.isInteger(candidateIndex) || candidateIndex < 0 || candidateIndex >= signatureStoryStages.length) continue;
          nextIndex = candidateIndex;
          strongestRatio = entry.intersectionRatio;
        }

        if (nextIndex !== null) setActiveIndex(nextIndex);
      },
      { rootMargin: "-28% 0px -42%", threshold: [0.2, 0.45, 0.7] },
    );

    for (const chapter of chapterRefs.current) if (chapter) observer.observe(chapter);
    return () => observer.disconnect();
  }, []);

  useGSAP(() => {
    if (process.env.NODE_ENV === "test") return;

    const media = gsap.matchMedia();
    media.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const section = sectionRef.current;
      if (!section) return;

      const triggers = chapterRefs.current.flatMap((chapter, index) => chapter ? [ScrollTrigger.create({
        trigger: chapter,
        start: "top 62%",
        end: "bottom 38%",
        onEnter: () => setActiveIndex(index),
        onEnterBack: () => setActiveIndex(index),
      })] : []);

      const storyTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 78%",
          end: "bottom 22%",
          scrub: signatureStoryConfig.scrollScrub,
        },
      });

      storyTimeline
        .fromTo(".scroll-story__root-field", { opacity: 0.45, scale: 0.96 }, { ease: "none", opacity: 0.9, scale: 1.04 })
        .fromTo(".scroll-story__visual", { borderColor: "rgba(185, 237, 102, 0.16)" }, { borderColor: "rgba(185, 237, 102, 0.42)", ease: "none" }, 0);

      return () => {
        triggers.forEach((trigger) => trigger.kill());
        storyTimeline.scrollTrigger?.kill();
      };
    });

    return () => media.revert();
  }, { scope: sectionRef });

  useGSAP(() => {
    if (process.env.NODE_ENV === "test" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(
      ".scroll-story__caption > *",
      { opacity: 0, y: 8 },
      { duration: 0.42, ease: "power3.out", opacity: 1, stagger: 0.045, y: 0 },
    );
  }, { dependencies: [activeIndex], scope: sectionRef });

  function selectChapter(index: number) {
    setActiveIndex(index);
  }

  return (
    <section className="scroll-story living-story" id="how-it-works" ref={sectionRef}>
      <a className="living-story__skip" href="#living-story-end">Skip the product story</a>
      <Container>
        <header className="living-story__header">
          <h2>From first signal to useful product value.</h2>
          <p>Follow one intent through evidence, judgment, architecture, a Product Blueprint, and the learning that begins the next cycle.</p>
        </header>

        <div className="living-story__layout">
          <figure className="scroll-story__visual spatial-surface" data-story-phase={activeStage.id}>
            <div aria-hidden="true" className="scroll-story__root-field"><span /><span /><span /></div>
            <div className="scroll-story__visual-header">
              <span>{activeStage.label}</span>
              <span>{String(activeIndex + 1).padStart(2, "0")} / {signatureStoryStages.length}</span>
            </div>
            <SignatureGrowthVisual activeIndex={activeIndex} label={activeStage.label} />
            <figcaption className="scroll-story__caption">
              <small>{activeStage.artifact}</small>
              <strong>{activeStage.title}</strong>
              <span>{activeStage.description}</span>
            </figcaption>
          </figure>

          <ol aria-label="Living product story" className="scroll-story__chapters" data-native-scroll>
            {signatureStoryStages.map((stage, index) => (
              <li
                className="scroll-story__chapter"
                data-active={index === activeIndex}
                data-story-index={index}
                key={stage.id}
                ref={(element) => { chapterRefs.current[index] = element; }}
              >
                <button
                  aria-pressed={index === activeIndex}
                  className="scroll-story__chapter-control"
                  onClick={() => selectChapter(index)}
                  onFocus={() => selectChapter(index)}
                  type="button"
                >
                  <span className="scroll-story__chapter-label">{stage.label}</span>
                  <strong>{stage.title}</strong>
                  <span>{stage.description}</span>
                  <small>{stage.artifact}</small>
                </button>
              </li>
            ))}
          </ol>
        </div>
        <span aria-hidden="true" id="living-story-end" />
        <noscript>
          <p>Context, evidence, foundation, architecture, blueprint, and execution remain connected as the product learns.</p>
        </noscript>
      </Container>
    </section>
  );
}
