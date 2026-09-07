import type { LogErrorTag } from '../lib/database.types';
import { colors } from './theme';

export const ERROR_TAGS: LogErrorTag[] = [
  'word_finding',
  'wrong_word',
  'missing_verb',
  'word_order',
  'fragment',
  'correct',
];

export const ERROR_TAG_LABELS: Record<LogErrorTag, string> = {
  word_finding: 'Word finding',
  wrong_word: 'Wrong word',
  missing_verb: 'Missing verb',
  word_order: 'Word order',
  fragment: 'Fragment',
  correct: 'Correct',
};

// "correct" reads as a success state (sage); every actual error category
// reads as needing attention (dusty rose) - shared so reconstruction results
// and the caregiver's recent-sentences list use identical tag coloring.
export const ERROR_TAG_COLORS: Record<LogErrorTag, { bg: string; text: string }> = {
  correct: { bg: colors.sage, text: colors.sageText },
  word_finding: { bg: colors.dustyRose, text: colors.dustyRoseText },
  wrong_word: { bg: colors.dustyRose, text: colors.dustyRoseText },
  missing_verb: { bg: colors.dustyRose, text: colors.dustyRoseText },
  word_order: { bg: colors.dustyRose, text: colors.dustyRoseText },
  fragment: { bg: colors.dustyRose, text: colors.dustyRoseText },
};
