import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { applyDiscoveryReview, calculateReadiness, canApproveDiscovery } from "@/lib/discovery/engine";
import { approveDiscoveryState, persistDiscoveryState } from "@/lib/discovery/persistence";
import { DiscoveryContextSchema, DiscoveryReviewInputSchema } from "@/lib/domain/discovery/schemas";
import { safeApiError } from "@/lib/errors/api-error";
import { getProjectById } from "@/lib/projects/operations";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  const { id } = await params;
  const project = await getProjectById(id, user.id);
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  if (!project.discovery_context) return NextResponse.json({ error: "Begin discovery before reviewing context." }, { status: 409 });
  let body: unknown = null;
  try { body = await request.json(); } catch { body = null; }
  const parsed = DiscoveryReviewInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "That review change is not valid." }, { status: 400 });
  const context = DiscoveryContextSchema.parse(project.discovery_context);
  const now = new Date().toISOString();

  try {
    if (parsed.data.action === "approve") {
      const readiness = calculateReadiness(context);
      if (!canApproveDiscovery(context)) return NextResponse.json({ error: "A few foundation decisions still need clarity before approval." }, { status: 409 });
      await approveDiscoveryState(project.id, user.id, context);
      return NextResponse.json({ context, readiness, approved: true });
    }
    const updated = applyDiscoveryReview(context, parsed.data, now);
    const readiness = calculateReadiness(updated);
    await persistDiscoveryState(project.id, user.id, updated, readiness);
    return NextResponse.json({ context: updated, readiness, approved: false });
  } catch (error) {
    return NextResponse.json({ error: safeApiError(error, "The review change could not be saved.") }, { status: 500 });
  }
}
