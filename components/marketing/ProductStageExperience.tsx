"use client";

import { useRef, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { findProductStage, productStages, type ProductStageId } from "@/lib/marketing/stages";

export function ProductStageExperience() {
  const [activeStageId, setActiveStageId] = useState<ProductStageId>("discover");
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeStage = findProductStage(activeStageId);

  function moveFocus(currentIndex: number, nextIndex: number) {
    const normalizedIndex = (nextIndex + productStages.length) % productStages.length;
    const nextStage = productStages[normalizedIndex];

    if (!nextStage) {
      return;
    }

    setActiveStageId(nextStage.id);
    buttonRefs.current[normalizedIndex]?.focus();
  }

  return (
    <div className="grid gap-7 lg:grid-cols-[19rem_1fr]">
      <div aria-label="Product journey" className="grid gap-2" role="tablist">
        {productStages.map((stage, index) => {
          const isActive = stage.id === activeStageId;

          return (
            <button
              aria-controls={`stage-panel-${stage.id}`}
              aria-selected={isActive}
              className={
                isActive
                  ? "min-h-16 border-l-2 border-gold bg-surface px-5 py-4 text-left text-forest"
                  : "min-h-16 border-l-2 border-line px-5 py-4 text-left text-ink/70 transition-colors hover:bg-surface/60 hover:text-forest"
              }
              id={`stage-tab-${stage.id}`}
              key={stage.id}
              onClick={() => setActiveStageId(stage.id)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown" || event.key === "ArrowRight") {
                  event.preventDefault();
                  moveFocus(index, index + 1);
                }

                if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
                  event.preventDefault();
                  moveFocus(index, index - 1);
                }

                if (event.key === "Home") {
                  event.preventDefault();
                  moveFocus(index, 0);
                }

                if (event.key === "End") {
                  event.preventDefault();
                  moveFocus(index, productStages.length - 1);
                }
              }}
              ref={(element) => {
                buttonRefs.current[index] = element;
              }}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              type="button"
            >
              <span className="block font-bold">{stage.label}</span>
              <span className="mt-1 block text-sm leading-5">{stage.summary}</span>
            </button>
          );
        })}
      </div>

      <div
        aria-labelledby={`stage-tab-${activeStage.id}`}
        className="min-w-0 border border-line bg-surface p-5 sm:p-8"
        id={`stage-panel-${activeStage.id}`}
        key={activeStage.id}
        role="tabpanel"
        tabIndex={0}
      >
        <div className="grid gap-7 xl:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Badge tone="warning">Same product idea</Badge>
            <p className="mt-5 text-lg leading-8 text-ink">“{activeStage.prompt}”</p>
            <svg aria-hidden="true" className="mt-8 h-28 w-full text-gold" viewBox="0 0 300 110">
              <path
                className="root-path"
                d="M8 20c55 0 42 72 101 72s45-57 91-57 37 50 92 50"
                fill="none"
                pathLength="1"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="3"
              />
              <circle cx="8" cy="20" fill="currentColor" r="6" />
              <circle cx="109" cy="92" fill="currentColor" r="6" />
              <circle cx="200" cy="35" fill="currentColor" r="6" />
              <circle cx="292" cy="85" fill="currentColor" r="6" />
            </svg>
          </div>
          <div>
            <p className="font-mono text-xs font-bold text-moss">{activeStage.resultLabel}</p>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {activeStage.result.map((item) => (
                <li className="py-4 leading-7 text-ink/75" key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
