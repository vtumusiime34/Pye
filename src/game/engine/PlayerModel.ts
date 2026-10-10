// Triumph League - 3D Humanoid Footballer Model & Procedural Skeletal Animation
import * as THREE from 'three';
import { PlayerData, TeamKit } from '../types';

export type PlayerAnimState =
  | 'idle'
  | 'run'
  | 'sprint'
  | 'kick'
  | 'shoot'
  | 'tackle'
  | 'header'
  | 'gk_dive'
  | 'celebrate';

export class PlayerModel {
  public group: THREE.Group;
  public data: PlayerData;
  public kit: TeamKit;
  public isGoalkeeper: boolean;
  public teamSide: 'home' | 'away';

  // State
  public animState: PlayerAnimState = 'idle';
  private animTimer = 0;
  private actionTimer = 0;
  private actionDuration = 0.35;
  public stamina: number = 100;
  public speed: number = 0;
  public hasBall: boolean = false;
  public isControlled: boolean = false;

  // Skeletal Pivots
  private bodyRoot!: THREE.Group;
  private torso!: THREE.Mesh;
  private head!: THREE.Group;
  private leftArmPivot!: THREE.Group;
  private rightArmPivot!: THREE.Group;
  private leftLegPivot!: THREE.Group;
  private rightLegPivot!: THREE.Group;
  private leftLowerLegPivot!: THREE.Group;
  private rightLowerLegPivot!: THREE.Group;
  private selectRing!: THREE.Mesh;
  private shadowMesh!: THREE.Mesh;

  constructor(
    data: PlayerData,
    kit: TeamKit,
    teamSide: 'home' | 'away',
    scene: THREE.Scene
  ) {
    this.data = data;
    this.kit = kit;
    this.teamSide = teamSide;
    this.isGoalkeeper = data.position === 'GK';
    this.group = new THREE.Group();

    this.buildRig();
    scene.add(this.group);
  }

