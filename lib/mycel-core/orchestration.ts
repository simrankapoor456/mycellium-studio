import "server-only";

import { z } from "zod";

import {
  BlueprintEditInputSchema,
  BlueprintGenerationResponseSchema,
  ProductBlueprintSchema,
} from "@/lib/domain/blueprint/schemas";
import {
  DiscoveryContextSchema,
  DiscoveryReviewInputSchema,
  DiscoveryReviewResponseSchema,
  DiscoveryTurnInputSchema,
  DiscoveryTurnResponseSchema,
  type FoundationApprovalDetails,
} from "@/lib/domain/discovery/schemas";
import { PressureTestRequestSchema, PressureTestSchema } from "@/lib/domain/pressure-test/schemas";
import { getProductTypeLabel } from "@/lib/domain/project/labels";
import { requestAiBlueprint, requestAiDiscovery, requestAiPressureTest } from "@/lib/mycel-core/ai/openai";
import { isOpenAiConfigured } from "@/lib/mycel-core/ai/provider";
import { isProviderTimeout } from "@/lib/mycel-core/ai/timeout";
import { authorizeOwnedProject } from "@/lib/mycel-core/decision/authorize";
import { decideBlueprintExport, decideBlueprintGeneration, decideContextApproval } from "@/lib/mycel-core/decision/readiness";
import { canContinueDiscovery, isWithinRateLimit, MYCEL_POLICIES } from "@/lib/mycel-core/decision/policies";
import { validateAiDiscoveryProposal, validateProviderProposal, validateRequest } from "@/lib/mycel-core/decision/validate";
import {
  applyBlueprintEdit,
  generateDeterministicBlueprint,
  generateReliablePressureTest,
  normalizeAiBlueprint,
  normalizeAiPressureTest,
  persistBlueprint,
  recoverPersistedBlueprintGeneration,
} from "@/lib/mycel-core/execution/blueprint";
import {
  advanceDiscovery,
  applyDiscoveryReview,
  approveDiscoveryState,
  beginDiscoveryRequest,
  boundConversationContext,
  calculateReadiness,
  completeDiscoveryRequest,
  countRecentDiscoveryRequests,
  createDiscoveryMessage,
  createInitialDiscoveryContext,
  failDiscoveryRequest,
  listDiscoveryMessages,
  persistDiscoveryState,
  toJson,
} from "@/lib/mycel-core/execution/discovery";
import { getNextDiscoveryPrompt } from "@/lib/discovery/questions";
import { blueprintToCsv, blueprintToJson, blueprintToMarkdown } from "@/lib/mycel-core/execution/exports";
import {
  beginWorkflowRequest,
  completeWorkflowRequest,
  countRecentWorkflowRequests,
  failWorkflowRequest,
  loadAuthenticatedUser,
  loadOwnedProject,
  persistPressureTest,
} from "@/lib/mycel-core/execution/persistence";
import { WorkflowRequestInputSchema, type CoreOutcome, type DecisionStatus, type EngineState } from "@/lib/mycel-core/types";
import { logBlueprintGeneration, safeGenerationErrorCode } from "@/lib/mycel-core/generation-logging";

const ExportFormatSchema = z.enum(["markdown", "json", "csv"]);

type ExportPayload = Readonly<{
  content: string;
  contentType: string;
  extension: string;
  filenameStem: string;
}>;

