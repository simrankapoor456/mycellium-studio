"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
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

const NODE_POSITIONS = [
  { x: 52, y: 132 }, { x: 138, y: 82 }, { x: 224, y: 132 }, { x: 316, y: 66 },
  { x: 404, y: 132 }, { x: 494, y: 82 }, { x: 580, y: 132 }, { x: 668, y: 82 },
] as const;

export function ArchitectureReveal({ result, onComplete }: Readonly<{ result?: BlueprintGenerationResponse; onComplete: () => void }>) {
  const [stage, setStage] = useState(0);
  const completed = useRef(false);
  const counts = useMemo(() => {
    const blueprint = result?.blueprint;
    if (!blueprint) return STAGES.map(() => 0);
    return [
      blueprint.understanding.factIds.length,
      Math.max(0, blueprint.understanding.factIds.length - blueprint.understanding.unresolvedItems.length),
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
      const reducedTimer = window.setTimeout(finish, 180);
      return () => window.clearTimeout(reducedTimer);
    }

    const stageTimers = STAGES.slice(1).map((_, index) => window.setTimeout(() => setStage(index + 1), (index + 1) * 280));
    const finishTimer = window.setTimeout(finish, STAGES.length * 280 + 360);
    return () => {
      stageTimers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(finishTimer);
    };
  }, [finish]);

  return (
    <section aria-live="polite" className="architecture-reveal architecture-reveal--living">
      <div aria-hidden="true" className="architecture-reveal__field">
        <svg viewBox="0 0 720 210">
          {NODE_POSITIONS.slice(1).map((position, index) => {
            const previous = NODE_POSITIONS[index]!;
            return <path d={`M${previous.x} ${previous.y} C${previous.x + 36} ${previous.y}, ${position.x - 36} ${position.y}, ${position.x} ${position.y}`} data-active={index < stage} key={`${previous.x}-${position.x}`} pathLength="1" />;
          })}
          {NODE_POSITIONS.map((position, index) => (
            <g data-active={index <= stage} key={`${position.x}-${position.y}`} transform={`translate(${position.x} ${position.y})`}>
              <circle r={index === stage ? 20 : 15} />
              <text dy="4" textAnchor="middle">{counts[index]}</text>
            </g>
          ))}
        </svg>
      </div>
      <span className="eyebrow">Architecture formed</span>
      <h1>{STAGES[stage]}</h1>
      <p>{result ? MYCELLIUM_COPY.engineState[result.engineState] : "Mycel Core - Reliable mode"}. Built from the persisted foundation.</p>
      <Button onClick={finish} type="button">Open blueprint now</Button>
    </section>
  );
}

export { STAGES as ARCHITECTURE_REVEAL_STAGES };
