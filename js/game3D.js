/**
 * PRABHAS: KASI 2898 AD (3D Runner)
 * Core 3D Game Engine & WebGL Render Loop with 1 Million Units Goal
 */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { CONFIG } from "./config.js";
import { AudioManager3D } from "./audio.js";
import { InputManager3D } from "./input.js";
import { Player3D } from "./player3D.js";
import { Environment3D } from "./world/environment.js";
import { TrackSegmentPool3D } from "./world/segmentPool.js";
import { CameraManager3D } from "./cameraManager.js";
import { CollisionManager3D } from "./collision3D.js";

export const GameState3D = {
  MENU: "menu",
  PLAYING: "playing",
  PAUSED: "paused",
  GAME_OVER: "gameover",
  VICTORY: "victory"
};

export class GameEngine3D {
  constructor() {
    this.state = GameState3D.MENU;
    this.gameMode = localStorage.getItem("prabhas3DGameMode") || "heist"; // "heist" | "endless"
    this.score = 0;
    this.units = 0;
    this.highScore = parseInt(localStorage.getItem("prabhas3DHighScore") || "0", 10);
    this.vaultUnits = parseInt(localStorage.getItem("prabhas3DVaultUnits") || "0", 10);

    this.currentSpeed = CONFIG.INITIAL_SPEED;
    this.gameOverLockTime = 0;

    // Three.js Core
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.tractorBeam = null;

    // Subsystems
    this.audio = new AudioManager3D();
    this.input = null;
    this.player = null;
    this.environment = null;
    this.trackPool = null;
    this.cameraManager = null;

    // Loop
    this.lastTime = 0;
    this.animId = null;

    // DOM Elements
    this.dom = {};
  }

  init() {
    this.cacheDom();
    this.initThree();

    this.environment = new Environment3D(this.scene);
    this.player = new Player3D(this.scene);
    this.trackPool = new TrackSegmentPool3D(this.scene);
    this.cameraManager = new CameraManager3D(this.camera);

    this.input = new InputManager3D({
      onLeft: () => this.handleLeft(),
      onRight: () => this.handleRight(),
      onJump: () => this.handleJump(),
      onSlide: () => this.handleSlide(),
      onPause: () => this.togglePause(),
      onStart: () => this.handleStartAction()
    });

    this.bindUi();
    this.setGameMode(this.gameMode);
    this.updateHud();
    this.showScreen(GameState3D.MENU);

    window.addEventListener("resize", () => this.handleResize());

    // Start 60 FPS Loop
    this.lastTime = performance.now();
    this.animId = requestAnimationFrame((t) => this.gameLoop(t));
  }

