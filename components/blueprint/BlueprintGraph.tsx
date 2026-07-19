"use client";

import { useState } from "react";

import type { ProductBlueprint } from "@/lib/domain/blueprint/schemas";

type GraphEntity = { id: string; title: string; description: string; lineage: ProductBlueprint["goals"][number]["lineage"]; kind: string; manuallyEdited: boolean };

export function BlueprintGraph({ blueprint, onSelect }: { blueprint: ProductBlueprint; onSelect: (entity: GraphEntity) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const columns = [
    { label: "Goals", items: blueprint.goals },
    { label: "Requirements", items: blueprint.requirements },
    { label: "Architecture", items: blueprint.architectureDecisions },
    { label: "Epics", items: blueprint.epics },
    { label: "Stories", items: blueprint.stories },
    { label: "Tasks", items: blueprint.tasks },
    { label: "Sprints", items: blueprint.sprintPlan },
  ];
  function choose(item: ProductBlueprint["goals"][number], kind: string) { setSelected(item.id); onSelect({ ...item, kind }); }
  return <section className="blueprint-graph" aria-label="Visual Product Blueprint"><div className="blueprint-graph__track">{columns.map((column) => <section key={column.label}><header><span>{column.label}</span><small>{column.items.length}</small></header>{column.items.slice(0, 8).map((item) => <button aria-pressed={selected === item.id} key={item.id} onClick={() => choose(item, column.label)} type="button"><span>{item.id}</span><strong>{item.title}</strong><small>{item.lineage.source}</small></button>)}</section>)}</div></section>;
}
