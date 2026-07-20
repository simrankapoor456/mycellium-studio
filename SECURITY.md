# Security policy

## Supported code

Security fixes target the latest code on the active development branch. Historical prototype files under `legacy-static/` are preserved reference material and are not a deployed application.

## Reporting a concern

Do not open a public issue with exploit details, credentials, personal data, or reproduction data from a real account.

Use GitHub private vulnerability reporting from the repository Security tab when it is available. If that option is not visible, contact the repository owner privately through their GitHub profile and include only enough initial context to establish a secure follow-up channel.

Please include:

- the affected route, component, or boundary
- the security impact
- minimal reproduction steps using synthetic data
- whether authentication or a specific role is required
- any safe mitigation you have already confirmed

Never send a Supabase service-role key, OpenAI key, session cookie, access token, or real user content.

## Security model

- Supabase row-level security is authoritative for persisted ownership.
- Protected server paths resolve verified identity and add explicit owner filters.
- Public publishable configuration is separated from server-only provider credentials.
- Mycel Core keeps provider proposals outside persistence authority.
- Canonical schemas validate inputs and persisted structured outputs.
- Reliable mode preserves workflow behavior without a provider credential.
- Repository secrets belong in local or deployment environment configuration, never tracked files.

After a report is received, maintainers will confirm a private communication path, reproduce the concern safely, and coordinate a fix and disclosure appropriate to its impact.
