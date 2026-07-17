# mycellium studio build phases

## Phase 1 — application and domain foundation

Status: implemented on `feat/fullstack-mvp`.

- Preserved the static prototype under `legacy-static/`.
- Added Next.js App Router, TypeScript, Tailwind CSS, ESLint, and Vitest.
- Added canonical Zod plan schemas, a deterministic planner, and typed exports.
- Added the initial server-rendered landing page and architecture documentation.

## Phase 2 — secure personal-user foundation

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

## Preservation policy

`legacy-static/` is the immutable reference snapshot for the pre-Next.js prototype. Modern application work must not silently rewrite that snapshot.
