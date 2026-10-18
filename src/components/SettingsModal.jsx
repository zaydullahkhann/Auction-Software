import React from 'react';
import { 
  X, 
  Settings, 
  Volume2, 
  VolumeX, 
  Clock, 
  RotateCcw, 
  ShieldAlert, 
  HelpCircle,
  Zap,
  Award
} from 'lucide-react';
import { useAuction } from '../context/AuctionContext';

export const SettingsModal = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetTournament } = useAuction();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pitch-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-pitch-600 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-pitch-900 border border-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-[2px]">
            <div className="w-full h-full bg-pitch-900 rounded-[10px] flex items-center justify-center">
              <Settings className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-extrabold font-display text-white">
              Tournament Auction Rules & Settings
            </h2>
            <p className="text-xs text-slate-400">
              Configure timer lengths, sound effects, and draft governance.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Timer Duration Preference */}
          <div className="p-4 rounded-2xl bg-pitch-900/80 border border-pitch-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-bold text-white">Bid Countdown Timer</span>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400">{settings.timerDuration} Seconds</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[10, 15, 20, 30].map(duration => (
                <button
                  key={duration}
                  onClick={() => updateSettings({ timerDuration: duration })}
                  className={`py-2 rounded-xl text-xs font-black transition-all ${
                    settings.timerDuration === duration
                      ? 'bg-cyan-500 text-pitch-950 shadow-md shadow-cyan-500/20'
                      : 'bg-pitch-950 border border-pitch-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {duration}s
                </button>
              ))}
            </div>
          </div>

          {/* Sound FX Switch */}
          <div className="p-4 rounded-2xl bg-pitch-900/80 border border-pitch-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                {settings.soundEffectsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Live Broadcast Audio SFX</h4>
                <p className="text-[11px] text-slate-400">Referee whistle, hammer strike, countdown ticks, and cheering.</p>
              </div>
            </div>

            <button
              onClick={() => updateSettings({ soundEffectsEnabled: !settings.soundEffectsEnabled })}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.soundEffectsEnabled ? 'bg-emerald-500' : 'bg-pitch-950 border border-pitch-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 ${
                  settings.soundEffectsEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Tournament Rules Summary */}
          <div className="p-4 rounded-2xl bg-pitch-900/60 border border-pitch-800 space-y-2 text-xs text-slate-300">
            <h4 className="font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Tournament Draft Rules & Safeguards:
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
              <li><strong>8 Participating Teams:</strong> Each starts with a purse of 60 points.</li>
              <li><strong>Squad Limit:</strong> Maximum 7 players allowed per team roster.</li>
              <li><strong>Points Currency:</strong> Bids are strictly in points, never real money.</li>
              <li><strong>Live Bidding:</strong> Captains place point bids in +1, +2, or +5 increments.</li>
              <li><strong>Reserve Safeguard:</strong> Teams must preserve enough points to complete their roster.</li>
              <li><strong>Unsold Handling:</strong> Unsold players can be re-auctioned at any time.</li>
            </ul>
          </div>

          {/* Factory Reset */}
          <div className="pt-4 border-t border-pitch-700 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-rose-400">Reset Tournament</h4>
              <p className="text-[10px] text-slate-500">Restore 8 initial teams and demo player pool.</p>
            </div>

            <button
              onClick={() => {
                resetTournament();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-extrabold text-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All Tournament Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
