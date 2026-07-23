# Phase 9A Motion System

## Ownership

`components/marketing/ScrollProductNarrative.tsx` is the motion owner. It is a narrow Client Component rendered only on the public landing route. `SignatureGrowthVisual` owns deterministic SVG structure but no independent animation lifecycle.

All GSAP imports pass through `lib/motion/gsap-client.ts`, which registers GSAP, ScrollTrigger, SplitText, and `useGSAP` behind the established client boundary.

## Master timeline

One paused GSAP timeline describes the full organism. ScrollTrigger maps document progress onto that timeline with `scrub: 0.68`.

| Timeline region | Motion |
| --- | --- |
| 0 to 1 | Reveal the attraction field; move useful fragments toward intent and leave noise peripheral. |
| 1 to 2 | Reveal the seed and compress gathered fragments. |
| 2 to 3 | Draw the crack and radicle; rotate and translate the two shell halves. |
| 3 to 4 | Draw the primary root with path-length dash offset. |
| 4 to 5 | Draw seven evidence branches from their existing parent root with a restrained stagger. |
| 5 to 6 | Draw five cross-branch connections only after their endpoints exist. |
| 6 to 7 | Reveal the seven labeled Foundation nodes and their mixed states. |
| 7 to 8 | Draw the small shoot, strengthen the primary root, quiet the original fragments, and reveal the review handoff. |

Path drawing uses `pathLength="1"`, `stroke-dasharray: 1`, and animated `stroke-dashoffset`. This keeps sequencing independent of the raw path length and allows the same timeline to rewind naturally.

The shell uses bounded rotation and translation around explicit transform origins. There is no bounce, spring, random drift, idle loop, or animation that blocks interaction.

## ScrollTrigger model

At 768 pixels and wider:

- one progress trigger owns the master timeline
- the chapter list is the progress range
- progress begins when the list top reaches the viewport center
- progress completes when the list bottom reaches the viewport center
- one trigger per chapter updates React state only on `onEnter` and `onEnterBack`

The timeline therefore remains continuous while stage labels update only at meaningful boundaries. React does not receive a state update on every scroll frame.

At 1024 pixels and wider, a second ScrollTrigger pins the visual:

- start: the story layout reaches 112 pixels from the viewport top
- end: calculated from the final chapter and available viewport height
- `pinSpacing: false`: the right-hand chapter column preserves the section's real document height
- `invalidateOnRefresh: true`: resize and refresh recalculate geometry

Forward scrolling plays the same timeline. Reverse scrolling rewinds it, retracting connections, branches, root, crack, seed, and fragment gathering in the inverse order. Chapter state follows `onEnterBack`.

## Tablet and mobile

The progress timeline remains active from 768 through 1023 pixels, but the explicit desktop pin is not created. Chapter minimum height is reduced to shorten travel.

Below 768 pixels:

- no GSAP story timeline is created
- no ScrollTrigger pin is created
- the visual uses normal document positioning
- chapters form a vertical, snap-free list
- native scrolling remains authoritative
- `IntersectionObserver` changes the current stage at coarse semantic boundaries

The mobile experience keeps all stage meaning in text and shows the complete organism without requiring a long pinned journey.

## Reduced motion

Under `prefers-reduced-motion: reduce`:

- Lenis does not start
- the GSAP progress and pin branches do not run
- all stage groups are made visible
- every root path receives a zero dash offset
- the final Foundation stage is selected
- the visual returns to relative positioning
- chapters use compact natural flow

There is no spatial scrub, pin, seed opening, root drawing, or repeated announcement. The final static composition and ordered copy carry the same meaning.

## Cleanup

The `useGSAP` scope is the story section. Cleanup explicitly:

- kills every chapter ScrollTrigger
- kills the progress ScrollTrigger
- kills the desktop pin ScrollTrigger
- reverts the master timeline
- reverts `gsap.matchMedia()`

The public `MarketingMotionProvider` separately removes the GSAP ticker callback and destroys Lenis on unmount. Phase 9A adds no global scroll listener and no continuous request-animation-frame owner.

## Lenis synchronization

Lenis remains public-only. `MarketingMotionProvider` dynamically imports it, forwards Lenis scroll events to `ScrollTrigger.update`, and advances it from the existing GSAP ticker. Touch synchronization remains disabled. Form controls, dialogs, and native-scroll boundaries retain native behavior. Authentication and protected workspace layouts do not import the provider.

## Accessibility and interruption

- Stage controls are normal buttons in an ordered list.
- Focus and direct selection update stage semantics without waiting for animation.
- The current stage uses `aria-current="step"` and `aria-pressed`.
- Progress uses a named progressbar with integer stage values.
- The SVG is hidden from assistive technology; equivalent text is present in the document.
- There is no live region that announces every scrub update.
- A skip link moves directly past the story.
- Motion is scroll-driven and therefore reversible and interruptible.

## Performance rules

- No new runtime dependency.
- No frame sequence, video, canvas, or WebGL.
- No layout measurement inside animation callbacks.
- No React state update on each scrub frame.
- No idle animation loop.
- Fixed SVG geometry prevents path jitter during resize.
- `vector-effect: non-scaling-stroke` keeps line weights sharp.
- MatchMedia prevents creation of desktop work on mobile or under reduced motion.

Exact feature-level JavaScript and CSS gzip attribution is not exposed by the current Turbopack output. The reliable measured boundaries are unchanged dependency count, zero new production assets, and no protected-route Lenis import.
