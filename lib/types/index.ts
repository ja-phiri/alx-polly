// Re-export database types
export * from "./database";

// Import types for local use
import { Profile, Poll, PollOption, Vote } from "./database";

// Application-specific types that extend database types
export interface User extends Profile {
  // Additional application-specific user properties can be added here
}

export interface PollOptionWithVotes extends PollOption {
  votes: number;
}

export interface PollWithOptionsAndVotes extends Poll {
  options: PollOptionWithVotes[];
  totalVotes: number;
}

// Form and API types
export interface CreatePollData {
  title: string;
  description?: string;
  isPublic: boolean;
  allowMultipleVotes: boolean;
  expiresAt?: Date;
  options: string[];
}

export interface UpdatePollData {
  title?: string;
  description?: string;
  isActive?: boolean;
  isPublic?: boolean;
  allowMultipleVotes?: boolean;
  expiresAt?: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Utility types for converting between database and application formats
export interface PollFormData {
  title: string;
  description?: string;
  isPublic: boolean;
  allowMultipleVotes: boolean;
  expiresAt?: string;
  options: string[];
}

export interface VoteData {
  pollId: string;
  optionId: string;
}

export interface EditPollData {
  id: string;
  title: string;
  description: string;
  is_public: boolean;
  is_active: boolean;
  allow_multiple_votes: boolean;
  expires_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  options: Array<{
    id?: string;
    option_id?: string;
    text: string;
    poll_id: string;
    created_at?: string;
    updated_at?: string;
  }>;
}

// Type guards and utilities
export const isPollActive = (poll: Poll): boolean => {
  if (!poll.is_active) return false;
  if (poll.expires_at && new Date(poll.expires_at) <= new Date()) return false;
  return true;
};

export const canUserVoteOnPoll = (poll: Poll, userVotes: Vote[]): boolean => {
  if (!isPollActive(poll)) return false;
  if (!poll.allow_multiple_votes && userVotes.length > 0) return false;
  return true;
};
