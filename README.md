<p align="center">
  <img src="public/brand/mycellium-lockup-horizontal.svg" alt="Mycellium Studio" width="520" />
</p>

<p align="center"><strong>Ideas take root. Products take shape.</strong></p>

<p align="center">
  A living product-intelligence system that turns scattered context into grounded discovery,<br />
  traceable architecture, and editable Product Blueprints.
</p>

<p align="center">
  <a href="docs/phase-7-2-review.md"><strong>View the product experience</strong></a>
  &nbsp;&middot;&nbsp;
  <a href="docs/mvp-architecture.md"><strong>Explore the architecture</strong></a>
  &nbsp;&middot;&nbsp;
  <a href="docs/supabase-setup.md"><strong>Set up locally</strong></a>
</p>

## What Mycellium Studio does

Mycellium Studio keeps product intent connected from the first source material through discovery, approved foundations, architecture, and exportable execution structure. Mycel Core separates proposals from decisions and deterministic persistence, while Reliable mode keeps the same typed workflow available when provider generation is not configured.

Current capabilities include:

- adaptive discovery with explicit facts, unknowns, contradictions, readiness, and graph changes
- a persistent Living Product Graph and seven-area Foundation Map
- human approval with visible lineage and focused blocker recovery
- editable, versioned Product Blueprints with Markdown, JSON, and CSV exports
- optional structured OpenAI generation behind a server-only boundary
- deterministic Reliable mode using the same canonical Zod contracts
- private Supabase-backed projects protected by ownership checks and row-level security

## Current visuals

| Public experience | Mobile composition |
| --- | --- |
| ![Mycellium Studio landing page](docs/assets/landing-desktop.png) | ![Mycellium Studio mobile landing page](docs/assets/landing-mobile.png) |

![Mycellium Studio authentication experience](docs/assets/authentication.png)

Authenticated screenshots are intentionally absent because no reusable test account was available for this visual pass. The exact capture steps are recorded in [the Phase 7.1 review](docs/phase-7-1-review.md).

## Product journey

```mermaid
flowchart LR
  A[Messy context] --> B[Discovery]
  B --> C[Living Product Graph]
  C --> D[Foundation Review]
  D --> E[Architecture]
  E --> F[Product Blueprint]
  F --> G[Export]
```

Every transition is grounded in persisted state. Approval remains human-controlled, and exported artifacts stay linked to the facts and decisions that shaped them.

## Mycel Core architecture

```mermaid
flowchart TD
  A[User context and persisted state] --> B[AI proposal layer]
  B --> C[Decision Layer]
  A --> R[Reliable mode]
  R --> C
  C --> D[Deterministic Execution Layer]
  D --> E[Living Product Graph]
  D --> F[Product Blueprint]
  D --> G[Portable exports]
```

The proposal layer cannot write application data. The Decision Layer owns authentication, authorization, typed validation, workflow gates, and trusted identifiers. Only deterministic execution reads and writes persisted state.

## Signature capabilities

- **Living Product Graph:** facts, uncertainties, dependencies, and lineage remain visible as understanding grows.
- **Foundation Review:** approval is blocked only by explicit, recoverable conditions.
- **Mycel Core:** AI proposals, product decisions, and deterministic execution have separate authority.
- **Reliable mode:** missing or invalid provider output falls back safely without changing the product contract.
- **Product Blueprint:** architecture, requirements, work structure, and exports remain editable and versioned.
- **Living interface:** a radial identity, environmental public story, calm workspace shell, reduced motion, and responsive composition form one coherent system.

## Technology

- Next.js 16 App Router and React 19
- strict TypeScript and canonical Zod schemas
- Tailwind CSS 4 plus centralized semantic CSS tokens
- Supabase SSR authentication, PostgreSQL, and row-level security
- OpenAI Responses API as an optional server-only proposal source
- GSAP with a client-only adapter for selected public transitions; Lenis remains dormant
- Vitest, Testing Library, and Playwright
- ESLint and npm audit

## Local setup

Requirements: Node.js 22 or newer, npm 11.6.1, and a Supabase project.

1. Install dependencies.

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local`. Keep `.env.local` untracked.

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   OPENAI_API_KEY=
   OPENAI_MODEL=
   ```

   Leave both OpenAI fields blank to use Reliable mode. Set both only when enabling optional provider generation.

3. Apply the checked-in Supabase migrations and configure Auth using [the setup guide](docs/supabase-setup.md).

4. Start the application.

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
npm audit
```

Authenticated Playwright coverage uses optional local variables: `E2E_EMAIL`, `E2E_PASSWORD`, `E2E_PROJECT_ID`, `E2E_EMPTY_PROJECT_ID`, and `E2E_FALLBACK_PROJECT_ID`. Set `E2E_BASE_URL` only when the app is not at `http://127.0.0.1:3000`. Never commit test credentials.

## Project structure

```text
app/                         Public, auth, API, and protected App Router routes
components/                  Brand, marketing, shell, product, and shared UI
lib/domain/                  Canonical schemas and pure business logic
lib/mycel-core/              Proposal, decision, and execution boundaries
lib/projects/                Auth-scoped project persistence
lib/discovery/               Discovery state and persistence
lib/blueprint/               Generation, editing, lineage, and exports
lib/profile/                 Owner-scoped profile operations
lib/supabase/                Typed browser, server, and Proxy clients
lib/voice/                   Deterministic product voice and state copy
public/brand/                Production identity, icons, and social assets
supabase/migrations/         Versioned schema, triggers, and RLS
tests/                       Unit, contract, and component behavior tests
e2e/                         Public and authenticated Playwright coverage
docs/                        Architecture, design, setup, and phase records
legacy-static/               Preserved pre-Next.js prototype
```

## Documentation

- [Art direction](docs/phase-7-1-art-direction.md)
- [Design system](docs/design-system.md)
- [Phase 7.1 review](docs/phase-7-1-review.md)
- [Phase 7.2 review](docs/phase-7-2-review.md)
- [Phase 7.3 scroll-story concept](docs/phase-7-3-scroll-story-concept.md)
- [MVP architecture](docs/mvp-architecture.md)
- [Supabase and authentication setup](docs/supabase-setup.md)
- [Canonical output contract](docs/output-schema.md)
- [Build phases](docs/build-plan.md)
- [Product charter](docs/project-charter.md)

## Product principles

- Ground claims in visible context and persisted state.
- Keep human authority explicit at consequential transitions.
- Make uncertainty legible instead of hiding it behind confidence theater.
- Keep provider behavior replaceable and deterministic behavior dependable.
- Use expressive atmosphere publicly and calm precision inside the workspace.
- Preserve portable artifacts so product intent can move beyond the application.

## Project status

Implemented: the complete personal-user journey from authentication through discovery, foundation approval, blueprint generation, editing, and export; Mycel Core boundaries; Reliable mode; the living identity and application shell; and the Phase 7.2 route, trust, interaction, and profile refinements.

Active development: the deeper scroll story and Living Product Graph are reserved for Phase 7.3. Advanced reasoning visualization, Blueprint Studio, and Living Workspace remain later milestones.

Intentionally deferred: billing, teams, collaboration, and external integrations.

## Contributing and security

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a change. Report security concerns through the private process in [SECURITY.md](SECURITY.md), not a public issue.