export async function orchestrateDiscoveryTurn(
  projectId: string,
  input: unknown,
): Promise<CoreOutcome<z.output<typeof DiscoveryTurnResponseSchema>>> {
  const access = await loadAccess(projectId);
  if (!access.ok) return access;

  const requestDecision = validateRequest(
    DiscoveryTurnInputSchema,
    input,
    "Enter a message between 1 and 4,000 characters.",
  );
  if (requestDecision.status !== "allowed") return failure(400, requestDecision.explanation, requestDecision.status);

  if (!canContinueDiscovery(access.data.project.status)) {
    return failure(409, "Archived projects cannot continue discovery.", "denied");
  }

  const since = new Date(Date.now() - MYCEL_POLICIES.requestWindowMilliseconds).toISOString();
  const requestCount = await countRecentDiscoveryRequests(access.data.project.id, access.data.userId, since);
  if (!isWithinRateLimit(requestCount, MYCEL_POLICIES.discoveryRequestsPerMinute)) {
    return failure(429, "Discovery is moving too quickly. Wait a moment and continue.", "denied");
  }

  const requestState = await beginDiscoveryRequest(
    access.data.project.id,
    access.data.userId,
    requestDecision.value.requestId,
  );
  if (requestState.kind === "completed") {
    return success(DiscoveryTurnResponseSchema.parse(requestState.response));
  }
  if (requestState.kind === "pending") {
    return failure(409, "That discovery turn is already being processed.", "denied");
  }

  try {
    const now = new Date().toISOString();
    const context = access.data.project.discovery_context
      ? DiscoveryContextSchema.parse(access.data.project.discovery_context)
      : createInitialDiscoveryContext({
        id: access.data.project.id,
        description: access.data.project.description,
        targetUsers: access.data.project.target_users,
        constraints: access.data.project.constraints,
        productTypeLabel: getProductTypeLabel(
          access.data.project.project_type,
          access.data.project.custom_project_type,
        ),
      }, now);
    const action = requestDecision.value.action;
    const prompt = getNextDiscoveryPrompt(context);
    if (action !== "answer" && !prompt) {
      await failDiscoveryRequest(access.data.project.id, access.data.userId, requestDecision.value.requestId);
      return failure(409, "No materially different discovery question remains. Review the current foundation.", "requires_review");
    }

    const message = action === "answer"
      ? requestDecision.value.message
      : action === "mark_unknown"
        ? "Marked the current decision as unknown."
        : "Deferred the current decision for Foundation Review.";
    const messages = await listDiscoveryMessages(access.data.project.id, access.data.userId);
    const sequence = messages.length + 1;
    await createDiscoveryMessage({
      projectId: access.data.project.id,
      role: "user",
      content: message,
      structuredFacts: action === "answer" ? null : toJson({ action, questionId: prompt?.id ?? "review" }),
      sequenceNumber: sequence,
    }, access.data.userId, requestDecision.value.requestId);

    const boundedMessages = boundConversationContext(
      messages.map((message) => ({ role: message.role, content: message.content })),
      MYCEL_POLICIES.conversationMessageMaximum,
      MYCEL_POLICIES.conversationCharacterMaximum,
    );
    const providerConfigured = isOpenAiConfigured();
    let providerProposal: unknown = null;

    if (providerConfigured && action === "answer") {
      try {
        providerProposal = await requestAiDiscovery(context, boundedMessages, message);
      } catch {
        providerProposal = null;
      }
    }

    const proposalDecision = validateAiDiscoveryProposal(
      providerProposal,
      new Set(context.facts.filter((fact) => fact.deletedAt === null).map((fact) => fact.id)),
    );
    const useAi = providerConfigured && proposalDecision.status === "allowed";
    const engineState = resolveEngineState(providerConfigured, useAi);
    const response = advanceDiscovery({
      context,
      messageId: requestDecision.value.requestId,
      message,
      mode: useAi ? "ai" : "fallback",
      engineState,
      now,
      ...(action === "answer" ? {} : { controlAction: action }),
      ...(useAi ? { aiResponse: proposalDecision.value } : {}),
    });

    await createDiscoveryMessage({
      projectId: access.data.project.id,
      role: "assistant",
      content: response.assistantMessage,
      structuredFacts: toJson(response),
      sequenceNumber: sequence + 1,
    }, access.data.userId);
    await persistDiscoveryState(
      access.data.project.id,
      access.data.userId,
      response.context,
      response.readinessAssessment,
    );
    await completeDiscoveryRequest(
      access.data.project.id,
      access.data.userId,
      requestDecision.value.requestId,
      response,
    );
    return success(response);
  } catch {
    await failDiscoveryRequest(access.data.project.id, access.data.userId, requestDecision.value.requestId);
    return failure(500, "Discovery could not be saved. Please try again.", "denied");
  }
}

