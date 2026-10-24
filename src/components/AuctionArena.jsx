import React, { useState } from 'react';
import { 
  Gavel, 
  XCircle, 
  Play, 
  Pause, 
  RotateCcw, 
  AlertCircle, 
  CheckCircle2, 
  Users, 
  ArrowRight,
  Shield,
  Zap,
  Undo2
} from 'lucide-react';
import { useAuction } from '../context/AuctionContext';
import { PlayerCard } from './PlayerCard';

export const AuctionArena = ({ onSelectPlayerTab }) => {
  const {
    teams,
    players,
    currentAuction,
    activePlayer,
    highestBidderTeam,
    startAuction,
    placeBid,
    undoLastBid,
    sellCurrentPlayer,
    markCurrentPlayerUnsold,
    toggleTimer,
    resetTimer,
    reAuctionPlayer,
  } = useAuction();

  const [bidError, setBidError] = useState(null);

  const availablePlayers = players.filter(p => p.status === 'available');
  const unsoldPlayers = players.filter(p => p.status === 'unsold');

  // Next bid amount (5 -> 6 -> 7 etc.)
  const nextIncrementBid = currentAuction.highestBidderTeamId
    ? currentAuction.currentBid + 1
    : currentAuction.baseBid;

  const handleBid = (teamId) => {
    setBidError(null);
    const res = placeBid(teamId, nextIncrementBid);
    if (!res.success) {
      setBidError(res.reason);
      setTimeout(() => setBidError(null), 3500);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Alert Error Message */}
      {bidError && (
        <div className="p-3 bg-rose-500/20 border border-rose-500/50 text-rose-300 rounded-xl flex items-center justify-between text-sm font-semibold">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span>{bidError}</span>
          </div>
          <button onClick={() => setBidError(null)} className="text-xs px-2 py-1 bg-rose-500/30 rounded-lg">
            Dismiss
          </button>
        </div>
      )}

      {/* 1. NO ACTIVE PLAYER SCREEN */}
      {!activePlayer ? (
        <div className="rounded-3xl bg-pitch-800 border border-pitch-700 p-8 text-center space-y-6 max-w-2xl mx-auto shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 mx-auto flex items-center justify-center text-emerald-400">
            <Gavel className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">Select a Player to Start Auction</h2>
            <p className="text-slate-400 text-sm mt-1">
              Pick a player from the queue below to open live bidding for all 8 captains.
            </p>
          </div>

          {availablePlayers.length > 0 ? (
            <div className="space-y-3 text-left">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Next Available Players:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availablePlayers.slice(0, 6).map((ply) => (
                  <div
                    key={ply.id}
                    onClick={() => startAuction(ply.id)}
                    className="p-3 rounded-xl bg-pitch-900 border border-pitch-700 hover:border-emerald-500 flex items-center justify-between cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={ply.photo} 
                        alt={ply.name} 
                        className="w-10 h-10 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] px-1 bg-pitch-800 rounded text-slate-300 font-bold">{ply.position}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white group-hover:text-emerald-300">{ply.name}</h4>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg bg-emerald-500 text-pitch-950 font-bold text-xs">
                      Auction
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-pitch-900 rounded-xl text-slate-400 text-sm">
              All players have been auctioned!
            </div>
          )}

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onSelectPlayerTab}
              className="px-5 py-2.5 rounded-xl bg-pitch-700 hover:bg-pitch-600 text-white font-bold text-xs flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              View Full Player Pool ({players.length})
            </button>

            {unsoldPlayers.length > 0 && (
              <button
                onClick={() => reAuctionPlayer(unsoldPlayers[0].id)}
                className="px-5 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs hover:bg-amber-500/30 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Re-Auction ({unsoldPlayers.length} Unsold)
              </button>
            )}
          </div>
        </div>
      ) : (
        /* 2. LIVE AUCTION STAGE */
        <div className="space-y-6">
          
          {/* Top Row: Spotlight Player Card & Live Bid Status */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Player Card (5 cols) */}
            <div className="md:col-span-5 flex justify-center">
              <PlayerCard player={activePlayer} />
            </div>

            {/* Auction Bidding Panel (7 cols) */}
            <div className="md:col-span-7 space-y-4">
              
              {/* Timer & Current Highest Bid Box */}
              <div className="rounded-3xl bg-pitch-800 border-2 border-pitch-700 p-6 shadow-xl space-y-5">
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  
                  {/* Countdown Timer */}
                  <div className={`p-4 rounded-2xl border ${
                    currentAuction.timeLeft <= 5 
                      ? 'bg-rose-950/40 border-rose-500 text-rose-400 animate-pulse' 
                      : 'bg-pitch-900 border-pitch-700 text-emerald-400'
                  }`}>
                    <span className="text-[11px] font-bold uppercase tracking-wider block text-slate-400">
                      Timer {currentAuction.isTimerRunning ? '(Running)' : '(Paused)'}
                    </span>
                    <div className="text-5xl font-black font-mono my-1">
                      {currentAuction.timeLeft}s
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <button
                        onClick={toggleTimer}
                        className="px-3 py-1 rounded-lg bg-pitch-800 text-xs font-bold text-slate-200 hover:text-white"
                      >
                        {currentAuction.isTimerRunning ? 'Pause' : 'Start'}
                      </button>
                      <button
                        onClick={resetTimer}
                        className="px-2 py-1 rounded-lg bg-pitch-800 text-xs font-bold text-slate-400 hover:text-white"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Current Highest Bid */}
                  <div className="p-4 rounded-2xl bg-pitch-900 border border-amber-500/40 text-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider block text-amber-400">
                      Current Bid
                    </span>
                    <div className="text-5xl font-black text-amber-300 my-1 font-mono">
                      {currentAuction.currentBid} <span className="text-lg font-sans text-amber-400">PTS</span>
                    </div>
                    {highestBidderTeam ? (
                      <div className="text-xs font-bold text-white truncate px-2 py-1 bg-pitch-800 rounded-lg flex items-center justify-center gap-1.5">
                        {highestBidderTeam.image ? (
                          <img src={highestBidderTeam.image} alt={highestBidderTeam.name} className="w-4 h-4 rounded-md object-cover flex-shrink-0" />
                        ) : (
                          <span>{highestBidderTeam.badge || '🛡️'}</span>
                        )}
                        <span>{highestBidderTeam.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 italic block py-1">
                        Base: {currentAuction.baseBid} Pts (No Bids)
                      </span>
                    )}
                  </div>
                </div>

                {/* Master Decision Buttons: SOLD & UNSOLD */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-pitch-700">
                  <div className="flex items-center gap-2">
                    {/* SOLD BUTTON */}
                    <button
                      onClick={sellCurrentPlayer}
                      disabled={!highestBidderTeam}
                      className={`px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all ${
                        highestBidderTeam
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-pitch-950 shadow-emerald-500/20 active:scale-95 cursor-pointer animate-pulse'
                          : 'bg-pitch-900 text-slate-500 border border-pitch-700 cursor-not-allowed'
                      }`}
                    >
                      <Gavel className="w-4 h-4" />
                      {highestBidderTeam ? `SOLD (${currentAuction.currentBid} Pts)` : 'SOLD (Need Bid)'}
                    </button>

                    {/* UNSOLD BUTTON */}
                    <button
                      onClick={markCurrentPlayerUnsold}
                      className="px-4 py-3 rounded-xl bg-pitch-900 border border-rose-500/40 text-rose-300 font-bold text-sm hover:bg-rose-500/20 transition-all flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4 text-rose-400" />
                      Unsold
                    </button>
                  </div>

                  {/* Undo Button */}
                  {currentAuction.bidFeed.filter(f => f.type === 'BID').length > 0 && (
                    <button
                      onClick={undoLastBid}
                      className="px-3 py-2 rounded-xl bg-pitch-900 border border-pitch-700 text-xs text-slate-300 hover:text-white flex items-center gap-1"
                    >
                      <Undo2 className="w-3.5 h-3.5 text-amber-400" />
                      Undo Bid
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Captains Bidding Console (All 8 Teams) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                8 Captains Bidding Console (Bidding in Points)
              </h3>
              <span className="text-xs text-slate-400">Next Bid: <strong>{nextIncrementBid} Points</strong></span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {teams.map((team) => {
                const isSquadFull = team.players.length >= (team.maxPlayers || 7);
                const isHighestBidder = currentAuction.highestBidderTeamId === team.id;
                const canAfford = team.remainingPoints >= nextIncrementBid;
                const isEligible = !isSquadFull && !isHighestBidder && canAfford;

                let statusBadge = '';
                if (isHighestBidder) statusBadge = 'Highest Bidder';
                else if (isSquadFull) statusBadge = 'Squad Full (7/7)';
                else if (!canAfford) statusBadge = 'Insufficient Points';

                return (
                  <div
                    key={team.id}
                    className={`rounded-2xl p-4 border transition-all ${
                      isHighestBidder
                        ? 'bg-amber-500/15 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                        : isEligible
                        ? 'bg-pitch-800 border-pitch-700 hover:border-slate-500'
                        : 'bg-pitch-900/60 border-pitch-800 opacity-60'
                    }`}
                  >
                    {/* Team Info */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {team.image ? (
                          <img src={team.image} alt={team.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <span className="text-2xl">{team.badge}</span>
                        )}
                        <div className="min-w-0">
                          <h4 className="text-sm font-extrabold text-white truncate max-w-[120px]">{team.name}</h4>
                          <span className="text-[11px] text-slate-400 block truncate">{team.captain}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-300">
                        {team.players.length}/7
                      </span>
                    </div>

                    {/* Remaining Points */}
                    <div className="flex items-center justify-between text-xs py-1.5 px-2.5 bg-pitch-900 rounded-xl mb-3 border border-pitch-700/60">
                      <span className="text-slate-400">Budget Left:</span>
                      <strong className="text-emerald-400 font-extrabold text-sm">{team.remainingPoints} Pts</strong>
                    </div>

                    {/* Action */}
                    {isEligible ? (
                      <button
                        onClick={() => handleBid(team.id)}
                        className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-pitch-950 font-black text-xs uppercase tracking-wider shadow active:scale-95 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5 fill-pitch-950" />
                        BID {nextIncrementBid} PTS
                      </button>
                    ) : (
                      <div className="py-2 text-center text-xs font-bold text-slate-400 bg-pitch-900 rounded-xl">
                        {statusBadge}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
