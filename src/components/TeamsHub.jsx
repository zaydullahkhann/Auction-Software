import React from 'react';
import { Shield, Users, Zap } from 'lucide-react';
import { useAuction } from '../context/AuctionContext';

export const TeamsHub = () => {
  const { teams } = useAuction();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-emerald-400" />
          8 Tournament Teams & Squads
        </h2>
        <p className="text-xs text-slate-400">
          Track each team's remaining budget (60 points cap) and squad lineup (max 7 players).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teams.map((team) => {
          const isSquadFull = team.players.length >= 7;

          return (
            <div
              key={team.id}
              className={`rounded-2xl bg-pitch-800 border-2 p-5 shadow-lg space-y-4 ${
                isSquadFull ? 'border-emerald-500/50' : 'border-pitch-700'
              }`}
            >
              {/* Team Top Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {team.image ? (
                    <img
                      src={team.image}
                      alt={team.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-pitch-600 shadow-md flex-shrink-0"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-12 h-12 rounded-2xl bg-pitch-900 border-2 border-pitch-700 items-center justify-center text-2xl flex-shrink-0 ${team.image ? 'hidden' : 'flex'}`}
                  >
                    {team.badge || '🛡️'}
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white">{team.name}</h3>
                    <p className="text-xs text-slate-400">Captain: <strong className="text-slate-200">{team.captain}</strong></p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-lg bg-pitch-900 border border-pitch-700 text-xs font-bold text-white">
                    {team.players.length} / 7 Players
                  </span>
                </div>
              </div>

              {/* Budget Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Remaining Budget:</span>
                  <span className="font-extrabold text-emerald-400 text-sm">
                    {team.remainingPoints} <span className="text-slate-400 text-xs font-normal">/ 60 Pts</span>
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-pitch-900 border border-pitch-700 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${(team.remainingPoints / 60) * 100}%` }}
                  />
                </div>
              </div>

              {/* Squad List */}
              <div className="pt-2 border-t border-pitch-700 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Squad Players ({team.players.length}):
                </span>

                {team.players.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No players signed yet.</p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {team.players.map((ply, idx) => (
                      <div
                        key={ply.id || idx}
                        className="p-2 rounded-xl bg-pitch-900 border border-pitch-700 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-mono text-[10px]">#{idx + 1}</span>
                          <span className="px-1 bg-pitch-800 rounded text-[10px] text-slate-300 font-bold">{ply.position}</span>
                          <span className="text-white font-bold truncate max-w-[140px]">{ply.name}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-xs">
                          {ply.pointsPaid ?? ply.soldPrice ?? 0} Pts
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
