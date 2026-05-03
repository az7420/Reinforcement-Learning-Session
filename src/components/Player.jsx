/**
 * Player.jsx
 * The agent cube with smooth lerped movement and a floating glow ring.
 * Uses useFrame for per-frame position interpolation (smooth slide).
 */

import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const LERP_SPEED  = 8;   // higher = snappier movement
const CUBE_SIZE   = 0.45;
const FLOAT_SPEED = 1.5;
const FLOAT_AMP   = 0.06;

export default function Player({ playerPos, gridSize, gameStatus }) {
  const groupRef  = useRef();
  const cubeRef   = useRef();
  const glowRef   = useRef();
  const timeRef   = useRef(0);

  const offset = (gridSize - 1) / 2;

  // Target world position — raised to clear elevated terrain tiles
  const target = useMemo(() => new THREE.Vector3(
    playerPos.x - offset,
    0.42 + CUBE_SIZE / 2,
    playerPos.z - offset,
  ), [playerPos.x, playerPos.z, offset]);

  // Current interpolated position (starts at target)
  const current = useRef(target.clone());

  // Reset position when player teleports (restart)
  useEffect(() => {
    current.current.copy(target);
    if (groupRef.current) groupRef.current.position.copy(target);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridSize]); // only on grid size change (restart)

  useFrame((_, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;

    // Smooth lerp toward target
    current.current.lerp(target, 1 - Math.exp(-LERP_SPEED * delta));

    if (groupRef.current) {
      groupRef.current.position.copy(current.current);
      // Add floating bob offset
      groupRef.current.position.y += Math.sin(t * FLOAT_SPEED) * FLOAT_AMP;
    }

    // Slow rotation
    if (cubeRef.current) {
      cubeRef.current.rotation.y += delta * 0.8;
    }

    // Pulse glow ring
    if (glowRef.current) {
      const pulse = 0.7 + Math.sin(t * 3) * 0.3;
      glowRef.current.material.opacity = pulse * 0.6;
      const scale = 1 + Math.sin(t * 2) * 0.1;
      glowRef.current.scale.set(scale, scale, scale);
    }
  });

  // Cyberpunk palette — vivid neon against dark scene
  const cubeColor     = gameStatus === 'won'  ? '#06d6a0'
                      : gameStatus === 'lost' ? '#f72585'
                      : '#00f5d4';
  const emissiveColor = gameStatus === 'won'  ? '#06d6a0'
                      : gameStatus === 'lost' ? '#f72585'
                      : '#00f5d4';

  return (
    <group ref={groupRef} position={[0 - offset, 0.42 + CUBE_SIZE / 2, 0 - offset]}>

      {/* Shadow catcher disc below player */}
      <mesh position={[0, -(CUBE_SIZE / 2 + 0.01), 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.32, 32]} />
        <meshStandardMaterial
          color="#000"
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>

      {/* Glow ring on tile surface */}
      <mesh
        ref={glowRef}
        position={[0, -(CUBE_SIZE / 2), 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.28, 0.42, 32]} />
        <meshStandardMaterial
          color={cubeColor}
          emissive={cubeColor}
          emissiveIntensity={2}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Agent body — rounded cube via boxGeometry */}
      <mesh ref={cubeRef} castShadow>
        <boxGeometry args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]} />
        <meshStandardMaterial
          color={cubeColor}
          emissive={emissiveColor}
          emissiveIntensity={0.4}
          roughness={0.2}
          metalness={0.7}
        />
      </mesh>

      {/* Eye indicators (two small spheres on front face) */}
      {[-0.1, 0.1].map((ex, i) => (
        <mesh key={i} position={[ex, 0.06, CUBE_SIZE / 2 - 0.02]} castShadow>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={1}
          />
        </mesh>
      ))}

      {/* Antenna */}
      <mesh position={[0, CUBE_SIZE / 2 + 0.07, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.14, 8]} />
        <meshStandardMaterial color={cubeColor} emissive={emissiveColor} emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, CUBE_SIZE / 2 + 0.14, 0]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial
          color="#f0abfc"
          emissive="#f0abfc"
          emissiveIntensity={2}
        />
      </mesh>
    </group>
  );
}
