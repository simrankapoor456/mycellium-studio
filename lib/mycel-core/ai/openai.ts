import "server-only";

import { zodTextFormat } from "openai/helpers/zod";

import { ProductBlueprintSchema, type ProductBlueprint } from "@/lib/domain/blueprint/schemas";
import {
  AiDiscoveryResponseSchema,
  DiscoveryContextSchema,
  type AiDiscoveryResponse,
  type DiscoveryContext,
} from "@/lib/domain/discovery/schemas";
import { PressureTestSchema, type PressureTest } from "@/lib/domain/pressure-test/schemas";
import type { Project } from "@/lib/domain/project/schemas";
import { BLUEPRINT_INSTRUCTIONS, DISCOVERY_INSTRUCTIONS, PRESSURE_TEST_INSTRUCTIONS } from "@/lib/mycel-core/ai/prompts";
import { createOpenAiProvider, isOpenAiConfigured } from "@/lib/mycel-core/ai/provider";

type ConversationMessage = Readonly<{ role: string; content: string }>;

export { isOpenAiConfigured };

export async function requestAiDiscovery(
  contextInput: DiscoveryContext,
  messages: readonly ConversationMessage[],
  userMessage: string,
): Promise<AiDiscoveryResponse | null> {
  const provider = createOpenAiProvider();

  if (!provider) {
    return null;
  }

  const context = DiscoveryContextSchema.parse(contextInput);
  const response = await provider.client.responses.parse({
    model: provider.model,
    store: false,
    instructions: DISCOVERY_INSTRUCTIONS,
    input: [{
      role: "user",
      content: JSON.stringify({
        untrustedProjectContext: context,
        recentConversation: messages,
        latestUserMessage: userMessage,
      }),
    }],
    text: { format: zodTextFormat(AiDiscoveryResponseSchema, "mycellium_discovery_proposal") },
  });

  if (!response.output_parsed) {
    throw new Error("AI discovery output was unavailable.");
  }

  return AiDiscoveryResponseSchema.parse(response.output_parsed);
}

export async function requestAiBlueprint(
  project: Project,
  approvedContextInput: DiscoveryContext,
): Promise<ProductBlueprint | null> {
  const provider = createOpenAiProvider();

  if (!provider) {
    return null;
  }

  const approvedContext = DiscoveryContextSchema.parse(approvedContextInput);
  const response = await provider.client.responses.parse({
    model: provider.model,
    store: false,
    instructions: BLUEPRINT_INSTRUCTIONS,
    input: [{
      role: "user",
      content: JSON.stringify({
        untrustedProject: {
          id: project.id,
          name: project.name,
          projectType: project.project_type,
          customProjectType: project.custom_project_type,
          capacity: project.capacity,
        },
        approvedContext,
      }),
    }],
    text: { format: zodTextFormat(ProductBlueprintSchema, "mycellium_product_blueprint_proposal") },
  });

  if (!response.output_parsed) {
    throw new Error("AI blueprint output was unavailable.");
  }

  return ProductBlueprintSchema.parse(response.output_parsed);
}

export async function requestAiPressureTest(
  blueprintInput: ProductBlueprint,
): Promise<PressureTest | null> {
  const provider = createOpenAiProvider();

  if (!provider) {
    return null;
  }

  const blueprint = ProductBlueprintSchema.parse(blueprintInput);
  const response = await provider.client.responses.parse({
    model: provider.model,
    store: false,
    instructions: PRESSURE_TEST_INSTRUCTIONS,
    input: [{ role: "user", content: JSON.stringify({ untrustedBlueprint: blueprint }) }],
    text: { format: zodTextFormat(PressureTestSchema, "mycellium_pressure_test_proposal") },
  });

  if (!response.output_parsed) {
    throw new Error("AI Pressure Test output was unavailable.");
  }

  return PressureTestSchema.parse(response.output_parsed);
}
