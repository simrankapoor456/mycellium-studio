"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

import { FoundationMapDetail } from "@/components/discovery/FoundationMapDetail";
import type { DiscoveryContext, ReadinessAssessment } from "@/lib/domain/discovery/schemas";
import { buildFoundationAreas, type FoundationArea, type FoundationAreaState } from "@/lib/discovery/foundation-map";
import { gsap, useGSAP } from "@/lib/motion/gsap-client";

type FoundationMapProps = Readonly<{
  context: DiscoveryContext;
  readiness: ReadinessAssessment;
  blockingTargetIds?: ReadonlySet<string>;
  onBlockerRef?: (targetId: string, element: HTMLElement | null) => void;
}>;

const MAP_WIDTH = 960;
const MAP_HEIGHT = 560;
type FoundationAreaId = FoundationArea["id"];
const FOUNDATION_POSITIONS = {
  users: { x: 335, y: 72 },
  problem: { x: 350, y: 178 },
  outcome: { x: 365, y: 284 },
  evidence: { x: 350, y: 430 },
  scope: { x: 585, y: 112 },
  feasibility: { x: 610, y: 280 },
  risks: { x: 585, y: 430 },
} as const;

const TOPOLOGY_PATHS: ReadonlyArray<Readonly<{ id: string; d: string; areaIds: readonly FoundationAreaId[] }>> = [
  { id: "seed-root", d: "M92 280 C145 280 168 280 226 280", areaIds: ["users", "problem", "outcome", "evidence", "scope", "feasibility", "risks"] },
  { id: "root-users", d: "M226 280 C255 220 262 96 335 72", areaIds: ["users", "scope"] },
  { id: "root-problem", d: "M226 280 C272 268 282 188 350 178", areaIds: ["problem", "scope"] },
  { id: "root-outcome", d: "M226 280 C274 280 312 284 365 284", areaIds: ["outcome", "risks"] },
  { id: "root-evidence", d: "M226 280 C276 326 278 412 350 430", areaIds: ["evidence", "feasibility"] },
  { id: "users-scope", d: "M335 72 C430 46 488 82 585 112", areaIds: ["users", "scope"] },
  { id: "problem-scope", d: "M350 178 C442 160 488 122 585 112", areaIds: ["problem", "scope"] },
  { id: "evidence-feasibility", d: "M350 430 C468 424 500 300 610 280", areaIds: ["evidence", "feasibility"] },
  { id: "outcome-risks", d: "M365 284 C470 310 500 414 585 430", areaIds: ["outcome", "risks"] },
  { id: "scope-readiness", d: "M585 112 C700 116 694 218 782 256", areaIds: ["scope"] },
  { id: "feasibility-readiness", d: "M610 280 C672 280 720 266 782 256", areaIds: ["feasibility"] },
  { id: "risks-readiness", d: "M585 430 C704 416 698 300 782 256", areaIds: ["risks"] },
  { id: "readiness-blueprint", d: "M782 256 C830 256 850 256 902 256", areaIds: ["scope", "feasibility", "risks"] },
] as const;

