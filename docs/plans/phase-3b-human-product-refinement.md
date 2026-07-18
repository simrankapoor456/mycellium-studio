# Phase 3B human product refinement

Status: Complete

## WORKFLOW STATE

Package Manager: npm (via package.json packageManager field)
Framework: Next.js App Router 16.2.10 with React 19, TypeScript 6, and Tailwind CSS 4
Verification: npm test, npm run lint, npx tsc --noEmit, npm run build, git diff --check, browser export regression
Skill note: the frontend-dev plugin's referenced shared/workflow.md is absent from the installed package; available TypeScript, React, Next.js, styling, and component patterns are being applied directly.

## Objective

Make Phase 3B feel like a distinctive, warm, precise AI Product Architect while making export availability obvious before and after blueprint generation.

## Implementation sequence

1. Centralize deterministic Mycellium voice, readiness, contradiction, transition, fallback, generation, empty-state, review, and export copy.
2. Apply the voice system to discovery, review, generation, blueprint, errors, loading, and key surrounding product surfaces.
3. Add persistent project navigation with an always-visible Export destination.
4. Add a dedicated export surface with a clear locked state, direct Markdown/JSON/CSV actions, download success feedback, and mobile visibility.
5. Expose exports from the blueprint header and post-generation completion state.
6. Add deterministic copy, readiness, contradiction, export visibility/state, download, mobile, and persistence regression coverage.
7. Run quality gates, browser review, logical commits, and push feat/fullstack-mvp.

## Product decisions

- Copy variation is selected from stable input-derived hashes; no runtime randomness affects wording or tests.
- Precise statuses remain in detail content, while primary labels describe user progress in plain language.
- Exports always read the persisted blueprint from the authenticated server route, so edits and refreshes cannot diverge from downloads.
- Export navigation remains visible when locked and explains the exact unlock condition.
- Provider absence is described as Reliable mode, with deterministic planning disclosed without framing it as an error.

## Verification Results

- **Unit and component tests:** `npm test` — PASSED, 11 files and 58 tests.
- **Browser regression:** `npm run test:e2e` — 4 authenticated export cases collected and 4 skipped because dedicated E2E credentials/project fixtures were not present.
- **Signed-in browser review:** PASSED for always-visible Export navigation, the no-blueprint explanation, disabled Markdown/JSON/CSV states, Reliable mode disclosure, Foundation strength messaging, and 375 px mobile access without horizontal overflow.
- **Authenticated edit/download verification:** remains executable through `e2e/export-flow.spec.ts`; it requires local `E2E_EMAIL`, `E2E_PASSWORD`, and project fixture IDs. The existing user project was not mutated to manufacture this state.
- **Lint:** project script (`npm run lint`) — PASSED.
- **Typecheck:** `npx tsc --noEmit` — PASSED.
- **Production build:** `npm run build` — PASSED; `/projects/[id]/export` compiled as an authenticated dynamic route.
- **Diff hygiene:** `git diff --check` — PASSED after final documentation updates.

## Remaining limitations

- Discovery messages already persisted before this refinement retain their original wording; all new deterministic and AI-guided turns use the centralized voice contract.
- The full browser edit-and-download flow needs a disposable authenticated E2E account plus blueprint, empty, and fallback project fixtures to run without skips.
