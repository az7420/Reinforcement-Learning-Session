/**
 * GameScene.jsx  (v5 — Cyberpunk Nebula)
 * Dark deep-space scene with:
 *  • Cyan + Magenta dual-nebula lighting (no more plain indigo)
 *  • Dark reflective ground with cyan tint
 *  • Cyan-tinted star field
 *  • Rotating cyan grid aura ring
 *  • Cyan + magenta + violet ambient orbs
 *  • warpPairs passed to HintArrow (level 8 fix)
 */

import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Preload, MeshReflectorMaterial } from '@react-three/drei';
import Grid from './Grid';
import Player from './Player';
import GoalObject from './GoalObject';
import PathTrail from './PathTrail';
import QHeatmap from './QHeatmap';
import HintArrow from './HintArrow';
import * as THREE from 'three';

// ── Cyberpunk Nebula lighting ─────────────────────────────────────────────
function Lights() {
  return (
    <>
      {/* Dark ambient — keeps it moody */}
      <ambientLight intensity={0.2} color="#0d0b2a" />

      {/* Main key — cool white */}
      <directionalLight
        castShadow
        position={[6, 12, 6]}
        intensity={1.5}
        color="#e0f0ff"
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
        shadow-camera-left={-13}
        shadow-camera-right={13}
        shadow-camera-top={13}
        shadow-camera-bottom={-13}
        shadow-bias={-0.001}
      />

      {/* Electric cyan fill — left side */}
      <directionalLight position={[-5, 4, -3]} intensity={0.9} color="#00f5d4" />

      {/* Hot magenta fill — right-below */}
      <directionalLight position={[5, -2, 6]} intensity={0.6} color="#f72585" />

      {/* Violet under-rim */}
      <directionalLight position={[0, -4, -5]} intensity={0.4} color="#7209b7" />

      {/* Hemisphere — space to void */}
      <hemisphereLight skyColor="#0d0b2a" groundColor="#000000" intensity={0.5} />

      {/* Cyan goal point light */}
      <pointLight position={[0, 0.8, 0]} intensity={1.2} color="#00f5d4" distance={7} decay={2} />
    </>
  );
}

// ── Reflective dark floor with cyan tint ──────────────────────────────────
function GroundPlane({ gridSize }) {
  const size = gridSize * 1.9;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.52, 0]} receiveShadow>
      <planeGeometry args={[size, size]} />
      <MeshReflectorMaterial
        blur={[400, 80]}
        resolution={512}
        mixBlur={0.85}
        mixStrength={50}
        roughness={1}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#04020e"
        metalness={0.6}
        mirror={0.7}
      />
    </mesh>
  );
}

// ── Rotating cyan aura ring ───────────────────────────────────────────────
function GridAura({ gridSize }) {
  const ringRef = useRef();
  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.004;
      ringRef.current.material.opacity = 0.22 + Math.sin(clock.elapsedTime * 0.9) * 0.08;
    }
  });
  const s = gridSize * 0.5 + 0.3;
  return (
    <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.50, 0]}>
      <ringGeometry args={[s * 1.25, s * 1.58, 64]} />
      <meshBasicMaterial
        color="#00f5d4"
        transparent
        opacity={0.22}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ── Second magenta ring (counter-rotates) ────────────────────────────────
function GridAura2({ gridSize }) {
  const ringRef = useRef();
  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.z -= 0.003;
      ringRef.current.material.opacity = 0.12 + Math.sin(clock.elapsedTime * 1.2) * 0.06;
    }
  });
  const s = gridSize * 0.5 + 0.3;
  return (
    <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.51, 0]}>
      <ringGeometry args={[s * 1.45, s * 1.65, 64]} />
      <meshBasicMaterial
        color="#f72585"
        transparent
        opacity={0.12}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ── Ambient orbs (cyan + magenta + violet) ────────────────────────────────
function AmbientOrbs({ gridSize }) {
  const count  = 22;
  const orbRef = useRef();
  const data   = useRef(
    Array.from({ length: count }, (_, i) => ({
      x: (Math.random() - 0.5) * gridSize * 1.1,
      y: 0.3 + Math.random() * 2.8,
      z: (Math.random() - 0.5) * gridSize * 1.1,
      speed: 0.28 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      color: ['#00f5d4','#f72585','#7209b7','#4cc9f0','#ffbe0b'][i % 5],
    }))
  );

  useFrame(({ clock }) => {
    if (!orbRef.current) return;
    const t = clock.elapsedTime;
    orbRef.current.children.forEach((mesh, i) => {
      const d = data.current[i];
      mesh.position.y = d.y + Math.sin(t * d.speed + d.phase) * 0.2;
      mesh.position.x = d.x + Math.cos(t * d.speed * 0.4 + d.phase) * 0.14;
    });
  });

  return (
    <group ref={orbRef}>
      {data.current.map((d, i) => (
        <mesh key={i} position={[d.x, d.y, d.z]}>
          <sphereGeometry args={[0.032, 8, 8]} />
          <meshStandardMaterial
            color={d.color}
            emissive={d.color}
            emissiveIntensity={4}
            transparent
            opacity={0.75}
          />
        </mesh>
      ))}
    </group>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function GameScene({ gameState }) {
  const {
    grid, gridSize, goalPos,
    playerPos, gameStatus,
    path, isReplaying,
    showHeatmap, showHint,
    warpPairs,
  } = gameState;

  return (
    <Canvas
      shadows
      camera={{ position: [0, 10, 11], fov: 44, near: 0.1, far: 120 }}
      gl={{
        antialias: true,
        alpha: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      style={{ background: 'transparent' }}
    >
      {/* Deep space background */}
      <color attach="background" args={['#04020e']} />

      {/* Nebula fog — dark purple */}
      <fog attach="fog" args={['#0d0b2a', 15, 30]} />

      {/* Cyan-tinted star field */}
      <Stars
        radius={50}
        depth={25}
        count={5000}
        factor={3}
        saturation={0.8}
        fade
        speed={0.25}
      />

      <Suspense fallback={null}>
        <Lights />

        {/* Reflective dark floor */}
        <GroundPlane gridSize={gridSize} />

        {/* Dual counter-rotating aura rings */}
        <GridAura  gridSize={gridSize} />
        <GridAura2 gridSize={gridSize} />

        {/* Floating neon orbs */}
        <AmbientOrbs gridSize={gridSize} />

        {/* Grid tiles */}
        <Grid grid={grid} gridSize={gridSize} goalPos={goalPos} />

        {/* Q-Value heatmap */}
        {showHeatmap && (
          <QHeatmap grid={grid} goalPos={goalPos} gridSize={gridSize} />
        )}

        {/* Goal crystal */}
        <GoalObject goalPos={goalPos} gridSize={gridSize} />

        {/* Path trail */}
        <PathTrail path={path} gridSize={gridSize} />

        {/* Hint arrow — warp-aware */}
        {showHint && gameStatus === 'playing' && (
          <HintArrow
            grid={grid}
            playerPos={playerPos}
            goalPos={goalPos}
            gridSize={gridSize}
            warpPairs={warpPairs}
          />
        )}

        {/* Player */}
        <Player playerPos={playerPos} gridSize={gridSize} gameStatus={gameStatus} />

        <Preload all />
      </Suspense>

      <OrbitControls
        enablePan={false}
        minPolarAngle={0.15}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={5}
        maxDistance={22}
        dampingFactor={0.07}
        enableDamping
      />
    </Canvas>
  );
}
