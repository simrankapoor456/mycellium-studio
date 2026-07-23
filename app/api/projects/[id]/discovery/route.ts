import { coreOutcomeResponse, parseProjectId, readSecureJsonBody, unexpectedApiErrorResponse } from "@/lib/http/secure-api";
import { orchestrateDiscoveryTurn } from "@/lib/mycel-core/orchestration";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const projectId = parseProjectId(id);
    if (!projectId.ok) return projectId.response;
    const body = await readSecureJsonBody(request);
    if (!body.ok) return body.response;
    return coreOutcomeResponse(await orchestrateDiscoveryTurn(projectId.value, body.value));
  } catch {
    return unexpectedApiErrorResponse();
  }
}
