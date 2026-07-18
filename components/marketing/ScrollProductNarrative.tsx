"use client";

import { useEffect, useRef, useState } from "react";

import { ProductGraph } from "@/components/marketing/diagrams/ProductGraph";
import { Container } from "@/components/ui/Container";
import { signatureStoryStages } from "@/lib/marketing/signature-experience";

export function ScrollProductNarrative() {
  const [activeIndex, setActiveIndex] = useState(0);
  const chapterRefs = useRef<Array<HTMLLIElement | null>>([]);
  const activeStage = signatureStoryStages[activeIndex] ?? signatureStoryStages[0];

  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        let nextIndex: number | null = null;
        let strongestRatio = 0;

        for (const entry of entries) {
          if (!entry.isIntersecting || entry.intersectionRatio < strongestRatio) {
            continue;
          }

          if (!(entry.target instanceof HTMLElement)) {
            continue;
          }

          const candidateIndex = Number(entry.target.dataset.storyIndex);

          if (!Number.isInteger(candidateIndex) || candidateIndex < 0 || candidateIndex >= signatureStoryStages.length) {
            continue;
          }

          nextIndex = candidateIndex;
          strongestRatio = entry.intersectionRatio;
        }

        if (nextIndex !== null) {
          setActiveIndex(nextIndex);
        }
      },
      { rootMargin: "-28% 0px -42%", threshold: [0.2, 0.45, 0.7] },
    );

    for (const chapter of chapterRefs.current) {
      if (chapter) {
        observer.observe(chapter);
      }
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="scroll-story border-b border-line py-24 sm:py-32" id="how-it-works">
      <Container>
        <header className="max-w-4xl">
          <p className="font-mono text-sm font-bold text-moss">Living Architecture</p>
          <h2 className="display-type balanced-text mt-5 text-[clamp(2.75rem,6vw,6.5rem)] leading-[0.94] text-forest">
            Watch ambiguity become a connected product system.
          </h2>
          <p className="mt-7 max-w-[64ch] text-lg leading-8 text-ink/70">
            The same seed remains visible while questions, requirements, system boundaries, and delivery work gain structure around it.
          </p>
        </header>

        <div className="mt-16 grid items-start gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <figure className="scroll-story__visual spatial-surface">
            <div className="scroll-story__visual-header">
              <span>{activeStage.label}</span>
              <span>{activeStage.artifact}</span>
            </div>
            <ProductGraph
              activeLevel={activeStage.level}
              ariaLabel={`Product graph at the ${activeStage.label.toLowerCase()} stage`}
            />
            <figcaption className="scroll-story__caption">
              <strong>{activeStage.title}</strong>
              <span>{activeStage.description}</span>
            </figcaption>
          </figure>

          <ol className="scroll-story__chapters">
            {signatureStoryStages.map((stage, index) => (
              <li
                className="scroll-story__chapter"
                data-active={index === activeIndex}
                data-story-index={index}
                key={stage.id}
                ref={(element) => {
                  chapterRefs.current[index] = element;
                }}
              >
                <button
                  aria-pressed={index === activeIndex}
                  className="scroll-story__chapter-control"
                  onClick={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
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
        <noscript>
          <p className="mt-8 text-sm text-ink/70">Seed, discovery, structured understanding, architecture, and execution remain connected in one reviewable product graph.</p>
        </noscript>
      </Container>
    </section>
  );
}
