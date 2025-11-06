export interface Game {
  played_at: string;
  players: string[];
}

export interface GameWithEloChanges extends Game {
  eloChanges: number[];
}

export interface PlayerStats {
  username: string;
  gamesPlayed: number;
  wins: number;
  runnerUps: number;
  losses: number;
  totalScore: number;
  winPercentage: number;
  eloRating: number;
  avatarUrl: string;
}

export type DateFilterPreset = 'today' | 'yesterday' | 'last-week' | 'last-month' | 'last-year' | 'custom' | 'all-time';
