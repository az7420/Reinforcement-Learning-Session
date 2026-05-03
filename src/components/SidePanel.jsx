/**
 * SidePanel.jsx  (v3 — Bottom Modal)
 * RL Guide lives in a floating pill button (bottom-left).
 * Clicking opens a full-screen glassmorphism modal with a
 * two-column grid of concept cards and a legend strip.
 * Nothing is blocked; the modal can be dismissed at any time.
 */

import React, { useState } from 'react';
import '../styles/sidepanel.css';

const CONCEPTS = [
  {
    icon: '🤖',
    title: 'Agent',
    color: '#818cf8',
    short: 'The learner that makes decisions.',
    detail:
      `In this game, the glowing cube is the agent. It perceives the grid (environment) and chooses which direction to move. The agent's goal is to maximise total reward over time — just like an AI learning a task.`,
  },
  {
    icon: '🌍',
    title: 'Environment',
    color: '#34d399',
    short: 'The world the agent interacts with.',
    detail:
      `The 3D grid is the environment. It defines what states exist (tiles), what actions are possible (4 directions), and what reward the agent receives after each action. The environment responds to the agent's moves.`,
  },
  {
    icon: '🏆',
    title: 'Reward',
    color: '#fbbf24',
    short: 'Signal that tells the agent how well it did.',
    detail:
      'Reaching the green crystal gives +10 reward. Each step costs −1 (encouraging efficiency). Stepping on a red trap gives −10 (discouraging bad moves). The agent learns by chasing rewards and avoiding penalties.',
  },
  {
    icon: '⚡',
    title: 'Policy',
    color: '#f472b6',
    short: `The agent's strategy for choosing actions.`,
    detail:
      `A policy is a mapping from states to actions. Initially the agent explores randomly (trial & error). Over many episodes it discovers which moves lead to good outcomes — that's the learned policy. In real RL this is encoded in a Q-table or neural network.`,
  },
  {
    icon: '📈',
    title: 'Value Function',
    color: '#60a5fa',
    short: 'Expected future reward from a state.',
    detail:
      'Not every tile is equally good. Tiles near the goal have high value; tiles near traps have low value. A value function estimates long-term reward from each position, guiding the agent even before it reaches the goal.',
  },
  {
    icon: '🔁',
    title: 'Episode',
    color: '#a78bfa',
    short: 'One complete run from start to end.',
    detail:
      'An episode starts when the agent is placed at the start tile and ends when it reaches the goal or a trap. Each game round you play is one episode. Real RL agents run thousands of episodes to learn optimal behaviour.',
  },
  {
    icon: '🧠',
    title: 'Q-Learning',
    color: '#fb7185',
    short: 'Learning the value of action–state pairs.',
    detail:
      'Q-Learning stores a Q(s,a) value for every state-action pair. After each move it updates: Q(s,a) ← Q(s,a) + α[r + γ·max Q(s′,a′) − Q(s,a)]. The 🌡️ heatmap shows a BFS-approximated value surface — green = high value, red = low.',
  },
  {
    icon: '🎲',
    title: 'Explore vs Exploit',
    color: '#34d399',
    short: 'Balancing new moves vs known good ones.',
    detail:
      'Early in training an agent should explore (random moves) to discover rewards. Later it should exploit known good paths. The ε-greedy strategy picks a random action with probability ε, otherwise the best known action. The 💡 hint shows the greedy optimal choice.',
  },
];

const LEGEND = [
  { dot: 'dot-safe',    label: 'Safe tile' },
  { dot: 'dot-visited', label: 'Visited' },
  { dot: 'dot-trap',    label: 'Trap  −10' },
  { dot: 'dot-goal',    label: 'Goal  +10' },
  { dot: 'dot-coin',    label: 'Coin  +5' },
  { dot: 'dot-ice',     label: 'Ice  (slide)' },
  { dot: 'dot-warp',    label: 'Warp  (teleport)' },
  { dot: 'dot-boost',   label: 'Boost  (free move)' },
];

const HOTKEYS = [
  { key: 'H', label: 'AI Hint' },
  { key: 'Q', label: 'Heatmap' },
  { key: '↑↓←→', label: 'Move' },
];

export default function SidePanel() {
  const [open, setOpen]         = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [tab, setTab]           = useState('concepts'); // 'concepts' | 'legend'

  return (
    <>
      {/* ── Floating pill trigger ─────────────────────────────────── */}
      <button
        id="panel-toggle"
        className="rl-fab"
        onClick={() => setOpen(true)}
        title="Open RL Guide"
      >
        <span className="rl-fab-icon">📚</span>
        <span className="rl-fab-label">RL Guide</span>
      </button>

      {/* ── Modal backdrop ────────────────────────────────────────── */}
      {open && (
        <div className="rl-backdrop" onClick={() => { setOpen(false); setExpanded(null); }}>
          <div className="rl-modal" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="rl-modal-header">
              <div>
                <h2 className="rl-modal-title">Reinforcement Learning Guide</h2>
                <p className="rl-modal-sub">Learn the core ideas powering this simulation</p>
              </div>
              <button className="rl-close" onClick={() => { setOpen(false); setExpanded(null); }}>✕</button>
            </div>

            {/* Tabs */}
            <div className="rl-tabs">
              <button
                className={`rl-tab ${tab === 'concepts' ? 'active' : ''}`}
                onClick={() => setTab('concepts')}
              >🧩 Concepts</button>
              <button
                className={`rl-tab ${tab === 'legend' ? 'active' : ''}`}
                onClick={() => setTab('legend')}
              >🗺️ Legend & Keys</button>
            </div>

            {/* ── Concepts tab ── */}
            {tab === 'concepts' && (
              <div className="rl-concepts-grid">
                {CONCEPTS.map((c, i) => (
                  <div
                    key={i}
                    className={`rl-card ${expanded === i ? 'expanded' : ''}`}
                    style={{ '--accent': c.color }}
                    onClick={() => setExpanded(expanded === i ? null : i)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && setExpanded(expanded === i ? null : i)}
                  >
                    <div className="rl-card-top">
                      <span className="rl-card-icon">{c.icon}</span>
                      <div className="rl-card-titles">
                        <span className="rl-card-name">{c.title}</span>
                        <span className="rl-card-short">{c.short}</span>
                      </div>
                      <span className="rl-card-chevron">{expanded === i ? '▲' : '▼'}</span>
                    </div>
                    {expanded === i && (
                      <p className="rl-card-detail">{c.detail}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── Legend & Keys tab ── */}
            {tab === 'legend' && (
              <div className="rl-legend-tab">
                <div className="rl-legend-section">
                  <div className="rl-legend-heading">Tile Types</div>
                  <div className="rl-legend-grid">
                    {LEGEND.map((l, i) => (
                      <div key={i} className="rl-legend-row">
                        <span className={`dot ${l.dot}`} />
                        <span className="rl-legend-label">{l.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rl-legend-section">
                  <div className="rl-legend-heading">Keyboard Shortcuts</div>
                  <div className="rl-legend-grid">
                    {HOTKEYS.map((h, i) => (
                      <div key={i} className="rl-legend-row">
                        <span className="hotkey">{h.key}</span>
                        <span className="rl-legend-label">{h.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}
