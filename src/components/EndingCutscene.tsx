/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { DialogueLine, PlayerStats } from "../types";
import { Trophy, ArrowRight, Home, Flame, Heart, Award } from "lucide-react";

interface EndingCutsceneProps {
  stats: PlayerStats;
  onReturnToTitle: () => void;
}

export default function EndingCutscene({ stats, onReturnToTitle }: EndingCutsceneProps) {
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [dialogueFinished, setDialogueFinished] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [charIdx, setCharIdx] = useState(0);

  const dialogue: DialogueLine[] = [
    {
      speaker: "NPC",
      text: "Oh! Brave hero, you did it! You have successfully vanquished the ancient Crimson Boss!",
    },
    {
      speaker: "Player",
      text: "It was a fierce battle... but I had to protect this mystical realm from its destructive wrath.",
    },
    {
      speaker: "NPC",
      text: "Look! The warp portal is finally stable, and the fireballs have stopped raining from the skies.",
    },
    {
      speaker: "Player",
      text: "I found those healing elixirs scattered on the grass. They kept me standing through the flames.",
    },
    {
      speaker: "NPC",
      text: "Your legendary agility and double-strike combat technique are absolutely incredible! A true master!",
    },
    {
      speaker: "Player",
      text: "Thank you. Knowing you were waiting for safety gave me the ultimate strength to push through.",
    },
    {
      speaker: "NPC",
      text: "Our world is saved. Peaceful days shall return, and all citizens will sing of your legendary deeds!",
    },
    {
      speaker: "Player",
      text: "Let's step out of this dark dungeon together now, and celebrate the dawn of a peaceful new era.",
    },
  ];

  const currentLine = dialogue[currentLineIdx];

  // Typewriter effect
  useEffect(() => {
    if (dialogueFinished) return;
    setTypedText("");
    setCharIdx(0);
  }, [currentLineIdx, dialogueFinished]);

  useEffect(() => {
    if (dialogueFinished) return;
    if (charIdx < currentLine.text.length) {
      const timer = setTimeout(() => {
        setTypedText((prev) => prev + currentLine.text[charIdx]);
        setCharIdx((prev) => prev + 1);
      }, 25);
      return () => clearTimeout(timer);
    }
  }, [charIdx, currentLine, dialogueFinished]);

  const handleNext = () => {
    if (charIdx < currentLine.text.length) {
      // Skip typewriter animation
      setTypedText(currentLine.text);
      setCharIdx(currentLine.text.length);
    } else if (currentLineIdx < dialogue.length - 1) {
      setCurrentLineIdx((prev) => prev + 1);
    } else {
      setDialogueFinished(true);
    }
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 flex flex-col items-center justify-between p-6 select-none overflow-hidden font-sans">
      {/* Background visual effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0%,transparent_75%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.6)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-45" />

      {/* Floating particles background */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <div className="absolute top-10 left-1/4 w-2 h-2 bg-emerald-400 rounded-full animate-ping [animation-duration:3s]" />
        <div className="absolute bottom-20 right-1/4 w-3 h-3 bg-sky-400 rounded-full animate-ping [animation-duration:4s]" />
        <div className="absolute top-1/2 left-2/3 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping [animation-duration:2.5s]" />
      </div>

      {/* Top Banner */}
      <div className="w-full flex justify-center py-4 z-10">
        <div className="bg-emerald-950/40 border border-emerald-500/30 px-6 py-2 rounded-full text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2 shadow-lg shadow-emerald-950/20 backdrop-blur-sm">
          <Trophy className="w-4 h-4 animate-bounce" /> EPILOGUE: SANCTUARY RESTORED
        </div>
      </div>

      {!dialogueFinished ? (
        /* RPG DIALOGUE SCREEN */
        <div className="w-full max-w-4xl flex-1 flex flex-col justify-end gap-6 z-10 pb-8 px-2 md:px-6">
          {/* Avatar / Character Display Stage */}
          <div className="relative flex-1 w-full flex justify-between items-end pb-8">
            {/* Player Side (Left) */}
            <div
              className={`flex flex-col items-center transition-all duration-500 ${
                currentLine.speaker === "Player" ? "scale-105 opacity-100" : "scale-95 opacity-50"
              }`}
            >
              {/* Profile Image Box with glow */}
              <div className="relative w-32 h-32 md:w-44 md:h-44 bg-slate-900 border-2 border-sky-500/40 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
                {currentLine.speaker === "Player" && (
                  <div className="absolute inset-0 bg-sky-500/10 animate-pulse pointer-events-none" />
                )}
                {/* We use a specific section of player.png as portrait or the full cropped sprite */}
                <div
                  className="w-16 h-16 md:w-24 md:h-24 bg-no-repeat"
                  style={{
                    backgroundImage: `url("https://raw.githubusercontent.com/banyapon/banyapon.github.io/refs/heads/main/studio/images/player.png")`,
                    backgroundSize: "400% 800%",
                    backgroundPosition: "0% 0%", // First frame, facing forward
                  }}
                />
              </div>
              <div className="mt-3 px-4 py-1.5 bg-sky-950 border border-sky-500/30 text-sky-400 font-mono text-xs font-bold rounded-lg shadow-md uppercase tracking-wide">
                Gamer Hero
              </div>
            </div>

            {/* NPC Side (Right) */}
            <div
              className={`flex flex-col items-center transition-all duration-500 ${
                currentLine.speaker === "NPC" ? "scale-105 opacity-100" : "scale-95 opacity-50"
              }`}
            >
              {/* Profile Image Box with glow */}
              <div className="relative w-32 h-32 md:w-44 md:h-44 bg-slate-900 border-2 border-emerald-500/40 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
                {currentLine.speaker === "NPC" && (
                  <div className="absolute inset-0 bg-emerald-500/10 animate-pulse pointer-events-none" />
                )}
                {/* NPC sprite cropped */}
                <div
                  className="w-16 h-16 md:w-24 md:h-24 bg-no-repeat"
                  style={{
                    backgroundImage: `url("https://res.cloudinary.com/dsucg33fv/image/upload/v1782439980/npc1_pdraha.png")`,
                    backgroundSize: "400% 200%",
                    backgroundPosition: "0% 0%", // First frame, standing row
                  }}
                />
              </div>
              <div className="mt-3 px-4 py-1.5 bg-emerald-950 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold rounded-lg shadow-md uppercase tracking-wide">
                Elder NPC
              </div>
            </div>
          </div>

          {/* Dialogue Textbox */}
          <button
            onClick={handleNext}
            className="w-full bg-slate-900/95 border-2 border-slate-800 hover:border-slate-700 p-5 md:p-6 rounded-2xl shadow-2xl flex flex-col items-start gap-2 relative transition-all duration-200 cursor-pointer pointer-events-auto text-left outline-none"
          >
            {/* Active Speaker Badge */}
            <div
              className={`text-xs font-bold uppercase tracking-widest font-mono px-3 py-1 rounded-md ${
                currentLine.speaker === "Player"
                  ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}
            >
              {currentLine.speaker === "Player" ? "★ Player" : "✦ Elder NPC"}
            </div>

            {/* Dialogue text */}
            <p className="text-white text-sm md:text-base leading-relaxed min-h-[50px] font-sans pr-8">
              {typedText}
              {charIdx < currentLine.text.length && <span className="inline-block w-2 h-4 bg-sky-400 ml-1 animate-pulse" />}
            </p>

            {/* Click to continue hint */}
            <div className="absolute bottom-3 right-4 flex items-center gap-1 text-[10px] font-mono text-slate-500 uppercase tracking-widest animate-pulse">
              <span>Next</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </button>
        </div>
      ) : (
        /* GLORIOUS FINISH STATS PANEL */
        <div className="w-full max-w-lg bg-slate-900/90 border-2 border-emerald-500/30 p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6 z-10 my-auto animate-in zoom-in-95 duration-300">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 opacity-40 blur-lg animate-pulse" />
            <div className="relative w-16 h-16 bg-emerald-950 border border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-400 shadow-xl">
              <Award className="w-8 h-8 animate-spin [animation-duration:12s]" />
            </div>
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-3xl font-black text-white tracking-tight uppercase">Victory Achieved!</h2>
            <p className="text-emerald-400 font-mono text-xs uppercase tracking-widest">
              You Have Sealed The Dungeon
            </p>
          </div>

          {/* Stats breakdown */}
          <div className="w-full grid grid-cols-2 gap-3">
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl flex flex-col items-center gap-1.5 text-center">
              <Flame className="w-5 h-5 text-rose-500" />
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Enemies Defeated
              </div>
              <div className="text-2xl font-black text-white">{stats.kills}</div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl flex flex-col items-center gap-1.5 text-center">
              <Heart className="w-5 h-5 text-emerald-500" />
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Potions Drunk
              </div>
              <div className="text-2xl font-black text-white">{stats.potionsCollected}</div>
            </div>
          </div>

          <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl text-center text-xs text-slate-400 leading-relaxed font-sans max-w-xs">
            "Your bravery will forever echo in the archives. Peace has been restored to the Realm!"
          </div>

          {/* Back to Title button */}
          <button
            onClick={onReturnToTitle}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_4px_16px_rgba(16,185,129,0.35)] hover:shadow-[0_4px_20px_rgba(16,185,129,0.5)] scale-100 hover:scale-[1.02] text-sm uppercase tracking-wider"
          >
            <Home className="w-4 h-4 fill-current" />
            Return to Title Screen
          </button>
        </div>
      )}

      {/* Footer credits spacer */}
      <div className="h-6" />
    </div>
  );
}
