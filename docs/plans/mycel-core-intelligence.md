# Mycel Core intelligence milestone

Status: Implemented; authenticated browser verification pending

## WORKFLOW STATE

Package Manager: npm (via `packageManager` in `package.json`)
Framework: Next.js App Router with React and TypeScript
Verification: `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm audit`, `git diff --check`
Branch: `feat/fullstack-mvp`

## Outcome

Route discovery, review, blueprint generation, Pressure Test, editing, and exports through an explicit three-layer Mycel Core boundary while preserving owner isolation, row-level security, Reliable mode, accessibility, and the canonical blueprint contract.

## Architecture decisions

- Identity: the authenticated Supabase user remains the sole project owner.
- Cardinality: a project has one versioned working-memory document, one approved context snapshot, one current blueprint, and one separate Pressure Test snapshot.
- Lifecycle: provider output is a transient proposal; the Decision Layer validates and normalizes it; only deterministic execution persists an approved result.
- Ownership: every read and mutation remains constrained by both project ID and authenticated user ID, with RLS as a second boundary.
- Derivation: graph, readiness, challenges, blueprint lineage, and exports derive from validated persisted state.
- Idempotency: discovery retains its existing request records; generation uses a generic owner-scoped workflow request record.
- Compatibility: new working-memory fields use schema defaults so existing Phase 3B JSON remains readable.
- Failure behavior: any absent provider configuration, timeout, refusal, provider error, malformed response, schema failure, or policy rejection activates Reliable mode.

## Implementation phases

1. Canonical schemas, decisions, policies, and layered module boundaries.
2. Orchestrated discovery, review, generation, graph actions, and persistence.
3. Pressure Test, explainability, export enrichment, and UI states.
4. Migration, documentation, safe errors, and terminology cleanup.
5. Unit, integration, browser workflow, and responsive verification.

## Completion criteria

- Route handlers contain transport concerns only and call Mycel Core orchestration.
- Provider code cannot write persistent state.
- Decision results are typed and include safe explanations.
- Discovery remains multi-turn and resumable, including challenge and graph state.
- Context approval and blueprint generation enforce contradiction and challenge gates.
- Pressure Test findings remain separate from the blueprint until a user chooses an action.
- Exports read the latest persisted blueprint and include a Pressure Test summary when present.
- Required automated and browser checks are reported accurately.
