import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { sound } from '../utils/audio';

interface DailyWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SEGMENTS = [
  { coins: 1, label: '+1 Coin', color: '#1E293B', textColor: '#F1F5F9' },
  { coins: 2, label: '+2 Coins', color: '#334155', textColor: '#F1F5F9' },
  { coins: 5, label: '+5 Coins', color: '#B45309', textColor: '#FEF08A' },
  { coins: 3, label: '+3 Coins', color: '#1E293B', textColor: '#F1F5F9' },
  { coins: 10, label: '+10 Coins', color: '#047857', textColor: '#A7F3D0' },
  { coins: 1, label: '+1 Coin', color: '#334155', textColor: '#F1F5F9' },
  { coins: 25, label: '+25 Coins', color: '#6D28D9', textColor: '#DDD6FE' },
  { coins: 50, label: '★ +50 Coins ★', color: '#D97706', textColor: '#FEF08A' },
];

export const DailyWheelModal: React.FC<DailyWheelModalProps> = ({ isOpen, onClose }) => {
  const { addCoins, triggerConfetti } = useGame();
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [wonPrize, setWonPrize] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleSpinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setWonPrize(null);
    sound.playCoinFlip();

    // Random segment index
    const segmentIndex = Math.floor(Math.random() * SEGMENTS.length);
    const segmentAngle = 360 / SEGMENTS.length;
    // 5 full rotations + segment offset
    const randomExtraRounds = 5 * 360;
    const targetAngle = randomExtraRounds + (SEGMENTS.length - 1 - segmentIndex) * segmentAngle + segmentAngle / 2;

    setRotation(prev => prev + targetAngle);

    setTimeout(() => {
      setIsSpinning(false);
      const prize = SEGMENTS[segmentIndex].coins;
      setWonPrize(prize);
      addCoins(prize, 'Lucky Wheel Prize');
      sound.playJackpotFanfare();
      triggerConfetti(prize >= 25 ? 'jackpot' : 'medium');
    }, 3200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSpinning}
          className="absolute right-4 top-4 p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Lucky Wheel Bonus</span>
          </div>
          <h3 className="font-display text-xl font-bold text-white">Daily Coin Wheel</h3>
          <p className="text-xs text-neutral-400 mt-1">
            Spin the golden wheel for free coins to fuel your 1-coin adventures!
          </p>
        </div>

        {/* Wheel Viewport */}
        <div className="relative flex flex-col items-center justify-center my-6">
          {/* Needle / Ticker */}
          <div className="absolute top-0 z-20 -mt-2 w-0 h-0 border-x-8 border-x-transparent border-t-[16px] border-t-amber-400 filter drop-shadow-md" />

          {/* Wheel Disc */}
          <div
            className="w-64 h-64 rounded-full border-4 border-amber-500/80 shadow-2xl overflow-hidden relative transition-all duration-[3200ms] ease-out flex items-center justify-center"
            style={{
              transform: `rotate(${rotation}deg)`,
              background: 'conic-gradient(from 0deg, #1E293B 0deg 45deg, #334155 45deg 90deg, #B45309 90deg 135deg, #1E293B 135deg 180deg, #047857 180deg 225deg, #334155 225deg 270deg, #6D28D9 270deg 315deg, #D97706 315deg 360deg)',
            }}
          >
            {/* Center Hub */}
            <div className="w-16 h-16 rounded-full bg-neutral-950 border-2 border-amber-400 shadow-md flex items-center justify-center z-10">
              <span className="font-display font-black text-amber-400 text-xs">1 WIN</span>
            </div>
          </div>
        </div>

        {/* Won Prize Notice */}
        {wonPrize !== null && (
          <div className="mb-4 text-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <span className="text-xs font-semibold text-neutral-300">You Won</span>
            <div className="font-mono text-xl font-extrabold text-amber-300 tabular-nums">
              +{wonPrize} Golden Coins!
            </div>
          </div>
        )}

        {/* Spin CTA */}
        <button
          onClick={handleSpinWheel}
          disabled={isSpinning}
          className={`w-full py-3.5 px-6 rounded-xl font-display font-bold text-sm tracking-wide uppercase transition-all flex items-center justify-center gap-2 ${
            isSpinning
              ? 'opacity-60 cursor-not-allowed bg-neutral-800 text-neutral-400'
              : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 shadow-lg shadow-amber-500/25'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{isSpinning ? 'SPINNING WHEEL...' : 'SPIN FOR FREE COINS'}</span>
        </button>
      </div>
    </div>
  );
};