export async function orchestrateReviewChange(
  projectId: string,
  input: unknown,
): Promise<CoreOutcome<z.output<typeof DiscoveryReviewResponseSchema>, FoundationApprovalDetails>> {
  const access = await loadAccess(projectId);
  if (!access.ok) return access;
  if (!access.data.project.discovery_context) {
    return failure(409, "Begin discovery before reviewing context.", "requires_review");
  }

  const requestDecision = validateRequest(DiscoveryReviewInputSchema, input, "That review change is not valid.");
  if (requestDecision.status !== "allowed") return failure(400, requestDecision.explanation, requestDecision.status);

  try {
    const context = DiscoveryContextSchema.parse(access.data.project.discovery_context);

    if (requestDecision.value.action === "approve") {
      const readiness = calculateReadiness(context);
      const approvalDecision = decideContextApproval(context, readiness);
      if (approvalDecision.status !== "allowed") {
        return failure(409, approvalDecision.explanation, approvalDecision.status, approvalDecision.details);
      }
      const approvedContext = DiscoveryContextSchema.parse({ ...context, approvalState: "approved" });
      await approveDiscoveryState(access.data.project.id, access.data.userId, approvedContext);
      return success(DiscoveryReviewResponseSchema.parse({ context: approvedContext, readiness, approved: true }));
    }

    const updated = applyDiscoveryReview(context, requestDecision.value, new Date().toISOString());
    const readiness = calculateReadiness(updated);
    await persistDiscoveryState(access.data.project.id, access.data.userId, updated, readiness);
    return success(DiscoveryReviewResponseSchema.parse({ context: updated, readiness, approved: false }));
  } catch {
    return failure(500, "The review change could not be saved.", "denied");
  }
}

export async function orchestrateBlueprintGeneration(
  projectId: string,
  input: unknown,
): Promise<CoreOutcome<z.output<typeof BlueprintGenerationResponseSchema>>> {
  const access = await loadAccess(projectId);
  if (!access.ok) return access;
  const requestDecision = validateRequest(WorkflowRequestInputSchema, input, "A valid generation request is required.");
  if (requestDecision.status !== "allowed") return failure(400, requestDecision.explanation, requestDecision.status);
  const generationDecision = decideBlueprintGeneration(access.data.project);
  if (generationDecision.status !== "allowed") return failure(409, generationDecision.explanation, generationDecision.status);

  const approvedContext = DiscoveryContextSchema.parse(access.data.project.approved_discovery_context);
  const foundationDecision = decideContextApproval(approvedContext, calculateReadiness(approvedContext));
  if (foundationDecision.status !== "allowed") return failure(409, foundationDecision.explanation, foundationDecision.status);

  const requestId = requestDecision.value.requestId;
  logBlueprintGeneration("generation_start", { requestId });

  const persistedResponse = recoverPersistedBlueprintGeneration(access.data.project, requestId);
  if (persistedResponse) {
    try {
      await completeWorkflowRequest(access.data.project.id, access.data.userId, requestId, "blueprint_generation", persistedResponse);
    } catch (error) {
      logBlueprintGeneration("request_ledger_completion_failed", { requestId, errorCode: safeGenerationErrorCode(error) }, "warn");
    }
    logBlueprintGeneration("persisted_result_recovered", { requestId });
    return success(persistedResponse);
  }

  const requestState = await beginWorkflowRequest(access.data.project.id, access.data.userId, requestId, "blueprint_generation");
  if (requestState.kind === "untracked") {
    logBlueprintGeneration("request_ledger_unavailable", { requestId }, "warn");
  }
  if (requestState.kind === "completed") {
    logBlueprintGeneration("persisted_result_recovered", { requestId });
    return success(BlueprintGenerationResponseSchema.parse(requestState.response));
  }
  if (requestState.kind === "pending") return failure(409, "That architecture request is already being processed.", "denied");
  const rateDecision = await enforceWorkflowRate(access.data.project.id, access.data.userId, "blueprint_generation");
  if (!rateDecision.ok) {
    await failWorkflowRequest(access.data.project.id, access.data.userId, requestId, "blueprint_generation");
    return rateDecision;
  }

  try {
    const now = new Date().toISOString();
    const providerConfigured = isOpenAiConfigured();
    let blueprint = generateDeterministicBlueprint(access.data.project, approvedContext, now);
    let useAi = false;
    logBlueprintGeneration("generation_mode_selected", { requestId, mode: providerConfigured ? "ai" : "reliable" });

    if (providerConfigured) {
      try {
        const proposal = await requestAiBlueprint(access.data.project, approvedContext);
        const proposalDecision = validateProviderProposal(ProductBlueprintSchema, proposal);
        if (proposalDecision.status === "allowed") {
          blueprint = normalizeAiBlueprint(proposalDecision.value, access.data.project, approvedContext, now);
          useAi = true;
        } else {
          logBlueprintGeneration("reliable_fallback", { requestId, reason: "invalid_provider_response" }, "warn");
        }
      } catch (error) {
        const timeout = isProviderTimeout(error);
        logBlueprintGeneration(timeout ? "provider_timeout" : "provider_failure", {
          requestId,
          errorCode: safeGenerationErrorCode(error),
        }, "warn");
        logBlueprintGeneration("reliable_fallback", { requestId, reason: timeout ? "provider_timeout" : "provider_failure" }, "warn");
        useAi = false;
        blueprint = generateDeterministicBlueprint(access.data.project, approvedContext, now);
      }
    }

    const response = BlueprintGenerationResponseSchema.parse({
      blueprint,
      generationSource: blueprint.generationSource,
      engineState: resolveEngineState(providerConfigured, useAi),
    });
    try {
      await persistBlueprint(access.data.project.id, access.data.userId, blueprint, requestId);
      logBlueprintGeneration("persistence_success", { requestId, mode: blueprint.generationSource });
    } catch (error) {
      logBlueprintGeneration("persistence_failure", { requestId, errorCode: safeGenerationErrorCode(error) }, "error");
      throw error;
    }
    await completeWorkflowRequest(access.data.project.id, access.data.userId, requestId, "blueprint_generation", response);
    return success(response);
  } catch (error) {
    await failWorkflowRequest(access.data.project.id, access.data.userId, requestId, "blueprint_generation");
    logBlueprintGeneration("generation_failure", { requestId, errorCode: safeGenerationErrorCode(error) }, "error");
    return failure(500, "The blueprint could not be saved.", "denied");
  }
}

