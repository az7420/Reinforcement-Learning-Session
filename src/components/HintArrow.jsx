/**
 * HintArrow.jsx  (v2 — warp-aware BFS)
 * Renders a floating 3D arrow above the player pointing toward the next
 * BFS-optimal step, including warp teleportation in pathfinding.
 * 
 * On levels where no path is reachable even via warps, renders nothing
 * (the HUD hint button will show a fallback toast instead).
 *
 * RULES OF HOOKS: useFrame is always called unconditionally — the early
 * return only happens AFTER all hook calls.
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * Warp-aware + ice-aware BFS from playerPos to goalPos.
 * • Skips trap tiles.
 * • When stepping onto a warp tile, also enqueues the warp destination.
 * • When stepping onto an ice tile, also enqueues the extra-slide cell
 *   (same direction, one more step) if it's in-bounds and not a trap.
 * Returns { dx, dz } of the first step to take, or null if unreachable.
 */
function bfsNextStep(grid, playerPos, goalPos, gridSize, warpPairs = {}) {
  const key  = (x, z) => `${x},${z}`;
  const tileAt = (x, z) => grid.find(t => t.x === x && t.z === z);

  const visited = new Set([key(playerPos.x, playerPos.z)]);
  // Each queue entry stores the position AND the direction that produced it
  const queue = [{ x: playerPos.x, z: playerPos.z, first: null, dx: 0, dz: 0 }];

  while (queue.length) {
    const { x, z, first, dx: cDx, dz: cDz } = queue.shift();

    if (x === goalPos.x && z === goalPos.z) return first;

    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    for (const [dx, dz] of dirs) {
      const nx = x + dx, nz = z + dz;
      if (nx < 0 || nx >= gridSize || nz < 0 || nz >= gridSize) continue;
      const k = key(nx, nz);
      if (visited.has(k)) continue;

      const tile = tileAt(nx, nz);
      if (tile?.type === 'trap') continue;
      visited.add(k);

      const nextFirst = first ?? { dx, dz };

      // ── Ice: also enqueue the slide destination ──────────────────────────
      if (tile?.type === 'ice') {
        const sx = nx + dx, sz = nz + dz;  // one extra step same direction
        if (sx >= 0 && sx < gridSize && sz >= 0 && sz < gridSize) {
          const sk = key(sx, sz);
          const slideTile = tileAt(sx, sz);
          if (!visited.has(sk) && slideTile?.type !== 'trap') {
            visited.add(sk);
            queue.push({ x: sx, z: sz, first: nextFirst, dx, dz });
          }
        }
      }

      // ── Warp: also enqueue the teleport destination ──────────────────────
      if (tile?.type === 'warp') {
        const dest = warpPairs[k];
        if (dest) {
          const dk = key(dest.x, dest.z);
          if (!visited.has(dk)) {
            visited.add(dk);
            queue.push({ x: dest.x, z: dest.z, first: nextFirst, dx, dz });
          }
        }
      }

      queue.push({ x: nx, z: nz, first: nextFirst, dx, dz });
    }
  }
  return null;
}

export default function HintArrow({ grid, playerPos, goalPos, gridSize, warpPairs }) {
  const groupRef = useRef();

  // Compute BEFORE hooks (but hook calls come BEFORE early return)
  const step   = bfsNextStep(grid, playerPos, goalPos, gridSize, warpPairs);
  const offset = (gridSize - 1) / 2;

  // ── useFrame MUST be called unconditionally ────────────────────────────
  useFrame(({ clock }) => {
    if (groupRef.current && step) {
      groupRef.current.position.y = 0.9 + Math.sin(clock.elapsedTime * 3.5) * 0.1;
      groupRef.current.rotation.y += 0.012; // slow spin
    }
  });

  // Safe early return AFTER all hooks
  if (!step) return null;

  const wx = playerPos.x - offset;
  const wz = playerPos.z - offset;

  // Rotation angle: point along (dx, dz) direction
  const angle = Math.atan2(step.dx, step.dz);

  return (
    <group ref={groupRef} position={[wx, 0.9, wz]} rotation={[0, angle, 0]}>
      {/* Glow halo */}
      <mesh position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.35, 32]} />
        <meshStandardMaterial
          color="#facc15" emissive="#facc15"
          emissiveIntensity={1.2} transparent opacity={0.35}
          depthWrite={false}
        />
      </mesh>

      {/* Shaft */}
      <mesh position={[0, 0, 0.06]}>
        <cylinderGeometry args={[0.045, 0.045, 0.38, 10]} />
        <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={2.2} />
      </mesh>

      {/* Arrowhead cone */}
      <mesh position={[0, 0, 0.31]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.12, 0.26, 10]} />
        <meshStandardMaterial color="#fde68a" emissive="#fde68a" emissiveIntensity={2.8} />
      </mesh>
    </group>
  );
}
