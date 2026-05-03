/**
 * Grid.jsx
 * Renders the full NxN grid of Tile components.
 * Also renders a subtle ground plane below the tiles.
 */

import React, { useMemo } from 'react';
import Tile from './Tile';

export default function Grid({ grid, gridSize, goalPos }) {
  const offset = (gridSize - 1) / 2;

  return (
    <group>
      {/* Ground plane */}
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.05, 0]}
      >
        <planeGeometry args={[gridSize + 2, gridSize + 2]} />
        <meshStandardMaterial
          color="#0a0f1a"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Grid border glow */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.04, 0]}
      >
        <planeGeometry args={[gridSize + 1.2, gridSize + 1.2]} />
        <meshStandardMaterial
          color="#4361ee"
          emissive="#4361ee"
          emissiveIntensity={0.08}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* All tiles */}
      {grid.map(tile => (
        <Tile
          key={tile.key}
          tile={tile}
          isGoal={tile.x === goalPos.x && tile.z === goalPos.z}
          isStart={tile.x === 0 && tile.z === 0}
          gridSize={gridSize}
        />
      ))}
    </group>
  );
}
