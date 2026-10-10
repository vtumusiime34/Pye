// Triumph League - 3D Ball Physics Engine
import * as THREE from 'three';
import { soundEngine } from './AudioEngine';
import { commentaryEngine } from './CommentaryEngine';
import { gamepadController } from './GamepadController';

export interface GoalEvent {
  team: 'home' | 'away';
  position: THREE.Vector3;
}

export class BallPhysics {
  public mesh: THREE.Mesh;
  public shadowMesh: THREE.Mesh;
  public position: THREE.Vector3 = new THREE.Vector3(0, 0.22, 0);
  public velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public angularVelocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

  // Field dimensions in meters / units
  public readonly fieldLength = 105;
  public readonly halfLength = 52.5;
  public readonly fieldWidth = 68;
  public readonly halfWidth = 34;

  // Goal dimensions
  public readonly goalWidth = 7.32;
  public readonly halfGoalWidth = 3.66;
  public readonly goalHeight = 2.44;
  public readonly goalDepth = 2.0;

  // Physical constants
  public readonly radius = 0.22; // FIFA standard ball radius ~22cm
  private readonly gravity = -18.0; // Snappy football gravity
  private readonly airDrag = 0.992;
  private readonly groundRestitution = 0.62; // Bounce elasticity
  private readonly rollingFriction = 0.978;
  private readonly magnusFactor = 0.0035; // Curve effect

  // State
  public isGoalScored: boolean = false;
  public lastTouchedBy: { playerId: string; team: 'home' | 'away' } | null = null;
  public ownerPlayerId: string | null = null;

  constructor(scene: THREE.Scene) {
    // 3D Classic football texture using procedural canvas
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // White base with black pentagon/hexagon tessellation
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 512, 256);

