import {
  Game,
  GameWithEloChanges,
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

// Elo rating constants
const INITIAL_ELO = 1500;
const K_FACTOR = 32;

/**
 * Calculate expected score for a player in Elo system
 * @param playerRating - Current player's Elo rating
 * @param opponentRating - Opponent's Elo rating
 * @returns Expected score (probability of winning) between 0 and 1
 */
function calculateExpectedScore(
  playerRating: number,
  opponentRating: number
): number {
  return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
}

/**
 * Calculate new Elo rating after a game
 * @param currentRating - Player's current Elo rating
 * @param expectedScore - Expected score from calculateExpectedScore
 * @param actualScore - Actual score (1 for win, 0.5 for draw/middle positions, 0 for loss)
 * @param kFactor - K-factor for rating adjustment (higher = more volatile)
 * @returns New Elo rating
 */
function calculateNewElo(
  currentRating: number,
  expectedScore: number,
  actualScore: number,
  kFactor: number = K_FACTOR
): number {
  return currentRating + kFactor * (actualScore - expectedScore);
}

/**
 * Calculate Elo ratings for all players based on game history
 * Games are processed in chronological order to simulate rating evolution
 */
function calculateEloRatings(games: Game[]): Map<string, number> {
  const eloRatings = new Map<string, number>();

  // Sort games chronologically
  const sortedGames = [...games].sort(
    (a, b) => new Date(a.played_at).getTime() - new Date(b.played_at).getTime()
  );

  sortedGames.forEach((game) => {
    const numPlayers = game.players.length;

    // Initialize ratings for new players
    game.players.forEach((username) => {
      if (!eloRatings.has(username)) {
        eloRatings.set(username, INITIAL_ELO);
      }
    });

    // Calculate average opponent rating for each player
    const currentRatings = game.players.map(
      (username) => eloRatings.get(username)!
    );
    const newRatings: number[] = [];

    game.players.forEach((username, index) => {
      const playerRating = currentRatings[index];

      // Calculate average rating of all opponents
      const opponentRatings = currentRatings.filter((_, i) => i !== index);
      const avgOpponentRating =
        opponentRatings.reduce((sum, r) => sum + r, 0) / opponentRatings.length;

      // Calculate expected score against average opponent
      const expectedScore = calculateExpectedScore(
        playerRating,
        avgOpponentRating
      );

      // Determine actual score based on placement
      let actualScore: number;
      if (index === 0) {
        // Winner gets full points
        actualScore = 1;
      } else if (index === numPlayers - 1) {
        // Last place gets 0 points
        actualScore = 0;
      } else {
        // Middle positions get partial points based on placement
        // Linear interpolation between 1 (first) and 0 (last)
        actualScore = 1 - index / (numPlayers - 1);
      }

      // Calculate new rating
      const newRating = calculateNewElo(
        playerRating,
        expectedScore,
        actualScore
      );
      newRatings.push(newRating);
    });

    // Update all ratings after processing the game
    game.players.forEach((username, index) => {
      eloRatings.set(username, newRatings[index]);
    });
  });

  return eloRatings;
}

/**
 * Calculate Elo rating changes for each player in each game
 * Returns games with their corresponding Elo changes
 */
export function calculateGamesWithEloChanges(
  games: Game[]
): GameWithEloChanges[] {
  const eloRatings = new Map<string, number>();

  // Sort games chronologically
  const sortedGames = [...games].sort(
    (a, b) => new Date(a.played_at).getTime() - new Date(b.played_at).getTime()
  );

  const gamesWithChanges: GameWithEloChanges[] = sortedGames.map((game) => {
    const numPlayers = game.players.length;

    // Initialize ratings for new players
    game.players.forEach((username) => {
      if (!eloRatings.has(username)) {
        eloRatings.set(username, INITIAL_ELO);
      }
    });

    // Calculate average opponent rating for each player
    const currentRatings = game.players.map(
      (username) => eloRatings.get(username)!
    );
    const newRatings: number[] = [];
    const eloChanges: number[] = [];

    game.players.forEach((username, index) => {
      const playerRating = currentRatings[index];

      // Calculate average rating of all opponents
      const opponentRatings = currentRatings.filter((_, i) => i !== index);
      const avgOpponentRating =
        opponentRatings.reduce((sum, r) => sum + r, 0) / opponentRatings.length;

      // Calculate expected score against average opponent
      const expectedScore = calculateExpectedScore(
        playerRating,
        avgOpponentRating
      );

      // Determine actual score based on placement
      let actualScore: number;
      if (index === 0) {
        // Winner gets full points
        actualScore = 1;
      } else if (index === numPlayers - 1) {
        // Last place gets 0 points
        actualScore = 0;
      } else {
        // Middle positions get partial points based on placement
        // Linear interpolation between 1 (first) and 0 (last)
        actualScore = 1 - index / (numPlayers - 1);
      }

      // Calculate new rating
      const newRating = calculateNewElo(
        playerRating,
        expectedScore,
        actualScore
      );
      newRatings.push(newRating);
      eloChanges.push(newRating - playerRating);
    });

    // Update all ratings after processing the game
    game.players.forEach((username, index) => {
      eloRatings.set(username, newRatings[index]);
    });

    return {
      ...game,
      eloChanges,
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

  // Calculate Elo ratings
  const eloRatings = calculateEloRatings(games);

  const playerStats: PlayerStats[] = Array.from(playerMap.entries()).map(
    ([username, stats]) => ({
      username,
      gamesPlayed: stats.gamesPlayed,
      wins: stats.wins,
      runnerUps: stats.runnerUps,
      losses: stats.losses,
      totalScore: stats.totalScore,
      winPercentage: (stats.totalScore / stats.gamesPlayed) * 100,
      eloRating: Math.round(eloRatings.get(username) || INITIAL_ELO),
      avatarUrl: `https://github.com/${username}.png`,
    })
  );

  // Sort by Elo rating (highest first), then by username for ties
  return playerStats.sort((a, b) => {
    if (b.eloRating !== a.eloRating) {
      return b.eloRating - a.eloRating;
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
