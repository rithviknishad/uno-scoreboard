import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGameData } from "@/hooks/use-game-data";
import { useQueryParams } from "@/hooks/use-query-params";
import { DateFilter } from "@/components/DateFilter";
import { Leaderboard } from "@/components/Leaderboard";
import { GameHistory } from "@/components/GameHistory";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  calculatePlayerStats,
  filterGamesByDateRange,
  calculateGamesWithEloChanges,
} from "@/lib/stats";
import { Trophy, ListBullets, Heart } from "@phosphor-icons/react";

function App() {
  const { games, loading, error } = useGameData();
  const searchParams = useQueryParams();

  // Get date range from URL query params
  const since = searchParams.get("since");
  const till = searchParams.get("till");

  const filteredGames = useMemo(() => {
    return filterGamesByDateRange(games, since, till);
  }, [games, since, till]);

  const playerStats = useMemo(() => {
    return calculatePlayerStats(filteredGames);
  }, [filteredGames]);

  const gamesWithEloChanges = useMemo(() => {
    return calculateGamesWithEloChanges(filteredGames);
  }, [filteredGames]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-8">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <div className="text-destructive text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Error Loading Data</h2>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground mt-4">
            Make sure games.json exists in the public directory.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 tracking-tight">
              UNO Scoreboard
            </h1>
            <p className="text-muted-foreground">
              Track your UNO game statistics and rankings
            </p>
          </div>
          <ThemeToggle />
        </div>

        <Card className="p-6 mb-8">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Filter by Date
            </h2>
            <DateFilter since={since} till={till} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <div className="text-sm text-muted-foreground">Total Games</div>
              <div className="text-2xl font-bold tabular-nums">
                {filteredGames.length}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Players</div>
              <div className="text-2xl font-bold tabular-nums">
                {playerStats.length}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Top Player</div>
              <div className="text-base font-semibold truncate">
                {playerStats[0]?.username || "-"}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                Top Elo Rating
              </div>
              <div className="text-base font-semibold tabular-nums">
                {playerStats[0]?.eloRating || "-"}
              </div>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="leaderboard" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger
              value="leaderboard"
              className="flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <ListBullets className="w-4 h-4" />
              Game History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard">
            <Leaderboard players={playerStats} />
          </TabsContent>

          <TabsContent value="history">
            <GameHistory games={gamesWithEloChanges} />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="mt-16 pb-8 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart weight="fill" className="w-4 h-4 text-red-500" />
            <span>by</span>
            <a
              href="https://github.com/rithviknishad"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:underline transition-colors"
            >
              @rithviknishad
            </a>
          </div>
          <div className="text-sm">
            <a
              href="https://github.com/rithviknishad/uno-scoreboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground hover:underline transition-colors"
            >
              Contribute on GitHub
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
