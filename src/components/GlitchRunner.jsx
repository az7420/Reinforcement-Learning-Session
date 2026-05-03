/**
 * GlitchRunner.jsx
 * Module 03: Stochastic MDPs (Probability)
 * A grid-based game where actions have a 20% chance of failing/randomizing.
 */

import React, { useState, useEffect, useCallback } from 'react';
import '../styles/glitchrunner.css';

const GRID_SIZE = 7;
const GLITCH_CHANCE = 0.25; // 25% chance of a glitch

const MAP = [
  'P . . T . . .',
  '. T . . . T .',
  '. . . T . . .',
  'T . T . T . T',
  '. . . . . . .',
  '. T . T . T .',
  '. . . . . . G',
];

export default function GlitchRunner({ onComplete, onBack }) {
  const [pos, setPos] = useState({ x: 0, z: 0 });
  const [moves, setMoves] = useState(0);
  const [status, setStatus] = useState('playing'); // playing, won, lost
  const [lastAction, setLastAction] = useState(null); // { intended, actual, glitched }
  const [grid, setGrid] = useState([]);

  // Initialize grid
  useEffect(() => {
    const newGrid = [];
    MAP.forEach((row, z) => {
      row.split(' ').forEach((cell, x) => {
        newGrid.push({ x, z, type: cell === 'T' ? 'trap' : cell === 'G' ? 'goal' : 'safe' });
      });
    });
    setGrid(newGrid);
  }, []);

    const [isShaking, setIsShaking] = useState(false);

    const move = useCallback((dx, dz) => {
      if (status !== 'playing') return;

      let finalDx = dx;
      let finalDz = dz;
      let glitched = false;

      // Roll for glitch
      if (Math.random() < GLITCH_CHANCE) {
        glitched = true;
        const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        const randomDir = dirs[Math.floor(Math.random() * dirs.length)];
        finalDx = randomDir[0];
        finalDz = randomDir[1];
        
        // Trigger visual shake
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 300);
      }

    const nx = Math.max(0, Math.min(GRID_SIZE - 1, pos.x + finalDx));
    const nz = Math.max(0, Math.min(GRID_SIZE - 1, pos.z + finalDz));

    setLastAction({ 
      intended: { dx, dz }, 
      actual: { dx: finalDx, dz: finalDz }, 
      glitched 
    });

    const targetTile = grid.find(t => t.x === nx && t.z === nz);
    
    setPos({ x: nx, z: nz });
    setMoves(m => m + 1);

    if (targetTile?.type === 'goal') {
      setStatus('won');
    } else if (targetTile?.type === 'trap') {
      setStatus('lost');
    }
  }, [pos, status, grid]);

  // Keyboard support
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w') move(0, -1);
      if (e.key === 'ArrowDown' || e.key === 's') move(0, 1);
      if (e.key === 'ArrowLeft' || e.key === 'a') move(-1, 0);
      if (e.key === 'ArrowRight' || e.key === 'd') move(1, 0);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [move]);

    const reset = () => {
      setPos({ x: 0, z: 0 });
      setMoves(0);
      setStatus('playing');
      setLastAction(null);
    };

    return (
      <div className="gr-screen">
        <div className="gr-container">
          <header className="gr-header">
            <button className="gr-back-btn" onClick={onBack}>← Quit</button>
            <div className="gr-badge">MODULE 02: STOCHASTIC MDP</div>
            <h1 className="gr-title">The Glitch Runner</h1>
            <p className="gr-subtitle">Commands have a 25% chance of failure. Plan for uncertainty.</p>
          </header>

          <div className="gr-main">
            <div className={`gr-grid ${isShaking ? 'shaking' : ''}`}>
              {grid.map((tile, i) => (
                <div 
                  key={i} 
                  className={`gr-tile ${tile.type} ${pos.x === tile.x && pos.z === tile.z ? 'player' : ''}`}
                >
                  {tile.type === 'goal' && '✦'}
                  {tile.type === 'trap' && '💀'}
                  {pos.x === tile.x && pos.z === tile.z && <div className="gr-player-dot" />}
                </div>
              ))}
            </div>

            <div className="gr-sidebar">
              <div className="gr-stat">
              <span className="gr-label">COMMANDS</span>
              <span className="gr-value">{moves}</span>
            </div>

            <div className="gr-objective">
              <h3>MISSION OBJECTIVE</h3>
              <ul>
                <li>Target: <span>Reach the Apex ✦</span></li>
                <li>Avoid: <span>The Void 💀</span></li>
                <li>Status: <span>Signal Glitch (25%)</span></li>
              </ul>
            </div>
            
            <div className="gr-log">
              <h3>SYSTEM LOG</h3>
              {lastAction ? (
                <div className={`gr-log-entry ${lastAction.glitched ? 'glitch' : 'success'}`}>
                  {lastAction.glitched ? (
                    <>⚠️ GLITCH! Resulted in {lastAction.actual.dx !== 0 ? (lastAction.actual.dx > 0 ? 'Right' : 'Left') : (lastAction.actual.dz > 0 ? 'Down' : 'Up')}</>
                  ) : (
                    <>✓ COMMAND NOMINAL</>
                  )}
                </div>
              ) : (
                <div className="gr-log-entry">Waiting for signal...</div>
              )}
            </div>

            <div className="gr-concept-note">
              <h4>RL Concept: Stochastic MDP</h4>
              <p>In real RL, actions don't always work. You must learn a policy that succeeds even when things go wrong.</p>
            </div>

            <div className="gr-strategy">
              <h3>🛡️ SURVIVAL STRATEGY</h3>
              <p>The glitch is <strong>intentional</strong>. To win, don't just take the shortest path—take the <strong>safest</strong> one. Keep a 1-2 tile buffer from traps to survive unexpected slips!</p>
            </div>
            </div>
          </div>

          {status !== 'playing' && (
            <div className="gr-overlay">
              <div className="gr-modal">
                <h2>{status === 'won' ? 'Mission Success!' : 'System Crash!'}</h2>
                <p>{status === 'won' ? 'You navigated the chaos successfully.' : 'The glitch pushed you into a trap.'}</p>
                <div className="gr-modal-actions">
                  {status === 'won' ? (
                    <button className="gr-btn primary" onClick={() => onComplete('glitch')}>
                      Next Module →
                    </button>
                  ) : (
                    <button className="gr-btn secondary" onClick={reset}>
                      Reboot System
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
}
