// Triumph League - Full Time Match Summary & Stats Report
import React from 'react';
import { FootballMatch } from '../../game/engine/FootballMatch';

interface MatchSummaryProps {
  match: FootballMatch;
  onRematch: () => void;
  onExit: () => void;
}

export const MatchSummary: React.FC<MatchSummaryProps> = ({
  match,
  onRematch,
  onExit,
}) => {
  const isHomeWinner = match.homeScore > match.awayScore;
  const isDraw = match.homeScore === match.awayScore;
  const winnerName = isDraw
    ? 'Honors Shared — Draw'
    : isHomeWinner
    ? `${match.homeTeam.name} Victorious`
    : `${match.awayTeam.name} Victorious`;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in zoom-in-95 select-none font-['Chakra_Petch',sans-serif]">
      <div className="w-full max-w-xl rounded-3xl bg-[#090d16] border border-white/20 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Full-time Banner */}
        <div className="text-center space-y-1">
          <div className="text-xs font-bold uppercase tracking-widest text-[#00f2fe]">
            Full Time Result
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
            {winnerName}
          </h2>
        </div>

        {/* Big Score Header */}
        <div className="flex items-center justify-around py-4 px-6 rounded-2xl bg-black/60 border border-white/10">
          <div className="flex flex-col items-center gap-1.5">
            <span
              className="w-5 h-5 rounded-full border border-white/40"
              style={{ backgroundColor: match.homeTeam.primaryKit.primaryColor }}
            />
            <span className="text-base font-black text-white">{match.homeTeam.name}</span>
          </div>

          <div className="text-4xl font-black text-[#00f2fe] font-mono px-4">
            {match.homeScore} - {match.awayScore}
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <span
              className="w-5 h-5 rounded-full border border-white/40"
              style={{ backgroundColor: match.awayTeam.primaryKit.primaryColor }}
            />
            <span className="text-base font-black text-white">{match.awayTeam.name}</span>
          </div>
        </div>

        {/* Scorers Timeline */}
        {match.goalEvents.length > 0 && (
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Match Goals
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {match.goalEvents.map((g, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 text-white font-mono"
                >
                  ⚽ {g.player.shortName} ({g.minute}&apos;)
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Match Statistics Table */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Match Statistics
          </div>
          <div className="space-y-2 text-xs font-mono">
            {[
              { label: 'Total Shots', home: match.stats.homeShots, away: match.stats.awayShots },
              { label: 'Shots on Target', home: match.stats.homeShotsOnTarget, away: match.stats.awayShotsOnTarget },
              { label: 'Passes Completed', home: match.stats.homePasses, away: match.stats.awayPasses },
              { label: 'Tackles Won', home: match.stats.homeTackles, away: match.stats.awayTackles },
            ].map((stat, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-zinc-900/40">
                <span className="font-bold text-white w-10 text-left">{stat.home}</span>
                <span className="text-zinc-400 text-[11px] font-sans uppercase tracking-wider">
                  {stat.label}
                </span>
                <span className="font-bold text-white w-10 text-right">{stat.away}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onRematch}
            className="py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-black tracking-wider text-white uppercase transition"
          >
            Rematch
          </button>
          <button
            onClick={onExit}
            className="py-3 rounded-2xl bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-black text-xs font-black tracking-wider uppercase shadow-xl hover:scale-[1.02] active:scale-95 transition"
          >
            Exit to Menu
          </button>
        </div>
      </div>
    </div>
  );
};
