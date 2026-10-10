// Triumph League - Mobile Touch Virtual Joystick & Dynamic Action Buttons (+ Keyboard)
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ControlState } from '../../game/types';
import { soundEngine } from '../../game/engine/AudioEngine';

interface VirtualControlsProps {
  inPossession: boolean;
  hasBall: boolean;
  onControlChange: (controls: ControlState) => void;
  stamina: number;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  inPossession,
  hasBall,
  onControlChange,
  stamina,
}) => {
  const [controls, setControls] = useState<ControlState>({
    moveX: 0,
    moveZ: 0,
    isSprinting: false,
    passRequested: false,
    throughRequested: false,
    shootRequested: false,
    shootPower: 0,
    lobRequested: false,
    tackleRequested: false,
    slideRequested: false,
    switchPlayerRequested: false,
    skillRequested: false,
  });

  // Joystick touch tracking
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [joystickThumb, setJoystickThumb] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isJoystickActive, setIsJoystickActive] = useState(false);
  const joystickTouchIdRef = useRef<number | null>(null);

  // Shoot button charge meter
  const shootTimerRef = useRef<number | null>(null);
  const [chargingPower, setChargingPower] = useState(0);

  // Update parent whenever controls change
  useEffect(() => {
    onControlChange(controls);
  }, [controls, onControlChange]);

  // --- TOUCH JOYSTICK HANDLERS ---
  const handleJoystickStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    joystickTouchIdRef.current = touch.identifier;
    setIsJoystickActive(true);
    updateJoystickPosition(touch.clientX, touch.clientY);
  };

  const handleJoystickMove = useCallback((e: TouchEvent) => {
    if (!isJoystickActive || joystickTouchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchIdRef.current) {
        updateJoystickPosition(touch.clientX, touch.clientY);
        break;
      }
    }
  }, [isJoystickActive]);

  const handleJoystickEnd = useCallback((e: TouchEvent) => {
    if (joystickTouchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joystickTouchIdRef.current) {
        joystickTouchIdRef.current = null;
        setIsJoystickActive(false);
        setJoystickThumb({ x: 0, y: 0 });
        setControls((prev) => ({ ...prev, moveX: 0, moveZ: 0 }));
        break;
      }
    }
  }, []);

  const updateJoystickPosition = (clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const maxRadius = 48; // Max thumb offset in px
    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    setJoystickThumb({ x: dx, y: dy });

    // In 3D Pitch:
    // Screen X corresponds to 3D field Z (or X depending on camera)
    // Left joystick: dx -> 3D X, dy -> 3D Z
    const normX = dx / maxRadius;
    const normZ = dy / maxRadius;

    setControls((prev) => ({
      ...prev,
      moveX: normX,
      moveZ: normZ,
    }));
  };

  useEffect(() => {
    window.addEventListener('touchmove', handleJoystickMove, { passive: false });
    window.addEventListener('touchend', handleJoystickEnd);
    window.addEventListener('touchcancel', handleJoystickEnd);
    return () => {
      window.removeEventListener('touchmove', handleJoystickMove);
      window.removeEventListener('touchend', handleJoystickEnd);
      window.removeEventListener('touchcancel', handleJoystickEnd);
    };
  }, [handleJoystickMove, handleJoystickEnd]);

  // --- KEYBOARD LISTENER (WASD / ARROW KEYS + ACTION KEYS) ---
  useEffect(() => {
    const keysDown = new Set<string>();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      keysDown.add(e.code);

      let mx = 0;
      let mz = 0;
      if (keysDown.has('KeyA') || keysDown.has('ArrowLeft')) mx -= 1;
      if (keysDown.has('KeyD') || keysDown.has('ArrowRight')) mx += 1;
      if (keysDown.has('KeyW') || keysDown.has('ArrowUp')) mz -= 1;
      if (keysDown.has('KeyS') || keysDown.has('ArrowDown')) mz += 1;

      const isSprinting = keysDown.has('ShiftLeft') || keysDown.has('ShiftRight');

      // Actions
      let pass = false;
      let through = false;
      let shoot = false;
      let lob = false;
      let tackle = false;
      let slide = false;
      let switchP = false;

      if (e.code === 'KeyJ') {
        pass = true;
        soundEngine.playButtonClick();
      }
      if (e.code === 'KeyK') {
        if (hasBall) {
          shoot = true;
        } else {
          slide = true;
        }
      }
      if (e.code === 'KeyL') {
        if (hasBall) lob = true;
        else switchP = true;
      }
      if (e.code === 'KeyI') {
        through = true;
      }
      if (e.code === 'Space') {
        if (!hasBall) tackle = true;
      }

      setControls((prev) => ({
        ...prev,
        moveX: mx,
        moveZ: mz,
        isSprinting,
        passRequested: pass || prev.passRequested,
        throughRequested: through || prev.throughRequested,
        shootRequested: shoot || prev.shootRequested,
        shootPower: shoot ? 0.8 : prev.shootPower,
        lobRequested: lob || prev.lobRequested,
        tackleRequested: tackle || prev.tackleRequested,
        slideRequested: slide || prev.slideRequested,
        switchPlayerRequested: switchP || prev.switchPlayerRequested,
      }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.delete(e.code);

      let mx = 0;
      let mz = 0;
      if (keysDown.has('KeyA') || keysDown.has('ArrowLeft')) mx -= 1;
      if (keysDown.has('KeyD') || keysDown.has('ArrowRight')) mx += 1;
      if (keysDown.has('KeyW') || keysDown.has('ArrowUp')) mz -= 1;
      if (keysDown.has('KeyS') || keysDown.has('ArrowDown')) mz += 1;

      const isSprinting = keysDown.has('ShiftLeft') || keysDown.has('ShiftRight');

      setControls((prev) => ({
        ...prev,
        moveX: mx,
        moveZ: mz,
        isSprinting,
      }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [hasBall]);

  // --- TOUCH ACTION BUTTON HELPERS ---
  const handlePassPress = () => {
    soundEngine.playButtonClick();
    setControls((prev) => ({ ...prev, passRequested: true }));
  };

  const handleThroughPress = () => {
    soundEngine.playButtonClick();
    setControls((prev) => ({ ...prev, throughRequested: true }));
  };

  const handleShootStart = () => {
    setChargingPower(0.2);
    const start = Date.now();
    shootTimerRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - start) / 750; // Max power in ~0.75s
      setChargingPower(Math.min(1.0, 0.2 + elapsed * 0.8));
    }, 30);
  };

  const handleShootEnd = () => {
    if (shootTimerRef.current) {
      clearInterval(shootTimerRef.current);
      shootTimerRef.current = null;
    }
    const finalPower = chargingPower;
    setChargingPower(0);
    setControls((prev) => ({ ...prev, shootRequested: true, shootPower: finalPower }));
  };

  const handleLobPress = () => {
    soundEngine.playButtonClick();
    setControls((prev) => ({ ...prev, lobRequested: true }));
  };

  const handleTacklePress = () => {
    soundEngine.playButtonClick();
    setControls((prev) => ({ ...prev, tackleRequested: true }));
  };

  const handleSlidePress = () => {
    soundEngine.playButtonClick();
    setControls((prev) => ({ ...prev, slideRequested: true }));
  };

  const handleSwitchPress = () => {
    soundEngine.playButtonClick();
    setControls((prev) => ({ ...prev, switchPlayerRequested: true }));
  };

  const handleSprintToggle = (sprint: boolean) => {
    setControls((prev) => ({ ...prev, isSprinting: sprint }));
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex justify-between items-end p-4 sm:p-8 select-none">
      {/* LEFT: Virtual Analog Joystick */}
      <div className="relative pointer-events-auto touch-none pb-4 pl-2">
        <div
          ref={joystickBaseRef}
          onTouchStart={handleJoystickStart}
          className={`w-32 h-32 rounded-full border-2 border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center transition-shadow shadow-2xl ${
            isJoystickActive ? 'border-[#00f2fe]/70 shadow-[#00f2fe]/20 shadow-lg' : ''
          }`}
        >
          {/* Outer compass ring markings */}
          <div className="absolute inset-1 rounded-full border border-white/10 pointer-events-none" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/20" />

          {/* Thumb stick head */}
          <div
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#00f2fe] to-[#4facfe] shadow-lg flex items-center justify-center border-2 border-white/80 active:scale-95 transition-transform"
            style={{
              transform: `translate(${joystickThumb.x}px, ${joystickThumb.y}px)`,
            }}
          >
            <div className="w-5 h-5 rounded-full bg-white/40" />
          </div>
        </div>

        {/* Stamina Meter below joystick */}
        <div className="w-32 mt-2 px-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 mb-1">
            <span>STAMINA</span>
            <span className={stamina < 30 ? 'text-rose-400' : 'text-[#00f2fe]'}>
              {Math.round(stamina)}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden border border-white/10">
            <div
              className={`h-full transition-all duration-150 ${
                stamina < 30
                  ? 'bg-rose-500'
                  : 'bg-gradient-to-r from-[#00f2fe] to-[#38ef7d]'
              }`}
              style={{ width: `${stamina}%` }}
            />
          </div>
        </div>
      </div>

      {/* RIGHT: Action Buttons Cluster */}
      <div className="pointer-events-auto touch-none flex flex-col items-end gap-3 pb-4 pr-2">
        {/* Top Secondary Row (Sprint / Skill) */}
        <div className="flex items-center gap-3">
          {/* Sprint Button (Hold to Sprint) */}
          <button
            onTouchStart={() => handleSprintToggle(true)}
            onTouchEnd={() => handleSprintToggle(false)}
            onMouseDown={() => handleSprintToggle(true)}
            onMouseUp={() => handleSprintToggle(false)}
            className={`w-14 h-14 rounded-full text-xs font-black tracking-wider uppercase flex items-center justify-center border-2 transition active:scale-90 shadow-xl ${
              controls.isSprinting
                ? 'bg-[#f59e0b] text-black border-white shadow-[#f59e0b]/50'
                : 'bg-black/60 text-white border-white/30 backdrop-blur-md'
            }`}
          >
            SPRINT
          </button>

          {/* Context Special (Through Ball in attack / Switch Player in defense) */}
          {hasBall ? (
            <button
              onTouchStart={handleThroughPress}
              onClick={handleThroughPress}
              className="w-14 h-14 rounded-full bg-black/60 text-[#00f2fe] border-2 border-[#00f2fe]/60 backdrop-blur-md text-xs font-black tracking-wider uppercase flex items-center justify-center shadow-xl active:scale-90"
            >
              THRU
            </button>
          ) : (
            <button
              onTouchStart={handleSwitchPress}
              onClick={handleSwitchPress}
              className="w-14 h-14 rounded-full bg-black/60 text-[#38ef7d] border-2 border-[#38ef7d]/60 backdrop-blur-md text-xs font-black tracking-wider uppercase flex items-center justify-center shadow-xl active:scale-90"
            >
              SWITCH
            </button>
          )}
        </div>

        {/* Primary 3-Button Diamond (Pass, Shoot, Cross/Tackle) */}
        <div className="relative w-44 h-44 flex items-center justify-center">
          {/* Button B - Shoot (Top) or Slide Tackle (Top) */}
          {hasBall ? (
            <div className="absolute top-0 flex flex-col items-center">
              {chargingPower > 0 && (
                <div className="w-16 h-2 mb-1 bg-black/80 rounded-full border border-white/20 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500"
                    style={{ width: `${chargingPower * 100}%` }}
                  />
                </div>
              )}
              <button
                onTouchStart={handleShootStart}
                onTouchEnd={handleShootEnd}
                onMouseDown={handleShootStart}
                onMouseUp={handleShootEnd}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#e11d48] to-[#f43f5e] text-white border-2 border-white/80 shadow-2xl flex items-center justify-center text-xs font-black tracking-wider uppercase active:scale-90"
              >
                SHOOT
              </button>
            </div>
          ) : (
            <div className="absolute top-0">
              <button
                onTouchStart={handleSlidePress}
                onClick={handleSlidePress}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#f97316] to-[#fb923c] text-white border-2 border-white/80 shadow-2xl flex items-center justify-center text-xs font-black tracking-wider uppercase active:scale-90"
              >
                SLIDE
              </button>
            </div>
          )}

          {/* Button A - Pass (Bottom Right) or Tackle (Bottom Right) */}
          {hasBall ? (
            <button
              onTouchStart={handlePassPress}
              onClick={handlePassPress}
              className="absolute bottom-0 right-0 w-16 h-16 rounded-full bg-gradient-to-tr from-[#0284c7] to-[#38bdf8] text-white border-2 border-white/80 shadow-2xl flex items-center justify-center text-xs font-black tracking-wider uppercase active:scale-90"
            >
              PASS
            </button>
          ) : (
            <button
              onTouchStart={handleTacklePress}
              onClick={handleTacklePress}
              className="absolute bottom-0 right-0 w-16 h-16 rounded-full bg-gradient-to-tr from-[#e11d48] to-[#f43f5e] text-white border-2 border-white/80 shadow-2xl flex items-center justify-center text-xs font-black tracking-wider uppercase active:scale-90"
            >
              PRESS
            </button>
          )}

          {/* Button C - Lob/Cross (Left) */}
          {hasBall ? (
            <button
              onTouchStart={handleLobPress}
              onClick={handleLobPress}
              className="absolute bottom-2 left-0 w-14 h-14 rounded-full bg-gradient-to-tr from-[#059669] to-[#34d399] text-white border-2 border-white/80 shadow-2xl flex items-center justify-center text-xs font-black tracking-wider uppercase active:scale-90"
            >
              CROSS
            </button>
          ) : (
            <button
              onTouchStart={handleTacklePress}
              onClick={handleTacklePress}
              className="absolute bottom-2 left-0 w-14 h-14 rounded-full bg-black/60 text-white border-2 border-white/40 backdrop-blur-md shadow-2xl flex items-center justify-center text-xs font-black tracking-wider uppercase active:scale-90"
            >
              TACKLE
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
