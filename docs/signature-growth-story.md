# Signature Growth Story

The public signature story is the Phase 9A Seed-to-Foundation experience. It replaces the former 12-beat reveal that continued through architecture, Blueprint, execution, value, and renewal.

## Canonical narrative

The nine configured stages are:

1. Fragmented input
2. Signal attraction
3. Seed of intent
4. Germination
5. First root
6. Evidence branching
7. Mycelium connections
8. Foundation areas
9. Foundation stabilized

Stable ids, labels, copy, artifacts, and levels live in `lib/marketing/signature-experience.ts`. Deterministic fragments, root paths, parent relationships, nodes, and states live in `lib/marketing/signature-growth.ts`.

## Rendering

`ScrollProductNarrative` renders the semantic story and owns GSAP. `SignatureGrowthVisual` renders one original inline SVG organism, a DOM Foundation-state legend, and an accessible text summary.

The SVG contains:

- restrained soil strata and fixed grain
- seven labeled source fragments
- a bounded attraction field
- independent left and right seed shells
- crack and radicle paths
- one primary root
- seven child evidence branches
- five later mycelium connections
- seven Foundation nodes with confirmed, emerging, unknown, and blocked states
- a small final shoot and Foundation review handoff

No uploaded reference image, raster sequence, video, canvas, or WebGL asset is part of production.

## Motion and scroll

At 768 pixels and wider, a single GSAP timeline is scrubbed by ScrollTrigger. Root geometry draws through normalized dash offsets, and reverse scrolling rewinds the same path sequence. Chapter triggers update state at meaningful forward and reverse boundaries.

At 1024 pixels and wider, the visual receives one scoped ScrollTrigger pin. Tablet keeps a shorter progress range without that desktop pin. Mobile uses normal vertical document flow and no GSAP story timeline. Reduced motion renders the complete final Foundation immediately without pinning or spatial scrub.

Every trigger and timeline is scoped through `useGSAP`, killed or reverted on cleanup, and created only inside `gsap.matchMedia()` conditions.

## Product alignment

The final labels match the authenticated Foundation Map: Users, Problem, Outcome, Evidence, Scope, Feasibility, and Risks. Public state styling includes wording and shape, so color is never the only signal.

The story stops at a reviewable Foundation. Phase 9B can continue from these nodes into architecture, but Phase 9A contains no architecture or Blueprint transformation.

## Runtime boundaries

Lenis remains owned only by the public `MarketingMotionProvider`, synchronized with ScrollTrigger, disabled for reduced motion, and absent from protected routes. The adapted React Bits SplitText utility remains limited to the final public call to action and is not used by this scene.

See:

- [Phase 9A implementation](./phase-9a-signature-growth.md)
- [Storyboard interpretation](./phase-9a-storyboard.md)
- [Motion system](./phase-9a-motion-system.md)
