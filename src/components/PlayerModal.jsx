import React, { useState, useEffect } from 'react';
import { X, Save, UserPlus, Image as ImageIcon, Shield, Sparkles } from 'lucide-react';
import { useAuction } from '../context/AuctionContext';

export const PlayerModal = ({ isOpen, onClose, initialData = null }) => {
  const { addPlayer, updatePlayer } = useAuction();

  const [formData, setFormData] = useState({
    name: '',
    position: 'FW',
    positionName: 'Forward',
    nationality: 'Spain',
    photo: 'https://images.unsplash.com/photo-1508341591423-4347099e1f19?w=400&auto=format&fit=crop&q=80',
    preferredFoot: 'Right',
    age: 24,
    stats: {
      pac: 84,
      sho: 82,
      pas: 80,
      dri: 85,
      def: 50,
      phy: 76,
    }
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        position: initialData.position || 'FW',
        positionName: initialData.positionName || 'Forward',
        nationality: initialData.nationality || 'Spain',
        photo: initialData.photo || 'https://images.unsplash.com/photo-1508341591423-4347099e1f19?w=400&auto=format&fit=crop&q=80',
        preferredFoot: initialData.preferredFoot || 'Right',
        age: initialData.age || 24,
        stats: {
          pac: initialData.stats?.pac || 80,
          sho: initialData.stats?.sho || 80,
          pas: initialData.stats?.pas || 80,
          dri: initialData.stats?.dri || 80,
          def: initialData.stats?.def || 60,
          phy: initialData.stats?.phy || 75,
        }
      });
    } else {
      setFormData({
        name: '',
        position: 'FW',
        positionName: 'Forward',
        nationality: 'Spain',
        photo: 'https://images.unsplash.com/photo-1508341591423-4347099e1f19?w=400&auto=format&fit=crop&q=80',
        preferredFoot: 'Right',
        age: 24,
        stats: {
          pac: 84,
          sho: 82,
          pas: 80,
          dri: 85,
          def: 50,
          phy: 76,
        }
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (initialData) {
      updatePlayer(initialData.id, formData);
    } else {
      addPlayer(formData);
    }
    onClose();
  };

  const handlePositionChange = (pos) => {
    let posName = 'Forward';
    if (pos === 'MF') posName = 'Midfielder';
    if (pos === 'DF') posName = 'Defender';
    if (pos === 'GK') posName = 'Goalkeeper';

    setFormData(prev => ({
      ...prev,
      position: pos,
      positionName: posName,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pitch-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl glass-panel-elevated rounded-3xl p-6 border border-pitch-600 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-pitch-900 border border-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 p-[2px]">
            <div className="w-full h-full bg-pitch-900 rounded-[10px] flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-extrabold font-display text-white">
              {initialData ? 'Edit Footballer Details' : 'Add New Draft Player'}
            </h2>
            <p className="text-xs text-slate-400">
              Configure player auction base points, role, and attributes.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Player Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Sergio Ramos"
                className="w-full px-3.5 py-2 rounded-xl bg-pitch-900 border border-pitch-700 text-white text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Nationality / Country</label>
              <input
                type="text"
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                placeholder="e.g. Spain"
                className="w-full px-3.5 py-2 rounded-xl bg-pitch-900 border border-pitch-700 text-white text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Position Selection */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Role / Position</label>
            <div className="grid grid-cols-4 gap-2">
              {['FW', 'MF', 'DF', 'GK'].map(pos => (
                <button
                  type="button"
                  key={pos}
                  onClick={() => handlePositionChange(pos)}
                  className={`py-2 rounded-xl text-xs font-black transition-all ${
                    formData.position === pos
                      ? 'bg-cyan-500 text-pitch-950 shadow-md shadow-cyan-500/20'
                      : 'bg-pitch-900 border border-pitch-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {/* Age */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Age</label>
            <input
              type="number"
              min="16"
              max="45"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 24 })}
              className="w-full px-3.5 py-2 rounded-xl bg-pitch-900 border border-pitch-700 text-white text-sm focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Photo URL */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Player Photo Image URL</label>
            <input
              type="url"
              value={formData.photo}
              onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2 rounded-xl bg-pitch-900 border border-pitch-700 text-white text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Key Attributes / Stats */}
          <div className="pt-2 border-t border-pitch-700">
            <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-2">
              Attributes / Card Stats (0-99)
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {['pac', 'sho', 'pas', 'dri', 'def', 'phy'].map(statKey => (
                <div key={statKey} className="text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    {statKey}
                  </span>
                  <input
                    type="number"
                    min="20"
                    max="99"
                    value={formData.stats[statKey]}
                    onChange={(e) => setFormData({
                      ...formData,
                      stats: {
                        ...formData.stats,
                        [statKey]: parseInt(e.target.value) || 75
                      }
                    })}
                    className="w-full text-center px-2 py-1.5 rounded-lg bg-pitch-900 border border-pitch-700 text-white font-bold text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-pitch-700">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-pitch-800 hover:bg-pitch-700 border border-slate-700 text-slate-300 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-pitch-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {initialData ? 'Update Player' : 'Save to Pool'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
