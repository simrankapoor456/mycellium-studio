# Expected Supabase security posture

Status vocabulary: **code-reviewed**, **SQL verification required**, and
**dashboard verification required**. Repository migrations do not prove that
production has applied the same state.

## Application tables

| Table | Data and owner | Expected RLS | Authenticated access | Anonymous access | FORCE RLS |
| --- | --- | --- | --- | --- | --- |
| `profiles` | Personal profile; `id = auth.uid()` | Enabled; own-row select and update policies | Select own row; update profile fields only; no direct insert/delete | None | No |
| `projects` | Private product records; `user_id` | Enabled; separate own-row select, insert, update, delete policies | Owner-only CRUD; `id`, `user_id`, and timestamps are not updateable | None | No |
| `discovery_messages` | Project conversation; `project_id` plus `user_id` | Enabled; user and owned-parent predicates | Select and append within an owned project; no direct update/delete grant | None | No |
| `discovery_requests` | Idempotency ledger; `project_id` plus `user_id` | Enabled; user and owned-parent predicates | Select; insert immutable request identity; update only status and response | None | No |
| `workflow_requests` | Blueprint/pressure-test ledger; `project_id` plus `user_id` | Enabled; user and owned-parent predicates | Select; insert immutable request/operation identity; update only status and response | None | No |

Blueprints, pressure tests, discovery facts, contradictions, challenges, and
architecture data are JSON fields within `projects`; they inherit the project
owner policy. Export responses are generated server-side after the same owner
check and use `private, no-store`.

## Policy expectations

- Every policy targets `authenticated`, never `anon` or `PUBLIC`.
- Project insert and update policies use `WITH CHECK (auth.uid() = user_id)`.
- Child inserts and updates require both `user_id = auth.uid()` and ownership
  of `project_id`.
- Composite `(project_id, user_id)` foreign keys enforce the same relationship
  for new child rows even if a privileged database path bypasses RLS.
- Request ledgers cannot reassign request ID, project, owner, or operation
  through authenticated PostgREST updates.
- `private.handle_new_user()` is the only profile-creation path. It is
  `SECURITY DEFINER`, uses an empty `search_path`, fully qualifies its target,
  and has no direct API execute grant.

## FORCE RLS decision

FORCE RLS is intentionally not enabled. Browser and server Supabase requests
run as `anon` or `authenticated`, not as table owner, so RLS already applies.
Migration owners need a controlled path for schema maintenance and incident
recovery. Revisit this only if application traffic begins using a table-owner
connection.

## Production checks

Run `verify_security_posture.sql` in the Supabase SQL Editor. Confirm all five
tables exist, RLS is enabled, policy counts match the repository, anonymous
write-grant results are empty, and the three composite owner foreign keys have
no inconsistent existing rows before validating them. Production remains
**not yet verified** until those results are reviewed.
