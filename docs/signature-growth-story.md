# Signature Growth Story

## Narrative

The public experience follows one product cycle through 12 configured beats:

1. Fragmented input
2. Seed of intent
3. First root
4. Evidence branching
5. Questions and constraints
6. Mycelium connections
7. Foundation stabilization
8. Architecture emergence
9. Blueprint formation
10. Execution branches
11. Visible product value
12. New seed

Each beat has a stable id, label, title, description, artifact, and visual level in `lib/marketing/signature-experience.ts`.

## Rendering architecture

`ScrollProductNarrative` is dynamically composed from the public route. It renders the complete ordered narrative, a skip link, a visual caption, and the deterministic `SignatureGrowthVisual`. The SVG begins with separated context blocks, grows a central seed and evidence roots, preserves open questions, stabilizes a reviewed boundary, forms architecture and a Blueprint, branches into work, shows visible value, and returns learning as a new seed.

The visual uses only DOM and SVG. It adds no generated frame sequence, raster asset, video, canvas, WebGL, or continuous idle renderer.

## Desktop and tablet

At 768 pixels and wider, the visual remains sticky while native document chapters control its state. `IntersectionObserver` provides semantic chapter selection and `ScrollTrigger` keeps forward and reverse boundaries consistent. A scrubbed environmental timeline adjusts only transform, opacity, and border color.

Tablet reduces chapter height so the narrative requires less travel. The visual remains primary without creating a scroll lock.

## Mobile

Below 640 pixels, the visual returns to normal document flow and the chapters become a vertical, snap-free sequence. There is no long pinned range, horizontal carousel, or blank scroll region. Each chapter remains a normal button for direct keyboard or touch selection.

## Reduced motion

Reduced motion selects the final level after the first frame, displays all SVG layers, removes sticky positioning, and disables GSAP spatial movement. The ordered copy and accessible visual summary remain complete.

## GSAP and cleanup

- Imports come only from `lib/motion/gsap-client.ts`.
- Every selector is scoped to the section or visual ref.
- `useGSAP` owns all timelines.
- `gsap.matchMedia()` contains desktop and motion-preference branches.
- Chapter triggers, the story trigger, match media, and local timelines are killed or reverted on cleanup.
- React state changes only at meaningful beat boundaries, never on every animation frame.

## Lenis boundary

`MarketingMotionProvider` is the single public owner. Lenis is dynamically imported, synchronized with ScrollTrigger through the GSAP ticker, and destroyed with that ticker on unmount. Reduced motion prevents startup. Touch synchronization stays disabled. Inputs, textareas, selects, dialogs, and native overflow regions opt out. No protected route imports or mounts the provider.

## Validation

Automated browser checks cover forward movement, reverse movement, midway refresh, reduced motion, required widths, zoom-equivalent layout, keyboard focus, anchor navigation, console output, hydration output, and page-level overflow. Physical-device touch and representative assistive-software checks remain release work.
