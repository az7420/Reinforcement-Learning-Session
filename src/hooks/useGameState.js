/**
 * useGameState.js  (v3 — combos, heatmap, hint)
 * Handles: level progression, timer, stars, special tiles,
 *          coins, boost, ice sliding, warp teleport, localStorage scores.
 *          NEW: combo streak multiplier, Q-heatmap toggle, AI hint toggle.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { LEVELS, parseLevel } from '../data/LEVELS';

// ── Scoring constants ─────────────────────────────────────────────────────
const REWARD_GOAL    =  10;
const PENALTY_TRAP   = -10;
const COST_PER_STEP  =  -1;
const REWARD_COIN    =   5;
const TIME_BONUS_PER_SEC = 2;

// ── Persistence: Disabled (Session only) ──────────────────────────────────

// ── Stars calculation ─────────────────────────────────────────────────────
function calcStars(moves, par) {
  if (moves <= par)              return 3;  // perfect / efficient
  if (moves <= Math.floor(par * 2)) return 2;  // decent
  return 1;                                     // completed
}

// ── Main Hook ─────────────────────────────────────────────────────────────
export function useGameState() {
  // ── Screen: 'hub' | 'select' | 'game' | 'bandit' ────────────────────────
  const [screen, setScreen] = useState('hub');

  // ── Curriculum State ─────────────────────────────────────────────────────
  const [currentModuleId, setCurrentModuleId] = useState('bandit');
  const [completedModules, setCompletedModules] = useState([]);

  // ── Level index (0-based) ───────────────────────────────────────────────
  const [levelIndex, setLevelIndex] = useState(0);

  // ── Parsed level data ────────────────────────────────────────────────────
  const [levelData, setLevelData] = useState(() => parseLevel(LEVELS[0]));

  // ── Dynamic grid (mutable visited/collected flags) ───────────────────────
  const [grid, setGrid] = useState(levelData.grid);

  // ── Player position ──────────────────────────────────────────────────────
  const [playerPos, setPlayerPos] = useState(levelData.startPos);

  // ── Scores / counters ────────────────────────────────────────────────────
  const [score, setScore]         = useState(0);
  const [moves, setMoves]         = useState(0);
  const movesRef                  = useRef(0); // always-current ref to avoid stale closures
  const scoreRef                  = useRef(0);
  const [coinsCollected, setCoinsCollected] = useState(0);

  // ── Timer ────────────────────────────────────────────────────────────────
  const [timeLeft, setTimeLeft]   = useState(LEVELS[0].timeLimit);
  const timerRef                  = useRef(null);

  // ── Game status: 'playing' | 'won' | 'lost' | 'timeout' ─────────────────
  const [gameStatus, setGameStatus] = useState('playing');

  // ── Special state ─────────────────────────────────────────────────────────
  const [boostActive, setBoostActive] = useState(false); // free next move
  const [lastWarpDest, setLastWarpDest] = useState(null); // prevent warp loop

  // ── Feedback toast ────────────────────────────────────────────────────────
  const [feedback, setFeedback] = useState(null);
  const feedbackTimer           = useRef(null);

  // ── Path history ─────────────────────────────────────────────────────────
  const [path, setPath]         = useState([levelData.startPos]);

  // ── Replay ────────────────────────────────────────────────────────────────
  const [isReplaying, setIsReplaying] = useState(false);
  const replayTimer                   = useRef(null);

  // ── Session-only scores (cleared on page refresh) ────────────────────────
  const [progress, setProgress] = useState({});

  const [unlockedCount, setUnlockedCount] = useState(1);

  // ── Level complete result ──────────────────────────────────────────────────
  const [levelResult, setLevelResult] = useState(null);
  // { stars, score, timeBonus, coinsBonus, moves, isNewBest }

  // ── Combo streak (consecutive "good" moves: coins / boosts / no-trap) ────
  const [combo, setCombo]       = useState(0);
  const comboRef                = useRef(0);

  // ── Score history for the reward-curve graph ────────────────────────────
  const [scoreHistory, setScoreHistory] = useState([0]);

  // ── AI auto-play ─────────────────────────────────────────────────────────
  const [isAIPlaying, setIsAIPlaying] = useState(false);

  // ── UI toggles ────────────────────────────────────────────────────────────
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showHint,    setShowHint]    = useState(false);

  // ── Curriculum Helpers ───────────────────────────────────────────────────
  const completeModule = useCallback((moduleId) => {
    setCompletedModules(prev => {
      if (prev.includes(moduleId)) return prev;
      return [...prev, moduleId];
    });
  }, []);


  // ─────────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────────

  function showFeedback(text, type) {
    clearTimeout(feedbackTimer.current);
    setFeedback({ text, type, id: Date.now() });
    feedbackTimer.current = setTimeout(() => setFeedback(null), 1800);
  }

  function startTimer(seconds) {
    clearInterval(timerRef.current);
    setTimeLeft(seconds);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setGameStatus('timeout');
          showFeedback('⏰ Time Up!', 'trap');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerRef.current);
  }

  // Mark tile visited and handle collection
  function processTile(x, z, currentScore, currentMoves, isBoost) {
    let delta = isBoost ? 0 : COST_PER_STEP;
    let newStatus = null;
    let feedbackText = isBoost ? '⚡ Free Move!' : `${COST_PER_STEP} Step`;
    let feedbackType = isBoost ? 'boost' : 'step';
    let teleportTo = null;
    let iceSlide = false;
    let newBoostActive = false;

    const tile = levelData.grid.find(t => t.x === x && t.z === z);
    if (!tile) return null;

    const isGoal = (x === levelData.goalPos.x && z === levelData.goalPos.z);

    if (isGoal) {
      delta += REWARD_GOAL;
      newStatus = 'won';
      feedbackText = `+${REWARD_GOAL} Goal! 🏆`;
      feedbackType = 'goal';
    } else {
      switch (tile.type) {
        case 'trap':
          delta += PENALTY_TRAP;
          newStatus = 'lost';
          feedbackText = `${PENALTY_TRAP} Trap! 💀`;
          feedbackType = 'trap';
          break;

        case 'coin':
          // Only collect once
          setGrid(g => g.map(t =>
            t.x === x && t.z === z ? { ...t, collected: true } : t
          ));
          // Check if already collected
          const gridTile = grid.find(t => t.x === x && t.z === z);
          if (!gridTile?.collected) {
            delta += REWARD_COIN;
            setCoinsCollected(c => c + 1);
            feedbackText = `+${REWARD_COIN} Coin! 🪙`;
            feedbackType = 'coin';
          }
          break;

        case 'ice':
          iceSlide = true;
          feedbackText = '🧊 Ice! Sliding...';
          feedbackType = 'ice';
          break;

        case 'warp': {
          const warpKey = `${x},${z}`;
          const dest = levelData.warpPairs[warpKey];
          if (dest && !(dest.x === lastWarpDest?.x && dest.z === lastWarpDest?.z)) {
            teleportTo = dest;
            feedbackText = '🌀 Warped!';
            feedbackType = 'warp';
          }
          break;
        }

        case 'boost':
          newBoostActive = true;
          feedbackText = '⚡ Boost! Next move free!';
          feedbackType = 'boost';
          break;

        default:
          break;
      }
    }

    return { delta, newStatus, feedbackText, feedbackType, teleportTo, iceSlide, newBoostActive };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Load a level
  // ─────────────────────────────────────────────────────────────────────────
  function loadLevel(index) {
    stopTimer();
    clearTimeout(replayTimer.current);

    const lvl  = LEVELS[index];
    if (!lvl) {
      console.error('Level not found at index:', index);
      setScreen('hub');
      return;
    }
    const data = parseLevel(lvl);

    setLevelIndex(index);
    setLevelData(data);
    setGrid(data.grid.map(t => ({ ...t, visited: false, collected: false })));
    setPlayerPos(data.startPos);
    setScore(0);
    setMoves(0);
    movesRef.current = 0;
    scoreRef.current = 0;
    setCoinsCollected(0);
    setTimeLeft(lvl.timeLimit);
    setGameStatus('playing');
    setFeedback(null);
    setPath([data.startPos]);
    setIsReplaying(false);
    setBoostActive(false);
    setLastWarpDest(null);
    setLevelResult(null);
    setCombo(0);
    comboRef.current = 0;
    setShowHint(false);
    setScoreHistory([0]);
    setIsAIPlaying(false);

    // Mark start as visited
    setTimeout(() => {
      setGrid(g => g.map(t =>
        t.x === data.startPos.x && t.z === data.startPos.z
          ? { ...t, visited: true }
          : t
      ));
    }, 50);

    startTimer(lvl.timeLimit);
  }

  // Start the game from level select
  const startLevel = useCallback((index) => {
    setScreen('game');
    loadLevel(index);
  }, [loadLevel, setScreen]); 

  // ─────────────────────────────────────────────────────────────────────────
  // Move player
  // ─────────────────────────────────────────────────────────────────────────
  const move = useCallback((dx, dz) => {
    if (gameStatus !== 'playing' || isReplaying) return;

    // ── Compute next position without touching state ──────────────────────
    const nx = playerPos.x + dx;
    const nz = playerPos.z + dz;

    if (nx < 0 || nx >= levelData.size || nz < 0 || nz >= levelData.size) return;

    const result = processTile(nx, nz, score, moves, boostActive);
    if (!result) return;

    const { delta, newStatus, feedbackText, feedbackType, teleportTo, iceSlide, newBoostActive } = result;

    // ── Combo streak ─────────────────────────────────────────────────────
    let comboBonus = 0;
    if (newStatus === 'lost' || feedbackType === 'trap') {
      comboRef.current = 0;
      setCombo(0);
    } else {
      comboRef.current += 1;
      setCombo(comboRef.current);
      if (comboRef.current >= 3) {
        comboBonus = Math.floor(comboRef.current / 3) * 2;
      }
    }

    // ── Score / moves — sync via refs so win-handler reads fresh values ───
    const newScore = scoreRef.current + delta + comboBonus;
    scoreRef.current = newScore;
    movesRef.current += 1;

    // ── Flat state updates (no nesting) ───────────────────────────────────
    setPlayerPos({ x: nx, z: nz });
    setGrid(g => g.map(t => t.x === nx && t.z === nz ? { ...t, visited: true } : t));
    setScore(newScore);
    setScoreHistory(h => [...h, newScore]);
    setMoves(movesRef.current);
    setBoostActive(newBoostActive);
    setLastWarpDest(null);
    setPath(p => [...p, { x: nx, z: nz }]);
    showFeedback(
      comboBonus > 0 ? `${feedbackText}  🔥×${comboRef.current}` : feedbackText,
      feedbackType
    );

    // ── Win / lose ────────────────────────────────────────────────────────
    if (newStatus === 'won') {
      stopTimer();
      const finalMoves = movesRef.current;
      const finalScore = scoreRef.current;
      const tb    = timeLeft * TIME_BONUS_PER_SEC;
      const total = finalScore + tb;
      const stars = calcStars(finalMoves, LEVELS[levelIndex].par);

      const prevBest  = progress[levelIndex + 1] || {};
      const isNewBest = stars > (prevBest.stars || 0) || total > (prevBest.score || -Infinity);
      // Unlock the NEXT level
      const nextUnlocked = Math.min(levelIndex + 2, LEVELS.length); // +2: 0-based+1 then +1
      setUnlockedCount(nextUnlocked);

      setProgress(prev => {
        const existing = prev[levelIndex + 1] || {};
        if (stars > (existing.stars || 0) || total > (existing.score || -Infinity)) {
          return { ...prev, [levelIndex + 1]: { stars, score: total, moves: finalMoves } };
        }
        return prev;
      });

      // ── Accumulate session totals (optional, keeping for logic but no UI) ───
      // ── If this was the LAST level → Module Complete! ───────────────────
      const isLastLevel = levelIndex === LEVELS.length - 1;

      setTimeout(() => {
        setGameStatus('won');
        setLevelResult({
          stars,
          baseScore: finalScore,
          timeBonus: tb,
          totalScore: total,
          moves: finalMoves,
          isNewBest,
          timeLeft,
          isLastLevel,
        });
      }, 600);
    } else if (newStatus === 'lost') {
      stopTimer();
      setTimeout(() => setGameStatus('lost'), 600);
    }

    // ── Ice slide (delayed second step) ──────────────────────────────────
    if (iceSlide) {
      const nx2 = nx + dx;
      const nz2 = nz + dz;
      if (nx2 >= 0 && nx2 < levelData.size && nz2 >= 0 && nz2 < levelData.size) {
        setTimeout(() => {
          setPlayerPos({ x: nx2, z: nz2 });
          setGrid(g => g.map(t => t.x === nx2 && t.z === nz2 ? { ...t, visited: true } : t));
          setPath(p => [...p, { x: nx2, z: nz2 }]);
        }, 200);
      }
    }

    // ── Warp teleport (delayed) ───────────────────────────────────────────
    if (teleportTo) {
      setLastWarpDest(teleportTo);
      setTimeout(() => {
        setPlayerPos(teleportTo);
        setGrid(g => g.map(t => t.x === teleportTo.x && t.z === teleportTo.z ? { ...t, visited: true } : t));
        setPath(p => [...p, teleportTo]);
      }, 250);
    }
  }, [gameStatus, isReplaying, playerPos, levelData, score, moves, boostActive, levelIndex, lastWarpDest, timeLeft, progress]); // eslint-disable-line

  // ─────────────────────────────────────────────────────────────────────────
  // Restart current level
  // ─────────────────────────────────────────────────────────────────────────
  const restart = useCallback(() => {
    loadLevel(levelIndex);
  }, [levelIndex]); // eslint-disable-line

  // ─────────────────────────────────────────────────────────────────────────
  // Go to next level
  // ─────────────────────────────────────────────────────────────────────────
  const nextLevel = useCallback(() => {
    const next = levelIndex + 1;
    if (next < LEVELS.length) {
      loadLevel(next);
    } else {
      setScreen('hub'); 
    }
  }, [levelIndex, setScreen]); 

  // ─────────────────────────────────────────────────────────────────────────
  // Replay path
  // ─────────────────────────────────────────────────────────────────────────
  const replayPath = useCallback(() => {
    if (path.length < 2) return;
    setIsReplaying(true);
    setPlayerPos(path[0]);
    let step = 0;
    function tick() {
      step++;
      if (step >= path.length) { setIsReplaying(false); setPlayerPos(path[path.length - 1]); return; }
      setPlayerPos(path[step]);
      replayTimer.current = setTimeout(tick, 450);
    }
    replayTimer.current = setTimeout(tick, 300);
  }, [path]);

  // ─────────────────────────────────────────────────────────────────────────
  // Cleanup on unmount
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopTimer();
      clearTimeout(feedbackTimer.current);
      clearTimeout(replayTimer.current);
    };
  }, []);

  const toggleHeatmap = useCallback(() => setShowHeatmap(h => !h), []);
  const toggleHint    = useCallback(() => setShowHint(h => !h), []);

  // Expose showFeedback for AI auto-play narration
  const showFeedbackExternal = useCallback((text, type) => showFeedback(text, type), []);

  return {
    // navigation
    screen, setScreen,
    startLevel,
    nextLevel,
    // level info
    levelIndex,
    currentLevel: LEVELS[levelIndex],
    gridSize: levelData.size,
    goalPos:  levelData.goalPos,
    warpPairs: levelData.warpPairs,
    // state
    grid,
    playerPos,
    score,
    moves,
    timeLeft,
    gameStatus,
    feedback,
    path,
    isReplaying,
    boostActive,
    coinsCollected,
    levelResult,
    progress,
    unlockedCount,   // reactive — updates when a level is beaten
    // extras
    combo,
    showHeatmap,
    showHint,
    scoreHistory,
    isAIPlaying, setIsAIPlaying,
    // actions
    move,
    restart,
    replayPath,
    toggleHeatmap,
    toggleHint,
    showFeedbackExternal,
    // grid setters for AI
    setGrid,
    setPath,
    setPlayerPos,
    // ── Curriculum ──
    currentModuleId, setCurrentModuleId,
    completedModules, completeModule,
  };
}
