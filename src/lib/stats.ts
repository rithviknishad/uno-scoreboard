import {
  Game,
  GameWithRatingChanges,
  PlayerStats,
  DateFilterPreset,
} from "./types";
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  startOfMonth,
  startOfYear,
  format,
} from "date-fns";
import { rating, rate, ordinal, Rating } from "openskill";

/**
 * Calculate skill ratings for all players based on game history using OpenSkill (TrueSkill2)
 * Games are processed in chronological order to simulate rating evolution
 */
function calculateSkillRatings(games: Game[]): Map<string, Rating> {
  const skillRatings = new Map<string, Rating>();

  // Sort games chronologically
  const sortedGames = [...games].sort(
    (a, b) => new Date(a.played_at).getTime() - new Date(b.played_at).getTime()
  );

  sortedGames.forEach((game) => {
    // Initialize ratings for new players
    game.players.forEach((username) => {
      if (!skillRatings.has(username)) {
        skillRatings.set(username, rating());
      }
    });

    // Prepare teams (each player is their own team in UNO)
    const teams = game.players.map((username) => [skillRatings.get(username)!]);
    
    // Ranks based on placement (1 = winner, 2 = second, etc.)
    const ranks = game.players.map((_, index) => index + 1);

    // Calculate new ratings
    const newRatings = rate(teams, { rank: ranks });

    // Update all ratings after processing the game
    game.players.forEach((username, index) => {
      skillRatings.set(username, newRatings[index][0]);
    });
  });

  return skillRatings;
}

/**
 * Calculate skill rating changes for each player in each game
 * Returns games with their corresponding rating changes
 */
export function calculateGamesWithRatingChanges(
  games: Game[]
): GameWithRatingChanges[] {
  const skillRatings = new Map<string, Rating>();

  // Sort games chronologically
  const sortedGames = [...games].sort(
    (a, b) => new Date(a.played_at).getTime() - new Date(b.played_at).getTime()
  );

  const gamesWithChanges: GameWithRatingChanges[] = sortedGames.map((game) => {
    // Initialize ratings for new players
    game.players.forEach((username) => {
      if (!skillRatings.has(username)) {
        skillRatings.set(username, rating());
      }
    });

    // Store current conservative ratings before update
    const currentConservativeRatings = game.players.map((username) =>
      ordinal(skillRatings.get(username)!)
    );

    // Prepare teams (each player is their own team in UNO)
    const teams = game.players.map((username) => [skillRatings.get(username)!]);
    
    // Ranks based on placement (1 = winner, 2 = second, etc.)
    const ranks = game.players.map((_, index) => index + 1);

    // Calculate new ratings
    const newRatings = rate(teams, { rank: ranks });

    // Calculate rating changes (conservative estimate: μ - 3σ)
    const ratingChanges = game.players.map((username, index) => {
      const newConservativeRating = ordinal(newRatings[index][0]);
      return newConservativeRating - currentConservativeRatings[index];
    });

    // Update all ratings after processing the game
    game.players.forEach((username, index) => {
      skillRatings.set(username, newRatings[index][0]);
    });

    return {
      ...game,
      ratingChanges,
    };
  });

  return gamesWithChanges;
}

export function calculatePlayerStats(games: Game[]): PlayerStats[] {
  const playerMap = new Map<
    string,
    {
      gamesPlayed: number;
      wins: number;
      runnerUps: number;
      losses: number;
      totalScore: number;
    }
  >();

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

  // Calculate skill ratings using OpenSkill
  const skillRatings = calculateSkillRatings(games);

  const playerStats: PlayerStats[] = Array.from(playerMap.entries()).map(
    ([username, stats]) => ({
      username,
      gamesPlayed: stats.gamesPlayed,
      wins: stats.wins,
      runnerUps: stats.runnerUps,
      losses: stats.losses,
      totalScore: stats.totalScore,
      winPercentage: (stats.totalScore / stats.gamesPlayed) * 100,
      skillRating: Math.round(ordinal(skillRatings.get(username) || rating())),
      avatarUrl: `https://github.com/${username}.png`,
    })
  );

  // Sort by skill rating (highest first), then by username for ties
  return playerStats.sort((a, b) => {
    if (b.skillRating !== a.skillRating) {
      return b.skillRating - a.skillRating;
    }
    return a.username.localeCompare(b.username);
  });
}

/**
 * Calculate date range for a given preset
 * Returns YYYY-MM-DD date strings for since and till
 */
export function getDateRangeForPreset(preset: DateFilterPreset): {
  since: string | null;
  till: string | null;
} {
  const now = new Date();

  switch (preset) {
    case "today":
      return {
        since: format(startOfDay(now), "yyyy-MM-dd"),
        till: format(endOfDay(now), "yyyy-MM-dd"),
      };
    case "yesterday": {
      const yesterday = subDays(now, 1);
      return {
        since: format(startOfDay(yesterday), "yyyy-MM-dd"),
        till: format(endOfDay(yesterday), "yyyy-MM-dd"),
      };
    }
    case "last-week":
      return {
        since: format(startOfWeek(subDays(now, 7), { weekStartsOn: 1 }), "yyyy-MM-dd"),
        till: format(endOfDay(now), "yyyy-MM-dd"),
      };
    case "last-month":
      return {
        since: format(startOfMonth(subDays(now, 30)), "yyyy-MM-dd"),
        till: format(endOfDay(now), "yyyy-MM-dd"),
      };
    case "last-year":
      return {
        since: format(startOfYear(subDays(now, 365)), "yyyy-MM-dd"),
        till: format(endOfDay(now), "yyyy-MM-dd"),
      };
    case "all-time":
    default:
      return {
        since: null,
        till: null,
      };
  }
}

export function filterGamesByDateRange(
  games: Game[],
  since: string | null,
  till: string | null
): Game[] {
  // If no date filters, return all games
  if (!since && !till) {
    return games;
  }

  const startDate = since ? startOfDay(new Date(since)) : null;
  const endDate = till ? endOfDay(new Date(till)) : null;

  return games.filter((game) => {
    const gameDate = new Date(game.played_at);
    
    if (startDate && gameDate < startDate) {
      return false;
    }
    
    if (endDate && gameDate > endDate) {
      return false;
    }
    
    return true;
  });
}

export function getDateRangeLabel(
  preset: DateFilterPreset,
  customStart?: Date,
  customEnd?: Date
): string {
  switch (preset) {
    case "today":
      return "Today";
    case "yesterday":
      return "Yesterday";
    case "last-week":
      return "Last 7 Days";
    case "last-month":
      return "Last 30 Days";
    case "last-year":
      return "Last Year";
    case "custom":
      if (customStart && customEnd) {
        return `${customStart.toLocaleDateString()} - ${customEnd.toLocaleDateString()}`;
      }
      return "Custom Range";
    case "all-time":
    default:
      return "All Time";
  }
}
