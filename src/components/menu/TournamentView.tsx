// Triumph League - Knockout Cup Tournament Mode
import React, { useState } from 'react';
import { CLUBS } from '../../game/data/clubs';
import { TeamData } from '../../game/types';
import { soundEngine } from '../../game/engine/AudioEngine';
import confetti from 'canvas-confetti';

interface TournamentViewProps {
  onPlayMatch: (home: TeamData, away: TeamData) => void;
  onBack: () => void;
}

interface BracketMatch {
  id: string;
  round: 'quarter' | 'semi' | 'final';
  homeTeam: TeamData;
  awayTeam: TeamData;
  homeScore?: number;
  awayScore?: number;
  completed: boolean;
  winnerId?: string;
}

export const TournamentView: React.FC<TournamentViewProps> = ({ onPlayMatch, onBack }) => {
  const [selectedClub, setSelectedClub] = useState<TeamData>(CLUBS[0]);
  const [currentRound, setCurrentRound] = useState<'quarter' | 'semi' | 'final'>('quarter');
  const [matches, setMatches] = useState<BracketMatch[]>([
    // Quarter-Finals
    { id: 'q1', round: 'quarter', homeTeam: CLUBS[0], awayTeam: CLUBS[5], homeScore: 3, awayScore: 1, completed: true, winnerId: CLUBS[0].id },
    { id: 'q2', round: 'quarter', homeTeam: CLUBS[1], awayTeam: CLUBS[4], homeScore: 2, awayScore: 0, completed: true, winnerId: CLUBS[1].id },
    { id: 'q3', round: 'quarter', homeTeam: CLUBS[2], awayTeam: CLUBS[3], completed: false },
    { id: 'q4', round: 'quarter', homeTeam: CLUBS[3], awayTeam: CLUBS[2], completed: false },
    // Semi-Finals
    { id: 's1', round: 'semi', homeTeam: CLUBS[0], awayTeam: CLUBS[1], completed: false },
    { id: 's2', round: 'semi', homeTeam: CLUBS[2], awayTeam: CLUBS[3], completed: false },
    // Final
    { id: 'f1', round: 'final', homeTeam: CLUBS[0], awayTeam: CLUBS[2], completed: false },
  ]);

  const [champion, setChampion] = useState<TeamData | null>(null);

  const handleSimulateSemi = () => {
    soundEngine.playWhistle(true);
    setMatches((prev) =>
      prev.map((m) =>
        m.id === 's1'
          ? { ...m, homeScore: 2, awayScore: 1, completed: true, winnerId: CLUBS[0].id }
          : m.id === 's2'
          ? { ...m, homeScore: 0, awayScore: 2, completed: true, winnerId: CLUBS[2].id }
          : m
      )
    );
    setCurrentRound('final');
  };

  const handleClaimTrophy = () => {
    setChampion(selectedClub);
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#00f2fe', '#4facfe', '#f59e0b', '#ffd700'],
    });
    soundEngine.playGoalRoar();
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20 select-none font-['Chakra_Petch',sans-serif]">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#f59e0b]/20 via-[#4facfe]/15 to-[#00f2fe]/20 border border-[#f59e0b]/40 shadow-2xl backdrop-blur-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#f59e0b]/20 border border-[#f59e0b]/40 text-[#f59e0b] text-[10px] font-bold uppercase tracking-wider mb-2">
              Knockout Tournament
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              TRIUMPH CHAMPIONS CUP
            </h1>
            <p className="text-xs text-zinc-300 max-w-md mt-1">
              Survive the single-elimination tournament to lift the continental crown.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onPlayMatch(CLUBS[0], CLUBS[1])}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-black font-extrabold text-xs shadow-lg hover:scale-105 active:scale-95 transition"
            >
              Play Match
            </button>
            <button
              onClick={onBack}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition"
            >
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Champion Podium Modal if won */}
      {champion && (
        <div className="p-8 rounded-3xl bg-gradient-to-b from-[#f59e0b]/25 via-zinc-900 to-black border border-[#f59e0b]/50 shadow-2xl text-center space-y-4 animate-in zoom-in-95">
          <span className="text-6xl animate-bounce">🏆</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-wider">
            {champion.name} ARE CHAMPIONS!
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto">
            Glory belongs to your squad! The Triumph Champions Cup has been awarded and permanently added to your Career trophy room.
          </p>
          <button
            onClick={() => setChampion(null)}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#ffd700] text-black font-black text-xs shadow-xl hover:scale-105 transition"
          >
            Claim Rewards & Return
          </button>
        </div>
      )}

      {/* Tournament Bracket Visual */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quarter-Finals */}
        <div className="space-y-4">
          <div className="text-xs font-black uppercase tracking-wider text-[#00f2fe] border-b border-white/10 pb-2">
            Quarter-Finals
          </div>
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">{CLUBS[0].name}</span>
                <span className="font-mono font-bold text-[#00f2fe]">3</span>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>{CLUBS[5].name}</span>
                <span className="font-mono">1</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">{CLUBS[1].name}</span>
                <span className="font-mono font-bold text-[#00f2fe]">2</span>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>{CLUBS[4].name}</span>
                <span className="font-mono">0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Semi-Finals */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-black uppercase tracking-wider text-[#4facfe]">
              Semi-Finals
            </span>
            <button
              onClick={handleSimulateSemi}
              className="text-[10px] text-[#4facfe] hover:underline font-bold"
            >
              Simulate Semi
            </button>
          </div>
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-zinc-900 border border-[#00f2fe]/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">{CLUBS[0].name}</span>
                <span className="font-mono font-bold text-[#00f2fe]">
                  {matches.find((m) => m.id === 's1')?.completed ? '2' : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-300">
                <span>{CLUBS[1].name}</span>
                <span className="font-mono">
                  {matches.find((m) => m.id === 's1')?.completed ? '1' : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Grand Final */}
        <div className="space-y-4">
          <div className="text-xs font-black uppercase tracking-wider text-[#f59e0b] border-b border-white/10 pb-2">
            Grand Final
          </div>
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#f59e0b]/20 to-zinc-950 border border-[#f59e0b]/40 space-y-4 shadow-xl">
            <div className="text-center font-bold text-xs uppercase tracking-wider text-[#f59e0b]">
              🏆 Championship Trophy Match
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-black text-white">{CLUBS[0].name}</span>
                <span className="font-mono font-bold text-[#f59e0b]">VS</span>
                <span className="font-black text-white">{CLUBS[2].name}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => onPlayMatch(CLUBS[0], CLUBS[2])}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-black font-extrabold text-xs shadow-lg hover:scale-105 transition"
              >
                Play Grand Final
              </button>
              <button
                onClick={handleClaimTrophy}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-zinc-300 transition"
              >
                Simulate & Lift Trophy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
