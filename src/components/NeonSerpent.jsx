/**
 * NeonSerpent.jsx
 * Module 04: Deep Q-Learning (DQN)
 * A snake-style game demonstrating Q-Value evaluation.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../styles/neonserpent.css';

const GRID_SIZE = 15;
const INITIAL_SNAKE = [{ x: 7, y: 7 }, { x: 7, y: 8 }, { x: 7, y: 9 }];
const SPEED = 150;

function NeuralNexus({ qValues }) {
  const maxQ = Math.max(...Object.values(qValues), 0.1);
  return (
    <div className="ns-nexus">
      <div className="ns-nexus-header">
        <span>NEURAL NEXUS</span>
        <div className="ns-nexus-status">Processing State...</div>
      </div>
      <svg viewBox="0 0 200 120" className="ns-nexus-svg">
        {/* Layer 1: Input */}
        <circle cx="20" cy="30" r="4" fill="#64748b" />
        <circle cx="20" cy="60" r="4" fill="#64748b" />
        <circle cx="20" cy="90" r="4" fill="#64748b" />

        {/* Layer 2: Hidden */}
        <circle cx="80" cy="20" r="5" fill="#00f5d4" opacity="0.3" />
        <circle cx="80" cy="50" r="5" fill="#00f5d4" opacity="0.6" />
        <circle cx="80" cy="80" r="5" fill="#00f5d4" opacity="0.4" />
        <circle cx="80" cy="110" r="5" fill="#00f5d4" opacity="0.2" />

        {/* Layer 3: Output */}
        <circle cx="160" cy="25" r="6" fill={qValues.UP === maxQ ? '#00f5d4' : '#1e293b'} />
        <circle cx="160" cy="50" r="6" fill={qValues.DOWN === maxQ ? '#00f5d4' : '#1e293b'} />
        <circle cx="160" cy="75" r="6" fill={qValues.LEFT === maxQ ? '#00f5d4' : '#1e293b'} />
        <circle cx="160" cy="100" r="6" fill={qValues.RIGHT === maxQ ? '#00f5d4' : '#1e293b'} />

        {/* Connections (simplified) */}
        <line x1="20" y1="60" x2="80" y2="50" stroke="#00f5d4" strokeWidth="0.5" opacity="0.2" />
        <line x1="80" y1="50" x2="160" y2="25" stroke="#00f5d4" strokeWidth={qValues.UP === maxQ ? '1.5' : '0.5'} opacity={qValues.UP === maxQ ? '0.8' : '0.1'} />
        <line x1="80" y1="50" x2="160" y2="50" stroke="#00f5d4" strokeWidth={qValues.DOWN === maxQ ? '1.5' : '0.5'} opacity={qValues.DOWN === maxQ ? '0.8' : '0.1'} />
        <line x1="80" y1="50" x2="160" y2="75" stroke="#00f5d4" strokeWidth={qValues.LEFT === maxQ ? '1.5' : '0.5'} opacity={qValues.LEFT === maxQ ? '0.8' : '0.1'} />
        <line x1="80" y1="50" x2="160" y2="100" stroke="#00f5d4" strokeWidth={qValues.RIGHT === maxQ ? '1.5' : '0.5'} opacity={qValues.RIGHT === maxQ ? '0.8' : '0.1'} />
      </svg>
    </div>
  );
}

