import { NextResponse } from "next/server";

import { orchestrateReviewChange } from "@/lib/mycel-core/orchestration";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const outcome = await orchestrateReviewChange(id, await readJson(request));
  return outcome.ok
    ? NextResponse.json(outcome.data)
    : NextResponse.json({ error: outcome.error, decision: outcome.decision, details: outcome.details }, { status: outcome.status });
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
