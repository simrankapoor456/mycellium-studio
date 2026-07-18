import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { requestAiDiscovery } from "@/lib/ai/openai";
import { advanceDiscovery, boundConversationContext, createInitialDiscoveryContext } from "@/lib/discovery/engine";
import { createDiscoveryMessage, listDiscoveryMessages } from "@/lib/discovery/operations";
import { beginDiscoveryRequest, completeDiscoveryRequest, failDiscoveryRequest, persistDiscoveryState, toJson } from "@/lib/discovery/persistence";
import { DiscoveryContextSchema, DiscoveryTurnInputSchema } from "@/lib/domain/discovery/schemas";
import { safeApiError } from "@/lib/errors/api-error";
import { getProjectById } from "@/lib/projects/operations";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  const { id } = await params;
  const project = await getProjectById(id, user.id);
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  const parsed = DiscoveryTurnInputSchema.safeParse(await readJson(request));
  if (!parsed.success) return NextResponse.json({ error: "Enter a message between 1 and 4,000 characters." }, { status: 400 });

  const requestState = await beginDiscoveryRequest(project.id, user.id, parsed.data.requestId);
  if (requestState.kind === "completed") return NextResponse.json(requestState.response);
  if (requestState.kind === "pending") return NextResponse.json({ error: "That discovery turn is already being processed." }, { status: 409 });

  try {
    const now = new Date().toISOString();
    const context = project.discovery_context ? DiscoveryContextSchema.parse(project.discovery_context) : createInitialDiscoveryContext({ id: project.id, description: project.description, targetUsers: project.target_users, constraints: project.constraints }, now);
    const messages = await listDiscoveryMessages(project.id, user.id);
    const boundedMessages = boundConversationContext(messages.map((message) => ({ role: message.role, content: message.content })));
    let aiResponse = null;
    try {
      aiResponse = await requestAiDiscovery(context, boundedMessages, parsed.data.message);
    } catch {
      aiResponse = null;
    }
    const userMessageId = crypto.randomUUID();
    const response = advanceDiscovery({ context, messageId: userMessageId, message: parsed.data.message, mode: aiResponse ? "ai" : "fallback", now, ...(aiResponse ? { aiResponse } : {}) });
    const sequence = messages.length + 1;
    await createDiscoveryMessage({ projectId: project.id, role: "user", content: parsed.data.message, structuredFacts: null, sequenceNumber: sequence }, user.id, userMessageId);
    await createDiscoveryMessage({ projectId: project.id, role: "assistant", content: `${response.assistantMessage}\n\n${response.assistantQuestion}`, structuredFacts: toJson(response), sequenceNumber: sequence + 1 }, user.id);
    await persistDiscoveryState(project.id, user.id, response.context, response.readinessAssessment);
    await completeDiscoveryRequest(project.id, user.id, parsed.data.requestId, response);
    return NextResponse.json(response);
  } catch (error) {
    await failDiscoveryRequest(project.id, user.id, parsed.data.requestId);
    return NextResponse.json({ error: safeApiError(error, "Discovery could not be saved. Please try again.") }, { status: 500 });
  }
}

async function readJson(request: Request): Promise<unknown> {
  try { return await request.json(); } catch { return null; }
}
