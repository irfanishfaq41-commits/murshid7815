import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, ShieldAlert, Trophy, Lock, KeyRound } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { sound } from '../utils/audio';

const VAULT_FLOORS = [
  { floor: 1, multiplier: 1.4 },
  { floor: 2, multiplier: 2.1 },
  { floor: 3, multiplier: 3.2 },
  { floor: 4, multiplier: 5.0 },
  { floor: 5, multiplier: 8.5 },
  { floor: 6, multiplier: 15.0 },
  { floor: 7, multiplier: 30.0 },
  { floor: 8, multiplier: 75.0 },
];

export const VaultClimberGame: React.FC = () => {
  const { coins, betCoin, awardWin, recordLoss, claimEmergencyCoin } = useGame();

  const [currentFloor, setCurrentFloor] = useState<number>(0); // 0 = not started
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedDoor, setSelectedDoor] = useState<number | null>(null);
  const [revealedDoors, setRevealedDoors] = useState<('gold' | 'trap')[] | null>(null);
  const [isOpening, setIsOpening] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Insert 1 Coin to infiltrate the Vault!');

  const activeFloorData = currentFloor > 0 ? VAULT_FLOORS[currentFloor - 1] : null;
  const currentSafePayout = activeFloorData ? activeFloorData.multiplier : 0;
  const nextFloorData = currentFloor < VAULT_FLOORS.length ? VAULT_FLOORS[currentFloor] : null;

  const handleStartRun = () => {
    if (isPlaying) return;

    const ok = betCoin(1);
    if (!ok) return;

    setIsPlaying(true);
    setCurrentFloor(1);
    setSelectedDoor(null);
    setRevealedDoors(null);
    setStatusMessage('Floor 1: Pick 1 of 3 Vault Doors!');
  };

  const handlePickDoor = (doorIndex: number) => {
    if (!isPlaying || isOpening) return;

    setIsOpening(true);
    setSelectedDoor(doorIndex);
    sound.playClick();

    // 1 of 3 doors is a trap
    const trapIndex = Math.floor(Math.random() * 3);
    const doorsOutcome: ('gold' | 'trap')[] = [0, 1, 2].map(idx => (idx === trapIndex ? 'trap' : 'gold'));

    setTimeout(() => {
      setRevealedDoors(doorsOutcome);

      if (doorsOutcome[doorIndex] === 'gold') {
        // Safe! Cleared this floor
        const floorMultiplier = VAULT_FLOORS[currentFloor - 1].multiplier;
        sound.playWinChime(floorMultiplier);

        if (currentFloor === VAULT_FLOORS.length) {
          // Cleared entire vault!
          awardWin(floorMultiplier, floorMultiplier, 'vault', 'Vault Climber', `Master Heist! Cleared all 8 Floors (${floorMultiplier}x)`);
          setStatusMessage(`VAULT CONQUERED! Won +${floorMultiplier} Coins!`);
          sound.playJackpotFanfare();
          setIsPlaying(false);
          setIsOpening(false);
        } else {
          setStatusMessage(`Floor ${currentFloor} Cleared! (${floorMultiplier} Coins bankable) Advance or Cash Out!`);
          setTimeout(() => {
            setCurrentFloor(prev => prev + 1);
            setSelectedDoor(null);
            setRevealedDoors(null);
            setIsOpening(false);
          }, 1000);
        }
      } else {
        // Trap hit!
        recordLoss(1, 'vault', 'Vault Climber', `Tripped alarm on Floor ${currentFloor}`);
        sound.playLoss();
        setStatusMessage(`ALARM TRIPPED on Floor ${currentFloor}! Lost 1 coin.`);
        setIsPlaying(false);
        setIsOpening(false);
      }
    }, 700);
  };

  const handleCashout = () => {
    if (!isPlaying || isOpening || currentFloor <= 1) return;

    // Previous floor was securely cleared
    const safeFloorIndex = currentFloor - 2;
    if (safeFloorIndex < 0) return;

    const payout = VAULT_FLOORS[safeFloorIndex].multiplier;
    sound.playCashout();
    awardWin(payout, payout, 'vault', 'Vault Climber', `Cashed out at Floor ${currentFloor - 1} (${payout}x)`);
    setStatusMessage(`Cashed out safely! +${payout} Coins secured!`);
    setIsPlaying(false);
    setCurrentFloor(0);
    setSelectedDoor(null);
    setRevealedDoors(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Vault Interactive Chamber (Left) */}
      <div className="lg:col-span-8 space-y-6">
        <div className="relative rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 sm:p-8 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-amber-400" />
                <h3 className="font-display text-xl font-bold text-white">Vault Climber</h3>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Pick the safe doors to climb the 8-floor vault. Avoid the lockout trap!
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-neutral-400 block">Bankable Vault</span>
              <span className="font-mono text-xl font-extrabold text-amber-300 tabular-nums">
                {currentFloor > 1 ? `${VAULT_FLOORS[currentFloor - 2].multiplier} Coins` : '0 Coins'}
              </span>
            </div>
          </div>

          {/* Status Message */}
          <div className="text-center py-2 px-4 rounded-xl bg-neutral-950/60 border border-neutral-800 mb-6">
            <span className="text-sm font-semibold text-neutral-200">{statusMessage}</span>
          </div>

          {/* Active Floor Doors */}
          {isPlaying && (
            <div className="my-6">
              <div className="text-center mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Floor {currentFloor} of {VAULT_FLOORS.length} • Multiplier: {VAULT_FLOORS[currentFloor - 1].multiplier}x
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                {[0, 1, 2].map((doorIdx) => {
                  const isSelected = selectedDoor === doorIdx;
                  const outcome = revealedDoors ? revealedDoors[doorIdx] : null;

                  return (
                    <motion.button
                      key={doorIdx}
                      whileHover={{ scale: isOpening ? 1 : 1.03 }}
                      whileTap={{ scale: isOpening ? 1 : 0.97 }}
                      onClick={() => handlePickDoor(doorIdx)}
                      disabled={isOpening}
                      className={`h-40 rounded-xl border-2 flex flex-col items-center justify-center p-3 transition-all ${
                        outcome === 'gold'
                          ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/20'
                          : outcome === 'trap'
                          ? 'bg-rose-950/40 border-rose-500 text-rose-400 shadow-lg shadow-rose-500/20'
                          : isSelected
                          ? 'border-amber-400 bg-amber-950/30'
                          : 'border-neutral-700 bg-neutral-800/80 hover:border-amber-400/60 text-neutral-300'
                      }`}
                    >
                      {outcome === 'gold' ? (
                        <>
                          <ShieldCheck className="h-10 w-10 text-emerald-400 mb-2" />
                          <span className="font-bold text-xs uppercase">Safe Gold!</span>
                        </>
                      ) : outcome === 'trap' ? (
                        <>
                          <ShieldAlert className="h-10 w-10 text-rose-500 mb-2" />
                          <span className="font-bold text-xs uppercase">Trap!</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-8 w-8 text-neutral-400 mb-2" />
                          <span className="font-display font-bold text-xs uppercase tracking-wider">
                            Door {doorIdx + 1}
                          </span>
                        </>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Button Strip */}
          <div className="pt-6 border-t border-neutral-800 mt-6">
            {!isPlaying ? (
              coins < 1 ? (
                <button
                  onClick={claimEmergencyCoin}
                  className="w-full py-3.5 px-6 rounded-xl bg-amber-500 text-neutral-950 font-bold text-sm hover:bg-amber-400 transition-all"
                >
                  🪙 Claim Free 1 Coin & Enter Vault
                </button>
              ) : (
                <button
                  onClick={handleStartRun}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-display font-bold text-sm tracking-wide shadow-lg shadow-amber-500/25 transition-all"
                >
                  INSERT 1 COIN & START CLIMB
                </button>
              )
            ) : (
              <div className="flex items-center gap-4">
                <button
                  onClick={handleCashout}
                  disabled={isOpening || currentFloor <= 1}
                  className={`flex-1 py-3.5 px-6 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    isOpening || currentFloor <= 1
                      ? 'opacity-50 cursor-not-allowed bg-neutral-800 text-neutral-500'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-lg shadow-emerald-500/20'
                  }`}
                >
                  <Trophy className="h-4 w-4" />
                  <span>
                    CASHOUT SAFE COINS ({currentFloor > 1 ? `${VAULT_FLOORS[currentFloor - 2].multiplier} COINS` : '0'})
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tower Floors Visual Ladder (Right Column) */}
      <div className="lg:col-span-4 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
          <h4 className="font-display font-bold text-sm text-white">Vault Tower Floors</h4>
          <span className="text-xs text-neutral-400">8 Levels</span>
        </div>

        <div className="space-y-1.5 flex flex-col-reverse">
          {VAULT_FLOORS.map((f) => {
            const isCurrent = isPlaying && currentFloor === f.floor;
            const isCleared = isPlaying && currentFloor > f.floor;

            return (
              <div
                key={f.floor}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                  isCurrent
                    ? 'bg-amber-500/20 border border-amber-500 text-amber-300 font-bold shadow-md shadow-amber-500/10'
                    : isCleared
                    ? 'bg-emerald-950/20 text-emerald-400'
                    : 'text-neutral-500 bg-neutral-950/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] tabular-nums">Floor {f.floor}</span>
                  {f.floor === 8 && (
                    <span className="text-[10px] text-yellow-300 font-extrabold uppercase bg-yellow-500/20 px-1 rounded">
                      Grand Master
                    </span>
                  )}
                </div>
                <span className="font-mono font-bold tabular-nums">
                  {f.multiplier}x ({f.multiplier} Coins)
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-4 border-t border-neutral-800 text-xs text-neutral-400 leading-relaxed">
          <p>
            2 out of 3 doors per floor contain gold. Cash out after any cleared floor to keep your multiplied coins safe!
          </p>
        </div>
      </div>
    </div>
  );
};
