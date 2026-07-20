# Phase 7.3 scroll-story concept

## Purpose

The sequence should make one product truth tangible: useful product structure does not appear all at once. It forms as context is gathered, uncertainty is named, a foundation is reviewed, and decisions remain connected to what caused them.

This is a concept only. Phase 7.2 does not generate frame assets, mount a canvas, pin a section, or add scroll-linked state.

## Proposed visual beats

1. **Fragmented context**: isolated, legible fragments share a quiet field with no implied certainty.
2. **A seed of intent**: one stable central signal establishes the original purpose.
3. **Questions and constraints**: distinct branches identify what is known, unknown, and bounded.
4. **Roots of evidence**: confirmed facts connect back to their source without hiding gaps.
5. **Mycelium connections**: relationships form between needs, constraints, and decisions.
6. **Foundation stabilization**: the reviewed boundary settles; unresolved areas remain visibly distinct.
7. **Architecture emerging**: system responsibilities and trust boundaries rise from the foundation.
8. **Blueprint taking shape**: a readable, editable structure replaces atmospheric abstraction.
9. **Execution branches**: epics, stories, tasks, and dependencies inherit visible lineage.
10. **Product maturity**: the structure becomes calm and coherent rather than larger or louder.
11. **Value created**: a completed artifact communicates usefulness without a fabricated outcome claim.
12. **A new seed**: learning returns to context and begins another cycle without erasing history.

## Asset direction

Create a small set of approved anchor frames first. Lock identity geometry, camera, palette, typography exclusion zones, lighting, and node positions before producing in-between frames. Generate transitions from stable vector or 3D scene data where possible; do not depend on independently prompted raster frames.

Text, controls, labels, and the production logo should remain DOM or vector overlays. They must not be baked into generated frames, where drift and distortion are difficult to correct.

Proposed range:

- 96 to 144 desktop frames for a 7 to 10 second reversible sequence
- 36 to 60 mobile frames only if device tests support it
- otherwise a small mobile set of 6 to 12 authored keyframes with crossfades

Preferred formats:

- WebP sequence as the broad baseline
- AVIF sequence only where decoding measurements beat WebP on target devices
- a poster WebP or AVIF for static and reduced-motion fallbacks
- no autoplay video as the sole representation because frame-accurate reversible control and accessibility fallback are required

## Canvas and loading strategy

Use one responsive canvas with an explicit intrinsic size and stable aspect ratio. Decode frames to `ImageBitmap` where supported, draw only when the selected frame changes, and release decoded resources when the section unmounts. Keep semantic story copy in the DOM beside or above the canvas.

Loading should proceed in layers:

1. load the poster and first frame with the page
2. preload the next narrative neighborhood after the section approaches the viewport
3. fetch remaining frames in bounded batches during idle periods
4. pause speculative loading on constrained connections or when the page is hidden
5. retain a small decoded-frame window around the current frame instead of every bitmap

Do not delay the page, navigation, or first action while sequence assets load. If a frame is missing, hold the last valid image and keep the story copy usable.

## Motion integration

Own the sequence in one public Client Component. Import GSAP and ScrollTrigger only through `lib/motion/gsap-client.ts`. Use `useGSAP`, a component scope, `gsap.matchMedia()`, one scrubbed timeline, and cleanup that kills the trigger, reverts the context, releases bitmaps, and removes observers.

The scroll range should map to narrative beats, not merely frame numbers. Copy changes should happen at stable beat boundaries. Never update React state on every scroll frame; draw through an imperative render function and expose only meaningful beat state to React when accessibility or navigation needs it.

Lenis should not participate in the first implementation. Native scrolling plus ScrollTrigger is the baseline. A public-only Lenis instance may be tested later, but it is acceptable only if anchor navigation, keyboard scrolling, history restoration, touch behavior, reduced motion, and fixed-header behavior all remain correct and measurements show a clear benefit.

## Accessibility and fallbacks

Reduced motion receives the poster plus the complete ordered narrative copy, with no pinned scrub. Mobile may receive the authored keyframe sequence or static poster when memory, decoding, or input behavior makes the full sequence unsafe. No meaning may exist only in movement or color.

Suggested accessible summary:

> Product context begins as separate signals. Questions connect evidence to a reviewed foundation; architecture and an editable blueprint then preserve those relationships into execution.

Provide a skip link before any pinned region. Keep the reading order linear, headings semantic, focus independent from scroll position, and canvas hidden from assistive technology when equivalent copy is present.

## Performance budget

- poster at or below 180 KB
- first usable frame and sequence controller at or below 350 KB combined transfer
- full desktop sequence target below 8 MB, hard ceiling 12 MB after format comparison
- mobile keyframe set below 1.5 MB
- no more than 24 decoded frames retained at once on desktop and 10 on mobile
- one canvas draw per selected frame change, with no idle loop
- no measurable layout shift from canvas initialization
- route JavaScript growth target below 45 KB gzip beyond GSAP already present

Measure decoding time, peak memory, long tasks, scroll latency, layout shift, and cache behavior on an ordinary laptop and a mid-range mobile device before approval.

## Primary risks

- **Frame drift**: independently created images may shift geometry, light, or camera and produce flicker.
- **Text distortion**: generated text is unreliable; keep it out of the raster sequence.
- **Logo instability**: use the production vector mark as a DOM overlay or render from one locked source.
- **Large downloads**: a visually smooth sequence can exceed practical transfer and memory budgets quickly.
- **Decode stalls**: AVIF savings may be offset by slower decoding on some devices.
- **Scroll coupling**: long pinned sections can make navigation and history feel trapped.
- **Narrative overreach**: visual growth must not imply product state or outcomes that the application does not have.
- **Maintenance cost**: changing one beat may require regenerating and checking adjacent frames.

The go/no-go review should compare the sequence against a smaller vector-and-DOM alternative. If the image sequence does not materially improve understanding within the stated budgets, keep the lighter approach.
