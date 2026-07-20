# 001 - Make product growth legible through motion

- **Status**: DONE
- **Commit**: 1a0f8b0
- **Severity**: HIGH
- **Category**: Purpose, cohesion, accessibility, performance
- **Estimated scope**: 12-18 presentation files, medium

## Problem

The landing story changes a five-level diagram through React state, but it does not yet express the full product cycle or use the installed scroll infrastructure.

```tsx
// components/marketing/ScrollProductNarrative.tsx:12 - current
const [activeIndex, setActiveIndex] = useState(0);
```

The Foundation Map uses one fixed SVG path and positional `nth-child` rules. State is readable, but relationships do not strengthen or settle as certainty changes.

```tsx
// components/discovery/FoundationMap.tsx:25 - current
<svg aria-hidden="true" viewBox="0 0 720 360"><path d="M360 180C250 180 220 66 106 66..." /></svg>
```

The completion reveal advances through a timed list of circles. It communicates sequence, but not how the resulting architecture organizes itself.

```tsx
// components/discovery/ArchitectureReveal.tsx:52 - current
const timer = window.setInterval(() => {
```

## Target

- A 12-beat public story, from seed through renewed learning, controlled by one scoped GSAP ScrollTrigger timeline.
- Lenis active only on the public marketing route, disabled for reduced motion and touch smoothing, with native nested scrolling preserved.
- Foundation paths draw once, then settle. Rooted relationships are continuous and calm; emerging relationships remain lighter; unresolved and blocked states stay explicit.
- Completion motion begins only after a real persisted generation response exists. It never represents server progress.
- Product UI feedback uses shared tokens: `--duration-fast: 140ms`, `--duration-normal: 220ms`, `--ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1)`, and `--ease-spatial: cubic-bezier(0.77, 0, 0.175, 1)`.
- Reduced motion removes spatial travel and scroll coupling while preserving complete content and state feedback.

## Repo conventions to follow

- Import GSAP only through `lib/motion/gsap-client.ts`.
- Isolate motion in Client Components and clean up every GSAP context, ticker callback, observer, timer, and Lenis instance.
- Preserve server-rendered copy and SVG content before enhancement.
- Use existing forest, sage, moss, gold, and surface tokens. Do not add a second palette.

## Steps

1. Add a public-only motion provider that lazy-loads Lenis and synchronizes it with GSAP.
2. Expand the canonical marketing story data to 12 semantic beats and evolve `ScrollProductNarrative` in place.
3. Replace fixed Foundation Map geometry with deterministic organic positions, individual relationship paths, and keyboard navigation.
4. Recompose the completion reveal around the real generated blueprint counts.
5. Refine existing blueprint navigation, reading rhythm, dashboard state cues, and shared interaction states without changing data or actions.
6. Add new milestone tests. Do not edit existing tests.

## Boundaries

- Do not change authentication, persistence, generation, review, export, profile, settings, schemas, API contracts, or existing tests.
- Do not add dependencies.
- Do not animate fabricated data or progress.
- Do not enable Lenis in authenticated routes.

## Verification

- **Mechanical**: `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build`, and `npm run test:e2e` all succeed, allowing only credential-dependent skips.
- **Feel check**:
  - Scroll through the story at desktop width and confirm each relationship forms because the copy advances, not as background decoration.
  - Focus every story chapter and Foundation node with the keyboard.
  - Toggle reduced motion and confirm the full story becomes linear, static, and immediately readable.
  - Confirm nested horizontal blueprint navigation and controls keep native scrolling.
  - Confirm no console warnings, hydration errors, layout shift, or horizontal page overflow.
- **Done when**: public and protected presentation surfaces feel connected by one calm motion vocabulary and all underlying product behavior remains unchanged.

## Outcome

Completed with a public-only Lenis boundary, a 12-beat progressively enhanced story, deterministic Foundation relationships, a result-backed architecture reveal, and restrained workspace polish. Unit, lint, typecheck, production build, public responsive, reduced-motion, console, and overflow checks pass. Credential-dependent protected browser checks remain intentionally skipped when local E2E credentials are absent.
