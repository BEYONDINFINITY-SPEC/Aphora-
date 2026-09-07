import { supabase } from './supabase';
import { generateUuidV4 } from './uuid';
import type { AphasiaType } from '../constants/aphasiaTypes';
import type { Language } from '../constants/languages';

export interface CreateSessionParams {
  aphasiaType: AphasiaType;
  language: Language;
}

// user_id is a random UUID for now - there's no real auth yet, so this just
// gives each session a unique, non-null owner id rather than leaving it null.
export async function createSession({
  aphasiaType,
  language,
}: CreateSessionParams): Promise<string> {
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      user_id: generateUuidV4(),
      aphasia_type: aphasiaType,
      language,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to create session: ${error.message}`);
  }

  return data.id;
}
