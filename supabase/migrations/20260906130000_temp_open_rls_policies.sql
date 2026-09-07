-- TEMPORARY: fully permissive RLS policies for sessions and logs.
--
-- There's no user auth in this build yet, so there's no auth.uid() to scope
-- access to. This migration makes both tables fully readable/writable by
-- anyone holding the anon key (which ships inside the compiled app) -
-- acceptable for a hackathon demo with no real user data, but replace this
-- with real per-user policies (e.g. sessions.user_id = auth.uid(), and a
-- matching check on logs via its session_id) before this app handles real
-- user data.
--
-- Review this file, then run it manually via the Supabase SQL editor
-- (or `supabase db push`).

alter table sessions enable row level security;
alter table logs enable row level security;

drop policy if exists "Allow all access (temporary - no auth yet)" on sessions;
create policy "Allow all access (temporary - no auth yet)"
  on sessions
  for all
  to public
  using (true)
  with check (true);

drop policy if exists "Allow all access (temporary - no auth yet)" on logs;
create policy "Allow all access (temporary - no auth yet)"
  on logs
  for all
  to public
  using (true)
  with check (true);
