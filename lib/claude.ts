import type { Scenario } from '../constants/scenarios';
import type { Relationship } from '../constants/relationships';

// Slot index (array position) maps directly to the "_1".."_4" suffix, so
// logging `index + 1` always matches the env var name - undefined slots
// (not yet configured) are skipped rather than attempted.
const GEMINI_API_KEYS: Array<string | undefined> = [
  process.env.EXPO_PUBLIC_GEMINI_API_KEY_1,
  process.env.EXPO_PUBLIC_GEMINI_API_KEY_2,
  process.env.EXPO_PUBLIC_GEMINI_API_KEY_3,
  process.env.EXPO_PUBLIC_GEMINI_API_KEY_4,
];

// Keys that have returned a quota error this app session - skipped on
// subsequent requests instead of being retried every time. In-memory only
// (module-level state), so it naturally resets on app restart - never
// persisted to disk.
const knownBadKeyIndices = new Set<number>();

const GEMINI_MODEL = 'gemini-3.6-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// NOTE: this calls the Gemini API directly from the client, which bundles
// these keys into the app and makes them extractable. Fine for hackathon/dev
// use; before shipping, proxy this through a backend (e.g. a Supabase Edge
// Function) that holds the keys server-side instead.

interface GeminiCandidate {
  content?: {
    parts?: Array<{ text?: string }>;
    role?: string;
  };
  finishReason?: string;
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
  promptFeedback?: {
    blockReason?: string;
  };
}

// Lets the UI show a short, specific message without string-matching raw
// error text itself - classification happens here, where the actual HTTP
// status / network failure is known.
export type ReconstructionErrorKind = 'quota' | 'network' | 'other';

export class ReconstructionError extends Error {
  kind: ReconstructionErrorKind;

  constructor(kind: ReconstructionErrorKind, message: string) {
    super(message);
    this.name = 'ReconstructionError';
    this.kind = kind;
  }
}

// TEMPORARY TEST HOOK: 1-based key numbers (matching the "_1".."_4" env var
// suffixes) to simulate as already quota-exhausted, without making a real
// request for them - lets the multi-key fallback be verified without
// burning through real quota on multiple keys. Empty in normal use.
const SIMULATE_QUOTA_ERROR_FOR_KEYS = new Set<number>();

