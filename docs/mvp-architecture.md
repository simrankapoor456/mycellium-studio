# mycellium studio MVP architecture

## Phase 1 objective

Phase 1 creates a reliable application and domain foundation. It proves that a project brief can be validated, transformed deterministically into a typed execution plan, and serialized into portable formats before any persistence, AI, account, or integration layer is introduced.

## System boundary

```text
Validated planner input
        |
        v
Deterministic planning domain
        |
        v
Canonical PlanOutput
        |
        +--> Markdown
        +--> JSON
        +--> CSV
```

Every box in this flow runs locally and synchronously. Phase 1 does not send data over the network or retain it between requests.

## Layers

### Presentation

`app/` and `components/marketing/` contain the Next.js App Router shell. The landing page is a Server Component tree and renders a deterministic sample plan to demonstrate that the presentation layer can consume the canonical domain output.

The landing page is intentionally not a project workspace. Interactive intake, plan editing, account state, and saved projects are outside Phase 1.

### Domain contracts

`lib/domain/plan/schemas.ts` is the canonical runtime contract. Zod schemas own validation and defaults; TypeScript types are inferred from them. Snake-case fields in `PlanOutput` keep JSON exports stable and compatible with the vocabulary established by the prototype.

The output contract carries `schema_version: "1.0"`. Future breaking changes must introduce a new version and a deliberate migration path.

### Planning engine

`lib/planner/` contains pure functions and immutable catalogs. `generatePlan`:

1. validates and normalizes input;
2. selects relevant feature definitions;
3. creates epics, stories, tasks, and acceptance criteria;
4. allocates stories into capacity-aware sprints;
5. computes risks and review questions;
6. validates the final object against `PlanOutputSchema`.

The engine uses no timestamps, random identifiers, environment variables, network calls, or mutable shared state. Equal input therefore produces structurally equal output.

### Export adapters

`lib/exports/` contains pure transforms from `PlanOutput` into Markdown, JSON, and CSV. These are downloads and data representations, not external publishing integrations. No Jira, Trello, Notion, Slack, or similar client is present.

### Verification

Vitest covers schema defaults, deterministic output, sprint allocation, and export behavior. ESLint, strict TypeScript, and the Next.js production build form the required static and compilation gates.

## Dependency direction

```text
app/components --> planner --> domain schemas
app/components -------------> domain schemas
exports --------------------> domain schemas/selectors
planner --------------------> domain schemas/selectors
```

The domain layer does not import framework code. Export utilities do not import UI code. This allows later interfaces to reuse the same contracts without coupling the planner to Next.js.

## Foundational folders

```text
app/                    Route-level presentation
components/             Reusable presentation components
lib/domain/             Runtime contracts and inferred types
lib/planner/            Deterministic domain behavior
lib/exports/            Portable serialization
tests/                  Automated verification
docs/                   Architecture and delivery boundaries
legacy-static/          Preserved prototype
```

New folders for database clients, authentication, AI providers, billing, teams, or integrations should not be added until a later phase explicitly authorizes them.

## Deployment posture

The application is a standard Next.js project and can be built with `npm run build`. No provider-specific configuration is required in Phase 1. Runtime secrets are neither used nor expected.
