"use client";

import { useState } from "react";

import { FoundationMapDetail } from "@/components/discovery/FoundationMapDetail";
import type { DiscoveryContext, ReadinessAssessment } from "@/lib/domain/discovery/schemas";
import { buildFoundationAreas } from "@/lib/discovery/foundation-map";

type FoundationMapProps = Readonly<{
  context: DiscoveryContext;
  readiness: ReadinessAssessment;
  blockingTargetIds?: ReadonlySet<string>;
  onBlockerRef?: (targetId: string, element: HTMLElement | null) => void;
}>;

export function FoundationMap({ context, readiness, blockingTargetIds = new Set(), onBlockerRef }: FoundationMapProps) {
  const areas = buildFoundationAreas(context, readiness);
  const [selectedId, setSelectedId] = useState(areas[0]?.id ?? "users");
  const selected = areas.find((area) => area.id === selectedId) ?? areas[0];

  return (
    <section aria-label="Product foundation map" className="foundation-map">
      <header><div><span className="eyebrow">Foundation Map</span><h2>See where the product is rooted.</h2></div><p>Choose an area to inspect the facts and gaps shaping it.</p></header>
      <div className="foundation-map__network">
        <svg aria-hidden="true" viewBox="0 0 720 360"><path d="M360 180C250 180 220 66 106 66M360 180C250 180 206 180 80 180M360 180C250 180 220 294 106 294M360 180C470 180 500 66 614 66M360 180C470 180 514 180 640 180M360 180C470 180 500 294 614 294M360 180C360 245 360 270 360 330" /></svg>
        <span className="foundation-map__core">Mycel Core</span>
        <div className="foundation-map__areas">
          {areas.map((area) => {
            const targetId = `foundation-area-${area.id}`;
            return <button aria-pressed={selected?.id === area.id} data-blocking={blockingTargetIds.has(targetId)} data-state={area.state} id={targetId} key={area.id} onClick={() => setSelectedId(area.id)} ref={(element) => onBlockerRef?.(targetId, element)} type="button"><span>{area.label}</span><small>{area.state}</small></button>;
          })}
        </div>
      </div>
      {selected ? <FoundationMapDetail area={selected} /> : null}
    </section>
  );
}
