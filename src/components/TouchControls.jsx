/**
 * TouchControls.jsx
 * On-screen D-pad for mobile/tablet users.
 */

import React from 'react';
import '../styles/touchcontrols.css';

export default function TouchControls({ onMove }) {
  const btn = (dx, dz, label, id) => (
    <button
      id={id}
      className="dpad-btn"
      onPointerDown={e => { e.preventDefault(); onMove(dx, dz); }}
    >
      {label}
    </button>
  );

  return (
    <div className="dpad-wrapper">
      <div className="dpad">
        <div className="dpad-row">{btn(0, -1, '▲', 'dpad-up')}</div>
        <div className="dpad-row">
          {btn(-1, 0, '◀', 'dpad-left')}
          <div className="dpad-center" />
          {btn(1, 0, '▶', 'dpad-right')}
        </div>
        <div className="dpad-row">{btn(0, 1, '▼', 'dpad-down')}</div>
      </div>
    </div>
  );
}
