import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';
import {
  Poll,
  PollOption,
  Vote,
  Profile,
  PollWithOptions,
  UserVotes,
  PollSummary,
  CreatePollData,
  UpdatePollData,
  PollFormData,
} from '../types';

// Create Supabase client with database types
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables not found. Database operations will fail.');
}

export const supabase = createClient<Database>(
  supabaseUrl || 'http://localhost:54321',
  supabaseAnonKey || 'dummy-key'
);

// Profile operations
export const profileOperations = {
  async getById(id: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  },

  async getByEmail(email: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error fetching profile by email:', error);
      return null;
    }

    return data;
  },

  async update(id: string, updates: Partial<Profile>): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return null;
    }

    return data;
  },
};

// Poll operations
export const pollOperations = {
  async create(pollData: CreatePollData, userId: string, client?: any): Promise<Poll | null> {
    const supabaseClient = client || supabase;

    try {
      // Create the poll first
      const { data: poll, error: pollError } = await supabaseClient
        .from('polls')
        .insert({
          title: pollData.title,
          description: pollData.description,
          is_public: pollData.isPublic,
          allow_multiple_votes: pollData.allowMultipleVotes,
          expires_at: pollData.expiresAt ? new Date(pollData.expiresAt).toISOString() : null,
          created_by: userId,
        })
        .select()
        .single();

      if (pollError) {
        console.error('Error creating poll:', pollError);
        return null;
      }

      // Create poll options
      const options = pollData.options.map((text) => ({
        poll_id: poll.id,
        text: text.trim(),
      }));

      const { error: optionsError } = await supabaseClient.from('poll_options').insert(options);

      if (optionsError) {
        console.error('Error creating poll options:', optionsError);
        // Clean up the poll if options creation fails
        await supabaseClient.from('polls').delete().eq('id', poll.id);
        return null;
      }

      return poll;
    } catch (error) {
      console.error('Error in poll creation:', error);
      return null;
    }
  },

  async getById(id: string): Promise<PollWithOptions | null> {
    const { data, error } = await supabase.rpc('get_poll_with_options', { poll_uuid: id });

    if (error || !data || data.length === 0) {
      console.error('Error fetching poll:', error);
      return null;
    }

    return data[0];
  },

  async getAll(limit = 20, offset = 0): Promise<PollSummary[]> {
    const { data, error } = await supabase
      .from('poll_summary')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching polls:', error);
      return [];
    }

    return data || [];
  },

  async getByUser(userId: string): Promise<PollSummary[]> {
    const { data, error } = await supabase
      .from('poll_summary')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user polls:', error);
      return [];
    }

    return data || [];
  },

  async getPublicPolls(limit = 20, offset = 0): Promise<PollSummary[]> {
    const { data, error } = await supabase
      .from('poll_summary')
      .select('*')
      .eq('is_public', true)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching public polls:', error);
      return [];
    }

    return data || [];
  },

  async update(id: string, updates: UpdatePollData, client?: any): Promise<Poll | null> {
    const supabaseClient = client || supabase;
    const updateData: any = {};

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.isPublic !== undefined) updateData.is_public = updates.isPublic;
    if (updates.allowMultipleVotes !== undefined) updateData.allow_multiple_votes = updates.allowMultipleVotes;
    if ('expiresAt' in updates) {
      const v: any = (updates as any).expiresAt;
      if (v === null || v === undefined || v === '') {
        updateData.expires_at = null;
      } else if (v instanceof Date) {
        updateData.expires_at = v.toISOString();
      } else {
        const d = new Date(v);
        updateData.expires_at = isNaN(d.getTime()) ? null : d.toISOString();
      }
    }

    const { data, error } = await supabaseClient
      .from('polls')
      .update(updateData as Partial<Poll>)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating poll:', error);
      return null;
    }

    return data;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('polls').delete().eq('id', id);

    if (error) {
      console.error('Error deleting poll:', error);
      return false;
    }

    return true;
  },

  async canUserVote(pollId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('can_user_vote', {
      poll_uuid: pollId,
      user_uuid: userId,
    });

    if (error) {
      console.error('Error checking if user can vote:', error);
      return false;
    }

    return data as boolean;
  },
};

