// Triumph League - Web Gamepad API Controller (Xbox / PlayStation / Generic USB)
import { ControlState } from '../types';

export interface GamepadStatus {
  connected: boolean;
  name: string;
  type: 'xbox' | 'playstation' | 'generic';
}

class GamepadController {
  private connectedGamepadIndex: number | null = null;
  private gamepadName: string = '';
  private listeners: ((status: GamepadStatus) => void)[] = [];
  private lastButtonStates: Record<number, boolean> = {};

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('gamepadconnected', (e: GamepadEvent) => {
        this.connectedGamepadIndex = e.gamepad.index;
        this.gamepadName = e.gamepad.id;
        this.notify();
      });

      window.addEventListener('gamepaddisconnected', (e: GamepadEvent) => {
        if (this.connectedGamepadIndex === e.gamepad.index) {
          this.connectedGamepadIndex = null;
          this.gamepadName = '';
          this.notify();
        }
      });
    }
  }

  public subscribe(callback: (status: GamepadStatus) => void): () => void {
    this.listeners.push(callback);
    callback(this.getStatus());
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notify() {
    const status = this.getStatus();
    this.listeners.forEach((cb) => cb(status));
  }

  public getStatus(): GamepadStatus {
    const connected = this.connectedGamepadIndex !== null;
    const lowerName = this.gamepadName.toLowerCase();
    const type = lowerName.includes('xbox') || lowerName.includes('x-box')
      ? 'xbox'
      : lowerName.includes('dualshock') || lowerName.includes('dualsense') || lowerName.includes('playstation') || lowerName.includes('sony')
      ? 'playstation'
      : 'generic';

    return {
      connected,
      name: this.gamepadName ? (this.gamepadName.split('(')[0] || 'Game Controller').trim() : 'No Controller',
      type,
    };
  }

  /**
   * Polls gamepad hardware and returns updated ControlState if controller is active
   */
  public poll(currentControls: ControlState): ControlState | null {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return null;

    const gamepads = navigator.getGamepads();
    if (!gamepads) return null;

    let activePad: Gamepad | null = null;
    for (let i = 0; i < gamepads.length; i++) {
      const gp = gamepads[i];
      if (gp && gp.connected) {
        activePad = gp;
        this.connectedGamepadIndex = gp.index;
        this.gamepadName = gp.id;
        break;
      }
    }

    if (!activePad) return null;

    // Standard Mapping:
    // Axes: 0 = Left Stick X, 1 = Left Stick Y
    // Buttons:
    // 0: A (Xbox) / Cross (PS) -> Short Pass
    // 1: B (Xbox) / Circle (PS) -> Lob / Cross / Slide
    // 2: X (Xbox) / Square (PS) -> Shoot
    // 3: Y (Xbox) / Triangle (PS) -> Through Ball
    // 4: LB / L1 -> Switch Player
    // 5: RB / R1 -> Skill Move
    // 6: LT / L2 -> Defend Jockey
    // 7: RT / R2 -> Sprint
    // 9: Start / Options -> Pause

    const deadzone = 0.15;
    let lx = activePad.axes[0] || 0;
    let ly = activePad.axes[1] || 0;

    if (Math.abs(lx) < deadzone) lx = 0;
    if (Math.abs(ly) < deadzone) ly = 0;

    // Normalize
    const len = Math.hypot(lx, ly);
    if (len > 1.0) {
      lx /= len;
      ly /= len;
    }

    // Button edge detectors
    const btnA = activePad.buttons[0]?.pressed || false;
    const btnB = activePad.buttons[1]?.pressed || false;
    const btnX = activePad.buttons[2]?.pressed || false;
    const btnY = activePad.buttons[3]?.pressed || false;
    const btnLB = activePad.buttons[4]?.pressed || false;
    const btnRB = activePad.buttons[5]?.pressed || false;
    const btnRT = (activePad.buttons[7]?.value || 0) > 0.2 || activePad.buttons[7]?.pressed || false;

    // Shoot button charge trigger
    const shootPower = btnX ? Math.min(1.0, currentControls.shootPower + 0.035) : 0;

    // Detect single press triggers
    const passJustPressed = btnA && !this.lastButtonStates[0];
    const lobJustPressed = btnB && !this.lastButtonStates[1];
    const throughJustPressed = btnY && !this.lastButtonStates[3];
    const switchJustPressed = btnLB && !this.lastButtonStates[4];
    const skillJustPressed = btnRB && !this.lastButtonStates[5];

    this.lastButtonStates[0] = btnA;
    this.lastButtonStates[1] = btnB;
    this.lastButtonStates[2] = btnX;
    this.lastButtonStates[3] = btnY;
    this.lastButtonStates[4] = btnLB;
    this.lastButtonStates[5] = btnRB;

    return {
      moveX: lx,
      moveZ: ly,
      isSprinting: btnRT,
      passRequested: passJustPressed,
      lobRequested: lobJustPressed,
      throughRequested: throughJustPressed,
      shootRequested: !btnX && (this.lastButtonStates[2] || false) && currentControls.shootPower > 0.1,
      shootPower: btnX ? shootPower : currentControls.shootPower,
      tackleRequested: btnB,
      slideRequested: btnB && btnRT,
      switchPlayerRequested: switchJustPressed,
      skillRequested: skillJustPressed,
    };
  }

  public vibrate(durationMs: number = 150, weakIntensity: number = 0.5, strongIntensity: number = 0.5) {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return;
    const gamepads = navigator.getGamepads();
    if (!gamepads) return;

    for (let i = 0; i < gamepads.length; i++) {
      const gp = gamepads[i];
      if (gp && (gp as any).vibrationActuator) {
        try {
          (gp as any).vibrationActuator.playEffect('dual-rumble', {
            startDelay: 0,
            duration: durationMs,
            weakMagnitude: weakIntensity,
            strongMagnitude: strongIntensity,
          });
        } catch {}
      }
    }
  }
}

export const gamepadController = new GamepadController();