export async function orchestrateBlueprintEdit(
  projectId: string,
  input: unknown,
): Promise<CoreOutcome<{ blueprint: z.output<typeof ProductBlueprintSchema> }>> {
  const access = await loadAccess(projectId);
  if (!access.ok) return access;
  if (!access.data.project.plan) return failure(409, "Generate a blueprint before editing it.", "requires_review");
  const requestDecision = validateRequest(BlueprintEditInputSchema, input, "That blueprint change is not valid.");
  if (requestDecision.status !== "allowed") return failure(400, requestDecision.explanation, requestDecision.status);

  try {
    const blueprint = applyBlueprintEdit(
      ProductBlueprintSchema.parse(access.data.project.plan),
      requestDecision.value,
      new Date().toISOString(),
    );
    await persistBlueprint(access.data.project.id, access.data.userId, blueprint);
    return success({ blueprint });
  } catch {
    return failure(500, "The blueprint change could not be saved.", "denied");
  }
}

export async function orchestratePressureTest(
  projectId: string,
  input: unknown,
): Promise<CoreOutcome<z.output<typeof PressureTestSchema>>> {
  const access = await loadAccess(projectId);
  if (!access.ok) return access;
  if (!access.data.project.plan) return failure(409, "Create a Product Blueprint before running Pressure Test.", "requires_review");
  const requestDecision = validateRequest(PressureTestRequestSchema, input, "A valid Pressure Test request is required.");
  if (requestDecision.status !== "allowed") return failure(400, requestDecision.explanation, requestDecision.status);
  const rateDecision = await enforceWorkflowRate(access.data.project.id, access.data.userId, "pressure_test");
  if (!rateDecision.ok) return rateDecision;
  const requestState = await beginWorkflowRequest(access.data.project.id, access.data.userId, requestDecision.value.requestId, "pressure_test");
  if (requestState.kind === "completed") return success(PressureTestSchema.parse(requestState.response));
  if (requestState.kind === "pending") return failure(409, "That Pressure Test is already being processed.", "denied");

  try {
    const blueprint = ProductBlueprintSchema.parse(access.data.project.plan);
    const providerConfigured = isOpenAiConfigured();
    let pressureTest = generateReliablePressureTest(blueprint);

    if (providerConfigured) {
      try {
        const proposal = await requestAiPressureTest(blueprint);
        const proposalDecision = validateProviderProposal(PressureTestSchema, proposal);
        if (proposalDecision.status === "allowed") pressureTest = normalizeAiPressureTest(proposalDecision.value);
      } catch {
        pressureTest = generateReliablePressureTest(blueprint);
      }
    }

    await persistPressureTest(access.data.project.id, access.data.userId, blueprint, pressureTest);
    await completeWorkflowRequest(access.data.project.id, access.data.userId, requestDecision.value.requestId, "pressure_test", pressureTest);
    return success(pressureTest);
  } catch {
    await failWorkflowRequest(access.data.project.id, access.data.userId, requestDecision.value.requestId, "pressure_test");
    return failure(500, "Pressure Test could not be completed.", "denied");
  }
}

