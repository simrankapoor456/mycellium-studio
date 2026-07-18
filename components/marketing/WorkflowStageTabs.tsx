"use client";

import { useRef } from "react";

import { cn } from "@/lib/class-names";
import { productStages, type ProductStageId } from "@/lib/marketing/stages";

type WorkflowStageTabsProps = {
  activeStageId: ProductStageId;
  onStageChange: (stageId: ProductStageId) => void;
};

export function WorkflowStageTabs({ activeStageId, onStageChange }: WorkflowStageTabsProps) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function moveFocus(nextIndex: number) {
    const normalizedIndex = (nextIndex + productStages.length) % productStages.length;
    const nextStage = productStages[normalizedIndex];

    if (!nextStage) {
      return;
    }

    onStageChange(nextStage.id);
    buttonRefs.current[normalizedIndex]?.focus();
  }

  return (
    <div aria-label="Product journey" className="workflow-tabs" role="tablist">
      {productStages.map((stage, index) => {
        const isActive = stage.id === activeStageId;

        return (
          <button
            aria-controls={`stage-panel-${stage.id}`}
            aria-selected={isActive}
            className={cn("workflow-tabs__control", isActive && "workflow-tabs__control--active")}
            id={`stage-tab-${stage.id}`}
            key={stage.id}
            onClick={() => onStageChange(stage.id)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" || event.key === "ArrowRight") {
                event.preventDefault();
                moveFocus(index + 1);
              }

              if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
                event.preventDefault();
                moveFocus(index - 1);
              }

              if (event.key === "Home") {
                event.preventDefault();
                moveFocus(0);
              }

              if (event.key === "End") {
                event.preventDefault();
                moveFocus(productStages.length - 1);
              }
            }}
            ref={(element) => {
              buttonRefs.current[index] = element;
            }}
            role="tab"
            tabIndex={isActive ? 0 : -1}
            type="button"
          >
            <span>{stage.label}</span>
            <small>{stage.summary}</small>
          </button>
        );
      })}
    </div>
  );
}
