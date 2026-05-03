/**
 * PathTrail.jsx  (v3 — Light Mode)
 * Rainbow breadcrumb trail — raised to float above candy gem tiles.
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';

export default function PathTrail({ path, gridSize }) {
  const offset = (gridSize - 1) / 2;
  const trail  = useMemo(() => path.slice(0, -1), [path]);

  const colors = useMemo(() => {
    return trail.map((_, i) => {
      const hue = (i / Math.max(trail.length - 1, 1)) * 300; // cyan → magenta
      const c = new THREE.Color();
      c.setHSL(hue / 360, 1.0, 0.65);   // bright neon for dark background
      return `#${c.getHexString()}`;
    });
  }, [trail]);

  if (trail.length === 0) return null;

  return (
    <group>
      {trail.map((step, i) => {
        const t       = i / Math.max(trail.length - 1, 1);
        const opacity = 0.28 + t * 0.55;
        const scale   = 0.055 + t * 0.065;
        return (
          <mesh
            key={i}
            position={[step.x - offset, 0.26, step.z - offset]}
          >
            <sphereGeometry args={[scale, 10, 10]} />
            <meshStandardMaterial
              color={colors[i] || '#818cf8'}
              emissive={colors[i] || '#818cf8'}
              emissiveIntensity={1.5}
              transparent
              opacity={opacity}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}
