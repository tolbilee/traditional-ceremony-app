-- Upgrade caption schema for multi-language + speaker-based queue publishing

-- 1) caption_state enhancements
alter table if exists public.caption_state
  add column if not exists current_speaker text not null default '';

alter table if exists public.caption_state
  add column if not exists current_texts jsonb not null default '{}'::jsonb;

-- remove old strict language check so any selected language key can be used
do $$
declare
  constraint_name text;
begin
  select conname
    into constraint_name
  from pg_constraint
  where conrelid = 'public.caption_state'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) like '%current_language%';

  if constraint_name is not null then
    execute format('alter table public.caption_state drop constraint %I', constraint_name);
  end if;
end $$;

-- 2) caption_messages enhancements
alter table if exists public.caption_messages
  add column if not exists speaker text not null default '';

-- remove old strict lang check (korean/english only)
do $$
declare
  constraint_name text;
begin
  select conname
    into constraint_name
  from pg_constraint
  where conrelid = 'public.caption_messages'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) like '%lang%';

  if constraint_name is not null then
    execute format('alter table public.caption_messages drop constraint %I', constraint_name);
  end if;
end $$;

