# Supabase setup through Mycel Core

The application needs a Supabase URL and publishable key only. Do not create, expose, or add a service-role key.

## 1. Local environment

Copy `.env.example` to `.env.local` and fill in the first two values from Supabase **Project Settings → API**:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
OPENAI_API_KEY=
OPENAI_MODEL=
```

`.env.local` is ignored by Git. Keep both OpenAI values blank for deterministic Phase 3B behavior. Set both only when enabling optional provider generation; the API key remains server-only.

## 2. Apply the migration

Apply [`supabase/migrations/20260717220000_phase_2_personal_foundation.sql`](../supabase/migrations/20260717220000_phase_2_personal_foundation.sql) to the target Supabase project.

Then apply [`supabase/migrations/20260718000000_phase_3b_core_product.sql`](../supabase/migrations/20260718000000_phase_3b_core_product.sql). Migrations must run in timestamp order. Do not edit the already-applied Phase 2 migration.

Finally apply [`supabase/migrations/20260718190000_mycel_core_intelligence.sql`](../supabase/migrations/20260718190000_mycel_core_intelligence.sql). It adds the separate Pressure Test snapshot, its blueprint-version link, and owner-scoped workflow idempotency records. Do not edit either earlier migration.

Then apply [`supabase/migrations/20260719090000_phase_6_core_journey.sql`](../supabase/migrations/20260719090000_phase_6_core_journey.sql). It adds the custom product-type label, generation request lineage, and optional profile avatar, timezone, and location fields. Existing personal-workspace RLS policies remain unchanged.

With a locally authenticated Supabase CLI, link the intended project and run:

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Alternatively, open each migration in the Supabase SQL Editor, review the target project, and run it once in timestamp order. Together they create `profiles`, `projects`, ordered `discovery_messages`, approval/version fields, project-scoped `discovery_requests`, and owner-scoped `workflow_requests`, with explicit RLS. Do not run them against an unrelated or production project without the normal review/backup process.

## 3. Configure Auth

In Supabase **Authentication → Providers → Email**:

- Enable the Email provider.
- Enable email/password signup.
- Keep email confirmation enabled for the production posture.

In **Authentication → URL Configuration** set:

- Site URL for local development: `http://localhost:3000`
- Additional redirect URL: `http://localhost:3000/auth/confirm`
- Production Site URL: the deployed HTTPS origin
- Production redirect URL: `https://YOUR_DEPLOYED_DOMAIN/auth/confirm`
- Preview redirect patterns only when the deployment provider requires them; keep them as narrow as practical.

In the confirmation email template, make the confirmation link point to:

```text
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
```

The callback verifies the one-time token on the server and then redirects to `/dashboard`.

## 4. Schema and RLS summary

- `profiles`: one row per `auth.users` record; a trigger provisions it at signup.
- `projects`: personally owned project metadata plus JSON slots for later discovery/readiness/plan data.
- `discovery_messages`: ordered, role-constrained messages that cascade when their project is deleted.
- `discovery_requests`: project-scoped request UUIDs and completed response payloads for duplicate-turn protection.
- `workflow_requests`: owner-scoped idempotency and bounded-rate records for blueprint generation and Pressure Test operations.

RLS permits an authenticated user to:

- select and update only their profile;
- select, insert, update, and delete only their projects;
- access a discovery message only when both its `user_id` matches and its parent project is owned by that user;
- insert discovery messages only beneath a project they own.
- access workflow records only when the parent project belongs to them.

Application queries also filter by `user_id`, providing defense in depth. RLS is still the authoritative database boundary.

## 5. Exact manual two-user RLS verification

Perform this test in a non-production Supabase project after applying the migration.

1. Use `/signup` to create and confirm User A and User B. Copy their UUIDs from **Authentication → Users**.
2. Sign in as User A, create a project, and copy its UUID from the `/projects/{uuid}` URL. Sign out.
3. Sign in as User B and open User A's project URL. The app must return the not-found page, not project data.
4. In the Supabase SQL Editor, replace the placeholder UUIDs below. Run each block as its own transaction; every transaction rolls back.

User A must see and may update the project:

```sql
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"USER_A_UUID","role":"authenticated"}';
select auth.uid();
select id, user_id, name from public.projects where id = 'USER_A_PROJECT_UUID';
update public.projects set name = name where id = 'USER_A_PROJECT_UUID' returning id;
rollback;
```

User B must see zero rows, update zero rows, and be unable to insert a child message for User A's project:

```sql
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"USER_B_UUID","role":"authenticated"}';
select auth.uid();
select id, user_id, name from public.projects where id = 'USER_A_PROJECT_UUID';
update public.projects set name = name where id = 'USER_A_PROJECT_UUID' returning id;
insert into public.discovery_messages (
  project_id, user_id, role, content, sequence_number
) values (
  'USER_A_PROJECT_UUID', 'USER_B_UUID', 'user', 'RLS probe', 999999
);
rollback;
```

Expected results for User B: the select and update return no rows; the insert fails with a row-level security policy violation. Confirm `auth.uid()` equals the intended UUID in each block before interpreting the result.

5. Repeat the child-message insert while impersonating User A and using `USER_A_UUID`; it should succeed inside the transaction, then be removed by `rollback`.

## 6. Deployment checklist

- Add the three `NEXT_PUBLIC_*` values to the deployment environment; keep the publishable key only in its documented public variable.
- Set `NEXT_PUBLIC_SITE_URL` to the exact deployed HTTPS origin.
- Add the production confirmation callback to Supabase Auth redirect URLs.
- Apply all checked-in migrations in timestamp order to the deployment project's database.
- Keep `OPENAI_API_KEY` and `OPENAI_MODEL` blank for deterministic mode, or set both to enable the optional server-only provider.
- Run signup, confirmation, login, project CRUD, logout, and the two-user isolation test against the deployed environment.
