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
    <section className="scroll-story living-story" id="how-it-works">
      <Container>
        <header className="living-story__header">
          <h2>
            From scattered thoughts to a living product.
          </h2>
          <p>
            The original context stays visible while questions, requirements, boundaries, and an editable blueprint form around it.
          </p>
        </header>

        <div className="living-story__layout">
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
          <p>Context, discovery, structured understanding, architecture, and output remain connected in one reviewable product graph.</p>
        </noscript>
      </Container>
    </section>
  );
}
