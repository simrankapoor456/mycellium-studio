# Phase 3A.5 signature experience

Status: Complete

## WORKFLOW STATE

Package Manager: npm (via package.json packageManager field)
Framework: Next.js App Router 16.2.10 with React 19 and Tailwind CSS 4
Verification: npm install, npm test, npm run lint, npx tsc --noEmit, npm run build, npm audit, git diff --check, browser review at 375/768/1024/1440

## Objective

Create a memorable Living Architecture experience that explains how one rough idea becomes discovery context, requirements, architecture, delivery work, and sprints. Preserve every Phase 2 and Phase 3A authentication, persistence, ownership, accessibility, metadata, route, and responsive contract.

## Design direction

Register: brand on the marketing page, product inside authenticated surfaces.

Physical scene: a founder and engineering lead move precise system overlays across a backlit drafting table in clear morning light, with decisions above the surface and connected reasoning visible beneath it.

Aesthetic system: the existing Mycellium brand identity, extended into spatial technical diagrams. Forest and green-tinted neutrals remain dominant; antique gold identifies active paths and focus only. The signature device is one Product Graph that persists from the hero through the scroll narrative and simulated workflow, becoming more structured at each step.

Reference moves, filtered through the Mycellium identity:

- NASA systems diagrams: relationships remain legible before decoration.
- Apple product storytelling: depth is restrained and progressive, with one focal transition at a time.
- IBM Carbon: states, labels, and hierarchy remain explicit under visual density.

No source layout, asset, or animation is copied.

Layout families: split-asymmetric hero, scroll-pinned chapter, and dense diagram workspace. The authenticated application keeps one calm productivity layout family.

## Existing experience audit

| Dimension | Score | Finding |
| --- | ---: | --- |
| Visual hierarchy | 3/4 | Clear and disciplined, but the hero visual has less authority than the headline. |
| Typography | 3/4 | Strong scale and measure; the signature display moment can become more spatial. |
| Color and contrast | 4/4 | Coherent, accessible palette with restrained accent use. |
| Spacing rhythm | 4/4 | Consistent responsive rhythm and structural whitespace. |
| Motion | 2/4 | Safe reduced-motion behavior, but only simple reveal and path drawing exist. |
| Accessibility | 4/4 | Semantic landmarks, focus, native disclosure/dialog, and ARIA tabs are established. |
| Responsiveness | 4/4 | Phase 3A passed 375/768/1440 without overflow. |
| AI-slop resistance | 3/4 | Honest content and original branding; some diagrams and capability layouts remain conventional. |
| IA and flow shape | 4/4 | Marketing and product registers are clearly separated. |

Total: 31/36. Phase 3A.5 is a focused signature upgrade, not a structural rewrite.

## Implementation sequence

1. Define spatial elevation, lighting, perspective, and motion tokens with static and reduced-motion fallbacks.
2. Build the interactive SVG Product Graph hero with pointer-responsive depth and a static semantic baseline.
3. Add a five-chapter sticky narrative driven by IntersectionObserver, not scroll listeners.
4. Redesign the Discover, Architect, and Execute example around fixed conversational and planning data.
5. Add six consistent diagrams: product graph, readiness view, scope boundary map, dependency map, work hierarchy, and sprint timeline.
6. Carry restrained depth and productive state motion into authentication, dashboard, project shell, empty, and loading surfaces.
7. Extend interaction, fallback, keyboard, rendering, and navigation tests.
8. Document the signature system, verify, review, commit logically, and push feat/fullstack-mvp.

## Performance budgets

- No new runtime visualization or motion library unless CSS/SVG proves insufficient.
- Incremental landing-page client JavaScript target: at most 25 KB gzip.
- No continuous React state updates from pointer or scroll input.
- One IntersectionObserver for chapter activation; no scroll event listeners.
- Pointer depth updates only compositor transforms through one animation-frame callback.
- Every animated property is transform, opacity, stroke dash offset, or color.
- All visual regions reserve dimensions to avoid layout shift.
- Static content is visible before enhancement; no blank reveal defaults.
- Lighthouse Accessibility, Best Practices, and SEO targets remain at least 95.

## Proof

- One seed visibly develops through all five narrative chapters.
- Discover, Architect, and Execute each expose realistic fixed data and keyboard-operable controls.
- All six requested diagrams communicate named product relationships and include text alternatives or detail panels.
- Reduced-motion mode removes parallax and positional choreography while retaining complete information.
- No horizontal overflow at 375, 768, 1024, or 1440 pixels.
- Existing authentication, Supabase, CRUD, RLS, metadata, routes, and server actions remain behaviorally unchanged.

## Verification record

- Browser review: no page overflow at 375, 768, 1024, or 1440 pixels.
- Lighthouse desktop: Accessibility 100, Best Practices 100, SEO 100.
- Lighthouse mobile: Accessibility 100, Best Practices 100, SEO 100.
- Throttled mobile trace: LCP 1.236 seconds and CLS 0.00 on Fast 4G with 4x CPU throttling.
- Landing client chunk: 15,375 bytes gzip, an increase of 6,233 bytes from the Phase 3A baseline.
- Automated tests: 38 passing across 7 files.
- No new runtime or development library introduced.
- `npm audit`: two moderate PostCSS advisories inherited through Next.js; the offered fix is a breaking forced dependency change and was not applied.
