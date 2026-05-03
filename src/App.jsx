/**
 * App.jsx  (v4)
 * NEW: AI Watch Mode, Live Score Graph, Goal Confetti.
 */

import React, { useEffect, useRef } from 'react';
import HUD from './components/HUD';
import SidePanel from './components/SidePanel';
import FeedbackToast from './components/FeedbackToast';
import LevelComplete from './components/LevelComplete';
import TouchControls from './components/TouchControls';
import ScoreGraph from './components/ScoreGraph';
import GoalConfetti from './components/GoalConfetti';
import GameScene from './components/GameScene';
import LevelSelect from './components/LevelSelect';
import LearningHub from './components/LearningHub';
import GreedyBandit from './components/GreedyBandit';
import GlitchRunner from './components/GlitchRunner';
import NeonSerpent from './components/NeonSerpent';
import CurriculumComplete from './components/CurriculumComplete';
import { LEVELS, parseLevel } from './data/LEVELS';
import { useGameState } from './hooks/useGameState';
import { useKeyboard } from './hooks/useKeyboard';
import { useSound } from './hooks/useSound';
import { useAutoPlay } from './hooks/useAutoPlay';
import './styles/app.css';
import './styles/placeholder.css';

export default function App() {
  const gameState = useGameState();
  const {
    screen, setScreen,
    startLevel, nextLevel, restart,
    levelIndex, currentLevel,
    grid, gridSize, goalPos,
    playerPos, gameStatus,
    score, moves, timeLeft,
    feedback, path, isReplaying,
    boostActive, coinsCollected,
    levelResult, progress, unlockedCount,
    move, replayPath,
    combo, showHeatmap, showHint,
    toggleHeatmap, toggleHint,
    scoreHistory,
    isAIPlaying, setIsAIPlaying,
    showFeedbackExternal,
    setGrid, setPath, setPlayerPos,
    // curriculum
    currentModuleId, setCurrentModuleId,
    completedModules, completeModule,
  } = gameState;

  const {
    playStep, playCoin, playTrap, playGoal,
    playWarp, playIce, playBoost, playCombo, playTimeout,
  } = useSound();


  // ── AI Auto-Play ──────────────────────────────────────────────────────────
  const { startAutoPlay, stopAutoPlay } = useAutoPlay({
    grid, gridSize, goalPos,
    setPlayerPos, setGrid, setPath,
    showFeedbackExternal,
    onComplete: () => setIsAIPlaying(false),
  });

  const handleWatchAI = () => {
    if (isAIPlaying) { stopAutoPlay(); setIsAIPlaying(false); return; }
    setIsAIPlaying(true);
    showFeedbackExternal('🤖 AI Analysing…', 'boost');
    const lvl  = LEVELS[levelIndex];
    const data = parseLevel(lvl);
    setPlayerPos(data.startPos);
    setGrid(data.grid.map(t => ({ ...t, visited: false, collected: false })));
    setPath([data.startPos]);
    setTimeout(() => startAutoPlay(data.startPos), 700);
  };

  const handleSelectModule = (moduleId) => {
    setCurrentModuleId(moduleId);
    setScreen(moduleId);
  };

  // ── Wire feedback → sound ─────────────────────────────────────────────────
  useEffect(() => {
    if (!feedback) return;
    switch (feedback.type) {
      case 'coin':  playCoin();  break;
      case 'trap':  playTrap();  break;
      case 'goal':  playGoal();  break;
      case 'warp':  playWarp();  break;
      case 'ice':   playIce();   break;
      case 'boost': playBoost(); break;
      default:      playStep();  break;
    }
    if (combo >= 3 && feedback.type !== 'trap') playCombo(combo);
  }, [feedback]); // eslint-disable-line

  useEffect(() => {
    if (gameStatus === 'timeout') playTimeout();
  }, [gameStatus]); // eslint-disable-line

  // ── Keyboard ──────────────────────────────────────────────────────────────
  useKeyboard(
    screen === 'game' && !isAIPlaying ? move : () => {},
    screen === 'game' ? toggleHint     : null,
    screen === 'game' ? toggleHeatmap  : null,
    screen === 'game'
  );

  // ── Curriculum Hub ────────────────────────────────────────────────────────
  if (screen === 'hub') {
    return (
      <div className="screen-transition">
        <LearningHub 
          currentModuleId={currentModuleId}
          completedModules={completedModules}
          onSelectModule={handleSelectModule}
        />
      </div>
    );
  }

  // ── Module 01: The Greedy Bandit ──────────────────────────────────────────
  if (screen === 'bandit') {
    return (
      <div className="screen-transition">
        <GreedyBandit 
          onComplete={(id) => {
            completeModule(id);
            setScreen('hub');
          }}
          onBack={() => setScreen('hub')}
        />
      </div>
    );
  }

  // ── Curriculum Complete (Hall of Fame) ────────────────────────────────────
  if (screen === 'complete') {
    return (
      <div className="screen-transition">
        <CurriculumComplete onRestart={() => window.location.reload()} />
      </div>
    );
  }

  // ── Module 03: The Glitch Runner ──────────────────────────────────────────
  if (screen === 'glitch') {
    return (
      <div className="screen-transition">
        <GlitchRunner 
          onComplete={(id) => {
            completeModule(id);
            setScreen('hub');
          }}
          onBack={() => setScreen('hub')}
        />
      </div>
    );
  }

  // ── Module 03: Neon Serpent ───────────────────────────────────────────────
  if (screen === 'snake') {
    return (
      <div className="screen-transition">
        <NeonSerpent 
          onComplete={(id) => {
            completeModule(id);
            setScreen('complete');
          }}
          onBack={() => setScreen('hub')}
        />
      </div>
    );
  }

  // ── Default Fallback ───────────────────────────────────────────────────────
  return (
    <div className="app-root">
       <div className="placeholder-full" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#04020e', color: '#fff'}}>
         <h1>Reinforcement Learning Hub Initializing...</h1>
       </div>
    </div>
  );
}
