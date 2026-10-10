// Triumph League - Penalty Shootout Mode
import React, { useState } from 'react';
import { CLUBS } from '../../game/data/clubs';
import { soundEngine } from '../../game/engine/AudioEngine';
import confetti from 'canvas-confetti';

interface PenaltyShootoutViewProps {
  onBack: () => void;
}

type GoalTarget = 'TL' | 'TR' | 'BL' | 'BR' | 'C';

export const PenaltyShootoutView: React.FC<PenaltyShootoutViewProps> = ({ onBack }) => {
  const homeClub = CLUBS[0]; // Apex London
  const awayClub = CLUBS[1]; // Real Vanguard

  const [round, setRound] = useState(1);
  const [turn, setTurn] = useState<'home_striker' | 'away_striker'>('home_striker');
  const [homeShots, setHomeShots] = useState<('scored' | 'missed')[]>([]);
  const [awayShots, setAwayShots] = useState<('scored' | 'missed')[]>([]);

  const [selectedTarget, setSelectedTarget] = useState<GoalTarget | null>(null);
  const [isShooting, setIsShooting] = useState(false);
  const [shotResultText, setShotResultText] = useState<string | null>(null);
  const [keeperDived, setKeeperDived] = useState<GoalTarget | null>(null);

  const [winner, setWinner] = useState<string | null>(null);

  const targets: { id: GoalTarget; label: string; style: string }[] = [
    { id: 'TL', label: 'Top Left', style: 'top-2 left-2' },
    { id: 'TR', label: 'Top Right', style: 'top-2 right-2' },
    { id: 'BL', label: 'Bottom Left', style: 'bottom-2 left-2' },
    { id: 'BR', label: 'Bottom Right', style: 'bottom-2 right-2' },
    { id: 'C', label: 'Center', style: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' },
  ];

  const handleShoot = () => {
    if (!selectedTarget || isShooting || winner) return;

    setIsShooting(true);
    soundEngine.playKick(0.9);

    // AI Keeper decides dive direction
    const possibleDives: GoalTarget[] = ['TL', 'TR', 'BL', 'BR', 'C'];
    const aiDive = possibleDives[Math.floor(Math.random() * possibleDives.length)];
    setKeeperDived(aiDive);

    setTimeout(() => {
      const isSaved = aiDive === selectedTarget;

      if (turn === 'home_striker') {
        const result: 'scored' | 'missed' = isSaved ? 'missed' : 'scored';
        const nextHome: ('scored' | 'missed')[] = [...homeShots, result];
        setHomeShots(nextHome);

        if (result === 'scored') {
          soundEngine.playGoalRoar();
          setShotResultText('GOAL! Top corner finish!');
        } else {
          soundEngine.playPostHit();
          setShotResultText('SAVED! Goalkeeper tips it wide!');
        }

        // Switch to Away penalty
        setTimeout(() => {
          setIsShooting(false);
          setSelectedTarget(null);
          setKeeperDived(null);
          setShotResultText(null);
          setTurn('away_striker');

          // Simulate Away penalty
          executeAiPenalty(nextHome, awayShots, round);
        }, 1800);
      }
    }, 700);
  };

  const executeAiPenalty = (
    currentHomeShots: ('scored' | 'missed')[],
    currentAwayShots: ('scored' | 'missed')[],
    currentRound: number
  ) => {
    setIsShooting(true);
    soundEngine.playKick(0.85);

    setTimeout(() => {
      // 70% probability away team scores
      const aiScored = Math.random() > 0.32;
      const nextAway: ('scored' | 'missed')[] = [...currentAwayShots, aiScored ? 'scored' : 'missed'];
      setAwayShots(nextAway);

      if (aiScored) {
        soundEngine.playGoalRoar();
        setShotResultText('Away team scores their penalty!');
      } else {
        soundEngine.playPostHit();
        setShotResultText('Your Goalkeeper makes the save!');
      }

      setTimeout(() => {
        setIsShooting(false);
        setShotResultText(null);

        // Check if shootout has concluded
        const homeGoals = currentHomeShots.filter((s) => s === 'scored').length;
        const awayGoals = nextAway.filter((s) => s === 'scored').length;

        if (currentRound >= 5) {
          if (homeGoals > awayGoals) {
            setWinner(homeClub.name);
            confetti({ particleCount: 100, spread: 80 });
            return;
          } else if (awayGoals > homeGoals) {
            setWinner(awayClub.name);
            return;
          }
        }

        setRound((r) => r + 1);
        setTurn('home_striker');
      }, 1800);
    }, 700);
  };

  const handleReset = () => {
    setRound(1);
    setTurn('home_striker');
    setHomeShots([]);
    setAwayShots([]);
    setSelectedTarget(null);
    setShotResultText(null);
    setWinner(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 pb-20 select-none font-['Chakra_Petch',sans-serif]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#00f2fe]">
            Shootout Showdown
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white">Penalty Shootout</h2>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition"
        >
          Exit
        </button>
      </div>

      {/* Score & Round Indicator */}
      <div className="p-5 rounded-3xl bg-[#090d16] border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center justify-around">
          {/* Home */}
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-sm font-bold text-white">{homeClub.name}</span>
            <div className="flex gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 rounded-full border ${
                    homeShots[i] === 'scored'
                      ? 'bg-emerald-500 border-white'
                      : homeShots[i] === 'missed'
                      ? 'bg-rose-500 border-white'
                      : 'bg-zinc-800 border-zinc-600'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="text-2xl font-black text-[#00f2fe] font-mono">
            {homeShots.filter((s) => s === 'scored').length} -{' '}
            {awayShots.filter((s) => s === 'scored').length}
          </div>

          {/* Away */}
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-sm font-bold text-white">{awayClub.name}</span>
            <div className="flex gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 rounded-full border ${
                    awayShots[i] === 'scored'
                      ? 'bg-emerald-500 border-white'
                      : awayShots[i] === 'missed'
                      ? 'bg-rose-500 border-white'
                      : 'bg-zinc-800 border-zinc-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Turn status */}
        <div className="text-center text-xs font-bold text-zinc-300">
          Round {round} of 5 •{' '}
          <span className="text-[#00f2fe]">
            {turn === 'home_striker' ? 'Your Turn (Striker)' : 'Opponent Turn (Goalkeeper)'}
          </span>
        </div>
      </div>

      {/* Goal Target Arena */}
      <div className="relative w-full aspect-[16/9] rounded-3xl bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#143d1a] border-4 border-white/20 shadow-2xl p-4 flex flex-col justify-end items-center overflow-hidden">
        {/* Goal Post Frame */}
        <div className="relative w-[85%] h-[68%] border-4 border-white rounded-t-lg shadow-2xl bg-black/30 backdrop-blur-sm">
          {/* Net grid */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />

          {/* Goalkeeper Avatar */}
          <div
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 transition-all duration-300 ${
              keeperDived === 'TL'
                ? '-translate-x-[110%] translate-y-[-40%]'
                : keeperDived === 'TR'
                ? 'translate-x-[20%] translate-y-[-40%]'
                : keeperDived === 'BL'
                ? '-translate-x-[100%]'
                : keeperDived === 'BR'
                ? 'translate-x-[15%]'
                : ''
            }`}
          >
            <div className="w-12 h-20 bg-amber-500 border-2 border-white rounded-t-xl flex flex-col items-center justify-start pt-2 shadow-xl">
              <div className="w-6 h-6 rounded-full bg-[#f8d9c2]" />
              <span className="text-[9px] font-bold text-black mt-1">GK</span>
            </div>
          </div>

          {/* Clickable Target Corners */}
          {turn === 'home_striker' &&
            !winner &&
            targets.map((tgt) => (
              <button
                key={tgt.id}
                onClick={() => {
                  setSelectedTarget(tgt.id);
                  soundEngine.playButtonClick();
                }}
                className={`absolute w-12 h-12 rounded-xl border-2 flex items-center justify-center transition active:scale-90 ${tgt.style} ${
                  selectedTarget === tgt.id
                    ? 'border-[#00f2fe] bg-[#00f2fe]/40 ring-4 ring-[#00f2fe]/50 scale-110'
                    : 'border-white/30 bg-black/40 hover:border-white/70'
                }`}
              >
                <span className="text-xs font-black text-white">{tgt.id}</span>
              </button>
            ))}
        </div>

        {/* Spot Ball */}
        <div className="w-7 h-7 rounded-full bg-white border-2 border-black shadow-xl mt-3 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-black/70" />
        </div>

        {/* Dynamic Result Banner */}
        {shotResultText && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4">
            <div className="px-6 py-3 rounded-2xl bg-black/90 border border-[#00f2fe] text-lg font-black text-white shadow-2xl animate-in zoom-in-95">
              {shotResultText}
            </div>
          </div>
        )}

        {/* Winner Banner */}
        {winner && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 space-y-4">
            <span className="text-xs font-bold text-[#00f2fe] uppercase tracking-widest">
              Shootout Concluded
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white text-center">
              {winner} Champions!
            </h3>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-black text-xs font-black uppercase tracking-wider shadow-xl active:scale-95"
            >
              Play Another Shootout
            </button>
          </div>
        )}
      </div>

      {/* Shoot Action Button */}
      {turn === 'home_striker' && !winner && (
        <div className="text-center">
          <button
            onClick={handleShoot}
            disabled={!selectedTarget || isShooting}
            className="px-10 py-3.5 rounded-2xl bg-gradient-to-r from-[#00f2fe] via-[#4facfe] to-[#f59e0b] text-black text-sm font-black tracking-widest uppercase shadow-xl hover:scale-105 active:scale-95 transition disabled:opacity-40"
          >
            {selectedTarget ? `STRIKE BALL TO ${selectedTarget}` : 'SELECT TARGET IN GOAL'}
          </button>
        </div>
      )}
    </div>
  );
};
