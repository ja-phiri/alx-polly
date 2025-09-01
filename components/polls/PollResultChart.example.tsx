"use client";

import * as React from "react";
import { PollResultChart } from "./PollResultChart";
import { Poll, PollOption } from "@/lib/types";

// Example usage of the PollResultChart component
// This shows different configurations and use cases

const ExamplePollResultChart = () => {
  // Mock poll data that matches our database schema
  const mockPoll: Poll & {
    options: Array<PollOption & { votes: number; percentage: number }>;
    totalVotes: number;
    uniqueVoters: number;
  } = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    title: "What's your favorite programming language?",
    description: "Let's see which programming language is most popular among developers in 2024.",
    is_active: true,
    is_public: true,
    allow_multiple_votes: false,
    expires_at: "2024-12-31T23:59:59Z",
    created_by: "user-id-123",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    options: [
      {
        id: "opt-1",
        poll_id: "550e8400-e29b-41d4-a716-446655440000",
        text: "JavaScript",
        created_at: "2024-01-15T10:00:00Z",
        votes: 145,
        percentage: 42
      },
      {
        id: "opt-2",
        poll_id: "550e8400-e29b-41d4-a716-446655440000",
        text: "Python",
        created_at: "2024-01-15T10:00:00Z",
        votes: 98,
        percentage: 28
      },
      {
        id: "opt-3",
        poll_id: "550e8400-e29b-41d4-a716-446655440000",
        text: "TypeScript",
        created_at: "2024-01-15T10:00:00Z",
        votes: 67,
        percentage: 19
      },
      {
        id: "opt-4",
        poll_id: "550e8400-e29b-41d4-a716-446655440000",
        text: "Rust",
        created_at: "2024-01-15T10:00:00Z",
        votes: 38,
        percentage: 11
      }
    ],
    totalVotes: 348,
    uniqueVoters: 289
  };

  const emptyPoll: Poll & {
    options: Array<PollOption & { votes: number; percentage: number }>;
    totalVotes: number;
  } = {
    id: "empty-poll-id",
    title: "New Poll - No Votes Yet",
    description: "This poll hasn't received any votes yet.",
    is_active: true,
    is_public: true,
    allow_multiple_votes: false,
    expires_at: null,
    created_by: "user-id-123",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    options: [
      {
        id: "empty-opt-1",
        poll_id: "empty-poll-id",
        text: "Option A",
        created_at: "2024-01-15T10:00:00Z",
        votes: 0,
        percentage: 0
      },
      {
        id: "empty-opt-2",
        poll_id: "empty-poll-id",
        text: "Option B",
        created_at: "2024-01-15T10:00:00Z",
        votes: 0,
        percentage: 0
      }
    ],
    totalVotes: 0
  };

  return (
    <div className="min-h-screen bg-background p-8 space-y-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">PollResultChart Examples</h1>
          <p className="text-muted-foreground">
            Different configurations of the PollResultChart component
          </p>
        </div>

        {/* Full featured chart */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Full Featured Chart</h2>
          <PollResultChart
            poll={mockPoll}
            showHeader={true}
            showStats={true}
            showActions={true}
            variant="horizontal"
          />
        </div>

        {/* Compact version without header */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Compact Version</h2>
          <PollResultChart
            poll={mockPoll}
            showHeader={false}
            showStats={false}
            showActions={false}
            variant="horizontal"
          />
        </div>

        {/* Bar chart variant */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Bar Chart Variant</h2>
          <PollResultChart
            poll={mockPoll}
            showHeader={true}
            showStats={true}
            showActions={false}
            variant="bar"
          />
        </div>

        {/* Donut chart variant */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Donut Chart Variant</h2>
          <PollResultChart
            poll={mockPoll}
            showHeader={true}
            showStats={true}
            showActions={false}
            variant="donut"
          />
        </div>

        {/* Empty poll state */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Empty Poll State</h2>
          <PollResultChart
            poll={emptyPoll}
            showHeader={true}
            showStats={true}
            showActions={false}
            variant="horizontal"
          />
        </div>

        {/* Side by side comparison */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Side by Side Comparison</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <PollResultChart
              poll={mockPoll}
              showHeader={false}
              showStats={true}
              showActions={false}
              variant="horizontal"
              className="h-fit"
            />
            <PollResultChart
              poll={mockPoll}
              showHeader={false}
              showStats={false}
              showActions={false}
              variant="donut"
              className="h-fit"
            />
          </div>
        </div>

        {/* Usage with real data example */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Usage Example</h2>
          <div className="bg-muted/30 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">How to use with real data:</h3>
            <pre className="text-sm bg-background p-4 rounded border overflow-x-auto">
{`// In your component
import { PollResultChart } from '@/components/polls/PollResultChart'
import { supabase } from '@/lib/supabase/client'

export function PollResults({ pollId }: { pollId: string }) {
  const [poll, setPoll] = useState(null)

  useEffect(() => {
    const fetchPoll = async () => {
      const { data } = await supabase
        .from('polls')
        .select(\`
          *,
          options:poll_options(*),
          votes(*)
        \`)
        .eq('id', pollId)
        .single()

      // Process data to add vote counts and percentages
      const processedPoll = {
        ...data,
        options: data.options.map(option => ({
          ...option,
          votes: data.votes.filter(v => v.option_id === option.id).length,
          percentage: // calculate percentage
        })),
        totalVotes: data.votes.length
      }

      setPoll(processedPoll)
    }

    fetchPoll()
  }, [pollId])

  if (!poll) return <div>Loading...</div>

  return (
    <PollResultChart
      poll={poll}
      showHeader={true}
      showStats={true}
      showActions={true}
    />
  )
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamplePollResultChart;
