// Triumph League - Master Match Orchestrator (11v11 Rules, Physics & Camera)
import * as THREE from 'three';
import { TeamData, ControlState, MatchPhase, MatchStats, MatchGoalEvent, CameraPreset } from '../types';
import { BallPhysics, GoalEvent } from './BallPhysics';
import { PlayerModel } from './PlayerModel';
import { StadiumBuilder } from './StadiumBuilder';
import { FootballAI } from './FootballAI';
import { soundEngine } from './AudioEngine';
import { commentaryEngine } from './CommentaryEngine';
import { gamepadController } from './GamepadController';
import { SaveManager } from './SaveManager';

export class FootballMatch {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public ball: BallPhysics;

  public homeTeam: TeamData;
  public awayTeam: TeamData;
  public homePlayers: PlayerModel[] = [];
  public awayPlayers: PlayerModel[] = [];
  public allPlayers: PlayerModel[] = [];

  // Match state
  public phase: MatchPhase = 'kickoff';
  public matchTimeSeconds: number = 0; // In match minutes (0 to 90)
  public homeScore: number = 0;
  public awayScore: number = 0;
  public stoppageTime: number = 2;
  public stats: MatchStats = {
    homeShots: 0,
    awayShots: 0,
    homeShotsOnTarget: 0,
    awayShotsOnTarget: 0,
    homePossessionPercent: 52,
    awayPossessionPercent: 48,
    homePasses: 0,
    awayPasses: 0,
    homePassAccuracy: 88,
    awayPassAccuracy: 85,
    homeTackles: 0,
    awayTackles: 0,
    homeCorners: 0,
    awayCorners: 0,
    homeFouls: 0,
    awayFouls: 0,
  };
  public goalEvents: MatchGoalEvent[] = [];

  // Controls & Active Player
  public userPlayer: PlayerModel | null = null;
  public currentControlState: ControlState = {
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
  };

  // Camera tracking
  public cameraPreset: CameraPreset = 'tv_broadcast';
  private cameraTarget: THREE.Vector3 = new THREE.Vector3();
  private stadiumUpdate?: (dt: number) => void;

  // Celebration state
  private celebrationTimer = 0;
  private recentGoalEvent: MatchGoalEvent | null = null;

  constructor(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    homeTeam: TeamData,
    awayTeam: TeamData
  ) {
    this.scene = scene;
    this.camera = camera;
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;

    // 1. Build Stadium & Pitch
    const stadium = new StadiumBuilder(this.scene);
    const stadiumRes = stadium.buildStadium('night_floodlit');
    this.stadiumUpdate = stadiumRes.update;

    // 2. Build Ball
    this.ball = new BallPhysics(this.scene);

    // 3. Spawn 11 Home Players and 11 Away Players
    this.spawnTeams();

    // 4. Initial Kickoff Setup
    this.setupKickoff(true);

    // 5. Select active user player
    this.autoSelectActivePlayer();

    // Start crowd audio ambience
    soundEngine.startCrowdAmbience();
  }

  private spawnTeams() {
    // 11 Home Players
    this.homeTeam.players.slice(0, 11).forEach((pData) => {
      const p = new PlayerModel(pData, this.homeTeam.primaryKit, 'home', this.scene);
      this.homePlayers.push(p);
      this.allPlayers.push(p);
    });

    // 11 Away Players
    this.awayTeam.players.slice(0, 11).forEach((pData) => {
      const p = new PlayerModel(pData, this.awayTeam.primaryKit, 'away', this.scene);
      this.awayPlayers.push(p);
      this.allPlayers.push(p);
    });
  }

