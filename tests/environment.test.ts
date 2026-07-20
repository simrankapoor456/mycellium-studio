import { describe, expect, it } from "vitest";

import {
  parsePublicEnvironment,
  parseServerEnvironment,
} from "@/lib/env/schemas";

const validPublicEnvironment = {
  NEXT_PUBLIC_SUPABASE_URL: "https://example-project.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example_value_123456",
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
};

describe("environment validation", () => {
  it("accepts the required public configuration", () => {
    expect(parsePublicEnvironment(validPublicEnvironment)).toEqual(validPublicEnvironment);
  });

  it("rejects secret-key shapes in the public key field", () => {
    expect(() =>
      parsePublicEnvironment({
        ...validPublicEnvironment,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "service_role_secret_value",
      }),
    ).toThrow();
  });

  it("allows blank optional server-only AI values for Phase 2", () => {
    expect(
      parseServerEnvironment({
        ...validPublicEnvironment,
        OPENAI_API_KEY: "",
        OPENAI_MODEL: "",
      }),
    ).toMatchObject({ OPENAI_API_KEY: "", OPENAI_MODEL: "" });
  });

  it("rejects a missing site URL", () => {
    expect(() =>
      parsePublicEnvironment({
        NEXT_PUBLIC_SUPABASE_URL: validPublicEnvironment.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
          validPublicEnvironment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      }),
    ).toThrow();
  });
});
