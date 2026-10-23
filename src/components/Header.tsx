import React from 'react';
import { Volume2, VolumeX, Sparkles, Plus } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { GameMode } from '../types/game';

interface HeaderProps {
  onOpenDailyBonus: () => void;
  onOpenAchievements: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenDailyBonus, onOpenAchievements }) => {
  const { coins, activeMode, setActiveMode, soundEnabled, toggleSound, claimEmergencyCoin } = useGame();

  const navItems: { id: GameMode; label: string }[] = [
    { id: 'coin_rush', label: 'Coin Flip' },
    { id: 'plinko', label: 'Plinko' },
    { id: 'slots', label: 'Triple Slots' },
    { id: 'vault', label: 'Vault Climber' },
    { id: 'history', label: 'Fairness & Log' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => setActiveMode('coin_rush')}
          className="flex items-center gap-2.5 text-left text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
        >
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-md shadow-amber-500/20">
            <span className="font-display font-black text-xs text-neutral-950">1W</span>
          </div>
          <span className="font-display font-extrabold tracking-wider bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
            1 COIN WIN
          </span>
        </button>

        {/* Zone 2: 4-5 single-line clean navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-400">
          {navItems.map((item) => {
            const isActive = activeMode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveMode(item.id)}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                  isActive
                    ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Balance & Primary Action Zone */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Quick Sound Toggle */}
          <button
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/80 text-neutral-400 hover:text-amber-400 hover:border-neutral-700 transition-colors"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-neutral-500" />}
          </button>

          {/* Daily Spin / Wheel Button */}
          <button
            onClick={onOpenDailyBonus}
            aria-label="Daily Lucky Spin"
            className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-lg border border-neutral-800 bg-neutral-900/80 text-xs font-medium text-neutral-300 hover:text-amber-400 hover:border-amber-500/40 transition-colors whitespace-nowrap shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Lucky Wheel</span>
          </button>

          {/* Bankroll Pill & Faucet */}
          <div className="flex items-center rounded-lg border border-amber-500/30 bg-gradient-to-r from-neutral-900 to-neutral-900/90 pl-3 pr-1 py-1">
            <div className="flex items-center gap-1.5 mr-2">
              <span className="text-amber-400 text-sm">🪙</span>
              <span className="font-mono text-sm font-bold tabular-nums text-amber-300">
                {coins.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider hidden sm:inline">
                Coins
              </span>
            </div>

            {/* Quick 1-Coin Emergency Faucet */}
            <button
              onClick={claimEmergencyCoin}
              title="Add 1 Free Golden Coin"
              className="flex items-center gap-1 h-7 px-2 rounded-md bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-neutral-950 font-semibold text-xs transition-all whitespace-nowrap shrink-0"
            >
              <Plus className="h-3 w-3" />
              <span>1 Coin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="flex md:hidden overflow-x-auto border-t border-neutral-800/60 px-4 py-2 gap-4 text-xs font-medium scrollbar-none">
        {navItems.map((item) => {
          const isActive = activeMode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveMode(item.id)}
              className={`whitespace-nowrap shrink-0 py-1 transition-colors ${
                isActive ? 'text-amber-400 font-semibold border-b border-amber-400' : 'text-neutral-400'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
