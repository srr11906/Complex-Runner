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
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
      hudHighScore: document.getElementById("hud-high-val"),
      hudUnits: document.getElementById("hud-units-val"),
      hudGoalPct: document.getElementById("hud-goal-pct"),
      hudGoalFill: document.getElementById("hud-goal-fill"),
      powerupBadge: document.getElementById("hud-powerup-badge"),
      powerupName: document.getElementById("powerup-name"),
      powerupFill: document.getElementById("powerup-timer-fill"),

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
    this.player.moveLeft();
  }

  handleRight() {
    if (this.state !== GameState3D.PLAYING) return;
    this.player.moveRight();
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
    if (this.dom.hudScore) this.dom.hudScore.textContent = Math.floor(this.score).toString().padStart(6, "0");
    if (this.dom.hudHighScore) this.dom.hudHighScore.textContent = this.highScore.toString().padStart(6, "0");
    
    // 1M Units Progress
    const goalPct = Math.min(100, (this.units / CONFIG.TARGET_UNITS) * 100);
    if (this.dom.hudUnits) this.dom.hudUnits.textContent = `${this.units.toLocaleString()} / 1,000,000`;
    if (this.dom.hudGoalPct) this.dom.hudGoalPct.textContent = `${Math.floor(goalPct)}%`;
    if (this.dom.hudGoalFill) this.dom.hudGoalFill.style.width = `${goalPct}%`;

    // Active Power-Up Badge Display (Clean text, no emojis)
    if (this.dom.powerupBadge) {
      let activeName = "";
      let pct = 0;

      if (this.player && this.player.hasJetpack) {
        activeName = "JETPACK";
        pct = (this.player.jetpackTimer / CONFIG.JETPACK_DURATION) * 100;
      } else if (this.player && this.player.hasMagnet) {
        activeName = "MAGNET";
        pct = (this.player.magnetTimer / CONFIG.MAGNET_DURATION) * 100;
      } else if (this.player && this.player.hasMultiplier) {
        activeName = "2X UNITS";
        pct = (this.player.multiplierTimer / CONFIG.DOUBLE_POINTS_DURATION) * 100;
      } else if (this.player && this.player.hasShield) {
        activeName = "SHIELD";
        pct = 100;
      }

      if (activeName) {
        this.dom.powerupBadge.style.display = "flex";
        if (this.dom.powerupName) this.dom.powerupName.textContent = activeName;
        if (this.dom.powerupFill) this.dom.powerupFill.style.width = `${Math.max(0, pct)}%`;
      } else {
        this.dom.powerupBadge.style.display = "none";
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

    // 5. Collision Detection (Obstacles)
    const activeObstacles = this.trackPool.getAllActiveObstacles();
    const hitResult = CollisionManager3D.checkObstacleCollisions(this.player, activeObstacles);

    if (hitResult) {
      if (this.player.hasShield) {
        // Shield absorbs collision
        this.player.breakShield();
        this.audio.playShieldBreak();
        this.cameraManager.shake(0.4);
      } else {
        this.gameOver();
        return;
      }
    }

    // 6. Collectible Item Pickup & Magnet Attraction (Switches between ground vs sky coins)
    const activeCollectibles = this.trackPool.getAllActiveCollectibles(this.player.hasJetpack);
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

        // Win Condition: 1 Million Units -> Unlocks entry to Complex!
        if (this.units >= CONFIG.TARGET_UNITS) {
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
