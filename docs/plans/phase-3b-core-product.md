# Phase 3B core product

Status: Complete

## WORKFLOW STATE

Package Manager: npm (via package.json packageManager field)
Framework: Next.js App Router 16.2.10 with React 19, TypeScript 6, Tailwind CSS 4, and Supabase SSR
Verification: npm install, npm test, npm run lint, npx tsc --noEmit, npm run build, npm audit, git diff --check, browser review at 375/768/1024/1440

## Objective

Deliver the authenticated Conversation to Living Product Graph to Readiness to Architecture Reveal to Editable Product Blueprint workflow. Preserve Phase 1 through Phase 3A.5 behavior and keep OpenAI optional behind a server-only boundary.

## Domain decisions

- Identity and ownership: every request derives the user from the Supabase SSR session; project ownership is checked in queries and remains enforced by RLS.
- Cardinality: a project has many ordered discovery messages, one current discovery context, one readiness state, one approved context snapshot, and one current canonical blueprint.
- Lifecycle: discovery context increments a version per completed turn; approval snapshots that version; blueprint generation requires the approved snapshot; edits increment the blueprint version.
- Persistence: messages remain rows; structured context, readiness, and blueprint remain validated JSONB documents in the existing project columns.
- Idempotency: a new discovery_requests table owns one client request UUID per project and stores pending/completed/failed state plus the completed response.
- Lineage: facts, requirements, decisions, epics, stories, tasks, and sprints store explicit source message IDs, fact IDs, requirement IDs, generated-from IDs, and source type. No chain-of-thought or hidden reasoning is requested or stored.
- Provider boundary: the official OpenAI Node SDK is imported only from server-only modules. Blank provider variables select deterministic behavior without an error.

## Routes and APIs

- `/projects/[id]/discover`: responsive conversation and live graph workspace.
- `/projects/[id]/review`: fact editing, assumption decisions, contradiction resolution, acceptable unknowns, and approval.
- `/projects/[id]`: blueprint overview with blueprint/document modes and controlled editing.
- `POST /api/projects/[id]/discovery`: authenticated adaptive discovery turn.
- `PATCH /api/projects/[id]/review`: authenticated review mutation or approval.
- `POST /api/projects/[id]/blueprint`: generate from approved context through AI or fallback.
- `PATCH /api/projects/[id]/blueprint`: controlled canonical entity edit.
- `GET /api/projects/[id]/exports/[format]`: export the currently persisted blueprint.

## Implementation sequence

1. Add canonical discovery, graph, readiness, lineage, and blueprint Zod contracts.
2. Add deterministic extraction, contradiction, question, readiness, graph-change, blueprint, lineage, editing, and export services.
3. Add the Phase 3B migration, typed database rows, ownership-scoped persistence, and idempotency operations.
4. Add the optional server-only Responses API integration with strict structured output, timeout, one retry, validation, and fallback.
5. Add authenticated route handlers and safe response contracts.
6. Build the discovery workspace, accessible graph, review screen, architecture reveal, blueprint/document views, editing, and downloads.
7. Add focused domain, API-contract, interaction, reduced-motion, keyboard, bounded-context, editing, and export tests.
8. Update architecture, schema, setup, and phase documentation; verify bundle and responsive behavior; review, commit logically, and push.

## Performance and accessibility budgets

- No graph or animation library; use deterministic SVG and semantic HTML fallback.
- Keep the workspace client bundle below 60 KB gzip incremental.
- No continuous animation or scroll listener; graph state changes occur only after a completed turn.
- Architecture reveal lasts about 1.8 seconds, is skippable, and becomes immediate under reduced motion.
- Mobile uses accessible tabs and a structured graph list without page-level horizontal overflow.
- Graph nodes are focusable, selectable with Enter/Space, and mirrored by a readable detail panel.
- All provider and persistence failures resolve to safe text and a retry path.

## Proof

- Blank OpenAI variables support the complete workflow using identical response and blueprint contracts.
- Refresh restores messages, facts, readiness, approval, blueprint, lineage, and edits.
- Duplicate discovery request IDs do not create duplicate turns.
- Blueprint generation is impossible without ownership and an approved context snapshot.
- Exports parse the persisted edited blueprint immediately before serialization.
- Existing authentication, CRUD, RLS, landing page, metadata, and Phase 3A.5 tests remain green.

## Verification record

- `npm install`: completed with the Phase 3B OpenAI SDK dependency installed.
- `npm test`: 10 test files and 52 tests passed.
- `npm run lint`: passed with no ESLint findings.
- `npx tsc --noEmit`: passed with no TypeScript errors.
- `npm run build`: passed on Next.js 16.2.10; all Phase 3B routes compiled.
- `git diff --check`: passed; only Windows line-ending notices were reported.
- Secret hygiene: `.env.local` is ignored, OpenAI values remain blank locally, and no supplied Supabase URL or key value is tracked.
- Responsive review: public shell checked at 375, 768, 1024, and 1440 px without page-level horizontal overflow.
- Accessibility review: public mobile Lighthouse accessibility scored 100; discovery graph interaction has keyboard and reduced-motion tests.
- Workspace client chunks remain below the 60 KB gzip incremental budget; the landing-specific client chunk did not grow from the Phase 3A.5 baseline.
- `npm audit`: two moderate PostCSS advisories remain through Next.js; npm offers only a forced breaking downgrade, so no unsafe automatic remediation was applied.
