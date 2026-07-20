"use client";

import { useState } from "react";

import { ArchitectWorkflowStage } from "@/components/marketing/ArchitectWorkflowStage";
import { DiscoverWorkflowStage } from "@/components/marketing/DiscoverWorkflowStage";
import { ExecuteWorkflowStage } from "@/components/marketing/ExecuteWorkflowStage";
import { WorkflowStageTabs } from "@/components/marketing/WorkflowStageTabs";
import { findProductStage, type ProductStageId } from "@/lib/marketing/stages";

export function ProductStageExperience() {
  const [activeStageId, setActiveStageId] = useState<ProductStageId>("discover");
  const activeStage = findProductStage(activeStageId);
  let stageContent = <DiscoverWorkflowStage />;

  if (activeStageId === "architect") {
    stageContent = <ArchitectWorkflowStage />;
  }

  if (activeStageId === "execute") {
    stageContent = <ExecuteWorkflowStage />;
  }

  return (
    <div className="product-workflow">
      <WorkflowStageTabs activeStageId={activeStageId} onStageChange={setActiveStageId} />
      <section
        aria-labelledby={`stage-tab-${activeStage.id}`}
        className="product-workflow__panel spatial-surface"
        id={`stage-panel-${activeStage.id}`}
        key={activeStage.id}
        role="tabpanel"
        tabIndex={0}
      >
        {stageContent}
      </section>
    </div>
  );
}
