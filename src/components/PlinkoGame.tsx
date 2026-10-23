import React, { useRef, useState, useEffect } from 'react';
import { Sparkles, Trophy, Settings2 } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { sound } from '../utils/audio';

type RiskLevel = 'low' | 'medium' | 'high';

interface BucketConfig {
  multipliers: number[];
  colors: string[];
}

const RISK_CONFIGS: Record<RiskLevel, BucketConfig> = {
  low: {
    multipliers: [10, 2, 1.4, 0.8, 0.5, 0.8, 1.4, 2, 10],
    colors: ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#64748B', '#10B981', '#F59E0B', '#F97316', '#EF4444'],
  },
  medium: {
    multipliers: [25, 6, 1.8, 0.5, 0.2, 0.5, 1.8, 6, 25],
    colors: ['#DC2626', '#EA580C', '#D97706', '#059669', '#475569', '#059669', '#D97706', '#EA580C', '#DC2626'],
  },
  high: {
    multipliers: [100, 20, 3, 0.3, 0, 0.3, 3, 20, 100],
    colors: ['#991B1B', '#C2410C', '#B45309', '#047857', '#334155', '#047857', '#B45309', '#C2410C', '#991B1B'],
  },
};

interface ParticleCoin {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  active: boolean;
  history: { x: number; y: number }[];
  bucketLanded?: number;
}

interface Peg {
  x: number;
  y: number;
  hitTimer: number;
}

