alter table public.projects
  add column approved_discovery_context jsonb,
  add column discovery_approved_at timestamptz,
  add column context_version integer not null default 0,
  add column blueprint_version integer not null default 0;

alter table public.projects
  add constraint projects_approved_discovery_context_object check (
    approved_discovery_context is null or jsonb_typeof(approved_discovery_context) = 'object'
  ),
  add constraint projects_context_version_nonnegative check (context_version >= 0),
  add constraint projects_blueprint_version_nonnegative check (blueprint_version >= 0);

create table public.discovery_requests (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null,
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending',
  response_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint discovery_requests_status_allowed check (status in ('pending', 'completed', 'failed')),
  constraint discovery_requests_response_object check (
    response_payload is null or jsonb_typeof(response_payload) = 'object'
  ),
  constraint discovery_requests_project_request_unique unique (project_id, request_id)
);

create index discovery_requests_project_created_idx
  on public.discovery_requests (project_id, created_at desc);

create trigger discovery_requests_set_updated_at
before update on public.discovery_requests
for each row execute function private.set_updated_at();

alter table public.discovery_requests enable row level security;
revoke all on table public.discovery_requests from anon, authenticated;
grant select, insert, update on table public.discovery_requests to authenticated;

create policy "discovery_requests_select_owned_project"
on public.discovery_requests
for select
to authenticated
using (
  user_id = (select auth.uid())
  and project_id in (
    select id from public.projects where user_id = (select auth.uid())
  )
);

create policy "discovery_requests_insert_owned_project"
on public.discovery_requests
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and project_id in (
    select id from public.projects where user_id = (select auth.uid())
  )
);

create policy "discovery_requests_update_owned_project"
on public.discovery_requests
for update
to authenticated
using (
  user_id = (select auth.uid())
  and project_id in (
    select id from public.projects where user_id = (select auth.uid())
  )
)
with check (
  user_id = (select auth.uid())
  and project_id in (
    select id from public.projects where user_id = (select auth.uid())
  )
);
