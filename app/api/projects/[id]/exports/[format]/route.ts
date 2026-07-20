import { NextResponse } from "next/server";

import { orchestrateExport } from "@/lib/mycel-core/orchestration";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string; format: string }> }) {
  const { id, format } = await params;
  const outcome = await orchestrateExport(id, format);

  if (!outcome.ok) {
    return NextResponse.json({ error: outcome.error, decision: outcome.decision }, { status: outcome.status });
  }

  return new Response(outcome.data.content, {
    headers: {
      "Content-Type": outcome.data.contentType,
      "Content-Disposition": `attachment; filename="${outcome.data.filenameStem}-blueprint.${outcome.data.extension}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
