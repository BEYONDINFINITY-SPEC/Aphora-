import { supabase } from './supabase';

export interface LogNamingAttemptParams {
  sessionId: string;
  itemShown: string;
  selectedAnswer: string;
  wasCorrect: boolean;
}

export async function logNamingAttempt({
  sessionId,
  itemShown,
  selectedAnswer,
  wasCorrect,
}: LogNamingAttemptParams): Promise<void> {
  const { error } = await supabase.from('naming_attempts').insert({
    session_id: sessionId,
    item_shown: itemShown,
    selected_answer: selectedAnswer,
    was_correct: wasCorrect,
  });

  if (error) {
    throw new Error(`Failed to log naming attempt: ${error.message}`);
  }
}

export interface NamingProgress {
  totalCount: number;
  correctCount: number;
  mostMissed: string[]; // words with the most incorrect attempts, empty if none missed
}

const MOST_MISSED_LIMIT = 3;

export async function getNamingProgress(sessionId: string): Promise<NamingProgress> {
  const { data, error } = await supabase
    .from('naming_attempts')
    .select('item_shown, was_correct')
    .eq('session_id', sessionId);

  if (error) {
    throw new Error(`Failed to load naming progress: ${error.message}`);
  }

  const rows = data ?? [];
  const totalCount = rows.length;
  const correctCount = rows.filter((row) => row.was_correct).length;

  const missCounts = new Map<string, number>();
  for (const row of rows) {
    if (row.was_correct === false && row.item_shown) {
      missCounts.set(row.item_shown, (missCounts.get(row.item_shown) ?? 0) + 1);
    }
  }

  const mostMissed = [...missCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, MOST_MISSED_LIMIT)
    .map(([word]) => word);

  return { totalCount, correctCount, mostMissed };
}
