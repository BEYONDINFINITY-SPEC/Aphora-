import { supabase } from './supabase';
import { getRecentLogs } from './logs';
import type { LogErrorTag } from './database.types';

const RECENT_ERROR_HISTORY_LIMIT = 5;

export interface PersonalizationContext {
  aphasiaType: string | null;
  recentErrorTags: LogErrorTag[];
}

// Raw fetch only - deciding whether there's "enough" history to actually use
// in a prompt is buildSystemPrompt's job (lib/claude.ts), so this can be
// tested independently of any threshold logic.
export async function getPersonalizationContext(sessionId: string): Promise<PersonalizationContext> {
  const [sessionResult, recentLogs] = await Promise.all([
    supabase.from('sessions').select('aphasia_type').eq('id', sessionId).single(),
    getRecentLogs(sessionId, RECENT_ERROR_HISTORY_LIMIT),
  ]);

  if (sessionResult.error) {
    throw new Error(`Failed to load session for personalization: ${sessionResult.error.message}`);
  }

  const recentErrorTags = recentLogs
    .map((log) => log.error_tag)
    .filter((tag): tag is LogErrorTag => tag !== null);

  return {
    aphasiaType: sessionResult.data?.aphasia_type ?? null,
    recentErrorTags,
  };
}
