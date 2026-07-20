# Validation strategy

Validation is progressive and uses the same canonical Zod schemas on both sides of the server-action boundary.

## Client boundary

`useTrustedForm` converts the current form into `FormData`, runs the relevant Zod schema before submission, and prevents obviously invalid requests. It then:

1. renders field-specific errors inline;
2. adds `aria-invalid` and an accessible description;
3. scrolls the first invalid field into view;
4. focuses it on the next animation frame;
5. leaves every value and dirty flag intact.

Reduced-motion preference changes smooth scrolling to immediate scrolling.

## Server boundary

Server actions parse the same inputs again. Invalid data returns a validation `ActionState` with flattened field errors and never calls Supabase. Authentication is checked after validation so malformed data never reaches persistence.

Project creation returns a successful client redirect target only after Supabase has returned the owned project row. The browser clears its local draft and navigates only after that success response.

## Canonical rules

- Project name: required, trimmed, 120 characters maximum.
- Project description: required, trimmed, 20,000 characters maximum.
- Team size: required integer from 1 through 50.
- Sprint duration: required canonical duration.
- Project type, target users, planning depth, sprint capacity, constraints, and custom type detail: optional.
- Display name: required, trimmed, 80 characters maximum.
- Avatar URL: optional HTTPS URL.
- Timezone: optional valid IANA timezone.
- Location: optional, 120 characters maximum.

Native constraints remain in markup for browser and assistive-technology semantics. Zod remains authoritative.
