/**
 * LEVELS.js — Curriculum Edition
 * exactly 5 levels: 3 Hard, 2 Extreme.
 */

export const LEVELS = [
  // ── Level 1 — Frozen Gold (Hard 1) ──────────────────────────────────────
  {
    id: 1,
    name: 'Frozen Gold',
    par: 11,
    timeLimit: 38,
    description: 'HARD: Ice and coins everywhere. One wrong slide = disaster!',
    map: [
      'P . . . T .',
      'T T . T . .',
      '. . I . . .',
      '. T . . T .',
      'T . C I . .',
      '. T . . . G',
    ],
  },
  // ── Level 2 — Warp Maze (Hard 2) ────────────────────────────────────────
  {
    id: 2,
    name: 'Warp Maze',
    par: 12,
    timeLimit: 38,
    description: 'HARD: 3 warp pairs! Find the right portal to survive.',
    map: [
      'P . W . T . .',
      '. T . T . . W',
      'T . . . . . .',
      'W . T . . T .',
      '. . . . W . .',
      '. . W . . . .',
      'T . . T . W G',
    ],
  },
  // ── Level 3 — Boost Storm (Hard 3) ──────────────────────────────────────
  {
    id: 3,
    name: 'Boost Storm',
    par: 13,
    timeLimit: 32,
    description: 'HARD: Chain boost tiles for maximum efficiency or run out of time.',
    map: [
      'P . B . . . .',
      'T . . T . T .',
      '. T . . T . B',
      '. . T . . T .',
      'T . . B . . .',
      '. T . . . T .',
      'T . T . . . G',
    ],
  },
  // ── Level 4 — The Nebula Void (Extreme 1) ────────────────────────────────
  {
    id: 4,
    name: 'Nebula Void',
    par: 18,
    timeLimit: 25,
    description: 'EXTREME: Extremely narrow paths with zero room for error.',
    map: [
      'P T T T T T T T',
      '. . . T . . . T',
      'T T . T . T . T',
      'T . . . . T . T',
      'T . T T T T . T',
      'T . . . . . . T',
      'T T T T T T . T',
      'T . . . . . . G',
    ],
  },
  // ── Level 5 — The Final Singularity (Extreme 2) ──────────────────────────
  {
    id: 5,
    name: 'Final Singularity',
    par: 22,
    timeLimit: 20,
    description: 'EXTREME: The ultimate test of your reinforcement learning policy.',
    map: [
      'P . . T . . . T',
      'T T . T . T . T',
      '. . . . . T . .',
      '. T T T . T T .',
      '. T . . . . T .',
      '. T . T T . T .',
      '. . . T . . . .',
      'T T T T T T T G',
    ],
  },
];

export function parseLevel(level) {
  const rows = level.map.map(row => row.trim().split(/\s+/));
  const size = rows.length;
  const grid = [];
  let startPos = { x: 0, z: 0 };
  let goalPos  = { x: size - 1, z: size - 1 };
  const warpTiles = [];

  for (let z = 0; z < size; z++) {
    for (let x = 0; x < rows[z].length; x++) {
      const code = rows[z][x];
      let type = 'safe';

      if      (code === 'T') type = 'trap';
      else if (code === 'C') type = 'coin';
      else if (code === 'I') type = 'ice';
      else if (code === 'W') { type = 'warp'; warpTiles.push({ x, z }); }
      else if (code === 'B') type = 'boost';
      else if (code === 'P') { startPos = { x, z }; }
      else if (code === 'G') { goalPos  = { x, z }; type = 'safe'; }

      grid.push({
        x, z,
        key: `${x},${z}`,
        type,
        visited: false,
        collected: false,
        warpIndex: type === 'warp' ? warpTiles.length - 1 : -1,
      });
    }
  }

  const warpPairs = {};
  for (let i = 0; i < warpTiles.length; i += 2) {
    if (warpTiles[i + 1]) {
      const a = `${warpTiles[i].x},${warpTiles[i].z}`;
      const b = `${warpTiles[i+1].x},${warpTiles[i+1].z}`;
      warpPairs[a] = warpTiles[i + 1];
      warpPairs[b] = warpTiles[i];
    }
  }

  return { grid, startPos, goalPos, size, warpPairs };
}
