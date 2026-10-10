// Triumph League - Championship League Table, Fixtures & Golden Boot
import React, { useState } from 'react';
import { CLUBS } from '../../game/data/clubs';
import { TeamData, LeagueStanding } from '../../game/types';
import { soundEngine } from '../../game/engine/AudioEngine';

interface LeagueViewProps {
  onPlayFixture: (home: TeamData, away: TeamData) => void;
  onBack: () => void;
}

export const LeagueView: React.FC<LeagueViewProps> = ({ onPlayFixture, onBack }) => {
  const [activeTab, setActiveTab] = useState<'standings' | 'fixtures' | 'stats'>('standings');

  // Initial simulated standings
  const [standings] = useState<LeagueStanding[]>([
    { teamId: 'apex_london', played: 14, won: 11, drawn: 2, lost: 1, goalsFor: 34, goalsAgainst: 11, goalDifference: 23, points: 35, form: ['W', 'W', 'W', 'D', 'W'] },
    { teamId: 'real_vanguard', played: 14, won: 10, drawn: 3, lost: 1, goalsFor: 32, goalsAgainst: 12, goalDifference: 20, points: 33, form: ['W', 'W', 'D', 'W', 'W'] },
    { teamId: 'bavaria_titans', played: 14, won: 9, drawn: 3, lost: 2, goalsFor: 30, goalsAgainst: 15, goalDifference: 15, points: 30, form: ['W', 'L', 'W', 'W', 'D'] },
    { teamId: 'rio_stars', played: 14, won: 8, drawn: 3, lost: 3, goalsFor: 28, goalsAgainst: 18, goalDifference: 10, points: 27, form: ['D', 'W', 'W', 'L', 'W'] },
    { teamId: 'milan_interstellar', played: 14, won: 7, drawn: 4, lost: 3, goalsFor: 22, goalsAgainst: 16, goalDifference: 6, points: 25, form: ['W', 'D', 'D', 'W', 'L'] },
    { teamId: 'neo_tokyo', played: 14, won: 6, drawn: 2, lost: 6, goalsFor: 20, goalsAgainst: 22, goalDifference: -2, points: 20, form: ['L', 'W', 'L', 'W', 'D'] },
  ]);

  const topScorers = [
    { rank: 1, name: "Kylian M'Baye", team: 'Real Vanguard Madrid', goals: 14, assists: 5 },
    { rank: 2, name: 'Marcus Kensley', team: 'Apex London FC', goals: 13, assists: 4 },
    { rank: 3, name: 'Harry Kane', team: 'Bavaria Titans', goals: 11, assists: 7 },
    { rank: 4, name: 'Lautaro Martinez', team: 'Milan Interstellar', goals: 9, assists: 3 },
    { rank: 5, name: 'Gabriel Jesus', team: 'Rio De Janeiro Stars', goals: 8, assists: 6 },
  ];

  const fixtures = [
    { id: 'f1', round: 15, homeId: 'apex_london', awayId: 'real_vanguard', date: 'Saturday, 17:30' },
    { id: 'f2', round: 15, homeId: 'bavaria_titans', awayId: 'milan_interstellar', date: 'Saturday, 20:00' },
    { id: 'f3', round: 15, homeId: 'neo_tokyo', awayId: 'rio_stars', date: 'Sunday, 15:00' },
  ];

  const getClub = (id: string) => CLUBS.find((c) => c.id === id) || CLUBS[0];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-20 select-none font-['Chakra_Petch',sans-serif]">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#00f2fe]/20 via-[#4facfe]/15 to-[#f59e0b]/10 border border-[#00f2fe]/30 shadow-2xl backdrop-blur-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#00f2fe]/20 border border-[#00f2fe]/40 text-[#00f2fe] text-[10px] font-bold uppercase tracking-wider mb-2">
              Season 2026 Championship
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              TRIUMPH LEAGUE
            </h1>
            <p className="text-xs text-zinc-300 max-w-md mt-1">
              Compete across 14 fixtures for the prestigious Triumph Cup and European qualification.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPlayFixture(CLUBS[0], CLUBS[1])}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00f2fe] via-[#4facfe] to-[#f59e0b] text-black text-xs font-black tracking-wider uppercase shadow-xl hover:scale-105 active:scale-95 transition"
            >
              Play Next Match
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

      {/* Tabs Switcher */}
      <div className="flex items-center p-1 bg-[#090d16] rounded-2xl border border-white/10">
        {[
          { id: 'standings', label: 'League Table' },
          { id: 'fixtures', label: 'Matchday Fixtures' },
          { id: 'stats', label: 'Golden Boot & Stats' },
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

      {/* 1. STANDINGS TABLE */}
      {activeTab === 'standings' && (
        <div className="p-5 rounded-3xl bg-[#090d16] border border-white/10 shadow-2xl overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400 text-[10px] uppercase tracking-wider">
                <th className="py-2.5 pl-2">Pos</th>
                <th className="py-2.5">Club</th>
                <th className="py-2.5 text-center">PL</th>
                <th className="py-2.5 text-center">W</th>
                <th className="py-2.5 text-center">D</th>
                <th className="py-2.5 text-center">L</th>
                <th className="py-2.5 text-center">GF</th>
                <th className="py-2.5 text-center">GA</th>
                <th className="py-2.5 text-center">GD</th>
                <th className="py-2.5 text-center font-bold text-white">PTS</th>
                <th className="py-2.5 pr-2 text-right">Form</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {standings.map((s, idx) => {
                const club = getClub(s.teamId);
                const isLeader = idx === 0;
                return (
                  <tr
                    key={s.teamId}
                    className={`hover:bg-white/5 transition ${
                      isLeader ? 'bg-[#00f2fe]/5' : ''
                    }`}
                  >
                    <td className="py-3 pl-2 font-bold text-zinc-300">
                      <span className={isLeader ? 'text-[#00f2fe]' : ''}>#{idx + 1}</span>
                    </td>
                    <td className="py-3 font-sans font-bold text-white flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full border border-white/40 shrink-0"
                        style={{ backgroundColor: club.primaryKit.primaryColor }}
                      />
                      <span>{club.name}</span>
                    </td>
                    <td className="py-3 text-center text-zinc-300">{s.played}</td>
                    <td className="py-3 text-center text-zinc-300">{s.won}</td>
                    <td className="py-3 text-center text-zinc-300">{s.drawn}</td>
                    <td className="py-3 text-center text-zinc-300">{s.lost}</td>
                    <td className="py-3 text-center text-zinc-400">{s.goalsFor}</td>
                    <td className="py-3 text-center text-zinc-400">{s.goalsAgainst}</td>
                    <td className="py-3 text-center font-bold text-zinc-200">
                      {s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}
                    </td>
                    <td className="py-3 text-center font-black text-sm text-[#00f2fe]">
                      {s.points}
                    </td>
                    <td className="py-3 pr-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {s.form.map((f, i) => (
                          <span
                            key={i}
                            className={`w-4 h-4 rounded text-[9px] font-black flex items-center justify-center ${
                              f === 'W'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : f === 'D'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            }`}
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. FIXTURES */}
      {activeTab === 'fixtures' && (
        <div className="space-y-3">
          {fixtures.map((f) => {
            const h = getClub(f.homeId);
            const a = getClub(f.awayId);
            return (
              <div
                key={f.id}
                className="p-4 rounded-2xl bg-[#090d16] border border-white/10 flex items-center justify-between hover:border-white/20 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-zinc-400">RND {f.round}</span>
                  <span className="text-xs font-bold text-white">{h.name}</span>
                  <span className="text-xs font-mono text-zinc-500">VS</span>
                  <span className="text-xs font-bold text-white">{a.name}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-400 font-mono">{f.date}</span>
                  <button
                    onClick={() => onPlayFixture(h, a)}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-black text-xs font-black uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition"
                  >
                    Play Match
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. GOLDEN BOOT & STATS */}
      {activeTab === 'stats' && (
        <div className="p-5 rounded-3xl bg-[#090d16] border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Triumph League Golden Boot Leaders</h3>
            <span className="text-xs text-amber-400 font-mono">★ Top Scorers</span>
          </div>

          <div className="space-y-2">
            {topScorers.map((ts) => (
              <div
                key={ts.rank}
                className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-black border border-white/10 flex items-center justify-center text-xs font-black text-[#00f2fe]">
                    #{ts.rank}
                  </span>
                  <div>
                    <div className="text-sm font-bold text-white">{ts.name}</div>
                    <div className="text-xs text-zinc-400">{ts.team}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div>
                    <span className="text-zinc-500 text-[10px] block">Assists</span>
                    <span className="text-zinc-300 font-bold">{ts.assists}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[10px] block">Goals</span>
                    <span className="text-[#00f2fe] text-sm font-black">{ts.goals} ⚽</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
