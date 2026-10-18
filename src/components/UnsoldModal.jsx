import React from 'react';
import { XCircle, RotateCcw, ChevronRight, X, UserX } from 'lucide-react';
import { PlayerCard } from './PlayerCard';

export const UnsoldModal = ({ player, onClose, onReAuction, onSelectNextPlayer }) => {
  if (!player) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pitch-950/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-md glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-rose-500/40 shadow-2xl text-center overflow-hidden">
        
        {/* Holographic light burst */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-80 h-80 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-pitch-900 border border-slate-700 text-slate-400 hover:text-white hover:bg-pitch-800 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="relative z-10 space-y-2 mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-black uppercase tracking-widest">
            <XCircle className="w-4 h-4 text-rose-400" />
            AUCTION ROUND CONCLUDED
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-display text-white tracking-wide">
            Player Declared <span className="text-rose-400">UNSOLD</span>
          </h2>
          <p className="text-xs text-slate-400">
            No captain placed a bid before the timer expired. You can re-auction this player anytime.
          </p>
        </div>

        {/* Player Card Preview */}
        <div className="relative z-10 max-w-xs mx-auto my-4 transform scale-90 sm:scale-95 transition-transform">
          <PlayerCard player={player} size="compact" showStats={false} />
        </div>

        {/* Modal Actions */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              onClose();
              onReAuction(player.id);
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-pitch-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <RotateCcw className="w-4 h-4" />
            Re-Auction Now
          </button>

          <button
            onClick={() => {
              onClose();
              if (onSelectNextPlayer) onSelectNextPlayer();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-pitch-800 hover:bg-pitch-700 border border-slate-700 text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-2"
          >
            <span>Next Player</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
