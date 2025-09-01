"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Vote,
  Share2,
  Download,
} from "lucide-react";
import { Poll, PollOption } from "@/lib/types";

interface PollOptionWithVotes extends PollOption {
  votes: number;
  percentage: number;
}

interface PollResultData extends Poll {
  options: PollOptionWithVotes[];
  totalVotes: number;
  uniqueVoters?: number;
}

interface PollResultChartProps {
  poll: PollResultData;
  showHeader?: boolean;
  variant?: "bar" | "donut" | "horizontal";
  showStats?: boolean;
  showActions?: boolean;
  className?: string;
}

export function PollResultChart({
  poll,
  showHeader = true,
  variant = "horizontal",
  showStats = true,
  showActions = false,
  className = "",
}: PollResultChartProps) {
  const [chartType, setChartType] = React.useState<
    "bar" | "donut" | "horizontal"
  >(variant);

  // Sort options by votes and ensure percentages are calculated
  const sortedOptions = React.useMemo(() => {
    return poll.options
      .map((option) => ({
        ...option,
        percentage:
          poll.totalVotes > 0
            ? Math.round((option.votes / poll.totalVotes) * 100)
            : 0,
      }))
      .sort((a, b) => b.votes - a.votes);
  }, [poll.options, poll.totalVotes]);

  const topOption = sortedOptions[0];
  const estimatedVoters =
    poll.uniqueVoters || Math.ceil(poll.totalVotes * 0.85);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Poll Results: ${poll.title}`,
        text: `Check out the results for "${poll.title}"`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleExport = () => {
    const csvData = [
      ["Option", "Votes", "Percentage"],
      ...sortedOptions.map((option) => [
        option.text,
        option.votes.toString(),
        `${option.percentage}%`,
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `poll-results-${poll.id}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderHorizontalChart = () => (
    <div className="space-y-4">
      {sortedOptions.map((option, index) => (
        <div key={option.id} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  index === 0
                    ? "bg-primary"
                    : index === 1
                      ? "bg-blue-500"
                      : index === 2
                        ? "bg-green-500"
                        : "bg-muted-foreground"
                }`}
              />
              <span className="font-medium text-sm">{option.text}</span>
              {index === 0 && (
                <Badge variant="secondary" className="text-xs">
                  Leading
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-semibold">{option.votes}</span>
              <span>({option.percentage}%)</span>
            </div>
          </div>
          <Progress
            value={option.percentage}
            className="h-3"
            style={
              {
                "--progress-background":
                  index === 0
                    ? "hsl(var(--primary))"
                    : index === 1
                      ? "#3b82f6"
                      : index === 2
                        ? "#10b981"
                        : "hsl(var(--muted-foreground))",
              } as React.CSSProperties
            }
          />
        </div>
      ))}
    </div>
  );

  const renderBarChart = () => (
    <div className="flex items-end justify-center gap-2 h-48 p-4">
      {sortedOptions.map((option, index) => {
        const height =
          option.percentage > 0
            ? Math.max((option.percentage / 100) * 160, 20)
            : 4;
        return (
          <div
            key={option.id}
            className="flex flex-col items-center gap-2 flex-1 max-w-20"
          >
            <div className="text-xs text-center text-muted-foreground">
              {option.votes}
            </div>
            <div
              className={`w-full rounded-t-md transition-all hover:opacity-80 ${
                index === 0
                  ? "bg-primary"
                  : index === 1
                    ? "bg-blue-500"
                    : index === 2
                      ? "bg-green-500"
                      : "bg-muted-foreground"
              }`}
              style={{ height: `${height}px` }}
            />
            <div className="text-xs text-center text-muted-foreground truncate w-full">
              {option.text}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderDonutChart = () => {
    const radius = 80;
    const strokeWidth = 20;
    const center = radius + strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;

    let cumulativePercentage = 0;

    return (
      <div className="flex items-center gap-8">
        <div className="relative">
          <svg
            width={center * 2}
            height={center * 2}
            className="transform -rotate-90"
          >
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth={strokeWidth}
            />
            {sortedOptions.map((option, index) => {
              const strokeDasharray = (option.percentage / 100) * circumference;
              const strokeDashoffset =
                circumference - (cumulativePercentage / 100) * circumference;
              cumulativePercentage += option.percentage;

              return (
                <circle
                  key={option.id}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={
                    index === 0
                      ? "hsl(var(--primary))"
                      : index === 1
                        ? "#3b82f6"
                        : index === 2
                          ? "#10b981"
                          : "hsl(var(--muted-foreground))"
                  }
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${strokeDasharray} ${circumference - strokeDasharray}`}
                  strokeDashoffset={-strokeDashoffset}
                  className="transition-all"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold">{poll.totalVotes}</div>
              <div className="text-xs text-muted-foreground">votes</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {sortedOptions.map((option, index) => (
            <div key={option.id} className="flex items-center gap-3">
              <div
                className={`w-4 h-4 rounded-full ${
                  index === 0
                    ? "bg-primary"
                    : index === 1
                      ? "bg-blue-500"
                      : index === 2
                        ? "bg-green-500"
                        : "bg-muted-foreground"
                }`}
              />
              <div className="flex-1">
                <div className="text-sm font-medium">{option.text}</div>
                <div className="text-xs text-muted-foreground">
                  {option.votes} votes ({option.percentage}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return renderBarChart();
      case "donut":
        return renderDonutChart();
      default:
        return renderHorizontalChart();
    }
  };

  const toggleChartType = () => {
    setChartType(
      chartType === "horizontal"
        ? "bar"
        : chartType === "bar"
          ? "donut"
          : "horizontal",
    );
  };

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-xl">{poll.title}</CardTitle>
              {poll.description && (
                <CardDescription>{poll.description}</CardDescription>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={poll.is_active ? "default" : "secondary"}>
                {poll.is_active ? "Active" : "Closed"}
              </Badge>
              <Button variant="outline" size="sm" onClick={toggleChartType}>
                {chartType === "horizontal" ? (
                  <BarChart3 className="h-4 w-4" />
                ) : chartType === "bar" ? (
                  <PieChart className="h-4 w-4" />
                ) : (
                  <TrendingUp className="h-4 w-4" />
                )}
              </Button>
              {showActions && (
                <>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className="space-y-6">
        {showStats && (
          <div className="flex items-center gap-6 text-sm text-muted-foreground bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Vote className="h-4 w-4" />
              <span className="font-medium">{poll.totalVotes}</span>
              <span>total votes</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="font-medium">{estimatedVoters}</span>
              <span>voters</span>
            </div>
            {topOption && (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>Leading:</span>
                <span className="font-medium">{topOption.text}</span>
                <Badge variant="secondary" className="text-xs">
                  {topOption.percentage}%
                </Badge>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Results</h3>
            {!showHeader && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={toggleChartType}>
                  {chartType === "horizontal" ? (
                    <BarChart3 className="h-4 w-4" />
                  ) : chartType === "bar" ? (
                    <PieChart className="h-4 w-4" />
                  ) : (
                    <TrendingUp className="h-4 w-4" />
                  )}
                </Button>
                {showActions && (
                  <>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExport}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>

          {poll.totalVotes === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Vote className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No votes yet</p>
              <p className="text-sm">Be the first to vote!</p>
            </div>
          ) : (
            renderChart()
          )}
        </div>
      </CardContent>
    </Card>
  );
}
