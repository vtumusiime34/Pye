// Triumph League - Intelligent 11v11 Autonomous Football AI
import * as THREE from 'three';
import { PlayerModel } from './PlayerModel';
import { BallPhysics } from './BallPhysics';
import { TeamFormation } from '../types';

export class FootballAI {
  public static getFormationCoordinates(
    position: string,
    formation: TeamFormation,
    isHomeTeam: boolean
  ): { x: number; z: number } {
    // Pitch coordinates:
    // Home team attacks towards +X (+52.5) and defends -X (-52.5)
    // Away team attacks towards -X (-52.5) and defends +X (+52.5)
    const sign = isHomeTeam ? 1 : -1;

    // Formation anchors normalized to half-pitch (0 to 50 in X, -30 to +30 in Z)
    const map: Record<string, { x: number; z: number }> = {
      // Goalkeeper
      GK: { x: -48 * sign, z: 0 },

      // Backline
      CB: { x: -36 * sign, z: -7 },
      CB2: { x: -36 * sign, z: 7 },
      LB: { x: -33 * sign, z: 24 * sign },
      RB: { x: -33 * sign, z: -24 * sign },

      // Midfielders
      CDM: { x: -22 * sign, z: 0 },
      CM: { x: -12 * sign, z: -14 },
      CM2: { x: -12 * sign, z: 14 },
      CAM: { x: 5 * sign, z: 0 },

      // Attackers
      LW: { x: 22 * sign, z: 22 * sign },
      RW: { x: 22 * sign, z: -22 * sign },
      ST: { x: 28 * sign, z: 0 },
    };

    return map[position] || { x: -10 * sign, z: 0 };
  }

  public static updatePlayerAI(
    player: PlayerModel,
    ball: BallPhysics,
    allPlayers: PlayerModel[],
    teammates: PlayerModel[],
    opponents: PlayerModel[],
    dt: number,
    onPass: (from: PlayerModel, to: PlayerModel, isThrough: boolean) => void,
    onShoot: (from: PlayerModel, power: number) => void,
    onTackle: (from: PlayerModel) => void
  ) {
    const isHome = player.teamSide === 'home';
    const targetGoalX = isHome ? 52.5 : -52.5;
    const ownGoalX = isHome ? -52.5 : 52.5;

    const playerPos = player.group.position;
    const ballPos = ball.position;
    const distToBall = playerPos.distanceTo(ballPos);

    // --- GOALKEEPER AI ---
    if (player.isGoalkeeper) {
      this.updateGoalkeeperAI(player, ball, ownGoalX, dt);
      return;
    }

    // --- OUTFIELD PLAYERS AI ---

    // 1. If this player has the ball: Attacking Decision Making
    if (player.hasBall) {
      this.handleBallCarrierDecisions(player, ball, targetGoalX, teammates, opponents, dt, onPass, onShoot);
      return;
    }

    // 2. Off-ball Positioning
    const teamHasBall = teammates.some((t) => t.hasBall);

    // Compute tactical anchor based on ball position (team shifts together)
    const baseAnchor = this.getFormationCoordinates(player.data.position, '4-3-3', isHome);
    const targetPos = new THREE.Vector3(baseAnchor.x, 0, baseAnchor.z);

    // Dynamic shift: team moves forward when attacking, drops back when defending
    const ballXShift = ballPos.x * 0.35;
    targetPos.x += ballXShift;

    // Constrain within pitch
    targetPos.x = THREE.MathUtils.clamp(targetPos.x, -50, 50);
    targetPos.z = THREE.MathUtils.clamp(targetPos.z, -32, 32);

    // If opponent has ball and player is nearest defender -> Press ball carrier!
    const isNearestToBall = distToBall < 14 && !teamHasBall;

    if (isNearestToBall) {
      // Press directly towards ball
      const pressDir = new THREE.Vector3().subVectors(ballPos, playerPos).setY(0).normalize();
      const pressSpeed = player.data.attributes.pace * 0.085;

      playerPos.addScaledVector(pressDir, pressSpeed * dt);
      player.group.rotation.y = Math.atan2(pressDir.x, pressDir.z);
      player.updateAnimation(dt, true, pressSpeed);

      // Attempt standing tackle if close
      if (distToBall < 1.35) {
        onTackle(player);
      }
    } else {
      // Return / track to tactical anchor
      const toAnchor = new THREE.Vector3().subVectors(targetPos, playerPos).setY(0);
      const distToAnchor = toAnchor.length();

      if (distToAnchor > 2.0) {
        const moveDir = toAnchor.normalize();
        const jogSpeed = 4.2;
        playerPos.addScaledVector(moveDir, jogSpeed * dt);
        player.group.rotation.y = Math.atan2(moveDir.x, moveDir.z);
        player.updateAnimation(dt, true, jogSpeed);
      } else {
        // Face the ball while in position
        const faceBallDir = new THREE.Vector3().subVectors(ballPos, playerPos).setY(0).normalize();
        player.group.rotation.y = Math.atan2(faceBallDir.x, faceBallDir.z);
        player.updateAnimation(dt, false, 0);
      }
    }
  }

