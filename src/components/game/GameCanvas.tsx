// Triumph League - 3D Game Canvas & WebGL Host
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FootballMatch } from '../../game/engine/FootballMatch';
import { TeamData, ControlState, GraphicsQuality, CameraPreset } from '../../game/types';
import { gamepadController } from '../../game/engine/GamepadController';

interface GameCanvasProps {
  homeTeam: TeamData;
  awayTeam: TeamData;
  controls: ControlState;
  graphicsQuality: GraphicsQuality;
  cameraPreset: CameraPreset;
  isPaused: boolean;
  onMatchUpdate: (match: FootballMatch) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  homeTeam,
  awayTeam,
  controls,
  graphicsQuality,
  cameraPreset,
  isPaused,
  onMatchUpdate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const matchRef = useRef<FootballMatch | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // 1. Three.js Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060911);
    scene.fog = new THREE.FogExp2(0x060911, 0.007);

    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(46, aspect, 0.5, 350);
    camera.position.set(0, 24, 38);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: graphicsQuality !== 'low',
      powerPreference: 'high-performance',
      stencil: false,
    });

    const dpr = graphicsQuality === 'ultra' ? Math.min(window.devicePixelRatio, 2) : 1;
    renderer.setPixelRatio(dpr);
    renderer.setSize(container.clientWidth, container.clientHeight);

    if (graphicsQuality !== 'low') {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type =
        graphicsQuality === 'ultra' ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
    } else {
      renderer.shadowMap.enabled = false;
    }

    container.appendChild(renderer.domElement);

    // 3. Instantiate Match
    const match = new FootballMatch(scene, camera, homeTeam, awayTeam);
    match.cameraPreset = cameraPreset;
    matchRef.current = match;

    // 4. Render & Simulation Loop
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const rawDt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      const dt = Math.min(rawDt, 0.08); // Clamp to prevent spiral of death

      if (!isPaused && matchRef.current) {
        const gpControls = gamepadController.poll(controls);
        matchRef.current.currentControlState = gpControls || controls;
        matchRef.current.update(dt);
        onMatchUpdate(matchRef.current);
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // 5. Responsive Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 6. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, [homeTeam, awayTeam, graphicsQuality]);

  // Sync camera preset & paused state
  useEffect(() => {
    if (matchRef.current) {
      matchRef.current.cameraPreset = cameraPreset;
    }
  }, [cameraPreset]);

  return <div ref={containerRef} className="w-full h-full relative overflow-hidden" />;
};
