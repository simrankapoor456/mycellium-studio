# Security review

Review date: 2026-07-23
Branch: `security/supabase-hardening`

This is an evidence-based hardening review, not a guarantee of absolute
security. Status labels distinguish repository evidence from checks that still
require the Supabase or Vercel dashboards.

## Executive summary

- **P0:** No committed service credential, public service-role use,
  authentication bypass, or code-reviewed anonymous private-data policy was
  found.
- **P1:** Production database posture is **not yet verified**. A prior
  production schema-cache failure for `workflow_requests` shows that repository
  migrations and production cannot be assumed to match. Run the read-only SQL
  audit before applying the new migration.
- **P2 fixed in this branch:** table-level mutation grants were narrowed to
  application columns; new child rows receive composite owner/project foreign
  keys; API mutations require bounded JSON; CSV formulas are neutralized;
  route-render errors are redacted; signup no longer returns a distinct
  existing-account error; security headers and private cache controls were
  added; Next.js received the scoped security patch.
- **P2 manual:** GitHub secret scanning, push protection, and Dependabot
  security updates are disabled. Supabase Auth rate limits, redirect settings,
  storage, exposed schemas, and production RLS require dashboard review. The
  Vercel CLI reports zero project environment variables, and the locally
  configured publishable key received HTTP 401 before every read-only table
  probe; the production variable/project pairing needs operator verification.
- **P3:** The enforced CSP-compatible baseline still needs observation before
  promoting the report-only CSP. External HTTPS avatar hosts have a user
  privacy trade-off. Repository ownership is concentrated in one contributor.

Production should remain unchanged until the SQL audit and dashboard checklist
are reviewed. This branch must not be merged merely because code tests pass.

## Threat model

### Assets

- Supabase sessions and authentication state
- Private profiles and project records
- Discovery messages and request ledgers
- Approved foundations, blueprints, pressure tests, and exports
- Provider credentials and environment configuration
- Deployment and source-control integrity

### Actors and risks

- An unauthenticated visitor attempting private reads or writes
- An authenticated owner attempting to access another owner's project by UUID
- A browser user bypassing UI workflows and calling PostgREST directly
- Cross-site requests attempting cookie-backed mutations
- Malicious project text reaching HTML, Markdown, JSON, CSV, filenames, or logs
- A compromised dependency, deployment variable, or source-control credential
- An operator applying migrations out of order or assuming repository SQL is live

### Trust boundaries

1. The browser receives the Supabase URL and publishable key. These identify
   the project but do not authorize a user.
2. Supabase session cookies cross into Next.js Server Components, actions, and
   route handlers. Signed claims establish identity.
3. RLS is the database boundary. Application owner filters are defense in
   depth, not a substitute for RLS.
4. Provider calls are server-only. Project source material crosses that
   boundary only from authenticated, owner-scoped orchestration.
5. Vercel, GitHub, and Supabase dashboards are operator boundaries requiring
   separate access controls and audit.

## Authentication review

Status: **code-reviewed** and partially **test-covered**.

- Login, signup, profile mutations, and protected layouts resolve identity
  server-side.
- `getCurrentUser()` accepts only signed Supabase claims with a UUID subject.
- Protected layout access redirects unauthenticated sessions.
- Email confirmation and login/signup return paths pass through an exact-path
  and project-route allowlist; protocol-relative, absolute, backslash, colon,
  and null-byte paths are rejected.
- Signup masks known existing-account errors with the same confirmation-pending
  state used by a normal unconfirmed signup.
- Password and email changes call Supabase Auth from server actions after
  resolving the current session.
- Next.js origin checks protect server actions. JSON-only mutation routes reduce
  simple cross-site form submission exposure.
- Supabase dashboard verification is required for email confirmation, secure
  cookie behavior, session duration, refresh-token reuse, password policy,
  SMTP, CAPTCHA, MFA, and Auth rate limits.

### Abuse and replay controls

Discovery, blueprint, and pressure-test writes use request IDs and database
request ledgers for replay-safe idempotency. They do not yet have a shared
edge/distributed request limiter. Login, signup, confirmation, recovery, and
email-change limits must be configured in Supabase Auth; discovery, blueprint,
pressure-test, and export limits need an explicit application/provider policy
before wider launch. This is a documented P2 gap. No local-only rate-limit
package was added because it would not provide reliable multi-instance
enforcement on Vercel.

## Authorization review

Status: **code-reviewed**, **test-covered at the application/policy-source
level**, and **production SQL verification required**.

- Project operations always combine the project UUID with the server-resolved
  user ID.
- Mycel Core loads a signed user and an owned project before discovery,
  review, blueprint, pressure-test, or export operations.
- Export responses are owner-checked server-side and returned with
  `private, no-store`.