export const PlinkoGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { coins, betCoin, awardWin, recordLoss, claimEmergencyCoin } = useGame();

  const [risk, setRisk] = useState<RiskLevel>('medium');
  const [dropPosition, setDropPosition] = useState<number>(2); // 0 to 4
  const [isDropping, setIsDropping] = useState<boolean>(false);
  const [lastWin, setLastWin] = useState<{ multiplier: number; payout: number } | null>(null);

  const activeCoinsRef = useRef<ParticleCoin[]>([]);
  const pegsRef = useRef<Peg[]>([]);

  const ROWS = 8;
  const BUCKET_COUNT = 9;

  // Initialize peg geometry
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.width;
    const height = canvas.height;

    const startY = 60;
    const endY = height - 60;
    const rowHeight = (endY - startY) / (ROWS + 1);

    const pegs: Peg[] = [];
    for (let row = 0; row < ROWS; row++) {
      const pegsInRow = row + 3;
      const rowY = startY + (row + 1) * rowHeight;
      const spacing = (width * 0.78) / (pegsInRow + 1);
      const startX = (width - (pegsInRow - 1) * spacing) / 2;

      for (let col = 0; col < pegsInRow; col++) {
        pegs.push({
          x: startX + col * spacing,
          y: rowY,
          hitTimer: 0,
        });
      }
    }
    pegsRef.current = pegs;
  }, []);

  // Main canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const bucketWidth = width / BUCKET_COUNT;
      const bucketY = height - 45;
      const config = RISK_CONFIGS[risk];

      // 1. Draw Multiplier Buckets at bottom
      for (let i = 0; i < BUCKET_COUNT; i++) {
        const bx = i * bucketWidth;
        const mult = config.multipliers[i];
        const isHighlight = lastWin?.multiplier === mult;

        ctx.fillStyle = isHighlight ? '#F59E0B' : 'rgba(30, 41, 59, 0.7)';
        ctx.strokeStyle = isHighlight ? '#FCD34D' : 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 1.5;

        // Bucket box
        ctx.beginPath();
        ctx.roundRect(bx + 3, bucketY, bucketWidth - 6, 38, 6);
        ctx.fill();
        ctx.stroke();

        // Multiplier text
        ctx.fillStyle = isHighlight ? '#0F172A' : '#F1F5F9';
        ctx.font = 'bold 11px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${mult}x`, bx + bucketWidth / 2, bucketY + 19);
      }

      // 2. Draw and Update Pegs
      pegsRef.current.forEach((peg) => {
        if (peg.hitTimer > 0) {
          peg.hitTimer -= 1;
        }

        ctx.beginPath();
        ctx.arc(peg.x, peg.y, peg.hitTimer > 0 ? 5.5 : 4, 0, Math.PI * 2);
        ctx.fillStyle = peg.hitTimer > 0 ? '#FBBF24' : '#64748B';
        ctx.shadowColor = peg.hitTimer > 0 ? '#F59E0B' : 'transparent';
        ctx.shadowBlur = peg.hitTimer > 0 ? 10 : 0;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 3. Update & Draw Active Coins
      const remainingCoins: ParticleCoin[] = [];

      activeCoinsRef.current.forEach((coin) => {
        if (!coin.active) return;

        // Gravity & Air Resistance
        coin.vy += 0.22;
        coin.vx *= 0.99;
        coin.x += coin.vx;
        coin.y += coin.vy;

        // Collision with boundary walls
        if (coin.x < 15) {
          coin.x = 15;
          coin.vx = Math.abs(coin.vx) * 0.6;
        } else if (coin.x > width - 15) {
          coin.x = width - 15;
          coin.vx = -Math.abs(coin.vx) * 0.6;
        }

        // Collision with pegs
        pegsRef.current.forEach((peg) => {
          const dx = coin.x - peg.x;
          const dy = coin.y - peg.y;
          const dist = Math.hypot(dx, dy);
          const minDist = coin.radius + 4.5;

          if (dist < minDist) {
            // Deflect coin
            const angle = Math.atan2(dy, dx);
            const speed = Math.hypot(coin.vx, coin.vy);
            const bounceSpeed = Math.max(speed * 0.65, 2.5);

            // Add subtle random bias to avoid dead centers
            const jitter = (Math.random() - 0.5) * 0.4;
            coin.vx = Math.cos(angle + jitter) * bounceSpeed;
            coin.vy = Math.sin(angle + jitter) * bounceSpeed + 0.4;

            // Separate
            coin.x = peg.x + Math.cos(angle) * (minDist + 0.5);
            coin.y = peg.y + Math.sin(angle) * (minDist + 0.5);

            peg.hitTimer = 10;
            sound.playPegBounce(bounceSpeed / 4);
          }
        });

        // Landed in bucket
        if (coin.y >= bucketY + 10) {
          coin.active = false;
          const rawBucketIndex = Math.floor(coin.x / bucketWidth);
          const bucketIndex = Math.max(0, Math.min(BUCKET_COUNT - 1, rawBucketIndex));
          const mult = config.multipliers[bucketIndex];
          const payout = mult; // 1 coin bet

          setLastWin({ multiplier: mult, payout });

          if (payout > 1) {
            awardWin(payout, mult, 'plinko', '1 Coin Plinko', `Landed in bucket ${bucketIndex + 1} (${mult}x) on ${risk} risk`);
          } else if (payout > 0) {
            awardWin(payout, mult, 'plinko', '1 Coin Plinko', `Landed in bucket ${bucketIndex + 1} (${mult}x return)`);
          } else {
            recordLoss(1, 'plinko', '1 Coin Plinko', `Landed in 0x bucket on ${risk} risk`);
          }

          setIsDropping(false);
          return;
        }

        // Draw Coin
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#F59E0B';
        ctx.shadowColor = '#FBBF24';
        ctx.shadowBlur = 8;
        ctx.fill();

        ctx.strokeStyle = '#FEF08A';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.shadowBlur = 0;

        remainingCoins.push(coin);
      });

      activeCoinsRef.current = remainingCoins;

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [risk, awardWin, recordLoss, lastWin]);

  const handleDrop = () => {
    if (isDropping) return;

    const ok = betCoin(1);
    if (!ok) return;

    setIsDropping(true);
    setLastWin(null);

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Launch position X
    const width = canvas.width;
    const dropOffsets = [-60, -30, 0, 30, 60];
    const launchX = width / 2 + dropOffsets[dropPosition] + (Math.random() - 0.5) * 6;

    const newCoin: ParticleCoin = {
      x: launchX,
      y: 25,
      vx: (Math.random() - 0.5) * 1.2,
      vy: 1.5,
      radius: 7.5,
      active: true,
      history: [],
    };

    activeCoinsRef.current = [newCoin];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Plinko Canvas Board */}
      <div className="lg:col-span-8 flex flex-col items-center">
        <div className="w-full relative rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 sm:p-6 backdrop-blur-xl shadow-2xl flex flex-col items-center">
          {/* Edge Glow */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

          {/* Top Drop Funnel Position Controls */}
          <div className="w-full max-w-sm flex items-center justify-between gap-2 mb-2 px-6">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Launch Slot
            </span>
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-neutral-950/60 border border-neutral-800">
              {[0, 1, 2, 3, 4].map((slotIdx) => (
                <button
                  key={slotIdx}
                  onClick={() => setDropPosition(slotIdx)}
                  disabled={isDropping}
                  className={`w-7 h-6 rounded text-xs font-bold transition-all ${
                    dropPosition === slotIdx
                      ? 'bg-amber-500 text-neutral-950 shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {slotIdx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* The Physics Canvas */}
          <div className="relative w-full max-w-[500px] aspect-[500/440] bg-neutral-950/80 rounded-xl border border-neutral-800/80 overflow-hidden shadow-inner">
            <canvas
              ref={canvasRef}
              width={500}
              height={440}
              className="w-full h-full block"
            />
          </div>

          {/* Outcome bar */}
          <div className="mt-4 flex items-center justify-between w-full max-w-[500px] px-2 text-xs text-neutral-400">
            <span>Cost: 1 Golden Coin</span>
            {lastWin && (
              <span className="font-semibold text-amber-300 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Landed: {lastWin.multiplier}x (+{lastWin.payout} Coins)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Control Panel (Right) */}
      <div className="lg:col-span-4 space-y-6">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-md space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-amber-400" />
              <h3 className="font-display font-bold text-sm text-white">Plinko Settings</h3>
            </div>
            <span className="text-xs text-neutral-400">1 Coin / Drop</span>
          </div>

          {/* Risk Level Selector */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-2">
              Payout Volatility
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as RiskLevel[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRisk(r)}
                  disabled={isDropping}
                  className={`py-2 px-3 rounded-lg text-xs font-bold capitalize transition-all border ${
                    risk === r
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-neutral-800/40 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                  }`}
                >
                  {r}
                  <span className="block text-[10px] font-normal text-neutral-400 mt-0.5">
                    {r === 'low' ? 'Max 10x' : r === 'medium' ? 'Max 25x' : 'Max 100x'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Payout Distribution Preview */}
          <div>
            <span className="text-xs font-medium text-neutral-400 block mb-2">
              Bucket Multipliers ({risk.toUpperCase()})
            </span>
            <div className="flex items-center justify-between gap-1 text-[11px] font-mono font-bold bg-neutral-950/70 p-2 rounded-lg border border-neutral-800">
              {RISK_CONFIGS[risk].multipliers.map((m, i) => (
                <span
                  key={i}
                  className={`px-1 py-0.5 rounded ${
                    m >= 20
                      ? 'text-rose-400 bg-rose-950/40'
                      : m >= 2
                      ? 'text-amber-300'
                      : 'text-neutral-400'
                  }`}
                >
                  {m}x
                </span>
              ))}
            </div>
          </div>

          {/* Main Drop Button */}
          {coins < 1 && !isDropping ? (
            <button
              onClick={claimEmergencyCoin}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 text-neutral-950 font-display font-bold text-sm hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition-all"
            >
              🪙 Claim Free 1 Coin & Drop
            </button>
          ) : (
            <button
              onClick={handleDrop}
              disabled={isDropping}
              className={`w-full py-3.5 px-6 rounded-xl font-display font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                isDropping
                  ? 'opacity-60 cursor-not-allowed bg-neutral-800 text-neutral-400'
                  : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 shadow-lg shadow-amber-500/25'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>{isDropping ? 'COIN IN FLIGHT...' : 'DROP 1 COIN NOW'}</span>
            </button>
          )}

          <div className="pt-3 border-t border-neutral-800/80 text-xs text-neutral-400 leading-relaxed">
            <p>
              Each drop bounces across 8 rows of physical brass pins. Land in the outer wings for huge multi-coin multipliers!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
