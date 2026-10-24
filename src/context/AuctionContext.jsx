import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { INITIAL_TEAMS, INITIAL_PLAYERS, INITIAL_SETTINGS } from '../data/initialData';
import { soundFx } from '../utils/audio';

const AuctionContext = createContext(null);

const STORAGE_KEYS = {
  TEAMS: 'FOOTBALL_AUCTION_TEAMS_V1',
  PLAYERS: 'FOOTBALL_AUCTION_PLAYERS_V1',
  LEDGER: 'FOOTBALL_AUCTION_LEDGER_V1',
  SETTINGS: 'FOOTBALL_AUCTION_SETTINGS_V1',
  ACTIVE_AUCTION: 'FOOTBALL_AUCTION_CURRENT_V1',
};

export const AuctionProvider = ({ children }) => {
  // 1. Teams State
  const [teams, setTeams] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEAMS);
      return saved ? JSON.parse(saved) : INITIAL_TEAMS;
    } catch {
      return INITIAL_TEAMS;
    }
  });

  // 2. Players State
  const [players, setPlayers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLAYERS);
      return saved ? JSON.parse(saved) : INITIAL_PLAYERS;
    } catch {
      return INITIAL_PLAYERS;
    }
  });

  // 3. Settings State
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // 4. Auction Ledger State
  const [ledger, setLedger] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LEDGER);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 5. Current Auction State
  const [currentAuction, setCurrentAuction] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_AUCTION);
      return saved ? JSON.parse(saved) : {
        activePlayerId: null,
        baseBid: 0,
        currentBid: 0,
        highestBidderTeamId: null,
        isTimerRunning: false,
        timeLeft: 15,
        bidFeed: [],
      };
    } catch {
      return {
        activePlayerId: null,
        baseBid: 0,
        currentBid: 0,
        highestBidderTeamId: null,
        isTimerRunning: false,
        timeLeft: 15,
        bidFeed: [],
      };
    }
  });

  // 6. Celebration & Notification Modals
  const [soldModalData, setSoldModalData] = useState(null);
  const [unsoldModalData, setUnsoldModalData] = useState(null);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(ledger));
  }, [ledger]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    soundFx.toggleSound(settings.soundEffectsEnabled);
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_AUCTION, JSON.stringify(currentAuction));
  }, [currentAuction]);

  // Active Player helper
  const activePlayer = players.find(p => p.id === currentAuction.activePlayerId) || null;
  const highestBidderTeam = teams.find(t => t.id === currentAuction.highestBidderTeamId) || null;

  // Mark unsold handler (defined with useCallback for timer access)
  const markCurrentPlayerUnsold = useCallback(() => {
    if (!currentAuction.activePlayerId) return;

    const player = players.find(p => p.id === currentAuction.activePlayerId);
    if (!player) return;

    soundFx.playBuzzer();

    // Update player status
    setPlayers(prev => prev.map(p => 
      p.id === player.id 
        ? { ...p, status: 'unsold', soldToTeamId: null, soldPrice: null }
        : p
    ));

    // Add to ledger
    const ledgerEntry = {
      id: 'led-' + Date.now(),
      playerId: player.id,
      playerName: player.name,
      playerPosition: player.position,
      playerPhoto: player.photo,
      teamId: null,
      teamName: 'UNSOLD',
      teamBadge: '❌',
      teamColor: '#64748b',
      points: 0,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'UNSOLD',
    };

    setLedger(prev => [ledgerEntry, ...prev]);

    // Show unsold banner / modal
    setUnsoldModalData(player);

    // Reset current auction
    setCurrentAuction({
      activePlayerId: null,
      baseBid: 0,
      currentBid: 0,
      highestBidderTeamId: null,
      isTimerRunning: false,
      timeLeft: settings.timerDuration || 15,
      bidFeed: [],
    });
  }, [currentAuction.activePlayerId, players, settings.timerDuration]);

  // Sell current player handler
  const sellCurrentPlayer = useCallback(() => {
    if (!currentAuction.activePlayerId) return;

    const player = players.find(p => p.id === currentAuction.activePlayerId);
    if (!player) return;

    // If no bids were placed, it is unsold
    if (!currentAuction.highestBidderTeamId) {
      markCurrentPlayerUnsold();
      return;
    }

    const team = teams.find(t => t.id === currentAuction.highestBidderTeamId);
    if (!team) return;

    const winningBid = currentAuction.currentBid;

    // Audio & Confetti trigger
    soundFx.playGavel();
    setTimeout(() => soundFx.playVictory(), 200);

    // 1. Deduct points from team & add player to team squad
    setTeams(prev => prev.map(t => {
      if (t.id === team.id) {
        return {
          ...t,
          remainingPoints: Math.max(0, t.remainingPoints - winningBid),
          players: [...t.players, { ...player, pointsPaid: winningBid, acquiredAt: new Date().toISOString() }],
        };
      }
      return t;
    }));

    // 2. Mark player as SOLD
    setPlayers(prev => prev.map(p => 
      p.id === player.id 
        ? { ...p, status: 'sold', soldToTeamId: team.id, soldPrice: winningBid }
        : p
    ));

    // 3. Add record to ledger
    const ledgerEntry = {
      id: 'led-' + Date.now(),
      playerId: player.id,
      playerName: player.name,
      playerPosition: player.position,
      playerPhoto: player.photo,
      teamId: team.id,
      teamName: team.name,
      teamBadge: team.badge,
      teamColor: team.color,
      points: winningBid,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'SOLD',
    };

    setLedger(prev => [ledgerEntry, ...prev]);

    // 4. Trigger celebration popup
    setSoldModalData({
      player,
      team,
      price: winningBid,
    });

    // 5. Reset active auction state
    setCurrentAuction({
      activePlayerId: null,
      baseBid: 0,
      currentBid: 0,
      highestBidderTeamId: null,
      isTimerRunning: false,
      timeLeft: settings.timerDuration || 15,
      bidFeed: [],
    });
  }, [currentAuction.activePlayerId, currentAuction.highestBidderTeamId, currentAuction.currentBid, players, teams, settings.timerDuration, markCurrentPlayerUnsold]);

  // Timer interval effect
  const timerRef = useRef(null);

  useEffect(() => {
    if (currentAuction.isTimerRunning && currentAuction.activePlayerId) {
      timerRef.current = setInterval(() => {
        setCurrentAuction(prev => {
          if (!prev.isTimerRunning) return prev;

          if (prev.timeLeft <= 1) {
            clearInterval(timerRef.current);
            // Auto complete on 0
            setTimeout(() => {
              if (prev.highestBidderTeamId) {
                sellCurrentPlayer();
              } else {
                markCurrentPlayerUnsold();
              }
            }, 50);

            return { ...prev, timeLeft: 0, isTimerRunning: false };
          }

          // Sound tick
          if (prev.timeLeft <= 5) {
            soundFx.playTick(true);
          } else if (prev.timeLeft % 2 === 0) {
            soundFx.playTick(false);
          }

          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [currentAuction.isTimerRunning, currentAuction.activePlayerId, sellCurrentPlayer, markCurrentPlayerUnsold]);

  // Start Auction for Player
  const startAuction = (playerId) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    soundFx.playWhistle();

    // Mark previous in_auction player back to available if any
    setPlayers(prev => prev.map(p => {
      if (p.id === playerId) return { ...p, status: 'in_auction' };
      if (p.status === 'in_auction') return { ...p, status: 'available' };
      return p;
    }));

    const duration = settings.timerDuration || 15;

    setCurrentAuction({
      activePlayerId: playerId,
      baseBid: 0,
      currentBid: 0,
      highestBidderTeamId: null,
      isTimerRunning: true, // Auto start countdown
      timeLeft: duration,
      bidFeed: [
        {
          id: 'bid-init-' + Date.now(),
          type: 'SYSTEM',
          text: `Auction started for ${player.name}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        }
      ],
    });
  };

  // Place Bid for a Team
  const placeBid = (teamId, customPoints = null) => {
    if (!currentAuction.activePlayerId) return { success: false, reason: 'No active player in auction.' };

    const team = teams.find(t => t.id === teamId);
    if (!team) return { success: false, reason: 'Team not found.' };

    // Validation 1: Squad Full Check (max 7 players)
    if (team.players.length >= (team.maxPlayers || settings.maxSquadSize || 7)) {
      return { success: false, reason: `${team.name} has already reached the maximum squad limit of 7 players.` };
    }

    // Validation 2: Already highest bidder
    if (currentAuction.highestBidderTeamId === teamId) {
      return { success: false, reason: `${team.name} is already holding the highest bid!` };
    }

    // Determine new bid amount
    let newBidAmount;
    if (customPoints !== null) {
      newBidAmount = customPoints;
    } else {
      if (!currentAuction.highestBidderTeamId) {
        // First bid starts at 1 point
        newBidAmount = 1;
      } else {
        // Increment by 1 point
        newBidAmount = currentAuction.currentBid + 1;
      }
    }

    // Validation 3: Must be higher than current bid (if bids already started)
    if (currentAuction.highestBidderTeamId && newBidAmount <= currentAuction.currentBid) {
      return { success: false, reason: `Bid must be higher than current bid (${currentAuction.currentBid} Pts).` };
    }

    // Validation 4: Remaining points check
    if (newBidAmount > team.remainingPoints) {
      return { 
        success: false, 
        reason: `${team.name} cannot afford ${newBidAmount} Pts (Remaining Budget: ${team.remainingPoints} Pts).` 
      };
    }

    // Validation 5: Squad completion reserve check (optional advisory: must keep at least 1 pt for each remaining empty slot)
    const emptySlots = (team.maxPlayers || 7) - (team.players.length + 1);
    if (team.remainingPoints - newBidAmount < emptySlots) {
      return {
        success: false,
        reason: `Reserve Rule: ${team.name} needs to save at least ${emptySlots} Pts to fill remaining squad spots!`
      };
    }

    // Execute Bid
    soundFx.playBidPing();

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newFeedEntry = {
      id: 'bid-' + Date.now(),
      type: 'BID',
      teamId: team.id,
      teamName: team.name,
      teamBadge: team.badge,
      teamColor: team.color,
      amount: newBidAmount,
      timestamp,
    };

    setCurrentAuction(prev => ({
      ...prev,
      currentBid: newBidAmount,
      highestBidderTeamId: team.id,
      isTimerRunning: true,
      timeLeft: settings.timerDuration || 15, // Reset timer on each bid
      bidFeed: [newFeedEntry, ...prev.bidFeed],
    }));

    return { success: true };
  };

  // Undo last bid
  const undoLastBid = () => {
    if (currentAuction.bidFeed.length <= 1) return;

    const bidsOnly = currentAuction.bidFeed.filter(f => f.type === 'BID');
    if (bidsOnly.length === 0) return;

    if (bidsOnly.length === 1) {
      // Revert to initial state
      setCurrentAuction(prev => ({
        ...prev,
        currentBid: prev.baseBid,
        highestBidderTeamId: null,
        timeLeft: settings.timerDuration || 15,
        bidFeed: prev.bidFeed.slice(1),
      }));
    } else {
      // Revert to 2nd latest bid
      const previousBid = bidsOnly[1];
      setCurrentAuction(prev => ({
        ...prev,
        currentBid: previousBid.amount,
        highestBidderTeamId: previousBid.teamId,
        timeLeft: settings.timerDuration || 15,
        bidFeed: prev.bidFeed.slice(1),
      }));
    }
  };

  // Timer controls
  const toggleTimer = () => {
    setCurrentAuction(prev => ({ ...prev, isTimerRunning: !prev.isTimerRunning }));
  };

  const addTimerTime = (seconds = 5) => {
    setCurrentAuction(prev => ({ ...prev, timeLeft: prev.timeLeft + seconds, isTimerRunning: true }));
  };

  const resetTimer = () => {
    setCurrentAuction(prev => ({ ...prev, timeLeft: settings.timerDuration || 15 }));
  };

  // Re-Auction an Unsold Player
  const reAuctionPlayer = (playerId) => {
    setPlayers(prev => prev.map(p => 
      p.id === playerId ? { ...p, status: 'available' } : p
    ));
    startAuction(playerId);
  };

  // Reset entire tournament data to initial demo state
  const resetTournament = () => {
    if (window.confirm('Are you sure you want to reset all teams, players, and auction records to default tournament state?')) {
      localStorage.removeItem(STORAGE_KEYS.TEAMS);
      localStorage.removeItem(STORAGE_KEYS.PLAYERS);
      localStorage.removeItem(STORAGE_KEYS.LEDGER);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_AUCTION);
      
      setTeams(INITIAL_TEAMS);
      setPlayers(INITIAL_PLAYERS);
      setLedger([]);
      setCurrentAuction({
        activePlayerId: null,
        baseBid: 0,
        currentBid: 0,
        highestBidderTeamId: null,
        isTimerRunning: false,
        timeLeft: settings.timerDuration || 15,
        bidFeed: [],
      });
      setSoldModalData(null);
      setUnsoldModalData(null);
    }
  };

  // Player CRUD
  const addPlayer = (newPlayerData) => {
    const newPlayer = {
      ...newPlayerData,
      id: 'ply-custom-' + Date.now(),
      status: 'available',
      soldToTeamId: null,
      soldPrice: null,
    };
    setPlayers(prev => [newPlayer, ...prev]);
    return newPlayer;
  };

  const updatePlayer = (playerId, updatedFields) => {
    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, ...updatedFields } : p));
  };

  const deletePlayer = (playerId) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId));
  };

  // Team Update
  const updateTeam = (teamId, updatedFields) => {
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, ...updatedFields } : t));
  };

  // Settings Update
  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <AuctionContext.Provider value={{
      teams,
      players,
      settings,
      ledger,
      currentAuction,
      activePlayer,
      highestBidderTeam,
      soldModalData,
      setSoldModalData,
      unsoldModalData,
      setUnsoldModalData,
      startAuction,
      placeBid,
      undoLastBid,
      sellCurrentPlayer,
      markCurrentPlayerUnsold,
      reAuctionPlayer,
      toggleTimer,
      addTimerTime,
      resetTimer,
      resetTournament,
      addPlayer,
      updatePlayer,
      deletePlayer,
      updateTeam,
      updateSettings,
    }}>
      {children}
    </AuctionContext.Provider>
  );
};

export const useAuction = () => {
  const context = useContext(AuctionContext);
  if (!context) {
    throw new Error('useAuction must be used within an AuctionProvider');
  }
  return context;
};
