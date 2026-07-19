import type { ProductBlueprint } from "@/lib/domain/blueprint/schemas";
import type { DiscoveryFact } from "@/lib/domain/discovery/schemas";

export type BlueprintSelection = Readonly<{
  id: string;
  title: string;
  description: string;
  kind: string;
  manuallyEdited: boolean;
  lineage: ProductBlueprint["goals"][number]["lineage"];
}>;

export function BlueprintLineagePanel({ facts, selected, onClose }: { facts: readonly DiscoveryFact[]; selected: BlueprintSelection; onClose: () => void }) {
  const factMap = new Map(facts.map((fact) => [fact.id, fact]));
  return (
    <aside aria-live="polite" className="lineage-panel">
      <button aria-label="Close lineage panel" onClick={onClose}>×</button><span>{selected.kind}</span><h2>{selected.title}</h2><p>{selected.description}</p>
      <dl>
        <div><dt>Creation source</dt><dd>{selected.lineage.source}</dd></div>
        <div><dt>Manual edit state</dt><dd>{selected.manuallyEdited ? "Manually edited" : "Generated without a later manual edit"}</dd></div>
        <div><dt>Supporting facts</dt><dd>{selected.lineage.factIds.length ? selected.lineage.factIds.map((id) => factMap.get(id)?.value ?? id).join("; ") : "No direct fact reference"}</dd></div>
        <div><dt>Source message IDs</dt><dd>{selected.lineage.sourceMessageIds.join(", ") || "Project seed or generated relationship"}</dd></div>
        <div><dt>Related requirements</dt><dd>{selected.lineage.requirementIds.join(", ") || "No direct requirement reference"}</dd></div>
        <div><dt>Dependencies</dt><dd>{selected.lineage.generatedFromIds.join(", ") || "Directly from approved context"}</dd></div>
      </dl>
    </aside>
  );
}