  public setupKickoff(homeKickingOff: boolean) {
    this.phase = 'kickoff';
    this.ball.reset(0, 0);

    // Position Home Players (defending -X, attacking +X)
    this.homePlayers.forEach((p) => {
      const anchor = FootballAI.getFormationCoordinates(p.data.position, '4-3-3', true);
      p.group.position.set(anchor.x, 0, anchor.z);
      p.group.rotation.y = Math.PI / 2; // Facing opponent goal (+X)
      p.hasBall = false;
      p.updateAnimation(0, false, 0);
    });

    // Position Away Players (defending +X, attacking -X)
    this.awayPlayers.forEach((p) => {
      const anchor = FootballAI.getFormationCoordinates(p.data.position, '4-3-3', false);
      p.group.position.set(anchor.x, 0, anchor.z);
      p.group.rotation.y = -Math.PI / 2; // Facing home goal (-X)
      p.hasBall = false;
      p.updateAnimation(0, false, 0);
    });

    // Move kicking striker to center circle
    const kickoffTeam = homeKickingOff ? this.homePlayers : this.awayPlayers;
    const striker = kickoffTeam.find((p) => p.data.position === 'ST') || kickoffTeam[kickoffTeam.length - 1];
    striker.group.position.set(homeKickingOff ? -0.8 : 0.8, 0, 0);
    striker.hasBall = true;

    this.userPlayer = striker;
    this.userPlayer.setControlled(true);

    soundEngine.playWhistle(false);
    commentaryEngine.triggerEvent(
      'kickoff',
      {
        home: this.homeTeam.name,
        away: this.awayTeam.name,
        stadium: this.homeTeam.stadiumName,
      },
      8
    );
  }

  public autoSelectActivePlayer() {
    // Select closest outfield home player to ball
    let closest: PlayerModel | null = null;
    let minDist = Infinity;

    for (const p of this.homePlayers) {
      if (p.isGoalkeeper) continue;
      const d = p.group.position.distanceTo(this.ball.position);
      if (d < minDist) {
        minDist = d;
        closest = p;
      }
    }

    if (closest && closest !== this.userPlayer) {
      if (this.userPlayer) {
        this.userPlayer.setControlled(false);
      }
      this.userPlayer = closest;
      this.userPlayer.setControlled(true);
    }
  }

  public update(dt: number) {
    // 1. Update Stadium LED anims
    if (this.stadiumUpdate) this.stadiumUpdate(dt);

    // 2. Update Match Clock (scaled: ~90 mins over configured game length)
    if (this.phase === 'in_play' || this.phase === 'kickoff') {
      this.matchTimeSeconds += dt * 0.55; // ~3.5 min match length for 90 football minutes
      if (this.matchTimeSeconds >= 45 && this.matchTimeSeconds < 45.1) {
        soundEngine.playWhistle(true);
        commentaryEngine.triggerEvent(
          'half_time',
          { homeScore: this.homeScore, awayScore: this.awayScore },
          9
        );
      }
      if (this.matchTimeSeconds >= 90) {
        this.phase = 'full_time';
        soundEngine.playWhistle(true);
        commentaryEngine.triggerEvent(
          'full_time',
          { homeScore: this.homeScore, awayScore: this.awayScore },
          10
        );
        SaveManager.recordMatchResult(this.homeScore, this.awayScore, true);
      }
    }

    // 3. Handle Celebration Phase
    if (this.phase === 'celebration') {
      this.celebrationTimer += dt;
      if (this.celebrationTimer > 4.5) {
        this.setupKickoff(this.recentGoalEvent?.team === 'away');
      }
      this.updateCamera(dt);
      return;
    }

    // 4. Update Ball Physics
    const bounds = this.ball.update(dt, (goalEvent: GoalEvent) => {
      this.handleGoal(goalEvent);
    });

    // Handle touchline throw-in or goal kicks
    if (bounds.outOfBounds && this.phase === 'in_play') {
      this.handleOutOfBounds(bounds.side);
    }

    // 5. Update User Controlled Player
    this.updateUserPlayer(dt);

    // 6. Update AI for All Other Players
    this.updateAIPlayers(dt);

    // 7. Check for Ball Possession / Interceptions
    this.checkPossessionInterceptions();

    // 8. Update Camera Tracking
    this.updateCamera(dt);
  }

