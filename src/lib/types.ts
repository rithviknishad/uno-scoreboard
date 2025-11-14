export interface Game {
  played_at: string;
  players: string[];
}

export interface GameWithRatingChanges extends Game {
  ratingChanges: number[];
}

export interface PlayerStats {
  username: string;
  gamesPlayed: number;
  wins: number;
  runnerUps: number;
  losses: number;
  totalScore: number;
  winPercentage: number;
  skillRating: number;
  avatarUrl: string;
}

export type DateFilterPreset = 'today' | 'yesterday' | 'last-week' | 'last-month' | 'last-year' | 'custom' | 'all-time';
