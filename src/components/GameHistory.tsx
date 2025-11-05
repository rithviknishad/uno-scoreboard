import { Game } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Crown, Trophy, Medal } from '@phosphor-icons/react';
import { format } from 'date-fns';

interface GameHistoryProps {
  games: Game[];
}

export function GameHistory({ games }: GameHistoryProps) {
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
      return <Badge variant="secondary">Last</Badge>;
    }
    return <Badge variant="outline">Runner-up</Badge>;
  };

  const sortedGames = [...games].sort((a, b) => {
    return new Date(b.played_at).getTime() - new Date(a.played_at).getTime();
  });

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
      {sortedGames.map((game, gameIndex) => (
        <Card key={gameIndex} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">
              Game {sortedGames.length - gameIndex}
            </h3>
            <span className="text-sm text-muted-foreground">
              {format(new Date(game.played_at), 'MMM dd, yyyy • hh:mm a')}
            </span>
          </div>

          <div className="space-y-3">
            {game.players.map((username, playerIndex) => (
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
                {getPositionBadge(playerIndex, game.players.length)}
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
