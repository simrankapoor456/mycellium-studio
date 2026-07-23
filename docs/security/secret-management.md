# Secret management

## Configuration classes

| Variable | Classification | Browser exposure | Current decision |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public project configuration | Expected | Required |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser-safe publishable key | Expected | Required; never proof of identity |
| `NEXT_PUBLIC_SITE_URL` | Public application URL | Expected | Required |
| `OPENAI_API_KEY` | Secret provider credential | Prohibited | Optional, server-only |
| `OPENAI_MODEL` | Non-secret server configuration | Unnecessary | Optional, server-only |
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged RLS-bypass credential | Prohibited | Intentionally absent |

Mycellium Studio does not need a service-role key. Server requests use the
signed user's Supabase session and remain subject to RLS. Do not add a
service-role variable to examples, Vercel, local development, or code unless a
separately reviewed feature cannot be implemented safely with authenticated
RLS.

## Repository rules

- Local values belong in `.env.local`, which Git ignores.
- `.env.example` contains variable names and non-key-shaped placeholders only.
- Never include values in tests, fixtures, screenshots, terminal transcripts,
  issue bodies, build artifacts, or documentation.
- Server-only variables are parsed only from `lib/env/server.ts`.
- Modules reading provider credentials must import `server-only`.
- Do not prefix a secret with `NEXT_PUBLIC`.
- Do not retrieve values merely to verify that a variable name exists.

## Rotation procedure

1. Identify credential type and affected systems without copying the value.
2. Disable or rotate it at the issuing provider.
3. Update authorized local/deployment stores through their secure UI or CLI
   prompt.
4. redeploy affected environments.
5. invalidate sessions or derived credentials where applicable.
6. inspect logs for unauthorized use.
7. remove the value from the current tree.
8. determine whether published Git history contains it. Do not rewrite shared
   history without an approved coordination plan.
9. document the incident by type, location, time window, and remediation only.

## Verification status

- Current tracked tree: redacted pattern scan completed; no credential pattern
  detected. One database-URL pattern is a synthetic error-classification
  fixture.
- Reachable Git history: redacted path/commit scan completed; no credential
  pattern detected. The same synthetic database-URL fixture appears in one
  commit.
- Local environment: `.env.local` is ignored and contains only the expected
  public/site variable names with optional provider fields unset at review time.
- Client bundle: the production static/server output contains no recognized
  provider key, service-role key, JWT, database URL, private key, GitHub token,
  Vercel token, or cloud-access-key pattern. Server-only environment variable
  names do not occur in client static chunks.
- GitHub: repository is public; secret scanning and push protection were
  disabled at review time.
- Vercel: the CLI resolved the intended project but returned zero environment
  variable rows. Required variable names and Preview/Production scopes need
  dashboard remediation or confirmation; no values were retrieved.
