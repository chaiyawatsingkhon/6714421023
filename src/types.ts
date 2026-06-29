/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum GameState {
  TITLE = "TITLE",
  PLAYING = "PLAYING",
  GAMEOVER = "GAMEOVER",
  ENDING = "ENDING font-sans",
}

export interface GameOptions {
  controlType: "WASD" | "ARROW_KEYS";
  attackKey: "SPACE" | "G" | "F";
  soundEnabled: boolean;
  difficulty: "EASY" | "NORMAL" | "HARD";
}

export const DEFAULT_OPTIONS: GameOptions = {
  controlType: "WASD",
  attackKey: "SPACE",
  soundEnabled: true,
  difficulty: "NORMAL",
};

export interface PlayerStats {
  hp: number;
  maxHp: number;
  score: number;
  kills: number;
  potionsCollected: number;
}

export interface Enemy {
  id: string;
  position: { x: number; y: number; z: number };
  hp: number;
  maxHp: number;
  speed: number;
  hitCount: number; // to track first and second hits (1st: knockback, 2nd: fly away)
  isKnockedBack: boolean;
  knockbackDir: { x: number; z: number };
  knockbackTimer: number;
  isFlashingRed: boolean;
  flashTimer: number;
  isDying: boolean; // if flying away
  dieDir: { x: number; y: number; z: number };
  dieTimer: number;
  animationFrame: number;
  animationTimer: number;
  isAttacking: boolean;
  attackTimer: number;
}

export interface Boss {
  position: { x: number; y: number; z: number };
  hp: number;
  maxHp: number;
  speed: number;
  state: "IDLE" | "DASH" | "PREPARE_ATTACK" | "DEFEATED";
  stateTimer: number;
  patternStep: number;
  scaleFactor: number; // for squash and stretch warning
  isFlashingRed: boolean;
  flashTimer: number;
}

export interface Fireball {
  id: string;
  position: { x: number; y: number; z: number };
  targetPosition: { x: number; z: number };
  height: number;
  progress: number; // 0 to 1
  radius: number;
}

export interface Potion {
  id: string;
  position: { x: number; y: number; z: number };
  isCollected: boolean;
}

export interface DialogueLine {
  speaker: "Player" | "NPC";
  text: string;
}
