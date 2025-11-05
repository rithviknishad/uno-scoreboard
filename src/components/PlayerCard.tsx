import { PlayerStats } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Crown, Medal, Trophy } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

interface PlayerCardProps {
  player: PlayerStats;
  rank: number;
  index: number;
}

export function PlayerCard({ player, rank, index }: PlayerCardProps) {
  const getRankBadge = () => {
    if (rank === 1) {
      return (
        <Badge className="bg-accent text-accent-foreground flex items-center gap-1 text-sm font-bold">
          <Crown weight="fill" className="w-4 h-4" />
          #1
        </Badge>
      );
    }
    if (rank === 2) {
      return (
        <Badge className="bg-secondary text-secondary-foreground flex items-center gap-1 text-sm font-semibold">
          <Trophy weight="fill" className="w-4 h-4" />
          #2
        </Badge>
      );
    }
    if (rank === 3) {
      return (
        <Badge className="bg-primary text-primary-foreground flex items-center gap-1 text-sm font-semibold">
          <Medal weight="fill" className="w-4 h-4" />
          #3
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-sm font-medium">
        #{rank}
      </Badge>
    );
  };

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="p-6 hover:shadow-lg transition-shadow duration-200 relative overflow-hidden">
        {rank === 1 && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -z-10" />
        )}
        
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 ring-2 ring-border">
              <AvatarImage src={player.avatarUrl} alt={player.username} />
              <AvatarFallback>{getInitials(player.username)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-lg">{player.username}</h3>
              <p className="text-sm text-muted-foreground">
                {player.gamesPlayed} {player.gamesPlayed === 1 ? 'game' : 'games'}
              </p>
            </div>
          </div>
          {getRankBadge()}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Win Rate</span>
            <span className="text-2xl font-bold tabular-nums">
              {player.winPercentage.toFixed(1)}%
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 pt-2 border-t">
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Wins</div>
              <div className="text-lg font-bold tabular-nums text-primary">
                {player.wins}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Runner-up</div>
              <div className="text-lg font-bold tabular-nums text-secondary">
                {player.runnerUps}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Last</div>
              <div className="text-lg font-bold tabular-nums text-muted-foreground">
                {player.losses}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
