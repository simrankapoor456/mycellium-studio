# Contributing to Mycellium Studio

Thank you for helping improve Mycellium Studio. Keep changes grounded in the product charter, preserve the trust boundary, and make the smallest coherent change that solves the stated need.

## Before you start

- Read the [architecture](docs/mvp-architecture.md), [design system](docs/design-system.md), and relevant phase plan.
- Open an issue for a substantial product or architecture change before implementation.
- Do not commit `.env.local`, credentials, user data, or generated provider output.
- Do not edit an applied migration. Add a forward-only migration when a real data change requires one.
- Keep the application domain-agnostic and avoid fabricated claims or customer data.

## Local workflow

1. Create a focused branch from the current development branch.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env.local` and add only your own local public Supabase values.
4. Implement the change with canonical schemas and existing shared components.
5. Add behavior-focused tests. Avoid assertions tied to exact pixels or animation duration.
6. Run the full quality gate:

   ```bash
   npm test
   npm run lint
   npx tsc --noEmit
   npm run build
   npm run test:e2e
   npm audit
   git diff --check
   ```

Authenticated browser tests require the optional local `E2E_*` values documented in the README. Never place those values in a tracked file.

## Code expectations

- Parse inputs and persisted outputs at trust boundaries with Zod.
- Resolve user identity on the server and preserve owner filters plus RLS.
- Keep provider code in the proposal layer; it must not write application state.
- Preserve deterministic Reliable mode for every optional provider path.
- Prefer Server Components for data loading and use Client Components only for interaction.
- Use semantic tokens and shared primitives instead of route-local visual values.
- Preserve keyboard behavior, visible focus, reduced motion, readable labels, and status text.
- Update documentation when a public contract, setup step, design token, or architecture boundary changes.

## Commits and pull requests

Use concise imperative commits grouped by purpose. A pull request should explain what changed, why it belongs in scope, how it was tested, and what remains intentionally untouched. Include genuine screenshots for visible changes and note any browser path that could not be verified.

Keep generated dependencies, build output, local browser artifacts, and secrets out of the diff. Review the complete staged diff before requesting review.
