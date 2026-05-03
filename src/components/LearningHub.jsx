/**
 * LearningHub.jsx
 * The main entry point for the RL Seminar Project.
 * Users progress through 4 distinct modules to learn RL concepts.
 */

import React from 'react';
import '../styles/learninghub.css';

const MODULES = [
  {
    id: 'bandit',
    num: '01',
    title: 'The Greedy Bandit',
    concept: 'Exploration vs. Exploitation',
    desc: 'Learn how agents decide between known rewards and searching for better ones.',
    color: '#00f5d4', // Cyan
  },
  {
    id: 'glitch',
    num: '02',
    title: 'The Glitch Runner',
    concept: 'Stochastic MDPs',
    desc: 'Navigate environments where actions have random outcomes (Slippery Tiles).',
    color: '#f72585', // Magenta
  },
  {
    id: 'snake',
    num: '03',
    title: 'Neon Serpent',
    concept: 'Deep Q-Learning',
    desc: 'Train an agent to grow and survive in a complex, dynamic state space.',
    color: '#ffbe0b', // Yellow
  }
];

export default function LearningHub({ 
  currentModuleId, 
  completedModules = [], 
  onSelectModule 
}) {
  // Only count modules that actually exist in our curriculum to avoid 133% bugs
  const validCompletedCount = completedModules.filter(id => MODULES.some(m => m.id === id)).length;
  const progressPercent = Math.min(100, Math.round((validCompletedCount / MODULES.length) * 100));

  return (
    <div className="hub-screen">
      <div className="hub-container">
        <header className="hub-header">
          <h1 className="hub-title">Reinforcement Learning<span>Curriculum</span></h1>
          <p className="hub-subtitle">Choose a module to begin your training in the Nebula.</p>
        </header>

        <div className="hub-grid">
          {MODULES.map((m, i) => {
            const isLocked = i > 0 && !completedModules.includes(MODULES[i-1].id);
            const isActive = currentModuleId === m.id;
            const isCompleted = completedModules.includes(m.id);
            
            return (
              <div 
                key={m.id} 
                className={`hub-card ${isLocked ? 'locked' : ''} ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => !isLocked && onSelectModule(m.id)}
                style={{ '--accent': m.color }}
              >
                <div className="hub-card-inner">
                  <div className="hub-num">{m.num}</div>
                  <div className="hub-status">
                    {isCompleted ? '✅ Completed' : isLocked ? '🔒 Locked' : '✨ Available'}
                  </div>
                  
                  <h2 className="hub-module-title">{m.title}</h2>
                  <div className="hub-concept-tag">{m.concept}</div>
                  <p className="hub-desc">{m.desc}</p>
                  
                  <div className="hub-action">
                    {isCompleted ? 'Review Training' : isLocked ? 'Complete Previous Module' : 'Begin Training →'}
                  </div>
                </div>
                
                {/* Visual flair */}
                <div className="hub-card-glow" />
              </div>
            );
          })}
        </div>

        <footer className="hub-footer">
          <div className="hub-stats-summary">
            <span>Overall Curriculum Progress: {progressPercent}%</span>
            <div className="hub-progress-bar">
              <div 
                className="hub-progress-fill" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
