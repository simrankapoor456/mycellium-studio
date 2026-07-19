# Mycellium Studio design system

## Direction

The system is called **rooted editorial architecture**. It combines a distinctive brand register for marketing with a familiar product register for authenticated work.

Physical scene: a founder and engineering lead review a product map at a quiet studio table in clear morning light, with precise notes above the surface and connected reasoning visible beneath it.

Brand surfaces use large sans-serif display type, asymmetric layouts, architectural rules, and a single root-path motif. Product surfaces use calm hierarchy, conventional navigation, explicit status labels, and restrained motion. Neither register uses fake product screenshots, customer claims, metrics, certifications, or integrations.

## Logo system

The rooted-M is hand-authored SVG geometry. The upper form is a refined capital M; its lower strokes continue into five connected root points. It must remain recognizable without color and at favicon size.

Assets:

- `public/brand/mycellium-mark.svg`: primary forest mark on transparent background
- `public/brand/mycellium-mark-light.svg`: light mark for dark surfaces
- `public/brand/mycellium-wordmark.svg`: geometric stroke wordmark
- `public/brand/mycellium-lockup.svg`: mark and wordmark lockup
- `public/brand/favicon.svg`: simplified mark on a forest tile
- `public/brand/apple-touch-icon.svg`: enlarged touch target asset
- `public/brand/og-image.svg`: 1200 by 630 social card

Use `BrandLogo` in application UI so spacing, accessible naming, and light/dark asset selection stay consistent. Do not redraw, rotate, stretch, decorate, or place the mark on a low-contrast surface.

## Visual tokens

Tokens live in `app/globals.css` and are exposed to Tailwind CSS 4 through `@theme`.

### Color roles

| Token | Role |
| --- | --- |
| `canvas` | Green-tinted application and marketing background |
| `surface` | Primary content surface |
| `surface-quiet` | Secondary hierarchy layer |
| `ink` | Primary charcoal text |
| `forest` | Brand identity and primary actions |
| `moss` | Supporting labels and product context |
| `sage` | Positive and low-emphasis surfaces |
| `gold` | Root-path emphasis and focus ring only |
| `clay` | Destructive actions and error text |
| `line` / `line-strong` | Structural borders and field boundaries |

Gold is never a large background or decorative premium cue. Forest remains the only primary action color. Status information always includes text and never depends on color alone.

### Typography

- Display: Aptos Display, Avenir Next, then Segoe UI Variable Display
- Body and interface: Aptos, Avenir Next, then Segoe UI Variable
- Metadata: Cascadia Mono, SFMono-Regular, then Consolas

Display type uses a strong roman sans face with tight spacing. Body copy uses a maximum measure of roughly 65 characters and line height between 1.5 and 1.7. Monospace is limited to product-category and artifact labels.

### Shape and depth

- Controls: 8 to 10 pixel radius
- Cards: 12 pixel radius
- Badges: pill shape at tag scale only
- Marketing structure: borders and whitespace instead of decorative shadows
- Dialog: native browser top layer with one quiet surface

Nested cards, 24-pixel-plus radii, glass effects, outer glow, and decorative shadows are outside the system.

## Reusable components

| Component | Purpose and key behavior |
| --- | --- |
| `BrandLogo` | Accessible logo link with primary, light, and compact states |
| `Button` / `ButtonLink` | Primary, secondary, quiet, danger, disabled, active, and focus states |
| `Card` | One structural content boundary without decorative elevation |
| `Badge` | Text-backed neutral, success, warning, and accent status |
| `SectionHeading` | Consistent marketing heading hierarchy and readable measure |
| `Container` | Responsive page width and edge padding |
| `EmptyState` | Branded explanation plus one useful next action |
| `LoadingState` | Layout-mirroring project skeleton with live-region text |
| `ConfirmDialog` | Native modal confirmation, Escape support, focus management, cancel and danger actions |
| `FormField` | Visible label, hint or error association, and consistent spacing |
| `ProductStageExperience` | ARIA tabs with pointer, arrow, Home, and End controls |
| `FaqSection` | Native disclosure semantics with keyboard-operable summaries |

## Interaction and motion

Motion confirms state; it does not decorate idle screens.

- Fast: 120 milliseconds for small feedback
- Normal: 200 milliseconds for controls and tabs
- Moderate: 320 milliseconds for overlays
- Deliberate: 560 milliseconds for a one-time section reveal
- Standard curve: `cubic-bezier(0.2, 0, 0, 1)`
- Entrance curve: `cubic-bezier(0, 0, 0.2, 1)`

Only opacity and transform are animated. Root-path drawing runs once when the selected stage changes. Under `prefers-reduced-motion: reduce`, duration tokens become zero, scroll behavior becomes immediate, and root/reveal movement is removed.

### Living Architecture signature system

The signature experience keeps one Product Graph visible from the hero through the scroll story and the Discover, Architect, and Execute example. Its visual grammar is semantic:

- Nodes are named product artifacts, never decorative particles.
- Edges show a traceable dependency or transformation.
- Active layers use forest and gold; future layers remain quiet but legible.
- Seed and sprint nodes bookend the graph so the original intent remains connected to delivery.
- Diagram labels and detail panels carry meaning independently of motion or color.

