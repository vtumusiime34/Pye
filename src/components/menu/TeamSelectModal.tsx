// Triumph League - Match Setup & Team Select Modal
import React, { useState } from 'react';
import { CLUBS } from '../../game/data/clubs';
import { TeamData, MatchWeather } from '../../game/types';
import { soundEngine } from '../../game/engine/AudioEngine';

interface TeamSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartMatch: (home: TeamData, away: TeamData, weather: MatchWeather) => void;
}

export const TeamSelectModal: React.FC<TeamSelectModalProps> = ({
  isOpen,
  onClose,
  onStartMatch,
}) => {
  if (!isOpen) return null;

  const [selectedHomeIndex, setSelectedHomeIndex] = useState(0);
  const [selectedAwayIndex, setSelectedAwayIndex] = useState(1);
  const [selectedWeather, setSelectedWeather] = useState<MatchWeather>('night_floodlit');

  const homeClub = CLUBS[selectedHomeIndex];
  const awayClub = CLUBS[selectedAwayIndex];

  const handleStart = () => {
    soundEngine.playWhistle(false);
    onStartMatch(homeClub, awayClub, selectedWeather);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in select-none font-['Chakra_Petch',sans-serif]">
      <div className="w-full max-w-3xl rounded-3xl bg-[#090d16] border border-white/20 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[95vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#00f2fe]">
              Match Setup
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">Select Teams & Stadium</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Home & Away Club Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* HOME CLUB */}
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#00f2fe] uppercase tracking-wider">
                Home Club
              </span>
              <span className="text-xs text-amber-400 font-mono">
                {'★'.repeat(Math.floor(homeClub.starRating))}
              </span>
            </div>

            <div className="space-y-1">
              <select
                value={selectedHomeIndex}
                onChange={(e) => {
                  setSelectedHomeIndex(Number(e.target.value));
                  soundEngine.playButtonClick();
                }}
                className="w-full py-2.5 px-3 bg-black border border-white/20 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-[#00f2fe]"
              >
                {CLUBS.map((club, idx) => (
                  <option key={club.id} value={idx}>
                    {club.name} ({club.city})
                  </option>
                ))}
              </select>
            </div>

            {/* Club Kit Preview */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-black/60 border border-white/5">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-lg"
                style={{ backgroundColor: homeClub.primaryKit.primaryColor }}
              >
                {homeClub.abbreviation}
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">{homeClub.stadiumName}</div>
                <div className="text-zinc-400 text-[11px]">Cap: {homeClub.stadiumCapacity}</div>
              </div>
            </div>
          </div>

          {/* AWAY CLUB */}
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#f59e0b] uppercase tracking-wider">
                Away Club
              </span>
              <span className="text-xs text-amber-400 font-mono">
                {'★'.repeat(Math.floor(awayClub.starRating))}
              </span>
            </div>

            <div className="space-y-1">
              <select
                value={selectedAwayIndex}
                onChange={(e) => {
                  setSelectedAwayIndex(Number(e.target.value));
                  soundEngine.playButtonClick();
                }}
                className="w-full py-2.5 px-3 bg-black border border-white/20 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-[#f59e0b]"
              >
                {CLUBS.map((club, idx) => (
                  <option key={club.id} value={idx}>
                    {club.name} ({club.city})
                  </option>
                ))}
              </select>
            </div>

            {/* Club Kit Preview */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-black/60 border border-white/5">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-lg"
                style={{ backgroundColor: awayClub.primaryKit.primaryColor }}
              >
                {awayClub.abbreviation}
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">{awayClub.stadiumName}</div>
                <div className="text-zinc-400 text-[11px]">Cap: {awayClub.stadiumCapacity}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stadium Atmosphere & Lighting */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Match Conditions & Lighting
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'night_floodlit', label: 'Floodlit Night' },
              { id: 'golden_sunset', label: 'Golden Sunset' },
              { id: 'clear_day', label: 'Clear Daylight' },
            ].map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setSelectedWeather(w.id as MatchWeather)}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition border ${
                  selectedWeather === w.id
                    ? 'bg-[#00f2fe] text-black border-white shadow-lg shadow-[#00f2fe]/20'
                    : 'bg-zinc-900 text-zinc-300 border-white/10 hover:border-white/30'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Row */}
        <div className="pt-2">
          <button
            onClick={handleStart}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00f2fe] via-[#4facfe] to-[#f59e0b] text-black font-black text-base tracking-widest uppercase shadow-2xl hover:scale-[1.01] active:scale-95 transition"
          >
            KICK OFF MATCH
          </button>
        </div>
      </div>
    </div>
  );
};
