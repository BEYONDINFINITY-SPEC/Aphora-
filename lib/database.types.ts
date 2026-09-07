// Hand-written to match supabase/migrations/20260906120000_create_sessions_and_logs.sql
// and 20260906140000_add_scenario_to_logs.sql.
// If you later run `supabase gen types typescript`, that generated file can replace this one.
//
// Tables/Views/Functions/Relationships here follow @supabase/postgrest-js's
// GenericSchema/GenericTable shape (node_modules/@supabase/postgrest-js/src/types/common/common.ts) -
// omitting Relationships/Views/Functions doesn't error, it just silently
// makes typed .insert()/.update() calls fall back to `never`.

export type LogErrorTag =
  | 'word_finding'
  | 'wrong_word'
  | 'missing_verb'
  | 'word_order'
  | 'fragment'
  | 'correct';

export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string;
          user_id: string | null;
          aphasia_type: string | null;
          language: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          aphasia_type?: string | null;
          language?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          aphasia_type?: string | null;
          language?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      logs: {
        Row: {
          id: string;
          session_id: string | null;
          timestamp: string;
          error_tag: LogErrorTag | null;
          reconstructed_sentence: string | null;
          original_input: string | null;
          scenario: string | null;
          relationship: string | null;
        };
        Insert: {
          id?: string;
          session_id?: string | null;
          timestamp?: string;
          error_tag?: LogErrorTag | null;
          reconstructed_sentence?: string | null;
          original_input?: string | null;
          scenario?: string | null;
          relationship?: string | null;
        };
        Update: {
          id?: string;
          session_id?: string | null;
          timestamp?: string;
          error_tag?: LogErrorTag | null;
          reconstructed_sentence?: string | null;
          original_input?: string | null;
          scenario?: string | null;
          relationship?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'logs_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'sessions';
            referencedColumns: ['id'];
          },
        ];
      };
      naming_attempts: {
        Row: {
          id: string;
          session_id: string | null;
          item_shown: string | null;
          selected_answer: string | null;
          was_correct: boolean | null;
          timestamp: string;
        };
        Insert: {
          id?: string;
          session_id?: string | null;
          item_shown?: string | null;
          selected_answer?: string | null;
          was_correct?: boolean | null;
          timestamp?: string;
        };
        Update: {
          id?: string;
          session_id?: string | null;
          item_shown?: string | null;
          selected_answer?: string | null;
          was_correct?: boolean | null;
          timestamp?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'naming_attempts_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'sessions';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
