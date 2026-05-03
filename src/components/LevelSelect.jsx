/**
 * LevelSelect.jsx  (v2 — Locked Progression)
 * Shows locked/unlocked levels.
 * Levels unlock sequentially — beat level N to unlock N+1.
 * Progress (unlocked count) is persisted in localStorage.
 */

import React from 'react';
import { LEVELS } from '../data/LEVELS';
import '../styles/levelselect.css';

export default function LevelSelect({ progress, unlockedCount, onSelect, onBack }) {

  return (
    <div className="ls-screen">
      {/* Animated nebula blobs */}
      <div className="ls-bg-dots" />

      <div className="ls-content">
        <div className="ls-header">
          <button className="ls-back-btn" onClick={onBack}>← Back to Curriculum</button>
          <div className="ls-logo">🤖</div>
          <h1 className="ls-title">RL Grid World</h1>
          <p className="ls-subtitle">Module 02: Policy & Value Iteration</p>
          <p className="ls-unlock-hint">
            🔒 Beat each level to unlock the next one
          </p>
        </div>

        <div className="ls-grid">
          {LEVELS.map((level, i) => {
            const isUnlocked = i < unlockedCount;
            const saved = progress[level.id] || {};
            const stars = saved.stars || 0;
            const isCompleted = stars > 0;

            return (
              <button
                key={level.id}
                id={`level-btn-${level.id}`}
                className={`ls-card ${isUnlocked ? 'unlocked' : 'locked'} stars-${stars} ${isCompleted ? 'completed' : ''}`}
                onClick={() => isUnlocked && onSelect(i)}
                disabled={!isUnlocked}
                title={isUnlocked ? level.description : `Complete Level ${level.id - 1} to unlock`}
              >
                {/* Lock overlay */}
                {!isUnlocked && (
                  <div className="ls-lock">
                    <span className="ls-lock-icon">🔒</span>
                    <span className="ls-lock-text">Level {i}</span>
                  </div>
                )}

                {/* Level number */}
                <div className="ls-num">{level.id}</div>

                {/* Stars */}
                <div className="ls-stars">
                  {[1,2,3].map(n => (
                    <span key={n} className={`ls-star ${stars >= n ? 'lit' : ''}`}>★</span>
                  ))}
                </div>

                {/* Name */}
                <div className="ls-name">{level.name}</div>

                {/* Meta */}
                <div className="ls-meta">
                  <span>⏱ {level.timeLimit}s</span>
                  <span>📐 {level.map.length}×{level.map.length}</span>
                </div>

                {/* Completed badge */}
                {isCompleted && (
                  <div className="ls-completed-badge">✓</div>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom row: total stars */}
        <div className="ls-bottom-row">
          <div className="ls-total-stars" style={{ width: '100%', justifyContent: 'center' }}>
            <span className="ls-ts-label">Total Session Stars</span>
            <span className="ls-ts-value">
              {Object.values(progress).reduce((sum, p) => sum + (p.stars || 0), 0)}
              <span className="ls-ts-max"> / {LEVELS.length * 3}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