    ctx.fillStyle = '#0f172a';
    for (let y = 30; y < 256; y += 60) {
      for (let x = 30; x < 512; x += 80) {
        ctx.beginPath();
        const r = 16;
        for (let a = 0; a < 6; a++) {
          const angle = (a * 60 * Math.PI) / 180;
          const px = x + r * Math.cos(angle);
          const py = y + r * Math.sin(angle);
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      }
    }

    const ballTexture = new THREE.CanvasTexture(canvas);
    ballTexture.wrapS = THREE.RepeatWrapping;
    ballTexture.wrapT = THREE.RepeatWrapping;

    const ballGeo = new THREE.SphereGeometry(this.radius, 24, 24);
    const ballMat = new THREE.MeshStandardMaterial({
      map: ballTexture,
      roughness: 0.35,
      metalness: 0.1,
    });

    this.mesh = new THREE.Mesh(ballGeo, ballMat);
    this.mesh.castShadow = true;
    this.mesh.position.copy(this.position);
    scene.add(this.mesh);

    // Realistic soft contact shadow on grass
    const shadowGeo = new THREE.PlaneGeometry(0.7, 0.7);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 64;
    shadowCanvas.height = 64;
    const sCtx = shadowCanvas.getContext('2d')!;
    const grad = sCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.25)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 64, 64);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });

    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.y = 0.02;
    scene.add(this.shadowMesh);
  }

  public reset(x: number = 0, z: number = 0) {
    this.position.set(x, this.radius, z);
    this.velocity.set(0, 0, 0);
    this.angularVelocity.set(0, 0, 0);
    this.mesh.position.copy(this.position);
    this.isGoalScored = false;
    this.ownerPlayerId = null;
  }

  public kick(dir: THREE.Vector3, speed: number, lift: number = 0, spinY: number = 0) {
    this.ownerPlayerId = null;
    const normDir = dir.clone().normalize();

    this.velocity.x = normDir.x * speed;
    this.velocity.z = normDir.z * speed;
    this.velocity.y = lift;

    this.angularVelocity.set(normDir.z * speed * 2, spinY * 15, -normDir.x * speed * 2);

    soundEngine.playKick(Math.min(1.0, speed / 28));
  }

  public update(dt: number, onGoal?: (event: GoalEvent) => void): { outOfBounds: boolean; side: 'touchline' | 'goalline_home' | 'goalline_away' | null } {
    // If clamped to player dribble
    if (this.ownerPlayerId) {
      this.mesh.position.copy(this.position);
      this.shadowMesh.position.x = this.position.x;
      this.shadowMesh.position.z = this.position.z;
      this.shadowMesh.scale.setScalar(1.0);
      return { outOfBounds: false, side: null };
    }

    // Apply Magnus effect (curve in air)
    if (this.position.y > this.radius + 0.05) {
      this.velocity.x += this.angularVelocity.y * this.velocity.z * this.magnusFactor;
      this.velocity.z -= this.angularVelocity.y * this.velocity.x * this.magnusFactor;
    }

    // Apply gravity
    this.velocity.y += this.gravity * dt;

    // Apply air drag
    this.velocity.x *= Math.pow(this.airDrag, dt * 60);
    this.velocity.z *= Math.pow(this.airDrag, dt * 60);

    // Euler integration
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    this.position.z += this.velocity.z * dt;

    // Ground collision
    if (this.position.y <= this.radius) {
      this.position.y = this.radius;

      if (Math.abs(this.velocity.y) > 1.2) {
        this.velocity.y = -this.velocity.y * this.groundRestitution;
        soundEngine.playKick(0.15);
      } else {
        this.velocity.y = 0;
      }

      // Ground rolling friction
      this.velocity.x *= Math.pow(this.rollingFriction, dt * 60);
      this.velocity.z *= Math.pow(this.rollingFriction, dt * 60);
      this.angularVelocity.multiplyScalar(0.96);
    }

    // Rotate ball according to rolling velocity
    const speed = Math.hypot(this.velocity.x, this.velocity.z);
    if (speed > 0.05) {
      const rotAngle = (speed / this.radius) * dt;
      const rotAxis = new THREE.Vector3(-this.velocity.z, 0, this.velocity.x).normalize();
      this.mesh.rotateOnWorldAxis(rotAxis, rotAngle);
    }

    // Net and Post collisions
    this.handleGoalCollisions(onGoal);

    // Sync mesh position
    this.mesh.position.copy(this.position);

    // Sync ground shadow
    this.shadowMesh.position.x = this.position.x;
    this.shadowMesh.position.z = this.position.z;
    const heightRatio = Math.max(0, 1 - (this.position.y - this.radius) / 6);
    this.shadowMesh.scale.setScalar(0.6 + heightRatio * 0.4);
    (this.shadowMesh.material as THREE.MeshBasicMaterial).opacity = 0.65 * heightRatio;

    // Check bounds
    if (!this.isGoalScored) {
      if (Math.abs(this.position.z) > this.halfWidth) {
        return { outOfBounds: true, side: 'touchline' };
      }
      if (this.position.x < -this.halfLength && Math.abs(this.position.z) > this.halfGoalWidth) {
        return { outOfBounds: true, side: 'goalline_home' };
      }
      if (this.position.x > this.halfLength && Math.abs(this.position.z) > this.halfGoalWidth) {
        return { outOfBounds: true, side: 'goalline_away' };
      }
    }

    return { outOfBounds: false, side: null };
  }

  private handleGoalCollisions(onGoal?: (event: GoalEvent) => void) {
    // Home Goal (at -halfLength, x = -52.5)
    // Away Goal (at +halfLength, x = +52.5)
    const checkGoal = (goalX: number, isAwayTeamGoal: boolean) => {
      const isPastLine = goalX < 0 ? this.position.x <= goalX : this.position.x >= goalX;

      // Inside goal mouth width & height
      if (
        isPastLine &&
        Math.abs(this.position.z) <= this.halfGoalWidth &&
        this.position.y <= this.goalHeight + 0.1
      ) {
        if (!this.isGoalScored) {
          this.isGoalScored = true;
          soundEngine.playGoalRoar();
          if (onGoal) {
            onGoal({
              team: isAwayTeamGoal ? 'away' : 'home',
              position: this.position.clone(),
            });
          }
        }

        // Net cushioning: damp velocity inside net
        this.velocity.multiplyScalar(0.75);

        // Back of net clamp
        const backWallX = goalX < 0 ? goalX - this.goalDepth : goalX + this.goalDepth;
        if (goalX < 0 && this.position.x < backWallX) {
          this.position.x = backWallX;
          this.velocity.x = 0;
        } else if (goalX > 0 && this.position.x > backWallX) {
          this.position.x = backWallX;
          this.velocity.x = 0;
        }

        // Side netting clamp
        if (Math.abs(this.position.z) > this.halfGoalWidth - 0.2) {
          this.position.z = Math.sign(this.position.z) * (this.halfGoalWidth - 0.2);
          this.velocity.z *= -0.2;
        }
      }

      // Crossbar collision
      const distToLine = Math.abs(this.position.x - goalX);
      if (distToLine < 0.35 && Math.abs(this.position.z) <= this.halfGoalWidth) {
        if (Math.abs(this.position.y - this.goalHeight) < 0.25) {
          this.velocity.y = Math.abs(this.velocity.y) * 0.7;
          this.velocity.x *= -0.6;
          soundEngine.playPostHit();
          commentaryEngine.triggerEvent('post_hit', {}, 7);
          gamepadController.vibrate(200, 0.4, 0.7);
        }
      }

      // Left & Right Post collisions
      if (distToLine < 0.35 && this.position.y <= this.goalHeight) {
        const distToLeftPost = Math.abs(this.position.z - -this.halfGoalWidth);
        const distToRightPost = Math.abs(this.position.z - this.halfGoalWidth);
        if (distToLeftPost < 0.25 || distToRightPost < 0.25) {
          this.velocity.z *= -0.8;
          this.velocity.x *= -0.6;
          soundEngine.playPostHit();
          commentaryEngine.triggerEvent('post_hit', {}, 7);
          gamepadController.vibrate(200, 0.4, 0.7);
        }
      }
    };

    checkGoal(-this.halfLength, true); // Ball scored in Home net => Away team scores
    checkGoal(this.halfLength, false);  // Ball scored in Away net => Home team scores
  }
}