  private static handleBallCarrierDecisions(
    player: PlayerModel,
    ball: BallPhysics,
    targetGoalX: number,
    teammates: PlayerModel[],
    opponents: PlayerModel[],
    dt: number,
    onPass: (from: PlayerModel, to: PlayerModel, isThrough: boolean) => void,
    onShoot: (from: PlayerModel, power: number) => void
  ) {
    const playerPos = player.group.position;
    const distToGoal = Math.abs(targetGoalX - playerPos.x);

    // Decision A: Shoot if in attacking range and angle is open
    if (distToGoal < 24 && Math.abs(playerPos.z) < 18) {
      // Shoot with probability or after looking up
      if (Math.random() < 0.035) {
        const power = 0.7 + Math.random() * 0.3;
        onShoot(player, power);
        return;
      }
    }

    // Decision B: Check for forward passing options
    const forwardTeammates = teammates.filter((t) => {
      if (t.data.id === player.data.id) return false;
      const tDistToGoal = Math.abs(targetGoalX - t.group.position.x);
      return tDistToGoal < distToGoal - 2; // In front
    });

    if (forwardTeammates.length > 0 && Math.random() < 0.025) {
      const bestTarget = forwardTeammates[Math.floor(Math.random() * forwardTeammates.length)];
      const isThrough = Math.random() > 0.45;
      onPass(player, bestTarget, isThrough);
      return;
    }

    // Decision C: Dribble forward towards goal
    const goalDir = new THREE.Vector3(targetGoalX - playerPos.x, 0, -playerPos.z * 0.3).normalize();
    const dribbleSpeed = player.data.attributes.pace * 0.075;

    playerPos.addScaledVector(goalDir, dribbleSpeed * dt);
    player.group.rotation.y = Math.atan2(goalDir.x, goalDir.z);
    player.updateAnimation(dt, true, dribbleSpeed);

    // Clamp ball to feet while dribbling
    ball.position.copy(playerPos).add(goalDir.clone().multiplyScalar(0.75));
    ball.position.y = ball.radius;
  }

  private static updateGoalkeeperAI(
    gk: PlayerModel,
    ball: BallPhysics,
    ownGoalX: number,
    dt: number
  ) {
    const gkPos = gk.group.position;
    const ballPos = ball.position;

    // Track ball laterally along goal line
    const targetZ = THREE.MathUtils.clamp(ballPos.z * 0.45, -3.2, 3.2);

    // If ball is close inside box, rush out to smother
    const distToGoal = Math.abs(ballPos.x - ownGoalX);
    let targetX = ownGoalX + (ownGoalX < 0 ? 1.5 : -1.5);

    if (distToGoal < 14 && Math.abs(ballPos.z) < 12) {
      // Rush out
      targetX = ownGoalX + (ownGoalX < 0 ? 4.5 : -4.5);
    }

    const moveVector = new THREE.Vector3(targetX - gkPos.x, 0, targetZ - gkPos.z);
    if (moveVector.length() > 0.1) {
      const speed = 4.5;
      const dir = moveVector.normalize();
      gkPos.addScaledVector(dir, speed * dt);
      gk.group.rotation.y = ownGoalX < 0 ? Math.PI / 2 : -Math.PI / 2;
      gk.updateAnimation(dt, true, speed);
    } else {
      gk.group.rotation.y = ownGoalX < 0 ? Math.PI / 2 : -Math.PI / 2;
      gk.updateAnimation(dt, false, 0);
    }
  }
}
