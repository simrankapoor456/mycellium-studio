import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import nextConfig from "@/next.config";
import { getSafeReturnPath } from "@/lib/auth/return-path";
import { ProfileUpdateInputSchema } from "@/lib/domain/profile/schemas";
import { assertProjectOwnership } from "@/lib/domain/project/ownership";
import { toAuthErrorMessage, toSafeErrorMessage } from "@/lib/errors/safe-error";
import { coreOutcomeResponse, readSecureJsonBody } from "@/lib/http/secure-api";
import { authorizeOwnedProject } from "@/lib/mycel-core/decision/authorize";
import { neutralizeSpreadsheetFormula, toCsvCell } from "@/lib/security/csv";

const ownerId = "2d9065fe-829c-4c6c-b867-7663f43e8740";
const otherUserId = "10000000-0000-4000-8000-000000000001";
const projectId = "42ad2ff0-4835-47d1-b3fe-d6c1f58863a2";
const project = { id: projectId, user_id: ownerId };

describe("owner isolation", () => {
  it("does not authorize another user's project for reads", () => {
    expect(authorizeOwnedProject(otherUserId, project)).toEqual({
      status: "denied",
      explanation: "Project not found.",
    });
  });

  it("does not authorize another user's project for updates", () => {
    expect(() => assertProjectOwnership(project, otherUserId)).toThrow(
      "Project does not belong to the authenticated user.",
    );
    expect(projectOperation("renameProject")).toContain('.eq("user_id", userId)');
    expect(projectOperation("updateProjectMetadata")).toContain('.eq("user_id", userId)');
  });

  it("does not authorize another user's project for deletion", () => {
    expect(projectOperation("deleteProject")).toContain('.eq("user_id", userId)');
  });

  it("requires child records and workflow requests to match an owned parent", () => {
    const migrations = migrationSource();
    const hardening = securityMigrationSource();
    expect(migrations).toMatch(/discovery_messages_insert_owned_project[\s\S]*user_id = \(select auth\.uid\(\)\)[\s\S]*from public\.projects/i);
    expect(migrations).toMatch(/workflow_requests_insert_owned_project[\s\S]*user_id = \(select auth\.uid\(\)\)[\s\S]*from public\.projects/i);
    expect(hardening).toContain("foreign key (project_id, user_id)");
    expect(hardening).toContain("workflow_requests_project_owner_fk");
    expect(hardening).toContain("grant update (status, response_payload)\n  on table public.discovery_requests");
    expect(hardening).toContain("grant update (status, response_payload)\n  on table public.workflow_requests");
  });
});

describe("API and authentication boundaries", () => {
  it("returns a typed authentication error for unauthenticated mutations", async () => {
    const response = coreOutcomeResponse({
      ok: false,
      status: 401,
      error: "Sign in to continue.",
      decision: "denied",
    });
    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "AUTHENTICATION_REQUIRED",
        message: "Sign in to continue.",
        retryable: false,
      },
      decision: "denied",
    });
  });

  it("rejects unsupported content types and malformed JSON", async () => {
    const formResponse = await readSecureJsonBody(new Request("https://example.test", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: "{}",
    }));
    expect(formResponse.ok).toBe(false);
    if (!formResponse.ok) expect(formResponse.response.status).toBe(415);

    const invalidResponse = await readSecureJsonBody(new Request("https://example.test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{",
    }));
    expect(invalidResponse.ok).toBe(false);
    if (!invalidResponse.ok) expect(invalidResponse.response.status).toBe(400);
  });

  it("normalizes malicious return paths", () => {
    for (const value of [
      "https://attacker.example",
      "//attacker.example",
      "/\\attacker.example",
      "/projects/not-a-uuid",
      "/dashboard?next=https://attacker.example",
    ]) {
      expect(getSafeReturnPath(value)).toBe("/dashboard");
    }
  });

  it("uses signed claims rather than public configuration as identity", () => {
    const currentUser = readFileSync("lib/auth/current-user.ts", "utf8");
    expect(currentUser).toContain("auth.getClaims()");
    expect(currentUser).not.toContain("NEXT_PUBLIC_SUPABASE");
    expect(currentUser).not.toContain("PUBLISHABLE_KEY");
  });

  it("does not expose account existence or internal errors", () => {
    expect(toAuthErrorMessage({ code: "email_exists", message: "provider detail" }))
      .toBe("We could not complete that request. Please try again.");
    expect(toSafeErrorMessage(new Error("private database detail"), "Safe failure"))
      .toBe("Safe failure");
    const globalError = readFileSync("app/error.tsx", "utf8");
    expect(globalError).toContain('digest: error.digest ?? "unavailable"');
    expect(globalError).not.toContain('console.error("A route failed to render.", error)');
  });
});

