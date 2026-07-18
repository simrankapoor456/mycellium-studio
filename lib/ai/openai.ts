import "server-only";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import { ProductBlueprintSchema, type ProductBlueprint } from "@/lib/domain/blueprint/schemas";
import { AiDiscoveryResponseSchema, DiscoveryContextSchema, type AiDiscoveryResponse, type DiscoveryContext } from "@/lib/domain/discovery/schemas";
import type { Project } from "@/lib/domain/project/schemas";
import { getServerEnvironment } from "@/lib/env/server";

type ConversationMessage = Readonly<{ role: string; content: string }>;

export function isOpenAiConfigured() {
  const environment = getServerEnvironment();
  return Boolean(environment.OPENAI_API_KEY && environment.OPENAI_MODEL);
}

export async function requestAiDiscovery(contextInput: DiscoveryContext, messages: readonly ConversationMessage[], userMessage: string): Promise<AiDiscoveryResponse | null> {
  const provider = createProvider();
  if (!provider) return null;
  const context = DiscoveryContextSchema.parse(contextInput);
  const response = await provider.client.responses.parse({
    model: provider.model,
    store: false,
    instructions: [
      "You are Mycellium Studio's product discovery facilitator.",
      "Acknowledge useful context briefly, extract only facts explicitly supported by the user's words, and ask exactly one material next question.",
      "Use inferred only for a transparent interpretation, unknown for explicit uncertainty, and never invent a requirement.",
      "Do not output hidden reasoning, chain-of-thought, HTML, or fields outside the schema.",
    ].join(" "),
    input: JSON.stringify({ currentContext: context, recentConversation: messages, latestUserMessage: userMessage }),
    text: { format: zodTextFormat(AiDiscoveryResponseSchema, "mycellium_discovery_turn") },
  });
  if (!response.output_parsed) throw new Error("The provider returned no structured discovery output.");
  return AiDiscoveryResponseSchema.parse(response.output_parsed);
}

export async function requestAiBlueprint(project: Project, approvedContextInput: DiscoveryContext): Promise<ProductBlueprint | null> {
  const provider = createProvider();
  if (!provider) return null;
  const approvedContext = DiscoveryContextSchema.parse(approvedContextInput);
  const response = await provider.client.responses.parse({
    model: provider.model,
    store: false,
    instructions: [
      "Create a complete editable Product Blueprint only from the approved context.",
      "Every entity must include explicit visible lineage using existing fact IDs and discovery message IDs.",
      "Do not invent unsupported requirements. Put remaining uncertainty in understanding.unresolvedItems and review warnings.",
      "Use source 'ai' for generated lineage. Do not output hidden reasoning, chain-of-thought, HTML, or fields outside the schema.",
    ].join(" "),
    input: JSON.stringify({ project: { id: project.id, name: project.name, projectType: project.project_type, capacity: project.capacity }, approvedContext }),
    text: { format: zodTextFormat(ProductBlueprintSchema, "mycellium_product_blueprint") },
  });
  if (!response.output_parsed) throw new Error("The provider returned no structured blueprint output.");
  return ProductBlueprintSchema.parse(response.output_parsed);
}

function createProvider(): { client: OpenAI; model: string } | null {
  const environment = getServerEnvironment();
  if (!environment.OPENAI_API_KEY || !environment.OPENAI_MODEL) return null;
  return {
    client: new OpenAI({ apiKey: environment.OPENAI_API_KEY, timeout: 15_000, maxRetries: 1 }),
    model: environment.OPENAI_MODEL,
  };
}