export function FoundationMap({ context, readiness, blockingTargetIds = new Set(), onBlockerRef }: FoundationMapProps) {
  const areas = buildFoundationAreas(context, readiness);
  const [selectedId, setSelectedId] = useState(areas[0]?.id ?? "users");
  const selected = areas.find((area) => area.id === selectedId) ?? areas[0];
  const mapRef = useRef<HTMLElement>(null);
  const areaRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useGSAP(() => {
    if (process.env.NODE_ENV === "test") return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const paths = gsap.utils.toArray<SVGPathElement>(".foundation-map__path");
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      timeline
        .set(paths, { strokeDasharray: 1, strokeDashoffset: 1 })
        .to(paths, { duration: 0.68, stagger: 0.045, strokeDashoffset: 0 })
        .from(".foundation-map__stage-node", { duration: 0.34, opacity: 0, stagger: 0.06 }, "-=0.48")
        .from(".foundation-map__node", { duration: 0.3, opacity: 0, stagger: 0.045 }, "-=0.35");
      return () => timeline.revert();
    });
    return () => media.revert();
  }, { dependencies: [context.version], scope: mapRef });

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex = index;
    if (["ArrowRight", "ArrowDown"].includes(event.key)) nextIndex = (index + 1) % areas.length;
    else if (["ArrowLeft", "ArrowUp"].includes(event.key)) nextIndex = (index - 1 + areas.length) % areas.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = areas.length - 1;
    else return;

    event.preventDefault();
    setSelectedId(areas[nextIndex]?.id ?? selectedId);
    areaRefs.current[nextIndex]?.focus();
  }

  function handlePointerEnter(event: PointerEvent<HTMLButtonElement>, area: FoundationArea) {
    if (event.pointerType === "mouse") setSelectedId(area.id);
  }

  return (
    <section aria-label="Living product foundation" className="foundation-map foundation-map--living" ref={mapRef}>
      <header>
        <div><span className="eyebrow">Living Foundation</span><h2>Trace every branch back to intent.</h2></div>
        <p>Evidence grows into product boundaries, then converges into architecture readiness. Focus a node to follow its complete lineage.</p>
      </header>
      <div className="foundation-map__network">
        <svg aria-hidden="true" preserveAspectRatio="xMidYMid meet" viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}>
          {TOPOLOGY_PATHS.map((path) => (
            <path
              className="foundation-map__path"
              d={path.d}
              data-related={Boolean(selected && path.areaIds.includes(selected.id))}
              data-state={pathState(path.areaIds, areas)}
              key={path.id}
              pathLength="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        <span className="foundation-map__layer-label" style={{ left: "4%" }}>Original intent</span>
        <span className="foundation-map__layer-label" style={{ left: "22%" }}>Evidence roots</span>
        <span className="foundation-map__layer-label" style={{ left: "36%" }}>Foundation branches</span>
        <span className="foundation-map__layer-label" style={{ left: "78%" }}>Readiness</span>
        <span className="foundation-map__layer-label" style={{ left: "90%" }}>Blueprint</span>
        <span className="foundation-map__stage-node" data-stage="seed" style={{ left: `${(92 / MAP_WIDTH) * 100}%`, top: `${(280 / MAP_HEIGHT) * 100}%` }}><strong>Seed</strong><small>Intent</small></span>
        <span className="foundation-map__stage-node" data-stage="roots" style={{ left: `${(226 / MAP_WIDTH) * 100}%`, top: `${(280 / MAP_HEIGHT) * 100}%` }}><strong>Roots</strong><small>Evidence</small></span>
        <span className="foundation-map__stage-node" data-stage="readiness" style={{ left: `${(782 / MAP_WIDTH) * 100}%`, top: `${(256 / MAP_HEIGHT) * 100}%` }}><strong>{readiness.status === "ready" ? "Ready" : "Open"}</strong><small>Architecture</small></span>
        <span className="foundation-map__stage-node" data-stage="blueprint" style={{ left: `${(902 / MAP_WIDTH) * 100}%`, top: `${(256 / MAP_HEIGHT) * 100}%` }}><strong>Blueprint</strong><small>{context.approvalState === "approved" ? "Available next" : "After review"}</small></span>
        <div className="foundation-map__nodes">
          {areas.map((area, index) => {
            const targetId = `foundation-area-${area.id}`;
            const position = FOUNDATION_POSITIONS[area.id];
            const visualState = foundationVisualState(area, context);
            return (
              <button
                aria-describedby={`foundation-map-detail-${area.id}`}
                aria-label={`${area.label}, ${visualState}, ${area.facts.length} grounded facts`}
                aria-pressed={selected?.id === area.id}
                className="foundation-map__node"
                data-blocking={blockingTargetIds.has(targetId)}
                data-related={selected ? TOPOLOGY_PATHS.some((path) => path.areaIds.includes(selected.id) && path.areaIds.includes(area.id)) : false}
                data-selected={selected?.id === area.id}
                data-state={visualState}
                id={targetId}
                key={area.id}
                onClick={() => setSelectedId(area.id)}
                onFocus={() => setSelectedId(area.id)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                onPointerEnter={(event) => handlePointerEnter(event, area)}
                ref={(element) => {
                  areaRefs.current[index] = element;
                  onBlockerRef?.(targetId, element);
                }}
                style={{ left: `${(position.x / MAP_WIDTH) * 100}%`, top: `${(position.y / MAP_HEIGHT) * 100}%` }}
                type="button"
              >
                <span>{area.label}</span>
                <small>{visualState}</small>
              </button>
            );
          })}
        </div>
      </div>
      {selected ? <FoundationMapDetail area={selected} context={context} /> : null}
      <ol className="sr-only" aria-label="Foundation map text alternative">
        <li>Original product intent forms the seed.</li>
        <li>Evidence roots connect facts, questions, constraints, and assumptions.</li>
        {areas.map((area) => <li key={area.id}>{area.label}: {foundationVisualState(area, context)}. {area.facts.length} grounded facts. {area.gaps.length} open gaps.</li>)}
        <li>Scope, feasibility, and risk converge into architecture readiness.</li>
        <li>An approved foundation can become a persisted Product Blueprint.</li>
      </ol>
    </section>
  );
}

function pathState(areaIds: readonly string[], areas: readonly FoundationArea[]): FoundationAreaState {
  const states = areas.filter((area) => areaIds.includes(area.id)).map((area) => area.state);
  if (states.includes("blocked")) return "blocked";
  if (states.includes("rooted")) return "rooted";
  if (states.includes("emerging")) return "emerging";
  return "unresolved";
}

function foundationVisualState(area: FoundationArea, context: DiscoveryContext): "stable" | "emerging" | "unresolved" | "blocked" | "challenged" | "deferred" {
  const factIds = new Set(area.facts.map((fact) => fact.id));
  if (area.state === "blocked") return "blocked";
  if (context.challenges.some((challenge) => challenge.status === "open" && challenge.sourceFactIds.some((id) => factIds.has(id)))) return "challenged";
  if (area.facts.some((fact) => fact.status === "unknown" && context.acceptedUnknownFactIds.includes(fact.id))) return "deferred";
  if (area.state === "rooted") return "stable";
  return area.state;
}
