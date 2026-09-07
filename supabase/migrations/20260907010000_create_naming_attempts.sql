-- Picture-naming exercise: logs each tap (correct or not) against a
-- hardcoded local item set (constants/namingItems.ts) - no Gemini/API
-- involvement at all.
--
-- Review this file, then run it manually via the Supabase SQL editor
-- (or `supabase db push`).

create table if not exists naming_attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions (id),
  item_shown text,
  selected_answer text,
  was_correct boolean,
  timestamp timestamptz default now()
);

create index if not exists idx_naming_attempts_session_id on naming_attempts (session_id);

-- Same temporary no-auth stance as sessions/logs: RLS on, with a fully
-- permissive policy since there's no auth.uid() to scope to yet. Replace
-- with real per-user policies before this handles real user data.
alter table naming_attempts enable row level security;

drop policy if exists "Allow all access (temporary - no auth yet)" on naming_attempts;
create policy "Allow all access (temporary - no auth yet)"
  on naming_attempts
  for all
  to public
  using (true)
  with check (true);
