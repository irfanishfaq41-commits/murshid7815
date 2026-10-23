import React from 'react';
import { X, Trophy, CheckCircle2 } from 'lucide-react';
import { useGame } from '../context/GameContext';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose }) => {
  const { achievements, claimAchievement } = useGame();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Trophy className="h-5 w-5 text-amber-400" />
          <h3 className="font-display text-lg font-bold text-white">Achievements & Trophies</h3>
        </div>
        <p className="text-xs text-neutral-400 mb-6">
          Accomplish milestones to earn free reward coins for your bankroll.
        </p>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-colors ${
                ach.unlocked
                  ? 'bg-neutral-950/80 border-amber-500/30'
                  : 'bg-neutral-950/40 border-neutral-800/80 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{ach.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm text-neutral-100">
                      {ach.title}
                    </span>
                    {ach.unlocked && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">{ach.description}</p>
                </div>
              </div>

              <div>
                {ach.unlocked ? (
                  ach.rewardCoins > 0 ? (
                    <button
                      onClick={() => claimAchievement(ach.id)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-colors whitespace-nowrap"
                    >
                      Claim +{ach.rewardCoins}🪙
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-400 px-2 py-1 bg-emerald-950/40 rounded border border-emerald-500/20">
                      Claimed
                    </span>
                  )
                ) : (
                  <span className="text-xs text-neutral-500 font-mono">
                    +{ach.rewardCoins} Coins
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
