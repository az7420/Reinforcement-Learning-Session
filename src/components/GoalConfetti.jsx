/**
 * GoalConfetti.jsx
 * CSS particle burst that fires when the player wins.
 * 30 coloured particles explode outward from screen-center.
 * Pure CSS — no external library needed.
 */

import React, { useMemo } from 'react';
import '../styles/confetti.css';

const COLORS = [
  '#818cf8', '#34d399', '#fbbf24', '#f472b6',
  '#38bdf8', '#a78bfa', '#fb923c', '#10b981',
];

export default function GoalConfetti({ active }) {
  const particles = useMemo(() => {
    return Array.from({ length: 36 }, (_, i) => {
      const angle  = (i / 36) * 360;
      const dist   = 80 + Math.random() * 160;
      const dx     = Math.cos((angle * Math.PI) / 180) * dist;
      const dy     = Math.sin((angle * Math.PI) / 180) * dist;
      const color  = COLORS[i % COLORS.length];
      const size   = 6 + Math.random() * 8;
      const delay  = Math.random() * 0.25;
      const dur    = 0.7 + Math.random() * 0.5;
      const shape  = i % 3 === 0 ? 'circle' : i % 3 === 1 ? 'rect' : 'star';

      return { dx, dy, color, size, delay, dur, shape, angle };
    });
  }, []);

  if (!active) return null;

  return (
    <div className="confetti-root" aria-hidden>
      {particles.map((p, i) => (
        <div
          key={i}
          className={`confetti-particle confetti-${p.shape}`}
          style={{
            '--dx':    `${p.dx}px`,
            '--dy':    `${p.dy}px`,
            '--color': p.color,
            width:     `${p.size}px`,
            height:    `${p.size}px`,
            animationDelay:    `${p.delay}s`,
            animationDuration: `${p.dur}s`,
          }}
        />
      ))}
    </div>
  );
}
