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

create or replace function public.submit_best_score(input_score integer)
returns table(id uuid, nickname text, best_score integer)
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

  if input_score < 0 then
    raise exception 'invalid_score';
  end if;

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
grant execute on function public.submit_best_score(integer) to authenticated;
