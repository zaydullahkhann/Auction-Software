import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Download, 
  Printer, 
  Award, 
  XCircle, 
  TrendingUp, 
  DollarSign, 
  Filter, 
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuction } from '../context/AuctionContext';

export const LedgerView = () => {
  const { ledger, teams, players } = useAuction();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [teamFilter, setTeamFilter] = useState('ALL');

  // Summary Metrics
  const soldEntries = ledger.filter(item => item.status === 'SOLD');
  const unsoldEntries = ledger.filter(item => item.status === 'UNSOLD');
  const totalPointsSpent = soldEntries.reduce((sum, item) => sum + (item.points || 0), 0);
  const avgPoints = soldEntries.length > 0 ? (totalPointsSpent / soldEntries.length).toFixed(1) : 0;
  
  const highestSale = soldEntries.length > 0 
    ? [...soldEntries].sort((a, b) => b.points - a.points)[0] 
    : null;

  // Filtered Ledger List
  const filteredLedger = useMemo(() => {
    return ledger.filter(entry => {
      const matchesSearch = entry.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.teamName && entry.teamName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || entry.status === statusFilter;
      const matchesTeam = teamFilter === 'ALL' || entry.teamId === teamFilter;

      return matchesSearch && matchesStatus && matchesTeam;
    });
  }, [ledger, searchQuery, statusFilter, teamFilter]);

  // Export as JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(ledger, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `tournament_auction_ledger_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Print Summary
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Tools */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-display text-white tracking-wide flex items-center gap-2">
            <span>Official Auction Ledger</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-sans">
              {ledger.length} Transaction Records
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Immutable log of all player acquisitions, final point bids, and unsold declarations.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportJSON}
            disabled={ledger.length === 0}
            className="px-3.5 py-2 rounded-xl bg-pitch-800 hover:bg-pitch-700 border border-pitch-700 text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Export JSON
          </button>
          <button
            onClick={handlePrint}
            disabled={ledger.length === 0}
            className="px-3.5 py-2 rounded-xl bg-pitch-800 hover:bg-pitch-700 border border-pitch-700 text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-40"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            Print Log
          </button>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-4 border border-pitch-700">
          <span className="text-xs text-slate-400 font-bold uppercase block">Total Points Spent</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-display text-emerald-400 mt-1">
            {totalPointsSpent} <span className="text-sm font-sans font-normal text-slate-400">Pts</span>
          </div>
          <span className="text-[11px] text-slate-500">Across 8 franchise teams</span>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-pitch-700">
          <span className="text-xs text-slate-400 font-bold uppercase block">Players Sold</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-display text-cyan-400 mt-1">
            {soldEntries.length} <span className="text-sm font-sans font-normal text-slate-400">Players</span>
          </div>
          <span className="text-[11px] text-slate-500">{unsoldEntries.length} unsold declarations</span>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-pitch-700">
          <span className="text-xs text-slate-400 font-bold uppercase block">Avg Winning Price</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-display text-amber-400 mt-1">
            {avgPoints} <span className="text-sm font-sans font-normal text-slate-400">Pts</span>
          </div>
          <span className="text-[11px] text-slate-500">Per sold player</span>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-pitch-700">
          <span className="text-xs text-slate-400 font-bold uppercase block">Top Tournament Buy</span>
          {highestSale ? (
            <div className="mt-1">
              <div className="text-lg font-extrabold text-white truncate">{highestSale.playerName}</div>
              <div className="text-xs text-amber-300 font-semibold">{highestSale.points} Pts ({highestSale.teamName})</div>
            </div>
          ) : (
            <div className="text-sm font-semibold text-slate-500 mt-2">No sales yet</div>
          )}
        </div>
      </div>

      {/* Filter and Search */}
      <div className="glass-panel rounded-2xl p-4 border border-pitch-700 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search player or winning team..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-pitch-900 border border-pitch-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-pitch-900 border border-pitch-700 text-xs text-slate-200 font-bold focus:outline-none"
          >
            <option value="ALL">All Outcomes</option>
            <option value="SOLD">SOLD Only</option>
            <option value="UNSOLD">UNSOLD Only</option>
          </select>

          {/* Team Filter */}
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-pitch-900 border border-pitch-700 text-xs text-slate-200 font-bold focus:outline-none"
          >
            <option value="ALL">All Teams</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.badge} {t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      {filteredLedger.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border border-pitch-700/80">
          <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-base font-semibold">No auction transactions recorded yet.</p>
          <p className="text-xs text-slate-500 mt-1">Start bidding on players in the Live Stage to populate the ledger.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-pitch-700 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-pitch-900/90 text-[11px] uppercase font-extrabold tracking-wider text-slate-400 border-b border-pitch-700">
                <tr>
                  <th scope="col" className="px-6 py-3.5">#</th>
                  <th scope="col" className="px-6 py-3.5">Player</th>
                  <th scope="col" className="px-6 py-3.5">Position</th>
                  <th scope="col" className="px-6 py-3.5">Winning Team</th>
                  <th scope="col" className="px-6 py-3.5">Points Paid</th>
                  <th scope="col" className="px-6 py-3.5">Status</th>
                  <th scope="col" className="px-6 py-3.5">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pitch-800/80">
                {filteredLedger.map((entry, idx) => (
                  <tr key={entry.id || idx} className="hover:bg-pitch-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      {filteredLedger.length - idx}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {entry.playerPhoto && (
                          <img 
                            src={entry.playerPhoto} 
                            alt={entry.playerName} 
                            className="w-9 h-9 rounded-lg object-cover border border-pitch-700"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
                            }}
                          />
                        )}
                        <div>
                          <strong className="text-white font-extrabold">{entry.playerName}</strong>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-pitch-950 text-slate-300 border border-pitch-700">
                          {entry.playerPosition}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {entry.teamId ? (
                        <div className="flex items-center gap-2">
                          <span className="text-base">{entry.teamBadge}</span>
                          <span className="font-bold text-white" style={{ color: entry.teamColor }}>
                            {entry.teamName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">None</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {entry.status === 'SOLD' ? (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-extrabold font-display text-base">
                          {entry.points} Pts
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono">-</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {entry.status === 'SOLD' ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider flex items-center gap-1 w-fit">
                          <Award className="w-3.5 h-3.5 text-emerald-400" />
                          SOLD
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-wider flex items-center gap-1 w-fit">
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          UNSOLD
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-xs font-mono text-slate-400">
                      {entry.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
