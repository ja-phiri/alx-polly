"use client";

import * as React from "react";
import Link from "next/link";
import { PollResultChart } from "@/components/polls/PollResultChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  ExternalLink,
  Sparkles,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/db/supabase-utils";
import { Poll, PollOption } from "@/lib/types";
import { Icons } from "@/components/ui/icons";

interface PollResultData extends Poll {
  options: Array<PollOption & { votes: number; percentage: number }>;
  totalVotes: number;
  uniqueVoters: number;
}

export function ChartShowcase() {
  const { user } = useAuth();
  const [pollData, setPollData] = React.useState<PollResultData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isRealData, setIsRealData] = React.useState(false);

  const createDemoData = (): PollResultData => ({
    id: "demo-showcase-poll",
    title: "Favorite Web Framework 2024",
    description:
      "What's your go-to framework for building modern web applications?",
    is_active: true,
    is_public: true,
    allow_multiple_votes: false,
    expires_at: "2024-12-31T23:59:59Z",
    created_by: "demo-user",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    options: [
      {
        id: "demo-opt-1",
        poll_id: "demo-showcase-poll",
        text: "React/Next.js",
        created_at: "2024-01-15T10:00:00Z",
        votes: 187,
        percentage: 43,
      },
      {
        id: "demo-opt-2",
        poll_id: "demo-showcase-poll",
        text: "Vue/Nuxt",
        created_at: "2024-01-15T10:00:00Z",
        votes: 134,
        percentage: 31,
      },
      {
        id: "demo-opt-3",
        poll_id: "demo-showcase-poll",
        text: "Angular",
        created_at: "2024-01-15T10:00:00Z",
        votes: 78,
        percentage: 18,
      },
      {
        id: "demo-opt-4",
        poll_id: "demo-showcase-poll",
        text: "Svelte/SvelteKit",
        created_at: "2024-01-15T10:00:00Z",
        votes: 35,
        percentage: 8,
      },
    ],
    totalVotes: 434,
    uniqueVoters: 367,
  });

  const fetchRealPollData = React.useCallback(async () => {
    try {
      setLoading(true);

      // Try to get user's polls first
      if (user) {
        try {
          const userPolls = await db.polls.getByUser(user.id);
          if (userPolls && userPolls.length > 0) {
            const pollWithVotes = userPolls
              .sort((a, b) => b.total_votes - a.total_votes)
              .find((p) => p.total_votes > 0);

            if (pollWithVotes) {
              // Get poll votes
              const votes = await db.votes.getByPoll(pollWithVotes.id);
              const voteCounts: Record<string, number> = {};
              const uniqueVoters = new Set(votes.map((v) => v.user_id));

              votes.forEach((vote) => {
                voteCounts[vote.option_id] =
                  (voteCounts[vote.option_id] || 0) + 1;
              });

              const totalVotes = votes.length;

              // Get poll options
              const options = await db.options.getByPoll(pollWithVotes.id);
              const processedOptions = options.map((option) => ({
                ...option,
                votes: voteCounts[option.id] || 0,
                percentage:
                  totalVotes > 0
                    ? Math.round(
                        ((voteCounts[option.id] || 0) / totalVotes) * 100,
                      )
                    : 0,
              }));

              const realPollData: PollResultData = {
                id: pollWithVotes.id,
                title: pollWithVotes.title,
                description: pollWithVotes.description,
                is_active: pollWithVotes.is_active,
                is_public: pollWithVotes.is_public,
                allow_multiple_votes: pollWithVotes.allow_multiple_votes,
                expires_at: pollWithVotes.expires_at,
                created_by: pollWithVotes.created_by,
                created_at: pollWithVotes.created_at,
                updated_at: pollWithVotes.updated_at,
                options: processedOptions,
                totalVotes,
                uniqueVoters: uniqueVoters.size,
              };

              setPollData(realPollData);
              setIsRealData(true);
              return;
            }
          }
        } catch (error) {
          console.log("Could not fetch user polls, falling back to demo data");
        }
      }

      // Try public polls
      try {
        const publicPolls = await db.polls.getPublicPolls(10, 0);
        if (publicPolls && publicPolls.length > 0) {
          const pollWithVotes = publicPolls
            .sort((a, b) => b.total_votes - a.total_votes)
            .find((p) => p.total_votes > 0);

          if (pollWithVotes) {
            const votes = await db.votes.getByPoll(pollWithVotes.id);
            const voteCounts: Record<string, number> = {};
            const uniqueVoters = new Set(votes.map((v) => v.user_id));

            votes.forEach((vote) => {
              voteCounts[vote.option_id] =
                (voteCounts[vote.option_id] || 0) + 1;
            });

            const totalVotes = votes.length;
            const options = await db.options.getByPoll(pollWithVotes.id);
            const processedOptions = options.map((option) => ({
              ...option,
              votes: voteCounts[option.id] || 0,
              percentage:
                totalVotes > 0
                  ? Math.round(
                      ((voteCounts[option.id] || 0) / totalVotes) * 100,
                    )
                  : 0,
            }));

            const realPollData: PollResultData = {
              id: pollWithVotes.id,
              title: pollWithVotes.title,
              description: pollWithVotes.description,
              is_active: pollWithVotes.is_active,
              is_public: pollWithVotes.is_public,
              allow_multiple_votes: pollWithVotes.allow_multiple_votes,
              expires_at: pollWithVotes.expires_at,
              created_by: pollWithVotes.created_by,
              created_at: pollWithVotes.created_at,
              updated_at: pollWithVotes.updated_at,
              options: processedOptions,
              totalVotes,
              uniqueVoters: uniqueVoters.size,
            };

            setPollData(realPollData);
            setIsRealData(true);
            return;
          }
        }
      } catch (error) {
        console.log("Could not fetch public polls, falling back to demo data");
      }

      // Fallback to demo data
      setPollData(createDemoData());
      setIsRealData(false);
    } catch (error) {
      console.error("Error in fetchRealPollData:", error);
      setPollData(createDemoData());
      setIsRealData(false);
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    fetchRealPollData();
  }, [fetchRealPollData]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                <CardTitle className="text-lg">
                  Poll Results Visualization
                </CardTitle>
              </div>
              <CardDescription>
                Interactive poll result charts with beautiful visualizations
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Icons.spinner className="h-6 w-6 animate-spin mr-3" />
            Loading poll data...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!pollData) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                <CardTitle className="text-lg">
                  Poll Results Visualization
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Ready
                </Badge>
              </div>
              <CardDescription>
                Interactive poll result charts - create your first poll to see
                live data
              </CardDescription>
            </div>
            <Link href="/demo">
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                View Demo
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="font-medium">No poll data available yet</p>
              <p className="text-sm text-muted-foreground">
                {user
                  ? "Create a poll and get some votes to see interactive charts here"
                  : "Login and create a poll to see interactive charts here"}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2">
              {user ? (
                <>
                  <Link href="/polls/create">
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Your First Poll
                    </Button>
                  </Link>
                  <Link href="/polls">
                    <Button variant="outline">Browse Polls</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button className="gap-2">Login to Get Started</Button>
                  </Link>
                  <Link href="/polls">
                    <Button variant="outline">Browse Public Polls</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <CardTitle className="text-lg">
                Poll Results Visualization
              </CardTitle>
              <Badge
                variant={isRealData ? "default" : "secondary"}
                className="text-xs"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                {isRealData ? "Live Data" : "Demo Data"}
              </Badge>
            </div>
            <CardDescription>
              Interactive poll result charts{" "}
              {isRealData
                ? "with real-time voting data"
                : "with demo data - create your first poll to see real data"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={fetchRealPollData}
              variant="ghost"
              size="sm"
              className="gap-1"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
            {isRealData && (
              <Link href={`/polls/${pollData.id}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  View Poll
                </Button>
              </Link>
            )}
            <Link href="/demo">
              <Button variant="outline" size="sm">
                More Examples
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <PollResultChart
            poll={pollData}
            showHeader={false}
            showStats={true}
            showActions={false}
            variant="horizontal"
            className="border-0 shadow-none p-0"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
            <div className="flex items-center gap-4">
              <span>• Click chart icon to switch visualization types</span>
              {isRealData ? (
                <>
                  <span>• Data updates in real-time</span>
                  {pollData.created_by === user?.id && (
                    <span>• This is your poll</span>
                  )}
                </>
              ) : (
                <span>• Create a poll to see real data</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isRealData && (
                <Badge
                  variant={pollData.is_active ? "default" : "secondary"}
                  className="text-xs"
                >
                  {pollData.is_active ? "Active" : "Closed"}
                </Badge>
              )}
              {!isRealData && !user ? (
                <Link
                  href="/polls/create"
                  className="text-primary hover:underline"
                >
                  Create your first poll →
                </Link>
              ) : (
                <Link href="/demo" className="text-primary hover:underline">
                  See more examples →
                </Link>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
