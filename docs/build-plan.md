# mycellium studio build phases

## Phase 1 - application and domain foundation

Status: implemented on `feat/fullstack-mvp`.

- Preserved the static prototype under `legacy-static/`.
- Added Next.js App Router, TypeScript, Tailwind CSS, ESLint, and Vitest.
- Added canonical Zod plan schemas, a deterministic planner, and typed exports.
- Added the initial server-rendered landing page and architecture documentation.

## Phase 2 - secure personal-user foundation

Status: implemented on `feat/fullstack-mvp`.

- Added typed Supabase SSR clients and Next.js Proxy session refresh.
- Added email/password signup, confirmation, login, logout, and protected routes.
- Added profiles, projects, and discovery messages with constraints and triggers.
- Enabled RLS with explicit personal-ownership policies.
- Added dashboard and project create, read, metadata update, rename, duplicate, and delete flows.
- Added loading, error, and empty states.
- Added focused tests for environment, project, ownership, duplication, schemas, and safe errors.
- Documented database, Auth, redirect, deployment, and two-user RLS setup.

Acceptance gates:

```bash
npm install
npm test
npm run lint
npx tsc --noEmit
npm run build
npm audit
```

## Deferred beyond Phase 2

- Conversational discovery and OpenAI/LLM calls
- Complete plan editor and workspace
- Billing and subscriptions
- Teams and collaboration
- Direct external integrations

These are not stubbed with fake output or privileged credentials. A later phase must define its own scope and security review before implementation.

## Phase 3A - product experience and brand system

Status: implemented on `feat/fullstack-mvp`.

- Added the original rooted-M SVG logo, favicon, touch icon, lockup, and social card.
- Established semantic color, typography, spacing, focus, and motion tokens.
- Built the complete responsive marketing experience and interactive product-stage example.
- Polished authentication, dashboard, project cards, forms, loading, error, and empty states.
- Replaced browser confirmation prompts with an accessible native dialog.
- Added metadata, canonical URL handling, Open Graph, and Twitter presentation.
- Added component-level interaction and accessibility-sensitive tests.
- Documented logo usage, tokens, primitives, motion, accessibility, content, and responsive rules.

Phase 3A does not add OpenAI calls, adaptive discovery, generated-plan persistence, complete project editing, billing, teams, or integrations.

## Phase 3A.5 - signature experience

Status: implemented on `feat/fullstack-mvp`.

- Introduced the Living Architecture Product Graph as a shared hero, narrative, and workflow language.
- Added a five-stage scroll story with a sticky desktop visualization and complete mobile/static fallback.
- Rebuilt the fixed-data Discover, Architect, and Execute example with keyboard-operable tabs.
- Added readiness, scope, dependency, work-hierarchy, and sprint-allocation diagrams.
- Defined explicit spatial elevation and motion tiers with reduced-motion behavior.
- Carried calmer versions of the surface language into authentication, dashboard, project, empty, loading, and error states.
- Preserved the Phase 3A authentication, Supabase, CRUD, RLS, metadata, and responsive behavior.

Phase 3A.5 remains presentation-only. It makes no external model request and does not add adaptive discovery or new persistence behavior.

## Phase 3B - core product experience

Status: implemented on `feat/fullstack-mvp`.

- Added the responsive conversation and Living Product Graph workspace.
- Added adaptive fact extraction, explicit unknowns, contradiction history, graph changes, and rooted readiness.
- Added persisted review, assumption decisions, contradiction resolution, acceptable unknowns, and context approval.
- Added a skippable, reduced-motion-safe architecture reveal.
- Added a versioned canonical Product Blueprint with visible lineage and controlled editing.
- Added authenticated discovery, review, blueprint, and persisted export APIs.
- Added optional server-only OpenAI Responses structured output with bounded retry/timeout and contract-identical deterministic fallback.
- Added a Phase 3B migration for approval/version metadata and idempotent discovery requests under RLS.

Phase 3B does not add billing, subscriptions, teams, collaboration, or external publishing integrations.

## Preservation policy

`legacy-static/` is the immutable reference snapshot for the pre-Next.js prototype. Modern application work must not silently rewrite that snapshot.
