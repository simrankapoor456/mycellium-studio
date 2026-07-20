# Mycellium Studio design system

## Direction

The system is **living product intelligence**: cinematic and environmental in public, spatial and calm in productive work. Organic paths express connected understanding; precise typography, rules, and state labels keep that expression technically credible.

The visual system must never collapse into a forest-colored template. Atmosphere belongs to page composition and environmental layers, while controls and product state remain legible, tactile, and familiar.

## Identity

The production mark is a compact radial network with a central intelligence form, six primary directions, and limited terminal nodes. It keeps a strong silhouette without glow and remains recognizable at 16 pixels. The wordmark pairs an editorial serif `Mycellium` with widely tracked sans-serif `STUDIO`.

Canonical assets live in `public/brand/`:

- `mycellium-mark.svg`, `mycellium-mark-light.svg`, and `mycellium-mark-dark.svg`
- `mycellium-mark-monochrome.svg`, which inherits `currentColor`
- `mycellium-wordmark.svg`
- `mycellium-lockup-horizontal.svg` and `mycellium-lockup-stacked.svg`
- `icons/favicon.svg` and generated PNG icon sizes
- `social/open-graph.svg` and generated social PNGs

Use `BrandMark` and `BrandLogo` in the interface. Both use inline vector geometry so they stay crisp and can adopt semantic color. Do not use a raster identity board, add decorative nodes, distort the silhouette, or make glow necessary for recognition.

Run `npm run brand:generate` after changing the social source or icon geometry. The script uses the installed image pipeline to create reproducible optimized PNG outputs; it does not fetch remote assets.

## Token architecture

Phase 7.1 tokens are centralized in `app/phase-7-1.css` and imported after the established compatibility styles in `app/globals.css`. New surfaces and components should use semantic custom properties instead of route-local visual values.

### Color roles

| Token family | Purpose |
| --- | --- |
| `--environment-*` | Near-black forest page atmosphere |
| `--workspace-*` | Calm authenticated application planes |
| `--surface-*` | Content, inspector, overlay, and intelligence-active hierarchy |
| `--text-*` | Warm cream primary text and stone/sage secondary tiers |
| `--intelligence-*` | Bioluminescent lime for primary action and meaningful active state |
| `--gold-*` | Restrained uncertainty, focus, and lineage emphasis |
| `--warning-*` | Genuine blockers only |
| `--danger-*` | Destructive actions and errors only |
| `--line-*` | Quiet structural separation and active boundaries |

Lime is not ambient decoration. Use its strongest value for primary action, selected graph nodes, active Mycel Core state, and meaningful completion. State always includes text or shape, never color alone.

### Typography

- Editorial display: Georgia, Times New Roman, then a generic serif.
- Product and body: Aptos, Avenir Next, Segoe UI Variable, then system sans-serif.
- System metadata: Cascadia Mono, SFMono-Regular, then Consolas.

Public headings may use the serif for selected expressive phrases. Authenticated work uses calmer sans-serif scales. Body measure remains near 65 characters; metadata is never set so small or faint that it becomes ornamental.

### Shape, depth, and lighting

- Compact controls use a tactile rounded rectangle, not an exaggerated pill.
- The public navigation is the one deliberate capsule.
- Content surfaces use quiet borders and internal illumination before shadow.
- Environmental background, workspace, content surface, inspector, overlay, and intelligence-active surface are separate tiers.
- Blur is reserved for floating navigation and exceptional overlays.
- Glow appears only around active intelligence or a focused primary action.
- Nested card stacks and glass on every panel are outside the system.

### Spacing and containers

Spacing follows a compact base rhythm with larger editorial jumps between narrative chapters. Public sections may be asymmetric and open; product pages keep stable reading widths and closer grouping between label, state, and action. Containers protect the edges at every supported viewport and respect safe-area insets.

## Reusable primitives

| Primitive | Contract |
| --- | --- |
| `BrandMark` | Inline radial mark, accessible label when meaningful, decorative otherwise, optional one-time formation |
| `BrandLogo` | Home or dashboard link with canonical mark and typographic wordmark |
| `Button` / `ButtonLink` | Intelligence-primary, neutral-secondary, quiet, destructive, compact, disabled, active, and focus states |
| `FormField` | Visible label, hint/error association, stable input surface, and explicit validation state |
| `Card` | One semantic content boundary using the content-surface tier |
| `Badge` | Text-backed neutral, success, warning, danger, and accent states |
| `ConfirmDialog` | Native dialog behavior with focused overlay treatment |
| `EmptyState` | Branded explanation and one useful next action |
| `LoadingState` | Layout-mirroring skeleton with live-region text and no motion requirement |
| `WorkspaceNavigation` | Anchored global product navigation with current route, profile access, identity context, and mobile mode |
| `ProjectWorkspaceNav` | Data-backed journey state, current project context, locked-stage explanation, and export access |