// Vote operations
export const voteOperations = {
  async create(pollId: string, optionId: string, userId: string): Promise<Vote | null> {
    const { data, error } = await supabase
      .from('votes')
      .insert({
        poll_id: pollId,
        option_id: optionId,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating vote:', error);
      return null;
    }

    return data;
  },

  async getByPoll(pollId: string): Promise<Vote[]> {
    const { data, error } = await supabase.from('votes').select('*').eq('poll_id', pollId);

    if (error) {
      console.error('Error fetching poll votes:', error);
      return [];
    }

    return data || [];
  },

  async getByUser(userId: string): Promise<Vote[]> {
    const { data, error } = await supabase.from('votes').select('*').eq('user_id', userId);

    if (error) {
      console.error('Error fetching user votes:', error);
      return [];
    }

    return data || [];
  },

  async getUserVotesForPoll(pollId: string, userId: string): Promise<UserVotes> {
    const { data, error } = await supabase.rpc('get_user_votes', {
      poll_uuid: pollId,
      user_uuid: userId,
    });

    if (error) {
      console.error('Error fetching user votes for poll:', error);
      return [];
    }

    return (data || []) as UserVotes;
  },

  async hasVoted(pollId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('user_id', userId)
      .limit(1);

    if (error) {
      console.error('Error checking if user has voted:', error);
      return false;
    }

    return (data?.length || 0) > 0;
  },

  async deleteVote(pollId: string, optionId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('votes')
      .delete()
      .eq('poll_id', pollId)
      .eq('option_id', optionId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting vote:', error);
      return false;
    }

    return true;
  },
};

// Poll options operations
export const pollOptionOperations = {
  async getByPoll(pollId: string): Promise<PollOption[]> {
    const { data, error } = await supabase
      .from('poll_options')
      .select('*')
      .eq('poll_id', pollId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching poll options:', error);
      return [];
    }

    return data || [];
  },

  async addOption(pollId: string, text: string, client?: any): Promise<PollOption | null> {
    const supabaseClient = client || supabase;
    const { data, error } = await supabaseClient
      .from('poll_options')
      .insert({
        poll_id: pollId,
        text: text.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding poll option:', error);
      return null;
    }

    return data;
  },

  async updateOption(optionId: string, text: string, client?: any): Promise<PollOption | null> {
    const supabaseClient = client || supabase;
    const { data, error } = await supabaseClient
      .from('poll_options')
      .update({ text: text.trim() })
      .eq('id', optionId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating poll option:', error);
      return null;
    }

    return data;
  },

  async deleteOption(optionId: string, client?: any): Promise<boolean> {
    const supabaseClient = client || supabase;
    const { error } = await supabaseClient.from('poll_options').delete().eq('id', optionId);

    if (error) {
      console.error('Error deleting poll option:', error);
      return false;
    }

    return true;
  },
};

// Utility functions
export const dbUtils = {
  // Convert form data to database format
  convertPollFormData(formData: PollFormData): CreatePollData {
    return {
      title: formData.title,
      description: formData.description,
      isPublic: formData.isPublic,
      allowMultipleVotes: formData.allowMultipleVotes,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined,
      options: formData.options.filter((option) => option.trim().length > 0),
    };
  },

  // Get current user from Supabase auth
  async getCurrentUser(): Promise<Profile | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    return profileOperations.getById(user.id);
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return !!user;
  },

  // Get user ID from auth
  async getCurrentUserId(): Promise<string | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id || null;
  },
};

// Export all operations
export const db = {
  profiles: profileOperations,
  polls: pollOperations,
  votes: voteOperations,
  options: pollOptionOperations,
  utils: dbUtils,
  client: supabase,
};
