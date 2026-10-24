import React from 'react';
import { Award, Zap } from 'lucide-react';

export const PlayerCard = ({ player }) => {
  if (!player) return null;

  const getPositionBadge = (pos) => {
    switch (pos) {
      case 'FW': return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'MF': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'DF': return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'GK': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  return (
    <div className="w-full max-w-sm rounded-2xl bg-pitch-800 border-2 border-pitch-600 p-5 shadow-xl text-center relative overflow-hidden">
      
      {/* Top Header: Position */}
      <div className="flex items-center justify-center mb-3">
        <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase border ${getPositionBadge(player.position)}`}>
          {player.position} • {player.positionName || player.position}
        </span>
      </div>

      {/* Player Photo */}
      <div className="w-36 h-36 mx-auto rounded-2xl overflow-hidden border-2 border-pitch-600 shadow-md bg-pitch-900 my-2">
        <img 
          src={player.photo} 
          alt={player.name}
          className="w-full h-full object-cover object-top"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
          }}
        />
      </div>

      {/* Player Name */}
      <h3 className="text-xl font-extrabold text-white mt-3 truncate">
        {player.name}
      </h3>
      <p className="text-xs text-slate-400 mt-0.5">
        {player.nationality || 'Professional'} • Age {player.age || 24}
      </p>
    </div>
  );
};
