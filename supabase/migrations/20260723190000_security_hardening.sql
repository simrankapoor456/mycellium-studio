begin;

-- The public schema remains available to PostgREST, but application roles may
-- not create objects or receive implicit access to present or future tables.
revoke create on schema public from public, anon, authenticated;
grant usage on schema public to anon, authenticated;

revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
revoke all on table
  public.profiles,
  public.projects,
  public.discovery_messages,
  public.discovery_requests,
  public.workflow_requests
from public, authenticated;

alter default privileges in schema public revoke all on tables from public, anon, authenticated;
alter default privileges in schema public revoke all on sequences from public, anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

-- Profile creation remains owned by the auth.users trigger. Authenticated
-- sessions can read and edit only mutable profile attributes under RLS.
grant select on table public.profiles to authenticated;
grant update (display_name, avatar_url, timezone, location)
  on table public.profiles to authenticated;

-- Project owners retain the product operations used by the application, while
-- immutable identity and timestamp columns cannot be updated through PostgREST.
grant select, delete on table public.projects to authenticated;
grant insert (
  id,
  user_id,
  name,
  description,
  project_type,
  custom_project_type,
  target_users,
  team_size,
  sprint_length,
  capacity,
  planning_depth,
  constraints,
  status,
  discovery_context,
  readiness_state,
  plan,
  plan_schema_version,
  generation_source,
  approved_discovery_context,
  discovery_approved_at,
  context_version,
  blueprint_version,
  pressure_test,
  pressure_tested_at,
  pressure_test_blueprint_version,
  last_generation_request_id
) on table public.projects to authenticated;
grant update (
  name,
  description,
  project_type,
  custom_project_type,
  target_users,
  team_size,
  sprint_length,
  capacity,
  planning_depth,
  constraints,
  status,
  discovery_context,
  readiness_state,
  plan,
  plan_schema_version,
  generation_source,
  approved_discovery_context,
  discovery_approved_at,
  context_version,
  blueprint_version,
  pressure_test,
  pressure_tested_at,
  pressure_test_blueprint_version,
  last_generation_request_id
) on table public.projects to authenticated;

-- Messages are append-only from the application. Project deletion still
-- removes them through the existing foreign-key cascade.
grant select on table public.discovery_messages to authenticated;
grant insert (
  id,
  project_id,
  user_id,
  role,
  content,
  structured_facts,
  sequence_number
) on table public.discovery_messages to authenticated;

-- Request identity and ownership are fixed at insertion. Only lifecycle state
-- and the bounded response payload may be updated.
grant select on table public.discovery_requests to authenticated;
grant insert (request_id, project_id, user_id)
  on table public.discovery_requests to authenticated;
grant update (status, response_payload)
  on table public.discovery_requests to authenticated;

grant select on table public.workflow_requests to authenticated;
grant insert (request_id, operation, project_id, user_id)
  on table public.workflow_requests to authenticated;
grant update (status, response_payload)
  on table public.workflow_requests to authenticated;

-- Trigger functions do not need direct API execution privileges. The
-- auth.users trigger continues to execute the SECURITY DEFINER function.
revoke execute on function private.set_updated_at() from public, anon, authenticated;
revoke execute on function private.handle_new_user() from public, anon, authenticated;

-- A composite key makes the project/owner relationship available to child
-- foreign keys. NOT VALID preserves existing data while enforcing the
-- relationship for all new or changed rows. Validation follows the read-only
-- production audit.
do $migration$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.projects'::regclass
      and conname = 'projects_id_user_id_unique'
  ) then
    alter table public.projects
      add constraint projects_id_user_id_unique unique (id, user_id);
  end if;
end
$migration$;

do $migration$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.discovery_messages'::regclass
      and conname = 'discovery_messages_project_owner_fk'
  ) then
    alter table public.discovery_messages
      add constraint discovery_messages_project_owner_fk
      foreign key (project_id, user_id)
      references public.projects (id, user_id)
      on delete cascade
      not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.discovery_requests'::regclass
      and conname = 'discovery_requests_project_owner_fk'
  ) then
    alter table public.discovery_requests
      add constraint discovery_requests_project_owner_fk
      foreign key (project_id, user_id)
      references public.projects (id, user_id)
      on delete cascade
      not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.workflow_requests'::regclass
      and conname = 'workflow_requests_project_owner_fk'
  ) then
    alter table public.workflow_requests
      add constraint workflow_requests_project_owner_fk
      foreign key (project_id, user_id)
      references public.projects (id, user_id)
      on delete cascade
      not valid;
  end if;
end
$migration$;

commit;
