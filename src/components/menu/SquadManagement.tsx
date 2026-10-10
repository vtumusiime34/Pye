// Triumph League - Squad Management & Tactics Board
import React, { useState } from 'react';
import { CLUBS } from '../../game/data/clubs';
import { TeamData, PlayerData, TeamFormation } from '../../game/types';
import { soundEngine } from '../../game/engine/AudioEngine';

interface SquadManagementProps {
  currentTeam: TeamData;
  onUpdateTeam: (updated: TeamData) => void;
  onBack: () => void;
}

export const SquadManagement: React.FC<SquadManagementProps> = ({
  currentTeam,
  onUpdateTeam,
  onBack,
}) => {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerData>(currentTeam.players[0]);
  const [formation, setFormation] = useState<TeamFormation>(currentTeam.formation);

  const formations: TeamFormation[] = ['4-3-3', '4-4-2', '4-2-3-1', '3-5-2'];

  const handleFormationChange = (fmt: TeamFormation) => {
    setFormation(fmt);
    const updated = { ...currentTeam, formation: fmt };
    onUpdateTeam(updated);
    soundEngine.playButtonClick();
  };

  const startingXI = currentTeam.players.slice(0, 11);
  const bench = currentTeam.players.slice(11);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20 select-none font-['Chakra_Petch',sans-serif]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-base shadow-xl"
            style={{ backgroundColor: currentTeam.primaryKit.primaryColor }}
          >
            {currentTeam.abbreviation}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#00f2fe]">
              Tactics Board
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {currentTeam.name} — Squad & Formation
            </h2>
          </div>
        </div>

        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition"
        >
          Back
        </button>
      </div>

      {/* Main Grid: Pitch on Left, Player Card & Bench on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 2D Tactical Pitch (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Active Formation
            </span>
            <div className="flex gap-1.5">
              {formations.map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => handleFormationChange(fmt)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
                    formation === fmt
                      ? 'bg-[#00f2fe] text-black border-white shadow-md shadow-[#00f2fe]/20'
                      : 'bg-zinc-900 text-zinc-300 border-white/10 hover:border-white/30'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* 2D Green Pitch Board */}
          <div className="relative w-full aspect-[4/3] rounded-3xl bg-gradient-to-b from-[#1e5225] to-[#143d1a] border-4 border-white/30 shadow-2xl overflow-hidden p-4 flex flex-col justify-between">
            {/* Center Circle & Lines */}
            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-[1px] bg-white/30 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border border-white/30 pointer-events-none" />

            {/* Attackers Row */}
            <div className="flex justify-around items-center pt-2">
              {startingXI.filter((p) => ['ST', 'LW', 'RW'].includes(p.position)).map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPlayer(p);
                    soundEngine.playButtonClick();
                  }}
                  className={`flex flex-col items-center group transition ${
                    selectedPlayer.id === p.id ? 'scale-110' : 'hover:scale-105'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-full border-2 flex items-center justify-center font-bold text-xs shadow-xl ${
                      selectedPlayer.id === p.id
                        ? 'border-[#00f2fe] ring-4 ring-[#00f2fe]/40 text-black bg-[#00f2fe]'
                        : 'border-white text-white'
                    }`}
                    style={{
                      backgroundColor:
                        selectedPlayer.id === p.id ? '#00f2fe' : currentTeam.primaryKit.primaryColor,
                    }}
                  >
                    {p.number}
                  </div>
                  <span className="text-[10px] font-bold text-white tracking-wider mt-1 px-1.5 py-0.5 rounded bg-black/60">
                    {p.shortName}
                  </span>
                </button>
              ))}
            </div>

            {/* Midfielders Row */}
            <div className="flex justify-around items-center py-2">
              {startingXI.filter((p) => ['CM', 'CAM', 'CDM'].includes(p.position)).map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPlayer(p);
                    soundEngine.playButtonClick();
                  }}
                  className={`flex flex-col items-center group transition ${
                    selectedPlayer.id === p.id ? 'scale-110' : 'hover:scale-105'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-full border-2 flex items-center justify-center font-bold text-xs shadow-xl ${
                      selectedPlayer.id === p.id
                        ? 'border-[#00f2fe] ring-4 ring-[#00f2fe]/40 text-black bg-[#00f2fe]'
                        : 'border-white text-white'
                    }`}
                    style={{
                      backgroundColor:
                        selectedPlayer.id === p.id ? '#00f2fe' : currentTeam.primaryKit.primaryColor,
                    }}
                  >
                    {p.number}
                  </div>
                  <span className="text-[10px] font-bold text-white tracking-wider mt-1 px-1.5 py-0.5 rounded bg-black/60">
                    {p.shortName}
                  </span>
                </button>
              ))}
            </div>

            {/* Defenders Row */}
            <div className="flex justify-around items-center py-2">
              {startingXI.filter((p) => ['CB', 'LB', 'RB'].includes(p.position)).map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPlayer(p);
                    soundEngine.playButtonClick();
                  }}
                  className={`flex flex-col items-center group transition ${
                    selectedPlayer.id === p.id ? 'scale-110' : 'hover:scale-105'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-full border-2 flex items-center justify-center font-bold text-xs shadow-xl ${
                      selectedPlayer.id === p.id
                        ? 'border-[#00f2fe] ring-4 ring-[#00f2fe]/40 text-black bg-[#00f2fe]'
                        : 'border-white text-white'
                    }`}
                    style={{
                      backgroundColor:
                        selectedPlayer.id === p.id ? '#00f2fe' : currentTeam.primaryKit.primaryColor,
                    }}
                  >
                    {p.number}
                  </div>
                  <span className="text-[10px] font-bold text-white tracking-wider mt-1 px-1.5 py-0.5 rounded bg-black/60">
                    {p.shortName}
                  </span>
                </button>
              ))}
            </div>

            {/* Goalkeeper */}
            <div className="flex justify-center items-center pb-1">
              {startingXI.filter((p) => p.position === 'GK').map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPlayer(p);
                    soundEngine.playButtonClick();
                  }}
                  className={`flex flex-col items-center group transition ${
                    selectedPlayer.id === p.id ? 'scale-110' : 'hover:scale-105'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-full border-2 flex items-center justify-center font-bold text-xs shadow-xl ${
                      selectedPlayer.id === p.id
                        ? 'border-[#00f2fe] ring-4 ring-[#00f2fe]/40 text-black bg-[#00f2fe]'
                        : 'border-white text-white bg-emerald-600'
                    }`}
                  >
                    {p.number}
                  </div>
                  <span className="text-[10px] font-bold text-white tracking-wider mt-1 px-1.5 py-0.5 rounded bg-black/60">
                    {p.shortName}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Player Card & Attributes (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Player Attributes
          </span>

          <div className="p-5 rounded-3xl bg-[#090d16] border border-white/10 shadow-2xl space-y-4">
            {/* Player Header Card */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#00f2fe]">
                  {selectedPlayer.position} • #{selectedPlayer.number}
                </span>
                <h3 className="text-xl font-black text-white">{selectedPlayer.name}</h3>
                <div className="text-xs text-zinc-400 mt-0.5">
                  Height: {selectedPlayer.heightCm}cm • Foot: {selectedPlayer.preferredFoot}
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00f2fe]/20 to-[#4facfe]/20 border border-[#00f2fe]/40 flex flex-col items-center justify-center font-mono">
                <span className="text-[10px] text-zinc-400 font-bold">OVR</span>
                <span className="text-lg font-black text-[#00f2fe]">
                  {selectedPlayer.overallRating}
                </span>
              </div>
            </div>

            {/* Radar Attributes Bars */}
            <div className="space-y-2.5 text-xs font-mono">
              {[
                { label: 'Pace (PAC)', val: selectedPlayer.attributes.pace },
                { label: 'Shooting (SHO)', val: selectedPlayer.attributes.shooting },
                { label: 'Passing (PAS)', val: selectedPlayer.attributes.passing },
                { label: 'Dribbling (DRI)', val: selectedPlayer.attributes.dribbling },
                { label: 'Defending (DEF)', val: selectedPlayer.attributes.defending },
                { label: 'Physical (PHY)', val: selectedPlayer.attributes.physical },
              ].map((attr) => (
                <div key={attr.label} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-400 font-sans uppercase tracking-wider">
                      {attr.label}
                    </span>
                    <span className="font-bold text-white">{attr.val}</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full ${
                        attr.val >= 85
                          ? 'bg-gradient-to-r from-[#00f2fe] to-[#38ef7d]'
                          : attr.val >= 75
                          ? 'bg-[#00f2fe]'
                          : 'bg-zinc-500'
                      }`}
                      style={{ width: `${attr.val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Substitutes / Bench List */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Substitutes Bench
            </span>
            <div className="space-y-1.5">
              {bench.map((bPlayer) => (
                <button
                  key={bPlayer.id}
                  onClick={() => {
                    setSelectedPlayer(bPlayer);
                    soundEngine.playButtonClick();
                  }}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs transition ${
                    selectedPlayer.id === bPlayer.id
                      ? 'border-[#00f2fe] bg-[#00f2fe]/10 text-white'
                      : 'border-white/5 bg-zinc-900/60 text-zinc-300 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-zinc-400">#{bPlayer.number}</span>
                    <span className="font-bold">{bPlayer.name}</span>
                    <span className="text-[10px] text-zinc-500">{bPlayer.position}</span>
                  </div>
                  <span className="font-mono font-bold text-[#00f2fe]">{bPlayer.overallRating}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
