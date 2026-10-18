import React from 'react';
import { Trophy, Flame, Users, Shield, RotateCcw } from 'lucide-react';
import { useAuction } from '../context/AuctionContext';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { players, teams, resetTournament, currentAuction } = useAuction();

  const totalPlayers = players.length;
  const soldPlayersCount = players.filter(p => p.status === 'sold').length;
  const availablePlayersCount = players.filter(p => p.status === 'available').length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-pitch-700 bg-pitch-900/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div 
            onClick={() => setActiveTab('auction')}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-pitch-950 shadow-md">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-white tracking-wide">
                FOOTBALL <span className="text-emerald-400">AUCTION</span>
              </h1>
              <p className="text-[11px] text-slate-400">8 Teams • 60 Pts • Max 7 Players</p>
            </div>
          </div>

          {/* Simple 3 Tabs */}
          <nav className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('auction')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'auction'
                  ? 'bg-emerald-500 text-pitch-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-pitch-800'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>Live Auction</span>
              {currentAuction.activePlayerId && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('players')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'players'
                  ? 'bg-emerald-500 text-pitch-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-pitch-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Players ({availablePlayersCount} left)</span>
            </button>

            <button
              onClick={() => setActiveTab('teams')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'teams'
                  ? 'bg-emerald-500 text-pitch-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-pitch-800'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>8 Teams ({soldPlayersCount} sold)</span>
            </button>
          </nav>

          {/* Reset button */}
          <div>
            <button
              onClick={resetTournament}
              title="Reset to default demo data"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pitch-800 hover:bg-rose-500/20 border border-pitch-700 hover:border-rose-500/40 text-xs font-semibold text-slate-300 hover:text-rose-300 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Tournament</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
