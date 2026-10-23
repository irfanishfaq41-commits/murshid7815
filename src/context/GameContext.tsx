import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { GameMode, GameHistoryEntry, PlayerStats, Achievement } from '../types/game';
import { sound } from '../utils/audio';

const STORAGE_KEY_COINS = 'one_coin_win_balance_v1';
const STORAGE_KEY_STATS = 'one_coin_win_stats_v1';
const STORAGE_KEY_HISTORY = 'one_coin_win_history_v1';
const STORAGE_KEY_SOUND = 'one_coin_win_sound_v1';
const STORAGE_KEY_ACHIEVEMENTS = 'one_coin_win_achievements_v1';

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_play', title: 'First Drop', description: 'Insert your very first 1 coin into any game', icon: '🪙', unlocked: false, rewardCoins: 1 },
  { id: 'double_up', title: 'Double Up', description: 'Win a 2x or higher multiplier', icon: '⚡', unlocked: false, rewardCoins: 2 },
  { id: 'streak_3', title: 'Lucky Streak', description: 'Reach a streak of 3 consecutive wins', icon: '🔥', unlocked: false, rewardCoins: 5 },
  { id: 'high_multiplier', title: 'Big Catch', description: 'Hit a 10x or higher payout in any mode', icon: '💎', unlocked: false, rewardCoins: 10 },
  { id: 'jackpot_hero', title: 'Arcade Legend', description: 'Hit a 50x+ mega multiplier!', icon: '👑', unlocked: false, rewardCoins: 25 },
  { id: 'coin_hoarder', title: 'Vault Stacker', description: 'Grow your bankroll to 50+ golden coins', icon: '🏆', unlocked: false, rewardCoins: 15 },
];

