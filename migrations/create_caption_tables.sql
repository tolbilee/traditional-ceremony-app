-- Caption system base schema for Supabase
-- Safe default: writes are allowed only via service_role (server-side API)

create extension if not exists pgcrypto;

create table if not exists public.caption_rooms (
  id uuid primary key default gen_random_uuid(),
  room_code text not null unique,
  title text not null,
  status text not null default 'active' check (status in ('active', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.caption_publishers (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.caption_rooms(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  display_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (room_id, user_id)
);

create table if not exists public.caption_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.caption_rooms(id) on delete cascade,
  seq bigint not null,
  lang text not null check (lang in ('korean', 'english')),
  content text not null,
  created_at timestamptz not null default now(),
  unique (room_id, seq, lang)
);

create table if not exists public.caption_state (
  room_id uuid primary key references public.caption_rooms(id) on delete cascade,
  current_index integer not null default -1,
  current_language text not null default 'korean' check (current_language in ('korean', 'english')),
  current_korean text not null default '',
  current_english text not null default '',
  updated_at timestamptz not null default now()
);

create index if not exists idx_caption_rooms_status_created_at
  on public.caption_rooms (status, created_at desc);

create index if not exists idx_caption_messages_room_seq
  on public.caption_messages (room_id, seq);

create index if not exists idx_caption_messages_room_created_at
  on public.caption_messages (room_id, created_at desc);

create index if not exists idx_caption_publishers_room_active
  on public.caption_publishers (room_id, is_active);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_caption_rooms_set_updated_at on public.caption_rooms;
create trigger trg_caption_rooms_set_updated_at
before update on public.caption_rooms
for each row
execute function public.set_updated_at();

drop trigger if exists trg_caption_state_set_updated_at on public.caption_state;
create trigger trg_caption_state_set_updated_at
before update on public.caption_state
for each row
execute function public.set_updated_at();

alter table public.caption_rooms enable row level security;
alter table public.caption_publishers enable row level security;
alter table public.caption_messages enable row level security;
alter table public.caption_state enable row level security;

-- Read policies: active rooms are publicly readable (for guest viewers)
drop policy if exists "caption_rooms_public_read_active" on public.caption_rooms;
create policy "caption_rooms_public_read_active"
on public.caption_rooms
for select
using (status = 'active');

drop policy if exists "caption_messages_public_read_active_room" on public.caption_messages;
create policy "caption_messages_public_read_active_room"
on public.caption_messages
for select
using (
  exists (
    select 1
    from public.caption_rooms r
    where r.id = caption_messages.room_id
      and r.status = 'active'
  )
);

drop policy if exists "caption_state_public_read_active_room" on public.caption_state;
create policy "caption_state_public_read_active_room"
on public.caption_state
for select
using (
  exists (
    select 1
    from public.caption_rooms r
    where r.id = caption_state.room_id
      and r.status = 'active'
  )
);

drop policy if exists "caption_publishers_service_role_all" on public.caption_publishers;
create policy "caption_publishers_service_role_all"
on public.caption_publishers
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists "caption_rooms_service_role_write" on public.caption_rooms;
create policy "caption_rooms_service_role_write"
on public.caption_rooms
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists "caption_messages_service_role_write" on public.caption_messages;
create policy "caption_messages_service_role_write"
on public.caption_messages
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists "caption_state_service_role_write" on public.caption_state;
create policy "caption_state_service_role_write"
on public.caption_state
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');
