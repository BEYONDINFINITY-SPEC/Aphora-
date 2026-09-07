export const RELATIONSHIPS = ['Family', 'Doctor', 'Friend', 'Stranger'] as const;

export type Relationship = (typeof RELATIONSHIPS)[number];

export const DEFAULT_RELATIONSHIP: Relationship = 'Family';