  initThree() {
    const container = document.getElementById("canvas-container");
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
    this.camera.position.set(0, 3.4, -6.5);

    // WebGL Renderer (Optimized for consistent 60 FPS)
    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "default" });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(this.renderer.domElement);

    // Tractor Beam for Victory Sequence
    const beamGeo = new THREE.CylinderGeometry(4.0, 4.0, 150, 24, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x00E5FF,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide
    });
    this.tractorBeam = new THREE.Mesh(beamGeo, beamMat);
    this.tractorBeam.position.y = 75;
    this.scene.add(this.tractorBeam);
  }

  cacheDom() {
    this.dom = {
      hud: document.getElementById("game-hud"),
      hudScore: document.getElementById("hud-score-val"),
      hudUnits: document.getElementById("hud-units-val"),
      hudGoalPill: document.getElementById("hud-goal-pill"),
      hudGoalPct: document.getElementById("hud-goal-pct"),
      hudGoalFill: document.getElementById("hud-goal-fill"),

      // Stacked Power-Up Badges (Bottom Left)
      badgeJetpack: document.getElementById("badge-jetpack"),
      fillJetpack: document.getElementById("jetpack-timer-fill"),
      badgeMagnet: document.getElementById("badge-magnet"),
      fillMagnet: document.getElementById("magnet-timer-fill"),
      badgeMultiplier: document.getElementById("badge-multiplier"),
      fillMultiplier: document.getElementById("multiplier-timer-fill"),
      badgeShield: document.getElementById("badge-shield"),

      // Mission Mode Selectors
      btnModeHeist: document.getElementById("mode-btn-heist"),
      btnModeEndless: document.getElementById("mode-btn-endless"),

      startScreen: document.getElementById("start-screen"),
      pauseScreen: document.getElementById("pause-screen"),
      gameOverScreen: document.getElementById("game-over-screen"),
      victoryScreen: document.getElementById("victory-screen"),

      finalScore: document.getElementById("final-score-val"),
      finalHighScore: document.getElementById("final-high-val"),
      finalUnits: document.getElementById("final-units-val"),

      btnStartRun: document.getElementById("btn-start-run"),
      btnResume: document.getElementById("btn-resume"),
      btnRestart: document.getElementById("btn-restart"),
      btnPauseMenu: document.getElementById("btn-pause-menu"),
      btnRunAgain: document.getElementById("btn-run-again"),
      btnGameOverMenu: document.getElementById("btn-gameover-menu"),
      btnVictoryPlayAgain: document.getElementById("btn-victory-again"),
      btnVictoryMenu: document.getElementById("btn-victory-menu"),
      btnSound: document.getElementById("btn-sound-toggle"),
      soundIcon: document.getElementById("sound-icon-img"),
      btnPause: document.getElementById("btn-pause-toggle")
    };
  }

  bindUi() {
    if (this.dom.btnModeHeist) {
      this.dom.btnModeHeist.addEventListener("click", () => this.setGameMode("heist"));
    }
    if (this.dom.btnModeEndless) {
      this.dom.btnModeEndless.addEventListener("click", () => this.setGameMode("endless"));
    }
    if (this.dom.btnStartRun) {
      this.dom.btnStartRun.addEventListener("click", () => this.startNewGame());
    }
    if (this.dom.btnResume) {
      this.dom.btnResume.addEventListener("click", () => this.resumeGame());
    }
    if (this.dom.btnRestart) {
      this.dom.btnRestart.addEventListener("click", () => this.startNewGame());
    }
    if (this.dom.btnPauseMenu) {
      this.dom.btnPauseMenu.addEventListener("click", () => this.showMenu());
    }
    if (this.dom.btnRunAgain) {
      this.dom.btnRunAgain.addEventListener("click", () => this.startNewGame());
    }
    if (this.dom.btnGameOverMenu) {
      this.dom.btnGameOverMenu.addEventListener("click", () => this.showMenu());
    }
    if (this.dom.btnVictoryPlayAgain) {
      this.dom.btnVictoryPlayAgain.addEventListener("click", () => this.startNewGame());
    }
    if (this.dom.btnVictoryMenu) {
      this.dom.btnVictoryMenu.addEventListener("click", () => this.showMenu());
    }
    if (this.dom.btnPause) {
      this.dom.btnPause.addEventListener("click", () => this.togglePause());
    }
    if (this.dom.btnSound) {
      this.dom.btnSound.addEventListener("click", () => {
        const isMuted = this.audio.toggleMute();
        if (this.dom.soundIcon) {
          this.dom.soundIcon.src = isMuted ? "assets/ui/sound-off.svg" : "assets/ui/sound-on.svg";
        }
      });
    }
  }

  setGameMode(mode) {
    this.gameMode = mode;
    localStorage.setItem("prabhas3DGameMode", mode);
    this._lastUnits = null;
    this._lastScore = null;
    this._lastGoalPct = null;
    this._lastGoalPillDisplay = null;
    if (this.dom.btnModeHeist) {
      this.dom.btnModeHeist.classList.toggle("active", mode === "heist");
    }
    if (this.dom.btnModeEndless) {
      this.dom.btnModeEndless.classList.toggle("active", mode === "endless");
    }
    this.updateHud();
  }

  handleResize() {
    const container = document.getElementById("canvas-container");
    if (!container || !this.renderer || !this.camera) return;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  startNewGame() {
    this.audio.init();
    this.audio.playMusic();
    this.audio.playDialogue("bujji");
    this.score = 0;
    this.units = 0;
    this.currentSpeed = CONFIG.INITIAL_SPEED;

    this._lastUnits = null;
    this._lastScore = null;
    this._lastGoalPct = null;
    this._lastGoalPillDisplay = null;

    this.player.reset();
    this.trackPool.init();

    if (this.tractorBeam) {
      this.tractorBeam.material.opacity = 0;
    }

    this.state = GameState3D.PLAYING;
    this.showScreen(GameState3D.PLAYING);
    this.updateHud();
    this.audio.playDialogue("bujji");
  }

  togglePause() {
    if (this.state === GameState3D.PLAYING) {
      this.state = GameState3D.PAUSED;
      this.audio.pauseMusic();
      this.showScreen(GameState3D.PAUSED);
    } else if (this.state === GameState3D.PAUSED) {
      this.resumeGame();
    }
  }

  resumeGame() {
    if (this.state !== GameState3D.PAUSED) return;
    this.state = GameState3D.PLAYING;
    this.audio.playMusic();
    this.showScreen(GameState3D.PLAYING);
    this.lastTime = performance.now();
  }

  showMenu() {
    this.state = GameState3D.MENU;
    this.audio.stopMusic();
    this.showScreen(GameState3D.MENU);
    this._lastUnits = null;
    this._lastScore = null;
    this._lastGoalPct = null;
    this._lastGoalPillDisplay = null;
    this.player.reset();
    this.trackPool.clear();
    if (this.tractorBeam) this.tractorBeam.material.opacity = 0;
    this.updateHud();
  }

  gameOver() {
    this.state = GameState3D.GAME_OVER;
    this.gameOverLockTime = Date.now() + 1000;
    this.audio.pauseMusic();
    this.audio.playHit();
    this.cameraManager.shake(0.8);

    if (this.score > this.highScore) {
      this.highScore = Math.floor(this.score);
      localStorage.setItem("prabhas3DHighScore", this.highScore.toString());
    }

    this.vaultUnits += this.units;
    localStorage.setItem("prabhas3DVaultUnits", this.vaultUnits.toString());

    if (this.dom.finalScore) this.dom.finalScore.textContent = Math.floor(this.score).toString().padStart(6, "0");
    if (this.dom.finalHighScore) this.dom.finalHighScore.textContent = this.highScore.toString().padStart(6, "0");
    if (this.dom.finalUnits) this.dom.finalUnits.textContent = this.units.toLocaleString() + " UNITS";

    setTimeout(() => {
      if (this.state === GameState3D.GAME_OVER) {
        this.showScreen(GameState3D.GAME_OVER);
      }
    }, 350);
  }

  /**
   * 1 Million Units Achieved -> Cinematic Victory & Complex Ascent!
   */
  victory() {
    this.state = GameState3D.VICTORY;
    this.gameOverLockTime = Date.now() + 1500;
    this.audio.playPowerup();
    this.audio.playDialogue("complex");

    // Position Tractor Beam on Player
    if (this.tractorBeam) {
      this.tractorBeam.position.x = this.player.position.x;
      this.tractorBeam.position.z = this.player.position.z;
      this.tractorBeam.material.opacity = 0.85;
    }

    // High Score Record
    if (this.score > this.highScore) {
      this.highScore = Math.floor(this.score);
      localStorage.setItem("prabhas3DHighScore", this.highScore.toString());
    }

    setTimeout(() => {
      if (this.state === GameState3D.VICTORY) {
        this.showScreen(GameState3D.VICTORY);
      }
    }, 1800);
  }

  handleStartAction() {
    if (this.state === GameState3D.MENU) {
      this.startNewGame();
    } else if (this.state === GameState3D.GAME_OVER || this.state === GameState3D.VICTORY) {
      if (!this.gameOverLockTime || Date.now() > this.gameOverLockTime) {
        this.startNewGame();
      }
    }
  }

  handleLeft() {
    if (this.state !== GameState3D.PLAYING) return;
    const res = this.player.moveLeft();
    if (res === "barrier_hit") {
      this.handleBarrierHit();
    }
  }

  handleRight() {
    if (this.state !== GameState3D.PLAYING) return;
    const res = this.player.moveRight();
    if (res === "barrier_hit") {
      this.handleBarrierHit();
    }
  }

  handleBarrierHit() {
    if (this.player.hasShield) {
      this.player.breakShield();
      this.audio.playShieldBreak();
      this.cameraManager.shake(0.45);
    } else if (this.player.invulnerableTimer <= 0) {
      if (this.player.healAidTimer > 0) {
        // Second hit during the 5-second Bujji Aid recovery window -> Run Ends!
        this.gameOver();
      } else {
        // First hit: Trigger 5-Second Bujji Aid / Second Chance Healing!
        this.player.triggerBujjiAid(5.0);
        this.audio.playHit();
        this.audio.playDialogue("bujji");
        this.cameraManager.shake(0.5);
      }
    }
  }

  handleJump() {
    if (this.state !== GameState3D.PLAYING) return;
    if (this.player.jump()) {
      this.audio.playJump();
    }
  }

  handleSlide() {
    if (this.state !== GameState3D.PLAYING) return;
    const act = this.player.slide();
    if (act) {
      this.audio.playSlide();
    }
  }

  showScreen(targetState) {
    if (this.dom.startScreen) this.dom.startScreen.classList.toggle("active", targetState === GameState3D.MENU);
    if (this.dom.pauseScreen) this.dom.pauseScreen.classList.toggle("active", targetState === GameState3D.PAUSED);
    if (this.dom.gameOverScreen) this.dom.gameOverScreen.classList.toggle("active", targetState === GameState3D.GAME_OVER);
    if (this.dom.victoryScreen) this.dom.victoryScreen.classList.toggle("active", targetState === GameState3D.VICTORY);
    if (this.dom.hud) this.dom.hud.classList.toggle("active", targetState === GameState3D.PLAYING || targetState === GameState3D.PAUSED);
  }

  updateHud() {
    // OPTIMIZATION: Memoize DOM updates to prevent layout thrashing & battery drain
    const scoreStr = Math.floor(this.score).toString().padStart(6, "0");
    if (this._lastScore !== scoreStr) {
      if (this.dom.hudScore) this.dom.hudScore.textContent = scoreStr;
      this._lastScore = scoreStr;
    }
    
    // Mode-Aware Units & Complex Goal Progress Bar
    if (this.gameMode === "heist") {
      if (this.dom.hudGoalPill && this._lastGoalPillDisplay !== "flex") {
        this.dom.hudGoalPill.style.display = "flex";
        this._lastGoalPillDisplay = "flex";
      }

      if (this._lastUnits !== this.units) {
        if (this.dom.hudUnits) this.dom.hudUnits.textContent = `${this.units.toLocaleString()} / 1M`;
        this._lastUnits = this.units;
      }

      const rawPct = (this.units / CONFIG.TARGET_UNITS) * 100;
      const goalPct = Math.min(100, rawPct);
      const goalPctStr = Math.floor(goalPct);
      if (this._lastGoalPct !== goalPctStr) {
        if (this.dom.hudGoalPct) this.dom.hudGoalPct.textContent = `${goalPctStr}%`;
        if (this.dom.hudGoalFill) this.dom.hudGoalFill.style.width = `${goalPct}%`;
        this._lastGoalPct = goalPctStr;
      }
    } else {
      // Endless Survival Mode
      if (this.dom.hudGoalPill && this._lastGoalPillDisplay !== "none") {
        this.dom.hudGoalPill.style.display = "none";
        this._lastGoalPillDisplay = "none";
      }

      if (this._lastUnits !== this.units) {
        if (this.dom.hudUnits) this.dom.hudUnits.textContent = `${this.units.toLocaleString()} UNITS`;
        this._lastUnits = this.units;
      }
    }

    // Active Power-Up Badges Stacked Vertically (Bottom Left)
    if (this.player) {
      // 1. Jetpack
      const showJetpack = this.player.hasJetpack;
      if (this._lastJetpackShow !== showJetpack) {
        if (this.dom.badgeJetpack) this.dom.badgeJetpack.style.display = showJetpack ? "flex" : "none";
        this._lastJetpackShow = showJetpack;
      }
      if (showJetpack && this.dom.fillJetpack) {
        const pct = Math.floor(Math.max(0, (this.player.jetpackTimer / CONFIG.JETPACK_DURATION) * 100));
        if (this._lastJetpackPct !== pct) {
          this.dom.fillJetpack.style.width = `${pct}%`;
          this._lastJetpackPct = pct;
        }
      }

      // 2. Magnet
      const showMagnet = this.player.hasMagnet;
      if (this._lastMagnetShow !== showMagnet) {
        if (this.dom.badgeMagnet) this.dom.badgeMagnet.style.display = showMagnet ? "flex" : "none";
        this._lastMagnetShow = showMagnet;
      }
      if (showMagnet && this.dom.fillMagnet) {
        const pct = Math.floor(Math.max(0, (this.player.magnetTimer / CONFIG.MAGNET_DURATION) * 100));
        if (this._lastMagnetPct !== pct) {
          this.dom.fillMagnet.style.width = `${pct}%`;
          this._lastMagnetPct = pct;
        }
      }

      // 3. 2X Multiplier
      const showMultiplier = this.player.hasMultiplier;
      if (this._lastMultShow !== showMultiplier) {
        if (this.dom.badgeMultiplier) this.dom.badgeMultiplier.style.display = showMultiplier ? "flex" : "none";
        this._lastMultShow = showMultiplier;
      }
      if (showMultiplier && this.dom.fillMultiplier) {
        const pct = Math.floor(Math.max(0, (this.player.multiplierTimer / CONFIG.DOUBLE_POINTS_DURATION) * 100));
        if (this._lastMultPct !== pct) {
          this.dom.fillMultiplier.style.width = `${pct}%`;
          this._lastMultPct = pct;
        }
      }

      // 4. Shield
      const showShield = this.player.hasShield;
      if (this._lastShieldShow !== showShield) {
        if (this.dom.badgeShield) this.dom.badgeShield.style.display = showShield ? "flex" : "none";
        this._lastShieldShow = showShield;
      }
    }
  }

  gameLoop(timestamp) {
    const rawDt = (timestamp - this.lastTime) / 1000;
    const dt = Math.max(0.001, Math.min(rawDt, 0.05));
    this.lastTime = timestamp;

    if (this.state === GameState3D.PLAYING) {
      this.update(dt, timestamp * 0.001);
    } else if (this.state === GameState3D.VICTORY) {
      // Cinematic ascension up the tractor beam into the Complex
      this.player.position.y += dt * 18;
      this.player.root.position.copy(this.player.position);
      this.cameraManager.update(dt, this.player.position, 0);
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }

    this.animId = requestAnimationFrame((t) => this.gameLoop(t));
  }

  update(dt, time) {
    // 1. Progression & Speed Scaling
    const mult = this.player.hasMultiplier ? 2 : 1;
    this.score += dt * this.currentSpeed * 1.5 * mult;
    this.currentSpeed = Math.min(CONFIG.MAX_SPEED, this.currentSpeed + CONFIG.SPEED_ACCELERATION * dt * 20);
    this.audio.updateSpeed(this.currentSpeed, CONFIG.INITIAL_SPEED, CONFIG.MAX_SPEED);

    // 2. Update Player Kinematics
    this.player.update(dt, this.currentSpeed, time);

    // 3. Update Infinite Track Segments & Complex Environment
    this.trackPool.update(this.player.position.z, this.player.hasJetpack, dt);
    this.environment.update(time, this.player.position.z);

    // 4. Update Third-Person Follow Camera
    this.cameraManager.update(dt, this.player.position, this.currentSpeed);

    // 5. Collision Detection (Obstacles - Spatially Filtered around Player)
    const activeObstacles = this.trackPool.getAllActiveObstacles(this.player.position.z);
    const hitResult = CollisionManager3D.checkObstacleCollisions(this.player, activeObstacles);

    if (hitResult) {
      if (this.player.hasShield) {
        // Shield absorbs collision
        this.player.breakShield();
        this.audio.playShieldBreak();
        this.cameraManager.shake(0.45);

        // If hitting a train with a shield, pop cleanly onto the roof rather than clipping through inside
        if (hitResult.obstacle && hitResult.obstacle.type === "train") {
          this.player.position.y = 4.15;
          this.player.groundElevation = 4.15;
          this.player.isGrounded = true;
          this.player.velocityY = 1.8;
        }
      } else if (this.player.invulnerableTimer <= 0) {
        if (this.player.healAidTimer > 0) {
          // Second hit during the 5-second Bujji Aid recovery window -> Run Ends!
          this.gameOver();
          return;
        } else {
          // First hit: Trigger 5-Second Bujji Aid / Second Chance Healing!
          this.player.triggerBujjiAid(5.0);
          this.audio.playHit();
          this.audio.playDialogue("bujji");
          this.cameraManager.shake(0.55);

          // If hitting a train, pop cleanly onto the roof so the player doesn't clip inside
          if (hitResult.obstacle && hitResult.obstacle.type === "train") {
            this.player.position.y = 4.15;
            this.player.groundElevation = 4.15;
            this.player.isGrounded = true;
            this.player.velocityY = 1.8;
          }
        }
      }
    }

    // 6. Collectible Item Pickup & Magnet Attraction (Spatially Filtered around Player)
    const activeCollectibles = this.trackPool.getAllActiveCollectibles(this.player.hasJetpack, this.player.position.z);
    const collected = CollisionManager3D.checkCollectiblePickups(this.player, activeCollectibles, dt);

    for (const item of collected) {
      if (item.type === "coin") {
        const prevUnits = this.units;
        this.units += item.points * mult;
        this.score += item.points * mult;
        this.audio.playCoin(mult);

        // Milestone audio cues (Every 200k Units)
        if (Math.floor(this.units / 200000) > Math.floor(prevUnits / 200000)) {
          this.audio.playDialogue("milestone");
        }

        // Win Condition: 1 Million Units in Complex Heist mode -> Unlocks entry to Complex!
        if (this.gameMode === "heist" && this.units >= CONFIG.TARGET_UNITS) {
          this.victory();
          return;
        }
      } else if (item.type === "powerup") {
        this.audio.playPowerup();
        if (item.powerupType === "magnet") {
          this.player.giveMagnet(item.duration);
        } else if (item.powerupType === "jetpack") {
          this.player.giveJetpack(item.duration);
          this.audio.playDialogue("jetpack");
        } else if (item.powerupType === "shield") {
          this.player.giveShield();
        } else if (item.powerupType === "multiplier") {
          this.player.giveMultiplier(item.duration);
        }
      }
    }

    // 7. Update HUD Display
    this.updateHud();
  }
}
