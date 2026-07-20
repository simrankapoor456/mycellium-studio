"use client";

import { useMemo } from "react";

import type { ProjectFormValues } from "@/lib/domain/project/form-values";

const STAGES = ["Seed", "Facts", "Questions", "Requirements", "Stories", "Blueprint"] as const;

export function FoundationPreview({ values }: { values: ProjectFormValues }) {
  const activeIndex = useMemo(() => {
    if (!values.name.trim()) return 0;
    if (!values.description.trim()) return 1;
    if (values.description.trim().length < 80) return 2;
    if (!values.teamSize || !values.sprintLength) return 3;
    if (values.description.trim().length < 160) return 4;
    return 5;
  }, [values.description, values.name, values.sprintLength, values.teamSize]);

  return (
    <aside aria-label="Foundation preview" className="foundation-preview">
      <div>
        <span>What grows from this</span>
        <strong>{values.name.trim() || "Your idea"}</strong>
        <p>This is a structural preview, not generated output. Discovery will replace these placeholders with grounded product understanding.</p>
      </div>
      <ol aria-label={`Current preview stage: ${STAGES[activeIndex]}`}>
        {STAGES.map((stage, index) => (
          <li data-active={index <= activeIndex} data-current={index === activeIndex} key={stage}>
            <span aria-hidden="true" />
            <strong>{stage}</strong>
          </li>
        ))}
      </ol>
      <p aria-live="polite" className="foundation-preview__status">{previewMessage(activeIndex)}</p>
    </aside>
  );
}

function previewMessage(activeIndex: number): string {
  return [
    "Give the idea a name to plant the seed.",
    "The seed is named. Add context so facts can take root.",
    "Early context is forming useful questions.",
    "The foundation can now surface requirements.",
    "Enough structure exists to shape product stories.",
    "The starting context is ready for guided discovery.",
  ][activeIndex] ?? "The idea is taking shape.";
}
