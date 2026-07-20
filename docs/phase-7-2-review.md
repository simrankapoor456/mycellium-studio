# Phase 7.2 review

## Outcome

Phase 7.2 turns the Phase 7.1 identity into a dependable interaction system. Public creation actions preserve intent through authentication, informational diagrams remain readable in every state, trust copy matches the implemented workflow, route failures offer safe recovery, and profile settings now expose clear independent save boundaries.

No database migration or new product capability was introduced. Authentication, owner isolation, row-level security, persistence, approval gates, Reliable mode, blueprint editing, lineage, and exports remain unchanged.

## Design principles applied

### Public narrative

- Keep complete meaning visible before animation; motion may add order and depth but cannot gate comprehension.
- Use progressive emphasis for current, connected, emerging, and future structure instead of treating future information as disabled.
- Make one creation intent canonical across navigation, hero, access, and closing actions.

### Trust and FAQ

- Describe system capabilities separately from live project status.
- Name boundaries plainly: personal ownership, optional provider enhancement, no file upload, no shared workspace, no billing flow, and no external publishing.
- Tie each workflow condition to the response the code actually supports.

### Profile and settings

- Give profile, email, and password operations independent forms, pending labels, success messages, and recoverable error messages.
- Show persisted account facts without inventing preferences, statistics, or controls.
- Explain confirmation and account-removal boundaries at the point where a person needs them.

### Shared product shell

- Keep interaction feedback immediate and semantic, with focus, active, disabled, pending, success, and error states that do not depend on glow or color alone.
- Preserve native application scrolling, route behavior, and editor-like surfaces.
- Use branded recovery states without exposing stack output or masking broken links.

## Route and CTA repair

The current branch did not reproduce a local missing `/signup` route. The source-level defect was that public creation actions pointed to a generic signup destination and discarded the intended project-creation route. That made behavior depend on deployment state and always sent a successful authentication to the dashboard.

The canonical contract is now:

1. Every public creation action points to `/signup?next=%2Fprojects%2Fnew`.
2. The `next` value is accepted only when it matches an allowlisted internal route.
3. Login, signup, email confirmation, and links between auth forms preserve the validated destination.
4. An already authenticated person who opens that signup URL is sent directly to `/projects/new`.
5. External, protocol-relative, malformed, and unknown return values fall back to `/dashboard`.

The exact cause of any earlier deployed 404 cannot be proven without the deployed URL and deployment record. The present source contains the signup route and passes local navigation checks. A stale or different deployment remains the likely deployment-side explanation; the intent-loss defect in source is now repaired independently.

## Public diagram and trust content

The product graph now exposes four named states. Node text stays at full opacity while fill, border, and connection weight establish hierarchy. The mobile fallback lists every node, supporting detail, and state in document order. The SVG retains a concise textual description, and the stage selector remains keyboard operable.

The Human Review panel is explicitly labeled as capability rules rather than current status. Its conditions now match the domain sequence:

- provider unavailable: Reliable mode remains available
- foundation unresolved: continue discovery or resolve decisions
- foundation approved: architect the product
- blueprint available: review, edit, or export saved state

FAQ language no longer presents deterministic output as identical to provider-enhanced interpretation. It also states current ownership, security boundaries, file-input limits, shared-workspace limits, billing status, portability paths, and removal guidance.

## Motion system

GSAP 3.15.0, `@gsap/react` 2.1.2, and Lenis 1.3.25 are incorporated from the preparation work. The only GSAP import boundary is `lib/motion/gsap-client.ts`. It registers `ScrollTrigger`, `SplitText`, and `useGSAP` in the browser.

Current GSAP use is deliberately small:

- one scoped, reduced-motion-aware hero copy entrance
- one word-level SplitText transition in the final public action section
- component-local refs, `gsap.matchMedia()`, `useGSAP`, and complete revert cleanup

The copied React Bits SplitText source was reduced to the behavior Mycellium uses, routed through the GSAP adapter, and hardened for static text, font readiness, reduced motion, and local trigger cleanup.

Lenis remains dormant. Native scrolling is more stable for the current anchor navigation, fixed public header, browser history, touch devices, and all authenticated forms and workspaces. It must never wrap the root layout or authenticated application. Phase 7.3 can reconsider a public-only instance only if measured scroll storytelling benefits justify it.

## Profile and recovery surfaces

Profile settings now group identity and context, security, and account guidance. Display name, avatar URL, timezone, and location share one explicit save boundary. Email and password each use a separate request with operation-specific pending copy. Messages use status or alert semantics, fields preserve hint and error association, and the initials fallback is never empty.

The root not-found view detects authentication and offers the safe home or dashboard destination. The route error boundary supports retry and known-route recovery without rendering the exception message.

## Responsive and accessibility review

Browser checks covered 375, 768, 1024, and 1440 pixel widths plus a 720 pixel wide zoom-equivalent view. Each measured width had zero page-level horizontal overflow. The public creation action remained visible, mobile navigation closed with Escape and on navigation, focus remained visible, and reduced motion removed positional animation without removing content.

Automated checks cover labels, native disclosures, graph alternatives, auth return validation, profile boundaries, route recovery source contracts, and public navigation. Complete assistive-technology conformance still requires manual testing with representative devices and software.

## Performance and dependency impact

- GSAP is loaded through narrow public Client Components, not Server Components or authenticated layouts.
- Lenis is installed but imports nowhere in the component tree, so it adds no route runtime work.
- Pointer depth remains request-animation-frame capped and stops when idle.
- No WebGL, video, particle field, custom cursor, or global scroll loop was added.
- Updated documentation screenshots are palette-compressed PNG files.
- The production chunk containing the public GSAP integration is 136,325 bytes raw and 52,243 bytes gzip. No built client chunk contains Lenis.
- Phase 7.2 CSS is 7,214 bytes raw and 1,826 bytes gzip.
- The updated desktop and mobile documentation screenshots total 1,088,214 bytes.

## Verification

- `npm install`: dependencies current.
- `npm test`: 91 tests passed across 15 files.
- `npm run lint`: passed.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed with 18 application routes plus Proxy. Next.js emitted its existing lockfile patch notice; the final lockfile is valid and retains only the intended dependency additions.
- `npm run test:e2e`: 5 public checks passed; 5 credential-dependent checks were skipped by configuration.
- `npm audit`: 2 moderate findings in Next.js's nested PostCSS; npm offers only a forced breaking change, so no forced fix was applied.
- `git diff --check`: passed.

## Known limits

- No reusable local account credentials were available, so the full authenticated browser journey remains a manual requirement.
- Email and password requests are covered by schemas, component structure, and existing server actions, but were not sent against a real account.
- No deployment URL was supplied or verified. A branch push can make a preview possible only when the repository's deployment integration is configured for this branch.
- No migration is required for Phase 7.2.

## Phase 7.3 boundary

Phase 7.2 does not implement an image sequence, advanced Living Product Graph, advanced Foundation Map, reasoning visualization, Blueprint Studio, or a draggable project tree. The scroll-story proposal is documented separately in [the Phase 7.3 concept](phase-7-3-scroll-story-concept.md).
