// Triumph League - Match HUD Overlay (Scoreboard, Minimap Radar, Player Info & Goal Banners)
import React, { useEffect, useRef, useState } from 'react';
import { FootballMatch } from '../../game/engine/FootballMatch';
import { CameraPreset } from '../../game/types';
import { commentaryEngine, CommentaryLine } from '../../game/engine/CommentaryEngine';
import { gamepadController, GamepadStatus } from '../../game/engine/GamepadController';
import confetti from 'canvas-confetti';

interface MatchHUDProps {
  match: FootballMatch;
  onPause: () => void;
  onCycleCamera: () => void;
  currentCamera: CameraPreset;
}

export const MatchHUD: React.FC<MatchHUDProps> = ({
  match,
  onPause,
  onCycleCamera,
  currentCamera,
}) => {
  const radarCanvasRef = useRef<HTMLCanvasElement>(null);
  const prevHomeScore = useRef(match.homeScore);
  const prevAwayScore = useRef(match.awayScore);

  const [commentaryLine, setCommentaryLine] = useState<CommentaryLine | null>(null);
  const [gamepadStatus, setGamepadStatus] = useState<GamepadStatus>(() => gamepadController.getStatus());

  useEffect(() => {
    const unsubCommentary = commentaryEngine.subscribe((line) => setCommentaryLine(line));
    const unsubGamepad = gamepadController.subscribe((status) => setGamepadStatus(status));
    return () => {
      unsubCommentary();
      unsubGamepad();
    };
  }, []);

  // Trigger celebration confetti on goal!
  useEffect(() => {
    if (match.homeScore > prevHomeScore.current || match.awayScore > prevAwayScore.current) {
      prevHomeScore.current = match.homeScore;
      prevAwayScore.current = match.awayScore;

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.4 },
        colors: ['#00f2fe', '#4facfe', '#f59e0b', '#ffffff'],
      });
    }
  }, [match.homeScore, match.awayScore]);

  // Draw 2D Top-Down Radar Minimap
  useEffect(() => {
    if (!radarCanvasRef.current) return;
    const canvas = radarCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dark Pitch Background
    ctx.fillStyle = 'rgba(6, 12, 20, 0.75)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;

    // Pitch bounds (105m x 68m mapped to 160 x 100)
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

    // Halfway line & center circle
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 14, 0, Math.PI * 2);
    ctx.stroke();

    // Map 3D Pitch coordinates (-52.5 to 52.5, -34 to 34) to canvas (0 to 160, 0 to 100)
    const toRadarX = (fieldX: number) => ((fieldX + 52.5) / 105) * canvas.width;
    const toRadarZ = (fieldZ: number) => ((fieldZ + 34) / 68) * canvas.height;

    // 1. Draw Home Players
    ctx.fillStyle = match.homeTeam.primaryKit.primaryColor;
    match.homePlayers.forEach((p) => {
      const rx = toRadarX(p.group.position.x);
      const rz = toRadarZ(p.group.position.z);
      ctx.beginPath();
      ctx.arc(rx, rz, p === match.userPlayer ? 4.5 : 3, 0, Math.PI * 2);
      ctx.fill();

      if (p === match.userPlayer) {
        ctx.strokeStyle = '#00f2fe';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });

    // 2. Draw Away Players
    ctx.fillStyle = match.awayTeam.primaryKit.primaryColor;
    match.awayPlayers.forEach((p) => {
      const rx = toRadarX(p.group.position.x);
      const rz = toRadarZ(p.group.position.z);
      ctx.beginPath();
      ctx.arc(rx, rz, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3. Draw Football
    const bx = toRadarX(match.ball.position.x);
    const bz = toRadarZ(match.ball.position.z);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#00f2fe';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(bx, bz, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  const minutes = Math.floor(match.matchTimeSeconds);
  const seconds = Math.floor((match.matchTimeSeconds % 1) * 60);
  const isSecondHalf = minutes >= 45;

  const activePlayer = match.userPlayer?.data;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-3 sm:p-5 select-none font-['Chakra_Petch',sans-serif]">
      {/* TOP BAR: Scoreboard, Clock, Controls */}
      <div className="w-full flex items-start justify-between">
        {/* Left: Quick Camera Angle Badge */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={onCycleCamera}
            className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 backdrop-blur-md text-[11px] font-bold text-zinc-300 hover:text-white hover:border-[#00f2fe]/60 transition flex items-center gap-1.5 shadow-lg active:scale-95"
            title="Cycle Camera Angle"
          >
            <span className="text-[#00f2fe]">CAM</span>
            <span className="uppercase">{currentCamera.replace('_', ' ')}</span>
          </button>
        </div>

        {/* Center: TV Broadcast Scoreboard */}
        <div className="flex flex-col items-center">
          <div className="flex items-center rounded-xl bg-black/75 border border-white/20 backdrop-blur-lg shadow-2xl overflow-hidden">
            {/* Home Team */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-black/80 to-transparent">
              <span
                className="w-3 h-3 rounded-full border border-white/50"
                style={{ backgroundColor: match.homeTeam.primaryKit.primaryColor }}
              />
              <span className="text-sm font-black tracking-wider text-white">
                {match.homeTeam.abbreviation}
              </span>
            </div>

            {/* Score Display */}
            <div className="px-3.5 py-1 bg-gradient-to-b from-[#0f172a] to-[#020617] border-x border-white/15 text-lg font-black tracking-widest text-[#00f2fe] font-mono">
              {match.homeScore} : {match.awayScore}
            </div>

            {/* Away Team */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-l from-black/80 to-transparent">
              <span className="text-sm font-black tracking-wider text-white">
                {match.awayTeam.abbreviation}
              </span>
              <span
                className="w-3 h-3 rounded-full border border-white/50"
                style={{ backgroundColor: match.awayTeam.primaryKit.primaryColor }}
              />
            </div>
          </div>

          {/* Match Clock & Half indicator */}
          <div className="mt-1 flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-black/60 border border-white/10 backdrop-blur-md text-[10px] font-mono tracking-wider text-zinc-300">
            <span className="text-emerald-400 font-bold">{isSecondHalf ? '2ND' : '1ST'}</span>
            <span>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            {minutes >= 45 && minutes < 90 && (
              <span className="text-amber-400 font-bold">+{match.stoppageTime}'</span>
            )}
          </div>
        </div>

        {/* Right: Pause Button */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={onPause}
            className="w-10 h-10 rounded-xl bg-black/60 border border-white/20 backdrop-blur-md flex items-center justify-center text-white hover:border-[#00f2fe] transition shadow-lg active:scale-95"
            title="Pause Match"
          >
            <div className="flex gap-1">
              <div className="w-1 h-4 bg-white rounded-full" />
              <div className="w-1 h-4 bg-white rounded-full" />
            </div>
          </button>
        </div>
      </div>

      {/* CENTER: GOAL BROADCAST CELEBRATION BANNER */}
      {match.phase === 'celebration' && (
        <div className="self-center flex flex-col items-center animate-in zoom-in-95 duration-200">
          <div className="px-8 py-3 rounded-2xl bg-gradient-to-r from-[#00f2fe] via-[#4facfe] to-[#f59e0b] p-[2px] shadow-2xl shadow-[#00f2fe]/40">
            <div className="px-8 py-3 rounded-2xl bg-black/90 flex flex-col items-center">
              <span className="text-3xl sm:text-5xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#00f2fe] to-[#f59e0b] animate-pulse">
                GOAL!
              </span>
              <div className="text-xs sm:text-sm font-bold text-zinc-300 tracking-wider mt-1 uppercase">
                {match.goalEvents[match.goalEvents.length - 1]?.player.name || 'Striker'} #
                {match.goalEvents[match.goalEvents.length - 1]?.player.number || '9'} (
                {match.goalEvents[match.goalEvents.length - 1]?.minute || '42'}&apos;)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GAMEPAD CONNECTED INDICATOR */}
      {gamepadStatus.connected && (
        <div className="absolute top-20 left-4 z-30 px-3 py-1.5 rounded-xl bg-black/80 border border-emerald-400/40 backdrop-blur-md flex items-center gap-2 text-xs font-bold text-emerald-300 shadow-xl animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>🎮 {gamepadStatus.name} Connected</span>
        </div>
      )}

      {/* LIVE BROADCAST COMMENTARY SUBTITLES */}
      {commentaryLine && (
        <div className="absolute bottom-28 sm:bottom-24 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[92%] animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="px-4 py-2.5 rounded-2xl bg-black/90 border border-[#00f2fe]/40 backdrop-blur-xl shadow-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00f2fe] to-[#4facfe] p-[1.5px] shrink-0">
              <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center text-xs">
                🎙️
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#00f2fe]">
                  {commentaryLine.speaker}
                </span>
                <span className="text-[9px] text-zinc-400 font-mono">
                  • {commentaryLine.speakerRole}
                </span>
                <span className="flex items-center gap-0.5 ml-auto">
                  <span className="w-1 h-2 bg-[#00f2fe] animate-pulse rounded-full" />
                  <span className="w-1 h-3.5 bg-[#4facfe] animate-pulse rounded-full" />
                  <span className="w-1 h-1.5 bg-[#f59e0b] animate-pulse rounded-full" />
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-white truncate leading-tight mt-0.5">
                &ldquo;{commentaryLine.text}&rdquo;
              </p>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM SECTION: 2D Minimap Radar & Active Player Card */}
      <div className="w-full flex items-end justify-between">
        {/* Active Player HUD Card */}
        {activePlayer && (
          <div className="hidden sm:flex items-center gap-3 p-2.5 rounded-xl bg-black/70 border border-white/15 backdrop-blur-md shadow-2xl">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-950 border border-white/20 flex flex-col items-center justify-center font-mono">
              <span className="text-[10px] text-zinc-400 font-bold">{activePlayer.position}</span>
              <span className="text-xs font-black text-[#00f2fe]">
                {activePlayer.overallRating}
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-wide">
                {activePlayer.shortName} <span className="text-[#00f2fe]">#{activePlayer.number}</span>
              </div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider">
                Preferred Foot: {activePlayer.preferredFoot}
              </div>
            </div>
          </div>
        )}

        {/* 2D Minimap Radar (Center Bottom) */}
        <div className="mx-auto pb-1">
          <canvas
            ref={radarCanvasRef}
            width={160}
            height={100}
            className="rounded-xl border border-white/20 shadow-2xl backdrop-blur-md opacity-90 hover:opacity-100 transition-opacity"
          />
        </div>

        {/* Right placeholder to keep minimap centered */}
        <div className="hidden sm:block w-36" />
      </div>
    </div>
  );
};
