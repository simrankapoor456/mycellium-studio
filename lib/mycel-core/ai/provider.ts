import "server-only";

import OpenAI from "openai";

import { getServerEnvironment } from "@/lib/env/server";

export type OpenAiProvider = Readonly<{ client: OpenAI; model: string }>;

export function createOpenAiProvider(): OpenAiProvider | null {
  const environment = getServerEnvironment();

  if (!environment.OPENAI_API_KEY || !environment.OPENAI_MODEL) {
    return null;
  }

  return {
    client: new OpenAI({
      apiKey: environment.OPENAI_API_KEY,
      timeout: 15_000,
      maxRetries: 1,
      logLevel: "off",
    }),
    model: environment.OPENAI_MODEL,
  };
}

export function isOpenAiConfigured(): boolean {
  return createOpenAiProvider() !== null;
}
