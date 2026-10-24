import React, { useState, useEffect } from 'react';
import { X, Save, Shield, Upload, Image as ImageIcon } from 'lucide-react';
import { useAuction } from '../context/AuctionContext';

export const TeamModal = ({ isOpen, onClose, team = null }) => {
  const { updateTeam } = useAuction();

  const [formData, setFormData] = useState({
    name: '',
    captain: '',
    badge: '⚡',
    image: '',
    color: '#06b6d4',
    accentColor: '#67e8f9',
  });

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name || '',
        captain: team.captain || '',
        badge: team.badge || '🛡️',
        image: team.image || '',
        color: team.color || '#06b6d4',
        accentColor: team.accentColor || '#67e8f9',
      });
    }
  }, [team, isOpen]);

  if (!isOpen || !team) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('File size is too large. Please select an image under 3MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-500 to-cyan-500 p-[2px] overflow-hidden flex-shrink-0">
            <div className="w-full h-full bg-pitch-900 rounded-[10px] flex items-center justify-center overflow-hidden">
              {formData.image ? (
                <img src={formData.image} alt={formData.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl">{formData.badge}</span>
              )}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-extrabold font-display text-white">
              Edit Franchise Details
            </h2>
            <p className="text-xs text-slate-400">
              Customize team logo, captain name, and team colors.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Team Logo / Image Upload */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Team Logo / Image (Upload)</label>
            <div className="flex items-center gap-3 p-3 bg-pitch-900 rounded-2xl border border-pitch-700">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-pitch-950 border border-pitch-700 flex items-center justify-center flex-shrink-0">
                {formData.image ? (
                  <img src={formData.image} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-500" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-500/20 border border-violet-500/40 text-violet-300 hover:bg-violet-500/30 text-xs font-bold cursor-pointer transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {formData.image && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                      className="px-2 py-1 rounded-xl bg-pitch-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 text-[11px] font-bold transition-all"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-400">Select team logo from device</p>
              </div>
            </div>
          </div>

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
