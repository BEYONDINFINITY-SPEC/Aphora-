-- Adds the scenario/topic selected in the UI (e.g. "Doctor visit", "General")
-- to each log row, so it's stored alongside the reconstruction result.
--
-- Kept as plain text rather than a check constraint: the app's UI already
-- constrains the value to the fixed set in constants/scenarios.ts, so this
-- doesn't duplicate that validation - a check constraint here would just be
-- one more place to update if the scenario list changes.
--
-- Review this file, then run it manually via the Supabase SQL editor
-- (or `supabase db push`).

alter table logs add column if not exists scenario text default 'General';
