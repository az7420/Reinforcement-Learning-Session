/**
 * GoalObject.jsx  (v3 — Cyberpunk Nexus Crystal)
 * Cyan + magenta dual-spinning gem with neon star halo.
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function GoalObject({ goalPos, gridSize }) {
  const outerRef  = useRef();
  const innerRef  = useRef();
  const ring1Ref  = useRef();
  const ring2Ref  = useRef();
  const lightRef  = useRef();
  const timeRef   = useRef(0);
  const offset    = (gridSize - 1) / 2;

  const wx = goalPos.x - offset;
  const wz = goalPos.z - offset;

  useFrame((_, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;

    if (outerRef.current) {
      outerRef.current.rotation.y += delta * 0.9;
      outerRef.current.rotation.x  = Math.sin(t * 0.55) * 0.22;
      outerRef.current.position.y  = 0.65 + Math.sin(t * 1.8) * 0.1;
    }

    if (innerRef.current) {
      innerRef.current.rotation.y -= delta * 1.5;  // counter-spin
      innerRef.current.rotation.z  = Math.cos(t * 0.8) * 0.18;
      innerRef.current.position.y  = 0.65 + Math.sin(t * 1.8) * 0.1;
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.8;
      ring1Ref.current.material.opacity = 0.65 + Math.sin(t * 3) * 0.25;
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 0.55;
      ring2Ref.current.material.opacity = 0.45 + Math.sin(t * 2.2 + 1) * 0.2;
    }

    if (lightRef.current) {
      lightRef.current.intensity = 1.8 + Math.sin(t * 3) * 0.8;
    }
  });

  return (
    <group position={[wx, 0, wz]}>

      {/* Cyan point light */}
      <pointLight ref={lightRef} color="#00f5d4" intensity={2.2} distance={5} decay={2} />

      {/* Magenta secondary light */}
      <pointLight position={[0.2, 0.3, 0.2]} color="#f72585" intensity={0.8} distance={3} decay={2} />

      {/* Outer octahedron — electric cyan */}
      <mesh ref={outerRef} position={[0, 0.65, 0]} castShadow>
        <octahedronGeometry args={[0.26, 0]} />
        <meshStandardMaterial
          color="#001a14"
          emissive="#00f5d4"
          emissiveIntensity={2.2}
          roughness={0.0}
          metalness={0.7}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Inner gem — hot magenta */}
      <mesh ref={innerRef} position={[0, 0.65, 0]}>
        <octahedronGeometry args={[0.14, 0]} />
        <meshStandardMaterial
          color="#1a0010"
          emissive="#f72585"
          emissiveIntensity={3.5}
          roughness={0}
          metalness={0.6}
        />
      </mesh>

      {/* Cyan hexagonal star ring */}
      <mesh ref={ring1Ref} position={[0, 0.26, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.38, 6]} />
        <meshStandardMaterial color="#00f5d4" emissive="#00f5d4" emissiveIntensity={2.5}
          transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>

      {/* Magenta outer ring */}
      <mesh ref={ring2Ref} position={[0, 0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.38, 0.52, 6]} />
        <meshStandardMaterial color="#f72585" emissive="#f72585" emissiveIntensity={1.8}
          transparent opacity={0.45} side={THREE.DoubleSide} />
      </mesh>

      {/* Large glow halo disc */}
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.62, 32]} />
        <meshStandardMaterial color="#00f5d4" emissive="#00f5d4" emissiveIntensity={0.7}
          transparent opacity={0.18} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Gold crown star */}
      <mesh position={[0, 0.98, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.06, 0.14, 6]} />
        <meshStandardMaterial color="#ffbe0b" emissive="#ffbe0b" emissiveIntensity={3.5} />
      </mesh>
    </group>
  );
}
