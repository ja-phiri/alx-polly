export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  pollId: string;
  createdAt: Date;
}

export interface Poll {
  id: string;
  title: string;
  description?: string;
  isActive: boolean;
  isPublic: boolean;
  allowMultipleVotes: boolean;
  expiresAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  options: PollOption[];
  totalVotes: number;
}

export interface Vote {
  id: string;
  pollId: string;
  optionId: string;
  userId: string;
  createdAt: Date;
}

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
