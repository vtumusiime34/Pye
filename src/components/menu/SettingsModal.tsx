// Triumph League - Game Settings & Graphics Optimization Modal
import React, { useState } from 'react';
import { GraphicsQuality, CameraPreset } from '../../game/types';
import { soundEngine } from '../../game/engine/AudioEngine';
import { commentaryEngine } from '../../game/engine/CommentaryEngine';
import { SaveManager } from '../../game/engine/SaveManager';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  graphicsQuality: GraphicsQuality;
  onGraphicsChange: (q: GraphicsQuality) => void;
  cameraPreset: CameraPreset;
  onCameraChange: (c: CameraPreset) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  graphicsQuality,
  onGraphicsChange,
  cameraPreset,
  onCameraChange,
  isMuted,
  onToggleMute,
}) => {
  if (!isOpen) return null;

  const currentSave = SaveManager.get();
  const [commentaryVol, setCommentaryVol] = useState<number>(currentSave.settings.commentaryVolume || 0.85);
  const [targetFps, setTargetFps] = useState<30 | 60 | 120>(currentSave.settings.targetFPS || 60);

  const handleCommentaryVolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCommentaryVol(val);
    commentaryEngine.setVolume(val);
    SaveManager.updateSettings({ commentaryVolume: val });
  };

  const handleFpsChange = (fps: 30 | 60 | 120) => {
    setTargetFps(fps);
    SaveManager.updateSettings({ targetFPS: fps });
    soundEngine.playButtonClick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in select-none font-['Chakra_Petch',sans-serif]">
      <div className="w-full max-w-xl rounded-3xl bg-[#090d16] border border-white/20 shadow-2xl p-6 sm:p-8 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#00f2fe]">
              Configuration
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">Game Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Graphics Quality */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Graphics Quality
            </label>
            <span className="text-[11px] text-zinc-500">Auto-tuned shaders & shadows</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'low', label: 'Low', desc: 'Max FPS' },
              { id: 'medium', label: 'Medium', desc: 'Balanced' },
              { id: 'high', label: 'High', desc: 'Sharp 3D' },
              { id: 'ultra', label: 'Ultra', desc: 'PCF Soft' },
            ].map((q) => (
              <button
                key={q.id}
                onClick={() => {
                  onGraphicsChange(q.id as GraphicsQuality);
                  SaveManager.updateSettings({ graphicsQuality: q.id as GraphicsQuality });
                  soundEngine.playButtonClick();
                }}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition border flex flex-col items-center ${
                  graphicsQuality === q.id
                    ? 'bg-[#00f2fe] text-black border-white shadow-lg shadow-[#00f2fe]/20'
                    : 'bg-zinc-900 text-zinc-300 border-white/10 hover:border-white/30'
                }`}
              >
                <span>{q.label}</span>
                <span className="text-[9px] font-normal opacity-75">{q.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Target Frame Rate */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Target Refresh Rate (FPS)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { fps: 30, label: '30 FPS', desc: 'Battery Saver' },
              { fps: 60, label: '60 FPS', desc: 'Pro Standard' },
              { fps: 120, label: '120+ FPS', desc: 'Ultra High-Hz' },
            ].map((item) => (
              <button
                key={item.fps}
                onClick={() => handleFpsChange(item.fps as 30 | 60 | 120)}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition border flex flex-col items-center ${
                  targetFps === item.fps
                    ? 'bg-[#00f2fe] text-black border-white shadow-md'
                    : 'bg-zinc-900 text-zinc-300 border-white/10 hover:border-white/30'
                }`}
              >
                <span>{item.label}</span>
                <span className="text-[9px] font-normal opacity-75">{item.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Camera Preset */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Camera Angle
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'tv_broadcast', label: 'TV Broadcast' },
              { id: 'sideline_high', label: 'Sideline High' },
              { id: 'action_cam', label: 'Action Follow' },
              { id: 'end_to_end', label: 'End-to-End' },
            ].map((cam) => (
              <button
                key={cam.id}
                onClick={() => {
                  onCameraChange(cam.id as CameraPreset);
                  SaveManager.updateSettings({ cameraPreset: cam.id as CameraPreset });
                  soundEngine.playButtonClick();
                }}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition border ${
                  cameraPreset === cam.id
                    ? 'bg-[#00f2fe] text-black border-white shadow-md'
                    : 'bg-zinc-900 text-zinc-300 border-white/10 hover:border-white/30'
                }`}
              >
                {cam.label}
              </button>
            ))}
          </div>
        </div>

        {/* Audio Mixer */}
        <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/60 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Audio Mixer & Commentary
            </span>
            <button
              onClick={() => {
                onToggleMute();
                soundEngine.playButtonClick();
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                !isMuted
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              }`}
            >
              {!isMuted ? 'SOUND ON' : 'MUTED'}
            </button>
          </div>

          {/* Commentary Volume Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Commentary (Arthur Vance & Marcus Sterling)</span>
              <span className="font-mono text-white">{Math.round(commentaryVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={commentaryVol}
              onChange={handleCommentaryVolChange}
              className="w-full accent-[#00f2fe] cursor-pointer"
            />
          </div>
        </div>

        {/* Controls Reference Guide */}
        <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 space-y-2 text-xs font-mono">
          <div className="text-zinc-400 font-sans font-bold uppercase text-[10px]">
            Controls Quick Reference (Mobile & PC)
          </div>
          <div className="grid grid-cols-2 gap-2 text-zinc-300 text-[11px]">
            <div>• Move: Touch Joystick / WASD / Left Stick</div>
            <div>• Sprint: SPRINT button / Space / RT</div>
            <div>• Ground Pass: PASS button / J / A</div>
            <div>• Power Shoot: SHOOT button / K / X</div>
            <div>• Lob / Cross: CROSS button / I / B</div>
            <div>• Through Ball: THRU button / L / Y</div>
            <div>• Switch Player: SWITCH button / E / LB</div>
            <div>• Standing / Slide: TACKLE / Space / B</div>
          </div>
        </div>

        {/* Close Button */}
        <div>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-black font-black text-xs uppercase tracking-wider shadow-xl transition active:scale-95"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
