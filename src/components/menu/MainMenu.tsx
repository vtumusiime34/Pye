// Triumph League - Main Menu Hub (Futuristic Football UI)
import React, { useState, useEffect } from 'react';
import { CLUBS } from '../../game/data/clubs';
import { TeamData } from '../../game/types';
import { soundEngine } from '../../game/engine/AudioEngine';
import { gamepadController, GamepadStatus } from '../../game/engine/GamepadController';
import { SaveManager } from '../../game/engine/SaveManager';

interface MainMenuProps {
  onOpenQuickMatch: () => void;
  onOpenLeague: () => void;
  onOpenCareer: () => void;
  onOpenShootout: () => void;
  onOpenSquad: () => void;
  onOpenTournament: () => void;
  onOpenTraining: () => void;
  onOpenSettings: () => void;
  selectedClub: TeamData;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onOpenQuickMatch,
  onOpenLeague,
  onOpenCareer,
  onOpenShootout,
  onOpenSquad,
  onOpenTournament,
  onOpenTraining,
  onOpenSettings,
  selectedClub,
}) => {
  const [gamepadStatus, setGamepadStatus] = useState<GamepadStatus>(() => gamepadController.getStatus());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const saveData = SaveManager.get();

  useEffect(() => {
    const unsub = gamepadController.subscribe((status) => setGamepadStatus(status));
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      unsub();
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-[#060911] text-[#f0f4f8] flex flex-col justify-between p-4 sm:p-8 overflow-y-auto select-none font-['Chakra_Petch',sans-serif]">
      {/* Background Ambience / Stadium Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#00f2fe]/20 to-transparent blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-gradient-to-t from-[#f59e0b]/15 to-transparent blur-[100px] rounded-full" />
      </div>

      {/* TOP HEADER BAR */}
      <header className="relative z-10 w-full flex items-center justify-between border-b border-white/10 pb-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00f2fe] via-[#4facfe] to-[#f59e0b] p-[2px] shadow-2xl shadow-[#00f2fe]/30">
            <div className="w-full h-full bg-[#090d16] rounded-2xl flex items-center justify-center">
              <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00f2fe] to-[#f59e0b]">
                TL
              </span>
            </div>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-widest text-white leading-none">
              TRIUMPH <span className="text-[#00f2fe]">LEAGUE</span>
            </h1>
            <span className="text-[10px] tracking-widest font-mono text-zinc-400 uppercase">
              Pro 3D Football Simulation • 2026 Edition
            </span>
          </div>
        </div>

        {/* User Club Profile Pill & Controls */}
        <div className="flex items-center gap-3">
          {/* Gamepad active badge */}
          {gamepadStatus.connected && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>🎮 {gamepadStatus.name}</span>
            </div>
          )}

          {/* Club badge */}
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md">
            <div
              className="w-4 h-4 rounded-full border border-white/40"
              style={{ backgroundColor: selectedClub.primaryKit.primaryColor }}
            />
            <span className="text-xs font-bold text-white">{selectedClub.name}</span>
            <span className="text-[10px] text-amber-400 font-mono">★★★★★</span>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white transition flex items-center gap-1.5 shadow-lg active:scale-95"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            <span>{isFullscreen ? '⛶' : '⛶'}</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onOpenSettings();
            }}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white transition flex items-center gap-1.5 shadow-lg active:scale-95"
          >
            <span>⚙</span>
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </header>

      {/* CENTER: HERO BANNER & FEATURE CARDS */}
      <main className="relative z-10 w-full max-w-6xl mx-auto my-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Big Play Action & Main Modes (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Big Quick Match Card */}
          <div
            onClick={() => {
              soundEngine.playButtonClick();
              onOpenQuickMatch();
            }}
            className="group relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#00f2fe]/20 via-[#4facfe]/15 to-[#f59e0b]/10 border border-[#00f2fe]/40 shadow-2xl backdrop-blur-xl cursor-pointer hover:border-[#00f2fe] transition-all hover:scale-[1.01]"
          >
            <div className="relative z-10 space-y-2">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#00f2fe]/20 border border-[#00f2fe]/40 text-[#00f2fe] text-[10px] font-bold uppercase tracking-wider">
                Instant 11v11 Match
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-wide group-hover:text-[#00f2fe] transition">
                KICK OFF
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-md leading-relaxed">
                Jump directly onto the pitch with 11v11 gameplay, goalkeepers, passing, shooting, through-balls, and TV broadcast commentary.
              </p>

              <div className="pt-3 flex items-center gap-4 text-xs font-bold text-white">
                <span className="flex items-center gap-1.5 text-[#00f2fe]">
                  <span>▶</span> Play Now
                </span>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-400">Choose Teams & Stadium</span>
              </div>
            </div>

            {/* Glowing Accent Ring in background */}
            <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-gradient-to-br from-[#00f2fe]/20 to-transparent blur-2xl group-hover:scale-125 transition-transform" />
          </div>

          {/* Secondary Action Grid (4 Modes) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Triumph League Flagship */}
            <div
              onClick={() => {
                soundEngine.playButtonClick();
                onOpenLeague();
              }}
              className="p-4 rounded-2xl bg-[#090d16]/90 border border-white/10 hover:border-[#f59e0b]/60 transition-all hover:scale-[1.02] cursor-pointer group shadow-xl"
            >
              <span className="text-2xl block mb-1">⭐</span>
              <h3 className="text-sm font-black text-white group-hover:text-[#f59e0b] transition">
                Triumph League
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                14-match season table, fixtures & Golden Boot.
              </p>
            </div>

            {/* Knockout Tournament */}
            <div
              onClick={() => {
                soundEngine.playButtonClick();
                onOpenTournament();
              }}
              className="p-4 rounded-2xl bg-[#090d16]/90 border border-white/10 hover:border-[#4facfe]/60 transition-all hover:scale-[1.02] cursor-pointer group shadow-xl"
            >
              <span className="text-2xl block mb-1">🏆</span>
              <h3 className="text-sm font-black text-white group-hover:text-[#4facfe] transition">
                Champions Cup
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                Single-elimination knockout cup bracket.
              </p>
            </div>

            {/* Training Academy */}
            <div
              onClick={() => {
                soundEngine.playButtonClick();
                onOpenTraining();
              }}
              className="p-4 rounded-2xl bg-[#090d16]/90 border border-white/10 hover:border-emerald-400/60 transition-all hover:scale-[1.02] cursor-pointer group shadow-xl"
            >
              <span className="text-2xl block mb-1">⚡</span>
              <h3 className="text-sm font-black text-white group-hover:text-emerald-400 transition">
                Training Ground
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                Free kicks, shooting drills, and 1v1 vs GK.
              </p>
            </div>

            {/* Penalty Shootout */}
            <div
              onClick={() => {
                soundEngine.playButtonClick();
                onOpenShootout();
              }}
              className="p-4 rounded-2xl bg-[#090d16]/90 border border-white/10 hover:border-[#00f2fe]/60 transition-all hover:scale-[1.02] cursor-pointer group shadow-xl"
            >
              <span className="text-2xl block mb-1">🎯</span>
              <h3 className="text-sm font-black text-white group-hover:text-[#00f2fe] transition">
                Penalty Shootout
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                Spot-kick duel with target aim & keeper dive.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Career & Squad Management (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Career Manager Card */}
          <div
            onClick={() => {
              soundEngine.playButtonClick();
              onOpenCareer();
            }}
            className="p-6 rounded-3xl bg-gradient-to-br from-[#090d16] to-[#111827] border border-white/10 hover:border-white/30 transition-all hover:scale-[1.01] cursor-pointer group shadow-2xl"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#00f2fe]">
                Club Management
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">${saveData.career.budgetMillions.toFixed(1)}M Budget</span>
            </div>
            <h3 className="text-xl font-black text-white group-hover:text-[#00f2fe] transition">
              Career Mode
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Sign star players on the transfer market, expand stadium capacity, manage team finances, and lead your club to silverware.
            </p>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-zinc-300">
              <span>Stadium: Tier {saveData.career.stadiumLevel} (62,500)</span>
              <span className="text-[#00f2fe]">Manage →</span>
            </div>
          </div>

          {/* Squad & Formation Tactics Card */}
          <div
            onClick={() => {
              soundEngine.playButtonClick();
              onOpenSquad();
            }}
            className="p-6 rounded-3xl bg-[#090d16]/90 border border-white/10 hover:border-white/30 transition-all hover:scale-[1.01] cursor-pointer group shadow-2xl"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                Lineup & Tactics
              </span>
              <span className="text-xs font-mono font-bold text-zinc-400">{selectedClub.formation}</span>
            </div>
            <h3 className="text-xl font-black text-white group-hover:text-emerald-400 transition">
              Team Tactics
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Configure your starting XI, assign captaincy, adjust defensive pressing, and swap formation systems in real time.
            </p>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-zinc-300">
              <span>Starting XI: 11 / 11 Fit</span>
              <span className="text-emerald-400">Tactics Board →</span>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER BAR: Controls Guide & Platform Info */}
      <footer className="relative z-10 w-full flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10 pt-4 text-[11px] text-zinc-500 font-mono">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-zinc-400 font-bold">CONTROLS:</span>
          <span>🎮 Gamepad Support</span>
          <span>⌨ WASD/Arrows (Move)</span>
          <span>Space (Sprint)</span>
          <span>J (Pass)</span>
          <span>K (Shoot)</span>
          <span>L (Through)</span>
          <span>I (Cross)</span>
          <span>E (Switch)</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-zinc-400">TRIUMPH LEAGUE v1.2</span>
          <span>60 FPS Target</span>
          <span>Mobile & PC Native</span>
        </div>
      </footer>
    </div>
  );
};
