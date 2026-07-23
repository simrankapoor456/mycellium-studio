"use client";

import { useEffect, useRef, useState } from "react";

import { SignatureGrowthVisual } from "@/components/marketing/SignatureGrowthVisual";
import { Container } from "@/components/ui/Container";
import { signatureStoryConfig, signatureStoryStages } from "@/lib/marketing/signature-experience";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion/gsap-client";

const finalStageIndex = signatureStoryStages.length - 1;

export function ScrollProductNarrative() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const sectionRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLElement>(null);
  const chapterListRef = useRef<HTMLOListElement>(null);
  const chapterRefs = useRef<Array<HTMLLIElement | null>>([]);
  const activeStage = signatureStoryStages[activeIndex] ?? signatureStoryStages[0];

  function updateActiveIndex(index: number) {
    if (activeIndexRef.current === index) return;
    activeIndexRef.current = index;
    setActiveIndex(index);
  }

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) {
      const frame = window.requestAnimationFrame(() => updateActiveIndex(finalStageIndex));
      return () => window.cancelAnimationFrame(frame);
    }

    const mobile = window.matchMedia("(max-width: 767px)");
    if (!mobile.matches || !("IntersectionObserver" in window)) return;

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

        if (nextIndex !== null) updateActiveIndex(nextIndex);
      },
      { rootMargin: "-18% 0px -48%", threshold: [0.2, 0.45, 0.7] },
    );

    for (const chapter of chapterRefs.current) if (chapter) observer.observe(chapter);
    return () => observer.disconnect();
  }, []);

  useGSAP(() => {
    if (process.env.NODE_ENV === "test") return;

    const media = gsap.matchMedia();

    media.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const chapterList = chapterListRef.current;
      if (!chapterList) return;

      const timeline = gsap.timeline({ paused: true });
      const stagedElements = gsap.utils.toArray<SVGElement>("[data-signature-growth] [data-level]");
      const growthPaths = gsap.utils.toArray<SVGPathElement>("[data-signature-growth] [data-growth-path]");
      const usefulFragments = gsap.utils.toArray<SVGGElement>("[data-signature-growth] [data-fragment][data-useful='true']");
      const noiseFragments = gsap.utils.toArray<SVGGElement>("[data-signature-growth] [data-fragment][data-useful='false']");
      gsap.set(stagedElements, { autoAlpha: 0 });
      gsap.set("[data-signature-growth] [data-level='0']", { autoAlpha: 1 });
      gsap.set(growthPaths, { strokeDasharray: 1, strokeDashoffset: 1 });

      timeline
        .addLabel("fragments", 0)
        .to("[data-signature-growth] [data-level='1']", { autoAlpha: 1, duration: 0.4, ease: "power2.out" }, 0.62)
        .to(usefulFragments, {
          duration: 0.86,
          ease: "power2.inOut",
          opacity: 0.62,
          x: (_, element) => Number(element.dataset.shiftX ?? 0),
          y: (_, element) => Number(element.dataset.shiftY ?? 0),
        }, 0.72)
        .to(noiseFragments, { duration: 0.7, ease: "power2.out", opacity: 0.16, x: 28 }, 0.72)
        .addLabel("attraction", 1)
        .to("[data-signature-growth] [data-level='2']", { autoAlpha: 1, duration: 0.55, ease: "power3.out" }, 1.62)
        .to(usefulFragments, { duration: 0.5, ease: "power2.in", opacity: 0.16, scale: 0.84, transformOrigin: "center" }, 1.75)
        .addLabel("intent", 2)
        .to("[data-signature-growth] [data-level='3']", { autoAlpha: 1, duration: 0.28, ease: "power2.out" }, 2.6)
        .to("[data-signature-growth] .signature-growth__germination [data-growth-path]", { duration: 0.58, ease: "power2.inOut", strokeDashoffset: 0 }, 2.72)
        .to("[data-signature-growth] .signature-growth__seed-shell--left", { duration: 0.62, ease: "power3.out", rotation: -8, transformOrigin: "100% 70%", x: -7 }, 2.78)
        .to("[data-signature-growth] .signature-growth__seed-shell--right", { duration: 0.62, ease: "power3.out", rotation: 8, transformOrigin: "0% 70%", x: 7 }, 2.78)
        .addLabel("germination", 3)
        .to("[data-signature-growth] [data-level='4']", { autoAlpha: 1, duration: 0.12 }, 3.55)
        .to("[data-signature-growth] [data-path-kind='primary']", { duration: 1.05, ease: "power1.inOut", strokeDashoffset: 0 }, 3.62)
        .addLabel("primary-root", 4)
        .to("[data-signature-growth] [data-level='5']", { autoAlpha: 1, duration: 0.12 }, 4.48)
        .to("[data-signature-growth] [data-path-kind='branch']", { duration: 0.96, ease: "power1.inOut", stagger: 0.065, strokeDashoffset: 0 }, 4.55)
        .addLabel("evidence-branches", 5)
        .to("[data-signature-growth] [data-level='6']", { autoAlpha: 1, duration: 0.12 }, 5.45)
        .to("[data-signature-growth] [data-path-kind='connection']", { duration: 0.75, ease: "power1.inOut", stagger: 0.07, strokeDashoffset: 0 }, 5.5)
        .addLabel("connections", 6)
        .to("[data-signature-growth] [data-level='7']", { autoAlpha: 1, duration: 0.58, ease: "power3.out", stagger: 0.025 }, 6.55)
        .addLabel("foundation-areas", 7)
        .to("[data-signature-growth] [data-level='8']", { autoAlpha: 1, duration: 0.55, ease: "power3.out" }, 7.52)
        .to("[data-signature-growth] .signature-growth__shoot", { duration: 0.64, ease: "power2.inOut", strokeDashoffset: 0 }, 7.55)
        .to("[data-signature-growth] .signature-growth__root--primary", { duration: 0.5, ease: "power2.out", filter: "drop-shadow(0 0 7px rgba(185, 237, 102, 0.24))" }, 7.62)
        .to("[data-signature-growth] [data-fragment]", { duration: 0.45, ease: "power2.out", opacity: 0.06 }, 7.58)
        .addLabel("foundation", 8);

      const chapterTriggers = chapterRefs.current.flatMap((chapter, index) => chapter ? [ScrollTrigger.create({
        end: "bottom 38%",
        onEnter: () => updateActiveIndex(index),
        onEnterBack: () => updateActiveIndex(index),
        start: "top 62%",
        trigger: chapter,
      })] : []);

      const progressTrigger = ScrollTrigger.create({
        animation: timeline,
        end: "bottom 50%",
        invalidateOnRefresh: true,
        scrub: signatureStoryConfig.scrollScrub,
        start: "top 50%",
        trigger: chapterList,
      });

      return () => {
        chapterTriggers.forEach((trigger) => trigger.kill());
        progressTrigger.kill();
        timeline.revert();
      };
    });

    media.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const section = sectionRef.current;
      const visual = visualRef.current;
      const lastChapter = chapterRefs.current.at(-1);
      if (!section || !visual || !lastChapter) return;

      const pinTrigger = ScrollTrigger.create({
        end: () => `+=${Math.max(0, lastChapter.getBoundingClientRect().bottom - section.getBoundingClientRect().top - window.innerHeight * 0.62)}`,
        invalidateOnRefresh: true,
        pin: visual,
        pinSpacing: false,
        start: "top 112px",
        trigger: section.querySelector(".living-story__layout") ?? section,
      });

      return () => pinTrigger.kill();
    });

    media.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set("[data-signature-growth] [data-level]", { autoAlpha: 1 });
      gsap.set("[data-signature-growth] [data-growth-path]", { strokeDasharray: 1, strokeDashoffset: 0 });
      updateActiveIndex(finalStageIndex);
    });

    return () => media.revert();
  }, { scope: sectionRef });

  useGSAP(() => {
    if (process.env.NODE_ENV === "test" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(
      ".scroll-story__caption > *",
      { opacity: 0, y: 7 },
      { duration: 0.38, ease: "power3.out", opacity: 1, stagger: 0.04, y: 0 },
    );
  }, { dependencies: [activeIndex], scope: sectionRef });

  function selectChapter(index: number, scrollToChapter: boolean) {
    updateActiveIndex(index);
    if (!scrollToChapter || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const chapter = chapterRefs.current[index];
    if (typeof chapter?.scrollIntoView === "function") {
      chapter.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  return (
    <section
      className="scroll-story living-story"
      data-desktop-pin="true"
      data-mobile-mode="vertical"
      id="how-it-works"
      ref={sectionRef}
    >
      <a className="living-story__skip" href="#living-story-end">Skip the product story</a>
      <Container>
        <header className="living-story__header">
          <span className="eyebrow">Seed to Foundation</span>
          <h2>From scattered signals to a Foundation.</h2>
          <p>Follow one product intent as evidence takes root, uncertainty stays visible, and a reviewable Foundation forms.</p>
        </header>

        <div className="living-story__layout">
          <div className="scroll-story__visual-column">
            <figure
              aria-describedby="signature-story-caption"
              className="scroll-story__visual spatial-surface"
              data-story-phase={activeStage.id}
              ref={visualRef}
            >
              <div aria-hidden="true" className="scroll-story__root-field"><span /><span /><span /></div>
              <div className="scroll-story__visual-header">
                <span>{activeStage.label}</span>
                <span
                  aria-label={`Stage ${activeIndex + 1} of ${signatureStoryStages.length}`}
                  aria-valuemax={signatureStoryStages.length}
                  aria-valuemin={1}
                  aria-valuenow={activeIndex + 1}
                  role="progressbar"
                >
                  {String(activeIndex + 1).padStart(2, "0")} / {signatureStoryStages.length}
                </span>
              </div>
              <SignatureGrowthVisual activeIndex={activeIndex} label={activeStage.label} />
              <div aria-hidden="true" className="scroll-story__progress">
                {signatureStoryStages.map((stage, index) => (
                  <span data-complete={index <= activeIndex} data-current={index === activeIndex} key={stage.id} />
                ))}
              </div>
              <figcaption className="scroll-story__caption" id="signature-story-caption">
                <small>{activeStage.artifact}</small>
                <strong>{activeStage.title}</strong>
                <span>{activeStage.description}</span>
              </figcaption>
            </figure>
          </div>

          <ol aria-label="Seed to Foundation story" className="scroll-story__chapters" ref={chapterListRef}>
            {signatureStoryStages.map((stage, index) => (
              <li
                className="scroll-story__chapter"
                data-active={index === activeIndex}
                data-story-index={index}
                key={stage.id}
                ref={(element) => { chapterRefs.current[index] = element; }}
              >
                <button
                  aria-current={index === activeIndex ? "step" : undefined}
                  aria-pressed={index === activeIndex}
                  className="scroll-story__chapter-control"
                  onClick={() => selectChapter(index, true)}
                  onFocus={() => selectChapter(index, false)}
                  type="button"
                >
                  <span className="scroll-story__chapter-label">Stage {String(index + 1).padStart(2, "0")} · {stage.label}</span>
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
          <p>Fragmented inputs gather around intent, evidence grows through traceable roots, and a reviewable Foundation forms with confirmed, emerging, unknown, and blocked areas kept explicit.</p>
        </noscript>
      </Container>
    </section>
  );
}
