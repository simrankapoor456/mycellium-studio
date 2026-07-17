# mycellium studio

mycellium studio turns an early software brief into a grounded, reviewable execution plan. Phase 1 establishes the full-stack application foundation and a deterministic local planning domain without connecting external services.

## Phase 1 status

Included:

- Next.js App Router and React
- Strict TypeScript
- Tailwind CSS
- ESLint flat configuration
- Vitest and coverage tooling
- Canonical Zod input and output schemas
- Deterministic typed planner
- Typed Markdown, JSON, and CSV export utilities
- Initial server-rendered landing page
- Preserved static prototype in [`legacy-static/`](./legacy-static/)

Not included:

- Supabase or database persistence
- Authentication or authorization
- AI or LLM API calls
- A complete project workspace
- Billing, teams, or external integrations

## Requirements

- Node.js 20.9 or newer
- npm (the repository records npm 11.6.1 in `packageManager`)

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Phase 1 does not require environment variables or secrets. `.env.example` is intentionally a placeholder for documented future configuration.

## Quality commands

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

Generate a coverage report with `npm run test:coverage`.

## Project structure

```text
app/                         Next.js routes, layout, and global styles
components/marketing/        Landing-page components
lib/domain/plan/             Canonical schemas, inferred types, selectors
lib/planner/                 Pure deterministic planning engine
lib/exports/                 Typed Markdown, JSON, and CSV transforms
tests/                       Vitest unit tests
docs/                        Scope, contracts, and architecture decisions
legacy-static/               Verbatim pre-Next.js prototype snapshot
```

## Domain contract

`PlanningInputSchema` validates every planner request and applies explicit defaults. `generatePlan` returns data validated by `PlanOutputSchema`; all public types are inferred from those schemas. The planner uses no randomness, timestamps, network access, browser state, or persistence, so identical input produces identical output.

```ts
import { generatePlan } from "@/lib/planner/generate-plan";

const plan = generatePlan({
  brief: "Build a planning tool for small teams with sprint-ready exports.",
  projectName: "Example Project",
});
```

## Documentation

- [MVP architecture](./docs/mvp-architecture.md)
- [Canonical output contract](./docs/output-schema.md)
- [Build phases and boundaries](./docs/build-plan.md)
- [Product charter](./docs/project-charter.md)

## Legacy prototype

The complete prototype that preceded the Next.js bootstrap is retained under `legacy-static/`, including its original README, server, HTML, CSS, JavaScript, Vercel configuration, and documentation. It is reference material and is excluded from the current lint and TypeScript scopes.
