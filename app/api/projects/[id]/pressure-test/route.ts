import { NextResponse } from "next/server";

import { orchestratePressureTest } from "@/lib/mycel-core/orchestration";

export const maxDuration = 30;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const outcome = await orchestratePressureTest(id, await readJson(request));
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