- Project UUID knowledge alone is insufficient in code and expected RLS.
- Browser and server clients both use the authenticated role. Owners can modify
  permitted fields on their own rows through PostgREST; this is an accepted
  single-owner product boundary, not an administrative boundary.
- No team, organization, shared-owner, admin, or service-role access model is
  implemented.

## RLS and database review

Repository migrations define five application tables. All enable RLS and have
explicit `authenticated` ownership policies. The new forward-only migration:

- revokes anonymous and PUBLIC table access;
- replaces broad authenticated mutation grants with column-level grants;
- makes discovery messages append-only through PostgREST;
- prevents authenticated updates to project/owner/request identity columns;
- adds composite owner/project foreign keys for future child rows;
- revokes direct API execution on private trigger functions.

`private.handle_new_user()` is `SECURITY DEFINER`, has an empty `search_path`,
fully qualifies `public.profiles`, and does not trust a caller-supplied owner.

FORCE RLS is not enabled. Application traffic does not use a table-owner
connection, while controlled migration/incident operations still require an
owner path. See `expected_security_posture.md`.

The composite child foreign keys are created `NOT VALID`: new writes are
enforced immediately, while existing production rows must be audited before
constraint validation.

## Input, output, and error safety

- Zod validates authentication, project, discovery, blueprint, profile, and
  workflow payloads.
- API project IDs are UUID-validated before database access.
- Mutation routes accept only JSON and cap declared/parsed bodies at 1 MB.
- Server actions use a 1 MB framework limit.
- React renders user text without `dangerouslySetInnerHTML`.
- Avatar URLs accept HTTPS only. Arbitrary HTTPS hosts remain an accepted
  privacy risk until image proxying or approved-host policy exists.
- Export filenames are reduced to lowercase ASCII slugs.
- CSV values beginning with formula operators, including after leading
  whitespace, receive an apostrophe prefix before quoting.
- API failures are typed, generic on unexpected faults, and never include
  stack traces or database details.
- Browser render logs include only a Next.js digest, not the error object.

## Web headers

Enforced:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- restrictive camera, location, microphone, payment, and USB permissions
- `private, no-store` for APIs and authenticated route families

The CSP is report-only because Next.js currently emits inline bootstrap/style
content and the application has no nonce pipeline. It excludes `unsafe-eval`,
allows browser connections only to self and Supabase, and should be promoted
only after production observation. HSTS is left to Vercel's HTTPS platform and
must be confirmed against the final custom-domain strategy.

## Dependency and supply-chain review

The baseline reported high-severity advisories in Next.js and its bundled
PostCSS/Sharp chain. This branch updates `next` and `eslint-config-next`
together from 16.2.10 to the scoped 16.2.11 patch, and applies narrow lockfile
overrides to PostCSS 8.5.19 and Sharp 0.35.3. The final dependency tree is
valid, the production build succeeds, and `npm audit` reports zero known
vulnerabilities. The overrides must be re-evaluated when Next updates its own
dependency ranges.

No additional scanner package or install-time security dependency was added.
Local `gitleaks` and `trufflehog` executables were unavailable.

## Known limitations and manual gates

- Production catalog/RLS/grant state is not available through repository code.
  Anonymous REST probes were blocked with HTTP 401 before table policy
  evaluation, so they do not verify RLS.
- Authenticated cross-user database tests require two controlled test users and
  a non-production or transaction-rollback environment.
- Existing composite owner foreign keys require data audit and validation.
- Supabase Storage is not used by application code; dashboard state is unknown.
- Vercel CLI returned a successful project lookup but zero environment-variable
  rows. Confirm the required names and Preview/Production scopes in the Vercel
  dashboard before deployment.
- GitHub security automation is disabled.
- CSP remains report-only.
- Authentication abuse controls depend partly on Supabase dashboard settings.

## Remediation priority

| Priority | Finding | State |
| --- | --- | --- |
| P0 | Active secret or service-role leak | Not detected |
| P1 | Production migration/RLS state differs from repository expectations | Manual SQL verification required |
| P2 | Broad authenticated mutation grants | Fixed in forward migration |
| P2 | Child owner/project relationship not enforced by composite FK | Fixed for new writes; existing-row validation required |
| P2 | CSV formula interpretation | Fixed and test-covered |
| P2 | Missing response hardening and private cache headers | Fixed; CSP report-only |
| P2 | GitHub scanning and automated dependency updates disabled | Manual repository setting |
| P2 | Auth dashboard abuse/session controls unknown | Manual dashboard review |
| P2 | No shared application rate limiter for generation/export routes | Deferred; define provider/edge policy |
| P2 | Production environment names/scopes and public-key pairing unverified | Manual Vercel/Supabase review |
| P3 | External avatar-host privacy | Accepted risk, documented |
| P3 | Single-contributor ownership concentration | Process hardening recommended |
