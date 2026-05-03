/**
 * Tile.jsx  (v5 — Cyberpunk Neon Gems)
 * Dark slab base with vivid neon emissive glows.
 * RoundedBox shape, wider gaps, per-tile drop-glow disc.
 * Matching the electric cyan / hot magenta / violet palette.
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

const TILE_SIZE   = 0.80;
const TILE_HEIGHT = 0.18;
const CORNER_R    = 0.05;

// Dark base colors — identity comes from neon emissive
const PALETTE = {
  safe:    '#0d0f1e',
  visited: '#0a1628',
  trap:    '#1a0008',
  coin:    '#1a1000',
  ice:     '#001520',
  warp:    '#100020',
  boost:   '#1a0800',
  goal:    '#001a14',
};

// Vivid neon emissive colors
const EMISSIVE = {
  safe:    '#1e3a5f',
  visited: '#4488ff',
  trap:    '#f72585',
  coin:    '#ffbe0b',
  ice:     '#00f5d4',
  warp:    '#bf5fff',
  boost:   '#ff6b00',
  goal:    '#00f5d4',
};

// Glow disc color (drop-shadow equivalent)
const GLOW_COLOR = {
  safe:    '#1e3a5f',
  visited: '#4488ff',
  trap:    '#f72585',
  coin:    '#ffbe0b',
  ice:     '#00f5d4',
  warp:    '#bf5fff',
  boost:   '#ff6b00',
  goal:    '#06d6a0',
};

export default function Tile({ tile, isGoal, gridSize }) {
  const slabRef  = useRef();
  const glowRef  = useRef();
  const spinRef  = useRef();
  const timeRef  = useRef(Math.random() * Math.PI * 2);

  const offset = (gridSize - 1) / 2;
  const wx = tile.x - offset;
  const wz = tile.z - offset;

  const tileType    = isGoal ? 'goal' : tile.type;
  const isSpecial   = ['trap','coin','ice','warp','boost','goal'].includes(tileType);
  const isCollected = tile.collected && tileType === 'coin';

  const baseColor  = useMemo(() => {
    if (isCollected) return PALETTE.safe;
    return PALETTE[tileType] ?? PALETTE.safe;
  }, [tileType, isCollected]);

  const emissiveCol = useMemo(() => {
    if (isCollected) return '#000';
    if (tile.visited && !isSpecial) return EMISSIVE.visited;
    return EMISSIVE[tileType] ?? EMISSIVE.safe;
  }, [tileType, tile.visited, isSpecial, isCollected]);

  const glowCol = useMemo(() => {
    if (tile.visited && !isSpecial) return GLOW_COLOR.visited;
    return GLOW_COLOR[tileType] ?? GLOW_COLOR.safe;
  }, [tileType, tile.visited, isSpecial]);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;

    // Emissive pulse
    if (slabRef.current && (isSpecial || tile.visited) && !isCollected) {
      slabRef.current.material.emissiveIntensity =
        isSpecial ? 0.35 + Math.sin(t * 2.5) * 0.22 : 0.18 + Math.sin(t * 1.8) * 0.1;
    }

    // Glow disc breathe
    if (glowRef.current) {
      const sc = 1 + Math.sin(t * 1.8 + tile.x) * 0.1;
      glowRef.current.scale.set(sc, 1, sc);
      glowRef.current.material.opacity = 0.45 + Math.sin(t * 2.2) * 0.2;
    }

    // Coin spin
    if (spinRef.current && tileType === 'coin' && !isCollected) {
      spinRef.current.rotation.y += delta * 2.8;
      spinRef.current.position.y = TILE_HEIGHT + 0.14 + Math.sin(t * 3.5) * 0.04;
    }

    // Warp spin
    if (spinRef.current && tileType === 'warp') {
      spinRef.current.rotation.y += delta * 2.0;
    }
  });

  return (
    <group position={[wx, 0, wz]}>

      {/* Neon glow disc — drop shadow / aura */}
      <mesh
        ref={glowRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.06, 0]}
      >
        <circleGeometry args={[TILE_SIZE * 0.6, 32]} />
        <meshStandardMaterial
          color={glowCol}
          emissive={glowCol}
          emissiveIntensity={1.2}
          transparent
          opacity={0.45}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Main tile slab ─────────────────────────────────────────── */}
      <RoundedBox
        ref={slabRef}
        args={[TILE_SIZE, TILE_HEIGHT, TILE_SIZE]}
        radius={CORNER_R}
        smoothness={4}
        position={[0, TILE_HEIGHT / 2, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={baseColor}
          emissive={emissiveCol}
          emissiveIntensity={isSpecial && !isCollected ? 0.35 : tile.visited ? 0.18 : 0.04}
          roughness={tileType === 'ice' ? 0.06 : 0.55}
          metalness={tileType === 'ice' ? 0.7  : 0.25}
        />
      </RoundedBox>

      {/* ── Decorations ─────────────────────────────────────────────── */}

      {/* TRAP — neon × cross */}
      {tileType === 'trap' && (
        <group position={[0, TILE_HEIGHT + 0.06, 0]}>
          <mesh rotation={[-Math.PI / 2, Math.PI / 4, 0]}>
            <planeGeometry args={[0.44, 0.09]} />
            <meshStandardMaterial color="#f72585" emissive="#f72585" emissiveIntensity={2.5}
              transparent opacity={0.92} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, -Math.PI / 4, 0]}>
            <planeGeometry args={[0.44, 0.09]} />
            <meshStandardMaterial color="#f72585" emissive="#f72585" emissiveIntensity={2.5}
              transparent opacity={0.92} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      {/* COIN — golden spinning disc */}
      {tileType === 'coin' && !isCollected && (
        <mesh ref={spinRef} position={[0, TILE_HEIGHT + 0.14, 0]} castShadow>
          <cylinderGeometry args={[0.17, 0.17, 0.07, 24]} />
          <meshStandardMaterial color="#ffbe0b" emissive="#ffbe0b" emissiveIntensity={2.5}
            roughness={0.05} metalness={1} />
        </mesh>
      )}

      {tileType === 'coin' && isCollected && (
        <mesh position={[0, TILE_HEIGHT + 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.14, 0.22, 24]} />
          <meshStandardMaterial color="#ffbe0b" transparent opacity={0.2} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* ICE — cyan snowflake */}
      {tileType === 'ice' && (
        <group position={[0, TILE_HEIGHT + 0.006, 0]}>
          {[0, Math.PI / 2, Math.PI / 4, -Math.PI / 4].map((angle, i) => (
            <mesh key={i} rotation={[-Math.PI / 2, angle, 0]}>
              <planeGeometry args={[i < 2 ? 0.48 : 0.34, i < 2 ? 0.07 : 0.05]} />
              <meshStandardMaterial color="#00f5d4" emissive="#00f5d4"
                emissiveIntensity={i < 2 ? 2.2 : 1.5}
                transparent opacity={i < 2 ? 0.85 : 0.6} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      )}

      {/* WARP — double spinning torus */}
      {tileType === 'warp' && (
        <group ref={spinRef} position={[0, TILE_HEIGHT + 0.07, 0]}>
          <mesh rotation={[Math.PI / 2.4, 0, 0]}>
            <torusGeometry args={[0.22, 0.05, 8, 28]} />
            <meshStandardMaterial color="#bf5fff" emissive="#bf5fff" emissiveIntensity={3}
              transparent opacity={0.9} />
          </mesh>
          <mesh rotation={[Math.PI / 2.4, 0, Math.PI / 3]}>
            <torusGeometry args={[0.13, 0.03, 6, 20]} />
            <meshStandardMaterial color="#00f5d4" emissive="#00f5d4" emissiveIntensity={2.5}
              transparent opacity={0.75} />
          </mesh>
        </group>
      )}

      {/* BOOST — orange chevron */}
      {tileType === 'boost' && (
        <mesh position={[0, TILE_HEIGHT + 0.007, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.34, 0.34]} />
          <meshStandardMaterial color="#ff6b00" emissive="#ff6b00" emissiveIntensity={2}
            transparent opacity={0.82} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* GOAL — cyan star + outer ring */}
      {isGoal && (
        <>
          <mesh position={[0, TILE_HEIGHT + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.24, 0.38, 6]} />
            <meshStandardMaterial color="#00f5d4" emissive="#00f5d4" emissiveIntensity={2.8}
              transparent opacity={0.9} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, TILE_HEIGHT + 0.006, 0]} rotation={[-Math.PI / 2, Math.PI / 6, 0]}>
            <ringGeometry args={[0.12, 0.2, 6]} />
            <meshStandardMaterial color="#f72585" emissive="#f72585" emissiveIntensity={2.5}
              transparent opacity={0.7} side={THREE.DoubleSide} />
          </mesh>
        </>
      )}

    </group>
  );
}
