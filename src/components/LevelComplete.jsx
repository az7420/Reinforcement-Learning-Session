/**
 * LevelComplete.jsx
 * Shown when the player wins a level.
 * Animates stars one by one, shows score breakdown.
 */

import React, { useState, useEffect } from 'react';
import '../styles/levelcomplete.css';

export default function LevelComplete({ result, levelName, onNext, onRetry, onMenu, hasNext }) {
  const [visibleStars, setVisibleStars] = useState(0);
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    // Reveal stars one by one
    const timers = [];
    timers.push(setTimeout(() => setVisibleStars(1), 400));
    if (result.stars >= 2) timers.push(setTimeout(() => setVisibleStars(2), 850));
    if (result.stars >= 3) timers.push(setTimeout(() => setVisibleStars(3), 1300));
    timers.push(setTimeout(() => setShowBreakdown(true), 1700));
    return () => timers.forEach(clearTimeout);
  }, [result.stars]);

  return (
    <div className="lc-overlay">
      <div className="lc-card">
        {/* Header */}
        <div className="lc-header">
          <div className="lc-title">Level Complete!</div>
          <div className="lc-level-name">{levelName}</div>
        </div>

        {/* Stars */}
        <div className="lc-stars">
          {[1, 2, 3].map(n => (
            <span
              key={n}
              className={`lc-star ${visibleStars >= n ? 'active' : 'empty'}`}
            >
              ★
            </span>
          ))}
        </div>

        {/* Score breakdown */}
        {showBreakdown && (
          <div className="lc-breakdown">
            <div className="lc-row">
              <span>Base Score</span>
              <span className="lc-val">{result.baseScore >= 0 ? '+' : ''}{result.baseScore}</span>
            </div>
            <div className="lc-row">
              <span>⏱ Time Bonus ({result.timeLeft}s left)</span>
              <span className="lc-val positive">+{result.timeBonus}</span>
            </div>
            <div className="lc-divider" />
            <div className="lc-row total">
              <span>Total</span>
              <span className="lc-val">{result.totalScore}</span>
            </div>
            <div className="lc-row">
              <span>Moves Used</span>
              <span className="lc-val neutral">{result.moves}</span>
            </div>
            {result.isNewBest && (
              <div className="lc-newbest">🏅 New Best!</div>
            )}
          </div>
        )}

        {/* Buttons */}
        {showBreakdown && (
          <div className="lc-buttons">
            <button id="lc-menu"  className="lc-btn secondary" onClick={onMenu}>☰ Menu</button>
            <button id="lc-retry" className="lc-btn secondary" onClick={onRetry}>↺ Retry</button>
            {hasNext ? (
              <button id="lc-next" className="lc-btn primary" onClick={onNext}>Next Level ▶</button>
            ) : (
              <button id="lc-next" className="lc-btn primary module-fin" onClick={onNext}>Finish Module ✦</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
