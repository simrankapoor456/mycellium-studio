import Link from "next/link";

import { BlueprintExportPanel } from "@/components/blueprint/BlueprintExportPanel";
import { MYCELLIUM_COPY } from "@/lib/voice/mycellium";

export function BlueprintCompletion({ projectId, projectName }: { projectId: string; projectName: string }) {
  return (
    <main className="blueprint-completion">
      <span className="eyebrow">Architecture complete</span>
      <h1>{MYCELLIUM_COPY.generation.complete}</h1>
      <p>The foundation is now a traceable, editable plan. This is the part where the idea stops being hypothetical.</p>
      <div className="blueprint-completion__actions">
        <Link href={`/projects/${projectId}`}>Open Product Blueprint</Link>
        <Link href={`/projects/${projectId}/export`}>Open Export</Link>
      </div>
      <BlueprintExportPanel available projectId={projectId} projectName={projectName} />
    </main>
  );
}
