/**
 * useAutoPlay.js
 * BFS-optimal AI agent that automatically plays a level step by step.
 * Each step fires a narration message showing RL action/reward language.
 * Used for live seminar demos: "this is what a trained policy looks like."
 */

import { useRef, useCallback } from 'react';

// BFS from start to goal, returns ordered list of {x,z} steps (excluding start)
function bfsPath(grid, startPos, goalPos, gridSize) {
  const key = (x, z) => `${x},${z}`;
  const visited = new Set([key(startPos.x, startPos.z)]);
  const queue = [{ x: startPos.x, z: startPos.z, path: [] }];
  const DIRS = [
    { dx:  1, dz:  0, label: 'EAST  →' },
    { dx: -1, dz:  0, label: 'WEST  ←' },
    { dx:  0, dz:  1, label: 'SOUTH ↓' },
    { dx:  0, dz: -1, label: 'NORTH ↑' },
  ];

  while (queue.length) {
    const { x, z, path } = queue.shift();
    for (const { dx, dz, label } of DIRS) {
      const nx = x + dx, nz = z + dz;
      if (nx < 0 || nx >= gridSize || nz < 0 || nz >= gridSize) continue;
      const k = key(nx, nz);
      if (visited.has(k)) continue;
      const tile = grid.find(t => t.x === nx && t.z === nz);
      if (tile?.type === 'trap') continue; // AI avoids traps
      visited.add(k);
      const newPath = [...path, { x: nx, z: nz, label }];
      if (nx === goalPos.x && nz === goalPos.z) return newPath;
      queue.push({ x: nx, z: nz, path: newPath });
    }
  }
  return null; // no path found
}

// RL-flavoured narration for each step
function narrate(step, stepIndex, totalSteps, tileType, isGoal) {
  const dir = step.label || 'MOVE';
  const qVal = (totalSteps - stepIndex).toFixed(1);

  if (isGoal)   return `🎯 ${dir} | +10 Goal! | Q↑ (terminal)`;
  if (tileType === 'coin')  return `${dir} | +5 Coin! | Q↑ ${(+qVal + 5).toFixed(1)}`;
  if (tileType === 'boost') return `${dir} | ⚡ Boost | 0 step cost`;
  if (tileType === 'ice')   return `${dir} | 🧊 Ice | slides…`;
  if (tileType === 'warp')  return `${dir} | 🌀 Warp | teleporting`;
  return `${dir} | −1 step | Q(s,a) ≈ ${qVal}`;
}

export function useAutoPlay({
  grid, gridSize, goalPos,
  setPlayerPos, setGrid, setPath,
  showFeedbackExternal,
  onComplete,
}) {
  const aiTimer   = useRef(null);
  const isRunning = useRef(false);

  const startAutoPlay = useCallback((startPos) => {
    if (isRunning.current) return;
    const optPath = bfsPath(grid, startPos, goalPos, gridSize);
    if (!optPath || optPath.length === 0) return;

    isRunning.current = true;

    // Reset to start
    setPlayerPos(startPos);
    setPath([startPos]);

    let step = 0;
    const STEP_MS = 620;

    function tick() {
      if (step >= optPath.length) {
        isRunning.current = false;
        onComplete?.();
        return;
      }
      const s      = optPath[step];
      const tile   = grid.find(t => t.x === s.x && t.z === s.z);
      const isGoal = s.x === goalPos.x && s.z === goalPos.z;
      const msg    = narrate(s, step, optPath.length, tile?.type, isGoal);

      setPlayerPos({ x: s.x, z: s.z });
      setGrid(g => g.map(t => t.x === s.x && t.z === s.z ? { ...t, visited: true } : t));
      setPath(p => [...p, { x: s.x, z: s.z }]);
      showFeedbackExternal(msg, isGoal ? 'goal' : tile?.type || 'step');

      step++;
      aiTimer.current = setTimeout(tick, STEP_MS);
    }

    // Brief "thinking" pause before first step
    aiTimer.current = setTimeout(tick, 800);
  }, [grid, gridSize, goalPos]); // eslint-disable-line

  const stopAutoPlay = useCallback(() => {
    clearTimeout(aiTimer.current);
    isRunning.current = false;
  }, []);

  return { startAutoPlay, stopAutoPlay };
}