describe("browser and output safety", () => {
  it.each(["=2+2", "+cmd", "-10+20", "@SUM(A1:A2)", " \t=HYPERLINK(\"x\")"])(
    "neutralizes spreadsheet formula input %s",
    (value) => {
      expect(neutralizeSpreadsheetFormula(value)).toBe(`'${value}`);
      expect(toCsvCell(value)).toMatch(/^"'[^"]*/);
    },
  );

  it("accepts only HTTPS avatar URLs", () => {
    const base = { displayName: "Owner", timezone: "", location: "" };
    expect(ProfileUpdateInputSchema.safeParse({ ...base, avatarUrl: "https://images.example/avatar.png" }).success).toBe(true);
    for (const avatarUrl of [
      "http://images.example/avatar.png",
      "javascript:alert(1)",
      "data:image/svg+xml,test",
      "file:///private/avatar.png",
    ]) {
      expect(ProfileUpdateInputSchema.safeParse({ ...base, avatarUrl }).success).toBe(false);
    }
  });

  it("keeps service credentials out of browser and environment modules", () => {
    const sources = [
      readFileSync("lib/supabase/client.ts", "utf8"),
      readFileSync("lib/supabase/server.ts", "utf8"),
      readFileSync("lib/env/schemas.ts", "utf8"),
      readFileSync("lib/env/server.ts", "utf8"),
      readFileSync("app/page.tsx", "utf8"),
    ].join("\n");
    expect(sources).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(readFileSync("lib/supabase/server.ts", "utf8")).toContain('import "server-only"');
    expect(readFileSync("lib/env/server.ts", "utf8")).toContain('import "server-only"');
  });

  it("uses security headers and private cache controls", async () => {
    const headers = await nextConfig.headers?.();
    const serialized = JSON.stringify(headers);
    expect(serialized).toContain("Content-Security-Policy-Report-Only");
    expect(serialized).toContain("X-Frame-Options");
    expect(serialized).toContain("X-Content-Type-Options");
    expect(serialized).toContain("Permissions-Policy");
    expect(serialized).toContain("private, no-store");
    expect(serialized).not.toContain("unsafe-eval");
  });
});

describe("database and repository posture", () => {
  it("enables RLS and defines explicit ownership policies for every application table", () => {
    const migrations = migrationSource();
    for (const table of [
      "profiles",
      "projects",
      "discovery_messages",
      "discovery_requests",
      "workflow_requests",
    ]) {
      expect(migrations).toContain(`alter table public.${table} enable row level security`);
    }
    expect(migrations).not.toMatch(/create policy[\s\S]*\bto anon\b/i);
    expect(securityMigrationSource()).not.toMatch(/grant (?:select|insert|update|delete)[\s\S]*\bto anon\b/i);
  });

  it("keeps the production verification script read-only", () => {
    const sql = stripSqlComments(readFileSync("supabase/security/verify_security_posture.sql", "utf8"));
    const statements = sql.split(";").map((statement) => statement.trim()).filter(Boolean);
    expect(statements.length).toBeGreaterThan(5);
    expect(statements.every((statement) => statement.toLowerCase().startsWith("select"))).toBe(true);
  });

  it("uses one forward-only migration without destructive table or policy operations", () => {
    const sql = stripSqlComments(securityMigrationSource());
    expect(sql).not.toMatch(/\bdrop\s+(?:table|policy|schema)\b/i);
    expect(sql).not.toMatch(/\btruncate\b/i);
    expect(sql).toContain("revoke all on all tables in schema public from anon");
    expect(sql).toContain("references public.projects (id, user_id)");
  });

  it("keeps example configuration non-secret and local configuration ignored", () => {
    const example = readFileSync(".env.example", "utf8");
    expect(example).toContain("your-project-url");
    expect(example).toContain("your-publishable-key");
    expect(example).not.toMatch(/sb_(?:publishable|secret)_[A-Za-z0-9_-]{20,}/);
    expect(example).not.toMatch(/sk-[A-Za-z0-9_-]{20,}/);
    expect(readFileSync(".gitignore", "utf8")).toContain(".env.local");
  });
});

function projectOperation(name: string): string {
  const source = readFileSync("lib/projects/operations.ts", "utf8");
  const start = source.indexOf(`export async function ${name}`);
  const next = source.indexOf("\nexport async function ", start + 1);
  return source.slice(start, next === -1 ? source.length : next);
}

function migrationSource(): string {
  return [
    "supabase/migrations/20260717220000_phase_2_personal_foundation.sql",
    "supabase/migrations/20260718000000_phase_3b_core_product.sql",
    "supabase/migrations/20260718190000_mycel_core_intelligence.sql",
  ].map((path) => readFileSync(path, "utf8")).join("\n");
}

function securityMigrationSource(): string {
  return readFileSync("supabase/migrations/20260723190000_security_hardening.sql", "utf8");
}

function stripSqlComments(sql: string): string {
  return sql.replaceAll(/--.*$/gm, "");
}
