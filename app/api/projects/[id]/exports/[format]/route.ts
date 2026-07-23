import { coreOutcomeResponse, parseProjectId, unexpectedApiErrorResponse } from "@/lib/http/secure-api";
import { orchestrateExport } from "@/lib/mycel-core/orchestration";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string; format: string }> }) {
  try {
    const { id, format } = await params;
    const projectId = parseProjectId(id);
    if (!projectId.ok) return projectId.response;
    const outcome = await orchestrateExport(projectId.value, format);

    if (!outcome.ok) return coreOutcomeResponse(outcome);

    return new Response(outcome.data.content, {
      headers: {
        "Content-Type": outcome.data.contentType,
        "Content-Disposition": `attachment; filename="${outcome.data.filenameStem}-blueprint.${outcome.data.extension}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return unexpectedApiErrorResponse();
  }
}
