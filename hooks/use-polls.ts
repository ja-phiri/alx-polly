'use client';

import { useState, useEffect } from 'react';
import { Poll, CreatePollData, UpdatePollData } from '@/lib/types';
import { useAuth } from './use-auth';

export const usePolls = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPolls = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/polls');
      if (!response.ok) throw new Error('Failed to fetch polls');
      const data = await response.json();
      setPolls(data.polls || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const createPoll = async (pollData: CreatePollData) => {
    if (!user) throw new Error('User must be authenticated');
    setIsLoading(true);
    try {
      const response = await fetch('/api/polls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(pollData),
      });
      if (!response.ok) throw new Error('Failed to create poll');
      const data = await response.json();
      setPolls(prev => [data.poll, ...prev]);
      return data.poll;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const voteOnPoll = async (pollId: string, optionId: string) => {
    if (!user) throw new Error('User must be authenticated');
    setIsLoading(true);
    try {
      const response = await fetch(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ optionId }),
      });
      if (!response.ok) throw new Error('Failed to vote');
      const data = await response.json();
      setPolls(prev => prev.map(poll => poll.id === pollId ? data.poll : poll));
      if (currentPoll?.id === pollId) setCurrentPoll(data.poll);
      return data.poll;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    polls,
    currentPoll,
    isLoading,
    error,
    fetchPolls,
    createPoll,
    voteOnPoll,
    setCurrentPoll,
    clearError: () => setError(null),
  };
};
