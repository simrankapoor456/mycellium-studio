"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

import { FoundationMapDetail } from "@/components/discovery/FoundationMapDetail";
import type { DiscoveryContext, ReadinessAssessment } from "@/lib/domain/discovery/schemas";
import { buildFoundationAreas, type FoundationArea } from "@/lib/discovery/foundation-map";
import { gsap, useGSAP } from "@/lib/motion/gsap-client";

type FoundationMapProps = Readonly<{
  context: DiscoveryContext;
  readiness: ReadinessAssessment;
  blockingTargetIds?: ReadonlySet<string>;
  onBlockerRef?: (targetId: string, element: HTMLElement | null) => void;
}>;

const FOUNDATION_POSITIONS = {
  users: { x: 16, y: 24, bendX: 35, bendY: 38 },
  problem: { x: 10, y: 57, bendX: 31, bendY: 54 },
  outcome: { x: 26, y: 84, bendX: 38, bendY: 68 },
  evidence: { x: 52, y: 12, bendX: 50, bendY: 34 },
  scope: { x: 85, y: 25, bendX: 67, bendY: 38 },
  feasibility: { x: 90, y: 61, bendX: 70, bendY: 56 },
  risks: { x: 73, y: 86, bendX: 62, bendY: 70 },
} as const;

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
      const paths = gsap.utils.toArray<SVGPathElement>(".foundation-map__connection");
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      timeline
        .set(paths, { strokeDasharray: 1, strokeDashoffset: 1 })
        .to(paths, { duration: 0.72, stagger: 0.07, strokeDashoffset: 0 })
        .from(".foundation-map__area", { duration: 0.32, opacity: 0, stagger: 0.05, y: 8 }, "-=0.48")
        .from(".foundation-map__core", { duration: 0.38, opacity: 0 }, "-=0.22");
      return () => timeline.revert();
    });
    return () => media.revert();
  }, { scope: mapRef });

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
    <section aria-label="Product foundation map" className="foundation-map foundation-map--living" ref={mapRef}>
      <header>
        <div><span className="eyebrow">Foundation Map</span><h2>See where the product is rooted.</h2></div>
        <p>Move through each area to see which relationships are stable, emerging, blocked, or unresolved.</p>
      </header>
      <div className="foundation-map__network">
        <svg aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 100 100">
          {areas.map((area) => {
            const position = FOUNDATION_POSITIONS[area.id];
            return (
              <path
                className="foundation-map__connection"
                d={`M50 50 Q${position.bendX} ${position.bendY} ${position.x} ${position.y}`}
                data-active={selected?.id === area.id}
                data-state={area.state}
                key={area.id}
                pathLength="1"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>
        <span className="foundation-map__core"><span>Mycel</span><strong>Core</strong></span>
        <div className="foundation-map__areas">
          {areas.map((area, index) => {
            const targetId = `foundation-area-${area.id}`;
            const position = FOUNDATION_POSITIONS[area.id];
            return (
              <button
                aria-describedby="foundation-map-detail"
                aria-label={`${area.label}, ${area.state}, ${area.facts.length} grounded facts`}
                aria-pressed={selected?.id === area.id}
                className="foundation-map__area"
                data-blocking={blockingTargetIds.has(targetId)}
                data-state={area.state}
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
                style={{ left: `${position.x}%`, top: `${position.y}%` }}
                type="button"
              >
                <span>{area.label}</span>
                <small>{area.state}</small>
              </button>
            );
          })}
        </div>
      </div>
      {selected ? <FoundationMapDetail area={selected} /> : null}
    </section>
  );
}
