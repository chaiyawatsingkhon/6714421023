/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { GameState, GameOptions, DEFAULT_OPTIONS, PlayerStats } from "./types";
import TitleScreen from "./components/TitleScreen";
import GameCanvas from "./components/GameCanvas";
import HUD from "./components/HUD";
import EndingCutscene from "./components/EndingCutscene";
import { playRetroSound } from "./utils/audio";
import { Skull, RotateCcw, Home, Award } from "lucide-react";

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.TITLE);
  const [options, setOptions] = useState<GameOptions>(DEFAULT_OPTIONS);
  
  // Dynamic stats initialized based on chosen difficulty settings
  const [stats, setStats] = useState<PlayerStats>({
    hp: 5,
    maxHp: 5,
    score: 0,
    kills: 0,
    potionsCollected: 0,
  });

  const getStartingHpForDifficulty = (diff: "EASY" | "NORMAL" | "HARD") => {
    if (diff === "EASY") return 8;
    if (diff === "HARD") return 3;
    return 5; // NORMAL
  };

  const handleStartGame = () => {
    const startingHp = getStartingHpForDifficulty(options.difficulty);
    setStats({
      hp: startingHp,
      maxHp: startingHp,
      score: 0,
      kills: 0,
      potionsCollected: 0,
    });
    setGameState(GameState.PLAYING);
    if (options.soundEnabled) {
      playRetroSound("victory");
    }
  };

  const handleReturnToTitle = () => {
    setGameState(GameState.TITLE);
    if (options.soundEnabled) {
      playRetroSound("victory");
    }
  };

  const handleGameOver = () => {
    setGameState(GameState.GAMEOVER);
    if (options.soundEnabled) {
      playRetroSound("hit");
    }
  };

  const handleVictoryTransition = () => {
    setGameState(GameState.ENDING);
    if (options.soundEnabled) {
      playRetroSound("victory");
    }
  };

  const handleTriggerSound = (type: "attack" | "hit" | "heal" | "dash" | "boss_shoot" | "victory") => {
    if (options.soundEnabled) {
      playRetroSound(type);
    }
  };

  // Virtual attack button handler from HUD
  const handleHUDAttack = () => {
    if ((window as any).triggerInGameAttack) {
      (window as any).triggerInGameAttack();
    }
  };

  return (
    <main className="w-full h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center relative overflow-hidden font-sans select-none">
      {/* 1. TITLE SCREEN */}
      {gameState === GameState.TITLE && (
        <TitleScreen
          options={options}
          setOptions={setOptions}
          onStartGame={handleStartGame}
        />
      )}

      {/* 2. PLAYING GAMEPLAY STATE */}
      {gameState === GameState.PLAYING && (
        <div className="w-full h-full relative">
          <GameCanvas
            options={options}
            stats={stats}
            setStats={setStats}
            onGameOver={handleGameOver}
            onVictory={handleVictoryTransition}
            triggerSound={handleTriggerSound}
          />
          <HUD
            stats={stats}
            boss={stats.kills >= 10 ? { position: { x: 0, y: 1.8, z: -10 }, hp: stats.kills >= 10 ? 40 : 0, maxHp: 40, speed: 2.2, state: "IDLE", stateTimer: 0, patternStep: 0, scaleFactor: 1, isFlashingRed: false, flashTimer: 0 } : null}
            options={options}
            onPause={handleReturnToTitle}
            onAttack={handleHUDAttack}
          />
        </div>
      )}

      {/* 3. GAME OVER SCREEN POPUP OVERLAY */}
      {gameState === GameState.GAMEOVER && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="relative mb-6">
            <div className="absolute -inset-1 rounded-full bg-red-500 opacity-40 blur-lg animate-pulse" />
            <div className="relative w-20 h-20 bg-red-950 border border-red-500/40 rounded-full flex items-center justify-center text-red-500 shadow-xl">
              <Skull className="w-10 h-10 animate-bounce" />
            </div>
          </div>

          <div className="text-center space-y-2 mb-8">
            <h2 className="text-4xl font-black text-rose-500 tracking-tight uppercase">Game Over</h2>
            <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">
              You Fought Valiantly, But Perished
            </p>
          </div>

          {/* Score breakdown stats card */}
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-2xl mb-8 space-y-3.5">
            <h3 className="text-slate-200 font-bold text-sm border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-sky-400" /> Fight Statistics
            </h3>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Enemies Defeated</span>
              <span className="font-mono font-bold text-white text-base">{stats.kills}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Potions Collected</span>
              <span className="font-mono font-bold text-emerald-400 text-base">{stats.potionsCollected}</span>
            </div>

            <div className="h-px bg-slate-800" />

            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Final Score</span>
              <span className="font-mono font-black text-xl text-sky-400">
                {stats.score}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
            <button
              onClick={handleStartGame}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all shadow-[0_4px_16px_rgba(244,63,94,0.3)] cursor-pointer text-sm uppercase tracking-wider scale-100 hover:scale-[1.03]"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>

            <button
              onClick={handleReturnToTitle}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white font-medium rounded-xl transition-all cursor-pointer text-sm uppercase tracking-wider"
            >
              <Home className="w-4 h-4" />
              Main Menu
            </button>
          </div>
        </div>
      )}

      {/* 4. ENDING CUTSCENE */}
      {gameState === GameState.ENDING && (
        <EndingCutscene
          stats={stats}
          onReturnToTitle={handleReturnToTitle}
        />
      )}
    </main>
  );
}