export default function NeonSerpent({ onComplete, onBack }) {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 3, y: 3 });
  const [dir, setDir] = useState({ x: 0, y: -1 });
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState('playing'); // playing, won, lost
  const [qValues, setQValues] = useState({ UP: 0, DOWN: 0, LEFT: 0, RIGHT: 0 });
  
  const gameLoopRef = useRef();

  const generateFood = useCallback((currentSnake) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const hit = currentSnake.some(s => s.x === newFood.x && s.y === newFood.y);
      if (!hit) break;
    }
    return newFood;
  }, []);

  // Simple "Q-Value" heuristic for demonstration
  const updateQValues = useCallback((head, currentFood) => {
    const dist = (x1, y1, x2, y2) => Math.abs(x1 - x2) + Math.abs(y1 - y2);
    const currentDist = dist(head.x, head.y, currentFood.x, currentFood.y);
    
    setQValues({
      UP: dist(head.x, head.y - 1, currentFood.x, currentFood.y) < currentDist ? 0.95 : 0.1,
      DOWN: dist(head.x, head.y + 1, currentFood.x, currentFood.y) < currentDist ? 0.95 : 0.1,
      LEFT: dist(head.x - 1, head.y, currentFood.x, currentFood.y) < currentDist ? 0.95 : 0.1,
      RIGHT: dist(head.x + 1, head.y, currentFood.x, currentFood.y) < currentDist ? 0.95 : 0.1,
    });
  }, []);

  const moveSnake = useCallback(() => {
    if (status !== 'playing') return;

    setSnake(prev => {
      const head = prev[0];
      const newHead = { x: head.x + dir.x, y: head.y + dir.y };

      // Wall collision
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        setStatus('lost');
        return prev;
      }

      // Self collision
      if (prev.some(s => s.x === newHead.x && s.y === newHead.y)) {
        setStatus('lost');
        return prev;
      }

      const newSnake = [newHead, ...prev];

      // Food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10);
        setFood(generateFood(newSnake));
        if (score + 10 >= 100) setStatus('won');
      } else {
        newSnake.pop();
      }

      updateQValues(newHead, food);
      return newSnake;
    });
  }, [dir, food, generateFood, status, score, updateQValues]);

  useEffect(() => {
    gameLoopRef.current = setInterval(moveSnake, SPEED);
    return () => clearInterval(gameLoopRef.current);
  }, [moveSnake]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowUp' && dir.y !== 1) setDir({ x: 0, y: -1 });
      if (e.key === 'ArrowDown' && dir.y !== -1) setDir({ x: 0, y: 1 });
      if (e.key === 'ArrowLeft' && dir.x !== 1) setDir({ x: -1, y: 0 });
      if (e.key === 'ArrowRight' && dir.x !== -1) setDir({ x: 1, y: 0 });
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dir]);

    const reset = () => {
      setSnake(INITIAL_SNAKE);
      setFood({ x: 3, y: 3 });
      setDir({ x: 0, y: -1 });
      setScore(0);
      setStatus('playing');
    };

    return (
      <div className="ns-screen">
        <div className="ns-container">
          <header className="ns-header">
            <button className="ns-back-btn" onClick={onBack}>← Quit</button>
            <div className="ns-badge">MODULE 03: DEEP Q-LEARNING</div>
            <h1 className="ns-title">Neon Serpent</h1>
            <p className="ns-subtitle">Reach 100 points. Observe the AI's Q-Value predictions.</p>
          </header>

          <div className="ns-main">
            <div className="ns-game-area">
               <div className="ns-grid">
                 {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                   const x = i % GRID_SIZE;
                   const y = Math.floor(i / GRID_SIZE);
                   const isSnake = snake.some(s => s.x === x && s.y === y);
                   const isHead = snake[0].x === x && snake[0].y === y;
                   const isFood = food.x === x && food.y === y;
                   return (
                     <div key={i} className={`ns-cell ${isSnake ? 'snake' : ''} ${isHead ? 'head' : ''} ${isFood ? 'food' : ''}`} />
                   );
                 })}
               </div>
            </div>

            <div className="ns-dashboard">
              <NeuralNexus qValues={qValues} />
              
              <div className="ns-stat">
                <span className="ns-label">SCORE</span>
                <span className="ns-value">{score} / 100</span>
              </div>

              <div className="ns-q-panel">
                 <div className="ns-concept-box">
                    <span className="ns-concept-tag">CORE CONCEPT</span>
                    <h3>Deep Q-Learning (DQN)</h3>
                    <p>
                      The AI uses a <strong>Neural Network</strong> to predict the future reward 
                      (Q-Value) for every move. It then chooses the highest score to survive.
                    </p>
                 </div>

                 <h3>DQN PREDICTIONS (Q-VALUES)</h3>
                 <div className="ns-q-grid">
                    <div className="ns-q-item"><span>UP</span> <strong>{qValues.UP.toFixed(2)}</strong></div>
                    <div className="ns-q-item"><span>DOWN</span> <strong>{qValues.DOWN.toFixed(2)}</strong></div>
                    <div className="ns-q-item"><span>LEFT</span> <strong>{qValues.LEFT.toFixed(2)}</strong></div>
                    <div className="ns-q-item"><span>RIGHT</span> <strong>{qValues.RIGHT.toFixed(2)}</strong></div>
                 </div>
                 <p className="ns-q-hint">Higher values = better predicted reward</p>
              </div>
            </div>
          </div>

          {status !== 'playing' && (
            <div className="ns-overlay">
              <div className="ns-modal">
                <h2>{status === 'won' ? 'Curriculum Complete!' : 'System Fault'}</h2>
                <p>{status === 'won' ? 'You have mastered the foundations of Reinforcement Learning.' : 'Collision detected. Restart recommended.'}</p>
                <div className="ns-modal-actions">
                  {status === 'won' ? (
                    <button className="ns-btn primary" onClick={() => onComplete('snake')}>
                      Join the Hall of Fame →
                    </button>
                  ) : (
                    <button className="ns-btn secondary" onClick={reset}>
                      Retry Training
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
