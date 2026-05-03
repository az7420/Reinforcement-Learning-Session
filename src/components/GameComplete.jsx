/**
 * GameComplete.jsx
 * Shown when the player finishes ALL 10 levels.
 * Features:
 *  • Animated trophy celebration
 *  • Stats summary (total time, total score, total stars)
 *  • Name input form → submits to JSONBin leaderboard
 *  • Live leaderboard showing all completers sorted by speed
 */

import React, { useState, useEffect } from 'react';
import { submitEntry, fetchLeaderboard } from '../services/leaderboard';
import '../styles/gamecomplete.css';

// Format seconds → mm:ss
function fmtTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// Format rank
function rankLabel(i) {
  if (i === 0) return { label: '🥇', cls: 'gold' };
  if (i === 1) return { label: '🥈', cls: 'silver' };
  if (i === 2) return { label: '🥉', cls: 'bronze' };
  return { label: `#${i + 1}`, cls: '' };
}

export default function GameComplete({
  totalTimeSecs,   // total seconds from first level start to last level win
  totalScore,      // sum of all level scores
  totalStars,      // sum of all stars earned
  totalMoves,      // sum of all moves
  onPlayAgain,     // go back to level select
}) {
  const [name,     setName]     = useState('');
  const [status,   setStatus]   = useState('idle'); // idle | loading | done | error
  const [board,    setBoard]    = useState([]);
  const [sortBy,   setSortBy]   = useState('time'); // 'time' | 'score'
  const [boardLoading, setBoardLoading] = useState(true);
  const [myEntry,  setMyEntry]  = useState(null);

  // Load leaderboard on mount
  useEffect(() => {
    fetchLeaderboard()
      .then(entries => { setBoard(entries); setBoardLoading(false); })
      .catch(() => setBoardLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setStatus('loading');

    const entry = {
      name: trimmed,
      totalTimeSecs,
      totalScore,
      totalStars,
      totalMoves,
      completedAt: new Date().toISOString(),
    };

    // 1. Optimistic Update: Add to local board immediately
    const optimisticBoard = [...board, entry].sort((a, b) => {
      return sortBy === 'time' 
        ? a.totalTimeSecs - b.totalTimeSecs 
        : b.totalScore - a.totalScore;
    });
    setBoard(optimisticBoard.slice(0, 100));
    setMyEntry(entry);
    setStatus('done');

    // 2. Background Sync
    const updatedBoard = await submitEntry(entry);
    if (!updatedBoard) {
      setStatus('error'); // Soft error, they still see their optimistic entry
    } else {
      // Refresh with final server data
      setBoard(updatedBoard);
    }
  }

  // Handle sort toggle
  const sortedBoard = [...board].sort((a, b) => {
    return sortBy === 'time' 
      ? a.totalTimeSecs - b.totalTimeSecs 
      : b.totalScore - a.totalScore;
  });

  return (
    <div className="gc-screen">
      <div className="gc-card">

        {/* Header */}
        <div className="gc-trophy">🏆</div>
        <h1 className="gc-title">Game Complete!</h1>
        <p className="gc-subtitle">You conquered all 10 levels. Join the Hall of Fame!</p>

        {/* Stats */}
        <div className="gc-stats">
          <div className="gc-stat">
            <div className="gc-stat-label">Total Time</div>
            <div className="gc-stat-value cyan">{fmtTime(totalTimeSecs)}</div>
          </div>
          <div className="gc-stat">
            <div className="gc-stat-label">Total Score</div>
            <div className="gc-stat-value magenta">+{totalScore}</div>
          </div>
          <div className="gc-stat stars">
            <div className="gc-stat-label">Total Stars</div>
            <div className="gc-stat-value gold">
              <span className="gc-stars-count">{totalStars}</span>
              <span className="gc-stars-total">/ 30</span>
              <div className="gc-stars-mini-grid">
                {[...Array(30)].map((_, i) => (
                  <span key={i} className={`mini-star ${i < totalStars ? 'active' : ''}`}>★</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Name submission form */}
        {status !== 'done' ? (
          <form className="gc-form" onSubmit={handleSubmit}>
            <label className="gc-form-label" htmlFor="player-name-input">
              Enter your name for the leaderboard
            </label>
            <input
              id="player-name-input"
              className="gc-name-input"
              type="text"
              placeholder="Your name..."
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={30}
              autoFocus
              disabled={status === 'loading'}
            />
            <button
              id="gc-submit-btn"
              type="submit"
              className={`gc-submit-btn ${status === 'loading' ? 'loading' : ''}`}
              disabled={!name.trim() || status === 'loading'}
            >
              {status === 'loading' ? '⏳ Submitting…' : '🚀 Submit to Leaderboard'}
            </button>
            {status === 'error' && (
              <p className="gc-err-msg">⚠️ Could not reach cloud — saved locally!</p>
            )}
          </form>
        ) : (
          <div className="gc-success-msg">
            ✅ Submitted! You're on the leaderboard, {myEntry?.name}!
          </div>
        )}

        <div className="gc-divider" />

        {/* Live leaderboard */}
        <div className="gc-lb-header">
          <div className="gc-lb-title">🏅 Hall of Fame</div>
          <div className="gc-lb-tabs">
            <button 
              className={`gc-tab-btn ${sortBy === 'time' ? 'active' : ''}`}
              onClick={() => setSortBy('time')}
            >
              ⏱ Fastest
            </button>
            <button 
              className={`gc-tab-btn ${sortBy === 'score' ? 'active' : ''}`}
              onClick={() => setSortBy('score')}
            >
              💎 High Score
            </button>
          </div>
        </div>

        <div className="gc-lb-list">
          {boardLoading ? (
            <div className="gc-lb-loading">
              <div className="scanner-line" />
              <span>Scanning database...</span>
            </div>
          ) : sortedBoard.length === 0 ? (
            <div className="gc-lb-empty">No entries yet — be the first! 🚀</div>
          ) : (
            sortedBoard.map((entry, i) => {
              const { label, cls } = rankLabel(i);
              const isMe = myEntry && entry.name === myEntry.name &&
                           entry.completedAt === myEntry.completedAt;
              return (
                <div key={i} className={`gc-lb-row ${isMe ? 'highlight' : ''}`}>
                  <span className={`gc-rank ${cls}`}>{label}</span>
                  <span className="gc-lb-name">{entry.name}</span>
                  <span className="gc-lb-stars">
                    ⭐ {entry.totalStars ?? 0}
                  </span>
                  <span className="gc-lb-time">{fmtTime(entry.totalTimeSecs)}</span>
                </div>
              );
            })
          )}
        </div>

        {/* Actions */}
        <div className="gc-actions">
          <button
            id="gc-play-again-btn"
            className="gc-action-btn"
            onClick={onPlayAgain}
          >
            ↺ Play Again
          </button>
        </div>

      </div>
    </div>
  );
}
