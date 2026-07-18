"use client";

import { useRef, useState } from "react";

import { MYCELLIUM_COPY } from "@/lib/voice/mycellium";

const EXPORT_FORMATS = [
  { id: "markdown", label: "Markdown", extension: "md", detail: "Readable product handoff" },
  { id: "json", label: "JSON", extension: "json", detail: "Complete structured blueprint" },
  { id: "csv", label: "CSV", extension: "csv", detail: "Planning rows for spreadsheets" },
] as const;

type ExportFormat = typeof EXPORT_FORMATS[number];
type ExportState =
  | Readonly<{ status: "idle" }>
  | Readonly<{ status: "preparing"; format: ExportFormat }>
  | Readonly<{ status: "success"; format: ExportFormat }>
  | Readonly<{ status: "error"; message: string }>;

type BlueprintExportPanelProps = Readonly<{
  available: boolean;
  projectId: string;
  projectName: string;
  compact?: boolean;
}>;

export function BlueprintExportPanel({ available, projectId, projectName, compact = false }: BlueprintExportPanelProps) {
  const downloadLink = useRef<HTMLAnchorElement>(null);
  const [state, setState] = useState<ExportState>({ status: "idle" });

  async function handleDownload(format: ExportFormat) {
    setState({ status: "preparing", format });

    try {
      const response = await fetch(`/api/projects/${projectId}/exports/${format.id}`, { cache: "no-store" });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = downloadLink.current;

      if (!anchor) {
        URL.revokeObjectURL(objectUrl);
        throw new Error("The download surface is unavailable.");
      }

      const slug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "mycellium-blueprint";
      anchor.href = objectUrl;
      anchor.download = `${slug}-blueprint.${format.extension}`;
      anchor.click();
      URL.revokeObjectURL(objectUrl);
      setState({ status: "success", format });
    } catch {
      setState({ status: "error", message: MYCELLIUM_COPY.export.failure });
    }
  }

  const statusMessage = exportStatusMessage(state);

  return (
    <section className="blueprint-export-panel" data-compact={compact} id={compact ? undefined : "export"}>
      <div className="blueprint-export-panel__intro">
        <span className="eyebrow">Export</span>
        <h2>{available ? MYCELLIUM_COPY.export.title : MYCELLIUM_COPY.export.lockedTitle}</h2>
        <p>{available ? MYCELLIUM_COPY.export.description : MYCELLIUM_COPY.export.lockedDescription}</p>
      </div>
      <div className="blueprint-export-panel__formats" aria-label="Blueprint export formats">
        {EXPORT_FORMATS.map((format) => (
          <button
            disabled={!available || state.status === "preparing"}
            key={format.id}
            onClick={() => void handleDownload(format)}
            type="button"
          >
            <span><strong>{format.label}</strong><small>{format.detail}</small></span>
            <span>.{format.extension}</span>
          </button>
        ))}
      </div>
      <p aria-live="polite" className="blueprint-export-panel__status" role="status">{statusMessage}</p>
      <a aria-hidden="true" className="sr-only" ref={downloadLink} tabIndex={-1}>Download</a>
    </section>
  );
}

function exportStatusMessage(state: ExportState): string {
  if (state.status === "preparing") {
    return `${MYCELLIUM_COPY.export.preparing}: ${state.format.label}`;
  }

  if (state.status === "success") {
    return `${state.format.label} ${MYCELLIUM_COPY.export.success.toLowerCase()}. It includes the latest saved edits.`;
  }

  if (state.status === "error") {
    return state.message;
  }

  return "";
}
