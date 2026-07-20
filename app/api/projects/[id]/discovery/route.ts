import { NextResponse } from "next/server";

import { orchestrateDiscoveryTurn } from "@/lib/mycel-core/orchestration";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const outcome = await orchestrateDiscoveryTurn(id, await readJson(request));
  return outcome.ok
    ? NextResponse.json(outcome.data)
    : NextResponse.json({ error: outcome.error, decision: outcome.decision }, { status: outcome.status });
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
