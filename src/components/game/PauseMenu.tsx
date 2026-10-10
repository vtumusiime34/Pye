// Triumph League - In-Match Pause & Tactics Menu
import React from 'react';
import { FootballMatch } from '../../game/engine/FootballMatch';
import { TeamFormation, CameraPreset } from '../../game/types';
import { soundEngine } from '../../game/engine/AudioEngine';

interface PauseMenuProps {
  match: FootballMatch;
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
  onCameraChange: (cam: CameraPreset) => void;
  currentCamera: CameraPreset;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  match,
  onResume,
  onRestart,
  onQuit,
  onCameraChange,
  currentCamera,
}) => {
  const formations: TeamFormation[] = ['4-3-3', '4-4-2', '4-2-3-1', '3-5-2'];

  const handleFormationSelect = (fmt: TeamFormation) => {
    match.homeTeam.formation = fmt;
    soundEngine.playButtonClick();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in select-none font-['Chakra_Petch',sans-serif]">
      <div className="w-full max-w-lg rounded-3xl bg-[#090d16] border border-white/20 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header with Live Score */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-[#00f2fe]">
              Match Paused
            </div>
            <h2 className="text-xl font-black text-white tracking-wide">
              {match.homeTeam.name} vs {match.awayTeam.name}
            </h2>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-black border border-white/15 text-lg font-black font-mono text-[#00f2fe]">
            {match.homeScore} : {match.awayScore}
          </div>
        </div>

        {/* Quick Tactics: Formation */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Home Team Formation
          </label>
          <div className="grid grid-cols-4 gap-2">
            {formations.map((fmt) => (
              <button
                key={fmt}
                onClick={() => handleFormationSelect(fmt)}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition border ${
                  match.homeTeam.formation === fmt
                    ? 'bg-[#00f2fe] text-black border-white shadow-lg shadow-[#00f2fe]/20'
                    : 'bg-zinc-900/80 text-zinc-300 border-white/10 hover:border-white/30'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Camera Angle Switcher */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Broadcast Camera Angle
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'tv_broadcast', label: 'TV Broadcast' },
              { id: 'end_to_end', label: 'End to End' },
              { id: 'action_cam', label: 'Action Follow' },
            ].map((cam) => (
              <button
                key={cam.id}
                onClick={() => onCameraChange(cam.id as CameraPreset)}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition border ${
                  currentCamera === cam.id
                    ? 'bg-[#00f2fe] text-black border-white shadow-lg shadow-[#00f2fe]/20'
                    : 'bg-zinc-900/80 text-zinc-300 border-white/10 hover:border-white/30'
                }`}
              >
                {cam.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={onResume}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-black text-sm font-black tracking-wider uppercase shadow-xl hover:scale-[1.02] active:scale-95 transition"
          >
            Resume Match
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onRestart}
              className="py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold text-white uppercase tracking-wider transition"
            >
              Restart Match
            </button>
            <button
              onClick={onQuit}
              className="py-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-xs font-bold text-rose-300 uppercase tracking-wider transition"
            >
              Quit to Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
