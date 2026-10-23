export type GameMode = 'coin_rush' | 'plinko' | 'slots' | 'vault' | 'history';

export interface GameHistoryEntry {
  id: string;
  timestamp: number;
  gameMode: GameMode;
  gameName: string;
  bet: number;
  multiplier: number;
  payout: number;
  profit: number;
  details: string;
  fairSeed: string;
}

export interface PlayerStats {
  totalWagered: number;
  totalWon: number;
  gamesPlayed: number;
  highestWin: number;
  highestMultiplier: number;
  longestStreak: number;
  currentStreak: number;
  netProfit: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  rewardCoins: number;
}
