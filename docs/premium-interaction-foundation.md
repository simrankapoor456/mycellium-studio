# Premium interaction foundation

This foundation keeps approved interaction runtimes behind narrow client-only boundaries. The public experience uses them for the hero, signature growth story, final word-level transition, and public-only smooth wheel scrolling. The protected Living Foundation Map uses one scoped GSAP reveal because relationship formation carries product meaning. All other authenticated routes retain native scrolling and CSS feedback.

## Audit summary

- The application previously had no animation or smooth-scroll package.
- Existing motion is CSS-based, with small client components using `IntersectionObserver`, `requestAnimationFrame`, and `matchMedia` where interaction requires it.
- `prefers-reduced-motion: reduce` already removes animation, transitions, and smooth scrolling.
- Marketing is primarily composed from Server Components. Interactive marketing components are deliberately narrow Client Components.
- Authenticated routes include forms, dialogs, horizontal overflow regions, sticky navigation, and editor-like workspaces that should retain native scrolling.
- The design system already has motion duration and easing tokens. It does not need a second token system from an external component collection.

## Dependency decisions

| Candidate | Decision | Reason |
| --- | --- | --- |
| GSAP | Install | It adds coordinated timelines, SVG choreography, `ScrollTrigger`, responsive `matchMedia`, and deterministic context cleanup that the native utilities do not provide. |
| Lenis | Public marketing only | It improves the long public narrative while leaving authentication, forms, editors, dialogs, and protected workspaces on native scrolling. |
| React Bits | Selective source use | React Bits is a component-source catalog, not an installed runtime. One SplitText source was adapted to the current tokens, GSAP boundary, TypeScript, static fallback, and cleanup rules. |
| `@gsap/react` | Install | The official `useGSAP` hook keeps component-scoped lifecycle cleanup consistent for the small number of public motion boundaries. |

GSAP includes `ScrollTrigger`; it is not a separate package. `gsap.matchMedia()` and `gsap.context()` are core APIs. Do not add another animation runtime, GSAP ScrollSmoother, or a second smooth-scroll engine beside Lenis.

## GSAP integration contract

`lib/motion/gsap-client.ts` is the only approved import boundary for GSAP, `ScrollTrigger`, `SplitText`, and `useGSAP`. It registers browser plugins behind a window guard.

Phase 7.2 animation owners must be Client Components. Server Components should continue rendering the complete semantic content and may compose a small animated Client Component around a local section. Never import the GSAP boundary from a Server Component, route handler, server action, or domain module.

Use a component-local scope, responsive and motion-preference conditions, and complete teardown:

```tsx
"use client";

import { useRef } from "react";

import { gsap, useGSAP } from "@/lib/motion/gsap-client";

export function ExampleMotionBoundary() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add(
      {
        motionAllowed: "(prefers-reduced-motion: no-preference)",
        desktop: "(min-width: 768px)",
      },
      ({ conditions }) => {
        if (!conditions?.motionAllowed) return;
        // Create local timelines and ScrollTriggers here.
      },
    );

    return () => media.revert();
  }, { scope });

  return <div ref={scope}>{/* Complete semantic content */}</div>;
}
```

Additional rules:

- Animate transforms and opacity; reserve layout-affecting properties for cases that cannot be expressed otherwise.
- Scope selectors to a component ref. Do not query the document globally.
- Create every timeline and `ScrollTrigger` inside the owning context or match-media callback.
- Revert match media and context on unmount. Remove any independently registered listeners or ticker callbacks too.
- Use `gsap.matchMedia()` rather than the deprecated `ScrollTrigger.matchMedia()` API.
- Render final readable content before enhancement so SSR, no-JavaScript use, and reduced motion remain complete.
- Keep animation state out of canonical product and workflow state.

## Lenis integration contract

Lenis should power only the public marketing experience. It must not wrap `app/layout.tsx` or the authenticated, authentication, form, dialog, discovery, review, blueprint, export, or settings experiences.

