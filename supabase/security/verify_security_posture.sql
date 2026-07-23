-- Mycellium Studio production security posture audit
-- Read-only: this script contains SELECT statements only.

-- 1. Public tables, owners, RLS, FORCE RLS, and policy counts.
select
  n.nspname as schema_name,
  c.relname as table_name,
  pg_get_userbyid(c.relowner) as table_owner,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced,
  count(p.policyname) as policy_count
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_policies p
  on p.schemaname = n.nspname
 and p.tablename = c.relname
where n.nspname = 'public'
  and c.relkind in ('r', 'p')
group by n.nspname, c.relname, c.relowner, c.relrowsecurity, c.relforcerowsecurity
order by c.relname;

-- 2. Grants to API and PUBLIC roles.
select
  table_schema,
  table_name,
  grantee,
  privilege_type,
  is_grantable
from information_schema.table_privileges
where table_schema = 'public'
  and grantee in ('anon', 'authenticated', 'PUBLIC')
order by table_name, grantee, privilege_type;

-- 3. Column-level grants used for least-privilege inserts and updates.
select
  table_schema,
  table_name,
  column_name,
  grantee,
  privilege_type
from information_schema.column_privileges
where table_schema = 'public'
  and grantee in ('anon', 'authenticated', 'PUBLIC')
order by table_name, grantee, privilege_type, column_name;

-- 4. RLS policies and their exact predicates.
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_expression,
  with_check as with_check_expression
from pg_policies
where schemaname in ('public', 'storage')
order by schemaname, tablename, policyname;

-- 5. Tables with RLS disabled or enabled without a policy.
select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  count(p.policyname) as policy_count
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_policies p
  on p.schemaname = n.nspname
 and p.tablename = c.relname
where n.nspname = 'public'
  and c.relkind in ('r', 'p')
group by n.nspname, c.relname, c.relrowsecurity
having not c.relrowsecurity or count(p.policyname) = 0
order by c.relname;

-- 6. Application tables with anonymous or PUBLIC write grants.
select
  table_schema,
  table_name,
  grantee,
  privilege_type
from information_schema.table_privileges
where table_schema = 'public'
  and grantee in ('anon', 'PUBLIC')
  and privilege_type in ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER')
order by table_name, grantee, privilege_type;

-- 7. Functions, owners, SECURITY DEFINER, search_path, and API execute grants.
select
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  pg_get_userbyid(p.proowner) as function_owner,
  p.prosecdef as security_definer,
  coalesce(array_to_string(p.proconfig, ', '), '') as function_configuration,
  has_function_privilege('anon', p.oid, 'EXECUTE') as anon_can_execute,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_can_execute,
  exists (
    select 1
    from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) acl
    where acl.grantee = 0
      and acl.privilege_type = 'EXECUTE'
  ) as public_can_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname in ('public', 'private')
order by n.nspname, p.proname, arguments;

-- 8. Views and materialized views, including owner and relation options.
select
  n.nspname as schema_name,
  c.relname as relation_name,
  case c.relkind when 'v' then 'view' when 'm' then 'materialized view' end as relation_type,
  pg_get_userbyid(c.relowner) as relation_owner,
  c.reloptions
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname in ('public', 'storage')
  and c.relkind in ('v', 'm')
order by n.nspname, c.relname;

-- 9. Schema visibility for API roles. Dashboard API settings still determine
-- which schemas PostgREST exposes.
select
  nspname as schema_name,
  has_schema_privilege('anon', oid, 'USAGE') as anon_usage,
  has_schema_privilege('anon', oid, 'CREATE') as anon_create,
  has_schema_privilege('authenticated', oid, 'USAGE') as authenticated_usage,
  has_schema_privilege('authenticated', oid, 'CREATE') as authenticated_create,
  exists (
    select 1
    from aclexplode(coalesce(n.nspacl, acldefault('n', n.nspowner))) acl
    where acl.grantee = 0
      and acl.privilege_type = 'USAGE'
  ) as public_usage,
  exists (
    select 1
    from aclexplode(coalesce(n.nspacl, acldefault('n', n.nspowner))) acl
    where acl.grantee = 0
      and acl.privilege_type = 'CREATE'
  ) as public_create
from pg_namespace n
where nspname in ('public', 'private', 'storage')
order by nspname;

-- 10. Ownership-integrity constraints and whether existing rows are validated.
select
  n.nspname as schema_name,
  c.relname as table_name,
  con.conname as constraint_name,
  con.contype as constraint_type,
  con.convalidated as validated,
  pg_get_constraintdef(con.oid) as definition
from pg_constraint con
join pg_class c on c.oid = con.conrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'profiles',
    'projects',
    'discovery_messages',
    'discovery_requests',
    'workflow_requests'
  )
order by c.relname, con.conname;

-- 11. Storage buckets. An empty result means no application bucket exists.
select
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
from storage.buckets
order by id;

-- 12. Storage RLS state.
select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'storage'
  and c.relkind in ('r', 'p')
order by c.relname;
