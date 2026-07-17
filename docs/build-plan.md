# mycellium studio build phases

## Phase 1 — application and domain foundation

Status: implemented on `feat/fullstack-mvp`.

Deliverables:

- Preserve the complete static prototype under `legacy-static/`.
- Bootstrap Next.js App Router with TypeScript and Tailwind CSS.
- Configure ESLint, Vitest, coverage, and production build scripts.
- Add `.gitignore` and a secret-free `.env.example`.
- Establish presentation, domain, planner, export, test, and documentation folders.
- Define canonical Zod input and output schemas.
- Implement a typed deterministic planner.
- Implement typed Markdown, JSON, and CSV export utilities.
- Ship an initial server-rendered landing-page shell.
- Document architecture, contracts, scope, and local setup.

Acceptance gates:

```bash
npm install
npm test
npm run lint
npx tsc --noEmit
npm run build
```

## Deferred beyond Phase 1

The following capabilities are intentionally not designed or implemented in this phase:

- Supabase or any database
- Authentication and authorization
- Persisted projects or a complete project workspace
- AI or LLM API calls
- Billing and subscriptions
- Teams or collaboration
- Direct external integrations

Later phases should begin with a separate scope decision, architecture review, and acceptance criteria. Phase 1 does not preselect vendors or create placeholder clients for these capabilities.

## Preservation policy

`legacy-static/` is the immutable reference snapshot for the pre-Next.js prototype. Changes to the modern application must not silently rewrite that snapshot. If a future preservation correction is necessary, it should be isolated and explained in its own commit.
