# Mycellium Studio

Mycellium Studio turns an early product idea into grounded understanding, architecture, requirements, and reviewable execution plans. Phase 3A adds the original rooted-M identity, complete marketing experience, and a polished authenticated product shell around the secure Phase 2 foundation.

## Phase 3A status

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
- Preserved static prototype in [`legacy-static/`](./legacy-static/)

Intentionally deferred:

- Conversational discovery and OpenAI calls
- Complete project editor and generated-plan workspace
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

   The OpenAI fields stay blank in Phase 2.

3. Apply the checked-in Supabase migration and configure Auth by following [Supabase setup](./docs/supabase-setup.md).

4. Start the app:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Quality commands

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

Inspect dependency advisories with `npm audit`; do not apply forced major upgrades without review.

## Project structure

```text
app/                         Public, auth, and protected App Router routes
components/                  Marketing, authentication, and project UI
lib/auth/                    Verified user resolution and auth schemas
lib/domain/                  Canonical Zod contracts and pure business logic
lib/projects/                Auth-scoped project persistence operations
lib/discovery/               Auth-scoped discovery persistence operations
lib/supabase/                Typed browser, server, and Proxy clients
supabase/migrations/         Versioned schema, trigger, and RLS SQL
tests/                       Pure unit and contract tests
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
