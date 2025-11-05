import { Game, PlayerStats, DateFilterPreset } from './types';
import { startOfDay, endOfDay, subDays, startOfWeek, startOfMonth, startOfYear } from 'date-fns';

export function calculatePlayerStats(games: Game[]): PlayerStats[] {
  const playerMap = new Map<string, {
    gamesPlayed: number;
    wins: number;
    runnerUps: number;
    losses: number;
    totalScore: number;
  }>();

  games.forEach((game) => {
    game.players.forEach((username, index) => {
      if (!playerMap.has(username)) {
        playerMap.set(username, {
          gamesPlayed: 0,
          wins: 0,
          runnerUps: 0,
          losses: 0,
          totalScore: 0,
        });
      }

      const stats = playerMap.get(username)!;
      stats.gamesPlayed += 1;

      if (index === 0) {
        stats.wins += 1;
        stats.totalScore += 1;
      } else if (index === game.players.length - 1) {
        stats.losses += 1;
      } else {
        stats.runnerUps += 1;
        stats.totalScore += 0.5;
      }
    });
  });

  const playerStats: PlayerStats[] = Array.from(playerMap.entries()).map(
    ([username, stats]) => ({
      username,
      gamesPlayed: stats.gamesPlayed,
      wins: stats.wins,
      runnerUps: stats.runnerUps,
      losses: stats.losses,
      totalScore: stats.totalScore,
      winPercentage: (stats.totalScore / stats.gamesPlayed) * 100,
      avatarUrl: `https://github.com/${username}.png`,
    })
  );

  return playerStats.sort((a, b) => {
    if (b.winPercentage !== a.winPercentage) {
      return b.winPercentage - a.winPercentage;
    }
    return a.username.localeCompare(b.username);
  });
}

export function filterGamesByDateRange(
  games: Game[],
  preset: DateFilterPreset,
  customStart?: Date,
  customEnd?: Date
): Game[] {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = endOfDay(now);

  switch (preset) {
    case 'today':
      startDate = startOfDay(now);
      break;
    case 'yesterday':
      startDate = startOfDay(subDays(now, 1));
      endDate = endOfDay(subDays(now, 1));
      break;
    case 'last-week':
      startDate = startOfWeek(subDays(now, 7), { weekStartsOn: 1 });
      break;
    case 'last-month':
      startDate = startOfMonth(subDays(now, 30));
      break;
    case 'last-year':
      startDate = startOfYear(subDays(now, 365));
      break;
    case 'custom':
      if (!customStart || !customEnd) return games;
      startDate = startOfDay(customStart);
      endDate = endOfDay(customEnd);
      break;
    case 'all-time':
    default:
      return games;
  }

  return games.filter((game) => {
    const gameDate = new Date(game.played_at);
    return gameDate >= startDate && gameDate <= endDate;
  });
}

export function getDateRangeLabel(
  preset: DateFilterPreset,
  customStart?: Date,
  customEnd?: Date
): string {
  switch (preset) {
    case 'today':
      return 'Today';
    case 'yesterday':
      return 'Yesterday';
    case 'last-week':
      return 'Last 7 Days';
    case 'last-month':
      return 'Last 30 Days';
    case 'last-year':
      return 'Last Year';
    case 'custom':
      if (customStart && customEnd) {
        return `${customStart.toLocaleDateString()} - ${customEnd.toLocaleDateString()}`;
      }
      return 'Custom Range';
    case 'all-time':
    default:
      return 'All Time';
  }
}
