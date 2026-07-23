# Phase 9A Signature Growth

## Outcome

Phase 9A replaces the Phase 8 layer-by-layer reveal with one continuous Seed-to-Foundation transformation on the public landing page. The same organism receives fragmented context, forms a seed, opens, grows a primary root, branches into evidence, creates mycelium connections, and settles as a seven-area product Foundation.

The experience deliberately stops at Foundation. It does not render architecture, a Product Blueprint, execution branches, a mature tree, flowers, fruit, or seed renewal.

## Nine-stage narrative

The canonical stages live in `lib/marketing/signature-experience.ts`.

| Stage | Product meaning | Visual change |
| --- | --- | --- |
| 1. Fragmented input | Useful context begins as separate, differently trusted signals. | Seven restrained labels sit apart above the soil. |
| 2. Signal attraction | Relevant context begins to gather while noise stays outside. | Useful fragments move toward a shared center; the copied message remains peripheral. |
| 3. Seed of intent | One outcome becomes stable enough to investigate. | The gathered context resolves into a two-part seed shell and embryo. |
| 4. Germination | A priority question creates room for learning. | A crack draws through the shell and the halves open with restrained rotation and translation. |
| 5. First root | Lineage is established before branching. | One primary path draws from the seed into the soil. |
| 6. Evidence branching | Product areas inherit traceable evidence. | Seven branches grow from the existing primary root. |
| 7. Mycelium connections | Related evidence begins to inform other areas. | Connection paths form only after their endpoint branches exist. |
| 8. Foundation areas | Certainty and uncertainty become legible. | Users, Problem, Outcome, Evidence, Scope, Feasibility, and Risks receive labeled states. |
| 9. Foundation stabilized | The Foundation is coherent enough for human review. | Confirmed roots strengthen, unresolved states remain explicit, and a small shoot marks readiness without becoming a mature tree. |

## Implementation architecture

`ScrollProductNarrative` owns the semantic section, ordered stage controls, current-stage caption, progress indicator, responsive behavior, and GSAP lifecycle. `SignatureGrowthVisual` renders the original 960 by 760 inline SVG and a DOM state legend. `lib/marketing/signature-growth.ts` contains deterministic fragment positions, root paths, parent relationships, Foundation nodes, and state labels.

The SVG is decorative and uses `aria-hidden="true"`. Essential meaning exists outside it in:

- the section heading and introduction
- the nine-button ordered stage list
- the current-stage caption and progressbar semantics
- the confirmed, emerging, unknown, and blocked DOM legend
- a concise screen-reader summary of the complete transformation
- the `noscript` fallback

No raster frame sequence, production photograph, video, canvas, WebGL, Three.js, Lottie, or new animation runtime was added.

## Foundation handoff

The final public composition uses the same seven area names as `lib/discovery/foundation-map.ts`: Users, Problem, Outcome, Evidence, Scope, Feasibility, and Risks. It simplifies the authenticated topology but does not invent a competing model.

State is not conveyed by color alone:

- confirmed uses a stronger solid node and check mark
- emerging uses an incomplete fill and dashed boundary
- unknown uses a dotted boundary and question mark
- blocked uses an interrupted boundary and crossed mark

This final geometry is the continuation point for Phase 9B. Phase 9B may transform the stabilized Foundation into architecture, but it should begin from these existing node identities and evidence paths rather than replacing the organism.

## Responsive behavior

- At 1024 pixels and wider, ScrollTrigger pins the visual while the normal document chapters drive one scrubbed timeline.
- At 768 to 1023 pixels, the same timeline runs with shorter chapters and without the desktop ScrollTrigger pin. The existing sticky layout keeps the scene available without adding a long pin distance.
- Below 768 pixels, the GSAP story timeline and desktop pin are not created. The scene returns to document flow and the stages become a vertical, snap-free sequence. `IntersectionObserver` updates meaningful stage state without a scroll listener.
- Under reduced motion, pinning and scrub are disabled, all deterministic paths render complete, and the final Foundation state is selected immediately.

## Runtime boundaries

GSAP, ScrollTrigger, and `useGSAP` are imported only through `lib/motion/gsap-client.ts`. Lenis remains dynamically owned by `MarketingMotionProvider` on the public page. It stays disabled for reduced motion, keeps touch synchronization off, and is absent from protected layouts.

The adapted React Bits SplitText utility is unchanged and remains limited to the final public call to action. Phase 9A does not use it inside the root scene and does not install React Bits.

## Test coverage

`tests/phase-9a-signature-growth.test.tsx` protects:

- the nine configured stages and the Foundation stop condition
- one non-duplicated signature scene
- accessible stage copy and non-color state legend
- forward and reverse direct stage semantics
- deterministic root identities and parent relationships
- reduced-motion final state
- desktop pin, mobile flow, and explicit GSAP cleanup contracts
- the public-only Lenis boundary and protected-route isolation

`e2e/phase-9a-signature-growth.spec.ts` checks reversible desktop progression, desktop pinning, final Foundation semantics, horizontal overflow, and reduced-motion captures at 375, 768, and 1440 pixels. `e2e/public-responsive.spec.ts` continues to cover 375, 768, 1024, 1440, zoom-equivalent layout, anchors, calls to action, keyboard reachability, signed-out protected access, mobile navigation, console errors, hydration errors, and page overflow.

## Performance impact

- Dependency impact: none. `package.json` and the lockfile do not add a runtime package.
- Asset impact: none. The five reference photographs are not copied into `public/`, bundled, or requested by the browser.
- Rendering impact: one inline SVG, 13 deterministic root and connection paths, seven Foundation nodes, and seven input fragments replace the previous smaller reveal SVG.
- Animation impact: scroll progress is owned by GSAP. React state changes only at stage boundaries. There is no request-animation-frame loop or continuous idle animation in this component.
- Route impact: the public route already loaded GSAP and Lenis before Phase 9A. Protected routes retain their existing runtime boundary.

The implementation increases inline markup and the public client-component source. This repository does not emit a stable per-feature gzip delta from Turbopack, so an exact JavaScript or CSS transfer delta is not claimed here. A paired production build or preview-deployment analyzer should be used before Phase 9B if a feature-level transfer budget is required.

## Known limitations

- The mobile fallback presents the complete final organism above a vertical stage narrative rather than replaying a long pinned transformation.
- SVG Foundation labels are intentionally concise and are supplemented by DOM copy; the visual is not a replacement for the authenticated Foundation Map.
- Physical-device touch, representative screen-reader combinations, and low-powered mobile GPU checks remain release validation.
- Exact per-feature production gzip attribution is not available from the current build output.
- The small final shoot signals readiness only. It is not a mature-tree stage.

## Scope boundary

Phase 9A changes public storytelling only. It does not change authentication, Supabase, database schema, migrations, discovery persistence, Foundation Review behavior, the authenticated Foundation Map, architecture generation, Blueprint generation, exports, billing, teams, or integrations.
