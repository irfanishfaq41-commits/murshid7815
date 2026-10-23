import React, { useState } from 'react';
import { Trophy, Sparkles, HelpCircle } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { sound } from '../utils/audio';

interface SlotSymbol {
  id: string;
  name: string;
  icon: string;
  multiplier: number; // for 3 of a kind
}

const SYMBOLS: SlotSymbol[] = [
  { id: 'coin', name: '1 Coin Gold', icon: '🪙', multiplier: 250 },
  { id: 'seven', name: 'Lucky 7', icon: '7️⃣', multiplier: 100 },
  { id: 'diamond', name: 'Diamond', icon: '💎', multiplier: 50 },
  { id: 'bell', name: 'Golden Bell', icon: '🔔', multiplier: 25 },
  { id: 'lemon', name: 'Lemon', icon: '🍋', multiplier: 10 },
  { id: 'cherry', name: 'Cherry', icon: '🍒', multiplier: 6 },
];

export const SlotsGame: React.FC = () => {
  const { coins, betCoin, awardWin, recordLoss, claimEmergencyCoin } = useGame();

  const [reels, setReels] = useState<SlotSymbol[]>([
    SYMBOLS[0], // 🪙
    SYMBOLS[0], // 🪙
    SYMBOLS[0], // 🪙
  ]);
  const [spinningReels, setSpinningReels] = useState<[boolean, boolean, boolean]>([false, false, false]);
  const [lastWinText, setLastWinText] = useState<string | null>(null);
  const [lastMultiplier, setLastMultiplier] = useState<number>(0);

  const isSpinning = spinningReels.some(s => s);

  const handleSpin = () => {
    if (isSpinning) return;

    const ok = betCoin(1);
    if (!ok) return;

    setLastWinText(null);
    setLastMultiplier(0);
    setSpinningReels([true, true, true]);

    // Fast sound ticking
    const tickInterval = setInterval(() => {
      sound.playReelTick();
    }, 110);

    // Pick outcomes
    // Weighted probabilities
    const pickRandomSymbol = (): SlotSymbol => {
      const rand = Math.random();
      if (rand < 0.03) return SYMBOLS[0]; // 🪙 Gold Coin (3%)
      if (rand < 0.08) return SYMBOLS[1]; // 7️⃣ (5%)
      if (rand < 0.16) return SYMBOLS[2]; // 💎 (8%)
      if (rand < 0.28) return SYMBOLS[3]; // 🔔 (12%)
      if (rand < 0.52) return SYMBOLS[4]; // 🍋 (24%)
      return SYMBOLS[5]; // 🍒 Cherry (48%)
    };

    const finalReels: SlotSymbol[] = [
      pickRandomSymbol(),
      pickRandomSymbol(),
      pickRandomSymbol(),
    ];

    // Reel 1 stops at 700ms
    setTimeout(() => {
      setSpinningReels(prev => [false, prev[1], prev[2]]);
      setReels(prev => [finalReels[0], prev[1], prev[2]]);
      sound.playReelStop();
    }, 700);

    // Reel 2 stops at 1200ms
    setTimeout(() => {
      setSpinningReels(prev => [false, false, prev[2]]);
      setReels(prev => [finalReels[0], finalReels[1], prev[2]]);
      sound.playReelStop();
    }, 1200);

    // Reel 3 stops at 1800ms
    setTimeout(() => {
      clearInterval(tickInterval);
      setSpinningReels([false, false, false]);
      setReels(finalReels);
      sound.playReelStop();

      // Evaluate win
      const [r1, r2, r3] = finalReels;

      if (r1.id === r2.id && r2.id === r3.id) {
        // 3 of a kind!
        const mult = r1.multiplier;
        awardWin(mult, mult, 'slots', 'Triple Slots', `Triple ${r1.name} match (${mult}x)`);
        setLastMultiplier(mult);
        setLastWinText(`Triple ${r1.name}! Won +${mult} Coins!`);
      } else if (r1.id === r2.id || r2.id === r3.id || r1.id === r3.id) {
        // Pair
        const matched = r1.id === r2.id ? r1 : r3;
        const pairMult = matched.id === 'cherry' ? 3 : 2;
        awardWin(pairMult, pairMult, 'slots', 'Triple Slots', `Pair of ${matched.name} (${pairMult}x)`);
        setLastMultiplier(pairMult);
        setLastWinText(`Pair of ${matched.name}! Won +${pairMult} Coins!`);
      } else if (r1.id === 'cherry' || r2.id === 'cherry' || r3.id === 'cherry') {
        // Single cherry safety win
        awardWin(1.5, 1.5, 'slots', 'Triple Slots', 'Single Cherry Safety Win (1.5x)');
        setLastMultiplier(1.5);
        setLastWinText('Single Cherry! Won +1.5 Coins!');
      } else {
        // Loss
        recordLoss(1, 'slots', 'Triple Slots', 'No matching line');
        setLastWinText('No match this spin. Pull again!');
      }
    }, 1800);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Slot Machine Chassis (Left) */}
      <div className="lg:col-span-8 space-y-6">
        <div className="relative rounded-3xl border-2 border-neutral-800 bg-gradient-to-b from-neutral-900 via-neutral-925 to-neutral-950 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          {/* Top Marquee */}
          <div className="text-center pb-6 border-b border-neutral-800/80">
            <span className="font-display text-2xl sm:text-3xl font-black tracking-widest bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent uppercase">
              1 COIN TRIPLE GOLD
            </span>
            <p className="text-xs text-neutral-400 mt-1">
              Insert 1 Golden Coin • Spin to Match • Up to 250x Triple Jackpot!
            </p>
          </div>

          {/* Three Mechanical Reels Frame */}
          <div className="my-8 relative flex items-center justify-center">
            {/* Payline Guides */}
            <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-[2px] bg-amber-500/30 z-20 pointer-events-none" />

            <div className="grid grid-cols-3 gap-3 sm:gap-6 w-full max-w-lg p-4 rounded-2xl bg-neutral-950 border-4 border-neutral-800 shadow-inner">
              {reels.map((symbol, idx) => {
                const isReelSpinning = spinningReels[idx];
                return (
                  <div
                    key={idx}
                    className="relative h-36 sm:h-44 rounded-xl bg-gradient-to-b from-neutral-900 via-neutral-850 to-neutral-900 border border-neutral-800 flex flex-col items-center justify-center overflow-hidden shadow-inner"
                  >
                    {/* Shadow overlay for cylindrical 3D reel curve effect */}
                    <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10" />
                    <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-10" />

                    {isReelSpinning ? (
                      <div className="flex flex-col items-center gap-6 animate-pulse opacity-70">
                        <span className="text-3xl sm:text-4xl filter blur-[1px]">🍋</span>
                        <span className="text-4xl sm:text-5xl filter blur-[1px]">💎</span>
                        <span className="text-3xl sm:text-4xl filter blur-[1px]">🔔</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-2">
                        <span className="text-4xl sm:text-5xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
                          {symbol.icon}
                        </span>
                        <span className="font-display font-bold text-xs sm:text-sm text-neutral-200 mt-2 tracking-wide">
                          {symbol.name}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Result / Win feedback */}
          <div className="min-h-[28px] text-center mb-6">
            {lastWinText && (
              <span
                className={`text-sm font-bold inline-flex items-center gap-1.5 ${
                  lastMultiplier > 0 ? 'text-amber-300' : 'text-neutral-400'
                }`}
              >
                {lastMultiplier > 0 && <Trophy className="h-4 w-4 text-amber-400" />}
                {lastWinText}
              </span>
            )}
          </div>

          {/* Spin / Action Area */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-neutral-800">
            {coins < 1 && !isSpinning ? (
              <button
                onClick={claimEmergencyCoin}
                className="w-full py-3.5 px-6 rounded-xl bg-amber-500 text-neutral-950 font-display font-bold text-sm hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition-all"
              >
                🪙 Claim Free 1 Coin & Spin
              </button>
            ) : (
              <button
                onClick={handleSpin}
                disabled={isSpinning}
                className={`w-full py-4 px-8 rounded-xl font-display font-extrabold text-base tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
                  isSpinning
                    ? 'opacity-60 cursor-not-allowed bg-neutral-800 text-neutral-400'
                    : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 shadow-xl shadow-amber-500/30'
                }`}
              >
                <Sparkles className="h-5 w-5" />
                <span>{isSpinning ? 'REELS SPINNING...' : 'INSERT 1 COIN & SPIN'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Paytable (Right Column) */}
      <div className="lg:col-span-4 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-amber-400" />
            <h3 className="font-display font-bold text-sm text-white">1-Coin Paytable</h3>
          </div>
          <span className="text-xs text-neutral-400">Fixed Rates</span>
        </div>

        <div className="space-y-2 text-xs">
          {SYMBOLS.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-850 hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">{s.icon}</span>
                <span className="font-medium text-neutral-300">3x {s.name}</span>
              </div>
              <span className="font-mono font-bold text-amber-300 tabular-nums">
                {s.multiplier}x ({s.multiplier} Coins)
              </span>
            </div>
          ))}

          <div className="p-2.5 rounded-lg bg-neutral-950/40 border border-neutral-850 text-neutral-400 flex items-center justify-between">
            <span>Any 2 Matching Symbols</span>
            <span className="font-mono font-bold text-neutral-300 tabular-nums">2x–3x</span>
          </div>

          <div className="p-2.5 rounded-lg bg-neutral-950/40 border border-neutral-850 text-neutral-400 flex items-center justify-between">
            <span>Any Single Cherry (🍒)</span>
            <span className="font-mono font-bold text-emerald-400 tabular-nums">1.5x</span>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-neutral-800/80 text-xs text-neutral-400 leading-relaxed">
          <p>
            Hit 3 identical symbols along the center payline to collect the grand prize. Every spin costs precisely 1 golden coin.
          </p>
        </div>
      </div>
    </div>
  );
};
