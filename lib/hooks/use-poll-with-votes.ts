"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/db/supabase-utils";
import { PollWithOptions, Poll, PollOption } from "@/lib/types";

interface PollOptionWithVotes extends PollOption {
  votes: number;
  percentage: number;
}

interface PollResultData extends Poll {
  options: PollOptionWithVotes[];
  totalVotes: number;
  uniqueVoters: number;
}

interface UsePollWithVotesResult {
  poll: PollResultData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePollWithVotes(pollId: string | null): UsePollWithVotesResult {
  const [poll, setPoll] = useState<PollResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const processVoteCounts = useCallback(
    async (pollData: PollWithOptions): Promise<PollResultData> => {
      try {
        // Get all votes for this poll
        const votes = await db.votes.getByPoll(pollData.poll_id);

        // Count votes per option
        const voteCounts: Record<string, number> = {};
        const uniqueVoters = new Set(votes.map((v) => v.user_id));

        votes.forEach((vote) => {
          voteCounts[vote.option_id] = (voteCounts[vote.option_id] || 0) + 1;
        });

        const totalVotes = votes.length;

        // Process options with vote data
        const processedOptions = pollData.options.map((option) => ({
          ...option,
          votes: voteCounts[option.id] || 0,
          percentage:
            totalVotes > 0
              ? Math.round(((voteCounts[option.id] || 0) / totalVotes) * 100)
              : 0,
        }));

        return {
          id: pollData.poll_id,
          title: pollData.title,
          description: pollData.description,
          is_active: pollData.is_active,
          is_public: pollData.is_public,
          allow_multiple_votes: pollData.allow_multiple_votes,
          expires_at: pollData.expires_at,
          created_by: pollData.created_by,
          created_at: pollData.created_at,
          updated_at: pollData.updated_at,
          options: processedOptions,
          totalVotes,
          uniqueVoters: uniqueVoters.size,
        };
      } catch (err) {
        console.error("Error processing vote counts:", err);
        throw err;
      }
    },
    [],
  );

  const fetchPollData = useCallback(async () => {
    if (!pollId) {
      setPoll(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch poll with options
      const pollData = await db.polls.getById(pollId);

      if (!pollData) {
        setError("Poll not found");
        setPoll(null);
        return;
      }

      // Process with vote counts
      const processedPoll = await processVoteCounts(pollData);
      setPoll(processedPoll);
    } catch (err) {
      console.error("Error fetching poll data:", err);
      setError(err instanceof Error ? err.message : "Failed to load poll data");
      setPoll(null);
    } finally {
      setLoading(false);
    }
  }, [pollId, processVoteCounts]);

  useEffect(() => {
    fetchPollData();
  }, [fetchPollData]);

  const refetch = useCallback(() => {
    fetchPollData();
  }, [fetchPollData]);

  return {
    poll,
    loading,
    error,
    refetch,
  };
}

export function useMultiplePollsWithVotes(pollIds: string[]): {
  polls: PollResultData[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
} {
  const [polls, setPolls] = useState<PollResultData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const processVoteCounts = useCallback(
    async (pollData: PollWithOptions): Promise<PollResultData> => {
      try {
        const votes = await db.votes.getByPoll(pollData.poll_id);
        const voteCounts: Record<string, number> = {};
        const uniqueVoters = new Set(votes.map((v) => v.user_id));

        votes.forEach((vote) => {
          voteCounts[vote.option_id] = (voteCounts[vote.option_id] || 0) + 1;
        });

        const totalVotes = votes.length;
        const processedOptions = pollData.options.map((option) => ({
          ...option,
          votes: voteCounts[option.id] || 0,
          percentage:
            totalVotes > 0
              ? Math.round(((voteCounts[option.id] || 0) / totalVotes) * 100)
              : 0,
        }));

        return {
          id: pollData.poll_id,
          title: pollData.title,
          description: pollData.description,
          is_active: pollData.is_active,
          is_public: pollData.is_public,
          allow_multiple_votes: pollData.allow_multiple_votes,
          expires_at: pollData.expires_at,
          created_by: pollData.created_by,
          created_at: pollData.created_at,
          updated_at: pollData.updated_at,
          options: processedOptions,
          totalVotes,
          uniqueVoters: uniqueVoters.size,
        };
      } catch (err) {
        console.error("Error processing vote counts for poll:", pollData.poll_id, err);
        throw err;
      }
    },
    [],
  );

  const fetchMultiplePolls = useCallback(async () => {
    if (pollIds.length === 0) {
      setPolls([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const pollPromises = pollIds.map(async (pollId) => {
        try {
          const pollData = await db.polls.getById(pollId);
          if (!pollData) return null;
          return await processVoteCounts(pollData);
        } catch (err) {
          console.error(`Error fetching poll ${pollId}:`, err);
          return null;
        }
      });

      const results = await Promise.all(pollPromises);
      const validPolls = results.filter((poll): poll is PollResultData => poll !== null);
      setPolls(validPolls);
    } catch (err) {
      console.error("Error fetching multiple polls:", err);
      setError(err instanceof Error ? err.message : "Failed to load polls");
      setPolls([]);
    } finally {
      setLoading(false);
    }
  }, [pollIds, processVoteCounts]);

  useEffect(() => {
    fetchMultiplePolls();
  }, [fetchMultiplePolls]);

  const refetch = useCallback(() => {
    fetchMultiplePolls();
  }, [fetchMultiplePolls]);

  return {
    polls,
    loading,
    error,
    refetch,
  };
}

export function useFeaturedPollWithVotes(userId?: string): UsePollWithVotesResult {
  const [poll, setPoll] = useState<PollResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const processVoteCounts = useCallback(
    async (pollData: PollWithOptions): Promise<PollResultData> => {
      try {
        const votes = await db.votes.getByPoll(pollData.poll_id);
        const voteCounts: Record<string, number> = {};
        const uniqueVoters = new Set(votes.map((v) => v.user_id));

        votes.forEach((vote) => {
          voteCounts[vote.option_id] = (voteCounts[vote.option_id] || 0) + 1;
        });

        const totalVotes = votes.length;
        const processedOptions = pollData.options.map((option) => ({
          ...option,
          votes: voteCounts[option.id] || 0,
          percentage:
            totalVotes > 0
              ? Math.round(((voteCounts[option.id] || 0) / totalVotes) * 100)
              : 0,
        }));

        return {
          id: pollData.poll_id,
          title: pollData.title,
          description: pollData.description,
          is_active: pollData.is_active,
          is_public: pollData.is_public,
          allow_multiple_votes: pollData.allow_multiple_votes,
          expires_at: pollData.expires_at,
          created_by: pollData.created_by,
          created_at: pollData.created_at,
          updated_at: pollData.updated_at,
          options: processedOptions,
          totalVotes,
          uniqueVoters: uniqueVoters.size,
        };
      } catch (err) {
        console.error("Error processing vote counts:", err);
        throw err;
      }
    },
    [],
  );

  const fetchFeaturedPoll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // First try to get user's most popular poll
      if (userId) {
        const userPolls = await db.polls.getByUser(userId);
        const pollWithVotes = userPolls.find((p) => p.total_votes > 0);

        if (pollWithVotes) {
          const fullPoll = await db.polls.getById(pollWithVotes.id);
          if (fullPoll) {
            const processedPoll = await processVoteCounts(fullPoll);
            setPoll(processedPoll);
            return;
          }
        }
      }

      // Fallback: Get any public poll with votes
      const publicPolls = await db.polls.getPublicPolls(10, 0);
      const pollWithVotes = publicPolls.find((p) => p.total_votes > 0);

      if (pollWithVotes) {
        const fullPoll = await db.polls.getById(pollWithVotes.id);
        if (fullPoll) {
          const processedPoll = await processVoteCounts(fullPoll);
          setPoll(processedPoll);
          return;
        }
      }

      // If no polls with votes exist, set to null
      setPoll(null);
    } catch (err) {
      console.error("Error fetching featured poll:", err);
      setError(err instanceof Error ? err.message : "Failed to load featured poll");
      setPoll(null);
    } finally {
      setLoading(false);
    }
  }, [userId, processVoteCounts]);

  useEffect(() => {
    fetchFeaturedPoll();
  }, [fetchFeaturedPoll]);

  const refetch = useCallback(() => {
    fetchFeaturedPoll();
  }, [fetchFeaturedPoll]);

  return {
    poll,
    loading,
    error,
    refetch,
  };
}
