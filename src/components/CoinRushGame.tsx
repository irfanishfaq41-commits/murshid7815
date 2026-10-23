import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, ArrowUpRight, Flame, ShieldAlert, Sparkles, RotateCcw } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { sound } from '../utils/audio';

type CoinSide = 'heads' | 'tails';
const MULTIPLIERS = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024];

export const CoinRushGame: React.FC = () => {
  const { coins, betCoin, awardWin, recordLoss, claimEmergencyCoin } = useGame();

  const [stepIndex, setStepIndex] = useState<number>(0); // 0 = not started / 1st bet
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [userChoice, setUserChoice] = useState<CoinSide | null>(null);
  const [coinResult, setCoinResult] = useState<CoinSide>('heads');
  const [roundStatus, setRoundStatus] = useState<'idle' | 'won_step' | 'lost' | 'cashed_out' | 'jackpot'>('idle');
  const [lastWinAmount, setLastWinAmount] = useState<number>(0);

  const currentMultiplier = stepIndex === 0 ? 1 : MULTIPLIERS[stepIndex - 1];
  const nextMultiplier = MULTIPLIERS[stepIndex];
  const currentPotentialPayout = stepIndex === 0 ? 0 : MULTIPLIERS[stepIndex - 1];

  const handleStartOrFlip = (choice: CoinSide) => {
    if (isFlipping) return;

    // If starting a fresh 1-coin run
    if (!isPlaying) {
      const ok = betCoin(1);
      if (!ok) return;
      setIsPlaying(true);
      setRoundStatus('idle');
    }

    setUserChoice(choice);
    setIsFlipping(true);
    sound.playCoinFlip();

    // 50/50 fair outcome
    const outcome: CoinSide = Math.random() < 0.5 ? 'heads' : 'tails';

    setTimeout(() => {
      setCoinResult(outcome);
      sound.playCoinLand();

      if (choice === outcome) {
        // Player won this step
        const newStep = stepIndex + 1;
        setStepIndex(newStep);

        if (newStep >= MULTIPLIERS.length) {
          // Mega Jackpot (1,024x)!
          const jackpotPayout = MULTIPLIERS[MULTIPLIERS.length - 1];
          awardWin(jackpotPayout, jackpotPayout, 'coin_rush', '1 Coin Rush', `Jackpot! Completed 10-step ladder (${jackpotPayout}x)`);
          setLastWinAmount(jackpotPayout);
          setRoundStatus('jackpot');
          setIsPlaying(false);
          setStepIndex(0);
        } else {
          setRoundStatus('won_step');
          sound.playWinChime(MULTIPLIERS[newStep - 1]);
        }
      } else {
        // Player lost
        recordLoss(1, 'coin_rush', '1 Coin Rush', `Fell at Step ${stepIndex + 1} (${MULTIPLIERS[stepIndex]}x attempt)`);
        setRoundStatus('lost');
        setIsPlaying(false);
        setStepIndex(0);
      }

      setIsFlipping(false);
    }, 1200);
  };

  const handleCashout = () => {
    if (!isPlaying || isFlipping || stepIndex === 0) return;

    sound.playCashout();
    const payout = currentPotentialPayout;
    awardWin(payout, currentMultiplier, 'coin_rush', '1 Coin Rush', `Cashed out at Step ${stepIndex} (${currentMultiplier}x)`);

    setLastWinAmount(payout);
    setRoundStatus('cashed_out');
    setIsPlaying(false);
    setStepIndex(0);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setStepIndex(0);
    setRoundStatus('idle');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Main Game Arena (Left / Center) */}
      <div className="lg:col-span-8 space-y-6">
        {/* Arena Surface */}
        <div className="relative rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 sm:p-8 backdrop-blur-xl overflow-hidden">
          {/* Subtle gold gradient accent on top edge */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xl font-bold tracking-tight text-white">
                  1 Coin Rush
                </span>
                <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Double or Nothing
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Insert 1 Coin. Guess Heads or Tails. Double your coins every step up to 1,024x!
              </p>
            </div>

            {/* Current Payout or Status */}
            <div className="text-right">
              <span className="text-xs text-neutral-400 block">Bankable Win</span>
              <span className="font-mono text-xl font-extrabold text-amber-300 tabular-nums">
                {currentPotentialPayout > 0 ? `${currentPotentialPayout} Coins` : '0 Coins'}
              </span>
            </div>
          </div>

          {/* Central 3D Coin Stage */}
          <div className="my-8 flex flex-col items-center justify-center min-h-[220px]">
            <div className="relative [perspective:1000px] flex items-center justify-center">
              {/* Coin Representation */}
              <div
                className={`relative w-40 h-40 rounded-full transition-transform duration-300 ${
                  isFlipping
                    ? userChoice === 'heads'
                      ? 'animate-flip-heads'
                      : 'animate-flip-tails'
                    : ''
                }`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Coin Front: HEADS */}
                <div
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 p-1.5 shadow-2xl shadow-amber-500/30 flex items-center justify-center border-4 border-yellow-200/60"
                  style={{
                    backfaceVisibility: coinResult === 'tails' && !isFlipping ? 'hidden' : 'visible',
                  }}
                >
                  <div className="w-full h-full rounded-full border-2 border-dashed border-amber-800/40 bg-gradient-to-tr from-amber-500 to-yellow-300 flex flex-col items-center justify-center text-neutral-950 font-black shadow-inner">
                    <span className="text-3xl">👑</span>
                    <span className="font-display text-lg font-black tracking-widest mt-0.5">HEADS</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-950/70">1 Coin</span>
                  </div>
                </div>

                {/* Coin Back: TAILS */}
                <div
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 p-1.5 shadow-2xl shadow-amber-500/30 flex items-center justify-center border-4 border-yellow-200/60"
                  style={{
                    transform: 'rotateY(180deg)',
                    backfaceVisibility: coinResult === 'heads' && !isFlipping ? 'hidden' : 'visible',
                  }}
                >
                  <div className="w-full h-full rounded-full border-2 border-dashed border-amber-800/40 bg-gradient-to-tr from-amber-500 to-yellow-300 flex flex-col items-center justify-center text-neutral-950 font-black shadow-inner">
                    <span className="text-3xl">⭐</span>
                    <span className="font-display text-lg font-black tracking-widest mt-0.5">TAILS</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-950/70">1 Coin</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status / Feedback Banner */}
            <div className="mt-6 text-center min-h-[32px]">
              <AnimatePresence mode="wait">
                {roundStatus === 'won_step' && (
                  <motion.div
                    key="won_step"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-semibold text-emerald-400 flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Step {stepIndex} Cleared! Current: {currentMultiplier}x ({currentPotentialPayout} Coins). Flip again or Cash Out!</span>
                  </motion.div>
                )}
                {roundStatus === 'cashed_out' && (
                  <motion.div
                    key="cashed_out"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-sm font-bold text-amber-300 flex items-center justify-center gap-1.5"
                  >
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Cashed out +{lastWinAmount} Coins safely to your vault!</span>
                  </motion.div>
                )}
                {roundStatus === 'jackpot' && (
                  <motion.div
                    key="jackpot"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-base font-extrabold text-amber-400 flex items-center justify-center gap-2"
                  >
                    <Trophy className="w-5 h-5 text-yellow-300" />
                    <span>JACKPOT MASTER! Won +{lastWinAmount} Coins on 1 single coin!</span>
                  </motion.div>
                )}
                {roundStatus === 'lost' && (
                  <motion.div
                    key="lost"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-medium text-rose-400 flex items-center justify-center gap-1.5"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Landed on the wrong side! Insert 1 Coin to climb again.</span>
                  </motion.div>
                )}
                {roundStatus === 'idle' && !isPlaying && (
                  <p className="text-xs text-neutral-400">
                    Choose Heads or Tails below to start with 1 Coin.
                  </p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Interactive Controls */}
          <div className="space-y-4 pt-2 border-t border-neutral-800">
            {coins < 1 && !isPlaying ? (
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 text-center">
                <p className="text-sm text-amber-200 font-medium mb-3">
                  Out of coins? Don't worry! 1 Coin Win always keeps you in the game.
                </p>
                <button
                  onClick={claimEmergencyCoin}
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 font-bold text-sm hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/25 transition-all"
                >
                  🪙 Claim Free 1 Coin & Continue
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Heads Choice Button */}
                <button
                  onClick={() => handleStartOrFlip('heads')}
                  disabled={isFlipping}
                  className={`group relative flex items-center justify-between p-4 rounded-xl border transition-all ${
                    isFlipping
                      ? 'opacity-60 cursor-not-allowed border-neutral-800 bg-neutral-900/50'
                      : 'border-neutral-700 bg-neutral-850 hover:border-amber-500 hover:bg-neutral-800 text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-xl border border-amber-500/20 group-hover:scale-105 transition-transform">
                      👑
                    </span>
                    <div className="text-left">
                      <span className="block font-display font-bold text-sm tracking-wide">
                        FLIP HEADS
                      </span>
                      <span className="block text-xs text-neutral-400">
                        {isPlaying ? `Aiming for ${nextMultiplier}x` : '1 Coin ➔ Win 2x'}
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-neutral-500 group-hover:text-amber-400 transition-colors" />
                </button>

                {/* Tails Choice Button */}
                <button
                  onClick={() => handleStartOrFlip('tails')}
                  disabled={isFlipping}
                  className={`group relative flex items-center justify-between p-4 rounded-xl border transition-all ${
                    isFlipping
                      ? 'opacity-60 cursor-not-allowed border-neutral-800 bg-neutral-900/50'
                      : 'border-neutral-700 bg-neutral-850 hover:border-amber-500 hover:bg-neutral-800 text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-xl border border-amber-500/20 group-hover:scale-105 transition-transform">
                      ⭐
                    </span>
                    <div className="text-left">
                      <span className="block font-display font-bold text-sm tracking-wide">
                        FLIP TAILS
                      </span>
                      <span className="block text-xs text-neutral-400">
                        {isPlaying ? `Aiming for ${nextMultiplier}x` : '1 Coin ➔ Win 2x'}
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-neutral-500 group-hover:text-amber-400 transition-colors" />
                </button>
              </div>
            )}

            {/* Cashout / Action Bar during active play */}
            {isPlaying && (
              <div className="flex items-center justify-between gap-4 pt-2">
                <button
                  onClick={handleCashout}
                  disabled={isFlipping || stepIndex === 0}
                  className={`flex-1 py-3 px-6 rounded-xl font-display font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    isFlipping || stepIndex === 0
                      ? 'opacity-50 cursor-not-allowed bg-neutral-800 text-neutral-400'
                      : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-neutral-950 shadow-lg shadow-emerald-500/20'
                  }`}
                >
                  <Trophy className="h-4 w-4" />
                  <span>CASHOUT NOW ({currentPotentialPayout} COINS)</span>
                </button>

                <button
                  onClick={handleReset}
                  disabled={isFlipping}
                  className="p-3 rounded-xl border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white transition-colors"
                  title="Abandon Round"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Side Ladder: 10-Step Multiplier Progression (Right Column) */}
      <div className="lg:col-span-4 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-amber-400" />
            <h3 className="font-display font-bold text-sm tracking-wide text-white">
              Multiplier Ladder
            </h3>
          </div>
          <span className="text-xs text-neutral-400">1 Coin Wager</span>
        </div>

        <div className="space-y-1.5">
          {MULTIPLIERS.map((mult, idx) => {
            const stepNum = idx + 1;
            const isCurrent = isPlaying && stepIndex === stepNum;
            const isPassed = isPlaying && stepIndex > stepNum;
            const isNext = isPlaying && stepIndex === stepNum - 1;
            const isJackpot = mult === 1024;

            return (
              <div
                key={mult}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                  isCurrent
                    ? 'bg-amber-500/20 border border-amber-500 text-amber-300 font-bold shadow-md shadow-amber-500/10'
                    : isPassed
                    ? 'bg-emerald-950/20 text-emerald-400 line-through opacity-70'
                    : isNext
                    ? 'bg-neutral-800/80 text-white font-medium border border-neutral-700'
                    : 'text-neutral-500 bg-neutral-900/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-neutral-400 tabular-nums">
                    Step {stepNum}
                  </span>
                  {isJackpot && (
                    <span className="text-[10px] text-yellow-300 font-extrabold uppercase tracking-wider bg-yellow-500/20 px-1 rounded">
                      Jackpot
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold tabular-nums">
                    {mult}x
                  </span>
                  <span className="text-neutral-400 text-[11px] tabular-nums">
                    ({mult} Coins)
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-800/80 text-xs text-neutral-400 leading-relaxed">
          <p>
            <strong className="text-neutral-300">Rules:</strong> Every correct coin flip doubles your coins. You can Cash Out at any step before flipping to keep your coins safe, or keep risking for the 1,024x jackpot.
          </p>
        </div>
      </div>
    </div>
  );
};
