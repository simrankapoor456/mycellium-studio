"use client";

import { useState } from "react";

import { BlueprintContextSections } from "@/components/blueprint/BlueprintContextSections";
import { BlueprintDocument } from "@/components/blueprint/BlueprintDocument";
import { BlueprintExportPanel } from "@/components/blueprint/BlueprintExportPanel";
import { BlueprintGraph } from "@/components/blueprint/BlueprintGraph";
import { BlueprintLineagePanel, type BlueprintSelection } from "@/components/blueprint/BlueprintLineagePanel";
import { PressureTestPanel } from "@/components/blueprint/PressureTestPanel";
import type { ProductBlueprint } from "@/lib/domain/blueprint/schemas";
import type { DiscoveryFact } from "@/lib/domain/discovery/schemas";
import type { PressureTest } from "@/lib/domain/pressure-test/schemas";
import { getProductTypeLabel } from "@/lib/domain/project/labels";

type BlueprintWorkspaceProps = Readonly<{
  facts: DiscoveryFact[];
  initialBlueprint: ProductBlueprint;
  initialPressureTest?: PressureTest | null;
  projectId: string;
  projectName: string;
}>;

export function BlueprintWorkspace({ projectId, projectName, initialBlueprint, initialPressureTest = null, facts }: BlueprintWorkspaceProps) {
  const [blueprint, setBlueprint] = useState(initialBlueprint);
  const [pressureTest, setPressureTest] = useState(initialPressureTest);
  const [mode, setMode] = useState<"blueprint" | "document">("blueprint");
  const [selected, setSelected] = useState<BlueprintSelection | null>(null);

  function handleSaved(saved: ProductBlueprint) {
    setBlueprint(saved);
    setPressureTest(null);
  }

  return (
    <div className="blueprint-workspace">
      <div className="blueprint-workspace__toolbar">
        <nav aria-label="Blueprint presentation" className="blueprint-mode">
          <button aria-pressed={mode === "blueprint"} onClick={() => setMode("blueprint")}>Blueprint view</button>
          <button aria-pressed={mode === "document"} onClick={() => setMode("document")}>Structured document</button>
          <span>v{blueprint.version} - {blueprint.generationSource === "fallback" ? "Mycel Core, Reliable mode" : "Mycel Core, AI enhanced"}</span>
        </nav>
        <BlueprintExportPanel available compact projectId={projectId} projectName={projectName} />
      </div>

      <div className="blueprint-workspace__reading">
        <section className="blueprint-overview" id="overview">
          <span className="eyebrow">Overview</span>
          <h2>{blueprint.summary}</h2>
          <dl>
            <div><dt>Product type</dt><dd>{getProductTypeLabel(blueprint.projectType, blueprint.customProjectType)}</dd></div>
            <div><dt>Business objective</dt><dd>{blueprint.overview.businessObjective}</dd></div>
            <div><dt>Target users</dt><dd>{blueprint.overview.targetUsers.join(", ")}</dd></div>
            <div><dt>Success measures</dt><dd>{blueprint.overview.successMetrics.join(", ") || "A success measure still needs your judgment."}</dd></div>
          </dl>
        </section>
        <section className="blueprint-understanding" id="understanding">
          <div><span className="eyebrow">What this is built on</span><h2>{blueprint.understanding.factIds.length} product signals support this blueprint.</h2></div>
          <div>{blueprint.understanding.unresolvedItems.length ? blueprint.understanding.unresolvedItems.map((item) => <span key={item}>{item}</span>) : <span>The foundation is clear enough to move with confidence.</span>}</div>
        </section>
        <BlueprintContextSections blueprint={blueprint} />
        {mode === "blueprint" ? <BlueprintGraph blueprint={blueprint} onSelect={setSelected} /> : <BlueprintDocument blueprint={blueprint} onSaved={handleSaved} onSelect={setSelected} projectId={projectId} />}
        <section className="blueprint-review" id="review"><span className="eyebrow">Blueprint confidence</span><h2>{blueprint.review.qualityScore}% of the plan is firmly rooted</h2>{blueprint.review.warnings.length ? blueprint.review.warnings.map((warning) => <p key={warning}>{warning}</p>) : <p>No concerns need your attention right now.</p>}</section>
        <PressureTestPanel initialPressureTest={pressureTest} key={blueprint.version} onUpdated={setPressureTest} projectId={projectId} />
        <BlueprintExportPanel available projectId={projectId} projectName={projectName} />
      </div>
      {selected ? <BlueprintLineagePanel facts={facts} onClose={() => setSelected(null)} selected={selected} /> : null}
    </div>
  );
}
