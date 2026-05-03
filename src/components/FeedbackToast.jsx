/**
 * FeedbackToast.jsx  (v2)
 * Floating animated feedback. In AI mode, shows wider narration bar at top.
 */

import React from 'react';
import '../styles/feedback.css';

const COLOR_MAP = {
  goal:  'fb-goal',
  trap:  'fb-trap',
  coin:  'fb-coin',
  ice:   'fb-ice',
  warp:  'fb-warp',
  boost: 'fb-boost',
  step:  'fb-step',
};

export default function FeedbackToast({ feedback, isAIPlaying }) {
  if (!feedback) return null;

  const colorClass = COLOR_MAP[feedback.type] || 'fb-step';

  // AI narration: smaller text in a pill bar, shown under HUD top bar
  if (isAIPlaying) {
    return (
      <div key={feedback.id} className={`feedback-ai-bar ${colorClass}`}>
        <span className="fb-ai-label">🤖 AI</span>
        {feedback.text}
      </div>
    );
  }

  return (
    <div key={feedback.id} className={`feedback-toast ${colorClass}`}>
      {feedback.text}
    </div>
  );
}
