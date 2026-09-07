export const LANGUAGES = ['English', 'Hindi'] as const;

export type Language = (typeof LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = 'English';
