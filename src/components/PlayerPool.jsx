import React, { useState } from 'react';
import { Search, Plus, Play, RotateCcw, Award } from 'lucide-react';
import { useAuction } from '../context/AuctionContext';

export const PlayerPool = ({ onStartAuction, onOpenAddPlayer }) => {
  const { players, teams, startAuction, reAuctionPlayer } = useAuction();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'available' | 'sold' | 'unsold'

  const filtered = players.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.position.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' || p.status === filter;
    return matchSearch && matchFilter;
  });

  const getTeamName = (teamId) => {
    const t = teams.find(team => team.id === teamId);
    return t ? `${t.badge} ${t.name}` : '';
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-white">Player Pool ({players.length})</h2>
          <p className="text-xs text-slate-400">Manage draft players and send them directly to the Live Auction.</p>
        </div>

        <button
          onClick={onOpenAddPlayer}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-pitch-950 font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto shadow"
        >
          <Plus className="w-4 h-4" />
          Add Player
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-pitch-800 rounded-2xl border border-pitch-700">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by player name or position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-pitch-900 border border-pitch-700 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'available', label: 'Available' },
            { id: 'sold', label: 'Sold' },
            { id: 'unsold', label: 'Unsold' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === f.id
                  ? 'bg-emerald-500 text-pitch-950 font-black'
                  : 'bg-pitch-900 text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Players List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((player) => (
          <div
            key={player.id}
            className="p-4 rounded-2xl bg-pitch-800 border border-pitch-700 hover:border-slate-500 transition-all flex items-center justify-between gap-3 shadow-md"
          >
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={player.photo}
                alt={player.name}
                className="w-12 h-12 rounded-xl object-cover border border-pitch-600 flex-shrink-0"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
                }}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-amber-400">{player.rating} OVR</span>
                  <span className="px-1.5 py-0.2 rounded bg-pitch-900 text-[10px] font-bold text-slate-300">
                    {player.position}
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-white truncate">{player.name}</h4>
                <p className="text-xs text-slate-400">Base: {player.basePoints} Pts</p>
              </div>
            </div>

            {/* Action State */}
            <div className="flex-shrink-0">
              {player.status === 'available' && (
                <button
                  onClick={() => {
                    startAuction(player.id);
                    onStartAuction();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-pitch-950 font-black text-xs uppercase flex items-center gap-1 shadow"
                >
                  <Play className="w-3 h-3 fill-pitch-950" />
                  Auction
                </button>
              )}

              {player.status === 'unsold' && (
                <button
                  onClick={() => {
                    reAuctionPlayer(player.id);
                    onStartAuction();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Re-Auction
                </button>
              )}

              {player.status === 'sold' && (
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[11px] font-bold block">
                    SOLD ({player.soldPrice} Pts)
                  </span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[100px] block mt-0.5">
                    {getTeamName(player.soldToTeamId)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
