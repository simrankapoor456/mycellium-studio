# Mycellium Studio

Mycellium Studio turns an early product idea into grounded understanding, architecture, requirements, and reviewable execution plans. Its AI Product Architect combines warm, precise discovery with a Living Product Graph, human approval, an editable Product Blueprint, and portable exports.

## Mycel Core intelligence status

Included:

- Next.js 16 App Router, strict TypeScript, Tailwind CSS, ESLint, and Vitest
- Supabase SSR browser/server clients and cookie session refresh through Next.js Proxy
- Email/password signup, confirmation, login, logout, and protected routes
- Profiles, projects, and discovery-message tables with constraints, indexes, triggers, and RLS
- Personal dashboard and project create/read/update/rename/duplicate/delete workflows
- Hand-authored SVG logo, favicon, wordmark, lockup, touch icon, and social card
- Responsive landing page with fixed-data Discover, Architect, and Execute interaction
- Shared brand, layout, button, card, badge, form, loading, empty, tabs, and dialog patterns
- Polished authentication, dashboard, project forms, and project shell
- Canonical metadata, Open Graph, Twitter card, focus, motion, and reduced-motion behavior
- Canonical Zod validation at environment, form, and database boundaries
- Deterministic Phase 1 planner and typed export utilities
- Adaptive discovery with explicit facts, unknowns, contradictions, readiness, and graph changes
- Persisted review approval, visible lineage, and an editable Product Blueprint
- Optional server-only OpenAI Responses API structured output with deterministic fallback
- Explicit AI, Decision, and Deterministic Execution layers under `lib/mycel-core/`
- Owner-scoped workflow idempotency, rate policies, challenge gates, and trusted generated IDs
- Persisted product challenges, graph fact controls, and non-mutating Pressure Test findings
- Persisted Markdown, JSON, and CSV blueprint exports
- Always-visible export navigation, locked-state guidance, direct downloads, and download success feedback
- Long-form source-material intake, custom product types, and working-memory-aware discovery questions
- Typed approval blockers with focused recovery actions and the interactive seven-area Foundation Map
- Recoverable, idempotent blueprint generation with a data-driven architecture reveal and automatic navigation
- Persisted six-stage project journey and owner-scoped profile settings
- Centralized deterministic Mycellium voice for discovery, readiness, review, generation, errors, and exports
- Preserved static prototype in [`legacy-static/`](./legacy-static/)

Intentionally deferred:

- Billing, teams, collaboration, and external integrations

## Requirements

- Node.js 22 or newer
- npm 11.6.1 (recorded in `packageManager`)
- A Supabase project for authentication and persistence

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in the public project values. Never commit `.env.local`.

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   OPENAI_API_KEY=
   OPENAI_MODEL=
   ```

   Keep both OpenAI fields blank to use the complete deterministic workflow. Set both only when enabling optional provider generation.

3. Apply the checked-in Supabase migration and configure Auth by following [Supabase setup](./docs/supabase-setup.md).

4. Start the app:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Quality commands

```bash
npm test
npm run test:e2e
npm run lint
npx tsc --noEmit
npm run build
```

Inspect dependency advisories with `npm audit`; do not apply forced major upgrades without review.

The Playwright export regression uses dedicated local variables and skips safely when they are absent: `E2E_EMAIL`, `E2E_PASSWORD`, `E2E_PROJECT_ID`, `E2E_EMPTY_PROJECT_ID`, and `E2E_FALLBACK_PROJECT_ID`. Set `E2E_BASE_URL` only when the app is not running at `http://127.0.0.1:3000`. Never commit E2E credentials.

## Project structure

```text
app/                         Public, auth, and protected App Router routes
components/                  Marketing, discovery, blueprint, profile, authentication, and project UI
lib/auth/                    Verified user resolution and auth schemas
lib/domain/                  Canonical Zod contracts and pure business logic
lib/projects/                Auth-scoped project persistence operations
lib/discovery/               Auth-scoped discovery persistence operations
lib/profile/                 Owner-scoped profile persistence operations
lib/blueprint/               Blueprint generation, editing, persistence, and exports
lib/mycel-core/              AI proposals, decision policies, and deterministic orchestration
lib/ai/                      Compatibility export for the server-only provider boundary
lib/voice/                   Centralized deterministic product voice and state copy
lib/supabase/                Typed browser, server, and Proxy clients
supabase/migrations/         Versioned schema, trigger, and RLS SQL
tests/                       Pure unit and contract tests
e2e/                         Authenticated Playwright workflow regressions
docs/                        Architecture, setup, scope, and delivery boundaries
legacy-static/               Verbatim pre-Next.js prototype snapshot
```

## Documentation

- [Supabase and authentication setup](./docs/supabase-setup.md)
- [Mycellium design system](./docs/design-system.md)
- [MVP architecture](./docs/mvp-architecture.md)
- [Canonical output contract](./docs/output-schema.md)
- [Build phases and boundaries](./docs/build-plan.md)
- [Product charter](./docs/project-charter.md)
