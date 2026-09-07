export const APHASIA_TYPES = ["Broca's", "Wernicke's", 'Anomic', 'Not sure'] as const;

export type AphasiaType = (typeof APHASIA_TYPES)[number];
