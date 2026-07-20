# Living Product Experience

## Product truth

Mycellium Studio now expresses one continuous idea across its public and productive surfaces:

> Ideas take root. Knowledge connects. Products grow.

The signature interaction is a 12-beat living product story. One seed gathers signal, roots, relationships, and evidence. Human judgment stabilizes that understanding into a foundation. Architecture and a Product Blueprint then organize the work before learning returns as a new seed.

## Architectural decisions

- `ScrollProductNarrative` is the only cinematic public section. Its complete copy and SVG graph exist before JavaScript enhancement.
- GSAP and ScrollTrigger are imported only through `lib/motion/gsap-client.ts` and scoped to the story or Foundation component.
- `MarketingMotionProvider` lazy-loads Lenis only on the public landing route. Authenticated routes keep native scrolling.
- Foundation geometry is deterministic presentation data. Product state still comes from the existing typed discovery context and readiness calculation.
- The architecture reveal starts only after the existing generation request has returned and persisted a real blueprint. It never represents network progress.
- Blueprint and dashboard refinements consume existing project and blueprint fields. They add no state, tables, events, or persistence.

## Motion decisions

The public motion dial is 6 of 10. Product motion is 3 of 10.

- Story scroll changes meaning at narrative boundaries. The graph does not move continuously for atmosphere.
- Foundation paths draw once to explain relationship formation. Rooted connections then become stable and continuous; emerging and unresolved connections remain lighter or dashed.
- Architecture counts come from the generated blueprint. Nodes organize only after the result exists.
- Buttons, tabs, cards, and graph selections stay within the existing 90-220 ms product feedback range.
- Only transform, opacity, stroke, fill, and border color participate in motion. No layout property is animated.
- No autoplay video, canvas loop, particle field, cursor effect, or fabricated progress was added.

## Accessibility review

- Every story beat remains an ordered, focusable control with complete explanatory copy.
- The story provides a keyboard-visible skip link before the sticky region.
- The SVG is paired with a full linear product-graph alternative on mobile.
- Foundation areas remain normal buttons and add arrow-key, Home, and End navigation.
- Foundation state is expressed with text, shape, line treatment, and color.
- Reduced motion disables Lenis, spatial text entrances, path drawing, and scroll-linked interpolation while leaving all content visible.
- Mobile uses linear document flow rather than sticky scroll coupling.
- Focus rings, 44-pixel targets, native dialogs, form controls, and protected-route scrolling remain intact.

## Performance boundaries

- Lenis is dynamically imported after the public page becomes interactive.
- GSAP remains route-scoped; no second animation runtime was added.
- The story uses the existing SVG graph. No image sequence, video, WebGL, or continuous render loop is downloaded.
- ScrollTrigger updates imperative transforms and state boundaries rather than React state on every scroll frame.
- Foundation animation runs once and cleans up its GSAP context.
- All visual surfaces reserve their dimensions before enhancement.

## Visual records

The current public captures remain in:

- `docs/assets/landing-desktop.png`
- `docs/assets/landing-mobile.png`

Protected Foundation, architecture, Blueprint, and dashboard captures require a dedicated local test account. No reusable credentials are stored in the repository.

## Scope preserved

This milestone does not change authentication, Supabase, RLS, project persistence, generation, review, exports, profile, settings, schemas, API contracts, or existing tests. It adds no billing, teams, notifications, analytics, plugins, agents, collaboration, or database tables.
