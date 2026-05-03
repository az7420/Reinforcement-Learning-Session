/**
 * ScoreGraph.jsx
 * Real-time SVG line chart showing cumulative score over moves.
 * Looks like an actual RL training-reward curve — perfect for seminar context.
 * Pinned to bottom-right corner as a floating glass card.
 */

import React, { useMemo } from 'react';
import '../styles/scoregraph.css';

const W = 200; // viewBox width
const H = 80;  // viewBox height
const PAD = 10;

export default function ScoreGraph({ scoreHistory, visible }) {
  const points = useMemo(() => {
    if (!scoreHistory || scoreHistory.length < 2) return '';

    const xs = scoreHistory.map((_, i) => i);
    const ys = scoreHistory.map(s => s);

    const minX = 0;
    const maxX = Math.max(scoreHistory.length - 1, 1);
    const minY = Math.min(...ys, 0);
    const maxY = Math.max(...ys, 1);
    const rangeY = maxY - minY || 1;

    return scoreHistory.map((score, i) => {
      const px = PAD + ((i - minX) / (maxX - minX)) * (W - PAD * 2);
      const py = (H - PAD) - ((score - minY) / rangeY) * (H - PAD * 2);
      return `${px},${py}`;
    }).join(' ');
  }, [scoreHistory]);

  const lastScore = scoreHistory?.[scoreHistory.length - 1] ?? 0;
  const isPositive = lastScore >= 0;

  if (!visible || !scoreHistory || scoreHistory.length < 2) return null;

  return (
    <div className="score-graph-wrap">
      <div className="score-graph-label">
        <span>Score vs Moves</span>
        <span className={`score-graph-val ${isPositive ? 'pos' : 'neg'}`}>
          {isPositive ? '+' : ''}{lastScore}
        </span>
      </div>
      <svg
        className="score-graph-svg"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
      >
        {/* Zero line */}
        <line
          x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2}
          stroke="rgba(100,116,139,0.3)" strokeWidth="1" strokeDasharray="3,3"
        />
        {/* Area fill */}
        {points && (
          <polyline
            points={points}
            fill="none"
            stroke="url(#scoreGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {/* Gradient definition */}
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#818cf8" />
            <stop offset="50%"  stopColor="#34d399" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
        {/* Current dot */}
        {points && (() => {
          const last = points.split(' ').at(-1)?.split(',');
          if (!last) return null;
          return (
            <circle
              cx={last[0]} cy={last[1]} r="3.5"
              fill={isPositive ? '#34d399' : '#f87171'}
              filter="url(#glow)"
            />
          );
        })()}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
}
