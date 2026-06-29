/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GameOptions, PlayerStats, Enemy, Boss, Fireball, Potion } from "../types";

interface GameCanvasProps {
  options: GameOptions;
  stats: PlayerStats;
  setStats: React.Dispatch<React.SetStateAction<PlayerStats>>;
  onGameOver: () => void;
  onVictory: () => void;
  triggerSound: (type: "attack" | "hit" | "heal" | "dash" | "boss_shoot" | "victory") => void;
}

export default function GameCanvas({
  options,
  stats,
  setStats,
  onGameOver,
  onVictory,
  triggerSound,
}: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // References for the Three.js loop to avoid re-render delays
  const stateRef = useRef({
    options,
    stats,
    playerPos: new THREE.Vector3(0, 0.6, 0),
    playerDir: new THREE.Vector3(0, 0, 1),
    playerVelocity: new THREE.Vector3(),
    isMoving: false,
    keys: { w: false, a: false, s: false, d: false, up: false, left: false, down: false, right: false, attack: false },
    isAttacking: false,
    attackCooldown: 0,
    invincibilityTimer: 0,
    enemies: [] as Enemy[],
    boss: null as Boss | null,
    fireballs: [] as Fireball[],
    potions: [] as Potion[],
    warpPortal: null as THREE.Mesh | null,
    warpPortalActive: false,
    spawnTimer: 0,
    nextSpawnInterval: 2000, // ms
    score: 0,
    kills: 0,
  });

  // Sync React props to Ref
  useEffect(() => {
    stateRef.current.options = options;
  }, [options]);

  useEffect(() => {
    stateRef.current.stats = stats;
  }, [stats]);

  // Exposed callback for HUD to trigger attacks
  useEffect(() => {
    const handleAttackTrigger = () => {
      triggerPlayerAttack();
    };
    (window as any).triggerInGameAttack = handleAttackTrigger;
    return () => {
      delete (window as any).triggerInGameAttack;
    };
  }, []);

  // Attack trigger function
  const triggerPlayerAttack = () => {
    const state = stateRef.current;
    if (state.attackCooldown > 0 || state.stats.hp <= 0) return;

    state.isAttacking = true;
    state.attackCooldown = 0.35; // 350ms cooldown
    triggerSound("attack");

    // Attack visual slash arc
    createSlashEffect();

    // Damage calculations
    const attackRange = 2.4;
    const playerDirection = state.playerDir.clone().normalize();
    const attackCenter = state.playerPos.clone().add(playerDirection.multiplyScalar(1.2));

    // 1. Damage Normal Enemies
    state.enemies.forEach((enemy) => {
      if (enemy.isDying) return;

      const enemyPos = new THREE.Vector3(enemy.position.x, 0.6, enemy.position.z);
      const dist = attackCenter.distanceTo(enemyPos);

      if (dist <= attackRange) {
        // Hit enemy!
        enemy.hitCount += 1;
        enemy.isFlashingRed = true;
        enemy.flashTimer = 0.25;

        // Sound representation
        triggerSound("hit");

        if (enemy.hitCount === 1) {
          // First strike: knockback direction away from player
          const knockback = enemyPos.clone().sub(state.playerPos).normalize();
          enemy.isKnockedBack = true;
          enemy.knockbackDir = { x: knockback.x, z: knockback.z };
          enemy.knockbackTimer = 0.3; // 300ms knockback
          enemy.hp -= 1;
        } else if (enemy.hitCount >= 2) {
          // Second strike: fly out of screen
          enemy.isDying = true;
          const flyDir = enemyPos.clone().sub(state.playerPos).normalize();
          enemy.dieDir = { x: flyDir.x * 4, y: 12, z: flyDir.z * 4 }; // high vertical velocity
          enemy.dieTimer = 1.2; // 1.2 seconds of animation before deletion

          // Increment defeat stats
          state.kills += 1;
          setStats((prev) => {
            const newKills = prev.kills + 1;
            return {
              ...prev,
              kills: newKills,
              score: prev.score + 100,
            };
          });
        }
      }
    });

    // 2. Damage Boss
    if (state.boss && state.boss.state !== "DEFEATED") {
      const bossPos = new THREE.Vector3(state.boss.position.x, 0.6, state.boss.position.z);
      const dist = attackCenter.distanceTo(bossPos);

      if (dist <= attackRange + 1.2) {
        // Boss hit
        state.boss.hp -= 2.5; // Deal nice chunks
        state.boss.isFlashingRed = true;
        state.boss.flashTimer = 0.25;
        triggerSound("hit");

        if (state.boss.hp <= 0) {
          state.boss.state = "DEFEATED";
          triggerSound("victory");
          spawnWarpPortal(bossPos);
        }
      }
    }
  };

  // Dynamic Sword Slash Arc Creator
  let createSlashEffect = () => {};

  // Spawn Warp Portal
  let spawnWarpPortal = (pos: THREE.Vector3) => {};

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // --- SETUP SCENE, CAMERA, RENDERER ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617); // Slate-950 background
    scene.fog = new THREE.FogExp2(0x020617, 0.035);

    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // --- LIGHTS ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xb0e0ff, 1.2);
    dirLight.position.set(15, 25, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 60;
    const d = 25;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    scene.add(dirLight);

    // Subtle blueish point light at map center
    const centerLight = new THREE.PointLight(0x0ea5e9, 0.8, 30);
    centerLight.position.set(0, 4, 0);
    scene.add(centerLight);

    // --- PROCEDURAL GROUND GENERATOR ---
    // Generate a high-quality stylized tile/grass green texture using HTML Canvas
    const generateGrassTexture = () => {
      const size = 512;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;

      // base deep green grass
      ctx.fillStyle = "#043c1c";
      ctx.fillRect(0, 0, size, size);

      // Add a pixelized checker pattern
      const tileSize = 32;
      for (let y = 0; y < size; y += tileSize) {
        for (let x = 0; x < size; x += tileSize) {
          if ((x / tileSize + y / tileSize) % 2 === 0) {
            ctx.fillStyle = "#054c24";
            ctx.fillRect(x, y, tileSize, tileSize);
          }
          // Spawn little cute pixel details
          ctx.fillStyle = "#032e16";
          ctx.fillRect(x + 4, y + 8, 4, 4);
          ctx.fillRect(x + 20, y + 16, 4, 4);

          // Spawn yellow/white retro flowers occasionally
          if (Math.random() < 0.08) {
            ctx.fillStyle = "#fbbf24"; // yellow flower center
            ctx.fillRect(x + 12, y + 12, 4, 4);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(x + 8, y + 12, 4, 4);
            ctx.fillRect(x + 16, y + 12, 4, 4);
            ctx.fillRect(x + 12, y + 8, 4, 4);
            ctx.fillRect(x + 12, y + 16, 4, 4);
          }
        }
      }

      // Add structural stone borders to give maps a modular feel
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 2;
      for (let y = 0; y <= size; y += tileSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(size, y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(y, 0);
        ctx.lineTo(y, size);
        ctx.stroke();
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(12, 12); // Tile across ground
      return texture;
    };

    const groundTex = generateGrassTexture();
    const groundGeo = new THREE.PlaneGeometry(50, 50);
    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTex,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Dynamic grid border wall details
    const borderGeo = new THREE.BoxGeometry(50, 0.5, 1);
    const borderMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    
    const wallN = new THREE.Mesh(borderGeo, borderMat);
    wallN.position.set(0, 0.25, -25);
    const wallS = new THREE.Mesh(borderGeo, borderMat);
    wallS.position.set(0, 0.25, 25);
    
    const wallE = new THREE.Mesh(borderGeo, borderMat);
    wallE.rotation.y = Math.PI / 2;
    wallE.position.set(25, 0.25, 0);
    const wallW = new THREE.Mesh(borderGeo, borderMat);
    wallW.rotation.y = Math.PI / 2;
    wallW.position.set(-25, 0.25, 0);

    scene.add(wallN, wallS, wallE, wallW);

    // --- LOADER UTILITIES FOR BILLBOARD SPRITES ---
    const texLoader = new THREE.TextureLoader();

    // 1. Player Sprite Load
    const playerTex = texLoader.load(
      "https://raw.githubusercontent.com/banyapon/banyapon.github.io/refs/heads/main/studio/images/player.png"
    );
    playerTex.magFilter = THREE.NearestFilter;
    playerTex.minFilter = THREE.NearestFilter;
    playerTex.wrapS = THREE.RepeatWrapping;
    playerTex.wrapT = THREE.RepeatWrapping;
    const playerCols = 4;
    const playerRows = 8;
    playerTex.repeat.set(1 / playerCols, 1 / playerRows);

    // Create Player Mesh as a flat plane
    const playerGeo = new THREE.PlaneGeometry(1.5, 1.5);
    const playerMat = new THREE.MeshStandardMaterial({
      map: playerTex,
      transparent: true,
      roughness: 1,
      shadowSide: THREE.DoubleSide,
    });
    const playerMesh = new THREE.Mesh(playerGeo, playerMat);
    playerMesh.position.copy(stateRef.current.playerPos);
    playerMesh.castShadow = true;
    scene.add(playerMesh);

    // Create a shadow dummy to cast neat shadows under the player
    const shadowGeo = new THREE.RingGeometry(0.01, 0.35, 16);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4 });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.01;
    scene.add(shadowMesh);

    // 2. Enemy Template Texture
    const enemyTex = texLoader.load(
      "https://raw.githubusercontent.com/banyapon/banyapon.github.io/refs/heads/main/studio/images/enemy.png"
    );
    enemyTex.magFilter = THREE.NearestFilter;
    enemyTex.minFilter = THREE.NearestFilter;
    enemyTex.wrapS = THREE.RepeatWrapping;
    enemyTex.wrapT = THREE.RepeatWrapping;

    // 3. Boss Template Texture
    const bossTex = texLoader.load(
      "https://res.cloudinary.com/dsucg33fv/image/upload/v1782709455/boss_e8jti1.png"
    );
    bossTex.magFilter = THREE.NearestFilter;
    bossTex.minFilter = THREE.NearestFilter;
    bossTex.wrapS = THREE.RepeatWrapping;
    bossTex.wrapT = THREE.RepeatWrapping;

    // 4. Potion Template Texture
    const potionTex = texLoader.load(
      "https://raw.githubusercontent.com/banyapon/banyapon.github.io/refs/heads/main/studio/images/potion.png"
    );
    potionTex.magFilter = THREE.NearestFilter;
    potionTex.minFilter = THREE.NearestFilter;

    // 5. NPC Template Texture
    const npcTex = texLoader.load(
      "https://res.cloudinary.com/dsucg33fv/image/upload/v1782439980/npc1_pdraha.png"
    );
    npcTex.magFilter = THREE.NearestFilter;
    npcTex.minFilter = THREE.NearestFilter;

    // --- SWORD SLASH ARC VISUAL EFFECT ---
    const slashGeo = new THREE.RingGeometry(0.4, 1.3, 32, 1, 0, Math.PI);
    const slashMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const slashMesh = new THREE.Mesh(slashGeo, slashMat);
    slashMesh.position.set(0, 0.4, 0);
    slashMesh.rotation.x = Math.PI / 2;
    scene.add(slashMesh);

    let slashTimer = 0;
    createSlashEffect = () => {
      slashMesh.visible = true;
      slashMat.opacity = 0.95;
      slashTimer = 0.15; // stays active for 150ms

      // Rotate and position slash relative to player position and direction
      const angle = Math.atan2(stateRef.current.playerDir.x, stateRef.current.playerDir.z);
      slashMesh.position.copy(stateRef.current.playerPos).add(stateRef.current.playerDir.clone().multiplyScalar(0.7));
      slashMesh.position.y = 0.35;
      slashMesh.rotation.z = -angle + Math.PI / 2; // match player angle orientation
    };

    // --- WARP PORTAL CREATOR ---
    const portalGeo = new THREE.TorusGeometry(1.2, 0.15, 16, 100);
    const portalMat = new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true });
    const portalMesh = new THREE.Mesh(portalGeo, portalMat);
    portalMesh.rotation.x = Math.PI / 2;
    portalMesh.visible = false;
    scene.add(portalMesh);

    const portalSpawnLight = new THREE.PointLight(0x10b981, 2.0, 10);
    portalSpawnLight.visible = false;
    scene.add(portalSpawnLight);

    spawnWarpPortal = (pos: THREE.Vector3) => {
      stateRef.current.warpPortalActive = true;
      stateRef.current.warpPortal = portalMesh;
      portalMesh.position.copy(pos);
      portalMesh.position.y = 0.1;
      portalMesh.visible = true;
      portalSpawnLight.position.copy(pos).setY(1.0);
      portalSpawnLight.visible = true;
    };

    // --- POOL AND ENEMY / POTION REPRESENTATION ---
    const enemyMeshes = new Map<string, THREE.Mesh>();
    const potionSprites = new Map<string, THREE.Sprite>();
    const warningIndicatorMeshes = new Map<string, THREE.Mesh>();
    const fireballMeshes = new Map<string, THREE.Mesh>();

    // Initial spawning of 6 potions
    for (let i = 0; i < 6; i++) {
      spawnPotionRandomly(true);
    }

    function spawnPotionRandomly(initial = false) {
      const pId = Math.random().toString();
      const radius = initial ? 8 + Math.random() * 12 : 12 + Math.random() * 10;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.max(-23, Math.min(23, Math.cos(angle) * radius));
      const z = Math.max(-23, Math.min(23, Math.sin(angle) * radius));

      const potionObj: Potion = {
        id: pId,
        position: { x, y: 0.5, z },
        isCollected: false,
      };
      stateRef.current.potions.push(potionObj);

      // Create a sprite for the potion
      const spriteMat = new THREE.SpriteMaterial({ map: potionTex, transparent: true });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(1.0, 1.0, 1.0);
      sprite.position.set(x, 0.5, z);
      scene.add(sprite);
      potionSprites.set(pId, sprite);
    }

    // --- KEYBOARD LISTENER ATTACHMENTS ---
    const handleKeyDown = (e: KeyboardEvent) => {
      const state = stateRef.current;
      const key = e.key.toLowerCase();

      // Support both layouts at all times for maximum convenience & to prevent focus/config mismatch!
      if (key === "w" || e.key === "ArrowUp") {
        state.keys.w = true;
        state.keys.up = true;
        if (["ArrowUp", "w", "W"].includes(e.key)) e.preventDefault();
      }
      if (key === "a" || e.key === "ArrowLeft") {
        state.keys.a = true;
        state.keys.left = true;
        if (["ArrowLeft", "a", "A"].includes(e.key)) e.preventDefault();
      }
      if (key === "s" || e.key === "ArrowDown") {
        state.keys.s = true;
        state.keys.down = true;
        if (["ArrowDown", "s", "S"].includes(e.key)) e.preventDefault();
      }
      if (key === "d" || e.key === "ArrowRight") {
        state.keys.d = true;
        state.keys.right = true;
        if (["ArrowRight", "d", "D"].includes(e.key)) e.preventDefault();
      }

      // Attack bindings
      if (
        (state.options.attackKey === "SPACE" && e.key === " ") ||
        (state.options.attackKey === "G" && key === "g") ||
        (state.options.attackKey === "F" && key === "f")
      ) {
        if (e.key === " ") e.preventDefault();
        triggerPlayerAttack();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const state = stateRef.current;
      const key = e.key.toLowerCase();

      if (key === "w" || e.key === "ArrowUp") {
        state.keys.w = false;
        state.keys.up = false;
      }
      if (key === "a" || e.key === "ArrowLeft") {
        state.keys.a = false;
        state.keys.left = false;
      }
      if (key === "s" || e.key === "ArrowDown") {
        state.keys.s = false;
        state.keys.down = false;
      }
      if (key === "d" || e.key === "ArrowRight") {
        state.keys.d = false;
        state.keys.right = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // --- MAIN GAME LOOP ---
    const clock = new THREE.Clock();
    let animationFrameId = 0;
    let playerAnimTimer = 0;
    let playerAnimFrame = 0;

    const gameLoop = () => {
      animationFrameId = requestAnimationFrame(gameLoop);

      const delta = Math.min(0.05, clock.getDelta()); // Cap delta to avoid lag spikes clipping through walls
      const state = stateRef.current;

      if (state.stats.hp <= 0) return; // Player is dead, freeze scene

      // --- 1. PLAYER INPUT & MOVEMENT MOVEMENT ---
      let moveX = 0;
      let moveZ = 0;

      if (state.keys.w || state.keys.up) moveZ -= 1;
      if (state.keys.s || state.keys.down) moveZ += 1;
      if (state.keys.a || state.keys.left) moveX -= 1;
      if (state.keys.d || state.keys.right) moveX += 1;

      const isInputActive = moveX !== 0 || moveZ !== 0;
      state.isMoving = isInputActive;

      if (isInputActive) {
        // Set vector direction
        const dir = new THREE.Vector3(moveX, 0, moveZ).normalize();
        state.playerDir.copy(dir);

        // Move player
        const speed = 5.2; // nice responsive movement speed
        state.playerPos.add(dir.multiplyScalar(speed * delta));

        // Enforce boundary walls [-24, 24]
        state.playerPos.x = Math.max(-24, Math.min(24, state.playerPos.x));
        state.playerPos.z = Math.max(-24, Math.min(24, state.playerPos.z));

        playerMesh.position.copy(state.playerPos);
        shadowMesh.position.set(state.playerPos.x, 0.01, state.playerPos.z);

        // Sprite sheets direction rows
        // Map 8-directional layout row
        const angle = Math.atan2(dir.x, dir.z); // range [-PI, PI]
        const normAngle = angle < 0 ? angle + Math.PI * 2 : angle;

        // 8 directions sliced into 45 deg blocks
        const sector = Math.round(normAngle / (Math.PI / 4)) % 8;
        // Direction rows in player.png:
        // 0: Down, 1: Down-Left, 2: Left, 3: Up-Left, 4: Up, 5: Up-Right, 6: Right, 7: Down-Right
        const sectorToRow = [0, 7, 6, 5, 4, 3, 2, 1]; 
        const row = sectorToRow[sector];

        // Frame cycle speed
        playerAnimTimer += delta;
        if (playerAnimTimer > 0.12) {
          playerAnimTimer = 0;
          playerAnimFrame = (playerAnimFrame + 1) % playerCols;
        }

        // Apply texture offset bounds
        playerTex.offset.set(playerAnimFrame / playerCols, (playerRows - 1 - row) / playerRows);
      } else {
        // Return to standing idle pose
        playerTex.offset.set(0, playerTex.offset.y);
      }

      // --- 2. CAMERA LERP FOLLOW ---
      const targetCamPos = new THREE.Vector3(
        state.playerPos.x,
        state.playerPos.y + 7.5,
        state.playerPos.z + 8.5
      );
      camera.position.lerp(targetCamPos, 0.08);
      camera.lookAt(state.playerPos);

      // Make player billboard face the camera
      // By copying camera's angle or simple lookAt (for correct 2.5D tilt)
      playerMesh.rotation.copy(camera.rotation);

      // --- 3. SLASH COOLDOWNS & TIMERS ---
      if (state.attackCooldown > 0) {
        state.attackCooldown -= delta;
        if (state.attackCooldown <= 0) {
          state.isAttacking = false;
        }
      }

      if (slashTimer > 0) {
        slashTimer -= delta;
        slashMat.opacity = Math.max(0, (slashTimer / 0.15) * 0.95);
        if (slashTimer <= 0) {
          slashMesh.visible = false;
        }
      }

      if (state.invincibilityTimer > 0) {
        state.invincibilityTimer -= delta;
        playerMesh.visible = Math.floor(state.invincibilityTimer * 12) % 2 === 0;
        if (state.invincibilityTimer <= 0) {
          playerMesh.visible = true;
        }
      }

      // --- 4. ENEMY MANAGEMENT (Movement, Knockbacks, Attacks) ---
      state.enemies.forEach((enemy, idx) => {
        let eMesh = enemyMeshes.get(enemy.id);

        // Lazily create 3D Mesh representation of the Enemy
        if (!eMesh) {
          const eTex = enemyTex.clone();
          eTex.needsUpdate = true;
          const eCols = 4;
          const eRows = 2;
          eTex.repeat.set(1 / eCols, 1 / eRows);

          const eGeo = new THREE.PlaneGeometry(1.4, 1.4);
          const eMat = new THREE.MeshStandardMaterial({
            map: eTex,
            transparent: true,
            roughness: 1,
            shadowSide: THREE.DoubleSide,
          });
          eMesh = new THREE.Mesh(eGeo, eMat);
          eMesh.castShadow = true;
          scene.add(eMesh);
          enemyMeshes.set(enemy.id, eMesh);
        }

        eMesh.position.set(enemy.position.x, enemy.position.y, enemy.position.z);
        eMesh.rotation.copy(camera.rotation);

        // Update sprite texture sheet row depending on movement/state
        const currentEMat = eMesh.material as THREE.MeshStandardMaterial;
        const eTex = currentEMat.map as THREE.Texture;
        enemy.animationTimer += delta;
        if (enemy.animationTimer > 0.14) {
          enemy.animationTimer = 0;
          enemy.animationFrame = (enemy.animationFrame + 1) % 4;
        }

        // Animate walk (Row 2, i.e., index 0 from bottom) vs stand (Row 1, index 1)
        const isWalking = !enemy.isDying && !enemy.isKnockedBack;
        const eRowIdx = isWalking ? 0 : 1;
        eTex.offset.set(enemy.animationFrame / 4, eRowIdx / 2);

        // Flip enemy scale based on facing direction (Right is default, flip to look Left)
        if (state.playerPos.x < enemy.position.x) {
          eMesh.scale.x = -1; // Flip left
        } else {
          eMesh.scale.x = 1; // Flip right
        }

        // Red flashing effect when hit
        if (enemy.isFlashingRed) {
          enemy.flashTimer -= delta;
          currentEMat.color.setHex(0xff3333);
          if (enemy.flashTimer <= 0) {
            enemy.isFlashingRed = false;
            currentEMat.color.setHex(0xffffff);
          }
        }

        // Standard logic for states
        if (enemy.isDying) {
          // Flying off-screen animation
          enemy.position.x += enemy.dieDir.x * delta;
          enemy.position.y += enemy.dieDir.y * delta;
          enemy.position.z += enemy.dieDir.z * delta;
          enemy.dieDir.y -= 25 * delta; // gravity pulling them down/away

          // spin
          eMesh.rotation.z += 8 * delta;

          enemy.dieTimer -= delta;
          if (enemy.dieTimer <= 0) {
            // Remove enemy representation
            scene.remove(eMesh);
            enemyMeshes.delete(enemy.id);
            state.enemies.splice(idx, 1);
          }
        } else if (enemy.isKnockedBack) {
          // Knockback state
          enemy.position.x += enemy.knockbackDir.x * 6 * delta;
          enemy.position.z += enemy.knockbackDir.z * 6 * delta;
          enemy.knockbackTimer -= delta;
          if (enemy.knockbackTimer <= 0) {
            enemy.isKnockedBack = false;
          }
        } else {
          // Normal Chase Loop
          const enemyPosVec = new THREE.Vector3(enemy.position.x, 0.6, enemy.position.z);
          const distToPlayer = enemyPosVec.distanceTo(state.playerPos);

          if (distToPlayer > 0.85) {
            // Walk closer to player
            const dirToPlayer = state.playerPos.clone().sub(enemyPosVec).normalize();
            enemy.position.x += dirToPlayer.x * enemy.speed * delta;
            enemy.position.z += dirToPlayer.z * enemy.speed * delta;
          } else {
            // Melee impact damage player
            if (state.invincibilityTimer <= 0) {
              // Deal damage
              state.invincibilityTimer = 1.0; // 1 sec invulnerability frame
              const newHp = Math.max(0, state.stats.hp - 1);
              triggerSound("hit");

              setStats((prev) => ({
                ...prev,
                hp: newHp,
              }));

              if (newHp <= 0) {
                onGameOver();
              }
            }
          }
        }
      });

      // --- 5. ITEM COLLECTIBLE DETECTION ---
      state.potions.forEach((potion, idx) => {
        if (potion.isCollected) return;

        const potPosVec = new THREE.Vector3(potion.position.x, 0.5, potion.position.z);
        const dist = state.playerPos.distanceTo(potPosVec);

        // Collect potion
        if (dist < 1.0) {
          potion.isCollected = true;
          triggerSound("heal");

          // Visual float-up collection
          const sprite = potionSprites.get(potion.id);
          if (sprite) {
            scene.remove(sprite);
            potionSprites.delete(potion.id);
          }

          state.potions.splice(idx, 1);

          setStats((prev) => {
            const healedHp = Math.min(prev.maxHp, prev.hp + 1);
            return {
              ...prev,
              hp: healedHp,
              potionsCollected: prev.potionsCollected + 1,
              score: prev.score + 150,
            };
          });

          // Spawn replacement potion
          spawnPotionRandomly(false);
        }
      });

      // --- 6. BOSS FIGHT LOGIC (Dashes, Warning Squashes, Fireball Storms) ---
      // Boss triggers after 10 kills
      if (state.kills >= 10 && !state.boss) {
        // Initialize Boss
        state.boss = {
          position: { x: 0, y: 1.8, z: -10 },
          hp: 40,
          maxHp: 40,
          speed: 2.2,
          state: "IDLE",
          stateTimer: 2.5,
          patternStep: 0,
          scaleFactor: 1.0,
          isFlashingRed: false,
          flashTimer: 0,
        };
        triggerSound("victory"); // Epic fanfare for entry
      }

      if (state.boss && state.boss.state !== "DEFEATED") {
        const boss = state.boss;
        let bMesh = scene.getObjectByName("BOSS_MESH") as THREE.Mesh;

        if (!bMesh) {
          const bTex = bossTex.clone();
          bTex.needsUpdate = true;
          bTex.repeat.set(1 / 4, 1 / 2);

          const bGeo = new THREE.PlaneGeometry(3.2, 3.2);
          const bMat = new THREE.MeshStandardMaterial({
            map: bTex,
            transparent: true,
            roughness: 1,
            shadowSide: THREE.DoubleSide,
          });
          bMesh = new THREE.Mesh(bGeo, bMat);
          bMesh.name = "BOSS_MESH";
          bMesh.castShadow = true;
          scene.add(bMesh);
        }

        bMesh.position.set(boss.position.x, boss.position.y, boss.position.z);
        bMesh.rotation.copy(camera.rotation);

        // Animate Boss textures (Row 1: Idle float, Row 2: Heavy charging action)
        const currentBMat = bMesh.material as THREE.MeshStandardMaterial;
        const bTex = currentBMat.map as THREE.Texture;
        const bFrameIdx = Math.floor(Date.now() / 150) % 4;
        const bRowIdx = boss.state === "DASH" || boss.state === "PREPARE_ATTACK" ? 0 : 1;
        bTex.offset.set(bFrameIdx / 4, bRowIdx / 2);

        // Flashing Red indicator
        if (boss.isFlashingRed) {
          boss.flashTimer -= delta;
          currentBMat.color.setHex(0xff3333);
          if (boss.flashTimer <= 0) {
            boss.isFlashingRed = false;
            currentBMat.color.setHex(0xffffff);
          }
        }

        // Apply visual Squash and Stretch warning scale
        bMesh.scale.set(
          3.2 * boss.scaleFactor,
          3.2 * (2.0 - boss.scaleFactor),
          3.2
        );

        // --- BOSS STATE MACHINE ---
        boss.stateTimer -= delta;

        if (boss.stateTimer <= 0) {
          // Choose next pattern step
          const steps = ["IDLE", "DASH", "PREPARE_ATTACK", "IDLE"];
          boss.patternStep = (boss.patternStep + 1) % steps.length;
          boss.state = steps[boss.patternStep] as any;

          if (boss.state === "IDLE") {
            boss.stateTimer = 2.0;
            boss.scaleFactor = 1.0;
          } else if (boss.state === "DASH") {
            // Charges near the player
            boss.stateTimer = 1.8;
            boss.scaleFactor = 1.1; // bulk up
          } else if (boss.state === "PREPARE_ATTACK") {
            // Prep shooting meteor fireball show
            boss.stateTimer = 2.5;
            triggerSound("boss_shoot");
          }
        }

        // Update Boss Action mechanics
        if (boss.state === "IDLE") {
          // Hover up/down slowly
          boss.position.y = 1.8 + Math.sin(Date.now() * 0.0035) * 0.25;

          // Slow orbit drift towards player
          const bPosVec = new THREE.Vector3(boss.position.x, 0.6, boss.position.z);
          const dir = state.playerPos.clone().sub(bPosVec).normalize();
          boss.position.x += dir.x * boss.speed * 0.5 * delta;
          boss.position.z += dir.z * boss.speed * 0.5 * delta;
        } else if (boss.state === "DASH") {
          // Charge player quickly
          const bPosVec = new THREE.Vector3(boss.position.x, 0.6, boss.position.z);
          const dir = state.playerPos.clone().sub(bPosVec).normalize();
          boss.position.x += dir.x * boss.speed * 2.8 * delta;
          boss.position.z += dir.z * boss.speed * 2.8 * delta;
          boss.position.y = 1.5; // low dive

          // Damage player on contact
          if (bPosVec.distanceTo(state.playerPos) < 1.8) {
            if (state.invincibilityTimer <= 0) {
              state.invincibilityTimer = 1.0;
              const newHp = Math.max(0, state.stats.hp - 1);
              triggerSound("hit");

              setStats((prev) => ({ ...prev, hp: newHp }));
              if (newHp <= 0) onGameOver();
            }
          }
        } else if (boss.state === "PREPARE_ATTACK") {
          // Pulse scale violently as an action warning
          boss.scaleFactor = 1.0 + Math.sin(Date.now() * 0.02) * 0.2;

          // Periodically spawn fireballs falling from sky
          const fireInterval = 0.45; // Shoot a fireball every 450ms
          const stepTimer = Math.floor(boss.stateTimer / fireInterval);
          const lastStepTimer = Math.floor((boss.stateTimer + delta) / fireInterval);

          if (stepTimer !== lastStepTimer && boss.stateTimer > 0.4) {
            // Shoot fireball targeting Player's current coordinates
            const targetX = state.playerPos.x + (Math.random() * 2.5 - 1.25);
            const targetZ = state.playerPos.z + (Math.random() * 2.5 - 1.25);
            const fId = Math.random().toString();

            const fireballObj: Fireball = {
              id: fId,
              position: { x: boss.position.x, y: boss.position.y + 1, z: boss.position.z },
              targetPosition: { x: targetX, z: targetZ },
              height: 6 + Math.random() * 4,
              progress: 0,
              radius: 1.6,
            };
            state.fireballs.push(fireballObj);

            // Create circular warning indicator mesh on ground
            const indGeo = new THREE.RingGeometry(0.01, 1.4, 32);
            const indMat = new THREE.MeshBasicMaterial({
              color: 0xef4444,
              transparent: true,
              opacity: 0.35,
              side: THREE.DoubleSide,
            });
            const indMesh = new THREE.Mesh(indGeo, indMat);
            indMesh.rotation.x = -Math.PI / 2;
            indMesh.position.set(targetX, 0.02, targetZ);
            scene.add(indMesh);
            warningIndicatorMeshes.set(fId, indMesh);

            // Create fireball visual sphere
            const fbGeo = new THREE.SphereGeometry(0.35, 16, 16);
            const fbMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
            const fbMesh = new THREE.Mesh(fbGeo, fbMat);
            fbMesh.position.set(boss.position.x, boss.position.y + 1, boss.position.z);
            scene.add(fbMesh);
            fireballMeshes.set(fId, fbMesh);
          }
        }
      } else if (state.boss && state.boss.state === "DEFEATED") {
        // Boss is defeated, clean up its representation mesh
        const bMesh = scene.getObjectByName("BOSS_MESH");
        if (bMesh) {
          scene.remove(bMesh);
        }
      }

      // --- 7. FIREBALL STORM ANIMATION & LANDING COLLISION ---
      state.fireballs.forEach((fb, idx) => {
        fb.progress += delta * 0.8; // 1.25 sec travel time

        // Calculate parabolic projectile arc trajectory
        const currX = fb.position.x + (fb.targetPosition.x - fb.position.x) * delta * 0.8 / (1.0001 - fb.progress);
        const currZ = fb.position.z + (fb.targetPosition.z - fb.position.z) * delta * 0.8 / (1.0001 - fb.progress);
        const currY = Math.sin(fb.progress * Math.PI) * fb.height;

        fb.position.x = THREE.MathUtils.lerp(fb.position.x, fb.targetPosition.x, delta * 2.2);
        fb.position.z = THREE.MathUtils.lerp(fb.position.z, fb.targetPosition.z, delta * 2.2);
        fb.position.y = currY;

        const fbMesh = fireballMeshes.get(fb.id);
        if (fbMesh) {
          fbMesh.position.set(fb.position.x, fb.position.y, fb.position.z);
          // rotate fireball visual
          fbMesh.rotation.x += 3 * delta;
          fbMesh.rotation.y += 3 * delta;
        }

        // Warning indicator pulse
        const indMesh = warningIndicatorMeshes.get(fb.id);
        if (indMesh) {
          // Pluses as progress approaches 100%
          const scale = 0.4 + Math.sin(Date.now() * 0.012) * 0.1 + fb.progress * 0.6;
          indMesh.scale.set(scale, scale, 1);
          (indMesh.material as THREE.MeshBasicMaterial).opacity = 0.25 + fb.progress * 0.6;
        }

        // Fireball lands
        if (fb.progress >= 1.0) {
          // Trigger impact explosion explosion
          triggerSound("hit");

          // Damage player if standing inside landing circle
          const dist = state.playerPos.distanceTo(new THREE.Vector3(fb.targetPosition.x, 0.6, fb.targetPosition.z));
          if (dist < fb.radius) {
            if (state.invincibilityTimer <= 0) {
              state.invincibilityTimer = 1.0;
              const newHp = Math.max(0, state.stats.hp - 1);
              setStats((prev) => ({ ...prev, hp: newHp }));
              if (newHp <= 0) onGameOver();
            }
          }

          // Visual explosion ring particle pop
          createExplosionRing(fb.targetPosition.x, fb.targetPosition.z);

          // Delete representations
          if (fbMesh) scene.remove(fbMesh);
          if (indMesh) scene.remove(indMesh);
          fireballMeshes.delete(fb.id);
          warningIndicatorMeshes.delete(fb.id);
          state.fireballs.splice(idx, 1);
        }
      });

      // Explosion Ring particle creator
      function createExplosionRing(x: number, z: number) {
        const rGeo = new THREE.RingGeometry(0.1, 1.5, 32);
        const rMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(rGeo, rMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(x, 0.05, z);
        scene.add(ring);

        // Animate expand and fade-out quick
        const expTime = 0.2;
        let elapsed = 0;
        const animateExp = () => {
          elapsed += 0.016;
          const progress = elapsed / expTime;
          if (progress < 1.0) {
            const sc = 0.1 + progress * 1.5;
            ring.scale.set(sc, sc, 1);
            rMat.opacity = 0.9 * (1.0 - progress);
            requestAnimationFrame(animateExp);
          } else {
            scene.remove(ring);
          }
        };
        animateExp();
      }

      // --- 8. WARP PORTAL DETECTION ---
      if (state.warpPortalActive && state.warpPortal) {
        // Orbit spin portal representation
        state.warpPortal.rotation.z += 2 * delta;

        const portalPos = state.warpPortal.position;
        const dist = state.playerPos.distanceTo(portalPos);

        if (dist < 1.3) {
          // Player enters portal -> WINNING CUTSCENE!
          triggerSound("victory");
          state.warpPortalActive = false;
          onVictory();
        }
      }

      // --- 9. RANDOM ENEMY SPAWN SCHEDULER ---
      // Disable spawning once Boss appears to focus on 1v1 battle
      if (!state.boss) {
        state.spawnTimer += delta * 1000;
        if (state.spawnTimer >= state.nextSpawnInterval) {
          state.spawnTimer = 0;
          // Spawn between 1-3 seconds randomly
          state.nextSpawnInterval = 1000 + Math.random() * 2000;

          // Spawn a random enemy off-screen
          const angle = Math.random() * Math.PI * 2;
          const radius = 18; // spawned distance from player
          const ex = state.playerPos.x + Math.cos(angle) * radius;
          const ez = state.playerPos.z + Math.sin(angle) * radius;

          // Don't spawn outside maps boundaries
          const clampedX = Math.max(-23, Math.min(23, ex));
          const clampedZ = Math.max(-23, Math.min(23, ez));

          const enemyObj: Enemy = {
            id: Math.random().toString(),
            position: { x: clampedX, y: 0.6, z: clampedZ },
            hp: 2,
            maxHp: 2,
            speed: 1.4 + Math.random() * 0.6,
            hitCount: 0,
            isKnockedBack: false,
            knockbackDir: { x: 0, z: 0 },
            knockbackTimer: 0,
            isFlashingRed: false,
            flashTimer: 0,
            isDying: false,
            dieDir: { x: 0, y: 0, z: 0 },
            dieTimer: 0,
            animationFrame: 0,
            animationTimer: 0,
            isAttacking: false,
            attackTimer: 0,
          };
          state.enemies.push(enemyObj);
        }
      }

      renderer.render(scene, camera);
    };

    gameLoop();

    // --- WINDOW RESIZE OBSERVER ---
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // --- CLEANUP ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      resizeObserver.disconnect();

      // Clean meshes, sprites, textures from GPU memory
      enemyMeshes.forEach((m) => scene.remove(m));
      potionSprites.forEach((s) => scene.remove(s));
      warningIndicatorMeshes.forEach((m) => scene.remove(m));
      fireballMeshes.forEach((m) => scene.remove(m));

      groundTex.dispose();
      groundGeo.dispose();
      groundMat.dispose();
      playerGeo.dispose();
      playerMat.dispose();
      slashGeo.dispose();
      slashMat.dispose();
      portalGeo.dispose();
      portalMat.dispose();

      renderer.dispose();
    };
  }, [onGameOver, onVictory]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative overflow-hidden bg-slate-950 cursor-pointer"
      onClick={() => {
        window.focus();
      }}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      
      {/* Visual Indicator to ensure users click/focus controls */}
      <div className="absolute top-4 left-4 pointer-events-none bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 text-[11px] font-sans text-slate-300 flex items-center gap-2 shadow-xl animate-pulse">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
        <span>คลิกที่หน้าจอเกมเพื่อควบคุม (Click screen to focus WASD/Arrows)</span>
      </div>
    </div>
  );
}
