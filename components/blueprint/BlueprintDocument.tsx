import { BlueprintEntityEditor } from "@/components/blueprint/BlueprintEntityEditor";
import type { BlueprintSelection } from "@/components/blueprint/BlueprintLineagePanel";
import type { BlueprintEntityType, ProductBlueprint } from "@/lib/domain/blueprint/schemas";

type BaseEntity = ProductBlueprint["goals"][number] & { acceptanceCriteria?: string[]; sprintId?: string | null };

export function BlueprintDocument({ blueprint, projectId, onSaved, onSelect }: { blueprint: ProductBlueprint; projectId: string; onSaved: (blueprint: ProductBlueprint) => void; onSelect: (selection: BlueprintSelection) => void }) {
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

  return <div className="blueprint-document">{sections.map((section) => <section id={section.id} key={section.id}><header><h2>{section.title}</h2><span>{section.items.length}</span></header>{section.items.map((item) => <article key={item.id}><div className="blueprint-entity__heading"><div><span>{item.id}</span><h3>{item.title}</h3></div><small>{item.status.replaceAll("_", " ")} · {item.priority}</small></div><p>{item.description}</p><button className="lineage-trigger" onClick={() => onSelect({ ...item, kind: section.title })} type="button">Why this exists</button><BlueprintEntityEditor entity={item} onSaved={onSaved} projectId={projectId} sprints={blueprint.sprintPlan} type={section.type} /></article>)}</section>)}</div>;
}
