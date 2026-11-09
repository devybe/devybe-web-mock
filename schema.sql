-- DeVybe web mock (already applied to project devybe-web-mock). Kept for reference / re-creating.
create extension if not exists pgcrypto;

create table if not exists mock_participants (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  nickname text not null,
  age_range text,
  consent boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists mock_participants_email_idx on mock_participants(lower(email));

create table if not exists mock_place_vibes (
  participant_id uuid not null references mock_participants(id) on delete cascade,
  place_id text not null,
  place_name text not null,
  place_category text,
  place_lat double precision,
  place_lng double precision,
  place_mood text,
  vibes text[] not null default '{}',
  note text,
  updated_at timestamptz not null default now(),
  primary key (participant_id, place_id),
  constraint mock_place_vibes_max3 check (cardinality(vibes) between 1 and 3)
);

create table if not exists mock_events (
  id bigint generated always as identity primary key,
  participant_id uuid references mock_participants(id) on delete cascade,
  type text not null,
  place_id text,
  created_at timestamptz not null default now()
);

alter table mock_participants enable row level security;
alter table mock_place_vibes enable row level security;
alter table mock_events enable row level security;

create or replace function mock_register(p_email text, p_nickname text, p_age text, p_consent boolean)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if p_email is null or p_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'invalid email'; end if;
  if not coalesce(p_consent, false) then raise exception 'consent required'; end if;
  insert into mock_participants(email, nickname, age_range, consent)
  values (lower(trim(p_email)), left(trim(p_nickname), 40), p_age, true)
  returning id into v_id;
  return v_id;
end $$;

create or replace function mock_save_vibe(p_pid uuid, p_place text, p_name text, p_category text, p_lat double precision, p_lng double precision, p_vibes text[], p_note text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_vibes is null or cardinality(p_vibes) < 1 or cardinality(p_vibes) > 3 then raise exception 'pick 1 to 3 vibes'; end if;
  if exists (select 1 from unnest(p_vibes) v where v not in ('chill','creative','foodie','active','social','romantic')) then raise exception 'unknown vibe'; end if;
  insert into mock_place_vibes(participant_id, place_id, place_name, place_category, place_lat, place_lng, vibes, note, updated_at)
  values (p_pid, left(p_place, 80), left(p_name, 160), left(p_category, 40), p_lat, p_lng, p_vibes, left(p_note, 280), now())
  on conflict (participant_id, place_id) do update
    set vibes = excluded.vibes, note = excluded.note, updated_at = now();
end $$;

create or replace function mock_log(p_pid uuid, p_type text, p_place text)
returns void language plpgsql security definer set search_path = public as $$
begin insert into mock_events(participant_id, type, place_id) values (p_pid, p_type, p_place); end $$;

create or replace function mock_my_vibes(p_pid uuid)
returns table(place_id text, vibes text[], note text) language sql security definer set search_path = public as $$
  select place_id, vibes, note from mock_place_vibes where participant_id = p_pid;
$$;

revoke all on function mock_register(text,text,text,boolean), mock_save_vibe(uuid,text,text,text,double precision,double precision,text[],text), mock_log(uuid,text,text), mock_my_vibes(uuid) from public;
grant execute on function mock_register(text,text,text,boolean), mock_save_vibe(uuid,text,text,text,double precision,double precision,text[],text), mock_log(uuid,text,text), mock_my_vibes(uuid) to anon;
