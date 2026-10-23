import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Header } from './components/Header';
import { CoinRushGame } from './components/CoinRushGame';
import { PlinkoGame } from './components/PlinkoGame';
import { SlotsGame } from './components/SlotsGame';
import { VaultClimberGame } from './components/VaultClimberGame';
import { HistoryAndFairnessView } from './components/HistoryAndFairnessView';
import { DailyWheelModal } from './components/DailyWheelModal';
import { AchievementsModal } from './components/AchievementsModal';
import { Trophy, Sparkles, Flame, ShieldCheck, ArrowRight, Coins } from 'lucide-react';
import coinEmblemImg from './assets/images/coin_win_gold_emblem_1792778094552.jpg';

const MainAppContent: React.FC = () => {
  const { activeMode, setActiveMode, coins, stats, claimEmergencyCoin } = useGame();
  const [dailyBonusOpen, setDailyBonusOpen] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#0c0d10] text-neutral-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Bar following 3-Zone Top Bar Contract */}
      <Header
        onOpenDailyBonus={() => setDailyBonusOpen(true)}
        onOpenAchievements={() => setAchievementsOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Hero Section */}
        <div className="relative rounded-3xl border border-neutral-800/80 bg-gradient-to-br from-neutral-900/90 via-neutral-900/40 to-neutral-950 p-6 sm:p-8 overflow-hidden backdrop-blur-md">
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Column: Mission & Controls */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400">
                <span className="text-amber-400 font-bold uppercase tracking-wider">Arcade Precision</span>
                <span aria-hidden="true">·</span>
                <span>Deterministic Fairness</span>
                <span aria-hidden="true">·</span>
                <span>Fixed 1-Coin Stakes</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight [text-wrap:balance]">
                Turn <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">1 Golden Coin</span> into a Legendary Fortune
              </h1>

              <p className="text-sm sm:text-base text-neutral-300 max-w-2xl leading-relaxed">
                Step into the premier single-coin challenge. Choose your game, wager exactly 1 golden coin, and climb multipliers up to 1,024x across Coin Flip Rush, Plinko Drop, Triple Slots, and the 8-floor Vault.
              </p>

              {/* Mode Selector Tab Strip */}
              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveMode('coin_rush')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    activeMode === 'coin_rush'
                      ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20'
                      : 'bg-neutral-850 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Coin Flip Rush (1024x)</span>
                </button>

                <button
                  onClick={() => setActiveMode('plinko')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    activeMode === 'plinko'
                      ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20'
                      : 'bg-neutral-850 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Plinko Drop (100x)</span>
                </button>

                <button
                  onClick={() => setActiveMode('slots')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    activeMode === 'slots'
                      ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20'
                      : 'bg-neutral-850 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Triple Slots (250x)</span>
                </button>

                <button
                  onClick={() => setActiveMode('vault')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    activeMode === 'vault'
                      ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20'
                      : 'bg-neutral-850 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Vault Climber (75x)</span>
                </button>

                <button
                  onClick={() => setActiveMode('history')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    activeMode === 'history'
                      ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20'
                      : 'bg-neutral-850 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                  }`}
                >
                  <span>Fairness & Log</span>
                </button>
              </div>
            </div>

            {/* Right Column: Hero Visual Token with 1-WIN Emblem */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center">
              <div className="relative group cursor-pointer" onClick={() => setDailyBonusOpen(true)}>
                <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden border border-amber-500/40 shadow-2xl shadow-amber-500/20 bg-neutral-950">
                  <img
                    src={coinEmblemImg}
                    alt="1 Coin Win official golden token asset"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent flex items-end justify-center pb-2.5">
                    <span className="text-[11px] font-bold tracking-wider uppercase text-amber-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Lucky Wheel Ready</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-neutral-800/80 bg-neutral-900/40 flex items-center justify-between">
            <div>
              <span className="text-xs text-neutral-400 block">Bankroll</span>
              <span className="font-mono text-xl font-bold text-amber-300 tabular-nums">
                {coins} Coins
              </span>
            </div>
            <button
              onClick={claimEmergencyCoin}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20"
              title="Add 1 Coin to balance"
            >
              +1 Free
            </button>
          </div>

          <div className="p-4 rounded-xl border border-neutral-800/80 bg-neutral-900/40">
            <span className="text-xs text-neutral-400 block">Best Multiplier</span>
            <span className="font-mono text-xl font-bold text-white tabular-nums">
              {stats.highestMultiplier > 0 ? `${stats.highestMultiplier}x` : '—'}
            </span>
          </div>

          <div className="p-4 rounded-xl border border-neutral-800/80 bg-neutral-900/40">
            <span className="text-xs text-neutral-400 block">Total Games</span>
            <span className="font-mono text-xl font-bold text-white tabular-nums">
              {stats.gamesPlayed}
            </span>
          </div>

          <div className="p-4 rounded-xl border border-neutral-800/80 bg-neutral-900/40 flex items-center justify-between">
            <div>
              <span className="text-xs text-neutral-400 block">Trophies</span>
              <span className="font-mono text-xl font-bold text-amber-400 tabular-nums">
                {stats.longestStreak > 0 ? `${stats.longestStreak} Streak` : '0'}
              </span>
            </div>
            <button
              onClick={() => setAchievementsOpen(true)}
              className="text-xs text-neutral-300 hover:text-amber-300 p-1.5 rounded-lg bg-neutral-800 border border-neutral-700"
              title="View Trophies"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>
        </div>

        {/* Active Game Mode Surface */}
        <div className="mt-8">
          {activeMode === 'coin_rush' && <CoinRushGame />}
          {activeMode === 'plinko' && <PlinkoGame />}
          {activeMode === 'slots' && <SlotsGame />}
          {activeMode === 'vault' && <VaultClimberGame />}
          {activeMode === 'history' && <HistoryAndFairnessView />}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-neutral-800/80 bg-neutral-950/80 py-8 text-neutral-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold text-neutral-200">1 COIN WIN</span>
            <span aria-hidden="true">·</span>
            <span>Single Coin Arcade Gaming</span>
            <span aria-hidden="true">·</span>
            <span>100% Free-to-Play Simulator</span>
          </div>

          <div className="flex items-center gap-4 text-neutral-400">
            <button
              onClick={() => setDailyBonusOpen(true)}
              className="hover:text-amber-400 transition-colors"
            >
              Daily Spin
            </button>
            <button
              onClick={() => setAchievementsOpen(true)}
              className="hover:text-amber-400 transition-colors"
            >
              Achievements
            </button>
            <button
              onClick={() => setActiveMode('history')}
              className="hover:text-amber-400 transition-colors"
            >
              Provably Fair
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DailyWheelModal
        isOpen={dailyBonusOpen}
        onClose={() => setDailyBonusOpen(false)}
      />

      <AchievementsModal
        isOpen={achievementsOpen}
        onClose={() => setAchievementsOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <MainAppContent />
    </GameProvider>
  );
}