Phase 7.1 applies these foundations across existing routes without replacing the internal workspace structures reserved for Phase 7.2.

## Motion

Motion communicates connection and state; it does not make the user wait.

| Token | Typical use |
| --- | --- |
| Immediate, 90 ms | Pressed and focus feedback |
| Fast, 140 ms | Hover and small state changes |
| Normal, 220 ms | Menus and surface transitions |
| Moderate, 360 ms | Diagram relationships |
| Deliberate, 640 ms | One-time narrative entrance |
| Formation, up to 2.4 s | Spark, Connect, Grow, Form, Settle identity sequence |

The spatial easing curve is `cubic-bezier(0.22, 1, 0.36, 1)`. Product surfaces use only the first three tiers. Environmental effects use opacity and transforms and never hijack scrolling.

The animated mark forms once through Spark, Connect, Grow, Form, and Settle. It is complete from the start in the document, does not delay content, and becomes immediately static under `prefers-reduced-motion: reduce`.

Phase 7.2 adds one client-only GSAP boundary for selected public transitions. `useGSAP`, a local scope, `gsap.matchMedia()`, and explicit revert cleanup are required. SplitText is limited to one major transition and its semantic text exists before enhancement. Authenticated work keeps CSS feedback and native scrolling.

Lenis is installed but dormant. It does not wrap the root, authentication, product, editor, dialog, or settings experiences. Native scrolling remains the baseline for anchors, keyboard input, browser history, touch devices, and reduced motion.

## Accessibility

- Semantic landmarks and ordered headings define each page.
- The mark has a concise accessible name only when it carries content; decorative instances are hidden.
- Focus is visible on every interactive element and is not replaced by hover styling.
- Controls meet a 44-pixel target where touch use is expected.
- Mobile navigation preserves every destination and exposes expanded state.
- Form labels and field messages retain programmatic association.
- Dialogs use the browser top layer and native keyboard behavior.
- Reduced motion removes formation, reveals, smooth scrolling, and environmental drift.
- Higher contrast preferences strengthen surface lines and text separation.
- Product status always combines wording with visual treatment.

Automated checks protect semantics and interactions but do not establish complete accessibility conformance. Keyboard, zoom, contrast, screen-reader, and real-device checks remain release work.

## Responsive principles

Review widths are 375, 768, 1024, and 1440 pixels.

- At 375 pixels, the identity remains recognizable, public navigation becomes a designed inline panel, and diagrams become linear reading sequences.
- At 768 pixels, text and visual chapters may share more horizontal space without restoring dense desktop navigation.
- At 1024 pixels, public storytelling gains spatial depth while keeping the compact navigation mode.
- At 1440 pixels, full floating navigation and asymmetric editorial composition are available.
- No route may create page-level horizontal overflow or hide a critical action.
- Product navigation wraps or changes mode instead of shrinking labels below legibility.

## Performance boundaries

- GSAP and Lenis are approved only as route-scoped, progressive enhancements under the premium interaction foundation; neither is mounted globally or required for meaning.
- No WebGL, autoplay video, continuous particle loop, or second animation and smooth-scroll runtime.
- SVG and CSS construct the environment and identity.
- Brand PNGs are generated once and only the needed favicon, touch icon, or social image is loaded.
- Layout dimensions are reserved before animation.
- Static meaning exists before JavaScript enhancement.
- Large blur is restricted to bounded floating surfaces.

See [`docs/premium-interaction-foundation.md`](./premium-interaction-foundation.md) for client-only integration, cleanup, reduced-motion, and public-only scrolling rules.

## Voice and content

Mycellium speaks like an experienced product strategist: warm, curious, precise, grounded, and concise. It names facts, uncertainty, changes, and the next useful action without confidence theater or excessive nature language.

Reusable state copy belongs in `lib/voice/mycellium.ts`. Provider availability never changes the product promise; Reliable mode is a first-class engine state. Do not add fake customers, metrics, social proof, integrations, or unsupported flows.
