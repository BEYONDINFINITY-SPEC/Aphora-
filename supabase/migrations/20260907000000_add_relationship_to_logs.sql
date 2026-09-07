-- Adds the relationship/tone context selected in the UI (e.g. "Doctor",
-- "Friend") to each log row, alongside the existing scenario column.
--
-- Same reasoning as scenario: plain text, no check constraint - the app's
-- UI already constrains the value to the fixed set in
-- constants/relationships.ts, so a DB-level constraint would just be a
-- second place to update if that list changes.
--
-- Review this file, then run it manually via the Supabase SQL editor
-- (or `supabase db push`).

alter table logs add column if not exists relationship text default 'Family';
