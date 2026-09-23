create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  best_score integer not null default 0 check (best_score >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_nickname_lower_idx
  on public.profiles (lower(nickname));

alter table public.profiles enable row level security;

revoke all on public.profiles from anon, authenticated;
grant select (id, nickname, best_score, updated_at) on public.profiles to anon, authenticated;

create table if not exists public.score_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  seed integer not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  duration_ms integer,
  claimed_score integer,
  input_log jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('active', 'accepted', 'rejected')),
  reject_reason text
);

create index if not exists score_runs_user_started_idx
  on public.score_runs (user_id, started_at desc);

create unique index if not exists score_runs_one_active_per_user_idx
  on public.score_runs (user_id)
  where status = 'active';

alter table public.score_runs enable row level security;

revoke all on public.score_runs from anon, authenticated;
grant select (id, user_id, seed, started_at, finished_at, duration_ms, claimed_score, status, reject_reason)
  on public.score_runs to authenticated;

drop policy if exists "Players can read own score runs" on public.score_runs;
create policy "Players can read own score runs"
  on public.score_runs
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Public leaderboard read" on public.profiles;
create policy "Public leaderboard read"
  on public.profiles
  for select
  to anon, authenticated
  using (true);

create or replace function public.create_profile(input_nickname text)
returns table(id uuid, nickname text, best_score integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  clean_nickname text := trim(regexp_replace(input_nickname, '\s+', '_', 'g'));
begin
  if current_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if length(clean_nickname) < 3 or length(clean_nickname) > 16 then
    raise exception 'invalid_nickname_length';
  end if;

  if clean_nickname !~ '^[a-zA-Zа-яА-ЯёЁ0-9_-]+$' then
    raise exception 'invalid_nickname_symbols';
  end if;

  insert into public.profiles (id, nickname)
  values (current_user_id, clean_nickname);

  return query
    select profiles.id, profiles.nickname, profiles.best_score
    from public.profiles
    where profiles.id = current_user_id;
exception
  when unique_violation then
    raise exception 'nickname_taken';
end;
$$;

drop function if exists public.rt_init();
create or replace function public.rt_init()
returns table(run_id uuid, seed integer, started_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'not_authenticated';
  end if;

  update public.score_runs
  set
    status = 'rejected',
    reject_reason = case
      when score_runs.started_at < now() - interval '30 minutes' then 'stale_run'
      else 'abandoned_run'
    end,
    finished_at = now()
  where score_runs.user_id = current_user_id
    and score_runs.status = 'active';

  insert into public.score_runs (user_id, seed)
  values (current_user_id, floor(random() * 2147483647)::integer)
  returning score_runs.id, score_runs.seed, score_runs.started_at
  into run_id, seed, started_at;

  return next;
exception
  when unique_violation then
    raise exception 'active_run_exists';
end;
$$;

drop function if exists public.rt_sync(integer, uuid, integer, jsonb);
create or replace function public.rt_sync(
  input_score integer,
  input_run_id uuid,
  input_duration_ms integer,
  input_events jsonb default '[]'::jsonb
)
returns table(id uuid, nickname text, best_score integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  run_record public.score_runs%rowtype;
  duration_seconds numeric;
  max_reasonable_score integer;
begin
  if current_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if input_score < 0 then
    raise exception 'invalid_score';
  end if;

  if input_run_id is null then
    raise exception 'run_not_found';
  end if;

  select *
  into run_record
  from public.score_runs
  where score_runs.id = input_run_id
  for update;

  if not found then
    raise exception 'run_not_found';
  end if;

  if run_record.user_id <> current_user_id then
    raise exception 'invalid_run_owner';
  end if;

  if run_record.status <> 'active' then
    raise exception 'run_not_found';
  end if;

  if run_record.started_at < now() - interval '30 minutes' then
    update public.score_runs
    set
      status = 'rejected',
      reject_reason = 'stale_run',
      finished_at = now(),
      claimed_score = input_score,
      duration_ms = input_duration_ms,
      input_log = coalesce(input_events, '[]'::jsonb)
    where score_runs.id = input_run_id;

    raise exception 'stale_run';
  end if;

  if input_duration_ms is null or input_duration_ms < 500 or input_duration_ms > 1800000 then
    update public.score_runs
    set
      status = 'rejected',
      reject_reason = 'invalid_run_duration',
      finished_at = now(),
      claimed_score = input_score,
      duration_ms = input_duration_ms,
      input_log = coalesce(input_events, '[]'::jsonb)
    where score_runs.id = input_run_id;

    raise exception 'invalid_run_duration';
  end if;

  if jsonb_typeof(coalesce(input_events, '[]'::jsonb)) <> 'array'
     or jsonb_array_length(coalesce(input_events, '[]'::jsonb)) > 2500 then
    update public.score_runs
    set
      status = 'rejected',
      reject_reason = 'invalid_input_log',
      finished_at = now(),
      claimed_score = input_score,
      duration_ms = input_duration_ms,
      input_log = '[]'::jsonb
    where score_runs.id = input_run_id;

    raise exception 'invalid_input_log';
  end if;

  duration_seconds := input_duration_ms::numeric / 1000;
  max_reasonable_score := ceil(420 + duration_seconds * 80)::integer;

  if input_score > max_reasonable_score then
    update public.score_runs
    set
      status = 'rejected',
      reject_reason = 'score_too_high',
      finished_at = now(),
      claimed_score = input_score,
      duration_ms = input_duration_ms,
      input_log = coalesce(input_events, '[]'::jsonb)
    where score_runs.id = input_run_id;

    raise exception 'score_too_high';
  end if;

  update public.score_runs
  set
    status = 'accepted',
    finished_at = now(),
    claimed_score = input_score,
    duration_ms = input_duration_ms,
    input_log = coalesce(input_events, '[]'::jsonb)
  where score_runs.id = input_run_id;

  update public.profiles
  set
    best_score = greatest(profiles.best_score, input_score),
    updated_at = case
      when input_score > profiles.best_score then now()
      else profiles.updated_at
    end
  where profiles.id = current_user_id;

  if not found then
    raise exception 'profile_not_found';
  end if;

  return query
    select profiles.id, profiles.nickname, profiles.best_score
    from public.profiles
    where profiles.id = current_user_id;
end;
$$;

grant execute on function public.create_profile(text) to authenticated;
grant execute on function public.rt_init() to authenticated;
grant execute on function public.rt_sync(integer, uuid, integer, jsonb) to authenticated;
drop function if exists public.start_score_run();
drop function if exists public.submit_best_score(integer, uuid, integer, jsonb);
drop function if exists public."rt-sync"(integer, uuid, integer, jsonb);
