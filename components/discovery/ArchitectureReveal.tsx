"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { BlueprintGenerationResponse } from "@/lib/domain/blueprint/schemas";
import { MYCELLIUM_COPY } from "@/lib/voice/mycellium";

const STAGES = [
  "Foundation nodes gather",
  "Confirmed facts stabilize",
  "Requirements emerge",
  "Architecture relationships connect",
  "Scope boundaries appear",
  "Epics branch from requirements",
  "Stories and tasks unfold",
  "Sprint groups settle",
] as const;

export function ArchitectureReveal({ result, onComplete }: Readonly<{ result?: BlueprintGenerationResponse; onComplete: () => void }>) {
  const [stage, setStage] = useState(0);
  const completed = useRef(false);
  const counts = useMemo(() => {
    const blueprint = result?.blueprint;
    if (!blueprint) return STAGES.map(() => 0);
    return [
      blueprint.understanding.factIds.length,
      blueprint.understanding.factIds.length - blueprint.understanding.unresolvedItems.length,
      blueprint.requirements.length,
      blueprint.architectureDecisions.length,
      blueprint.scope.inScope.length + blueprint.scope.outOfScope.length,
      blueprint.epics.length,
      blueprint.stories.length + blueprint.tasks.length,
      blueprint.sprintPlan.length,
    ];
  }, [result]);

  const finish = useCallback(() => {
    if (completed.current) return;
    completed.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const reducedTimer = window.setTimeout(finish, 300);
      return () => window.clearTimeout(reducedTimer);
    }

    const timer = window.setInterval(() => {
      setStage((current) => {
        if (current >= STAGES.length - 1) {
          window.clearInterval(timer);
          window.setTimeout(finish, 280);
          return current;
        }
        return current + 1;
      });
    }, 320);
    return () => window.clearInterval(timer);
  }, [finish]);

  return (
    <section aria-live="polite" className="architecture-reveal">
      <div aria-hidden="true" className="architecture-reveal__network">
        {STAGES.map((label, index) => <span data-active={index <= stage} key={label}>{counts[index]}</span>)}
      </div>
      <span className="eyebrow">Architecture is ready</span>
      <h1>{STAGES[stage]}</h1>
      <p>{result ? MYCELLIUM_COPY.engineState[result.engineState] : "Mycel Core · Reliable mode"} · built from your persisted foundation.</p>
      <button onClick={finish} type="button">Skip animation and open blueprint</button>
    </section>
  );
}

export { STAGES as ARCHITECTURE_REVEAL_STAGES };
