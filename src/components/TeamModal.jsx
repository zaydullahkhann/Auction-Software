import React, { useState, useEffect } from 'react';
import { X, Save, Shield } from 'lucide-react';
import { useAuction } from '../context/AuctionContext';

export const TeamModal = ({ isOpen, onClose, team = null }) => {
  const { updateTeam } = useAuction();

  const [formData, setFormData] = useState({
    name: '',
    captain: '',
    badge: '⚡',
    color: '#06b6d4',
    accentColor: '#67e8f9',
  });

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name || '',
        captain: team.captain || '',
        badge: team.badge || '🛡️',
        color: team.color || '#06b6d4',
        accentColor: team.accentColor || '#67e8f9',
      });
    }
  }, [team, isOpen]);

  if (!isOpen || !team) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    updateTeam(team.id, formData);
    onClose();
  };

  const badgePresets = ['⚡', '🔥', '🌌', '👑', '🐍', '🛡️', '🦅', '🌊', '🦁', '🐺', '⭐', '🚀'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pitch-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md glass-panel-elevated rounded-3xl p-6 border border-pitch-600 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-pitch-900 border border-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-500 to-cyan-500 p-[2px]">
            <div className="w-full h-full bg-pitch-900 rounded-[10px] flex items-center justify-center text-xl">
              {formData.badge}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-extrabold font-display text-white">
              Edit Franchise Details
            </h2>
            <p className="text-xs text-slate-400">
              Customize team identity, captain name, and team colors.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Franchise Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-pitch-900 border border-pitch-700 text-white text-sm focus:outline-none focus:border-violet-400"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Team Captain Name</label>
            <input
              type="text"
              required
              value={formData.captain}
              onChange={(e) => setFormData({ ...formData, captain: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-pitch-900 border border-pitch-700 text-white text-sm focus:outline-none focus:border-violet-400"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Badge Icon Emoji</label>
            <div className="flex flex-wrap gap-2">
              {badgePresets.map(emoji => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setFormData({ ...formData, badge: emoji })}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center border transition-all ${
                    formData.badge === emoji
                      ? 'bg-violet-500/30 border-violet-400 shadow-md scale-110'
                      : 'bg-pitch-900 border-pitch-700 hover:bg-pitch-800'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Theme Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <span className="text-xs font-mono text-slate-400">{formData.color}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Accent Highlight</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.accentColor}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <span className="text-xs font-mono text-slate-400">{formData.accentColor}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-pitch-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-pitch-800 hover:bg-pitch-700 border border-slate-700 text-slate-300 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-400 hover:to-cyan-400 text-pitch-950 font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
