/**
 * QHeatmap.jsx
 * Overlays simulated Q-value / value-function heat colours on tiles.
 * Uses BFS distance-to-goal as a proxy for V(s): close = high value (green),
 * far/trap = low value (red). Toggled with the 'Q' key or heatmap button.
 *
 * This is an educational approximation — real RL would use a trained table.
 */

import React, { useMemo } from 'react';

// BFS from goal; traps have infinite cost
function bfsDistance(grid, goalPos, gridSize) {
  const dist = {};
  const queue = [{ x: goalPos.x, z: goalPos.z, d: 0 }];
  const key = (x, z) => `${x},${z}`;
  dist[key(goalPos.x, goalPos.z)] = 0;

  while (queue.length) {
    const { x, z, d } = queue.shift();
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    for (const [dx, dz] of dirs) {
      const nx = x + dx, nz = z + dz;
      if (nx < 0 || nx >= gridSize || nz < 0 || nz >= gridSize) continue;
      const k = key(nx, nz);
      if (dist[k] !== undefined) continue;
      const tile = grid.find(t => t.x === nx && t.z === nz);
      if (!tile || tile.type === 'trap') {
        dist[k] = Infinity; // traps are dead ends
        continue;
      }
      dist[k] = d + 1;
      queue.push({ x: nx, z: nz, d: d + 1 });
    }
  }
  return dist;
}

function lerp3(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

function valueToColor(normValue) {
  // 0 = red (bad), 0.5 = yellow, 1 = green (great)
  const red    = [239, 68,  68];
  const yellow = [251, 191, 36];
  const green  = [52,  211, 153];
  if (normValue <= 0.5) {
    const t = normValue / 0.5;
    const [r,g,b] = lerp3(red, yellow, t);
    return `rgb(${r},${g},${b})`;
  } else {
    const t = (normValue - 0.5) / 0.5;
    const [r,g,b] = lerp3(yellow, green, t);
    return `rgb(${r},${g},${b})`;
  }
}

const TILE_SIZE   = 0.88;
const TILE_HEIGHT = 0.15;

export default function QHeatmap({ grid, goalPos, gridSize }) {
  const offset = (gridSize - 1) / 2;

  const { dist, maxDist } = useMemo(() => {
    const dist = bfsDistance(grid, goalPos, gridSize);
    let maxDist = 1;
    for (const v of Object.values(dist)) {
      if (v !== Infinity && v > maxDist) maxDist = v;
    }
    return { dist, maxDist };
  }, [grid, goalPos, gridSize]);

  return (
    <group>
      {grid.map(tile => {
        const k = `${tile.x},${tile.z}`;
        const d = dist[k];
        const norm = d === undefined || d === Infinity ? 0 : 1 - d / maxDist;
        const color = valueToColor(norm);
        const wx = tile.x - offset;
        const wz = tile.z - offset;
        const isGoal = tile.x === goalPos.x && tile.z === goalPos.z;

        return (
          <mesh
            key={k}
            position={[wx, TILE_HEIGHT + 0.006, wz]}
          >
            <boxGeometry args={[TILE_SIZE - 0.04, 0.006, TILE_SIZE - 0.04]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={isGoal ? 1.5 : 0.6}
              transparent
              opacity={isGoal ? 0.9 : 0.55}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}
