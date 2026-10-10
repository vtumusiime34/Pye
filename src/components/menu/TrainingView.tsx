// Triumph League - Training Ground & Practice Arena
import React, { useState } from 'react';
import { CLUBS } from '../../game/data/clubs';
import { TeamData } from '../../game/types';
import { soundEngine } from '../../game/engine/AudioEngine';

interface TrainingViewProps {
  onPlayTrainingMatch: (home: TeamData, away: TeamData) => void;
  onBack: () => void;
}

export const TrainingView: React.FC<TrainingViewProps> = ({ onPlayTrainingMatch, onBack }) => {
  const [selectedDrill, setSelectedDrill] = useState<'free_kick' | 'shooting' | '1v1_gk' | 'dribbling'>('free_kick');
  const [drillsCompleted, setDrillsCompleted] = useState<number>(3);
  const [scoreMessage, setScoreMessage] = useState<string | null>(null);

  const drills = [
    {
      id: 'free_kick',
      title: 'Free Kick Mastery',
      icon: '🎯',
      desc: 'Curve shots over a 4-man defensive wall into the top postage stamp.',
      difficulty: 'Medium',
    },
    {
      id: 'shooting',
      title: 'Long-Range Rockets',
      icon: '🚀',
      desc: 'Practice powered strikes from outside the 18-yard box.',
      difficulty: 'Hard',
    },
    {
      id: '1v1_gk',
      title: '1-on-1 vs Goalkeeper',
      icon: '🧤',
      desc: 'Dribble past the rushing keeper or chip into the empty net.',
      difficulty: 'Pro',
    },
    {
      id: 'dribbling',
      title: 'Slalom Cones Agility',
      icon: '⚡',
      desc: 'Quick touch control and skill moves through tight spaces.',
      difficulty: 'Easy',
    },
  ];

  const handlePracticeDrill = () => {
    soundEngine.playKick(0.9);
    const score = Math.floor(Math.random() * 4) + 7;
    setScoreMessage(`Drill Completed! Performance Score: ${score}/10 — Technique Rated ★★★★★`);
    setDrillsCompleted((prev) => prev + 1);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-20 select-none font-['Chakra_Petch',sans-serif]">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-950/40 via-cyan-950/30 to-black border border-emerald-400/40 shadow-2xl backdrop-blur-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-2">
              Performance Academy
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              TRAINING GROUND
            </h1>
            <p className="text-xs text-zinc-300 max-w-md mt-1">
              Hone your shooting techniques, free kicks, through-balls, and goalkeeper reflexes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onPlayTrainingMatch(CLUBS[0], CLUBS[1])}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-black font-extrabold text-xs shadow-lg hover:scale-105 active:scale-95 transition"
            >
              Open Pitch Practice
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

      {scoreMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <span>{scoreMessage}</span>
          <button onClick={() => setScoreMessage(null)} className="text-white hover:opacity-80">
            ✕
          </button>
        </div>
      )}

      {/* Drill Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {drills.map((drill) => {
          const isSelected = selectedDrill === drill.id;
          return (
            <div
              key={drill.id}
              onClick={() => {
                setSelectedDrill(drill.id as any);
                soundEngine.playButtonClick();
              }}
              className={`p-6 rounded-3xl cursor-pointer transition border backdrop-blur-md space-y-3 ${
                isSelected
                  ? 'bg-gradient-to-br from-emerald-950/60 to-zinc-900 border-emerald-400 shadow-xl shadow-emerald-500/10'
                  : 'bg-zinc-900/80 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">{drill.icon}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 font-bold uppercase">
                  {drill.difficulty}
                </span>
              </div>
              <div>
                <h3 className="text-base font-black text-white">{drill.title}</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{drill.desc}</p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePracticeDrill();
                }}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-emerald-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>Execute Drill</span>
                <span>→</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
