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

## Content rules

- State what exists today and label future capability clearly.
- Use sentence case and direct verbs for actions.
- Avoid fake customers, testimonials, logos, metrics, certifications, pricing checkout, and integrations.
- Do not call planned AI behavior available.
- No social authentication controls until a real provider is configured.
- No silent publishing or approval language that weakens human authority.
