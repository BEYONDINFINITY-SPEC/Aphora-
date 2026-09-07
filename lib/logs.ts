import { supabase } from './supabase';
import type { LogErrorTag } from './database.types';

export interface LogReconstructionParams {
  originalInput: string;
  reconstructedSentence: string;
  errorTag: LogErrorTag;
  scenario: string;
  relationship: string;
  sessionId?: string | null;
}

// There's no session-creation/auth flow yet, so sessionId is left null by
// default - logs.session_id is nullable in the schema for exactly this
// reason. Once sessions are created per-user/per-visit, pass the real id in.
export async function logReconstruction({
  originalInput,
  reconstructedSentence,
  errorTag,
  scenario,
  relationship,
  sessionId = null,
}: LogReconstructionParams): Promise<void> {
  const { error } = await supabase.from('logs').insert({
    session_id: sessionId,
    original_input: originalInput,
    reconstructed_sentence: reconstructedSentence,
    error_tag: errorTag,
    scenario,
    relationship,
  });

  if (error) {
    throw new Error(`Failed to log reconstruction: ${error.message}`);
  }
}

export interface RecentLog {
  id: string;
  reconstructed_sentence: string | null;
  error_tag: LogErrorTag | null;
  timestamp: string;
}

export async function getRecentLogs(sessionId: string, limit = 10): Promise<RecentLog[]> {
  const { data, error } = await supabase
    .from('logs')
    .select('id, reconstructed_sentence, error_tag, timestamp')
    .eq('session_id', sessionId)
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to load recent logs: ${error.message}`);
  }

  return data ?? [];
}
