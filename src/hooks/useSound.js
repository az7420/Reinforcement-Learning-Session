/**
 * useSound.js
 * Procedural sound effects using the Web Audio API.
 * No external audio files needed — everything is synthesised.
 */

import { useRef, useCallback } from 'react';

export function useSound() {
  const ctxRef = useRef(null);

  function getCtx() {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if suspended (browser autoplay policy)
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  }

  // Generic tone helper
  function playTone({ freq = 440, type = 'sine', duration = 0.18, gain = 0.3,
                      freqEnd = null, gainEnd = 0, startDelay = 0 }) {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const vol = ctx.createGain();
      osc.connect(vol);
      vol.connect(ctx.destination);

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startDelay);
      if (freqEnd !== null) {
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(freqEnd, 1), ctx.currentTime + startDelay + duration
        );
      }
      vol.gain.setValueAtTime(gain, ctx.currentTime + startDelay);
      vol.gain.exponentialRampToValueAtTime(
        Math.max(gainEnd, 0.001), ctx.currentTime + startDelay + duration
      );

      osc.start(ctx.currentTime + startDelay);
      osc.stop(ctx.currentTime + startDelay + duration + 0.02);
    } catch (_) {/* ignore in SSR or if AudioContext unavailable */}
  }

  const playStep = useCallback(() => {
    playTone({ freq: 320, type: 'triangle', duration: 0.1, gain: 0.12, gainEnd: 0 });
  }, []);

  const playCoin = useCallback(() => {
    // Rising chime
    playTone({ freq: 880,  type: 'sine', duration: 0.12, gain: 0.35, freqEnd: 1320, gainEnd: 0 });
    playTone({ freq: 1320, type: 'sine', duration: 0.18, gain: 0.25, gainEnd: 0, startDelay: 0.1 });
  }, []);

  const playTrap = useCallback(() => {
    // Low buzzy drop
    playTone({ freq: 220, type: 'sawtooth', duration: 0.35, gain: 0.4, freqEnd: 55, gainEnd: 0 });
  }, []);

  const playGoal = useCallback(() => {
    // Victory fanfare — 3 ascending notes
    playTone({ freq: 523.25, type: 'sine', duration: 0.18, gain: 0.4, gainEnd: 0 });
    playTone({ freq: 659.25, type: 'sine', duration: 0.18, gain: 0.4, gainEnd: 0, startDelay: 0.16 });
    playTone({ freq: 783.99, type: 'sine', duration: 0.35, gain: 0.5, gainEnd: 0, startDelay: 0.32 });
  }, []);

  const playWarp = useCallback(() => {
    // Whooshing sweep
    playTone({ freq: 200, type: 'sine', duration: 0.3, gain: 0.3, freqEnd: 800, gainEnd: 0 });
  }, []);

  const playIce = useCallback(() => {
    // Crystalline high ping
    playTone({ freq: 2200, type: 'sine', duration: 0.2, gain: 0.15, freqEnd: 1800, gainEnd: 0 });
  }, []);

  const playBoost = useCallback(() => {
    // Electric zap
    playTone({ freq: 440, type: 'square', duration: 0.14, gain: 0.25, freqEnd: 880, gainEnd: 0 });
  }, []);

  const playCombo = useCallback((multiplier) => {
    // Higher pitch the bigger the combo
    const base = 440 * (1 + (multiplier - 1) * 0.15);
    playTone({ freq: base, type: 'sine', duration: 0.25, gain: 0.4, freqEnd: base * 1.5, gainEnd: 0 });
  }, []);

  const playTimeout = useCallback(() => {
    playTone({ freq: 180, type: 'sawtooth', duration: 0.5, gain: 0.35, freqEnd: 60, gainEnd: 0 });
  }, []);

  return { playStep, playCoin, playTrap, playGoal, playWarp, playIce, playBoost, playCombo, playTimeout };
}
