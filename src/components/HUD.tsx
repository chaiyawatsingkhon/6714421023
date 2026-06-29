/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Heart, Shield, Swords, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { PlayerStats, Boss, GameOptions } from "../types";

interface HUDProps {
  stats: PlayerStats;
  boss: Boss | null;
  options: GameOptions;
  onPause: () => void;
  onAttack: () => void;
}

export default function HUD({ stats, boss, options, onPause, onAttack }: HUDProps) {
  // Generate Hearts based on stats
  const hearts = Array.from({ length: stats.maxHp });

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 md:p-6 select-none font-sans">
      {/* Top Section: Health & Stats */}
      <div className="w-full flex justify-between items-start">
        {/* Left Side: Health and Potion Counter */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          {/* Health Bar */}
          <div className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-2xl flex flex-col gap-1 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400">
              <Shield className="w-3.5 h-3.5" /> HP LIVES
            </div>
            <div className="flex items-center gap-1">
              {hearts.map((_, idx) => {
                const isFilled = idx < stats.hp;
                return (
                  <Heart
                    key={idx}
                    className={`w-6 h-6 transition-all duration-300 ${
                      isFilled
                        ? "text-rose-500 fill-rose-500 scale-100 drop-shadow-[0_0_4px_rgba(244,63,94,0.6)]"
                        : "text-slate-800 fill-slate-950 scale-90"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Potion and Kills */}
          <div className="bg-slate-950/80 border border-slate-800/80 px-3 py-2 rounded-xl flex items-center gap-4 shadow-lg backdrop-blur-sm text-xs text-slate-300 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Potions: <span className="text-emerald-400 font-bold">{stats.potionsCollected}</span>
            </div>
            <div className="w-px h-3 bg-slate-800" />
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              Kills:{" "}
              <span className="text-sky-400 font-bold">
                {stats.kills}
                {stats.kills < 10 && " / 10"}
              </span>
            </div>
          </div>
        </div>

        {/* Center Top: Boss Health Bar */}
        {boss && boss.state !== "DEFEATED" && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 md:max-w-md pointer-events-auto">
            <div className="bg-slate-950/95 border border-red-950 p-3 rounded-2xl shadow-2xl flex flex-col gap-1.5 text-center backdrop-blur-md animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between px-1">
                <span className="text-rose-500 font-black font-mono text-xs tracking-widest animate-pulse flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 animate-spin" /> THE ANCIENT BOSS
                </span>
                <span className="text-rose-400 font-mono text-[10px]">
                  {Math.max(0, Math.ceil(boss.hp))} / {boss.maxHp} HP
                </span>
              </div>
              {/* Outer Health Bar */}
              <div className="w-full h-3.5 bg-slate-950 rounded-full border border-red-900/30 overflow-hidden p-0.5">
                {/* Inner Filled Bar */}
                <div
                  className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-red-600 rounded-full transition-all duration-100 relative"
                  style={{ width: `${Math.max(0, (boss.hp / boss.maxHp) * 100)}%` }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] animate-pulse" />
                </div>
              </div>
              {boss.state === "PREPARE_ATTACK" && (
                <div className="text-[9px] font-mono text-amber-500 uppercase tracking-widest animate-pulse">
                  ⚠️ Boss is preparing a meteor fireball shower! ⚠️
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right Side: Reset/Title Screen Trigger */}
        <div className="pointer-events-auto">
          <button
            onClick={onPause}
            className="p-3 bg-slate-950/80 border border-slate-800/80 text-slate-400 hover:text-white rounded-2xl transition-all shadow-lg backdrop-blur-sm cursor-pointer hover:bg-slate-900"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Section: Action controls overlay for quick reference or touch click */}
      <div className="w-full flex justify-between items-end">
        {/* Guide helper overlay */}
        <div className="hidden sm:flex bg-slate-950/80 border border-slate-800/80 px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm text-xs font-mono text-slate-400 flex-col gap-1">
          <div className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">Instructions</div>
          <div>Move: <span className="text-white font-bold">{options.controlType} Keys</span></div>
          <div>Attack: <span className="text-white font-bold">[{options.attackKey}] Key</span></div>
          <div>Goal: Defeat 10 enemies, kill Boss, enter Portal</div>
        </div>

        {/* Action Button - Large & Tap-friendly */}
        <div className="w-full sm:w-auto pointer-events-auto flex justify-center sm:justify-end">
          <button
            onClick={onAttack}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-sky-500 active:bg-sky-400 hover:bg-sky-400 text-slate-950 font-bold rounded-2xl shadow-[0_4px_16px_rgba(56,189,248,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer select-none text-base uppercase tracking-wider"
          >
            <Swords className="w-5 h-5" />
            Attack! [{options.attackKey}]
          </button>
        </div>
      </div>
    </div>
  );
}
