# Mycellium Studio architecture

## Phase 2 objective

Phase 2 adds a secure personal-user application layer around the Phase 1 planning domain. Authenticated users can manage private project metadata and persist future discovery inputs. No AI provider, billing system, team model, or integration client is present.

## Request and trust boundary

```text
Browser
  |
  | cookie-based Supabase session
  v
Next.js Proxy ---- refreshes/propagates auth cookies
  |
  v
Protected Server Components / Server Actions
  |        | validate writes with Zod
  |        | resolve identity from verified claims
  v
Auth-scoped persistence operations
  |        | always filter by authenticated user_id
  v
Supabase Postgres
           | RLS is authoritative
           | constraints/triggers preserve invariants
```

Route protection improves navigation and prevents accidental access, but it is not the data-security boundary. RLS independently enforces personal ownership for profiles, projects, and discovery messages.

## Layers

### Presentation and routing

`app/` contains public landing, authentication, confirmation, and protected workspace routes. The `(protected)` layout verifies the current user on the server. Next.js `proxy.ts` refreshes Supabase sessions using the supported Next.js 16 Proxy convention.

Client Components are limited to interactive forms and feedback. Data loading remains in Server Components. No authentication token is copied into local storage or application state.

### Authentication

`lib/supabase/` provides typed browser, server, and Proxy clients. Server identity comes from `auth.getClaims()`, not an unverified local cookie value. Signup metadata creates a profile through a database trigger. User-facing auth errors pass through a safe allowlist mapper.

### Domain contracts

`lib/domain/project/` owns project input/output schemas, ownership assertions, and duplication mapping. `lib/domain/discovery/` owns the persisted message input contract. All form writes are parsed on the server; database rows are parsed before presentation.

The Phase 1 `PlanOutputSchema` remains the canonical plan contract. Persisted `plan`, `discovery_context`, and `readiness_state` columns accept JSON objects, but Phase 2 does not fabricate or generate their contents.

### Persistence

`lib/projects/operations.ts` implements reusable create, read, metadata update, rename, duplicate, and delete operations. Every query includes the authenticated user's ID, even though RLS also applies. `lib/discovery/operations.ts` establishes ordered message persistence for later discovery work.

The migration under `supabase/migrations/` defines tables, checks, indexes, timestamp triggers, profile provisioning, grants, and explicit RLS policies. No service-role key is needed by the application.

### Phase 1 planning and exports

`lib/planner/` and `lib/exports/` remain pure and deterministic. They do not import authentication, Supabase, or UI code. Phase 2 does not connect the deterministic example planner to persisted projects.

## Dependency direction

```text
app/components --> auth + project operations --> Supabase clients
app/components --> domain schemas
project operations --> project domain + Supabase clients
discovery operations --> discovery domain + Supabase clients
planner/exports --> plan domain schemas
domain schemas -X-> framework or database clients
```

## Security decisions

- Only the Supabase URL and publishable key are used; no secret or service-role credential exists in code.
- Sessions use HttpOnly-compatible SSR cookies managed by Supabase helpers.
- Protected layouts verify claims server-side; all write actions re-check authentication.
- Repository operations add ownership filters and PostgreSQL RLS remains authoritative.
- Inserts cannot choose another user's owner ID; the server supplies it from verified identity.
- Inputs are trimmed, bounded, and validated; output rows are schema-parsed.
- Unknown auth/database errors are replaced with generic messages.
- Persisted content is rendered as text, never untrusted HTML.
- Project deletion cascades only to that project's discovery messages.

## Deployment posture

The app requires three public environment variables documented in `.env.example`. Deployment also requires applying the migration and configuring Supabase Auth URLs. OpenAI variables remain blank and unused. See [`docs/supabase-setup.md`](./supabase-setup.md).

## Phase 3A presentation system

Phase 3A adds a presentation layer without changing the trust boundary. Marketing content is rendered primarily as Server Components; only the product-stage tabs and form/dialog interactions cross the Client Component boundary. Fixed landing example data lives in `lib/marketing/` and performs no network request.

Semantic tokens in `app/globals.css` feed reusable components under `components/ui/` and `components/brand/`. Authentication and project pages reuse these components while retaining the same Phase 2 actions, validated operations, auth-scoped queries, and RLS policies. See [`docs/design-system.md`](./design-system.md) for the durable visual and interaction contract.

## Phase 3B discovery and blueprint pipeline

```text
Authenticated browser
  -> discovery turn with request UUID
  -> ownership check and idempotency row
  -> bounded conversation plus validated context
  -> optional structured AI output OR deterministic extraction
  -> fact merge, contradictions, readiness, and graph diff
  -> persisted messages and project context
  -> human review and approved context snapshot
  -> optional structured AI blueprint OR deterministic blueprint
  -> canonical ProductBlueprint 2.0
  -> controlled edits and persisted exports
```

Route handlers derive identity from verified Supabase claims, re-read the owned project, validate request bodies, and constrain response shapes. PostgreSQL RLS independently protects projects, discovery messages, and discovery request records.

`discovery_context`, `readiness_state`, and `plan` remain canonical validated JSON documents on the project. Ordered conversation remains relational. The Phase 3B migration adds an approved discovery snapshot, context and blueprint versions, and `discovery_requests` for duplicate-request protection.

Lineage stores only user-visible references: source discovery message IDs, fact IDs, related requirement IDs, generated-from entity IDs, and `ai`, `fallback`, or `manual` source. Hidden model reasoning is neither requested nor persisted.

The official OpenAI SDK is reached only through the server-only Mycel Core AI layer. Both provider variables must be present before it runs. Requests use strict Zod-backed Responses API output, `store: false`, a 15-second timeout, and one SDK retry. An unavailable, timed-out, invalid, or lineage-inconsistent provider result falls back to the same canonical contracts.

## Mycel Core intelligence boundary

```text
Route handler
  -> Mycel Core orchestration
      -> AI Layer: proposes typed discovery, blueprint, or Pressure Test output
      -> Decision Layer: authenticates, authorizes, validates, gates, and normalizes
      -> Deterministic Execution Layer: reads, computes, persists, and exports
```

The layers have one-way authority. Provider code cannot write project data. The Decision Layer owns owner checks, input limits, workflow transitions, readiness and contradiction gates, challenge disposition, rate policies, idempotency, trusted identifiers, and safe explanations. The execution layer is the only layer that reads or writes Supabase state and always supplies both the authenticated user ID and project ID.

Discovery persists the user message before provider work, sends bounded visible history, validates any proposal against strict Zod contracts, merges memory deterministically, creates challenges, recalculates readiness, persists the assistant result, and derives the graph. Fact edits and review actions follow the same decision boundary. Confirmed facts are never silently replaced; material conflicts remain visible and can block approval.

Blueprint generation requires an approved context with no blocking contradiction or unresolved material challenge. Generated identifiers are replaced with application-owned identifiers, and lineage references are filtered against persisted facts and messages. Manual edits increment the blueprint version and retain manual-edit metadata. Pressure Test results are version-linked snapshots stored separately from the blueprint and never apply changes automatically.

Missing provider configuration and all bounded provider failures activate Reliable mode. Reliable mode uses the same canonical schemas, decisions, persistence paths, and UI workflow as AI-enhanced mode. The UI receives only the engine state and safe explanations, never credentials, raw provider data, or hidden reasoning.

The `workflow_requests` table provides owner-scoped idempotency for blueprint generation and Pressure Test operations. The existing discovery request records continue to prevent duplicate discovery messages. Both tables are protected by RLS and project-ownership policies.
