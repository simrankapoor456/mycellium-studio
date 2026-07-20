# Living Foundation Map

## Purpose

The Living Foundation Map explains how product intent becomes architecture-ready context. It is a deterministic view of persisted Discovery state, not a separate model and not a decorative mind map.

## Topology

The desktop SVG uses five conceptual layers:

1. original intent
2. evidence roots
3. seven foundation branches
4. architecture readiness
5. persisted Product Blueprint

The seven branches remain users, problem, outcome, evidence, scope, feasibility, and risks. Their facts and states come from `buildFoundationAreas`, while `FoundationMap` owns only fixed coordinates and a fixed set of branching and merging Bézier paths. There is no random placement, simulation, drag state, or saved visual position.

Paths show meaningful dependencies. Users and problem converge on scope; evidence feeds feasibility; outcome feeds risks; scope, feasibility, and risks converge on readiness. The Blueprint node remains visibly subsequent to review and persistence.

## Visual states

- Stable: grounded branch with a continuous intelligence line.
- Emerging: partial evidence with a quieter line.
- Unresolved: no sufficient grounded evidence.
- Deferred: an accepted unknown remains visible.
- Challenged: an open challenge is attached to the branch.
- Blocked: an approval blocker targets the branch.

State is always written beside the node and reinforced by line treatment, border, or shape. Glow is not the only indicator.

## Selection and lineage

Pointer hover on fine-pointer devices, click, and focus all select a branch. Related paths and connected branches receive `data-related=true`. The detail panel explains:

- why the branch exists
- what later decisions depend on it
- each grounded fact and fact state
- how many source answers support the fact
- missing areas
- attached open challenges

The map never changes canonical state directly. Review controls remain the explicit mutation surface.

## Accessibility

- Each foundation node is a normal button with a complete accessible name.
- Arrow keys move to adjacent branches; Home and End move to the first and last branch.
- The selected detail region is connected through `aria-describedby` and announced as content changes.
- A screen-reader-only ordered list describes intent, roots, every branch state, convergence, and Blueprint progression.
- At small widths the SVG and absolute coordinates are removed. The same buttons become a vertical lineage beside a continuous structural rule.
- Reduced motion shows complete paths and nodes immediately.

## Motion and cleanup

The one-time relationship reveal runs only in a Client Component through the shared GSAP adapter. It uses a component-local scope, `useGSAP`, `gsap.matchMedia()`, and timeline cleanup. A context-version change replays only the local formation. No idle loop remains active.

## Constraints

The map adds no table, migration, API contract, graph schema, or persistence. Fixed topology is deliberate: it gives stable spatial memory and avoids the layout drift and collision handling of force-directed graphs.
