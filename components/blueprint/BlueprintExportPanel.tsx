"use client";

import { useRef, useState } from "react";

import { MYCELLIUM_COPY } from "@/lib/voice/mycellium";

const EXPORT_FORMATS = [
  { id: "markdown", label: "Markdown", extension: "md", detail: "Readable overview, decisions, scope, work structure, risks, and lineage." },
  { id: "json", label: "JSON", extension: "json", detail: "The complete schema-valid Product Blueprint with identifiers and relationships." },
  { id: "csv", label: "CSV", extension: "csv", detail: "Planning rows for requirements, architecture, scope, work, and dependencies." },
] as const;

type ExportFormat = typeof EXPORT_FORMATS[number];
type ExportState =
  | Readonly<{ status: "idle" }>
  | Readonly<{ status: "preparing"; format: ExportFormat }>
  | Readonly<{ status: "success"; format: ExportFormat; bytes: number; filename: string }>
  | Readonly<{ status: "error"; message: string }>;

type BlueprintExportPanelProps = Readonly<{
  available: boolean;
  projectId: string;
  projectName: string;
  compact?: boolean;
  blueprintMeta?: Readonly<{ version: number; updatedAt: string }>;
}>;

export function BlueprintExportPanel({ available, projectId, projectName, compact = false, blueprintMeta }: BlueprintExportPanelProps) {
  const downloadLink = useRef<HTMLAnchorElement>(null);
  const [state, setState] = useState<ExportState>({ status: "idle" });

  async function handleDownload(format: ExportFormat) {
    setState({ status: "preparing", format });

    try {
      const response = await fetch(`/api/projects/${projectId}/exports/${format.id}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Export response was not successful.");

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = downloadLink.current;
      if (!anchor) {
        URL.revokeObjectURL(objectUrl);
        throw new Error("The download surface is unavailable.");
      }

      const fallbackSlug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "mycellium-blueprint";
      const filename = readFilename(response.headers.get("Content-Disposition")) ?? `${fallbackSlug}-blueprint.${format.extension}`;
      anchor.href = objectUrl;
      anchor.download = filename;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
      setState({ status: "success", format, bytes: blob.size, filename });
    } catch {
      setState({ status: "error", message: MYCELLIUM_COPY.export.failure });
    }
  }

  const statusMessage = exportStatusMessage(state);

  return (
    <section className="blueprint-export-panel" data-compact={compact} data-locked={!available} id={compact ? undefined : "export"}>
      <div className="blueprint-export-panel__intro">
        <span className="eyebrow">Export</span>
        <h2>{available ? MYCELLIUM_COPY.export.title : MYCELLIUM_COPY.export.lockedTitle}</h2>
        <p>{available ? MYCELLIUM_COPY.export.description : MYCELLIUM_COPY.export.lockedDescription}</p>
        {available && blueprintMeta ? <dl className="blueprint-export-panel__meta"><div><dt>Blueprint</dt><dd>Version {blueprintMeta.version}</dd></div><div><dt>Latest saved change</dt><dd><time dateTime={blueprintMeta.updatedAt}>{formatTimestamp(blueprintMeta.updatedAt)}</time></dd></div></dl> : null}
      </div>
      <div className="blueprint-export-panel__formats" aria-label="Blueprint export formats">
        {EXPORT_FORMATS.map((format) => available ? (
          <button
            aria-busy={state.status === "preparing" && state.format.id === format.id}
            disabled={state.status === "preparing"}
            key={format.id}
            onClick={() => void handleDownload(format)}
            type="button"
          >
            <span><strong>{format.label}</strong><small>{format.detail}</small></span>
            <span>.{format.extension}</span>
          </button>
        ) : <article key={format.id}><span><strong>{format.label}</strong><small>{format.detail}</small></span><span>Available after blueprint</span></article>)}
      </div>
      <p aria-live="polite" className="blueprint-export-panel__status" role={state.status === "error" ? "alert" : "status"}>{statusMessage}</p>
      <a aria-hidden="true" className="sr-only" ref={downloadLink} tabIndex={-1}>Download</a>
    </section>
  );
}

function exportStatusMessage(state: ExportState): string {
  if (state.status === "preparing") return `${MYCELLIUM_COPY.export.preparing}: ${state.format.label}`;
  if (state.status === "success") return `${state.format.label} download ready as ${state.filename} (${formatBytes(state.bytes)}). It includes the latest saved edits.`;
  if (state.status === "error") return state.message;
  return "";
}

function readFilename(contentDisposition: string | null): string | null {
  return contentDisposition?.match(/filename="([^"]+)"/)?.[1] ?? null;
}

function formatTimestamp(value: string): string {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}
