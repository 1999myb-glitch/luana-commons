-- Run this once in your Supabase project's SQL editor to enable
-- shared (cross-device) progress syncing for Futari Quest.

create table if not exists public.futari_quest_progress (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.futari_quest_progress enable row level security;

create policy "futari_quest_progress_select" on public.futari_quest_progress
  for select using (true);

create policy "futari_quest_progress_insert" on public.futari_quest_progress
  for insert with check (true);

create policy "futari_quest_progress_update" on public.futari_quest_progress
  for update using (true);

alter publication supabase_realtime add table public.futari_quest_progress;

insert into public.futari_quest_progress (id, data)
values ('shared', '{}'::jsonb)
on conflict (id) do nothing;
