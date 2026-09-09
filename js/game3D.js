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
    // Bounty system disabled for now - will be implemented one by one
    this.bountyManager = null;
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

  safeAudio(fnName, ...args) {
    if (this.audio && typeof this.audio[fnName] === "function") {
      try {
        this.audio[fnName](...args);
      } catch (e) {
        console.warn(`Audio call '${fnName}' error:`, e);
      }
    }
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
      onShoot: () => this.handleShoot(),
      onPause: () => this.togglePause(),
      onStart: () => this.handleStartAction()
    });

    this.bindUi();
    this.setGameMode(this.gameMode);
    this.updateMenuStats();
    this.updateHud();
    this.showScreen(GameState3D.MENU);
    this.initLoading();

    window.addEventListener("resize", () => this.handleResize());

    // Battery & Performance: Handle background tab visibility
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (this.state === GameState3D.PLAYING) {
          this.togglePause();
        }
        if (this.audio) {
          this.audio.suspendContext();
        }
      } else {
        if (this.audio && this.state === GameState3D.PLAYING) {
          this.audio.ensureContext();
        }
      }
    });

    // Start 60 FPS Loop
    this.lastTime = performance.now();
    this.lastRenderTime = performance.now();
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

    // WebGL Renderer (Optimized for low-power photorealism)
    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: "high-performance",
      depth: true,
      stencil: false,
      alpha: false
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    container.appendChild(this.renderer.domElement);

    // Warm Subtle Rim Backlight for Hero Silhouettes (Balanced)
    this.rimLight = new THREE.DirectionalLight(0xF59E0B, 0.45);
    this.rimLight.position.set(-15, 12, 10);
    this.rimLightTarget = new THREE.Object3D();
    this.scene.add(this.rimLightTarget);
    this.rimLight.target = this.rimLightTarget;
    this.scene.add(this.rimLight);

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
      // Loading Screen Elements
      loadingScreen: document.getElementById("loading-screen"),
      loadingFill: document.getElementById("loading-bar-fill"),
      loadingStatus: document.getElementById("loading-status-text"),
      loadingPct: document.getElementById("loading-pct-text"),

      // In-Game HUD
      hud: document.getElementById("game-hud"),
      hudScore: document.getElementById("hud-score-val"),
      hudUnits: document.getElementById("hud-units-val"),
      hudGoalPill: document.getElementById("hud-goal-pill"),
      hudGoalPct: document.getElementById("hud-goal-pct"),
      hudGoalFill: document.getElementById("hud-goal-fill"),

      // Menu Badges (Subway Surfers Header)
      menuHighScore: document.getElementById("menu-high-score-val"),
      menuVaultUnits: document.getElementById("menu-vault-units-val"),
      btnMenuSound: document.getElementById("btn-menu-sound-toggle"),
      menuSoundIcon: document.getElementById("menu-sound-icon-img"),

      // Stacked Power-Up Badges (Bottom Left)
      badgeJetpack: document.getElementById("badge-jetpack"),
      fillJetpack: document.getElementById("jetpack-timer-fill"),
      badgeMagnet: document.getElementById("badge-magnet"),
      fillMagnet: document.getElementById("magnet-timer-fill"),
      badgeMultiplier: document.getElementById("badge-multiplier"),
      fillMultiplier: document.getElementById("multiplier-timer-fill"),
      badgeShield: document.getElementById("badge-shield"),
      badgeHarpoon: document.getElementById("badge-harpoon"),
      fillHarpoon: document.getElementById("harpoon-timer-fill"),

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

    const updateAudioIcons = (isMuted) => {
      const iconSrc = isMuted ? "assets/ui/sound-off.svg" : "assets/ui/sound-on.svg";
      if (this.dom.soundIcon) this.dom.soundIcon.src = iconSrc;
      if (this.dom.menuSoundIcon) this.dom.menuSoundIcon.src = iconSrc;
    };

    if (this.dom.btnSound) {
      this.dom.btnSound.addEventListener("click", () => {
        const isMuted = this.audio.toggleMute();
        updateAudioIcons(isMuted);
      });
    }
    if (this.dom.btnMenuSound) {
      this.dom.btnMenuSound.addEventListener("click", () => {
        const isMuted = this.audio.toggleMute();
        updateAudioIcons(isMuted);
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
    this.safeAudio("init");
    this.safeAudio("playMusic");
    this.safeAudio("playDialogue", "bujji");
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
    this.safeAudio("playDialogue", "bujji");
  }

  togglePause() {
    if (this.state === GameState3D.PLAYING) {
      this.state = GameState3D.PAUSED;
      this.safeAudio("pauseMusic");
      this.showScreen(GameState3D.PAUSED);
    } else if (this.state === GameState3D.PAUSED) {
      this.resumeGame();
    }
  }

  resumeGame() {
    if (this.state !== GameState3D.PAUSED) return;
    this.state = GameState3D.PLAYING;
    this.safeAudio("playMusic");
    this.showScreen(GameState3D.PLAYING);
    this.lastTime = performance.now();
  }

  initLoading() {
    const loadingScreen = this.dom.loadingScreen || document.getElementById("loading-screen");
    const fill = this.dom.loadingFill || document.getElementById("loading-bar-fill");
    const status = this.dom.loadingStatus || document.getElementById("loading-status-text");
    const pct = this.dom.loadingPct || document.getElementById("loading-pct-text");

    const steps = [
      { progress: 28, text: "CALIBRATING GAUNTLET..." },
      { progress: 58, text: "LINKING BUJJI AI CORE..." },
      { progress: 88, text: "BUILDING HIGH-SPEED TRACK..." },
      { progress: 100, text: "RUNNER READY" }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        if (fill) fill.style.width = `${step.progress}%`;
        if (pct) pct.textContent = `${step.progress}%`;
        if (status) status.textContent = step.text;
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          if (loadingScreen) {
            loadingScreen.classList.remove("active");
            setTimeout(() => {
              loadingScreen.style.display = "none";
            }, 500);
          }
        }, 150);
      }
    }, 120);
  }

  updateMenuStats() {
    if (this.dom.menuHighScore) {
      this.dom.menuHighScore.textContent = this.highScore.toString().padStart(6, "0");
    }
    if (this.dom.menuVaultUnits) {
      this.dom.menuVaultUnits.textContent = this.vaultUnits.toLocaleString();
    }
  }

  showMenu() {
    this.state = GameState3D.MENU;
    this.safeAudio("stopMusic");
    this.updateMenuStats();
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
    this.safeAudio("pauseMusic");
    this.safeAudio("playHit");
    this.cameraManager.shake(0.8);

    if (this.score > this.highScore) {
      this.highScore = Math.floor(this.score);
      localStorage.setItem("prabhas3DHighScore", this.highScore.toString());
    }

    this.vaultUnits += this.units;
    localStorage.setItem("prabhas3DVaultUnits", this.vaultUnits.toString());
    this.updateMenuStats();

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
    this.safeAudio("playPowerup");
    this.safeAudio("playDialogue", "complex");

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

    this.vaultUnits += this.units;
    localStorage.setItem("prabhas3DVaultUnits", this.vaultUnits.toString());
    this.updateMenuStats();

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
      this.safeAudio("playShieldBreak");
      this.cameraManager.shake(0.45);
    } else if (this.player.invulnerableTimer <= 0) {
      if (this.player.healAidTimer > 0) {
        // Second hit during the 5-second Bujji Aid recovery window -> Run Ends!
        this.gameOver();
      } else {
        // First hit: Trigger 5-Second Bujji Aid / Second Chance Healing!
        this.player.triggerBujjiAid(5.0);
        this.safeAudio("playHit");
        this.safeAudio("playDialogue", "bujji");
        this.cameraManager.shake(0.5);
      }
    }
  }

  handleShoot() {
    if (this.state !== GameState3D.PLAYING) return;
    const shot = this.player.shootLaser();
    if (shot) {
      this.safeAudio("playLaser");
      this.cameraManager.shake(0.15);

      const activeObstacles = this.trackPool.getAllActiveObstacles(this.player.position.z);
      const hitEntities = CollisionManager3D.checkLaserCollisions(shot, activeObstacles);
      let closestZ = 38.0;
      for (let hit of hitEntities) {
        const dist = (hit.obstacle.worldPos.z - hit.obstacle.mesh.geometry.boundingSphere?.radius || 0) - this.player.position.z;
        if (dist > 0 && dist < closestZ) {
          closestZ = dist;
        }
      }
      this.player.shootLaser(closestZ);

      for (let hit of hitEntities) {
        if (hit.type === "laser_destructible_hit" || hit.type === "laser_hurdle_hit" || hit.type === "laser_obstacle_destroyed") {
          const obs = hit.obstacle;
          const defaultHp = obs.type === "train" ? 20 : 8;
          const currentHp = obs.hp !== undefined ? obs.hp : (obs.mesh && obs.mesh.userData && obs.mesh.userData.hp !== undefined ? obs.mesh.userData.hp : defaultHp);
          obs.hp = currentHp - 1;
          if (obs.mesh && obs.mesh.userData) {
            obs.mesh.userData.hp = obs.hp;
          }

          this.safeAudio("playHit");
          this.cameraManager.shake(obs.type === "train" ? 0.22 : 0.16);

          // Visual hit reaction recoil & damage flicker on obstacle
          if (obs.mesh) {
            const origX = obs.mesh.position.x;
            obs.mesh.position.x += (Math.random() - 0.5) * (obs.type === "train" ? 0.22 : 0.16);
            setTimeout(() => { if (obs.mesh) obs.mesh.position.x = origX; }, 60);
          }

          // Destroyed once HP is exhausted (8 hits for barriers & laser gates, 20 hits for trains)
          if (obs.hp <= 0) {
            obs.destroyed = true;
            if (obs.mesh) {
              obs.mesh.visible = false;
              if (obs.mesh.userData) obs.mesh.userData.destroyed = true;
            }
            this.safeAudio("playHit");
            this.cameraManager.shake(obs.type === "train" ? 0.55 : 0.3);
            this.safeAudio("playDialogue", "laser");
          }
        }
      }
    }
  }

  showFloatingBountyBanner(text, type = "normal") {
    let banner = document.getElementById("hud-bounty-banner");
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "hud-bounty-banner";
      banner.className = "bounty-hud-pill";
      if (this.dom.hud) this.dom.hud.appendChild(banner);
    }
    banner.textContent = text;
    banner.className = `bounty-hud-pill active ${type === "boss" ? "boss-warning" : ""}`;

    clearTimeout(this._bountyBannerTimeout);
    this._bountyBannerTimeout = setTimeout(() => {
      banner.className = "bounty-hud-pill";
    }, 2400);
  }

  onBountyCaptured(data) {
    this.updateBountyBoard();
  }

  onContractComplete(contract, reward) {
    this.units += reward;
    this.score += reward;
    this.audio.playDialogue("complex");
    this.showFloatingBountyBanner(`🏆 CONTRACT COMPLETED: ${contract.title} (+${reward.toLocaleString()} UNITS)`);
    this.updateBountyBoard();
  }

  onStreakChange(count, mult) {
    const badge = document.getElementById("hud-streak-badge");
    if (badge) {
      if (count >= 2) {
        badge.style.display = "flex";
        badge.textContent = `🔥 ${mult}X STREAK (${count})`;
      } else {
        badge.style.display = "none";
      }
    }
  }

  updateBountyBoard() {
    const listEl = document.getElementById("bounty-contracts-list");
    const rankEl = document.getElementById("bounty-rank-badge");
    if (rankEl) {
      const rank = this.bountyManager.getHunterRank();
      rankEl.textContent = `${rank.icon} ${rank.badge} - ${rank.title}`;
    }

    if (listEl && this.bountyManager) {
      listEl.innerHTML = this.bountyManager.contracts.map(c => `
        <div class="contract-card ${c.completed ? 'completed' : ''}">
          <div class="contract-header">
            <span class="contract-title">${c.title}</span>
            <span class="contract-reward">+${c.reward.toLocaleString()} UNITS</span>
          </div>
          <div class="contract-desc">${c.desc}</div>
          <div class="contract-progress-bar">
            <div class="contract-fill" style="width: ${(c.current / c.target) * 100}%"></div>
          </div>
          <div class="contract-status">${c.completed ? 'COMPLETED' : `${c.current} / ${c.target}`}</div>
        </div>
      `).join('');
    }
  }

  handleJump() {
    if (this.state !== GameState3D.PLAYING) return;
    if (this.player.jump()) {
      this.safeAudio("playJump");
    }
  }

  handleSlide() {
    if (this.state !== GameState3D.PLAYING) return;
    const act = this.player.slide();
    if (act) {
      this.safeAudio("playSlide");
    }
  }

  showScreen(targetState) {
    if (targetState === GameState3D.MENU) {
      this.updateMenuStats();
    }
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

      // 5. Bujji EMP Harpoon
      const showHarpoon = this.player.hasHarpoon;
      if (this._lastHarpoonShow !== showHarpoon) {
        if (this.dom.badgeHarpoon) this.dom.badgeHarpoon.style.display = showHarpoon ? "flex" : "none";
        this._lastHarpoonShow = showHarpoon;
      }
      if (showHarpoon && this.dom.fillHarpoon) {
        const pct = Math.floor(Math.max(0, (this.player.harpoonTimer / 8.0) * 100));
        if (this._lastHarpoonPct !== pct) {
          this.dom.fillHarpoon.style.width = `${pct}%`;
          this._lastHarpoonPct = pct;
        }
      }
    }
  }

  gameLoop(timestamp) {
    this.animId = requestAnimationFrame((t) => this.gameLoop(t));

    // Power optimization: Throttle rendering
    if (this.state !== GameState3D.PLAYING && this.state !== GameState3D.VICTORY) {
      if (timestamp - this.lastRenderTime < 40) return;
    } else {
      // 60 FPS cap during gameplay to save 50% battery on 120Hz displays
      if (timestamp - this.lastRenderTime < 16) return;
    }
    this.lastRenderTime = timestamp;

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
  }

  update(dt, time) {
    // 1. Progression & Speed Scaling
    const mult = this.player.hasMultiplier ? 2 : 1;
    this.score += dt * this.currentSpeed * 1.5 * mult;
    this.currentSpeed = Math.min(CONFIG.MAX_SPEED, this.currentSpeed + CONFIG.SPEED_ACCELERATION * dt * 20);
    this.safeAudio("updateSpeed", this.currentSpeed, CONFIG.INITIAL_SPEED, CONFIG.MAX_SPEED);

    // 2. Update Player Kinematics
    this.player.update(dt, this.currentSpeed, time);

    // 3. Update Infinite Track Segments & Complex Environment
    this.trackPool.update(this.player.position.z, this.player.hasJetpack, dt);
    this.environment.update(time, this.player.position.z);

    // 4. Update Third-Person Follow Camera & Cinematic Lighting
    this.cameraManager.update(dt, this.player.position, this.currentSpeed);
    if (this.rimLight && this.rimLightTarget) {
      this.rimLight.position.set(-15, 14, this.player.position.z + 10);
      this.rimLightTarget.position.set(0, 1.5, this.player.position.z);
    }

    // 5. Collision Detection (Standard Obstacles: Trains, Hurdles, Laser Gates)
    const activeObstacles = this.trackPool.getAllActiveObstacles(this.player.position.z);
    const hitResult = CollisionManager3D.checkObstacleCollisions(this.player, activeObstacles);

    if (hitResult && hitResult.type === "collision") {
      if (this.player.hasShield) {
        // Shield absorbs collision
        this.player.breakShield();
        this.safeAudio("playShieldBreak");
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
          this.safeAudio("playHit");
          this.safeAudio("playDialogue", "bujji");
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
        this.safeAudio("playCoin", mult);

        // Milestone audio cues (Every 200k Units)
        if (Math.floor(this.units / 200000) > Math.floor(prevUnits / 200000)) {
          this.safeAudio("playDialogue", "milestone");
        }

        // Win Condition: 1 Million Units in Complex Heist mode -> Unlocks entry to Complex!
        if (this.gameMode === "heist" && this.units >= CONFIG.TARGET_UNITS) {
          this.victory();
          return;
        }
      } else if (item.type === "powerup") {
        this.safeAudio("playPowerup");
        if (item.powerupType === "magnet") {
          this.player.giveMagnet(item.duration);
          this.safeAudio("playDialogue", "magnet");
        } else if (item.powerupType === "jetpack") {
          this.player.giveJetpack(item.duration);
          this.safeAudio("playDialogue", "jetpack");
        } else if (item.powerupType === "shield") {
          this.player.giveShield();
          this.safeAudio("playDialogue", "shield");
        } else if (item.powerupType === "multiplier") {
          this.player.giveMultiplier(item.duration);
          this.safeAudio("playDialogue", "multiplier");
        }
      }
    }

    // 7. Update HUD Display
    this.updateHud();
  }
}
