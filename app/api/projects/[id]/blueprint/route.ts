import { NextResponse } from "next/server";

import { requestAiBlueprint } from "@/lib/ai/openai";
import { applyBlueprintEdit } from "@/lib/blueprint/editing";
import { generateDeterministicBlueprint, normalizeAiBlueprint } from "@/lib/blueprint/generate";
import { persistBlueprint } from "@/lib/blueprint/persistence";
import { getCurrentUser } from "@/lib/auth/current-user";
import { BlueprintEditInputSchema, ProductBlueprintSchema } from "@/lib/domain/blueprint/schemas";
import { DiscoveryContextSchema } from "@/lib/domain/discovery/schemas";
import { safeApiError } from "@/lib/errors/api-error";
import { getProjectById } from "@/lib/projects/operations";

export const maxDuration = 30;

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await ownedProject(params);
  if (access instanceof NextResponse) return access;
  const { project, userId } = access;
  if (!project.approved_discovery_context || !project.discovery_approved_at) return NextResponse.json({ error: "Approve the discovery context before architecture." }, { status: 409 });
  const context = DiscoveryContextSchema.parse(project.approved_discovery_context);
  const now = new Date().toISOString();
  let blueprint = generateDeterministicBlueprint(project, context, now);
  try {
    const aiCandidate = await requestAiBlueprint(project, context);
    if (aiCandidate) blueprint = normalizeAiBlueprint(aiCandidate, project, context, now);
  } catch {
    blueprint = generateDeterministicBlueprint(project, context, now);
  }
  try {
    await persistBlueprint(project.id, userId, blueprint);
    return NextResponse.json({ blueprint, generationSource: blueprint.generationSource });
  } catch (error) {
    return NextResponse.json({ error: safeApiError(error, "The blueprint could not be saved.") }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await ownedProject(params);
  if (access instanceof NextResponse) return access;
  const { project, userId } = access;
  if (!project.plan) return NextResponse.json({ error: "Generate a blueprint before editing it." }, { status: 409 });
  let body: unknown = null;
  try { body = await request.json(); } catch { body = null; }
  const parsed = BlueprintEditInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "That blueprint change is not valid." }, { status: 400 });
  try {
    const blueprint = applyBlueprintEdit(ProductBlueprintSchema.parse(project.plan), parsed.data, new Date().toISOString());
    await persistBlueprint(project.id, userId, blueprint);
    return NextResponse.json({ blueprint });
  } catch (error) {
    return NextResponse.json({ error: safeApiError(error, "The blueprint change could not be saved.") }, { status: 500 });
  }
}

async function ownedProject(params: Promise<{ id: string }>) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  const { id } = await params;
  const project = await getProjectById(id, user.id);
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  return { project, userId: user.id };
}
