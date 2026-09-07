import { supabase } from './supabase';
import type { LogErrorTag } from './database.types';
import { ERROR_TAGS } from '../constants/errorTags';

export interface SessionProgress {
  counts: Record<LogErrorTag, number>;
  totalAttempts: number;
  mostCommonTag: LogErrorTag | null;
}

export async function getSessionProgress(sessionId: string): Promise<SessionProgress> {
  const { data, error } = await supabase
    .from('logs')
    .select('error_tag')
    .eq('session_id', sessionId);

  if (error) {
    throw new Error(`Failed to load progress: ${error.message}`);
  }

  const rows = data ?? [];
  const counts = Object.fromEntries(ERROR_TAGS.map((tag) => [tag, 0])) as Record<
    LogErrorTag,
    number
  >;

  for (const row of rows) {
    if (row.error_tag && row.error_tag in counts) {
      counts[row.error_tag] += 1;
    }
  }

  let mostCommonTag: LogErrorTag | null = null;
  let maxCount = 0;
  for (const tag of ERROR_TAGS) {
    if (counts[tag] > maxCount) {
      maxCount = counts[tag];
      mostCommonTag = tag;
    }
  }

  return { counts, totalAttempts: rows.length, mostCommonTag };
}
