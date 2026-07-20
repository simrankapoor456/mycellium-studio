# Phase 8 Mycelium Experience

## Outcome

Phase 8 connects Discovery, Foundation Review, architecture, Blueprint, export, and the public product story through one legible system. The application now treats uncertainty as explicit state, gives each progression gate a useful path, and uses the seed-to-value metaphor to explain relationships without changing product authority or persistence.

No migration, authentication change, ownership change, generation contract change, or new dependency was introduced.

## Baseline findings

- The base revision built successfully and passed its unit, lint, type, build, and public browser checks.
- Discovery interpreted a typed unknown as a fact but selected the next question from categories that counted only accepted unknowns as covered. That allowed the same category to return immediately.
- Provider-enhanced replies could supply a different next question from Reliable mode, so control behavior was not guaranteed to match.
- Foundation Review mixed required and optional work, while the old radial map did not make evidence lineage easy to trace.
- The journey rail exposed real state, but its single large composition could occupy too much vertical space and had no compact mobile disclosure.
- Architecture loading described inferred stages before the persisted result existed.
- Locked export formats looked like controls even though no action was available.
- Bright actions needed one semantic foreground contract across routes.

## Experience changes

### Discovery

Every current question has a stable category identity and the following choices:

- share an answer
- mark the decision unknown
- defer it to Foundation Review
- read why the decision matters
- open the current Foundation Review at any time

The same selector runs after Reliable and provider-enhanced turns. A marked or deferred category is considered covered for the current cycle, so the next materially different category is selected. When none remains, the interface offers review instead of another question. See [Discovery control model](./discovery-control-model.md).

### Project journey

The journey is part of page flow below the application header. It becomes denser after its sentinel leaves view, keeps the current stage centered on compact rails, and becomes a native details disclosure on small screens. Unavailable stages name their prerequisite. Export stays reachable because its route explains the current locked or available state.

### Foundation Review and map

Review separates blocking decisions, recommended clarifications, deferred unknowns, contradictions, and challenges. Each item links to the exact fact or foundation area that can resolve it. Fact actions use consistent primary, secondary, quiet, success, and destructive hierarchy, and removal requires confirmation.

The radial map was replaced with a deterministic left-to-right evidence system. Original intent becomes evidence roots, seven foundation branches, readiness, and a persisted Blueprint. Selected branches reveal related paths, grounded evidence, source counts, dependencies, gaps, and challenges. See [Living Foundation Map](./living-foundation-map.md).

### Architecture, Blueprint, and export

The generation surface no longer invents progress. It states that the request is waiting for a complete validated persisted result. The architecture reveal begins only after that result exists, derives its counts from the saved Blueprint, supports reduced motion, and can be skipped immediately.

Blueprint export cards become buttons only when a persisted Blueprint exists. Successful downloads report the response filename, format, size, Blueprint version, and latest saved timestamp. Failures leave the Blueprint unchanged and invite a retry. Locked export explains the current foundation state and links directly to the next useful route.

### Public signature story

The public story is a configurable 12-beat SVG and DOM composition covering fragmented context, intent, evidence, uncertainty, connected understanding, human review, architecture, Blueprint, execution, visible value, and renewed learning. Desktop and tablet use scoped scroll-linked state. Mobile uses native vertical reading. Reduced motion presents the complete final composition without pinned spatial movement. See [Signature Growth Story](./signature-growth-story.md).

## Interaction and motion boundaries

- Immediate feedback: 110 ms.
- Small state transition: 180 ms.
- Panel transition: 260 ms.
- Environmental reveal: 620 ms.
- Scroll story: progress-driven with a 0.55 scrub value.
- GSAP and `@gsap/react` stay behind `lib/motion/gsap-client.ts`.
- Public story and Foundation Map use local refs, `useGSAP`, `gsap.matchMedia()`, and complete cleanup.
- Lenis remains lazy, public-only, wheel-only, and disabled for reduced motion. It never mounts in protected layouts.
- The adapted React Bits SplitText remains limited to the existing final public transition. Phase 8 adds no React Bits dependency.

## Accessibility and responsive result

- Dark semantic foregrounds on bright actions exceed WCAG AA contrast.
- Question controls preserve a logical sequence and document Control or Command plus Enter without changing normal multiline Enter behavior.
- Journey navigation has current-step semantics, prerequisite text, mobile disclosure, and 44-pixel targets.
- Map nodes support pointer, focus, arrow keys, Home, and End, with an ordered text alternative.
- Fact removal and project removal use native dialogs.
- Reduced motion keeps all product meaning available and disables the pinned story composition.
- Public checks at 375, 768, 1024, and 1440 pixels plus a two-times zoom equivalent found no page-level horizontal overflow.
- Public forward, reverse, midway refresh, browser route, console, and hydration checks passed in Chromium.

Protected browser flow remains a manual check because no reusable local account was available. Component, domain, schema, and source-contract coverage protect those paths without changing production data.

## Performance impact

Measurements compare production Turbopack output from base revision `e63e8d86` with this phase using the same dependency tree.

| Route or asset | Raw change | Gzip change |
| --- | ---: | ---: |
| Public route JavaScript | +2,222 B | +526 B |
| Discovery route JavaScript | +7,831 B | +2,184 B |
| Review route JavaScript | +15,511 B | +5,063 B |
| Export route JavaScript | +6,500 B | +2,189 B |
| Compiled CSS | +25,239 B | +3,956 B |

The changed public story chunk is 30,325 bytes raw and 10,392 bytes gzip. The separate Lenis chunk is unchanged at 18,410 bytes raw and 5,332 bytes gzip. Protected route manifests contain no Lenis chunk. No public asset runtime, image sequence, video, WebGL, canvas loop, or new package was added. Browser checks found no visible long-task symptom during rapid forward and reverse story movement; detailed device profiling remains release work.

## Verification and limits

Required project commands are recorded in the final branch report. The remaining manual work is:

- run the signed-in project journey with a dedicated non-production account
- verify the compact journey and current controls with representative assistive software
- confirm touch behavior on physical mobile and tablet devices
- verify a preview deployment when the branch deployment integration is available

No production data or remote service configuration was changed.
