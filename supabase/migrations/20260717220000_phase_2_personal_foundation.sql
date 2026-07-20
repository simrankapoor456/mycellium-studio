create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length check (
    display_name is null or char_length(display_name) between 1 and 120
  )
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text,
  project_type text,
  target_users text,
  team_size integer,
  sprint_length text,
  capacity integer,
  planning_depth text,
  constraints text,
  status text not null default 'discovery',
  discovery_context jsonb,
  readiness_state jsonb,
  plan jsonb,
  plan_schema_version text,
  generation_source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_name_length check (char_length(btrim(name)) between 1 and 120),
  constraint projects_description_length check (
    description is null or char_length(description) <= 2000
  ),
  constraint projects_type_allowed check (
    project_type is null or project_type in (
      'web-app',
      'mobile-app',
      'internal-tool',
      'ai-product',
      'data-pipeline',
      'other'
    )
  ),
  constraint projects_target_users_length check (
    target_users is null or char_length(target_users) <= 1000
  ),
  constraint projects_team_size_range check (
    team_size is null or team_size between 1 and 50
  ),
  constraint projects_sprint_length_allowed check (
    sprint_length is null or sprint_length in ('1-week', '2-weeks', '3-weeks', '4-weeks')
  ),
  constraint projects_capacity_range check (
    capacity is null or capacity between 1 and 200
  ),
  constraint projects_planning_depth_allowed check (
    planning_depth is null or planning_depth in ('lean', 'balanced', 'detailed')
  ),
  constraint projects_constraints_length check (
    constraints is null or char_length(constraints) <= 5000
  ),
  constraint projects_status_allowed check (
    status in ('discovery', 'ready', 'planned', 'archived')
  ),
  constraint projects_discovery_context_object check (
    discovery_context is null or jsonb_typeof(discovery_context) = 'object'
  ),
  constraint projects_readiness_state_object check (
    readiness_state is null or jsonb_typeof(readiness_state) = 'object'
  ),
  constraint projects_plan_object check (
    plan is null or jsonb_typeof(plan) = 'object'
  ),
  constraint projects_plan_schema_version_length check (
    plan_schema_version is null or char_length(plan_schema_version) <= 32
  ),
  constraint projects_generation_source_length check (
    generation_source is null or char_length(generation_source) <= 64
  )
);

create table public.discovery_messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null,
  content text not null,
  structured_facts jsonb,
  sequence_number integer not null,
  created_at timestamptz not null default now(),
  constraint discovery_messages_role_allowed check (
    role in ('user', 'assistant', 'system')
  ),
  constraint discovery_messages_content_length check (
    char_length(btrim(content)) between 1 and 20000
  ),
  constraint discovery_messages_sequence_positive check (sequence_number > 0),
  constraint discovery_messages_structured_facts_object check (
    structured_facts is null or jsonb_typeof(structured_facts) = 'object'
  ),
  constraint discovery_messages_project_sequence_unique unique (project_id, sequence_number)
);

create index projects_user_updated_idx
  on public.projects (user_id, updated_at desc);

create index projects_user_status_idx
  on public.projects (user_id, status);

create index discovery_messages_project_created_idx
  on public.discovery_messages (project_id, created_at);

create index discovery_messages_user_idx
  on public.discovery_messages (user_id);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger projects_set_updated_at
before update on public.projects
for each row execute function private.set_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    nullif(btrim(new.raw_user_meta_data ->> 'display_name'), '')
  );
  return new;
end;
$$;

create trigger auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.discovery_messages enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.projects from anon, authenticated;
revoke all on table public.discovery_messages from anon, authenticated;

grant select, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.projects to authenticated;
grant select, insert, update, delete on table public.discovery_messages to authenticated;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "projects_select_own"
on public.projects
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "projects_insert_own"
on public.projects
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "projects_update_own"
on public.projects
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "projects_delete_own"
on public.projects
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "discovery_messages_select_owned_project"
on public.discovery_messages
for select
to authenticated
using (
  user_id = (select auth.uid())
  and project_id in (
    select id
    from public.projects
    where user_id = (select auth.uid())
  )
);

create policy "discovery_messages_insert_owned_project"
on public.discovery_messages
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and project_id in (
    select id
    from public.projects
    where user_id = (select auth.uid())
  )
);

create policy "discovery_messages_update_owned_project"
on public.discovery_messages
for update
to authenticated
using (
  user_id = (select auth.uid())
  and project_id in (
    select id
    from public.projects
    where user_id = (select auth.uid())
  )
)
with check (
  user_id = (select auth.uid())
  and project_id in (
    select id
    from public.projects
    where user_id = (select auth.uid())
  )
);

create policy "discovery_messages_delete_owned_project"
on public.discovery_messages
for delete
to authenticated
using (
  user_id = (select auth.uid())
  and project_id in (
    select id
    from public.projects
    where user_id = (select auth.uid())
  )
);