async function callGeminiWithKey(
  body: Record<string, unknown>,
  apiKey: string,
  keyNumber: number
): Promise<string> {
  if (SIMULATE_QUOTA_ERROR_FOR_KEYS.has(keyNumber)) {
    throw new ReconstructionError(
      'quota',
      `Simulated 429 for key ${keyNumber}: RESOURCE_EXHAUSTED (quota exceeded)`
    );
  }

  const startedAt = Date.now();
  console.log(`[Gemini] request started at ${new Date(startedAt).toISOString()} using key ${keyNumber}`);

  let response: Response;
  try {
    response = await fetch(`${GEMINI_API_URL}?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    const elapsedMs = Date.now() - startedAt;
    console.log(`[Gemini] key ${keyNumber} request FAILED after ${elapsedMs}ms (network error)`);
    // fetch() itself threw - no HTTP response was ever received, so this is
    // a connectivity failure, not an API error. Not a key problem, so this
    // should not trigger key fallback.
    const message = err instanceof Error ? err.message : String(err);
    throw new ReconstructionError('network', `Network request failed: ${message}`);
  }

  const elapsedMs = Date.now() - startedAt;
  console.log(`[Gemini] key ${keyNumber} response received after ${elapsedMs}ms (status ${response.status})`);

  if (!response.ok) {
    const errorBody = await response.text();
    const isQuotaError = response.status === 429 || /quota/i.test(errorBody);
    throw new ReconstructionError(
      isQuotaError ? 'quota' : 'other',
      `Gemini API error ${response.status}: ${errorBody}`
    );
  }

  const data: GeminiResponse = await response.json();

  if (data.promptFeedback?.blockReason) {
    throw new ReconstructionError(
      'other',
      `Gemini blocked this request: ${data.promptFeedback.blockReason}`
    );
  }

  const candidate = data.candidates?.[0];
  if (!candidate) {
    throw new ReconstructionError('other', 'Gemini returned no candidates.');
  }
  if (candidate.finishReason === 'MAX_TOKENS') {
    throw new ReconstructionError('other', 'Gemini response was cut off (hit max output tokens).');
  }
  if (candidate.finishReason === 'SAFETY' || candidate.finishReason === 'RECITATION') {
    throw new ReconstructionError('other', `Gemini declined to respond (${candidate.finishReason}).`);
  }

  return candidate.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
}

// Tries each configured, not-yet-known-bad key in order (1 to 4). A quota
// error marks that key bad for the rest of this app session and moves on to
// the next one; any other error (network, blocked content, etc.) is not a
// key problem and is rethrown immediately without trying more keys.
async function callGemini(body: Record<string, unknown>): Promise<string> {
  const candidateKeys = GEMINI_API_KEYS.map((key, arrayIndex) => ({ key, keyNumber: arrayIndex + 1 })).filter(
    (entry): entry is { key: string; keyNumber: number } =>
      Boolean(entry.key) && !knownBadKeyIndices.has(entry.keyNumber)
  );

  if (candidateKeys.length === 0) {
    throw new ReconstructionError(
      'quota',
      'No Gemini API keys are configured or all configured keys are exhausted for this session.'
    );
  }

  let lastQuotaError: ReconstructionError | null = null;

  for (const { key, keyNumber } of candidateKeys) {
    try {
      return await callGeminiWithKey(body, key, keyNumber);
    } catch (err) {
      if (err instanceof ReconstructionError && err.kind === 'quota') {
        console.log(`[Gemini] key ${keyNumber} hit quota - marking bad for this session, trying next key`);
        knownBadKeyIndices.add(keyNumber);
        lastQuotaError = err;
        continue;
      }
      throw err;
    }
  }

  // Every available key was tried and all hit quota.
  throw (
    lastQuotaError ??
    new ReconstructionError('quota', 'All configured Gemini API keys are exhausted.')
  );
}

// --- Sentence reconstruction ---
//
// Takes a fragmented or error-prone sentence typed by someone with aphasia
// and returns Gemini's best guess at the intended sentence, tagged with a
// single error category. error_tag's values match the `error_tag` check
// constraint in supabase/migrations/20260906120000_create_sessions_and_logs.sql
// so results here can be logged to the `logs` table without translation.

export type ErrorTag =
  | 'word_finding'
  | 'wrong_word'
  | 'missing_verb'
  | 'word_order'
  | 'fragment'
  | 'correct';

export interface ReconstructionOption {
  sentence: string;
  error_tag: ErrorTag;
  confidence: 'high' | 'medium' | 'low';
}

export interface ReconstructionResult {
  reconstructions: ReconstructionOption[];
}

// Only mentioned when we actually know the type (not "Not sure") - the
// guidance is meaningless without it.
const APHASIA_TYPE_GUIDANCE: Record<string, string> = {
  "Broca's": 'expect agrammatic/telegraphic speech with missing function words',
  "Wernicke's": 'expect fluent but potentially empty/circumlocutory speech',
  Anomic: 'expect frequent word-finding pauses',
};

// Below this, a handful of tags isn't a meaningful "pattern" yet - mentioning
// it would just be noise.
const MIN_RECENT_ERRORS_FOR_CONTEXT = 2;

function buildPersonalizationContext(
  aphasiaType: string | null,
  recentErrorTags: ErrorTag[]
): string {
  const sentences: string[] = [];

  const knownAphasiaType = aphasiaType && aphasiaType !== 'Not sure' ? aphasiaType : null;
  if (knownAphasiaType) {
    const guidance = APHASIA_TYPE_GUIDANCE[knownAphasiaType];
    sentences.push(
      `This user has ${knownAphasiaType}-type aphasia${guidance ? ` - ${guidance}` : ''}.`
    );
  }

  if (recentErrorTags.length >= MIN_RECENT_ERRORS_FOR_CONTEXT) {
    sentences.push(`Their recent common errors: ${recentErrorTags.join(', ')}.`);
    sentences.push('Pay extra attention to patterns matching their recent error history.');
  }

  return sentences.length > 0 ? ` ${sentences.join(' ')}` : '';
}

export function buildSystemPrompt(
  scenario: Scenario,
  relationship: Relationship,
  aphasiaType: string | null = null,
  recentErrorTags: ErrorTag[] = []
): string {
  const personalization = buildPersonalizationContext(aphasiaType, recentErrorTags);

  return `You are helping reconstruct sentences from a person with aphasia. The conversation context is: ${scenario}. The person they are speaking to is: ${relationship}.${personalization} Given their attempted sentence, use the context to resolve ambiguous or substituted words (e.g. in a 'Doctor visit' context, 'pen' might be an aphasic substitution for 'medicine' or 'pain'), and adjust the formality of each reconstructed sentence to match who they're speaking to (e.g. more formal, polite phrasing for "Doctor" or "Stranger"; casual, relaxed phrasing for "Friend" or "Family").

Return ONLY valid JSON with this shape:
{
  "reconstructions": [
    {"sentence": string, "error_tag": "word_finding" | "wrong_word" | "missing_verb" | "word_order" | "fragment" | "correct", "confidence": "high" | "medium" | "low"}
  ]
}

Default to returning exactly 1 reconstruction - your single best guess - whenever there is one clear, natural interpretation. Pick your best option and go with it even if minor grammatical details (like verb tense) could technically go either way; that is not ambiguity. Only return 2 or 3 distinct alternatives, ordered most likely first, when the input is ambiguous in MEANING - i.e. it could plausibly resolve to fundamentally different words or intents (e.g. 'pen' could mean medicine, a literal pen, or something else entirely). Generating extra alternatives for minor phrasing variations wastes time, so do not do it. Never list duplicate or near-identical sentences as separate options.

No preamble, no markdown, just the JSON object.`;
}

const RECONSTRUCTION_SCHEMA = {
  type: 'OBJECT',
  properties: {
    reconstructions: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          sentence: { type: 'STRING' },
          error_tag: {
            type: 'STRING',
            enum: ['word_finding', 'wrong_word', 'missing_verb', 'word_order', 'fragment', 'correct'],
          },
          confidence: { type: 'STRING', enum: ['high', 'medium', 'low'] },
        },
        required: ['sentence', 'error_tag', 'confidence'],
      },
    },
  },
  required: ['reconstructions'],
} as const;

export async function reconstructSentence(
  input: string,
  scenario: Scenario = 'General',
  relationship: Relationship = 'Family',
  aphasiaType: string | null = null,
  recentErrorTags: ErrorTag[] = []
): Promise<ReconstructionResult> {
  const systemPrompt = buildSystemPrompt(scenario, relationship, aphasiaType, recentErrorTags);
  console.log('[Gemini] system prompt:\n' + systemPrompt);

  const text = await callGemini({
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: input }],
      },
    ],
    generationConfig: {
      maxOutputTokens: 1536,
      responseMimeType: 'application/json',
      responseSchema: RECONSTRUCTION_SCHEMA,
    },
  });

  return JSON.parse(text) as ReconstructionResult;
}
