import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Zap, ChevronRight, X, Sparkles, Trophy } from 'lucide-react';
import { PlayerCard } from './PlayerCard';

export const CelebrationModal = ({ data, onClose, onSelectNextPlayer }) => {
  if (!data) return null;

  const { player, team, price } = data;

  useEffect(() => {
    // Launch celebratory confetti fireworks
    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#10b981', '#f59e0b', '#06b6d4', '#8b5cf6', '#ef4444']
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#10b981', '#f59e0b', '#06b6d4', '#8b5cf6', '#ef4444']
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, [data]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pitch-950/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-lg glass-panel-elevated rounded-3xl p-6 sm:p-8 border-2 border-amber-500/50 shadow-2xl text-center overflow-hidden">
        
        {/* Holographic light burst */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-pitch-900 border border-slate-700 text-slate-400 hover:text-white hover:bg-pitch-800 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* SOLD Celebration Banner */}
        <div className="relative z-10 space-y-2 mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase tracking-widest animate-bounce">
            <Trophy className="w-4 h-4 text-amber-400" />
            OFFICIAL DEAL SIGNED!
          </div>

          <h2 className="text-3xl sm:text-4xl font-black font-display text-white tracking-wide">
            HAMMER DOWN — <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500">SOLD!</span>
          </h2>
        </div>

        {/* Acquired Player Card Miniature */}
        <div className="relative z-10 max-w-xs mx-auto my-4 transform scale-90 sm:scale-100 transition-transform">
          <PlayerCard player={player} size="compact" showStats={false} />
        </div>

        {/* Winning Team & Price Ribbon */}
        <div className="relative z-10 p-4 rounded-2xl bg-pitch-900/90 border border-amber-500/30 my-4 space-y-2 shadow-inner">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Acquired by Franchise
          </div>

          <div className="flex items-center justify-center gap-3.5">
            {team?.image ? (
              <img
                src={team.image}
                alt={team?.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-lg flex-shrink-0"
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={`w-14 h-14 rounded-2xl bg-pitch-950 border-2 border-amber-400 items-center justify-center text-3xl flex-shrink-0 ${team?.image ? 'hidden' : 'flex'}`}
            >
              {team?.badge || '🛡️'}
            </div>
            <div className="text-left min-w-0">
              <h3 className="text-xl font-extrabold text-white" style={{ color: team?.accentColor || '#fff' }}>
                {team?.name}
              </h3>
              <p className="text-xs text-slate-400">Captain: {team?.captain}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-pitch-800 flex items-center justify-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Winning Bid:</span>
            <span className="px-3 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black font-display text-xl">
              {price} PTS
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-pitch-800 hover:bg-pitch-700 border border-slate-700 text-slate-200 font-bold text-sm transition-all"
          >
            Back to Arena
          </button>

          <button
            id="continue-next-auction-btn"
            onClick={() => {
              onClose();
              if (onSelectNextPlayer) onSelectNextPlayer();
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-pitch-950 font-black text-sm shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Next Auction</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
