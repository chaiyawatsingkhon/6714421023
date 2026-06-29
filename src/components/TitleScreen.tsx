/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { GameOptions } from "../types";
import { Settings, Play, Shield, HelpCircle, Keyboard, Volume2, VolumeX } from "lucide-react";

interface TitleScreenProps {
  options: GameOptions;
  setOptions: (options: GameOptions) => void;
  onStartGame: () => void;
}

export default function TitleScreen({ options, setOptions, onStartGame }: TitleScreenProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  return (
    <div className="relative w-full h-screen bg-slate-950 flex flex-col items-center justify-between p-6 md:p-12 overflow-hidden select-none">
      {/* Background visual detail */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.5)_2px,transparent_2px),linear-gradient(90deg,rgba(15,23,42,0.5)_2px,transparent_2px)] bg-[size:32px_32px] pointer-events-none opacity-40" />

      {/* Grid movement backdrop effect */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_bottom,transparent,rgba(15,23,42,0.9))] border-t border-sky-500/10 pointer-events-none overflow-hidden">
        <div className="w-full h-full opacity-10 bg-[linear-gradient(transparent_50%,rgba(0,191,255,0.25)_50%)] bg-[size:100%_4px]" />
      </div>

      {/* Top Bar */}
      <div className="w-full flex justify-between items-center z-10">
        <div className="flex items-center gap-2 text-sky-400 font-mono text-xs tracking-wider">
          <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
          SYSTEM_ONLINE_V1.0
        </div>
        <button
          onClick={() => setShowHowToPlay(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-all text-xs font-medium cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
          How to Play
        </button>
      </div>

      {/* Game Logo & Main Content */}
      <div className="flex flex-col items-center justify-center flex-1 max-w-xl w-full z-10 my-4 text-center">
        {/* Animated logo container */}
        <div className="relative group mb-8">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 opacity-30 blur-xl group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
          <img
            src="https://res.cloudinary.com/dsucg33fv/image/upload/v1782709347/logo_i8827v.png"
            alt="RPG Game Logo"
            className="relative max-h-40 md:max-h-56 object-contain drop-shadow-[0_8px_16px_rgba(56,189,248,0.4)] animate-bounce [animation-duration:5s]"
            referrerPolicy="no-referrer"
          />
        </div>

        <p className="text-slate-400 text-sm md:text-base mb-10 leading-relaxed font-sans max-w-md">
          A thrilling 2.5D action RPG. Stand firm against the endless swarm, grab power-ups, defeat the giant Boss, and escape the dungeon.
        </p>

        {/* Core Menu Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full px-4 sm:px-0 sm:max-w-md">
          <button
            onClick={onStartGame}
            className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-sky-500 hover:bg-sky-400 hover:scale-[1.03] text-slate-950 font-bold rounded-xl transition-all shadow-[0_4px_20px_rgba(56,189,248,0.4)] cursor-pointer hover:shadow-[0_4px_24px_rgba(56,189,248,0.6)] text-base uppercase tracking-wider"
          >
            <Play className="w-5 h-5 fill-current" />
            Enter Game
          </button>

          <button
            onClick={() => setShowOptions(true)}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-900/90 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl transition-all cursor-pointer text-base"
          >
            <Settings className="w-5 h-5" />
            Options
          </button>
        </div>
      </div>

      {/* Footer info */}
      <div className="z-10 text-center font-mono text-[10px] md:text-xs text-slate-600 tracking-wider">
        CONTROLS: {options.controlType === "WASD" ? "W, A, S, D" : "ARROW KEYS"} TO MOVE • [{options.attackKey}] TO ATTACK
      </div>

      {/* OPTIONS MODAL */}
      {showOptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 font-sans">
              <Settings className="w-5 h-5 text-sky-400" />
              Game Options
            </h3>

            <div className="space-y-6">
              {/* Controls Setting */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Movement Keys
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOptions({ ...options, controlType: "WASD" })}
                    className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      options.controlType === "WASD"
                        ? "bg-sky-500/10 border-sky-500 text-sky-400"
                        : "bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Keyboard className="w-4 h-4" />
                    WASD Keys
                  </button>
                  <button
                    onClick={() => setOptions({ ...options, controlType: "ARROW_KEYS" })}
                    className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      options.controlType === "ARROW_KEYS"
                        ? "bg-sky-500/10 border-sky-500 text-sky-400"
                        : "bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Keyboard className="w-4 h-4" />
                    Arrow Keys
                  </button>
                </div>
              </div>

              {/* Attack Button Setting */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Attack Key (G / Space / F)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["SPACE", "G", "F"].map((key) => (
                    <button
                      key={key}
                      onClick={() => setOptions({ ...options, attackKey: key as any })}
                      className={`py-2.5 px-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                        options.attackKey === key
                          ? "bg-sky-500/10 border-sky-500 text-sky-400"
                          : "bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400"
                      }`}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Setting */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Difficulty (Player Health)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["EASY", "NORMAL", "HARD"] as const).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setOptions({ ...options, difficulty: diff })}
                      className={`py-2 px-1 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                        options.difficulty === diff
                          ? "bg-sky-500/10 border-sky-500 text-sky-400"
                          : "bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400"
                      }`}
                    >
                      {diff === "EASY" ? "Easy (8 HP)" : diff === "NORMAL" ? "Normal (5 HP)" : "Hard (3 HP)"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Audio Option */}
              <div className="flex items-center justify-between py-2 border-t border-slate-800/80 mt-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-200">Sound Effects</span>
                  <span className="text-xs text-slate-500">Enable in-game dynamic retro sound synthesis</span>
                </div>
                <button
                  onClick={() => setOptions({ ...options, soundEnabled: !options.soundEnabled })}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    options.soundEnabled
                      ? "bg-sky-500/10 border-sky-500 text-sky-400 hover:bg-sky-500/20"
                      : "bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400"
                  }`}
                >
                  {options.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowOptions(false)}
              className="w-full mt-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-all cursor-pointer text-sm"
            >
              Apply Settings
            </button>
          </div>
        </div>
      )}

      {/* HOW TO PLAY MODAL */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="text-sky-400 w-5 h-5" />
              How to Play & Game Rules
            </h3>

            <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
              <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl space-y-2">
                <h4 className="text-sky-400 font-semibold flex items-center gap-2">
                  <Keyboard className="w-4 h-4" /> Movement & Combat
                </h4>
                <p>
                  Move your character using either <span className="text-sky-400 font-semibold">{options.controlType === "WASD" ? "W, A, S, D" : "ARROW KEYS"}</span> on your keyboard. The camera will smoothly follow you.
                </p>
                <p>
                  Press <span className="text-sky-400 font-semibold">[{options.attackKey}]</span> to strike nearby enemies.
                </p>
                <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400 text-xs">
                  <li><strong>First Strike:</strong> Knocks enemies backwards in the opposite direction.</li>
                  <li><strong>Second Strike:</strong> Sends them flying away out of the screen!</li>
                </ul>
              </div>

              <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl space-y-2">
                <h4 className="text-sky-400 font-semibold">🧪 Potions & Items</h4>
                <p>
                  Collect random Red Potions (<span className="text-emerald-400 font-semibold">potion.png</span>) that drop from the sky all over the arena to restore <span className="text-emerald-400">+1 Life</span>.
                </p>
              </div>

              <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl space-y-2">
                <h4 className="text-sky-400 font-semibold">👹 The Enemies & Boss Fight</h4>
                <p>
                  Enemies (<span className="text-red-400 font-semibold">enemy.png</span>) will spawn from random directions. They deal <span className="text-red-400">-1 HP damage</span> on impact. If your HP falls to 0, it's Game Over!
                </p>
                <p>
                  Defeat <strong>10 enemies</strong> to spawn the massive, flying <span className="text-rose-500 font-bold">Boss</span>!
                </p>
                <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400 text-xs">
                  <li>The Boss flies around and shoots fireballs into the air, which rain down on you.</li>
                  <li>Dodge the fireballs by avoiding the red circular markers on the ground!</li>
                  <li>Defeat the Boss to open the <strong>Dungeon Warp Portal</strong>!</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowHowToPlay(false)}
              className="w-full mt-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-all cursor-pointer text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
