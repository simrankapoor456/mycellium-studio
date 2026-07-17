# mycellium studio MVP architecture

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

`lib/planner/` and `lib/exports/` remain pure and deterministic. They do not import authentication, Supabase, or UI code. Phase 2 does not connect the deterministic demonstration planner to persisted projects.

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
