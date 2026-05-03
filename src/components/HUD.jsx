/**
 * HUD.jsx  (v3)
 * Timer, score, moves, level badge, boost indicator, game-over overlay.
 * NEW: combo streak badge, Q-heatmap toggle button, AI hint toggle button.
 */

import React from 'react';
import '../styles/hud.css';

export default function HUD({
  score, moves, timeLeft, gameStatus,
  currentLevel, levelIndex,
  boostActive, coinsCollected,
  onRestart, onMenu, onReplay,
  path, isReplaying,
  combo, showHeatmap, showHint,
  onToggleHeatmap, onToggleHint,
  isAIPlaying, onWatchAI,
}) {
  const timerWarning = timeLeft <= 10;
  const canReplay = path.length > 1 && !isReplaying && gameStatus !== 'playing';

  return (
    <div className="hud-container">
      {/* ── Top bar ── */}
      <div className="hud-topbar">
        {/* Left: menu + level badge */}
        <div className="hud-left">
          <button id="hud-menu" className="hud-icon-btn" onClick={onMenu} title="Level Select">
            ☰
          </button>
          <div className="level-badge">
            <span className="level-badge-num">LV {levelIndex + 1}</span>
            <span className="level-badge-name">{currentLevel?.name}</span>
          </div>
        </div>

        {/* Centre: stats */}
        <div className="hud-stats">
          <div className="stat-card">
            <span className="stat-label">SCORE</span>
            <span className={`stat-value ${score < 0 ? 'negative' : score > 0 ? 'positive' : ''}`}>
              {score >= 0 ? '+' : ''}{score}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">MOVES</span>
            <span className="stat-value neutral">{moves}</span>
          </div>
          <div className={`stat-card ${timerWarning ? 'timer-warning' : ''}`}>
            <span className="stat-label">TIME</span>
            <span className={`stat-value ${timerWarning ? 'negative' : ''}`}>
              {String(Math.floor(timeLeft / 60)).padStart(2,'0')}:{String(timeLeft % 60).padStart(2,'0')}
            </span>
          </div>
          {coinsCollected > 0 && (
            <div className="stat-card">
              <span className="stat-label">COINS</span>
              <span className="stat-value" style={{ color: '#fbbf24' }}>🪙 {coinsCollected}</span>
            </div>
          )}
          {/* Combo badge — shows when streak ≥ 3 */}
          {combo >= 3 && (
            <div className="stat-card combo-card">
              <span className="stat-label">COMBO</span>
              <span className="stat-value combo-value">🔥 ×{combo}</span>
            </div>
          )}
        </div>

        {/* Right: tools + restart */}
        <div className="hud-right">
          {boostActive && (
            <div className="boost-indicator">⚡ BOOST</div>
          )}
          <button
            id="hud-watch-ai"
            className={`hud-icon-btn ${isAIPlaying ? 'active-toggle ai-running' : ''}`}
            onClick={onWatchAI}
            title={isAIPlaying ? 'Stop AI [click]' : 'Watch AI solve it'}
          >
            {isAIPlaying ? '⏹️' : '🤖'}
          </button>
          <button
            id="hud-hint"
            className={`hud-icon-btn ${showHint ? 'active-toggle' : ''}`}
            onClick={onToggleHint}
            title="AI Hint [H]"
          >
            💡
          </button>
          <button
            id="hud-heatmap"
            className={`hud-icon-btn ${showHeatmap ? 'active-toggle' : ''}`}
            onClick={onToggleHeatmap}
            title="Q-Value Heatmap [Q]"
          >
            🌡️
          </button>
          <button id="hud-restart" className="action-btn primary" onClick={onRestart}>↺</button>
        </div>
      </div>

      {/* ── Par hint ── */}
      {currentLevel && (
        <div className="par-hint">
          ⭐⭐⭐ in ≤{currentLevel.par} moves
        </div>
      )}

      {/* ── Game-over overlay (lost / timeout) ── */}
      {(gameStatus === 'lost' || gameStatus === 'timeout') && (
        <div className="gameover-overlay lost">
          <div className="gameover-card">
            <div className="gameover-emoji">{gameStatus === 'timeout' ? '⏰' : '💀'}</div>
            <h2 className="gameover-title">
              {gameStatus === 'timeout' ? 'Time\'s Up!' : 'Hit a Trap!'}
            </h2>
            <p className="gameover-sub">
              Score: {score} · Moves: {moves}
            </p>
            <div className="gameover-buttons">
              <button id="go-menu"   className="action-btn secondary" onClick={onMenu}>☰ Menu</button>
              <button id="go-retry" className="action-btn primary large" onClick={onRestart}>↺ Try Again</button>
              {canReplay && (
                <button id="go-replay" className="action-btn secondary" onClick={onReplay}>▶ Replay</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Controls hint ── */}
      <div className="controls-hint">
        <span className="hint-keygroup">↑ ↓ ← →</span>
        <span className="hint-sep">or</span>
        <span className="hint-keygroup">WASD</span>
        <span className="hint-sep">·</span>
        <span className="hint-key">H</span>
        <span className="hint-label">hint</span>
        <span className="hint-sep">·</span>
        <span className="hint-key">Q</span>
        <span className="hint-label">heatmap</span>
      </div>
    </div>
  );
}
