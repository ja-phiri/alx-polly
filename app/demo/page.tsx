"use client";

import * as React from "react";
import { PollResultChart } from "@/components/polls/PollResultChart";
import { Poll, PollOption } from "@/lib/types";

// Mock poll data that matches the database schema
const createMockPoll = (
  id: string,
  title: string,
  description: string,
  votes: number[],
  options: string[],
  isActive: boolean = true
): Poll & {
  options: Array<PollOption & { votes: number; percentage: number }>;
  totalVotes: number;
  uniqueVoters: number;
} => {
  const totalVotes = votes.reduce((sum, v) => sum + v, 0);

  return {
    id,
    title,
    description,
    is_active: isActive,
    is_public: true,
    allow_multiple_votes: false,
    expires_at: isActive ? "2024-12-31T23:59:59Z" : "2024-01-31T23:59:59Z",
    created_by: "user-demo-123",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    options: options.map((text, index) => ({
      id: `${id}-opt-${index + 1}`,
      poll_id: id,
      text,
      created_at: "2024-01-15T10:00:00Z",
      votes: votes[index] || 0,
      percentage: totalVotes > 0 ? Math.round((votes[index] / totalVotes) * 100) : 0,
    })),
    totalVotes,
    uniqueVoters: Math.ceil(totalVotes * 0.85),
  };
};

export default function DemoPage() {
  // Various demo polls
  const programmingPoll = createMockPoll(
    "demo-poll-1",
    "What's your favorite programming language?",
    "A survey to understand the most popular programming languages among developers in 2024.",
    [145, 98, 67, 38, 15],
    ["JavaScript", "Python", "TypeScript", "Rust", "Go"]
  );

  const frameworkPoll = createMockPoll(
    "demo-poll-2",
    "Best React Framework for 2024?",
    "Which React framework do you prefer for building modern web applications?",
    [89, 76, 43, 28],
    ["Next.js", "Remix", "Gatsby", "Vite + React"]
  );

  const emptyPoll = createMockPoll(
    "demo-poll-3",
    "New Poll - No Votes Yet",
    "This poll demonstrates the empty state when no votes have been cast.",
    [0, 0, 0],
    ["Option A", "Option B", "Option C"]
  );

  const closedPoll = createMockPoll(
    "demo-poll-4",
    "Favorite IDE (Closed Poll)",
    "This poll has ended. Results are now final.",
    [234, 189, 156, 98, 67],
    ["VS Code", "WebStorm", "Vim/Neovim", "Sublime Text", "Atom"],
    false
  );

  const twoOptionPoll = createMockPoll(
    "demo-poll-5",
    "Tabs vs Spaces?",
    "The eternal debate in programming - what's your preference for code indentation?",
    [167, 134],
    ["Spaces (4)", "Tabs"]
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">PollResultChart Demo</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Interactive demonstrations of the PollResultChart component with different configurations and data states.
          </p>
        </div>

        {/* Full Featured Example */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Full Featured Chart</h2>
            <p className="text-muted-foreground">
              Complete component with header, stats, and action buttons. Click the chart icon to switch between visualization types.
            </p>
          </div>
          <PollResultChart
            poll={programmingPoll}
            showHeader={true}
            showStats={true}
            showActions={true}
            variant="horizontal"
          />
        </section>

        {/* Different Chart Types */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Chart Variations</h2>
            <p className="text-muted-foreground">
              The same data displayed using different chart types.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Horizontal Bars</h3>
              <PollResultChart
                poll={frameworkPoll}
                showHeader={false}
                showStats={false}
                showActions={false}
                variant="horizontal"
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-medium">Vertical Bars</h3>
              <PollResultChart
                poll={frameworkPoll}
                showHeader={false}
                showStats={false}
                showActions={false}
                variant="bar"
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-medium">Donut Chart</h3>
              <PollResultChart
                poll={frameworkPoll}
                showHeader={false}
                showStats={false}
                showActions={false}
                variant="donut"
              />
            </div>
          </div>
        </section>

        {/* Two Option Poll */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Two-Option Poll</h2>
            <p className="text-muted-foreground">
              How the component handles binary choice polls.
            </p>
          </div>
          <div className="max-w-2xl">
            <PollResultChart
              poll={twoOptionPoll}
              showHeader={true}
              showStats={true}
              showActions={false}
              variant="horizontal"
            />
          </div>
        </section>

        {/* Compact Widgets */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Dashboard Widgets</h2>
            <p className="text-muted-foreground">
              Compact versions suitable for dashboard layouts.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <PollResultChart
              poll={programmingPoll}
              showHeader={false}
              showStats={true}
              showActions={false}
              variant="horizontal"
              className="h-fit"
            />
            <PollResultChart
              poll={closedPoll}
              showHeader={false}
              showStats={false}
              showActions={false}
              variant="donut"
              className="h-fit"
            />
          </div>
        </section>

        {/* Special States */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Special States</h2>
            <p className="text-muted-foreground">
              How the component handles edge cases and different poll states.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Empty Poll (No Votes)</h3>
              <PollResultChart
                poll={emptyPoll}
                showHeader={true}
                showStats={true}
                showActions={false}
                variant="horizontal"
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-medium">Closed Poll</h3>
              <PollResultChart
                poll={closedPoll}
                showHeader={true}
                showStats={true}
                showActions={true}
                variant="horizontal"
              />
            </div>
          </div>
        </section>

        {/* Usage Instructions */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">How to Use</h2>
            <p className="text-muted-foreground">
              Integration examples for your own components.
            </p>
          </div>

          <div className="bg-muted/30 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold">Basic Usage</h3>
            <pre className="bg-background p-4 rounded border text-sm overflow-x-auto">
{`import { PollResultChart } from '@/components/polls/PollResultChart';

// Basic usage
<PollResultChart
  poll={pollData}
  showHeader={true}
  showStats={true}
  variant="horizontal"
/>

// Dashboard widget
<PollResultChart
  poll={pollData}
  showHeader={false}
  showStats={false}
  variant="donut"
  className="h-fit"
/>

// Full-featured results page
<PollResultChart
  poll={pollData}
  showHeader={true}
  showStats={true}
  showActions={true}
  variant="horizontal"
/>`}
            </pre>
          </div>

          <div className="bg-muted/30 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold">Props</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <code className="bg-background px-2 py-1 rounded">poll</code>
                <p className="text-muted-foreground mt-1">Poll data with options and vote counts</p>
              </div>
              <div>
                <code className="bg-background px-2 py-1 rounded">showHeader</code>
                <p className="text-muted-foreground mt-1">Display poll title and description</p>
              </div>
              <div>
                <code className="bg-background px-2 py-1 rounded">showStats</code>
                <p className="text-muted-foreground mt-1">Show vote counts and leading option</p>
              </div>
              <div>
                <code className="bg-background px-2 py-1 rounded">showActions</code>
                <p className="text-muted-foreground mt-1">Enable share and export buttons</p>
              </div>
              <div>
                <code className="bg-background px-2 py-1 rounded">variant</code>
                <p className="text-muted-foreground mt-1">"horizontal" | "bar" | "donut"</p>
              </div>
              <div>
                <code className="bg-background px-2 py-1 rounded">className</code>
                <p className="text-muted-foreground mt-1">Additional CSS classes</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-muted-foreground border-t pt-8">
          <p>✨ PollResultChart component is ready for production use!</p>
        </div>
      </div>
    </div>
  );
}
