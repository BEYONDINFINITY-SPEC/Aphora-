export const SCENARIOS = ['Doctor visit', 'Family', 'Food', 'Emergency', 'General'] as const;

export type Scenario = (typeof SCENARIOS)[number];

export const DEFAULT_SCENARIO: Scenario = 'General';
