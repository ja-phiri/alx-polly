// Database types that match the Supabase schema exactly
// These types represent the actual database structure

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          avatar?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      polls: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          is_active: boolean;
          is_public: boolean;
          allow_multiple_votes: boolean;
          expires_at: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          is_active?: boolean;
          is_public?: boolean;
          allow_multiple_votes?: boolean;
          expires_at?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          is_active?: boolean;
          is_public?: boolean;
          allow_multiple_votes?: boolean;
          expires_at?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      poll_options: {
        Row: {
          id: string;
          poll_id: string;
          text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          poll_id: string;
          text: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          poll_id?: string;
          text?: string;
          created_at?: string;
        };
      };
      votes: {
        Row: {
          id: string;
          poll_id: string;
          option_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          poll_id: string;
          option_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          poll_id?: string;
          option_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      poll_summary: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          is_active: boolean;
          is_public: boolean;
          allow_multiple_votes: boolean;
          expires_at: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
          option_count: number;
          total_votes: number;
          unique_voters: number;
        };
      };
    };
    Functions: {
      get_poll_with_options: {
        Args: {
          poll_uuid: string;
        };
        Returns: {
          poll_id: string;
          title: string;
          description: string | null;
          is_active: boolean;
          is_public: boolean;
          allow_multiple_votes: boolean;
          expires_at: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
          total_votes: number;
          options: PollOptionWithVotes[];
        }[];
      };
      can_user_vote: {
        Args: {
          poll_uuid: string;
          user_uuid: string;
        };
        Returns: boolean;
      };
      get_user_votes: {
        Args: {
          poll_uuid: string;
          user_uuid: string;
        };
        Returns: {
          option_id: string;
          option_text: string;
          voted_at: string;
        }[];
      };
    };
  };
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Specific table types
export type Profile = Tables<'profiles'>;
export type Poll = Tables<'polls'>;
export type PollOption = Tables<'poll_options'>;
export type Vote = Tables<'votes'>;
export type PollOptionWithVotes = PollOption & { votes: number };
export type PollSummary = Database['public']['Views']['poll_summary']['Row'];

// Insert types
export type ProfileInsert = Inserts<'profiles'>;
export type PollInsert = Inserts<'polls'>;
export type PollOptionInsert = Inserts<'poll_options'>;
export type VoteInsert = Inserts<'votes'>;

// Update types
export type ProfileUpdate = Updates<'profiles'>;
export type PollUpdate = Updates<'polls'>;
export type PollOptionUpdate = Updates<'poll_options'>;
export type VoteUpdate = Updates<'votes'>;

// Function return types
export type PollWithOptions = Database['public']['Functions']['get_poll_with_options']['Returns'][0];
export type UserVotes = Database['public']['Functions']['get_user_votes']['Returns'];
