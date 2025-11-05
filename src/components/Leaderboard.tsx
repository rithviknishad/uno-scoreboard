import { PlayerStats } from '@/lib/types';
import { PlayerCard } from './PlayerCard';
import { Trophy } from '@phosphor-icons/react';

interface LeaderboardProps {
  players: PlayerStats[];
}

export function Leaderboard({ players }: LeaderboardProps) {
  if (players.length === 0) {
    return (
      <div className="text-center py-16">
        <Trophy className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Players Found</h3>
        <p className="text-muted-foreground">
          No players have participated in games during the selected date range.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {players.map((player, index) => (
        <PlayerCard
          key={player.username}
          player={player}
          rank={index + 1}
          index={index}
        />
      ))}
    </div>
  );
}