`MarketingMotionProvider` is the one public-page Client Component that owns the Lenis instance and destroys it on unmount. Native scrolling remains the fallback. Lenis does not initialize when `prefers-reduced-motion: reduce` matches. Touch synchronization, scroll locking, and custom multipliers remain disabled.

Activation gates:

- Scope or disable the existing global `scroll-behavior: smooth` while Lenis is active; two smoothing systems must never be layered.
- Preserve anchor behavior and fixed-header offsets, and stop inertia before internal navigation.
- Keep keyboard scrolling and browser history behavior native and verify Back/Forward scroll restoration.
- Let nested scroll regions, dialogs, and editable controls scroll natively. Prefer explicit `data-lenis-prevent` boundaries over globally allowing every nested scroller.
- If Lenis and ScrollTrigger share a public section, use one request-animation-frame source: forward Lenis scroll events to `ScrollTrigger.update`, advance Lenis from the GSAP ticker, then remove the ticker callback and destroy Lenis on cleanup.
- Do not import `lenis/dist/lenis.css` globally before the public-only provider is approved and tested.

## React Bits references

React Bits ideas may inform public motion, but copied components are not automatically compatible with Mycellium's semantics, performance boundaries, or visual language.

Good references to reinterpret locally:

- **Animated Content / Fade Content:** a restrained reveal grammar for public narrative sections, implemented with the GSAP boundary and a static reduced-motion state.
- **Spotlight Card:** a very subtle pointer-responsive illumination for a single intelligence-active surface, limited to fine pointers and never used as the base card style.
- **Magnet:** a small optional response for the primary marketing action only, with no hit-target movement for keyboard or touch users.
- **Specular Button:** inspiration for a bounded light response on the existing primary button, not a replacement button primitive.

Rejected for the current system:

- Page preloaders that delay access to real content.
- Scroll stacks, scroll reveal components, and similar wrappers that duplicate GSAP and existing narrative behavior.
- Cursor replacement, click particles, constant shiny text, electric borders, shader cards, WebGL backgrounds, 3D galleries, and continuously animated decorative fields.
- Any React Bits component that adds `motion/react`, Three.js, a physics engine, or another scrolling package for a single effect.

## Package-health findings

- `npm ls --depth=0` reported a valid top-level dependency tree before installation; no peer conflict or missing package was present.
- GSAP has no React peer dependency. Lenis declares optional React support for React 17 and newer, which includes the current React 19 application.
- The installed Next.js, React, and React DOM versions remain aligned.
- No installed package was reported as deprecated. `npm outdated` reports newer major releases for `@types/node`, ESLint, and TypeScript; they are not interaction-system blockers and should be reviewed in a separate upgrade task.
- The existing audit finding is two moderate nested PostCSS advisories. Do not apply a forced breaking upgrade as part of interaction preparation.

## Phase 8 implementation

The signature story uses `ScrollTrigger` for meaningful chapter boundaries and a scrubbed environmental response. It is dynamically composed from the public route and remains semantically complete during server rendering. The Living Foundation Map uses a one-time scoped path reveal because the connection sequence explains evidence formation. Both owners use local refs, `useGSAP`, `gsap.matchMedia()`, and complete cleanup.

Lenis starts only inside `MarketingMotionProvider`, forwards scroll events to `ScrollTrigger.update`, advances from the GSAP ticker, and removes its ticker callback before destruction. Inputs, textareas, selects, dialogs, and native-scroll regions remain outside its control. The production manifest keeps its unchanged 18,410-byte raw chunk out of protected routes.

Verification covers native and enhanced versions at 375, 768, 1024, and 1440 pixels; keyboard navigation; reduced motion; anchors; zoom; mobile flow; reverse story movement; midway refresh; console output; hydration output; and nested overflow. Physical-device and representative assistive-software checks remain release work.
