alter table public.projects
  add column custom_project_type text,
  add column last_generation_request_id uuid;

alter table public.projects
  drop constraint projects_type_allowed,
  drop constraint projects_description_length;

alter table public.projects
  add constraint projects_type_allowed check (
    project_type is null or project_type in (
      'web-app',
      'mobile-app',
      'desktop-app',
      'api',
      'developer-tool',
      'ai-agent',
      'browser-extension',
      'internal-tool',
      'marketplace',
      'game',
      'firmware',
      'hardware-connected',
      'custom',
      'ai-product',
      'data-pipeline',
      'other'
    )
  ),
  add constraint projects_custom_type_consistent check (
    (
      project_type = 'custom'
      and custom_project_type is not null
      and char_length(btrim(custom_project_type)) between 1 and 120
    )
    or (
      project_type is distinct from 'custom'
      and custom_project_type is null
    )
  ),
  add constraint projects_description_length check (
    description is null or char_length(description) <= 20000
  );

alter table public.profiles
  add column avatar_url text,
  add column timezone text,
  add column location text;

alter table public.profiles
  add constraint profiles_avatar_url_length check (
    avatar_url is null or char_length(avatar_url) <= 2000
  ),
  add constraint profiles_timezone_length check (
    timezone is null or char_length(timezone) between 1 and 100
  ),
  add constraint profiles_location_length check (
    location is null or char_length(location) between 1 and 120
  );
