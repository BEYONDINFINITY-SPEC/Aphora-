-- Aphasia AI: sessions + logs schema
-- Review this file, then run it manually via the Supabase SQL editor
-- (or `supabase db push` once you're using the CLI against this project).

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  aphasia_type text,
  language text,
  created_at timestamptz default now()
);

create table if not exists logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions (id),
  "timestamp" timestamptz default now(),
  error_tag text check (
    error_tag in (
      'word_finding',
      'wrong_word',
      'missing_verb',
      'word_order',
      'fragment',
      'correct'
    )
  ),
  reconstructed_sentence text,
  original_input text
);

-- Foreign key columns aren't indexed automatically in Postgres; logs will
-- always be queried/filtered by session, so this index is worth having.
create index if not exists idx_logs_session_id on logs (session_id);

-- RLS is enabled with no policies yet. That makes both tables fail-closed:
-- nothing is readable or writable via the anon key (the key your Expo app
-- ships with) until you add policies matching your auth model. Leaving RLS
-- off instead would mean anyone holding the anon key - extractable from the
-- compiled app - could read or write every user's session and log data.
-- Add policies (e.g. "user can select/insert where sessions.user_id =
-- auth.uid()") once auth is wired up.
alter table sessions enable row level security;
alter table logs enable row level security;
