// Triumph League - 3D Stadium & Pitch Builder
import * as THREE from 'three';
import { MatchWeather } from '../types';

export class StadiumBuilder {
  private scene: THREE.Scene;
  private ledCanvas!: HTMLCanvasElement;
  private ledCtx!: CanvasRenderingContext2D;
  private ledTexture!: THREE.CanvasTexture;
  private ledOffset = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public buildStadium(weather: MatchWeather = 'night_floodlit'): {
    update: (dt: number) => void;
    floodlights: THREE.Light[];
  } {
    this.buildPitch();
    this.buildFieldMarkings();
    this.buildGoals();
    this.buildCornerFlags();
    this.buildAdvertisingBoards();
    this.buildGrandstands();
    const floodlights = this.setupLighting(weather);

    return {
      update: (dt: number) => {
        this.updateLEDs(dt);
      },
      floodlights,
    };
  }

  private buildPitch() {
    // High-resolution patterned mown grass canvas
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // 12 alternating vertical stripes
    const stripes = 14;
    const stripeWidth = canvas.width / stripes;
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#2d7a36' : '#276b2f';
      ctx.fillRect(i * stripeWidth, 0, stripeWidth, canvas.height);
    }

    // Subtle grass blade noise
    for (let i = 0; i < 20000; i++) {
      const rx = Math.random() * canvas.width;
      const ry = Math.random() * canvas.height;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)';
      ctx.fillRect(rx, ry, 2, 3);
    }

    const pitchTex = new THREE.CanvasTexture(canvas);
    pitchTex.wrapS = THREE.RepeatWrapping;
    pitchTex.wrapT = THREE.RepeatWrapping;
    pitchTex.repeat.set(1, 1);

    const pitchGeo = new THREE.PlaneGeometry(105, 68);
    const pitchMat = new THREE.MeshStandardMaterial({
      map: pitchTex,
      roughness: 0.85,
      metalness: 0.05,
    });

    const pitch = new THREE.Mesh(pitchGeo, pitchMat);
    pitch.rotation.x = -Math.PI / 2;
    pitch.receiveShadow = true;
    this.scene.add(pitch);

    // Surrounding runoff grass apron
    const apronGeo = new THREE.PlaneGeometry(125, 88);
    const apronMat = new THREE.MeshStandardMaterial({
      color: '#1e5225',
      roughness: 0.9,
    });
    const apron = new THREE.Mesh(apronGeo, apronMat);
    apron.rotation.x = -Math.PI / 2;
    apron.position.y = -0.01;
    apron.receiveShadow = true;
    this.scene.add(apron);
  }

  private buildFieldMarkings() {
    // Field markings canvas overlaid above grass
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1360; // 105:68 aspect ratio
    const ctx = canvas.getContext('2d')!;

    // Transparent canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'miter';

    const borderMargin = 20;
    const w = canvas.width - borderMargin * 2;
    const h = canvas.height - borderMargin * 2;

    // Outer boundary line
    ctx.strokeRect(borderMargin, borderMargin, w, h);

    // Halfway line
    const midX = canvas.width / 2;
    ctx.beginPath();
    ctx.moveTo(midX, borderMargin);
    ctx.lineTo(midX, canvas.height - borderMargin);
    ctx.stroke();

    // Center circle (radius 9.15m -> ~178px)
    const midY = canvas.height / 2;
    const centerRadius = (9.15 / 105) * w;
    ctx.beginPath();
    ctx.arc(midX, midY, centerRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Center spot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(midX, midY, 8, 0, Math.PI * 2);
    ctx.fill();

    // Penalty Boxes (16.5m depth, 40.3m width)
    const boxDepth = (16.5 / 105) * w;
    const boxWidth = (40.3 / 68) * h;
    const boxTopY = midY - boxWidth / 2;

    // Left Penalty Box (Home side)
    ctx.strokeRect(borderMargin, boxTopY, boxDepth, boxWidth);

    // Right Penalty Box (Away side)
    ctx.strokeRect(canvas.width - borderMargin - boxDepth, boxTopY, boxDepth, boxWidth);

    // Goal Areas / 6-yard boxes (5.5m depth, 18.3m width)
    const sixDepth = (5.5 / 105) * w;
    const sixWidth = (18.3 / 68) * h;
    const sixTopY = midY - sixWidth / 2;

    ctx.strokeRect(borderMargin, sixTopY, sixDepth, sixWidth);
    ctx.strokeRect(canvas.width - borderMargin - sixDepth, sixTopY, sixDepth, sixWidth);

    // Penalty spots (11m from goal line)
    const penSpotDist = (11.0 / 105) * w;
    ctx.beginPath();
    ctx.arc(borderMargin + penSpotDist, midY, 6, 0, Math.PI * 2);
    ctx.arc(canvas.width - borderMargin - penSpotDist, midY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Penalty arcs (9.15m from spot, outside box)
    ctx.beginPath();
    ctx.arc(borderMargin + penSpotDist, midY, centerRadius, -0.9, 0.9);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(canvas.width - borderMargin - penSpotDist, midY, centerRadius, Math.PI - 0.9, Math.PI + 0.9);
    ctx.stroke();

    // Corner Arcs (1m radius)
    const cornerR = (1.5 / 105) * w;
    ctx.beginPath();
    ctx.arc(borderMargin, borderMargin, cornerR, 0, Math.PI / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(borderMargin, canvas.height - borderMargin, cornerR, -Math.PI / 2, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(canvas.width - borderMargin, borderMargin, cornerR, Math.PI / 2, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(canvas.width - borderMargin, canvas.height - borderMargin, cornerR, Math.PI, Math.PI * 1.5);
    ctx.stroke();

    const markTex = new THREE.CanvasTexture(canvas);
    const markGeo = new THREE.PlaneGeometry(105, 68);
    const markMat = new THREE.MeshBasicMaterial({
      map: markTex,
      transparent: true,
      depthWrite: false,
    });

    const linesMesh = new THREE.Mesh(markGeo, markMat);
    linesMesh.rotation.x = -Math.PI / 2;
    linesMesh.position.y = 0.01;
    this.scene.add(linesMesh);
  }

  private buildGoals() {
    const postMat = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      roughness: 0.2,
      metalness: 0.1,
    });

    const netCanvas = document.createElement('canvas');
    netCanvas.width = 64;
    netCanvas.height = 64;
    const nCtx = netCanvas.getContext('2d')!;
    nCtx.strokeStyle = 'rgba(240, 240, 245, 0.65)';
    nCtx.lineWidth = 1.5;
    for (let i = 0; i <= 64; i += 8) {
      nCtx.beginPath();
      nCtx.moveTo(i, 0);
      nCtx.lineTo(i, 64);
      nCtx.stroke();
      nCtx.beginPath();
      nCtx.moveTo(0, i);
      nCtx.lineTo(64, i);
      nCtx.stroke();
    }
    const netTex = new THREE.CanvasTexture(netCanvas);
    netTex.wrapS = THREE.RepeatWrapping;
    netTex.wrapT = THREE.RepeatWrapping;
    netTex.repeat.set(8, 4);

    const netMat = new THREE.MeshBasicMaterial({
      map: netTex,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const createGoal = (x: number, isHomeSide: boolean) => {
      const goalGroup = new THREE.Group();
      const goalWidth = 7.32;
      const goalHeight = 2.44;
      const goalDepth = 2.0;
      const postRadius = 0.07;

      // Left post
      const postGeo = new THREE.CylinderGeometry(postRadius, postRadius, goalHeight, 16);
      const leftPost = new THREE.Mesh(postGeo, postMat);
      leftPost.position.set(0, goalHeight / 2, -goalWidth / 2);
      leftPost.castShadow = true;
      goalGroup.add(leftPost);

      // Right post
      const rightPost = new THREE.Mesh(postGeo, postMat);
      rightPost.position.set(0, goalHeight / 2, goalWidth / 2);
      rightPost.castShadow = true;
      goalGroup.add(rightPost);

      // Crossbar
      const barGeo = new THREE.CylinderGeometry(postRadius, postRadius, goalWidth, 16);
      const crossbar = new THREE.Mesh(barGeo, postMat);
      crossbar.rotation.x = Math.PI / 2;
      crossbar.position.set(0, goalHeight, 0);
      crossbar.castShadow = true;
      goalGroup.add(crossbar);

      // Back frame stanchions
      const rearPostOffset = isHomeSide ? -goalDepth : goalDepth;
      const rearLeft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, goalHeight, 8),
        postMat
      );
      rearLeft.position.set(rearPostOffset, goalHeight / 2, -goalWidth / 2);
      goalGroup.add(rearLeft);

      const rearRight = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, goalHeight, 8),
        postMat
      );
      rearRight.position.set(rearPostOffset, goalHeight / 2, goalWidth / 2);
      goalGroup.add(rearRight);

      // Net back panel
      const backNetGeo = new THREE.PlaneGeometry(goalWidth, goalHeight);
      const backNet = new THREE.Mesh(backNetGeo, netMat);
      backNet.position.set(rearPostOffset, goalHeight / 2, 0);
      backNet.rotation.y = Math.PI / 2;
      goalGroup.add(backNet);

      // Net top panel
      const topNetGeo = new THREE.PlaneGeometry(goalDepth, goalWidth);
      const topNet = new THREE.Mesh(topNetGeo, netMat);
      topNet.rotation.x = -Math.PI / 2;
      topNet.rotation.z = Math.PI / 2;
      topNet.position.set(rearPostOffset / 2, goalHeight, 0);
      goalGroup.add(topNet);

      // Net sides
      const sideNetGeo = new THREE.PlaneGeometry(goalDepth, goalHeight);
      const leftSideNet = new THREE.Mesh(sideNetGeo, netMat);
      leftSideNet.position.set(rearPostOffset / 2, goalHeight / 2, -goalWidth / 2);
      goalGroup.add(leftSideNet);

      const rightSideNet = new THREE.Mesh(sideNetGeo, netMat);
      rightSideNet.position.set(rearPostOffset / 2, goalHeight / 2, goalWidth / 2);
      goalGroup.add(rightSideNet);

      goalGroup.position.set(x, 0, 0);
      this.scene.add(goalGroup);
    };

    createGoal(-52.5, true);  // Home Goal
    createGoal(52.5, false);  // Away Goal
  }

  private buildCornerFlags() {
    const flagPoleMat = new THREE.MeshStandardMaterial({ color: '#facc15', roughness: 0.3 });
    const flagClothMat = new THREE.MeshStandardMaterial({
      color: '#e11d48',
      side: THREE.DoubleSide,
      roughness: 0.5,
    });

    const corners = [
      [-52.5, -34],
      [-52.5, 34],
      [52.5, -34],
      [52.5, 34],
    ];

    corners.forEach(([x, z]) => {
      const poleGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.5, 8);
      const pole = new THREE.Mesh(poleGeo, flagPoleMat);
      pole.position.set(x, 0.75, z);
      this.scene.add(pole);

      const clothGeo = new THREE.BufferGeometry();
      const vertices = new Float32Array([
        0, 1.5, 0,
        0, 1.15, 0,
        0.35, 1.32, 0,
      ]);
      clothGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      const cloth = new THREE.Mesh(clothGeo, flagClothMat);
      cloth.position.set(x, 0, z);
      this.scene.add(cloth);
    });
  }

  private buildAdvertisingBoards() {
    // Dynamic animated LED perimeter display
    this.ledCanvas = document.createElement('canvas');
    this.ledCanvas.width = 1024;
    this.ledCanvas.height = 128;
    this.ledCtx = this.ledCanvas.getContext('2d')!;

    this.ledTexture = new THREE.CanvasTexture(this.ledCanvas);
    this.ledTexture.wrapS = THREE.RepeatWrapping;
    this.ledTexture.wrapT = THREE.RepeatWrapping;

    const adMat = new THREE.MeshBasicMaterial({ map: this.ledTexture });

    // Long Sideline Boards (Z = +36 and Z = -36)
    const longBoardGeo = new THREE.PlaneGeometry(108, 1.1);
    const boardSouth = new THREE.Mesh(longBoardGeo, adMat);
    boardSouth.position.set(0, 0.55, 36);
    boardSouth.rotation.y = Math.PI;
    this.scene.add(boardSouth);

    const boardNorth = new THREE.Mesh(longBoardGeo, adMat);
    boardNorth.position.set(0, 0.55, -36);
    this.scene.add(boardNorth);

    // Goal Endline Boards (X = -56 and X = +56)
    const endBoardGeo = new THREE.PlaneGeometry(74, 1.1);
    const boardWest = new THREE.Mesh(endBoardGeo, adMat);
    boardWest.position.set(-56, 0.55, 0);
    boardWest.rotation.y = Math.PI / 2;
    this.scene.add(boardWest);

    const boardEast = new THREE.Mesh(endBoardGeo, adMat);
    boardEast.position.set(56, 0.55, 0);
    boardEast.rotation.y = -Math.PI / 2;
    this.scene.add(boardEast);
  }

  private updateLEDs(dt: number) {
    this.ledOffset += dt * 70;
    if (this.ledOffset > 1024) this.ledOffset = 0;

    const ctx = this.ledCtx;
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, 1024, 128);

    // Neon animated borders
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, 1024, 128);

    // Scrolling Triumph League branding text
    ctx.font = 'bold 44px "Chakra Petch", sans-serif';
    ctx.fillStyle = '#ffffff';

    const textSponsors = [
      '★ TRIUMPH LEAGUE 2026',
      'HYPERKICK PRO III',
      'APEX NUTRITION',
      'VANGUARD ENERGY',
      '★ TRIUMPH LEAGUE CHAMPIONSHIP',
      'TITAN SPORTSWEAR',
    ];

    let xPos = -this.ledOffset;
    while (xPos < 1024) {
      for (const text of textSponsors) {
        ctx.fillStyle = text.includes('★') ? '#00f2fe' : '#f59e0b';
        ctx.fillText(text, xPos, 80);
        xPos += ctx.measureText(text).width + 90;
      }
    }

    this.ledTexture.needsUpdate = true;
  }

  private buildGrandstands() {
    // 4 Grandstands with tiered spectator stands & modern roof canopies
    const standMat = new THREE.MeshStandardMaterial({
      color: '#131b26',
      roughness: 0.8,
      metalness: 0.2,
    });

    const roofMat = new THREE.MeshStandardMaterial({
      color: '#0f172a',
      roughness: 0.4,
      metalness: 0.6,
      side: THREE.DoubleSide,
    });

    const seatColors = ['#1e3a8a', '#b91c1c', '#047857', '#d97706'];

    // Sideline stands (North & South)
    const createSidelineStand = (zPos: number, isNorth: boolean) => {
      const standGroup = new THREE.Group();

      // 4 tiered tiers
      for (let tier = 0; tier < 4; tier++) {
        const tierDepth = 5;
        const tierHeight = 3.5;
        const tierGeo = new THREE.BoxGeometry(116, tierHeight, tierDepth);
        const tierMesh = new THREE.Mesh(tierGeo, standMat);
        const y = (tier + 1) * tierHeight * 0.5;
        const z = isNorth ? -40 - tier * tierDepth : 40 + tier * tierDepth;
        tierMesh.position.set(0, y, z);
        standGroup.add(tierMesh);

        // Crowd rows (instanced color blocks)
        const rowGeo = new THREE.BoxGeometry(114, 0.6, 1.2);
        const crowdMat = new THREE.MeshStandardMaterial({
          color: seatColors[tier % seatColors.length],
          roughness: 0.9,
        });
        const crowdRow = new THREE.Mesh(rowGeo, crowdMat);
        crowdRow.position.set(0, y + tierHeight * 0.5 + 0.3, z);
        standGroup.add(crowdRow);
      }

      // Roof canopy
      const roofGeo = new THREE.PlaneGeometry(124, 28);
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.rotation.x = isNorth ? Math.PI / 12 : -Math.PI / 12;
      roof.position.set(0, 18, isNorth ? -45 : 45);
      standGroup.add(roof);

      this.scene.add(standGroup);
    };

    createSidelineStand(-36, true);
    createSidelineStand(36, false);

    // Goal end stands (East & West)
    const createEndStand = (xPos: number, isWest: boolean) => {
      const standGroup = new THREE.Group();
      for (let tier = 0; tier < 4; tier++) {
        const tierDepth = 5;
        const tierHeight = 3.5;
        const tierGeo = new THREE.BoxGeometry(tierDepth, tierHeight, 78);
        const tierMesh = new THREE.Mesh(tierGeo, standMat);
        const y = (tier + 1) * tierHeight * 0.5;
        const x = isWest ? -60 - tier * tierDepth : 60 + tier * tierDepth;
        tierMesh.position.set(x, y, 0);
        standGroup.add(tierMesh);
      }
      this.scene.add(standGroup);
    };

    createEndStand(-56, true);
    createEndStand(56, false);
  }

  private setupLighting(weather: MatchWeather): THREE.Light[] {
    const lights: THREE.Light[] = [];

    // Ambient light
    const ambientColor = weather === 'golden_sunset' ? 0xffeedd : weather === 'clear_day' ? 0xffffff : 0x223344;
    const ambientIntensity = weather === 'clear_day' ? 0.9 : weather === 'golden_sunset' ? 0.75 : 0.55;
    const ambient = new THREE.AmbientLight(ambientColor, ambientIntensity);
    this.scene.add(ambient);
    lights.push(ambient);

    // Directional Sun / Main Floodlight
    const dirColor = weather === 'golden_sunset' ? 0xffaa55 : 0xffffff;
    const dir = new THREE.DirectionalLight(dirColor, weather === 'clear_day' ? 1.4 : 0.9);
    dir.position.set(45, 60, 35);
    dir.castShadow = true;
    dir.shadow.mapSize.width = 2048;
    dir.shadow.mapSize.height = 2048;
    dir.shadow.camera.near = 10;
    dir.shadow.camera.far = 160;
    dir.shadow.camera.left = -60;
    dir.shadow.camera.right = 60;
    dir.shadow.camera.top = 40;
    dir.shadow.camera.bottom = -40;
    dir.shadow.bias = -0.0005;
    this.scene.add(dir);
    lights.push(dir);

    // 4 Stadium Floodlight Pylons for night matches
    const pylonCorners = [
      [-64, 42, -45],
      [-64, 42, 45],
      [64, 42, -45],
      [64, 42, 45],
    ];

    pylonCorners.forEach(([px, py, pz]) => {
      // Pylon steel truss tower
      const towerGeo = new THREE.CylinderGeometry(0.5, 1.2, py, 6);
      const towerMat = new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.8, roughness: 0.3 });
      const tower = new THREE.Mesh(towerGeo, towerMat);
      tower.position.set(px, py / 2, pz);
      this.scene.add(tower);

      // Floodlight Bank Head
      const headGeo = new THREE.BoxGeometry(6, 3, 2);
      const headMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.set(px, py, pz);
      this.scene.add(head);

      // Spot light pointing towards pitch center
      const spot = new THREE.SpotLight(0xf0fdf4, 1.2, 140, Math.PI / 4, 0.45);
      spot.position.set(px, py, pz);
      spot.target.position.set(0, 0, 0);
      this.scene.add(spot);
      this.scene.add(spot.target);
      lights.push(spot);
    });

    return lights;
  }
}
