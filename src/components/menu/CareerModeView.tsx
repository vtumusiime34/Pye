// Triumph League - Career Mode Manager & Club Hub
import React, { useState } from 'react';
import { CLUBS } from '../../game/data/clubs';
import { TeamData, PlayerData } from '../../game/types';
import { soundEngine } from '../../game/engine/AudioEngine';

interface CareerModeViewProps {
  onPlayNextMatch: (home: TeamData, away: TeamData) => void;
  onBack: () => void;
}

export const CareerModeView: React.FC<CareerModeViewProps> = ({
  onPlayNextMatch,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'hub' | 'transfers' | 'stadium' | 'trophies'>('hub');
  const [userClub, setUserClub] = useState<TeamData>(CLUBS[0]); // Default Apex London
  const [clubBudget, setClubBudget] = useState<number>(45.5); // Millions $
  const [stadiumLevel, setStadiumLevel] = useState<number>(3); // Max 5

  // Market transfer players available for signing
  const [marketPlayers, setMarketPlayers] = useState<PlayerData[]>([
    {
      id: 'mkt_1',
      name: 'Leonardo Da Vinci',
      shortName: 'Da Vinci',
      number: 10,
      position: 'CAM',
      overallRating: 88,
      heightCm: 178,
      skinTone: 'fair',
      hairColor: '#451a03',
      hairStyle: 'curly',
      preferredFoot: 'left',
      attributes: { pace: 84, shooting: 86, passing: 91, dribbling: 90, defending: 60, physical: 74, stamina: 88 },
    },
    {
      id: 'mkt_2',
      name: 'Zack Sterling',
      shortName: 'Z. Sterling',
      number: 7,
      position: 'RW',
      overallRating: 86,
      heightCm: 180,
      skinTone: 'dark',
      hairColor: '#09090b',
      hairStyle: 'buzz',
      preferredFoot: 'right',
      attributes: { pace: 93, shooting: 82, passing: 80, dribbling: 88, defending: 50, physical: 75, stamina: 90 },
    },
    {
      id: 'mkt_3',
      name: 'Diego Santos',
      shortName: 'D. Santos',
      number: 4,
      position: 'CB',
      overallRating: 85,
      heightCm: 191,
      skinTone: 'tan',
      hairColor: '#18181b',
      hairStyle: 'short',
      preferredFoot: 'right',
      attributes: { pace: 78, shooting: 50, passing: 77, dribbling: 72, defending: 87, physical: 86, stamina: 89 },
    },
  ]);

  const handleSignPlayer = (player: PlayerData, costMillions: number) => {
    if (clubBudget < costMillions) {
      alert('Insufficient transfer budget to sign this player.');
      return;
    }
    setClubBudget((b) => Number((b - costMillions).toFixed(1)));
    setUserClub((prev) => ({
      ...prev,
      players: [player, ...prev.players],
    }));
    setMarketPlayers((prev) => prev.filter((p) => p.id !== player.id));
    soundEngine.playWhistle(false);
  };

  const handleUpgradeStadium = () => {
    const cost = 12.0;
    if (clubBudget < cost) {
      alert('Insufficient funds for stadium expansion.');
      return;
    }
    if (stadiumLevel >= 5) return;
    setClubBudget((b) => Number((b - cost).toFixed(1)));
    setStadiumLevel((lvl) => lvl + 1);
    soundEngine.playWhistle(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-20 select-none font-['Chakra_Petch',sans-serif]">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#00f2fe]/20 via-[#4facfe]/15 to-[#f59e0b]/10 border border-[#00f2fe]/30 shadow-2xl backdrop-blur-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-xl shrink-0"
              style={{ backgroundColor: userClub.primaryKit.primaryColor }}
            >
              {userClub.abbreviation}
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#00f2fe]">
                Manager Career Mode
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{userClub.name}</h1>
              <div className="text-xs text-zinc-300 font-mono mt-0.5">
                Transfer Budget: <span className="text-[#00f2fe] font-bold">${clubBudget}M</span> •
                Stadium Cap: {userClub.stadiumCapacity} (Tier {stadiumLevel})
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPlayNextMatch(userClub, CLUBS[1])}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00f2fe] via-[#4facfe] to-[#f59e0b] text-black text-xs font-black tracking-wider uppercase shadow-xl hover:scale-105 active:scale-95 transition"
            >
              Play Matchday
            </button>
            <button
              onClick={onBack}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition"
            >
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center p-1 bg-[#090d16] rounded-2xl border border-white/10">
        {[
          { id: 'hub', label: 'Club Hub' },
          { id: 'transfers', label: 'Transfer Market' },
          { id: 'stadium', label: 'Stadium Upgrades' },
          { id: 'trophies', label: 'Trophy Cabinet' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setActiveTab(t.id as any);
              soundEngine.playButtonClick();
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === t.id
                ? 'bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-black shadow-lg shadow-[#00f2fe]/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 1. CLUB HUB */}
      {activeTab === 'hub' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-[#090d16] border border-white/10 space-y-1">
            <div className="text-[11px] font-bold text-zinc-400 uppercase">League Position</div>
            <div className="text-3xl font-black text-[#00f2fe] font-mono">1st Place</div>
            <div className="text-xs text-zinc-400">35 Points • 14 Matches</div>
          </div>
          <div className="p-5 rounded-3xl bg-[#090d16] border border-white/10 space-y-1">
            <div className="text-[11px] font-bold text-zinc-400 uppercase">Club Value</div>
            <div className="text-3xl font-black text-[#f59e0b] font-mono">$248.0M</div>
            <div className="text-xs text-zinc-400">Global Rank #3</div>
          </div>
          <div className="p-5 rounded-3xl bg-[#090d16] border border-white/10 space-y-1">
            <div className="text-[11px] font-bold text-zinc-400 uppercase">Squad Strength</div>
            <div className="text-3xl font-black text-emerald-400 font-mono">88 OVR</div>
            <div className="text-xs text-zinc-400">{userClub.players.length} Registered Squad</div>
          </div>
        </div>
      )}

      {/* 2. TRANSFER MARKET */}
      {activeTab === 'transfers' && (
        <div className="p-5 rounded-3xl bg-[#090d16] border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Scouted Transfer Targets</h3>
            <span className="text-xs text-[#00f2fe] font-mono">
              Available Budget: ${clubBudget}M
            </span>
          </div>

          <div className="space-y-3">
            {marketPlayers.map((player) => (
              <div
                key={player.id}
                className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-black border border-white/10 flex flex-col items-center justify-center font-mono">
                    <span className="text-[9px] text-zinc-400">{player.position}</span>
                    <span className="text-xs font-black text-[#00f2fe]">{player.overallRating}</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{player.name}</div>
                    <div className="text-xs text-zinc-400">
                      PAC {player.attributes.pace} • SHO {player.attributes.shooting} • PAS {player.attributes.passing}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-amber-400">$18.5M</span>
                  <button
                    onClick={() => handleSignPlayer(player, 18.5)}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-xs font-black uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition"
                  >
                    Sign Player
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. STADIUM UPGRADES */}
      {activeTab === 'stadium' && (
        <div className="p-6 rounded-3xl bg-[#090d16] border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">{userClub.stadiumName}</h3>
              <p className="text-xs text-zinc-400">
                Current Capacity: {userClub.stadiumCapacity} • Tier {stadiumLevel} of 5
              </p>
            </div>
            <button
              onClick={handleUpgradeStadium}
              disabled={stadiumLevel >= 5}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-black text-xs font-black uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition disabled:opacity-40"
            >
              {stadiumLevel >= 5 ? 'Max Upgrade Reached' : 'Upgrade Stadium ($12.0M)'}
            </button>
          </div>

          <div className="grid grid-cols-5 gap-2 pt-2">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <div
                key={lvl}
                className={`p-3 rounded-xl border text-center ${
                  lvl <= stadiumLevel
                    ? 'border-[#00f2fe] bg-[#00f2fe]/10 text-white'
                    : 'border-white/5 bg-zinc-900/40 text-zinc-500'
                }`}
              >
                <div className="text-[10px] font-bold uppercase">Tier {lvl}</div>
                <div className="text-xs font-mono font-bold mt-1">
                  {lvl * 15 + 20},000 seats
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. TROPHY CABINET */}
      {activeTab === 'trophies' && (
        <div className="p-6 rounded-3xl bg-[#090d16] border border-white/10 shadow-2xl space-y-4">
          <h3 className="text-base font-bold text-white">Club Honours & Silverware</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { title: 'Triumph League Cup', count: 3, year: '2025' },
              { title: 'Champions Shield', count: 2, year: '2024' },
              { title: 'Global Supercup', count: 1, year: '2023' },
              { title: 'Pioneer Invitational', count: 4, year: '2025' },
            ].map((t) => (
              <div
                key={t.title}
                className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 text-center space-y-1"
              >
                <div className="text-2xl">🏆</div>
                <div className="text-xs font-bold text-white mt-1">{t.title}</div>
                <div className="text-sm font-black text-amber-400 font-mono">x{t.count}</div>
                <div className="text-[10px] text-zinc-500">Latest: {t.year}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
