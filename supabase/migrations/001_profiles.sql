-- FounderVoice profiles (run in Supabase SQL editor)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('founder', 'investor')),
  display_name text not null default '',
  org_name text not null default '',
  email text not null default '',
  terms_accepted boolean not null default false,
  auth_provider text not null default 'email',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, auth_provider, role, display_name, org_name, terms_accepted)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_app_meta_data->>'provider', 'email'),
    coalesce(new.raw_user_meta_data->>'role', 'founder'),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(coalesce(new.email, 'user'), '@', 1)),
    coalesce(new.raw_user_meta_data->>'org_name', ''),
    coalesce((new.raw_user_meta_data->>'terms_accepted')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