The graph enters in four deliberate layers: seed, discovery, architecture, then execution. Pointer movement may offset selected hero layers by a few pixels through compositor transforms. Scroll progression changes a single active layer through `IntersectionObserver`; it does not bind rendering work to the scroll event. On narrow screens, the large SVG becomes a five-step ordered summary. The workflow diagrams remain locally scrollable without creating page-level overflow.

### Elevation and motion tokens

| Tier | Use |
| --- | --- |
| `flat` | Content that belongs directly to the page plane |
| `raised` | Interactive panels, tabs, and selected product surfaces |
| `floating` | The signature hero graph and exceptional narrative emphasis |

| Motion | Duration | Use |
| --- | --- | --- |
| Immediate | 90 ms | Pressed and focus feedback |
| Fast | 140 ms | Small hover and state changes |
| Normal | 220 ms | Tabs and surface transitions |
| Moderate | 360 ms | Diagram relationships |
| Deliberate | 640 ms | One-time narrative entrance |
| Extended | 760 ms | Connector drawing |

The spatial curve is `cubic-bezier(0.22, 1, 0.36, 1)`. Product application surfaces use only the immediate, fast, and normal tiers. Marketing may use moderate and deliberate motion for explanation. No surface oscillates while idle.

### Performance budgets

- No runtime visualization dependency; diagrams use optimized inline SVG and CSS.
- No continuous React state updates from pointer or scroll movement.
- One observer coordinates the scroll story, and one animation frame batches hero pointer transforms.
- Static content is rendered before enhancement so the story remains complete without JavaScript or motion.
- Incremental landing-page client JavaScript should remain below 25 KB gzip.
- Hero and diagram dimensions are stable before animation to avoid layout shift.

## Accessibility

- Semantic landmarks and headings describe page structure.
- Skip links exist on marketing and authenticated surfaces.
- Touch targets are at least 44 pixels high.
- Keyboard focus uses a three-pixel antique-gold ring with external offset.
- Tabs implement roving `tabIndex`, arrow keys, Home, and End.
- FAQ uses native `details` and `summary` behavior.
- Confirmation uses native `dialog` for browser focus trapping and Escape dismissal.
- Every form control has a visible programmatic label.
- Field hints and errors use `aria-describedby`; form outcomes use live status roles.
- Disabled and future states use labels in addition to color or opacity.
- Loading regions expose screen-reader text and mirror final layout dimensions.

Automated tests cover markup and interaction logic, but they do not certify complete WCAG conformance. Manual keyboard, zoom, contrast, screen-reader, and real-device review remain part of release verification.

## Responsive behavior

Base styles target narrow screens. Multi-column layouts collapse below 768 pixels, navigation becomes horizontally scrollable rather than removing destinations, and project actions wrap without hiding functionality. Review widths are 375, 768, 1024, and 1440 pixels. Safe viewport height uses `100dvh` for application and authentication shells.

At 375 pixels, the Product Graph uses its ordered text fallback and each detailed workflow diagram scrolls inside its own focused region. At 768 pixels and above, the full graph is restored. The narrative sticky plane is reserved for large viewports; smaller screens receive the same five chapters in normal document flow.

## Content rules

### Product voice

Mycellium speaks like an experienced product strategist: warm, curious, precise, grounded, and concise. It acknowledges what changed, names one useful insight or uncertainty, then asks one material question. It encourages momentum without forced cheerfulness, corporate workflow language, or decorative metaphor.

Reusable product copy lives in `lib/voice/mycellium.ts`. A stable input-derived selector varies deterministic acknowledgements without runtime randomness, so fallback conversations stay natural and testable. The same layer owns readiness, contradiction, fallback disclosure, empty-state, review, generation, transition, and export language.

Primary UI copy describes the user's product progress: “Foundation strength,” “Still needs clarity,” “Reliable mode,” and “Ready to architect.” Raw domain statuses remain available in detail surfaces where precision matters. Seed, root, and growth language is reserved for occasional momentum cues rather than every sentence.

- Keep acknowledgements to one sentence unless the answer is genuinely complex.
- Explain the change before asking the next question.
- Name contradictions directly without sounding punitive.
- State when Reliable mode is active without presenting it as a failure.
- Explain exactly when locked actions become available.
- Never use “input received,” “proceed to next step,” “critical gaps remain,” or “readiness assessment updated.”

### Export states

Export remains visible in project navigation at every stage. Before blueprint generation, the destination explains that exports unlock after the first Product Blueprint. After generation, Markdown, JSON, and CSV actions remain directly visible on the export page, blueprint header, blueprint export section, and completion state. Each download confirms success and is generated from the current persisted blueprint, including saved edits.

- State what exists today and label future capability clearly.
- Use sentence case and direct verbs for actions.
- Avoid fake customers, testimonials, logos, metrics, certifications, pricing checkout, and integrations.
- Do not call planned AI behavior available.
- No social authentication controls until a real provider is configured.
- No silent publishing or approval language that weakens human authority.
