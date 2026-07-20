alter table public.projects
  add column pressure_test jsonb,
  add column pressure_tested_at timestamptz,
  add column pressure_test_blueprint_version integer;

alter table public.projects
  add constraint projects_pressure_test_object check (
    pressure_test is null or jsonb_typeof(pressure_test) = 'object'
  ),
  add constraint projects_pressure_test_blueprint_version_positive check (
    pressure_test_blueprint_version is null or pressure_test_blueprint_version > 0
  );

create table public.workflow_requests (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null,
  operation text not null,
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending',
  response_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workflow_requests_operation_allowed check (
    operation in ('blueprint_generation', 'pressure_test')
  ),
  constraint workflow_requests_status_allowed check (
    status in ('pending', 'completed', 'failed')
  ),
  constraint workflow_requests_response_object check (
    response_payload is null or jsonb_typeof(response_payload) = 'object'
  ),
  constraint workflow_requests_project_operation_request_unique unique (
    project_id,
    operation,
    request_id
  )
);

create index workflow_requests_project_operation_created_idx
  on public.workflow_requests (project_id, operation, created_at desc);

create trigger workflow_requests_set_updated_at
before update on public.workflow_requests
for each row execute function private.set_updated_at();

alter table public.workflow_requests enable row level security;
revoke all on table public.workflow_requests from anon, authenticated;
grant select, insert, update on table public.workflow_requests to authenticated;

create policy "workflow_requests_select_owned_project"
on public.workflow_requests
for select
to authenticated
using (
  user_id = (select auth.uid())
  and project_id in (
    select id from public.projects where user_id = (select auth.uid())
  )
);

create policy "workflow_requests_insert_owned_project"
on public.workflow_requests
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and project_id in (
    select id from public.projects where user_id = (select auth.uid())
  )
);

create policy "workflow_requests_update_owned_project"
on public.workflow_requests
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
