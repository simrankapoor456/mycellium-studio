"use client";

import { useState } from "react";

import { BlueprintEntityEditor } from "@/components/blueprint/BlueprintEntityEditor";
import { BlueprintExportPanel } from "@/components/blueprint/BlueprintExportPanel";
import { BlueprintGraph } from "@/components/blueprint/BlueprintGraph";
import type { BlueprintEntityType, ProductBlueprint } from "@/lib/domain/blueprint/schemas";
import type { DiscoveryFact } from "@/lib/domain/discovery/schemas";

type BaseEntity = ProductBlueprint["goals"][number] & { acceptanceCriteria?: string[]; sprintId?: string | null };
type Selected = BaseEntity & { kind: string };

export function BlueprintWorkspace({ projectId, projectName, initialBlueprint, facts }: { projectId: string; projectName: string; initialBlueprint: ProductBlueprint; facts: DiscoveryFact[] }) {
  const [blueprint, setBlueprint] = useState(initialBlueprint); const [mode, setMode] = useState<"blueprint" | "document">("blueprint"); const [selected, setSelected] = useState<Selected | null>(null);
  const factMap = new Map(facts.map((fact) => [fact.id, fact]));
  const sections: Array<{ id: string; title: string; type: BlueprintEntityType; items: BaseEntity[] }> = [
    { id: "goals", title: "Goals", type: "goal", items: blueprint.goals },
    { id: "requirements", title: "Requirements", type: "requirement", items: blueprint.requirements },
    { id: "architecture", title: "Architecture", type: "architecture", items: blueprint.architectureDecisions },
    { id: "scope", title: "Scope", type: "scope", items: [...blueprint.scope.inScope, ...blueprint.scope.outOfScope] },
    { id: "epics", title: "Epics", type: "epic", items: blueprint.epics },
    { id: "stories", title: "Stories", type: "story", items: blueprint.stories },
    { id: "tasks", title: "Tasks", type: "task", items: blueprint.tasks },
    { id: "sprint-plan", title: "Sprint plan", type: "sprint", items: blueprint.sprintPlan },
    { id: "risks", title: "Risks", type: "risk", items: blueprint.risks },
  ];
  return <div className="blueprint-workspace"><nav className="blueprint-mode" aria-label="Blueprint presentation"><button aria-pressed={mode === "blueprint"} onClick={() => setMode("blueprint")}>Blueprint view</button><button aria-pressed={mode === "document"} onClick={() => setMode("document")}>Structured document</button><span>v{blueprint.version} · {blueprint.generationSource === "fallback" ? "Reliable mode" : "AI architected"}</span></nav>
    <BlueprintExportPanel available compact projectId={projectId} projectName={projectName} />
    <section className="blueprint-overview" id="overview"><span className="eyebrow">Overview</span><h2>{blueprint.summary}</h2><dl><div><dt>Business objective</dt><dd>{blueprint.overview.businessObjective}</dd></div><div><dt>Target users</dt><dd>{blueprint.overview.targetUsers.join(", ")}</dd></div><div><dt>Success measures</dt><dd>{blueprint.overview.successMetrics.join(", ") || "A success measure still needs your judgment."}</dd></div></dl></section>
    <section className="blueprint-understanding" id="understanding"><div><span className="eyebrow">What this is built on</span><h2>{blueprint.understanding.factIds.length} product signals support this blueprint.</h2></div><div>{blueprint.understanding.unresolvedItems.length ? blueprint.understanding.unresolvedItems.map((item) => <span key={item}>{item}</span>) : <span>The foundation is clear enough to move with confidence.</span>}</div></section>
    {mode === "blueprint" ? <BlueprintGraph blueprint={blueprint} onSelect={(entity) => setSelected(entity as Selected)} /> : <div className="blueprint-document">{sections.map((section) => <section id={section.id} key={section.id}><header><h2>{section.title}</h2><span>{section.items.length}</span></header>{section.items.map((item) => <article key={item.id} onFocus={() => setSelected({ ...item, kind: section.title })}><div className="blueprint-entity__heading"><div><span>{item.id}</span><h3>{item.title}</h3></div><small>{item.status.replaceAll("_", " ")} · {item.priority}</small></div><p>{item.description}</p><button className="lineage-trigger" onClick={() => setSelected({ ...item, kind: section.title })} type="button">Why this exists</button><BlueprintEntityEditor entity={item} onSaved={setBlueprint} projectId={projectId} sprints={blueprint.sprintPlan} type={section.type} /></article>)}</section>)}</div>}
    <section className="blueprint-review" id="review"><span className="eyebrow">Blueprint confidence</span><h2>{blueprint.review.qualityScore}% of the plan is firmly rooted</h2>{blueprint.review.warnings.length ? blueprint.review.warnings.map((warning) => <p key={warning}>{warning}</p>) : <p>No concerns need your attention right now.</p>}</section>
    <BlueprintExportPanel available projectId={projectId} projectName={projectName} />
    {selected ? <aside className="lineage-panel" aria-live="polite"><button aria-label="Close lineage panel" onClick={() => setSelected(null)}>×</button><span>{selected.kind}</span><h2>{selected.title}</h2><p>{selected.description}</p><dl><div><dt>Creation source</dt><dd>{selected.lineage.source}</dd></div><div><dt>Supported by facts</dt><dd>{selected.lineage.factIds.length ? selected.lineage.factIds.map((id) => factMap.get(id)?.value ?? id).join("; ") : "No direct fact reference"}</dd></div><div><dt>Discovery answers</dt><dd>{selected.lineage.sourceMessageIds.length ? selected.lineage.sourceMessageIds.join(", ") : "Project seed or generated relationship"}</dd></div><div><dt>Generated from</dt><dd>{selected.lineage.generatedFromIds.join(", ") || "Directly from approved context"}</dd></div></dl></aside> : null}
  </div>;
}
