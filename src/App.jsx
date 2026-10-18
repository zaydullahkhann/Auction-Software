import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, 
  Gavel, 
  XCircle, 
  ChevronRight, 
  ChevronLeft, 
  Shield, 
  Zap, 
  AlertCircle,
  CheckCircle2,
  Trophy,
  Sparkles,
  X,
  Plus,
  Trash2,
  Users,
  Play,
  Settings,
  Upload,
  Image as ImageIcon,
  AlertTriangle,
  Award,
  Check
} from 'lucide-react';
import { INITIAL_TEAMS, INITIAL_PLAYERS } from './data/initialData';
import confetti from 'canvas-confetti';

const STORAGE_KEYS = {
  TEAMS: 'FOOTBALL_AUCTION_TEAMS_SETUP_V9',
  PLAYERS: 'FOOTBALL_AUCTION_PLAYERS_SETUP_V9',
  CURRENT_INDEX: 'FOOTBALL_AUCTION_INDEX_SETUP_V9',
  VIEW_MODE: 'FOOTBALL_AUCTION_VIEW_MODE_V9',
};

export default function App() {
  // 1. View Mode: 'setup' (Before Auction) or 'auction' (Live Auction)
  const [viewMode, setViewMode] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
      return saved || 'setup';
    } catch {
      return 'setup';
    }
  });

  // 2. Teams State
  const [teams, setTeams] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEAMS);
      return saved ? JSON.parse(saved) : INITIAL_TEAMS;
    } catch {
      return INITIAL_TEAMS;
    }
  });

  // 3. Players State
  const [players, setPlayers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLAYERS);
      return saved ? JSON.parse(saved) : INITIAL_PLAYERS;
    } catch {
      return INITIAL_PLAYERS;
    }
  });

  // 4. Current Player Index in Active (Unsold/Available) Queue
  const [currentIndex, setCurrentIndex] = useState(0);

  // 5. Setup Form States
  const [setupTab, setSetupTab] = useState('players'); // 'players' | 'teams'
  const [setupWarning, setSetupWarning] = useState('');
  
  // New Team Form
  const [newTeam, setNewTeam] = useState({
    name: '',
    captain: '',
    badge: '⚡',
    initialPoints: 60,
  });

  // New Player Form with File Upload preview (Base Points defaults to 0)
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    position: 'FW',
    rating: 85,
    basePoints: 0,
    nationality: 'Tournament Star',
    photo: '',
  });

  // 6. Live Auction Bidding Form (Default 0 points)
  const [selectedTeamId, setSelectedTeamId] = useState(INITIAL_TEAMS[0]?.id || '');
  const [bidPoints, setBidPoints] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [soldCelebration, setSoldCelebration] = useState(null);

  // Filter Active Draft Players vs Sold Players
  const availableQueue = players.filter(p => p.status !== 'sold');
  const soldPlayersList = players.filter(p => p.status === 'sold');

  // Sync LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    if (teams.length > 0 && !teams.some(t => t.id === selectedTeamId)) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
  }, [players]);

  // Ensure current index is within bounds of available queue
  useEffect(() => {
    if (currentIndex >= availableQueue.length && availableQueue.length > 0) {
      setCurrentIndex(availableQueue.length - 1);
    }
  }, [availableQueue.length, currentIndex]);

  const currentPlayer = availableQueue[currentIndex] || null;

  // Initialize bid to 0 (or player basePoints)
  useEffect(() => {
    if (currentPlayer) {
      setBidPoints(currentPlayer.basePoints !== undefined ? currentPlayer.basePoints : 0);
      setErrorMessage('');
    }
  }, [currentIndex, currentPlayer?.id]);

  // Handle image upload from device
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('File size is too large. Please select an image under 3MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPlayer(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Add Team Handler
  const handleAddTeam = (e) => {
    e.preventDefault();
    if (!newTeam.name.trim() || !newTeam.captain.trim()) return;

    const teamObj = {
      id: 'team-' + Date.now(),
      name: newTeam.name.trim(),
      captain: newTeam.captain.trim(),
      badge: newTeam.badge || '🛡️',
      initialPoints: Number(newTeam.initialPoints) || 60,
      remainingPoints: Number(newTeam.initialPoints) || 60,
      maxPlayers: 7,
      players: [],
    };

    setTeams(prev => [...prev, teamObj]);
    setNewTeam({ name: '', captain: '', badge: '⚡', initialPoints: 60 });
    setSetupWarning('');
  };

  // Delete Individual Team
  const handleDeleteTeam = (id) => {
    setTeams(prev => prev.filter(t => t.id !== id));
  };

  // Clear All Teams
  const handleClearAllTeams = () => {
    if (window.confirm('Delete all teams from the tournament?')) {
      setTeams([]);
      setSelectedTeamId('');
    }
  };

  // Add Player Handler (Base bid starts with 0)
  const handleAddPlayer = (e) => {
    e.preventDefault();
    if (!newPlayer.name.trim()) return;

    const playerObj = {
      id: 'ply-' + Date.now(),
      name: newPlayer.name.trim(),
      position: newPlayer.position || 'FW',
      positionName: newPlayer.position === 'FW' ? 'Forward' : newPlayer.position === 'MF' ? 'Midfielder' : newPlayer.position === 'DF' ? 'Defender' : 'Goalkeeper',
      rating: Number(newPlayer.rating) || 85,
      basePoints: Number(newPlayer.basePoints) >= 0 ? Number(newPlayer.basePoints) : 0,
      nationality: newPlayer.nationality || 'Tournament Star',
      photo: newPlayer.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      status: 'available',
      soldToTeamId: null,
      soldPrice: null,
    };

    setPlayers(prev => [...prev, playerObj]);
    setNewPlayer({
      name: '',
      position: 'FW',
      rating: 85,
      basePoints: 0,
      nationality: 'Tournament Star',
      photo: '',
    });
    setSetupWarning('');
  };

  // Delete Individual Player
  const handleDeletePlayer = (id) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
  };

  // Clear All Players
  const handleClearAllPlayers = () => {
    if (window.confirm('Delete all players from the draft pool?')) {
      setPlayers([]);
      setCurrentIndex(0);
    }
  };

  // Validation Check to Start Auction (Requires at least 1 team and 1 player)
  const handleTryStartAuction = () => {
    if (teams.length === 0 && players.length === 0) {
      setSetupWarning('Cannot start auction: Please add at least 1 team and 1 player first!');
      return;
    }
    if (teams.length === 0) {
      setSetupWarning('Cannot start auction: Please add at least 1 team first!');
      setSetupTab('teams');
      return;
    }
    if (players.length === 0) {
      setSetupWarning('Cannot start auction: Please add at least 1 player first!');
      setSetupTab('players');
      return;
    }

    setSetupWarning('');
    setViewMode('auction');
  };

  // Live Auction Next/Prev in available queue
  const nextPlayer = () => {
    if (currentIndex < availableQueue.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setErrorMessage('');
    }
  };

  const prevPlayer = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setErrorMessage('');
    }
  };

  // Live Auction: SOLD Handler (Removes player from available queue)
  const handleSold = () => {
    if (!currentPlayer) return;

    const team = teams.find(t => t.id === selectedTeamId);
    if (!team) {
      setErrorMessage('Please select a team.');
      return;
    }

    const points = Number(bidPoints);
    if (isNaN(points) || points < 0) {
      setErrorMessage('Please enter a valid bid points amount (0 or more).');
      return;
    }

    if (team.players.length >= (team.maxPlayers || 7)) {
      setErrorMessage(`${team.name} already reached the maximum squad limit of 7 players.`);
      return;
    }

    if (points > team.remainingPoints) {
      setErrorMessage(`${team.name} only has ${team.remainingPoints} Pts left (cannot afford ${points} Pts).`);
      return;
    }

    const updatedRemaining = team.remainingPoints - points;
    
    // 1. Deduct points and add to team
    setTeams(prevTeams => prevTeams.map(t => {
      if (t.id === team.id) {
        return {
          ...t,
          remainingPoints: updatedRemaining,
          players: [...t.players, { ...currentPlayer, pointsPaid: points }],
        };
      }
      return t;
    }));

    // 2. Mark player as sold in master players list
    setPlayers(prevPlayers => prevPlayers.map(p => {
      if (p.id === currentPlayer.id) {
        return {
          ...p,
          status: 'sold',
          soldToTeamId: team.id,
          soldPrice: points,
        };
      }
      return p;
    }));

    // 3. Confetti burst
    try {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => {
        confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 } });
        confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 } });
      }, 200);
    } catch {}

    // 4. Show middle-of-screen celebration modal
    setSoldCelebration({
      player: currentPlayer,
      team: { ...team, remainingPoints: updatedRemaining, playersCount: team.players.length + 1 },
      price: points,
    });
  };

  const closeCelebrationAndNext = () => {
    setSoldCelebration(null);
    setErrorMessage('');
    // Available queue now excludes the sold player.
    // If current index is beyond the new length, wrap or clamp
    if (currentIndex >= availableQueue.length - 1 && availableQueue.length > 1) {
      setCurrentIndex(0);
    }
  };

  // Live Auction: UNSOLD Handler
  const handleUnsold = () => {
    if (!currentPlayer) return;

    setPlayers(prevPlayers => prevPlayers.map(p => {
      if (p.id === currentPlayer.id) {
        return { ...p, status: 'unsold' };
      }
      return p;
    }));

    if (currentIndex < availableQueue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  // Re-auction / Undo sale: refunds points to team and restores player to available queue
  const handleUndoSale = (playerId) => {
    const playerToUndo = players.find(p => p.id === playerId);
    if (!playerToUndo) return;

    if (playerToUndo.soldToTeamId && playerToUndo.soldPrice !== null) {
      const priceRefund = Number(playerToUndo.soldPrice) || 0;
      setTeams(prevTeams => prevTeams.map(t => {
        if (t.id === playerToUndo.soldToTeamId) {
          return {
            ...t,
            remainingPoints: t.remainingPoints + priceRefund,
            players: t.players.filter(p => p.id !== playerId),
          };
        }
        return t;
      }));
    }

    setPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        return { ...p, status: 'available', soldToTeamId: null, soldPrice: null };
      }
      return p;
    }));
  };

  // Reset to initial demo data
  const handleReset = () => {
    if (window.confirm('Reset all teams and players back to default roster template with 0 base points?')) {
      localStorage.removeItem(STORAGE_KEYS.TEAMS);
      localStorage.removeItem(STORAGE_KEYS.PLAYERS);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_INDEX);
      localStorage.removeItem(STORAGE_KEYS.VIEW_MODE);
      setTeams(INITIAL_TEAMS);
      setPlayers(INITIAL_PLAYERS);
      setCurrentIndex(0);
      setViewMode('setup');
      setErrorMessage('');
      setSetupWarning('');
      setSoldCelebration(null);
    }
  };

  const getPositionBadge = (pos) => {
    switch (pos) {
      case 'FW': return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'MF': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'DF': return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'GK': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      default: return 'bg-slate-500/20 text-slate-300';
    }
  };

  const getTeamById = (teamId) => {
    return teams.find(t => t.id === teamId);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-6 flex flex-col justify-between relative">
      
      {/* Top Navbar */}
      <header className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between pb-4 border-b border-slate-800 mb-6 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-md text-xl">
            ⚽
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-wide">
              FOOTBALL AUCTION SOFTWARE
            </h1>
            <p className="text-xs text-slate-400">
              {teams.length} Teams • {availableQueue.length} Available • {soldPlayersList.length} Sold • 60 Pts Cap
            </p>
          </div>
        </div>

        {/* View Mode Switcher & Reset */}
        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('setup')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'setup'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              1. Setup ({teams.length} Teams, {players.length} Players)
            </button>

            <button
              onClick={handleTryStartAuction}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'auction'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              2. Live Auction Arena ({availableQueue.length} Left)
            </button>
          </div>

          <button
            onClick={handleReset}
            title="Reset to default template"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/40 text-xs font-bold text-slate-300 hover:text-red-300 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 1. SETUP INTERFACE (ADD/REMOVE TEAMS & PLAYERS) */}
      {/* ============================================================ */}
      {viewMode === 'setup' ? (
        <div className="max-w-7xl mx-auto w-full flex-1 space-y-6">
          
          {/* Warning Banner */}
          {setupWarning && (
            <div className="p-4 bg-amber-500/20 border-2 border-amber-500 text-amber-300 rounded-2xl text-sm font-extrabold flex items-center justify-between gap-3 shadow-lg shadow-amber-500/10 animate-bounce">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <span>{setupWarning}</span>
              </div>
              <button
                onClick={() => setSetupWarning('')}
                className="px-2.5 py-1 bg-amber-500/30 rounded-lg text-xs hover:bg-amber-500/50"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Setup Top Banner */}
          <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-400" />
                Tournament Teams & Players Setup
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Base bid starts with <strong>0 Points</strong>. Sold players are automatically removed from the active draft list.
              </p>
            </div>

            <button
              onClick={handleTryStartAuction}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>START AUCTION NOW</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Sub Tabs: Players vs Teams */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSetupTab('players')}
                className={`px-5 py-2.5 rounded-xl text-sm font-extrabold flex items-center gap-2 transition-all ${
                  setupTab === 'players'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Players ({players.length})</span>
              </button>

              <button
                onClick={() => setSetupTab('teams')}
                className={`px-5 py-2.5 rounded-xl text-sm font-extrabold flex items-center gap-2 transition-all ${
                  setupTab === 'teams'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Teams ({teams.length})</span>
              </button>
            </div>

            {/* Clear All Tools */}
            {setupTab === 'players' && players.length > 0 && (
              <button
                onClick={handleClearAllPlayers}
                className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove All Players
              </button>
            )}

            {setupTab === 'teams' && teams.length > 0 && (
              <button
                onClick={handleClearAllTeams}
                className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove All Teams
              </button>
            )}
          </div>

          {/* TAB 1: MANAGE PLAYERS */}
          {setupTab === 'players' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left: Add Player Form */}
              <div className="lg:col-span-4 p-5 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl space-y-4">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-400" />
                  Add Player
                </h3>

                <form onSubmit={handleAddPlayer} className="space-y-3">
                  
                  {/* Image Upload from Device */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Photo (Upload from Device)</label>
                    <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-2xl border border-slate-700">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 flex items-center justify-center flex-shrink-0">
                        {newPlayer.photo ? (
                          <img src={newPlayer.photo} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-slate-500" />
                        )}
                      </div>

                      <div className="flex-1">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold cursor-pointer transition-all">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Choose File</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[11px] text-slate-400 mt-1">Select from phone / PC</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Player Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Player Name"
                      value={newPlayer.name}
                      onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Position</label>
                      <select
                        value={newPlayer.position}
                        onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-emerald-500"
                      >
                        <option value="FW">FW (Forward)</option>
                        <option value="MF">MF (Midfielder)</option>
                        <option value="DF">DF (Defender)</option>
                        <option value="GK">GK (Goalkeeper)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Rating (OVR)</label>
                      <input
                        type="number"
                        min="50"
                        max="99"
                        value={newPlayer.rating}
                        onChange={(e) => setNewPlayer({ ...newPlayer, rating: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-bold text-sm text-center focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Base Bid (Points)</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={newPlayer.basePoints}
                        onChange={(e) => setNewPlayer({ ...newPlayer, basePoints: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 font-bold text-sm text-center focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Info / Role</label>
                      <input
                        type="text"
                        placeholder="e.g. Tournament Star"
                        value={newPlayer.nationality}
                        onChange={(e) => setNewPlayer({ ...newPlayer, nationality: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5 mt-2"
                  >
                    <Plus className="w-4 h-4" />
                    Save & Add Player
                  </button>
                </form>
              </div>

              {/* Right: Existing Players List */}
              <div className="lg:col-span-8 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    All Players ({players.length}):
                  </span>
                  {players.length === 0 && (
                    <span className="text-xs text-amber-400 font-bold">0 players. Please add players to start auction.</span>
                  )}
                </div>

                {players.length === 0 ? (
                  <div className="p-12 bg-slate-900 rounded-3xl border border-dashed border-slate-800 text-center space-y-3">
                    <Users className="w-12 h-12 text-slate-600 mx-auto" />
                    <h4 className="text-base font-bold text-white">No players in the draft pool yet</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Use the form on the left to add players, or click "Reset" at the top to load the default roster.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-1">
                    {players.map((ply, idx) => (
                      <div
                        key={ply.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-2 shadow-md transition-all ${
                          ply.status === 'sold'
                            ? 'bg-slate-900/60 border-emerald-500/30'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xs font-mono font-bold text-slate-500 w-5">{idx + 1}.</span>
                          <img
                            src={ply.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                            alt={ply.name}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-700 flex-shrink-0"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-black text-amber-400">{ply.rating}</span>
                              <span className="px-1 bg-slate-800 rounded text-[9px] font-bold text-slate-300">{ply.position}</span>
                              {ply.status === 'sold' && (
                                <span className="px-1 bg-emerald-500/20 text-emerald-300 rounded text-[9px] font-bold">SOLD</span>
                              )}
                            </div>
                            <h4 className="text-xs font-bold text-white truncate">{ply.name}</h4>
                            <span className="text-[11px] text-slate-400 font-semibold">Base: {ply.basePoints || 0} Pts</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeletePlayer(ply.id)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-500/20 transition-all flex-shrink-0"
                          title="Delete Player"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE TEAMS */}
          {setupTab === 'teams' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left: Add Team Form */}
              <div className="lg:col-span-4 p-5 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl space-y-4">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-400" />
                  Add Team
                </h3>

                <form onSubmit={handleAddTeam} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Team Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Thunderbolts FC"
                      value={newTeam.name}
                      onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Captain Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Haziq bhai"
                      value={newTeam.captain}
                      onChange={(e) => setNewTeam({ ...newTeam, captain: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Badge Icon</label>
                      <input
                        type="text"
                        placeholder="⚡"
                        value={newTeam.badge}
                        onChange={(e) => setNewTeam({ ...newTeam, badge: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-center text-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Starting Points</label>
                      <input
                        type="number"
                        min="10"
                        max="200"
                        value={newTeam.initialPoints}
                        onChange={(e) => setNewTeam({ ...newTeam, initialPoints: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-bold text-sm focus:outline-none focus:border-emerald-500 text-center"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5 mt-2"
                  >
                    <Plus className="w-4 h-4" />
                    Save & Add Team
                  </button>
                </form>
              </div>

              {/* Right: Existing Teams List */}
              <div className="lg:col-span-8 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Current Teams ({teams.length}):
                  </span>
                  {teams.length === 0 && (
                    <span className="text-xs text-amber-400 font-bold">0 teams. Please add at least 1 team.</span>
                  )}
                </div>

                {teams.length === 0 ? (
                  <div className="p-12 bg-slate-900 rounded-3xl border border-dashed border-slate-800 text-center space-y-3">
                    <Shield className="w-12 h-12 text-slate-600 mx-auto" />
                    <h4 className="text-base font-bold text-white">No teams created yet</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Use the form on the left to add participating teams and captains, or click "Reset" at the top.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {teams.map((team) => (
                      <div
                        key={team.id}
                        className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 shadow-md"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{team.badge}</span>
                          <div>
                            <h4 className="text-base font-black text-white">{team.name}</h4>
                            <p className="text-xs text-slate-400">Captain: <strong className="text-amber-400">{team.captain}</strong></p>
                            <span className="text-xs text-emerald-400 font-bold">Budget: {team.remainingPoints} Pts</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteTeam(team.id)}
                          className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-500/20 transition-all"
                          title="Delete Team"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ============================================================ */
        /* 2. LIVE AUCTION ARENA INTERFACE */
        /* ============================================================ */
        teams.length === 0 || players.length === 0 ? (
          <div className="max-w-md mx-auto my-auto p-8 bg-slate-900 rounded-3xl border border-amber-500/40 text-center space-y-4 shadow-2xl">
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
            <h3 className="text-xl font-black text-white">Cannot Run Auction</h3>
            <p className="text-xs text-slate-400">
              You currently have <strong>{teams.length} teams</strong> and <strong>{players.length} players</strong>. Please add teams and players in Setup before starting the draft.
            </p>
            <button
              onClick={() => setViewMode('setup')}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider"
            >
              Go to Setup
            </button>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
            
            {/* LEFT COLUMN: ACTIVE PLAYER SPOTLIGHT & ACTIVE QUEUE (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              
              {errorMessage && (
                <div className="p-3 bg-red-500/20 border border-red-500 text-red-300 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Current Active Player Card */}
              {currentPlayer ? (
                <div className="rounded-3xl bg-slate-900 border-2 border-slate-800 p-5 shadow-2xl relative">
                  
                  {/* Card Nav Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-xs">
                    <button
                      onClick={prevPlayer}
                      disabled={currentIndex === 0}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 flex items-center gap-1 text-slate-300 font-bold"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Prev
                    </button>

                    <span className="font-extrabold text-slate-400">
                      Player <strong className="text-white">{currentIndex + 1}</strong> of {availableQueue.length} Remaining
                    </span>

                    <button
                      onClick={nextPlayer}
                      disabled={currentIndex === availableQueue.length - 1}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 flex items-center gap-1 text-slate-300 font-bold"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Player Details */}
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-between px-2">
                      <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-400 font-black text-sm border border-amber-500/30">
                        {currentPlayer.rating} OVR
                      </span>

                      <span className={`px-3 py-1 rounded-xl text-xs font-extrabold uppercase border ${getPositionBadge(currentPlayer.position)}`}>
                        {currentPlayer.position} • {currentPlayer.positionName || currentPlayer.position}
                      </span>

                      {currentPlayer.status === 'unsold' ? (
                        <span className="px-2.5 py-1 rounded-xl bg-red-500/20 text-red-400 font-bold text-xs border border-red-500/40">
                          UNSOLD
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs">
                          IN DRAFT
                        </span>
                      )}
                    </div>

                    {/* Photo */}
                    <div className="w-32 h-32 mx-auto rounded-2xl overflow-hidden border-2 border-slate-700 shadow-md bg-slate-800">
                      <img
                        src={currentPlayer.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                        alt={currentPlayer.name}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';
                        }}
                      />
                    </div>

                    <div>
                      <h2 className="text-2xl font-black text-white">{currentPlayer.name}</h2>
                      <p className="text-xs text-slate-400">{currentPlayer.nationality || 'Tournament Star'} • Base Bid: <strong>{currentPlayer.basePoints || 0} Pts</strong></p>
                    </div>
                  </div>

                  {/* Bidding Controls Box (Starts at 0) */}
                  <div className="mt-5 pt-4 border-t border-slate-800 space-y-4">
                    
                    {/* 1. Bid Points Input */}
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        1. Enter Winning Bid Points:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={bidPoints}
                          onChange={(e) => setBidPoints(e.target.value)}
                          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border-2 border-slate-700 text-amber-400 font-black text-xl text-center focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          onClick={() => setBidPoints(prev => Number(prev) + 1)}
                          className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => setBidPoints(prev => Number(prev) + 2)}
                          className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm"
                        >
                          +2
                        </button>
                        <button
                          onClick={() => setBidPoints(prev => Number(prev) + 5)}
                          className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm"
                        >
                          +5
                        </button>
                      </div>
                    </div>

                    {/* 2. Team Select Dropdown */}
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        2. Select Winning Team:
                      </label>
                      <select
                        value={selectedTeamId}
                        onChange={(e) => setSelectedTeamId(e.target.value)}
                        className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border-2 border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        {teams.map(t => (
                          <option key={t.id} value={t.id} disabled={t.players.length >= 7}>
                            {t.badge} {t.name} (Cap: {t.captain}) — Budget: {t.remainingPoints} Pts | Squad: {t.players.length}/7 {t.players.length >= 7 ? '- FULL' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 3. Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={handleSold}
                        className="py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <Gavel className="w-4 h-4" />
                        SOLD TO TEAM
                      </button>

                      <button
                        onClick={handleUnsold}
                        className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/40 text-slate-300 hover:text-red-300 font-bold text-sm transition-all flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        UNSOLD
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 bg-slate-900 rounded-3xl text-center space-y-3 border border-emerald-500/30">
                  <Award className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h3 className="text-xl font-black text-white">All Players Have Been Drafted!</h3>
                  <p className="text-xs text-slate-400">
                    All available players are sold. You can view all squad allocations on the right or add more players in Setup.
                  </p>
                  <button
                    onClick={() => setViewMode('setup')}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                  >
                    Add More Players in Setup
                  </button>
                </div>
              )}

              {/* Active Available Queue Jump (Sold players removed) */}
              {availableQueue.length > 0 && (
                <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
                  <span className="text-xs font-bold text-slate-400 block mb-2">
                    Available Queue ({availableQueue.length} Players Left):
                  </span>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {availableQueue.map((p, idx) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setCurrentIndex(idx);
                          setErrorMessage('');
                        }}
                        className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                          idx === currentIndex
                            ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400'
                            : p.status === 'unsold'
                            ? 'bg-slate-950 text-red-400 border border-red-500/30'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <span>{idx + 1}.</span>
                        <span className="truncate max-w-[80px]">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* DEDICATED BELOW SECTION: SOLD PLAYERS LIST */}
              <div className="p-4 bg-slate-900 rounded-3xl border border-slate-800 space-y-3 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    Sold Players List ({soldPlayersList.length} Players Sold)
                  </h4>
                  <span className="text-[11px] text-slate-400">Removed from active draft</span>
                </div>

                {soldPlayersList.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 italic bg-slate-950/50 rounded-2xl border border-dashed border-slate-800">
                    No players sold yet. When a player is sold, they will appear in this list.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {soldPlayersList.map((ply, i) => {
                      const winningTeam = getTeamById(ply.soldToTeamId);
                      return (
                        <div
                          key={ply.id || i}
                          className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-2 text-xs transition-all shadow-sm"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="font-mono text-slate-500 text-[11px] font-bold w-4">#{i + 1}</span>
                            <img
                              src={ply.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                              alt={ply.name}
                              className="w-8 h-8 rounded-xl object-cover border border-slate-700 flex-shrink-0"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
                              }}
                            />
                            <div className="min-w-0">
                              <span className="font-extrabold text-white truncate block">{ply.name}</span>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                <span className="text-amber-400 font-bold">{ply.rating} OVR</span>
                                <span>•</span>
                                <span>{ply.position}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {winningTeam && (
                              <span className="px-2.5 py-1 rounded-xl bg-slate-900 text-[11px] font-bold text-slate-200 border border-slate-700 flex items-center gap-1.5 shadow-sm">
                                <span className="text-sm">{winningTeam.badge}</span>
                                <span className="truncate max-w-[90px]">{winningTeam.name}</span>
                              </span>
                            )}
                            <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 font-black text-xs">
                              {ply.soldPrice || 0} Pts
                            </span>
                            <button
                              onClick={() => handleUndoSale(ply.id)}
                              title="Undo Sale (Put back in draft & refund points)"
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 text-[10px] font-bold border border-slate-700 hover:border-red-500/30 transition-all"
                            >
                              Undo
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: ALL TEAMS OVERVIEW (7 Cols) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  Captain Teams ({teams.length})
                </h3>
                <span className="text-xs text-slate-400">Budget: 60 Pts • Squad: Max 7</span>
              </div>

              {/* Teams Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {teams.map((team) => {
                  const isSelected = selectedTeamId === team.id;
                  const isSquadFull = team.players.length >= 7;

                  return (
                    <div
                      key={team.id}
                      onClick={() => setSelectedTeamId(team.id)}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500'
                          : isSquadFull
                          ? 'bg-slate-900/60 border-slate-800 opacity-60'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Team Top Info */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{team.badge}</span>
                          <div>
                            <h4 className="text-sm font-black text-white leading-tight">{team.name}</h4>
                            <span className="text-xs text-amber-400 font-bold">Cap: {team.captain}</span>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-lg text-xs font-black ${
                          isSquadFull ? 'bg-red-500/20 text-red-300' : 'bg-slate-800 text-slate-200'
                        }`}>
                          {team.players.length} / 7
                        </span>
                      </div>

                      {/* Budget Bar */}
                      <div className="space-y-1 mb-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Remaining Budget:</span>
                          <strong className="text-emerald-400 font-black">{team.remainingPoints} Pts</strong>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                            style={{ width: `${(team.remainingPoints / (team.initialPoints || 60)) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Purchased Players */}
                      <div className="pt-2 border-t border-slate-800/80">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                          Bought ({team.players.length}):
                        </span>
                        {team.players.length === 0 ? (
                          <span className="text-xs text-slate-600 italic">No players yet</span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                            {team.players.map((ply, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1 font-medium"
                              >
                                <span className="text-amber-400 font-bold">{ply.pointsPaid}p</span>
                                <span className="truncate max-w-[90px]">{ply.name}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )
      )}

      {/* ============================================================ */}
      {/* 3. MIDDLE-OF-SCREEN SOLD CELEBRATION MODAL */}
      {/* ============================================================ */}
      {soldCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-400 p-6 text-center shadow-2xl overflow-hidden ring-4 ring-amber-400/20">
            
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

            <button
              onClick={() => setSoldCelebration(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase tracking-wider mb-2 animate-bounce">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              DEAL SEALED!
            </div>

            <h2 className="text-3xl font-black text-white uppercase tracking-wide">
              HAMMER DOWN — <span className="text-amber-400">SOLD!</span>
            </h2>

            {/* Player Snapshot */}
            <div className="my-4 p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3 text-left">
              <img
                src={soldCelebration.player.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                alt={soldCelebration.player.name}
                className="w-16 h-16 rounded-xl object-cover border-2 border-amber-400"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
                }}
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-amber-400">{soldCelebration.player.rating} OVR</span>
                  <span className="text-[10px] px-1 bg-slate-800 rounded text-slate-300 font-bold">{soldCelebration.player.position}</span>
                </div>
                <h3 className="text-lg font-black text-white leading-tight">{soldCelebration.player.name}</h3>
                <span className="text-xs text-slate-400">{soldCelebration.player.nationality || 'Tournament Star'}</span>
              </div>
            </div>

            {/* Winning Team Announcement Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-2 mb-5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Acquired by Franchise:
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">{soldCelebration.team.badge}</span>
                <div className="text-left">
                  <h4 className="text-xl font-black text-white">{soldCelebration.team.name}</h4>
                  <span className="text-xs text-amber-400 font-bold">Captain: {soldCelebration.team.captain}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs px-2">
                <span className="text-slate-400 font-bold">Winning Price:</span>
                <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-black text-base border border-amber-500/30">
                  {soldCelebration.price} PTS
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 px-2">
                <span>Remaining Budget:</span>
                <strong className="text-emerald-400">{soldCelebration.team.remainingPoints} Pts</strong>
              </div>
            </div>

            {/* Next Action Button */}
            <button
              onClick={closeCelebrationAndNext}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Continue to Next Player</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full pt-4 border-t border-slate-800 mt-6 text-center text-xs text-slate-500">
        Football Tournament Player Auction Engine • Fast, Simple & 100% In-Browser
      </footer>
    </div>
  );
}