export async function orchestrateExport(
  projectId: string,
  formatInput: unknown,
): Promise<CoreOutcome<ExportPayload>> {
  const access = await loadAccess(projectId);
  if (!access.ok) return access;
  const formatDecision = validateRequest(ExportFormatSchema, formatInput, "That export format is not available.");
  if (formatDecision.status !== "allowed") return failure(404, formatDecision.explanation, formatDecision.status);
  const blueprint = access.data.project.plan ? ProductBlueprintSchema.parse(access.data.project.plan) : null;
  const exportDecision = decideBlueprintExport(blueprint);
  if (exportDecision.status !== "allowed") return failure(409, exportDecision.explanation, exportDecision.status);
  const pressureTest = access.data.project.pressure_test && access.data.project.pressure_test_blueprint_version === exportDecision.value.version
    ? PressureTestSchema.parse(access.data.project.pressure_test)
    : null;
  const formats = {
    markdown: { content: blueprintToMarkdown(exportDecision.value, pressureTest), contentType: "text/markdown;charset=utf-8", extension: "md" },
    json: { content: blueprintToJson(exportDecision.value), contentType: "application/json;charset=utf-8", extension: "json" },
    csv: { content: blueprintToCsv(exportDecision.value), contentType: "text/csv;charset=utf-8", extension: "csv" },
  } as const;
  const selected = formats[formatDecision.value];
  return success({ ...selected, filenameStem: sanitizeFilename(access.data.project.name) });
}

async function loadAccess(projectId: string): Promise<CoreOutcome<{ project: NonNullable<Awaited<ReturnType<typeof loadOwnedProject>>>; userId: string }>> {
  const user = await loadAuthenticatedUser();
  if (!user) return failure(401, "Sign in to continue.", "denied");
  const project = await loadOwnedProject(projectId, user.id);
  const decision = authorizeOwnedProject(user.id, project);
  if (decision.status !== "allowed") return failure(404, decision.explanation, decision.status);
  return success({ project: decision.value, userId: user.id });
}

async function enforceWorkflowRate(
  projectId: string,
  userId: string,
  operation: "blueprint_generation" | "pressure_test",
): Promise<CoreOutcome<true>> {
  const since = new Date(Date.now() - MYCEL_POLICIES.requestWindowMilliseconds).toISOString();
  const count = await countRecentWorkflowRequests(projectId, userId, operation, since);
  if (!isWithinRateLimit(count, MYCEL_POLICIES.generationRequestsPerMinute)) {
    return failure(429, "Mycel Core is moving too quickly. Wait a moment and try again.", "denied");
  }
  return success(true);
}

function resolveEngineState(providerConfigured: boolean, useAi: boolean): EngineState {
  if (useAi) return "ai_enhanced";
  return providerConfigured ? "ai_unavailable_reliable" : "reliable";
}

function sanitizeFilename(projectName: string): string {
  return projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "mycellium-blueprint";
}

function success<Value>(data: Value): CoreOutcome<Value> {
  return { ok: true, status: 200, data };
}

function failure<Details = undefined>(
  status: 400 | 401 | 404 | 409 | 429 | 500,
  error: string,
  decision: Exclude<DecisionStatus, "allowed">,
  details?: Details,
): CoreOutcome<never, Details> {
  return { ok: false, status, error, decision, details };
}