  private updateUserPlayer(dt: number) {
    if (!this.userPlayer) return;

    const u = this.userPlayer;
    const ctrl = this.currentControlState;

    // Manual Switch Player requested
    if (ctrl.switchPlayerRequested) {
      ctrl.switchPlayerRequested = false;
      this.autoSelectActivePlayer();
      soundEngine.playButtonClick();
      return;
    }

    // Movement
    const isMoving = Math.abs(ctrl.moveX) > 0.05 || Math.abs(ctrl.moveZ) > 0.05;

    // Sprinting stamina
    let moveSpeed = u.data.attributes.pace * 0.08;
    if (ctrl.isSprinting && isMoving && u.stamina > 10) {
      moveSpeed *= 1.35;
      u.stamina = Math.max(0, u.stamina - dt * 18);
    } else {
      u.stamina = Math.min(100, u.stamina + dt * 12);
    }

    if (isMoving) {
      const moveDir = new THREE.Vector3(ctrl.moveX, 0, ctrl.moveZ).normalize();
      u.group.position.addScaledVector(moveDir, moveSpeed * dt);
      u.group.rotation.y = Math.atan2(moveDir.x, moveDir.z);

      // Clamp within pitch
      u.group.position.x = THREE.MathUtils.clamp(u.group.position.x, -51, 51);
      u.group.position.z = THREE.MathUtils.clamp(u.group.position.z, -33, 33);
    }

    u.updateAnimation(dt, isMoving, isMoving ? moveSpeed : 0);

    // If player has ball, tether ball to feet
    if (u.hasBall) {
      if (this.phase === 'kickoff') this.phase = 'in_play';

      const forwardOffset = new THREE.Vector3(0, 0, 0.75).applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        u.group.rotation.y
      );
      this.ball.position.copy(u.group.position).add(forwardOffset);
      this.ball.position.y = this.ball.radius;
      this.ball.velocity.set(0, 0, 0);

      // Actions when in possession:
      // Pass
      if (ctrl.passRequested) {
        ctrl.passRequested = false;
        this.executeGroundPass(u, false);
      }
      // Through Ball
      else if (ctrl.throughRequested) {
        ctrl.throughRequested = false;
        this.executeGroundPass(u, true);
      }
      // Shoot
      else if (ctrl.shootRequested) {
        ctrl.shootRequested = false;
        this.executeShot(u, Math.max(0.4, ctrl.shootPower || 0.75));
      }
      // Lob / Cross
      else if (ctrl.lobRequested) {
        ctrl.lobRequested = false;
        this.executeLobCross(u);
      }
    } else {
      // Actions when defending (No ball):
      if (ctrl.tackleRequested || ctrl.slideRequested) {
        const isSlide = ctrl.slideRequested;
        ctrl.tackleRequested = false;
        ctrl.slideRequested = false;
        this.executeTackle(u, isSlide);
      }
    }
  }

  private updateAIPlayers(dt: number) {
    this.allPlayers.forEach((p) => {
      // Skip the user-controlled player
      if (p === this.userPlayer) return;

      const isHome = p.teamSide === 'home';
      const teammates = isHome ? this.homePlayers : this.awayPlayers;
      const opponents = isHome ? this.awayPlayers : this.homePlayers;

      FootballAI.updatePlayerAI(
        p,
        this.ball,
        this.allPlayers,
        teammates,
        opponents,
        dt,
        (from, to, isThrough) => {
          this.executeGroundPass(from, isThrough, to);
        },
        (from, power) => {
          this.executeShot(from, power);
        },
        (from) => {
          this.executeTackle(from, false);
        }
      );
    });
  }

  private checkPossessionInterceptions() {
    if (this.phase !== 'in_play') return;

    // Check if any player reaches free ball
    this.allPlayers.forEach((p) => {
      const dist = p.group.position.distanceTo(this.ball.position);

      // Ball capture radius ~1.1m
      if (dist < 1.15 && this.ball.position.y < 1.4) {
        if (!p.hasBall) {
          // Dispossess previous owner
          this.allPlayers.forEach((other) => (other.hasBall = false));
          p.hasBall = true;
          this.ball.ownerPlayerId = p.data.id;
          this.ball.lastTouchedBy = { playerId: p.data.id, team: p.teamSide };

          if (p.isGoalkeeper) {
            p.triggerAction('gk_dive');
            commentaryEngine.triggerEvent('goalkeeper_save', { keeper: p.data.shortName }, 8);
            gamepadController.vibrate(200, 0.5, 0.7);
          }

          // If home team gains possession and user isn't controlling them, auto switch!
          if (p.teamSide === 'home' && p !== this.userPlayer) {
            if (this.userPlayer) this.userPlayer.setControlled(false);
            this.userPlayer = p;
            this.userPlayer.setControlled(true);
          }
        }
      }
    });
  }

  public executeGroundPass(from: PlayerModel, isThrough: boolean, target?: PlayerModel) {
    from.triggerAction('kick');
    from.hasBall = false;
    this.ball.ownerPlayerId = null;

    const teammates = from.teamSide === 'home' ? this.homePlayers : this.awayPlayers;

    // Find best recipient in direction of player facing
    let recipient = target;
    if (!recipient) {
      const facingDir = new THREE.Vector3(0, 0, 1).applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        from.group.rotation.y
      );

      let bestScore = -Infinity;
      teammates.forEach((t) => {
        if (t === from) return;
        const toT = new THREE.Vector3().subVectors(t.group.position, from.group.position);
        const dist = toT.length();
        if (dist > 38 || dist < 2) return;

        const dot = facingDir.dot(toT.clone().normalize());
        const score = dot * 2.0 - dist * 0.03;
        if (score > bestScore) {
          bestScore = score;
          recipient = t;
        }
      });
    }

    if (!recipient) {
      recipient = teammates.find((t) => t !== from && !t.isGoalkeeper);
    }

    if (recipient) {
      const targetPos = recipient.group.position.clone();
      if (isThrough) {
        // Lead the pass forward towards opponent goal
        const forwardX = from.teamSide === 'home' ? 6.5 : -6.5;
        targetPos.x += forwardX;
      }

      const passDir = new THREE.Vector3().subVectors(targetPos, from.group.position);
      const dist = passDir.length();
      const speed = THREE.MathUtils.clamp(dist * 1.35 + 8, 12, 28);

      this.ball.kick(passDir.normalize(), speed, 0.4);

      commentaryEngine.triggerEvent(
        isThrough ? 'through_ball' : 'buildup_pass',
        { player: from.data.shortName },
        isThrough ? 6 : 2
      );

      if (from.teamSide === 'home') {
        this.stats.homePasses++;
      } else {
        this.stats.awayPasses++;
      }

      // Switch active player to recipient
      if (from.teamSide === 'home') {
        setTimeout(() => {
          if (recipient && this.userPlayer !== recipient) {
            if (this.userPlayer) this.userPlayer.setControlled(false);
            this.userPlayer = recipient;
            this.userPlayer.setControlled(true);
          }
        }, 180);
      }
    }
  }

  public executeLobCross(from: PlayerModel) {
    from.triggerAction('kick');
    from.hasBall = false;
    this.ball.ownerPlayerId = null;

    const isHome = from.teamSide === 'home';
    const targetGoalX = isHome ? 52.5 : -52.5;

    // Cross into penalty box
    const penaltyBoxTarget = new THREE.Vector3(
      isHome ? 42 : -42,
      0,
      THREE.MathUtils.clamp(from.group.position.z * 0.3, -8, 8)
    );

    const crossDir = new THREE.Vector3().subVectors(penaltyBoxTarget, from.group.position);
    this.ball.kick(crossDir.normalize(), 22, 11);
  }

  public executeShot(from: PlayerModel, power: number = 0.8) {
    from.triggerAction('shoot');
    from.hasBall = false;
    this.ball.ownerPlayerId = null;

    const isHome = from.teamSide === 'home';
    const goalX = isHome ? 52.5 : -52.5;

    // Target goal corners based on player angle
    const targetZ = (Math.random() - 0.5) * 6.5; // Spread inside goal width (7.32m)
    const targetY = 0.5 + Math.random() * 1.6;   // Top or bottom corner

    const shotTarget = new THREE.Vector3(goalX, targetY, targetZ);
    const shotDir = new THREE.Vector3().subVectors(shotTarget, from.group.position);

    const speed = 20 + power * 15;
    const lift = 3.5 + power * 6.0;
    const spinY = (Math.random() - 0.5) * 2.0;

    this.ball.kick(shotDir.normalize(), speed, lift, spinY);

    commentaryEngine.triggerEvent(
      'shot_taken',
      { player: from.data.shortName },
      6
    );
    gamepadController.vibrate(120, 0.4, 0.5);

    if (isHome) {
      this.stats.homeShots++;
      this.stats.homeShotsOnTarget++;
    } else {
      this.stats.awayShots++;
      this.stats.awayShotsOnTarget++;
    }
  }

  public executeTackle(tackler: PlayerModel, isSlide: boolean) {
    tackler.triggerAction(isSlide ? 'tackle' : 'kick');
    soundEngine.playTackle();
    gamepadController.vibrate(80, 0.3, 0.3);

    const ballDist = tackler.group.position.distanceTo(this.ball.position);
    if (ballDist < (isSlide ? 2.4 : 1.5)) {
      // Dispossess current owner
      this.allPlayers.forEach((p) => (p.hasBall = false));

      // Poke ball away
      const pokeDir = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
      this.ball.kick(pokeDir, 8, 1);

      commentaryEngine.triggerEvent(
        'tackle',
        { tackler: tackler.data.shortName },
        4
      );

      if (tackler.teamSide === 'home') this.stats.homeTackles++;
      else this.stats.awayTackles++;
    }
  }

  private handleGoal(event: GoalEvent) {
    this.phase = 'celebration';
    this.celebrationTimer = 0;

    const isHomeScored = event.team === 'home';
    if (isHomeScored) this.homeScore++;
    else this.awayScore++;

    soundEngine.playGoalRoar();
    gamepadController.vibrate(600, 0.9, 1.0);

    // Find scorer
    const scorer = this.ball.lastTouchedBy
      ? this.allPlayers.find((p) => p.data.id === this.ball.lastTouchedBy?.playerId)
      : isHomeScored ? this.homePlayers[9] : this.awayPlayers[9];

    const goalEvent: MatchGoalEvent = {
      minute: Math.min(90, Math.floor(this.matchTimeSeconds)),
      player: scorer?.data || this.homeTeam.players[9],
      team: event.team,
    };
    this.recentGoalEvent = goalEvent;
    this.goalEvents.push(goalEvent);

    commentaryEngine.triggerEvent(
      'goal',
      {
        player: goalEvent.player.shortName,
        team: isHomeScored ? this.homeTeam.name : this.awayTeam.name,
        homeScore: this.homeScore,
        awayScore: this.awayScore,
      },
      10
    );

    // Scorer celebrates
    if (scorer) {
      scorer.triggerAction('celebrate');
    }
  }

  private handleOutOfBounds(side: 'touchline' | 'goalline_home' | 'goalline_away' | null) {
    soundEngine.playWhistle(false);

    if (side === 'touchline') {
      // Reset throw in at touchline
      const z = Math.sign(this.ball.position.z) * 33;
      this.ball.reset(this.ball.position.x, z);
    } else if (side === 'goalline_home') {
      // Goal kick for home team
      this.ball.reset(-48, 0);
    } else {
      // Goal kick for away team
      this.ball.reset(48, 0);
    }
  }

  private updateCamera(dt: number) {
    const ballPos = this.ball.position;

    // Smooth TV Broadcast Camera
    if (this.cameraPreset === 'tv_broadcast') {
      // Target tracks ball with slight look-ahead in direction of play
      const targetLookX = ballPos.x + this.ball.velocity.x * 0.15;
      const targetLookZ = ballPos.z * 0.6;
      this.cameraTarget.lerp(new THREE.Vector3(targetLookX, 1.2, targetLookZ), dt * 4.5);

      // Camera position: Elevated sideline looking diagonally across pitch
      // Dynamically zoom in when ball is in the attacking box
      const isAttackingZone = Math.abs(ballPos.x) > 30;
      const camY = isAttackingZone ? 18 : 24;
      const camZ = isAttackingZone ? 28 : 36;
      const targetCamPos = new THREE.Vector3(ballPos.x * 0.65, camY, camZ);

      this.camera.position.lerp(targetCamPos, dt * 3.5);
      this.camera.lookAt(this.cameraTarget);
    } else if (this.cameraPreset === 'end_to_end') {
      // End to End (behind home goal looking down pitch)
      const targetCam = new THREE.Vector3(ballPos.x - 22, 14, ballPos.z * 0.4);
      this.camera.position.lerp(targetCam, dt * 4.0);
      this.camera.lookAt(ballPos.x + 8, 1.5, ballPos.z);
    } else if (this.cameraPreset === 'action_cam') {
      // Tight follow active player
      if (this.userPlayer) {
        const pPos = this.userPlayer.group.position;
        const targetCam = new THREE.Vector3(pPos.x - 10, 7.5, pPos.z + 8);
        this.camera.position.lerp(targetCam, dt * 5.0);
        this.camera.lookAt(pPos.x + 4, 1.2, pPos.z);
      }
    }
  }

  public isHomeInPossession(): boolean {
    return this.homePlayers.some((p) => p.hasBall) || this.ball.lastTouchedBy?.team === 'home';
  }
}
