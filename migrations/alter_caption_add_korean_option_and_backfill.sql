-- Ensure Korean is always present as the base language key in caption payloads.
-- This migration is data-safe and idempotent.

-- 1) caption_state.current_texts backfill
update public.caption_state
set current_texts = coalesce(current_texts, '{}'::jsonb) || jsonb_build_object(
  'korean',
  coalesce(nullif(current_korean, ''), coalesce(current_texts ->> 'korean', ''))
)
where current_texts is null
   or not (current_texts ? 'korean')
   or coalesce(current_texts ->> 'korean', '') = '';

-- 2) caption_messages.lang normalization (if any old null/blank data exists)
update public.caption_messages
set lang = 'korean'
where lang is null or btrim(lang) = '';

-- 3) Ensure caption_messages speaker has a non-null default value
alter table if exists public.caption_messages
  alter column speaker set default '';

update public.caption_messages
set speaker = ''
where speaker is null;

