# Phase 6 core journey stabilization

Status: Implemented; authenticated browser verification pending

## WORKFLOW STATE

Package Manager: npm (via `packageManager` in `package.json`)
Framework: Next.js App Router with React and strict TypeScript
Verification: `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm audit`, `git diff --check`, Playwright
Branch: `feat/fullstack-mvp`

## Outcome

Make the owner-scoped journey from unstructured source material through discovery, foundation approval, architecture, a persisted Product Blueprint, and export understandable and recoverable at every step. Extend the same system with a calmer signature interface and safe personal profile settings.

## Decisions

- Approval denial returns a typed blocker inventory with stable focus targets; the client announces, scrolls to, and highlights those items.
- Blueprint generation keeps one request identifier across retry, resets failed workflow records safely, persists the request identifier with the blueprint, and navigates only after a validated response exists.
- The generation workspace distinguishes the server request from the post-response architecture reveal so visual stages never imply unconfirmed server progress.
- Custom product type uses a constrained enum value plus a separate validated label. Existing stored product types remain readable.
- The Foundation Map derives seven area states from persisted facts, gaps, contradictions, challenges, and readiness without a chart dependency.
- Project journey navigation derives availability and completion from persisted project state and renders locked steps as non-links.
- Profile settings use owner-scoped profile rows plus Supabase user-update flows. Account removal remains truthful guidance because no privileged server credential is introduced.
- Team foundations remain deferred unless the authenticated core workflow is proven after all P0–P4 work.

## Phases

1. Repair approval details, focus behavior, workflow retry, generation navigation, and persistence recovery.
2. Verify blueprint editing, reload behavior, export unlocking, and edited export content.
3. Expand intake and product types; improve adaptive discovery and narrative foundation review.
4. Add the Foundation Map, persisted journey rail, signature application/marketing styling, and data-driven architecture reveal.
5. Add profile settings and the required additive migration.
6. Add focused tests, perform browser and accessibility review, run all quality gates, and review the complete diff.

## Completion boundary

The implementation may be committed and pushed with an explicit browser blocker, but the journey will not be reported as fully passing unless an authenticated browser session completes the persisted flow and verifies all three edited exports.
