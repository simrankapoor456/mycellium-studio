# Form trust layer

Phase 7.2.5 adds a presentation and recovery layer without changing database schema, RLS, authentication architecture, generation, exports, or API shapes.

## Input safety

- Project creation uses controlled values so a React action response cannot replace the current draft.
- New-project drafts are stored locally after a short idle delay, scoped to the authenticated user id, and restored after an unexpected refresh.
- Local drafts contain project-form text only. Passwords, authentication tokens, profile fields, and server records are never copied into local storage.
- A project draft is deleted only after the create action confirms persistence. Failed validation, network, authentication, database, and permission states leave it intact.
- Profile and account sections track dirty state independently. Password fields clear only after a successful password change.
- Dirty forms warn on browser unload and internal navigation. Clean forms do not warn.

## Experience boundaries

The project page uses low-cost radial lighting and static CSS depth. It adds no canvas, particle runtime, WebGL, or continuous animation. The Foundation preview is derived only from current required-field completeness and description length. It does not call AI or fabricate output.

## Accessibility

- All controls keep visible labels and 44-pixel or larger targets.
- Required and optional status is visible; required controls also expose native semantics.
- Inline errors are connected through `aria-describedby` and announced through alert regions.
- The first invalid control receives focus and scroll alignment.
- Comboboxes support text filtering, Arrow Up, Arrow Down, Enter, and Escape.
- Pending and saved states use live regions without relying on color.
- Reduced motion removes preview transforms and smooth error scrolling.

## Performance

The layer adds no dependency. Validation occurs only on submission, and field edits clear only their own client error. Local draft writes are delayed by 250 milliseconds. Timezone filtering is memoized, visual depth is CSS-only, and no layout property is animated.
