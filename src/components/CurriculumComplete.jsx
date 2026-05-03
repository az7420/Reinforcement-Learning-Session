/**
 * CurriculumComplete.jsx
 * The final screen of the RL Seminar.
 * Celebrates completion and allows users to join the Hall of Fame.
 */

import React, { useState, useEffect } from 'react';
import { fetchLeaderboard, submitEntry } from '../services/leaderboard';
import '../styles/curriculumcomplete.css';

export default function CurriculumComplete({ onRestart }) {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [graduates, setGraduates] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGraduates();
  }, []);

  async function loadGraduates() {
    try {
      setLoading(true);
      const data = await fetchLeaderboard();
      // Sort by timestamp descending (newest first)
      const sorted = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
      setGraduates(sorted);
    } catch (e) {
      setError('Could not load graduates.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || submitted) return;

    try {
      setSubmitted(true);
      const newEntry = {
        name: name.trim(),
        date: new Date().toISOString(),
        score: Math.floor(Math.random() * 500) + 500, // Placeholder total score logic
      };
      const updated = await submitEntry(newEntry);
      if (updated) {
        setGraduates([...updated].sort((a, b) => new Date(b.date) - new Date(a.date)));
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="cc-screen">
      <div className="cc-container">
        <header className="cc-header">
          <div className="cc-badge">MISSION ACCOMPLISHED</div>
          <h1 className="cc-title">Nebula Graduate</h1>
          <p className="cc-subtitle">
            You have successfully navigated the complexities of Reinforcement Learning.
            Welcome to the elite circle of agents.
          </p>
        </header>

        <div className="cc-content-grid">
          {/* Submission Form */}
          <div className="cc-card submission-card">
            <h2>Join the Hall of Fame</h2>
            <p>Enter your handle to immortalize your training in the Nebula.</p>
            
            <form onSubmit={handleSubmit} className="cc-form">
              <input 
                type="text" 
                placeholder="User / Agent ID" 
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={15}
                disabled={submitted}
              />
              <button 
                type="submit" 
                className={`cc-btn primary ${submitted ? 'success' : ''}`}
                disabled={submitted || !name.trim()}
              >
                {submitted ? '✓ Joined' : 'Register Completion ✦'}
              </button>
            </form>

            <div className="cc-actions">
              <button className="cc-btn secondary" onClick={onRestart}>
                Restart Curriculum
              </button>
            </div>
          </div>

          {/* Recent Graduates List */}
          <div className="cc-card graduates-card">
            <div className="cc-grad-header">
              <h3>Recent Graduates</h3>
              <button className="cc-refresh" onClick={loadGraduates} disabled={loading}>
                {loading ? '...' : '↺'}
              </button>
            </div>

            <div className="cc-list">
              {loading && <div className="cc-info">Synchronizing database...</div>}
              {error && <div className="cc-error">{error}</div>}
              
              {!loading && graduates.length === 0 && (
                <div className="cc-info">Be the first to graduate the Nebula!</div>
              )}

              {graduates.map((grad, i) => (
                <div key={i} className="cc-item">
                  <div className="cc-item-left">
                    <span className="cc-rank">#{graduates.length - i}</span>
                    <span className="cc-name">{grad.name}</span>
                  </div>
                  <div className="cc-item-right">
                    <span className="cc-date">
                      {new Date(grad.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Background flare */}
      <div className="cc-flare" />
    </div>
  );
}
