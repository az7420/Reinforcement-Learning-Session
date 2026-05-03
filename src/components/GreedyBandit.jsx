/**
 * GreedyBandit.jsx
 * Module 01: Exploration vs. Exploitation
 * A mini-game where users choose between 3 arms with hidden reward distributions.
 */

import React, { useState, useEffect } from 'react';
import '../styles/greedybandit.css';

const ARMS = [
  { id: 0, name: 'Core A', color: '#00f5d4', mean: 5, std: 2 },
  { id: 1, name: 'Core B', color: '#f72585', mean: 8, std: 5 },
  { id: 2, name: 'Core C', color: '#ffbe0b', mean: 6, std: 1 },
];

const MAX_ROUNDS = 20;

export default function GreedyBandit({ onComplete, onBack }) {
  const [rounds, setRounds] = useState(0);
  const [totalReward, setTotalReward] = useState(0);
  const [history, setHistory] = useState([]);
  const [lastResult, setLastResult] = useState(null);
  const [isDone, setIsDone] = useState(false);
  
  // Interactive Hyperparameters
  const [isAuto, setIsAuto] = useState(false);
  const [epsilon, setEpsilon] = useState(0.2); // 20% exploration

  useEffect(() => {
    let interval;
    if (isAuto && !isDone) {
      interval = setInterval(() => {
        // Epsilon-Greedy Strategy
        if (Math.random() < epsilon) {
          // Explore: Pick random arm
          const randomArm = ARMS[Math.floor(Math.random() * ARMS.length)];
          pullArm(randomArm);
        } else {
          // Exploit: Pick best performing arm so far
          const stats = ARMS.map(arm => {
            const armHistory = history.filter(h => h.arm === arm.id);
            const avg = armHistory.length > 0 
              ? armHistory.reduce((sum, h) => sum + h.reward, 0) / armHistory.length 
              : 0;
            return { id: arm.id, avg };
          });
          const bestArmId = stats.reduce((prev, curr) => prev.avg > curr.avg ? prev : curr).id;
          pullArm(ARMS[bestArmId]);
        }
      }, 600);
    }
    return () => clearInterval(interval);
  }, [isAuto, isDone, epsilon, history]);

  function pullArm(arm) {
    if (rounds >= MAX_ROUNDS) return;
    
    // Normal distribution approximation (Box-Muller)
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    const reward = Math.max(0, Math.round(arm.mean + z0 * arm.std));

    const newResult = { arm: arm.id, reward, color: arm.color, name: arm.name };
    setLastResult(newResult);
    setTotalReward(prev => prev + reward);
    setHistory(prev => [newResult, ...prev]);
    setRounds(r => r + 1);

    if (rounds + 1 >= MAX_ROUNDS) {
      setIsDone(true);
      setIsAuto(false);
    }
  }

  return (
    <div className="gb-screen">
      <div className="gb-container">
        <header className="gb-header">
          <button className="gb-back-btn" onClick={onBack}>← Quit</button>
          <div className="gb-badge">MODULE 01</div>
          <h1 className="gb-title">The Greedy Bandit</h1>
          <p className="gb-subtitle">Which energy core has the highest yield? Experiment to find out.</p>
        </header>

        <div className="gb-main-layout">
          <div className="gb-game-column">
            <div className="gb-stats">
              <div className="gb-stat">
                <span className="gb-stat-label">Round</span>
                <span className="gb-stat-value">{rounds} / {MAX_ROUNDS}</span>
              </div>
              <div className="gb-stat">
                <span className="gb-stat-label">Total Data</span>
                <span className="gb-stat-value cyan">{totalReward}</span>
              </div>
            </div>

            <div className="gb-concept-box">
              <div className="gb-concept-header">
                <span className="gb-concept-tag">CORE CONCEPT</span>
                <h3>Exploration vs. Exploitation</h3>
              </div>
              <p>
                Do you <strong>Exploit</strong> the energy core you know is good, or <strong>Explore</strong> the others to find a higher yield? In RL, balancing this trade-off is the key to maximizing long-term rewards.
              </p>
            </div>

            <div className="gb-arms">
              {ARMS.map(arm => (
                <button 
                  key={arm.id} 
                  className="gb-arm-btn"
                  style={{ '--color': arm.color }}
                  onClick={() => pullArm(arm)}
                  disabled={isDone || isAuto}
                >
                  <div className="gb-arm-icon">⚡</div>
                  <div className="gb-arm-name">{arm.name}</div>
                  <div className="gb-arm-hint">Pull to Sample</div>
                </button>
              ))}
            </div>

            {lastResult && (
              <div className="gb-result-toast" key={rounds}>
                Received <span style={{ color: lastResult.color }}>+{lastResult.reward}</span> from {lastResult.name}
              </div>
            )}
          </div>

          <div className="gb-console-column">
            <div className="gb-console">
              <h3>AGENT STRATEGY</h3>
              <div className="gb-console-field">
                <label>Auto-Pilot Agent</label>
                <button 
                  className={`gb-toggle ${isAuto ? 'on' : ''}`}
                  onClick={() => setIsAuto(!isAuto)}
                  disabled={isDone}
                >
                  {isAuto ? 'ACTIVE' : 'OFF'}
                </button>
              </div>

              <div className="gb-console-field">
                <div className="gb-field-header">
                  <label>Exploration Rate (ε)</label>
                  <span>{(epsilon * 100).toFixed(0)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="1" step="0.05"
                  value={epsilon}
                  onChange={(e) => setEpsilon(parseFloat(e.target.value))}
                  disabled={isDone}
                />
                <p className="gb-field-hint">
                  Higher ε = More Random Exploration<br/>
                  Lower ε = More Greedy Exploitation
                </p>
              </div>

              <div className="gb-history">
                <h3>Extraction Log</h3>
                <div className="gb-history-list">
                  {history.map((h, i) => (
                    <div key={i} className="gb-history-item">
                      <span>#{MAX_ROUNDS - i}</span>
                      <span style={{ color: h.color }}>{h.name}</span>
                      <span className="gb-h-val">+{h.reward}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {isDone && (
          <div className="gb-complete-overlay">
            <div className="gb-complete-card">
              <h2>Training Complete!</h2>
              <p>You collected <strong>{totalReward}</strong> data points.</p>
              <p className="gb-lesson">
                <strong>RL Lesson:</strong> Core B was volatile but had the highest average. 
                Did you explore enough to find it, or did you settle for the safe rewards of Core C?
              </p>
              <button className="gb-finish-btn" onClick={() => onComplete('bandit')}>
                Unlock Module 02 →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