  private buildRig() {
    // Skin Tone Map
    const skinColors = {
      fair: '#f8d9c2',
      tan: '#d49b6a',
      dark: '#8d5524',
      deep: '#4b2c15',
    };
    const skinColor = skinColors[this.data.skinTone] || '#d49b6a';
    const skinMat = new THREE.MeshStandardMaterial({
      color: skinColor,
      roughness: 0.7,
      metalness: 0.05,
    });

    // Procedural Jersey Texture with Squad Number
    const jerseyCanvas = document.createElement('canvas');
    jerseyCanvas.width = 128;
    jerseyCanvas.height = 128;
    const jCtx = jerseyCanvas.getContext('2d')!;

    jCtx.fillStyle = this.kit.primaryColor;
    jCtx.fillRect(0, 0, 128, 128);

    if (this.kit.pattern === 'stripes') {
      jCtx.fillStyle = this.kit.secondaryColor;
      for (let x = 0; x < 128; x += 32) {
        jCtx.fillRect(x, 0, 16, 128);
      }
    } else if (this.kit.pattern === 'sash') {
      jCtx.fillStyle = this.kit.secondaryColor;
      jCtx.beginPath();
      jCtx.moveTo(0, 0);
      jCtx.lineTo(35, 0);
      jCtx.lineTo(128, 128);
      jCtx.lineTo(93, 128);
      jCtx.fill();
    } else if (this.kit.pattern === 'halves') {
      jCtx.fillStyle = this.kit.secondaryColor;
      jCtx.fillRect(64, 0, 64, 128);
    }

    // Squad Number on back
    jCtx.font = 'bold 48px "Chakra Petch", sans-serif';
    jCtx.fillStyle = this.kit.numberColor;
    jCtx.textAlign = 'center';
    jCtx.textBaseline = 'middle';
    jCtx.fillText(String(this.data.number), 64, 64);

    const jerseyTex = new THREE.CanvasTexture(jerseyCanvas);
    const jerseyMat = new THREE.MeshStandardMaterial({
      map: jerseyTex,
      roughness: 0.6,
      metalness: 0.1,
    });

    const shortsMat = new THREE.MeshStandardMaterial({
      color: this.kit.shortsColor,
      roughness: 0.65,
    });

    const socksMat = new THREE.MeshStandardMaterial({
      color: this.kit.socksColor,
      roughness: 0.6,
    });

    const bootMat = new THREE.MeshStandardMaterial({
      color: '#111827',
      roughness: 0.3,
      metalness: 0.4,
    });

    // Body Root (hip level at y = 0.95m)
    this.bodyRoot = new THREE.Group();
    this.bodyRoot.position.y = 0.95;
    this.group.add(this.bodyRoot);

    // Torso (jersey)
    const torsoGeo = new THREE.BoxGeometry(0.44, 0.52, 0.26);
    this.torso = new THREE.Mesh(torsoGeo, jerseyMat);
    this.torso.position.y = 0.26;
    this.torso.castShadow = true;
    this.bodyRoot.add(this.torso);

    // Shorts
    const shortsGeo = new THREE.BoxGeometry(0.42, 0.24, 0.28);
    const shortsMesh = new THREE.Mesh(shortsGeo, shortsMat);
    shortsMesh.position.y = -0.05;
    shortsMesh.castShadow = true;
    this.bodyRoot.add(shortsMesh);

    // Head & Hair
    this.head = new THREE.Group();
    this.head.position.y = 0.62;

    const headGeo = new THREE.SphereGeometry(0.14, 16, 16);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.castShadow = true;
    this.head.add(headMesh);

    // Hair
    const hairMat = new THREE.MeshStandardMaterial({
      color: this.data.hairColor,
      roughness: 0.85,
    });
    const hairGeo = new THREE.SphereGeometry(0.145, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const hairMesh = new THREE.Mesh(hairGeo, hairMat);
    hairMesh.position.y = 0.02;
    this.head.add(hairMesh);

    this.bodyRoot.add(this.head);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.11, 0.52, 0.11);

    // Left Arm
    this.leftArmPivot = new THREE.Group();
    this.leftArmPivot.position.set(-0.28, 0.45, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, skinMat);
    leftArmMesh.position.y = -0.24;
    leftArmMesh.castShadow = true;
    this.leftArmPivot.add(leftArmMesh);
    this.bodyRoot.add(this.leftArmPivot);

    // Right Arm
    this.rightArmPivot = new THREE.Group();
    this.rightArmPivot.position.set(0.28, 0.45, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, skinMat);
    rightArmMesh.position.y = -0.24;
    rightArmMesh.castShadow = true;
    this.rightArmPivot.add(rightArmMesh);
    this.bodyRoot.add(this.rightArmPivot);

    // Legs
    const upperLegGeo = new THREE.BoxGeometry(0.14, 0.45, 0.15);
    const lowerLegGeo = new THREE.BoxGeometry(0.12, 0.46, 0.13);
    const bootGeo = new THREE.BoxGeometry(0.13, 0.08, 0.24);

    // Left Leg
    this.leftLegPivot = new THREE.Group();
    this.leftLegPivot.position.set(-0.14, -0.12, 0);

    const leftUpperLeg = new THREE.Mesh(upperLegGeo, skinMat);
    leftUpperLeg.position.y = -0.2;
    leftUpperLeg.castShadow = true;
    this.leftLegPivot.add(leftUpperLeg);

    this.leftLowerLegPivot = new THREE.Group();
    this.leftLowerLegPivot.position.y = -0.42;

    const leftSocks = new THREE.Mesh(lowerLegGeo, socksMat);
    leftSocks.position.y = -0.2;
    leftSocks.castShadow = true;
    this.leftLowerLegPivot.add(leftSocks);

    const leftBoot = new THREE.Mesh(bootGeo, bootMat);
    leftBoot.position.set(0, -0.42, 0.04);
    leftBoot.castShadow = true;
    this.leftLowerLegPivot.add(leftBoot);

    this.leftLegPivot.add(this.leftLowerLegPivot);
    this.bodyRoot.add(this.leftLegPivot);

    // Right Leg
    this.rightLegPivot = new THREE.Group();
    this.rightLegPivot.position.set(0.14, -0.12, 0);

    const rightUpperLeg = new THREE.Mesh(upperLegGeo, skinMat);
    rightUpperLeg.position.y = -0.2;
    rightUpperLeg.castShadow = true;
    this.rightLegPivot.add(rightUpperLeg);

    this.rightLowerLegPivot = new THREE.Group();
    this.rightLowerLegPivot.position.y = -0.42;

    const rightSocks = new THREE.Mesh(lowerLegGeo, socksMat);
    rightSocks.position.y = -0.2;
    rightSocks.castShadow = true;
    this.rightLowerLegPivot.add(rightSocks);

    const rightBoot = new THREE.Mesh(bootGeo, bootMat);
    rightBoot.position.set(0, -0.42, 0.04);
    rightBoot.castShadow = true;
    this.rightLowerLegPivot.add(rightBoot);

    this.rightLegPivot.add(this.rightLowerLegPivot);
    this.bodyRoot.add(this.rightLegPivot);

    // Selection Ring (Glows when active player)
    const ringGeo = new THREE.RingGeometry(0.48, 0.58, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    this.selectRing = new THREE.Mesh(ringGeo, ringMat);
    this.selectRing.rotation.x = -Math.PI / 2;
    this.selectRing.position.y = 0.03;
    this.selectRing.visible = false;
    this.group.add(this.selectRing);

    // Soft blob shadow under feet
    const shadowGeo = new THREE.PlaneGeometry(0.9, 0.9);
    const sCanvas = document.createElement('canvas');
    sCanvas.width = 64;
    sCanvas.height = 64;
    const sCtx = sCanvas.getContext('2d')!;
    const grad = sCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
    grad.addColorStop(0.6, 'rgba(0, 0, 0, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 64, 64);

    const shadowTex = new THREE.CanvasTexture(sCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.y = 0.02;
    this.group.add(this.shadowMesh);
  }

  public setControlled(isControlled: boolean) {
    this.isControlled = isControlled;
    this.selectRing.visible = isControlled;
  }

  public triggerAction(anim: 'kick' | 'shoot' | 'tackle' | 'header' | 'gk_dive' | 'celebrate') {
    this.animState = anim;
    this.actionTimer = 0;
    this.actionDuration = anim === 'tackle' ? 0.65 : anim === 'header' ? 0.5 : anim === 'celebrate' ? 2.0 : 0.35;
  }

  public updateAnimation(dt: number, isMoving: boolean, moveSpeed: number) {
    this.animTimer += dt * (moveSpeed > 7.5 ? 14 : 9);
    this.speed = moveSpeed;

    // Pulse selection indicator
    if (this.isControlled) {
      const pulse = 1.0 + Math.sin(Date.now() * 0.008) * 0.08;
      this.selectRing.scale.set(pulse, pulse, pulse);
    }

    // Handle momentary actions (kick, tackle, etc.)
    if (
      this.animState === 'kick' ||
      this.animState === 'shoot' ||
      this.animState === 'tackle' ||
      this.animState === 'header' ||
      this.animState === 'gk_dive'
    ) {
      this.actionTimer += dt;
      const progress = Math.min(1.0, this.actionTimer / this.actionDuration);

      if (this.animState === 'kick' || this.animState === 'shoot') {
        const kickAngle = Math.sin(progress * Math.PI) * (this.animState === 'shoot' ? -1.3 : -0.9);
        this.rightLegPivot.rotation.x = kickAngle;
        this.leftArmPivot.rotation.x = -kickAngle * 0.6;
        this.rightArmPivot.rotation.x = kickAngle * 0.6;
      } else if (this.animState === 'tackle') {
        // Slide on ground
        this.bodyRoot.position.y = 0.35 + Math.sin(progress * Math.PI) * -0.2;
        this.bodyRoot.rotation.x = 0.55;
        this.rightLegPivot.rotation.x = -1.2;
        this.leftLegPivot.rotation.x = 0.3;
      } else if (this.animState === 'header') {
        // Vertical header jump
        this.bodyRoot.position.y = 0.95 + Math.sin(progress * Math.PI) * 0.8;
        this.head.rotation.x = -Math.sin(progress * Math.PI) * 0.5;
      }

      if (progress >= 1.0) {
        this.animState = isMoving ? (moveSpeed > 7.5 ? 'sprint' : 'run') : 'idle';
        this.bodyRoot.position.y = 0.95;
        this.bodyRoot.rotation.x = 0;
        this.head.rotation.x = 0;
      }
      return;
    }

    // Regular locomotion cycles
    if (isMoving) {
      const isSprinting = moveSpeed > 7.5;
      this.animState = isSprinting ? 'sprint' : 'run';

      const strideAmp = isSprinting ? 0.95 : 0.65;
      const armAmp = isSprinting ? 0.85 : 0.55;
      const leanAngle = isSprinting ? 0.28 : 0.12;

      // Forward lean during run
      this.bodyRoot.rotation.x = leanAngle;
      this.bodyRoot.position.y = 0.95 + Math.sin(this.animTimer * 2) * 0.04;

      // Leg stride oscillation
      const legCycle = Math.sin(this.animTimer);
      this.leftLegPivot.rotation.x = legCycle * strideAmp;
      this.rightLegPivot.rotation.x = -legCycle * strideAmp;

      // Knee bending
      this.leftLowerLegPivot.rotation.x = Math.max(0, -legCycle * 0.8);
      this.rightLowerLegPivot.rotation.x = Math.max(0, legCycle * 0.8);

      // Arm swing (opposite to legs)
      this.leftArmPivot.rotation.x = -legCycle * armAmp;
      this.rightArmPivot.rotation.x = legCycle * armAmp;
      this.leftArmPivot.rotation.z = -0.15;
      this.rightArmPivot.rotation.z = 0.15;
    } else {
      this.animState = 'idle';

      // Subtle breathing idle
      this.bodyRoot.rotation.x = 0;
      this.bodyRoot.position.y = 0.95 + Math.sin(Date.now() * 0.003) * 0.015;

      this.leftLegPivot.rotation.set(0, 0, -0.05);
      this.rightLegPivot.rotation.set(0, 0, 0.05);
      this.leftLowerLegPivot.rotation.set(0, 0, 0);
      this.rightLowerLegPivot.rotation.set(0, 0, 0);

      this.leftArmPivot.rotation.set(Math.sin(Date.now() * 0.002) * 0.05, 0, -0.08);
      this.rightArmPivot.rotation.set(-Math.sin(Date.now() * 0.002) * 0.05, 0, 0.08);
    }
  }
}
