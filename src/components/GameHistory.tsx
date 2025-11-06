import { useState, useMemo } from "react";
import { GameWithEloChanges } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Crown,
  Trophy,
  Medal,
  TrendUp,
  TrendDown,
  User,
  Check,
  X,
} from "@phosphor-icons/react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useQueryParams } from "@/hooks/use-query-params";

interface GameHistoryProps {
  games: GameWithEloChanges[];
}

export function GameHistory({ games }: GameHistoryProps) {
  const searchParams = useQueryParams();
  const [open, setOpen] = useState(false);

  const selectedPlayer = searchParams.get("player");

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  const getPositionBadge = (position: number, totalPlayers: number) => {
    if (position === 0) {
      return (
        <Badge className="bg-accent text-accent-foreground flex items-center gap-1">
          <Crown weight="fill" className="w-3 h-3" />
          Winner
        </Badge>
      );
    }
    if (position === totalPlayers - 1) {
      return <Badge variant="outline">Last</Badge>;
    }
    return <Badge variant="secondary">Runner-up</Badge>;
  };

  // Get unique players from all games
  const allPlayers = useMemo(() => {
    const playerSet = new Set<string>();
    games.forEach((game) => {
      game.players.forEach((player) => playerSet.add(player));
    });
    return Array.from(playerSet).sort();
  }, [games]);

  // Filter games by selected player
  const filteredGames = useMemo(() => {
    if (!selectedPlayer) return games;
    return games.filter((game) => game.players.includes(selectedPlayer));
  }, [games, selectedPlayer]);

  // Sort all games chronologically (oldest first) to establish consistent game numbers
  const allSortedGames = [...games].sort((a, b) => {
    return new Date(a.played_at).getTime() - new Date(b.played_at).getTime();
  });

  // Sort filtered games by most recent first for display
  const sortedGames = [...filteredGames].sort((a, b) => {
    return new Date(b.played_at).getTime() - new Date(a.played_at).getTime();
  });

  // Helper to get the game number from the full list (1-indexed, latest = highest)
  const getGameNumber = (game: GameWithEloChanges) => {
    return (
      allSortedGames.findIndex(
        (g) =>
          g.played_at === game.played_at &&
          g.players.join(",") === game.players.join(",")
      ) + 1
    );
  };

  const updatePlayerFilter = (player: string | null) => {
    const params = new URLSearchParams(window.location.search);

    if (player) {
      params.set("player", player);
    } else {
      params.delete("player");
    }

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.pushState({}, "", newUrl);
    window.dispatchEvent(new Event("popstate"));
  };

  if (games.length === 0) {
    return (
      <div className="text-center py-16">
        <Trophy className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Games Found</h3>
        <p className="text-muted-foreground">
          No games match the selected date range.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Player Filter */}
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[250px] justify-between"
            >
              <div className="flex items-center gap-2">
                {selectedPlayer ? (
                  <Avatar className="w-5 h-5">
                    <AvatarImage
                      src={`https://github.com/${selectedPlayer}.png`}
                      alt={selectedPlayer}
                    />
                    <AvatarFallback>
                      {getInitials(selectedPlayer)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <User className="w-4 h-4" />
                )}
                {selectedPlayer || "Filter by player..."}
              </div>
              {selectedPlayer && (
                <button
                  type="button"
                  className="ml-2 rounded-sm opacity-50 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    updatePlayerFilter(null);
                    setOpen(false);
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search players..." />
              <CommandList>
                <CommandEmpty>No player found.</CommandEmpty>
                <CommandGroup>
                  {allPlayers.map((player) => (
                    <CommandItem
                      key={player}
                      value={player}
                      onSelect={(currentValue) => {
                        updatePlayerFilter(
                          currentValue === selectedPlayer ? null : currentValue
                        );
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "w-4 h-4",
                          selectedPlayer === player
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <Avatar className="w-6 h-6">
                        <AvatarImage
                          src={`https://github.com/${player}.png`}
                          alt={player}
                        />
                        <AvatarFallback>{getInitials(player)}</AvatarFallback>
                      </Avatar>
                      {player}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {selectedPlayer && (
          <span className="text-sm text-muted-foreground">
            Showing {sortedGames.length} of {games.length} game
            {games.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Empty state for filtered results */}
      {sortedGames.length === 0 && (
        <div className="text-center py-16">
          <Trophy className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Games Found</h3>
          <p className="text-muted-foreground">
            No games found for player "{selectedPlayer}".
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => updatePlayerFilter(null)}
          >
            Clear Filter
          </Button>
        </div>
      )}

      {/* Game Cards */}
      {sortedGames.map((game, gameIndex) => (
        <Card key={gameIndex} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">
              Game #{getGameNumber(game)}
            </h3>
            <span className="text-sm text-muted-foreground">
              {format(new Date(game.played_at), "MMM dd, yyyy • hh:mm a")}
            </span>
          </div>

          <div className="space-y-3">
            {game.players.map((username, playerIndex) => {
              const eloChange = game.eloChanges[playerIndex];
              const isPositive = eloChange > 0;
              const isNegative = eloChange < 0;

              return (
                <div
                  key={playerIndex}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground w-6">
                      {playerIndex + 1}.
                    </span>
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={`https://github.com/${username}.png`}
                        alt={username}
                      />
                      <AvatarFallback>{getInitials(username)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{username}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex items-center gap-1 text-sm font-semibold tabular-nums ${
                        isPositive
                          ? "text-accent"
                          : isNegative
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }`}
                    >
                      {isPositive && (
                        <TrendUp className="w-4 h-4" weight="bold" />
                      )}
                      {isNegative && (
                        <TrendDown className="w-4 h-4" weight="bold" />
                      )}
                      <span>
                        {isPositive && "+"}
                        {Math.round(eloChange)}
                      </span>
                    </div>
                    {getPositionBadge(playerIndex, game.players.length)}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}
