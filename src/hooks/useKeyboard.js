/**
 * useKeyboard.js
 * Listens for arrow key presses and calls the move callback.
 * Also handles H (hint), Q (heatmap) toggle hotkeys.
 * Prevents default scrolling behaviour on arrow keys.
 */

import { useEffect } from 'react';

const KEY_MAP = {
  ArrowUp:    { dx:  0, dz: -1 },
  ArrowDown:  { dx:  0, dz:  1 },
  ArrowLeft:  { dx: -1, dz:  0 },
  ArrowRight: { dx:  1, dz:  0 },
  w: { dx:  0, dz: -1 }, W: { dx:  0, dz: -1 },
  s: { dx:  0, dz:  1 }, S: { dx:  0, dz:  1 },
  a: { dx: -1, dz:  0 }, A: { dx: -1, dz:  0 },
  d: { dx:  1, dz:  0 }, D: { dx:  1, dz:  0 },
};

export function useKeyboard(moveFn, toggleHint, toggleHeatmap, enabled = true) {
  useEffect(() => {
    function handleKey(e) {
      if (!enabled) return;

      const target = e.target;
      const tagName = target?.tagName;
      if (target?.isContentEditable || tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') {
        return;
      }

      const dir = KEY_MAP[e.key];
      if (dir) {
        e.preventDefault();
        moveFn(dir.dx, dir.dz);
        return;
      }
      if (e.key === 'h' || e.key === 'H') { toggleHint?.(); return; }
      if (e.key === 'q' || e.key === 'Q') { toggleHeatmap?.(); return; }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [moveFn, toggleHint, toggleHeatmap, enabled]);
}