interface GameContextType {
  coins: number;
  stats: PlayerStats;
  history: GameHistoryEntry[];
  achievements: Achievement[];
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  toggleSound: () => void;
  betCoin: (amount?: number) => boolean;
  awardWin: (payout: number, multiplier: number, gameMode: GameMode, gameName: string, details: string) => void;
  recordLoss: (bet: number, gameMode: GameMode, gameName: string, details: string) => void;
  claimEmergencyCoin: () => void;
  addCoins: (amount: number, reason?: string) => void;
  resetAllData: () => void;
  activeMode: GameMode;
  setActiveMode: (mode: GameMode) => void;
  triggerConfetti: (intensity?: 'small' | 'medium' | 'jackpot') => void;
  claimAchievement: (id: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [coins, setCoins] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_COINS);
    return saved !== null ? Math.max(0, parseFloat(saved)) : 10;
  });

  const [activeMode, setActiveMode] = useState<GameMode>('coin_rush');

  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SOUND);
    return saved !== null ? saved === 'true' : true;
  });

  const [stats, setStats] = useState<PlayerStats>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_STATS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      totalWagered: 0,
      totalWon: 0,
      gamesPlayed: 0,
      highestWin: 0,
      highestMultiplier: 0,
      longestStreak: 0,
      currentStreak: 0,
      netProfit: 0,
    };
  });

  const [history, setHistory] = useState<GameHistoryEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [];
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ACHIEVEMENTS);
    if (saved) {
      try {
        const parsed: Achievement[] = JSON.parse(saved);
        // merge with initial in case new ones added
        return INITIAL_ACHIEVEMENTS.map(init => {
          const match = parsed.find(p => p.id === init.id);
          return match || init;
        });
      } catch {
        // fallback
      }
    }
    return INITIAL_ACHIEVEMENTS;
  });

  // Sync sound controller
  useEffect(() => {
    sound.enabled = soundEnabled;
    localStorage.setItem(STORAGE_KEY_SOUND, soundEnabled.toString());
  }, [soundEnabled]);

  // Persist state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COINS, coins.toString());
  }, [coins]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history.slice(0, 50)));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACHIEVEMENTS, JSON.stringify(achievements));
  }, [achievements]);

  const toggleSound = useCallback(() => {
    setSoundEnabledState(prev => !prev);
  }, []);

  const triggerConfetti = useCallback((intensity: 'small' | 'medium' | 'jackpot' = 'medium') => {
    if (typeof window === 'undefined') return;

    if (intensity === 'small') {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#F59E0B', '#FBBF24', '#FCD34D', '#10B981'],
      });
    } else if (intensity === 'jackpot') {
      const end = Date.now() + 2500;
      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6'],
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6'],
        });
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } else {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.65 },
        colors: ['#F59E0B', '#FBBF24', '#FFFFFF', '#10B981'],
      });
    }
  }, []);

  const unlockAchievement = useCallback((id: string) => {
    setAchievements(prev => {
      const found = prev.find(a => a.id === id);
      if (found && !found.unlocked) {
        sound.playJackpotFanfare();
        triggerConfetti('small');
        return prev.map(a => (a.id === id ? { ...a, unlocked: true, unlockedAt: Date.now() } : a));
      }
      return prev;
    });
  }, [triggerConfetti]);

  const claimAchievement = useCallback((id: string) => {
    setAchievements(prev => {
      const target = prev.find(a => a.id === id);
      if (target && target.unlocked && target.rewardCoins > 0) {
        setCoins(c => c + target.rewardCoins);
        sound.playCashout();
        return prev.map(a => a.id === id ? { ...a, rewardCoins: 0 } : a);
      }
      return prev;
    });
  }, []);

  const betCoin = useCallback((amount: number = 1): boolean => {
    if (coins < amount) {
      sound.playLoss();
      return false;
    }
    setCoins(prev => Math.max(0, Math.round((prev - amount) * 100) / 100));
    sound.playCoinInsert();

    setStats(prev => ({
      ...prev,
      totalWagered: Math.round((prev.totalWagered + amount) * 100) / 100,
      gamesPlayed: prev.gamesPlayed + 1,
    }));

    unlockAchievement('first_play');
    return true;
  }, [coins, unlockAchievement]);

  const generateSeed = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const awardWin = useCallback((
    payout: number,
    multiplier: number,
    gameMode: GameMode,
    gameName: string,
    details: string
  ) => {
    const roundedPayout = Math.round(payout * 100) / 100;
    const profit = Math.round((roundedPayout - 1) * 100) / 100;

    setCoins(prev => {
      const nextBalance = Math.round((prev + roundedPayout) * 100) / 100;
      if (nextBalance >= 50) {
        unlockAchievement('coin_hoarder');
      }
      return nextBalance;
    });

    if (multiplier >= 50) {
      sound.playJackpotFanfare();
      triggerConfetti('jackpot');
      unlockAchievement('jackpot_hero');
    } else if (multiplier >= 10) {
      sound.playJackpotFanfare();
      triggerConfetti('medium');
      unlockAchievement('high_multiplier');
    } else {
      sound.playWinChime(multiplier);
      if (multiplier >= 2) {
        unlockAchievement('double_up');
      }
    }

    setStats(prev => {
      const nextStreak = prev.currentStreak + 1;
      const longestStreak = Math.max(prev.longestStreak, nextStreak);
      if (nextStreak >= 3) {
        unlockAchievement('streak_3');
      }

      return {
        ...prev,
        totalWon: Math.round((prev.totalWon + roundedPayout) * 100) / 100,
        netProfit: Math.round((prev.netProfit + profit) * 100) / 100,
        highestWin: Math.max(prev.highestWin, roundedPayout),
        highestMultiplier: Math.max(prev.highestMultiplier, multiplier),
        currentStreak: nextStreak,
        longestStreak,
      };
    });

    const newEntry: GameHistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      gameMode,
      gameName,
      bet: 1,
      multiplier,
      payout: roundedPayout,
      profit,
      details,
      fairSeed: generateSeed(),
    };

    setHistory(prev => [newEntry, ...prev.slice(0, 49)]);
  }, [triggerConfetti, unlockAchievement]);

  const recordLoss = useCallback((
    bet: number,
    gameMode: GameMode,
    gameName: string,
    details: string
  ) => {
    sound.playLoss();
    setStats(prev => ({
      ...prev,
      currentStreak: 0,
      netProfit: Math.round((prev.netProfit - bet) * 100) / 100,
    }));

    const newEntry: GameHistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      gameMode,
      gameName,
      bet,
      multiplier: 0,
      payout: 0,
      profit: -bet,
      details,
      fairSeed: generateSeed(),
    };

    setHistory(prev => [newEntry, ...prev.slice(0, 49)]);
  }, []);

  const claimEmergencyCoin = useCallback(() => {
    setCoins(prev => Math.round((prev + 1) * 100) / 100);
    sound.playCashout();
    triggerConfetti('small');
  }, [triggerConfetti]);

  const addCoins = useCallback((amount: number) => {
    setCoins(prev => Math.round((prev + amount) * 100) / 100);
    sound.playCashout();
  }, []);

  const resetAllData = useCallback(() => {
    setCoins(10);
    setStats({
      totalWagered: 0,
      totalWon: 0,
      gamesPlayed: 0,
      highestWin: 0,
      highestMultiplier: 0,
      longestStreak: 0,
      currentStreak: 0,
      netProfit: 0,
    });
    setHistory([]);
    setAchievements(INITIAL_ACHIEVEMENTS);
    localStorage.removeItem(STORAGE_KEY_COINS);
    localStorage.removeItem(STORAGE_KEY_STATS);
    localStorage.removeItem(STORAGE_KEY_HISTORY);
    localStorage.removeItem(STORAGE_KEY_ACHIEVEMENTS);
  }, []);

  return (
    <GameContext.Provider
      value={{
        coins,
        stats,
        history,
        achievements,
        soundEnabled,
        setSoundEnabled: setSoundEnabledState,
        toggleSound,
        betCoin,
        awardWin,
        recordLoss,
        claimEmergencyCoin,
        addCoins,
        resetAllData,
        activeMode,
        setActiveMode,
        triggerConfetti,
        claimAchievement,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
