/**
 * COMPLEX RUNNER - Next-Gen 3D Sci-Fi Runner
 * Core 3D Game Engine & WebGL Render Loop with 1 Million Units Goal
 */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { CONFIG } from "./config.js?v=20260914_jetpack_v24";
import { AudioManager3D } from "./audio.js?v=20260914_jetpack_v24";
import { InputManager3D } from "./input.js?v=20260914_jetpack_v24";
import { Player3D } from "./player3D.js?v=20260914_jetpack_v24";
import { Environment3D } from "./world/environment.js?v=20260914_jetpack_v24";
import { TrackSegmentPool3D } from "./world/segmentPool.js?v=20260914_jetpack_v24";
import { CameraManager3D } from "./cameraManager.js?v=20260914_jetpack_v24";
import { CollisionManager3D } from "./collision3D.js?v=20260914_jetpack_v24";
import { MonsterRobotModel } from "./models/monsterRobotModel.js?v=20260914_jetpack_v24";

export const GameState3D = {
  MENU: "menu",
  PLAYING: "playing",
  PAUSED: "paused",
  GAME_OVER: "gameover",
  VICTORY: "victory"
};

export class GameEngine3D {
  constructor() {
    const savedMode = localStorage.getItem("prabhas3DGameMode");
    this.gameMode = savedMode === "endless" ? "endless" : "heist";
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
    this.monsterRobot = null;
    this.lastMiniMilestone = 0;
    this.lastApexMilestone = 0;
    this.monsterSpawnCount = 0;

    // Power-Up Upgrades (Persistent levels 1-6)
    const defaultUpgrades = { shield: 1, magnet: 1, jetpack: 1, multiplier: 1 };
    try {
      this.powerupUpgrades = JSON.parse(localStorage.getItem("prabhas3DPowerupUpgrades")) || defaultUpgrades;
    } catch (e) {
      this.powerupUpgrades = defaultUpgrades;
    }

    // Monster Mode Toggle (ON by default)
    this.monsterEnabled = localStorage.getItem("prabhas3DMonsterToggle") !== "false";
    this.lastApexMilestone = 0;

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
    this.monsterRobots = Array.from({ length: 4 }, () => new MonsterRobotModel(this.scene));
    this.monsterRobot = this.monsterRobots[0];
    window.gameEngine3D = this;

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
    this.updateMonsterToggleUI();
    this.updateMenuStats();
    this.updateHud();
    this.showScreen(GameState3D.MENU);
    this.initLoading();

    // Unlock audio context and start main menu music on first user interaction
    const unlockMenuAudio = () => {
      if (this.state === GameState3D.MENU) {
        this.safeAudio("playMenuMusic");
      }
      window.removeEventListener("pointerdown", unlockMenuAudio);
      window.removeEventListener("keydown", unlockMenuAudio);
    };
    window.addEventListener("pointerdown", unlockMenuAudio);
    window.addEventListener("keydown", unlockMenuAudio);

    window.addEventListener("resize", () => this.handleResize());

    // Battery & Performance: Handle background tab visibility
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this._isTabHidden = true;
        if (this.state === GameState3D.PLAYING) {
          this.togglePause();
        }
        if (this.audio) {
          this.audio.suspendContext();
          if (typeof this.audio.stopProceduralBgm === "function") {
            this.audio.stopProceduralBgm();
          }
        }
      } else {
        this._isTabHidden = false;
        this.lastTime = performance.now();
        this.lastRenderTime = performance.now();
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

    // WebGL Renderer (High-definition AAA photorealism with 1.5x retina cap for 43.75% GPU power savings)
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      depth: true,
      stencil: false,
      alpha: false
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
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
      fillShield: document.getElementById("shield-timer-fill"),
      badgeHarpoon: document.getElementById("badge-harpoon"),
      fillHarpoon: document.getElementById("harpoon-timer-fill"),

      // Mission Mode Selectors
      btnModeHeist: document.getElementById("mode-btn-heist"),
      btnModeEndless: document.getElementById("mode-btn-endless"),
      btnModeComplex: document.getElementById("mode-btn-complex"),

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
      btnPause: document.getElementById("btn-pause-toggle"),

      // Monster Toggle & Armory Shop
      btnMonsterToggle: document.getElementById("btn-monster-toggle"),
      monsterToggleStatus: document.getElementById("monster-toggle-status"),
      btnOpenArmory: document.getElementById("btn-open-armory"),
      armoryModal: document.getElementById("armory-modal-screen"),
      btnCloseArmory: document.getElementById("btn-close-armory"),
      btnArmoryBack: document.getElementById("btn-armory-back"),
      shopVaultUnits: document.getElementById("shop-vault-units-val"),

      // Cached Dynamic HUD & Bounty Elements (Zero DOM Layout Thrashing)
      bountyBanner: document.getElementById("hud-bounty-banner"),
      streakBadge: document.getElementById("hud-streak-badge"),
      bountyContractsList: document.getElementById("bounty-contracts-list"),
      bountyRankBadge: document.getElementById("bounty-rank-badge")
    };
  }

  bindUi() {
    if (this.dom.btnModeHeist) {
      this.dom.btnModeHeist.addEventListener("click", () => this.setGameMode("heist"));
    }
    if (this.dom.btnModeEndless) {
      this.dom.btnModeEndless.addEventListener("click", () => this.setGameMode("endless"));
    }
    if (this.dom.btnModeComplex) {
      this.dom.btnModeComplex.addEventListener("click", () => this.setGameMode("complex"));
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
    if (this.dom.btnMonsterToggle) {
      this.dom.btnMonsterToggle.addEventListener("click", () => this.toggleMonsterMode());
    }
    if (this.dom.btnOpenArmory) {
      this.dom.btnOpenArmory.addEventListener("click", () => this.openArmoryShop());
    }
    if (this.dom.btnCloseArmory) {
      this.dom.btnCloseArmory.addEventListener("click", () => this.closeArmoryShop());
    }
    if (this.dom.btnArmoryBack) {
      this.dom.btnArmoryBack.addEventListener("click", () => this.closeArmoryShop());
    }

    // Power-Up Upgrade Buttons
    const upgradeTypes = ["shield", "magnet", "jetpack", "multiplier"];
    upgradeTypes.forEach(type => {
      const btn = document.getElementById(`btn-upgrade-${type}`);
      if (btn) {
        btn.addEventListener("click", () => this.upgradePowerup(type));
      }
    });

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
    if (this.dom.btnModeComplex) {
      this.dom.btnModeComplex.classList.toggle("active", mode === "complex");
    }

    const isComplex = mode === "complex";
    if (this.player) this.player.setOutfit(isComplex ? "complex" : "wasteland");
    if (this.trackPool) this.trackPool.setTheme(isComplex ? "complex" : "wasteland");
    if (this.environment) this.environment.setTheme(isComplex ? "complex" : "wasteland");

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
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
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

    const isComplex = this.gameMode === "complex";
    this.player.reset();
    this.player.setOutfit(isComplex ? "complex" : "wasteland");

    this.trackPool.init();
    this.trackPool.setTheme(isComplex ? "complex" : "wasteland");
    if (this.environment) this.environment.setTheme(isComplex ? "complex" : "wasteland");

    this.lastMiniMilestone = 0;
    this.lastApexMilestone = 0;
    this.monsterSpawnCount = 0;
    if (this.monsterRobots) {
      this.monsterRobots.forEach(bot => {
        bot.active = false;
        if (bot.root) bot.root.visible = false;
      });
    }

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
    const pctText = this.dom.loadingPct || document.getElementById("loading-pct-text");
    const statusText = this.dom.loadingStatus || document.getElementById("loading-status-text");

    let progress = 0;
    const stages = [
      "CALIBRATING NEURAL LINK...",
      "SYNCHRONIZING BHAIRAVA KINEMATICS...",
      "SCANNING HIGHWAY SECTORS...",
      "WARMING PLASMA GAUNTLETS...",
      "COMPLEX RUNNER INITIALIZED"
    ];

    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 18) + 12;
      if (progress > 100) progress = 100;

      if (fill) fill.style.width = `${progress}%`;
      if (pctText) pctText.textContent = `${progress}%`;
      const stageIdx = Math.min(stages.length - 1, Math.floor((progress / 100) * stages.length));
      if (statusText) statusText.textContent = stages[stageIdx];

      if (progress >= 100) {
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
    this.safeAudio("playMenuMusic");
    this.updateMenuStats();
    this.showScreen(GameState3D.MENU);
    this._lastUnits = null;
    this._lastScore = null;
    this._lastGoalPct = null;
    this._lastGoalPillDisplay = null;
    this.player.reset();
    this.trackPool.clear();
    this.lastMiniMilestone = 0;
    this.lastApexMilestone = 0;
    this.monsterSpawnCount = 0;
    if (this.monsterRobots) {
      this.monsterRobots.forEach(bot => {
        bot.active = false;
        if (bot.root) bot.root.visible = false;
      });
    }
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
    if (this.state !== GameState3D.PLAYING || this.player.hasJetpack) return;

    const laserData = {
      shot: true,
      laneX: this.player.targetX,
      playerZ: this.player.position.z,
      range: 55.0
    };

    const activeObstacles = this.trackPool.getAllActiveObstacles(this.player.position.z);
    const hitEntities = CollisionManager3D.checkLaserCollisions(laserData, activeObstacles, this.monsterRobots);

    let hitDistance = 55.0;
    if (hitEntities.length > 0) {
      hitDistance = hitEntities[0].distance;
    }

    // Trigger visual laser beam with precise distance to obstacle
    const shot = this.player.shootLaser(hitDistance);
    if (!shot || !shot.shot) return;

    this.safeAudio("playLaser");
    this.cameraManager.shake(0.12);

    for (let hit of hitEntities) {
      if (hit.type === "laser_monster_robot_hit") {
        const res = hit.robot.takeLaserHit();
        this.safeAudio("playHit");
        this.cameraManager.shake(0.22);
        if (res.destroyed) {
          this.safeAudio("playHit");
          this.safeAudio("playDialogue", "laser");
          this.cameraManager.shake(0.65);
          this.showFloatingBountyBanner("⚔️ WASTELANDS HARVESTER DESTROYED!", "boss");
        }
      } else if (hit.type === "laser_destructible_hit" || hit.type === "laser_hurdle_hit" || hit.type === "laser_obstacle_destroyed") {
        const obs = hit.obstacle;
        const defaultHp = obs.type === "train" ? 10 : 6;
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

        // Destroyed once HP is exhausted (6 hits for barriers & laser gates, 10 hits for trains)
        if (obs.hp <= 0) {
          obs.destroyed = true;
          this.destroyedObstaclesCount = (this.destroyedObstaclesCount || 0) + 1;
          if (this.menuManager) this.menuManager.recordMissionProgress("laser_destroy", 1);
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

  showFloatingBountyBanner(text, type = "normal") {
    let banner = this.dom.bountyBanner || document.getElementById("hud-bounty-banner");
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "hud-bounty-banner";
      banner.className = "bounty-hud-pill";
      if (this.dom.hud) this.dom.hud.appendChild(banner);
      this.dom.bountyBanner = banner;
    }
    banner.textContent = text;
    let extraClass = "";
    if (type === "boss") extraClass = "boss-warning";
    else if (type === "shield-convert") extraClass = "shield-convert";
    banner.className = `bounty-hud-pill active ${extraClass}`.trim();

    clearTimeout(this._bountyBannerTimeout);
    this._bountyBannerTimeout = setTimeout(() => {
      if (banner) banner.className = "bounty-hud-pill";
    }, 2400);
  }

  onBountyCaptured(data) {
    this.updateBountyBoard();
  }

  onContractComplete(contract, reward) {
    this.units += reward;
    this.score += reward;
    this.audio.playDialogue("complex");
    this.showFloatingBountyBanner(`🏆 CONTRACT COMPLETED: ${contract.title}`);
    this.updateBountyBoard();
  }

  onStreakChange(count, mult) {
    const badge = this.dom.streakBadge || document.getElementById("hud-streak-badge");
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
    const listEl = this.dom.bountyContractsList || document.getElementById("bounty-contracts-list");
    const rankEl = this.dom.bountyRankBadge || document.getElementById("bounty-rank-badge");
    if (rankEl && this.bountyManager) {
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
    if (this.gameMode === "heist" || this.gameMode === "complex") {
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
      const showJetpack = this.player.hasJetpack && this.player.jetpackTimer > 0;
      if (this._lastJetpackShow !== showJetpack) {
        if (this.dom.badgeJetpack) this.dom.badgeJetpack.style.display = showJetpack ? "flex" : "none";
        this._lastJetpackShow = showJetpack;
      }
      if (showJetpack && this.dom.fillJetpack) {
        const maxDur = this.player.jetpackMaxDuration || CONFIG.JETPACK_DURATION || 8.0;
        const pct = Math.max(0, Math.min(100, (this.player.jetpackTimer / maxDur) * 100));
        this.dom.fillJetpack.style.width = `${pct.toFixed(1)}%`;
      }

      // 2. Magnet
      const showMagnet = this.player.hasMagnet && this.player.magnetTimer > 0;
      if (this._lastMagnetShow !== showMagnet) {
        if (this.dom.badgeMagnet) this.dom.badgeMagnet.style.display = showMagnet ? "flex" : "none";
        this._lastMagnetShow = showMagnet;
      }
      if (showMagnet && this.dom.fillMagnet) {
        const maxDur = this.player.magnetMaxDuration || CONFIG.MAGNET_DURATION || 8.0;
        const pct = Math.max(0, Math.min(100, (this.player.magnetTimer / maxDur) * 100));
        this.dom.fillMagnet.style.width = `${pct.toFixed(1)}%`;
      }

      // 3. 2X Multiplier
      const showMultiplier = this.player.hasMultiplier && this.player.multiplierTimer > 0;
      if (this._lastMultShow !== showMultiplier) {
        if (this.dom.badgeMultiplier) this.dom.badgeMultiplier.style.display = showMultiplier ? "flex" : "none";
        this._lastMultShow = showMultiplier;
      }
      if (showMultiplier && this.dom.fillMultiplier) {
        const maxDur = this.player.multiplierMaxDuration || CONFIG.DOUBLE_POINTS_DURATION || 8.0;
        const pct = Math.max(0, Math.min(100, (this.player.multiplierTimer / maxDur) * 100));
        this.dom.fillMultiplier.style.width = `${pct.toFixed(1)}%`;
      }

      // 4. Shield
      const showShield = this.player.hasShield && this.player.shieldTimer > 0;
      if (this._lastShieldShow !== showShield) {
        if (this.dom.badgeShield) this.dom.badgeShield.style.display = showShield ? "flex" : "none";
        this._lastShieldShow = showShield;
      }
      if (showShield && this.dom.fillShield) {
        const maxDur = this.player.shieldMaxDuration || CONFIG.SHIELD_DURATION || 8.0;
        const pct = Math.max(0, Math.min(100, (this.player.shieldTimer / maxDur) * 100));
        this.dom.fillShield.style.width = `${pct.toFixed(1)}%`;
      }

      // 5. Bujji EMP Harpoon
      const showHarpoon = this.player.hasHarpoon && this.player.harpoonTimer > 0;
      if (this._lastHarpoonShow !== showHarpoon) {
        if (this.dom.badgeHarpoon) this.dom.badgeHarpoon.style.display = showHarpoon ? "flex" : "none";
        this._lastHarpoonShow = showHarpoon;
      }
      if (showHarpoon && this.dom.fillHarpoon) {
        const maxDur = 8.0;
        const pct = Math.max(0, Math.min(100, (this.player.harpoonTimer / maxDur) * 100));
        this.dom.fillHarpoon.style.width = `${pct.toFixed(1)}%`;
      }
    }
  }

  gameLoop(timestamp) {
    this.animId = requestAnimationFrame((t) => this.gameLoop(t));

    // Power optimization: Skip execution completely when tab is hidden/minimized
    if (this._isTabHidden) return;

    // Power optimization: Throttle rendering during idle/paused/menu states to 15-20 FPS
    if (this.state !== GameState3D.PLAYING && this.state !== GameState3D.VICTORY) {
      if (timestamp - this.lastRenderTime < 60) return;
    } else {
      // 60 FPS cap during gameplay to save 50% battery on 120Hz displays
      if (timestamp - this.lastRenderTime < 16) return;
    }
    this.lastRenderTime = timestamp;

    const rawDt = (timestamp - this.lastTime) / 1000;
    const dt = Math.max(0.001, Math.min(rawDt, 0.05));
    this.lastTime = timestamp;

    // Adaptive Shadow Maps: Only recalculate shadow frustum during active gameplay
    if (this.renderer && this.renderer.shadowMap.enabled) {
      const isMotionActive = (this.state === GameState3D.PLAYING || this.state === GameState3D.VICTORY);
      if (this.renderer.shadowMap.autoUpdate !== isMotionActive) {
        this.renderer.shadowMap.autoUpdate = isMotionActive;
        if (isMotionActive) this.renderer.shadowMap.needsUpdate = true;
      }
    }

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

    if (hitResult) {
      if (hitResult.type === "collision") {
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
      } else if (hitResult.type === "bounty_takedown") {
        const target = hitResult.target;
        if (target && !target.destroyed) {
          target.destroyed = true;
          if (target.mesh) target.mesh.visible = false;
          const reward = (hitResult.rewardUnits || 5000) * mult;
          this.units += reward;
          this.score += reward;
          this.showFloatingBountyBanner(`🎯 ${hitResult.targetName || "TARGET"} CAPTURED! +${reward.toLocaleString()} U`, "bounty");
          this.safeAudio("playPowerup");
          this.cameraManager.shake(0.35);
        }
      } else if (hitResult.type === "crate_breached") {
        const crate = hitResult.crate;
        if (crate && !crate.destroyed) {
          crate.destroyed = true;
          if (crate.mesh) crate.mesh.visible = false;
          const reward = (hitResult.rewardUnits || 10000) * mult;
          this.units += reward;
          this.score += reward;
          this.showFloatingBountyBanner(`📦 BOUNTY STASH BREACHED! +${reward.toLocaleString()} U`, "bounty");
          this.safeAudio("playPowerup");
          this.cameraManager.shake(0.35);
        }
      } else if (hitResult.type === "extraction_triggered") {
        const beacon = hitResult.beacon;
        if (beacon && !beacon.triggered) {
          beacon.triggered = true;
          if (beacon.mesh) beacon.mesh.visible = false;
          const reward = (hitResult.rewardUnits || 15000) * mult;
          this.units += reward;
          this.score += reward;
          this.showFloatingBountyBanner(`📡 EXTRACTION SECURED! +${reward.toLocaleString()} U`, "bounty");
          this.safeAudio("playPowerup");
          this.cameraManager.shake(0.4);
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
        const dur = this.getPowerupDuration(item.powerupType);
        if (item.powerupType === "magnet") {
          this.player.giveMagnet(dur);
          this.safeAudio("playDialogue", "magnet");
        } else if (item.powerupType === "jetpack") {
          if (this.isBigMonsterActive?.() || this.hasActiveMonster?.()) {
            this.player.giveShield(dur);
            this.safeAudio("playDialogue", "shield");
            this.showFloatingBountyBanner("JETPACK CONVERTED TO SHIELD", "shield-convert");
          } else {
            this.player.giveJetpack(dur);
            this.safeAudio("playDialogue", "jetpack");
          }
        } else if (item.powerupType === "shield") {
          this.player.giveShield(dur);
          this.safeAudio("playDialogue", "shield");
        } else if (item.powerupType === "multiplier") {
          this.player.giveMultiplier(dur);
          this.safeAudio("playDialogue", "multiplier");
        }
      }
    }

    // 7. Monster Robots: Mini every 150k, Apex every 400k, Nothing after 900k in 1M Heist mode
    if (this.monsterRobots && this.monsterEnabled) {
      const aheadDist = CONFIG.MONSTER_ROBOT ? CONFIG.MONSTER_ROBOT.AHEAD_DISTANCE : 38.0;
      const miniInterval = CONFIG.MONSTER_ROBOT?.MINI_INTERVAL || 150000;
      const apexInterval = CONFIG.MONSTER_ROBOT?.APEX_INTERVAL || 400000;
      const isPastHeistLimit = this.gameMode === "heist" && this.score >= (CONFIG.MONSTER_ROBOT?.HEIST_MAX_SPAWN_SCORE || 900000);

      if (!isPastHeistLimit) {
        const currentApexMilestone = Math.floor(this.score / apexInterval);
        const currentMiniMilestone = Math.floor(this.score / miniInterval);

        // Apex boss every 400k (e.g. 400k, 800k)
        if (currentApexMilestone > this.lastApexMilestone) {
          this.lastApexMilestone = currentApexMilestone;
          this.lastMiniMilestone = currentMiniMilestone;
          this.spawnMonster("apex", aheadDist);
        }
        // Mini harvester every 150k (e.g. 150k, 300k, 450k, 600k, 750k)
        else if (currentMiniMilestone > this.lastMiniMilestone) {
          this.lastMiniMilestone = currentMiniMilestone;
          this.spawnMonster("mini", aheadDist);
        }
      }

      for (let i = 0; i < this.monsterRobots.length; i++) {
        const bot = this.monsterRobots[i];
        if (bot) {
          bot.update(dt, this.currentSpeed, this.player.position.z, activeObstacles, activeCollectibles, this.player);
        }
      }
    }

    // 8. Update HUD Display
    this.updateHud();
  }

  /**
   * Check if Big Monster / Apex Boss is currently active
   */
  isBigMonsterActive() {
    if (!this.monsterRobots || !this.monsterEnabled) return false;
    return this.monsterRobots.some(b => b && b.active && !b.isGlitching && (b.variant === "apex" || b.scaleFactor > 1.2));
  }

  /**
   * Check if any Monster Robot is currently active
   */
  hasActiveMonster() {
    if (!this.monsterRobots || !this.monsterEnabled) return false;
    return this.monsterRobots.some(b => b && b.active && !b.isGlitching);
  }

  /**
   * Spawn a monster robot (Apex or Mini) with intelligent lane diversification and distance staggering (+38m, +52m, +68m)
   */
  spawnMonster(variant = "apex", baseDistance = 38.0) {
    if (!this.monsterRobots || !this.monsterEnabled) return null;
    const bot = this.monsterRobots.find(b => !b.active);
    if (!bot) return null;

    // Filter all currently active running monsters
    const activeBots = this.monsterRobots.filter(b => b.active && !b.isGlitching);
    const playerZ = this.player.position.z;

    // 1. Calculate occupancy per lane (0: Left, 1: Center, 2: Right)
    const laneCounts = [0, 0, 0];
    const occupiedLanes = new Set();

    activeBots.forEach(b => {
      const lane = b.currentLane !== undefined ? b.currentLane : (b.laneIndex !== undefined ? b.laneIndex : 1);
      if (lane >= 0 && lane <= 2) {
        laneCounts[lane]++;
        occupiedLanes.add(lane);
      }
    });

    // 2. Different Lane Selection: When <= 3 active monsters, strictly pick an unoccupied lane if available
    const emptyLanes = [0, 1, 2].filter(l => laneCounts[l] === 0);
    let chosenLane;

    if (emptyLanes.length > 0) {
      // Pick a random unoccupied lane so monsters spread across different lanes
      chosenLane = emptyLanes[Math.floor(Math.random() * emptyLanes.length)];
    } else {
      // All 3 lanes occupied: pick the lane with the minimum bot count (or furthest monster)
      const minCount = Math.min(...laneCounts);
      const leastOccupied = [0, 1, 2].filter(l => laneCounts[l] === minCount);
      chosenLane = leastOccupied[Math.floor(Math.random() * leastOccupied.length)];
    }

    // 3. Staggered Distance Slots: Dedicated slot allocation at +38m, +52m, and +68m
    const DISTANCE_SLOTS = [38.0, 52.0, 68.0];
    let chosenOffset = DISTANCE_SLOTS[0];

    // Find the first slot in [38, 52, 68] not occupied by any active monster within 7m
    const freeSlot = DISTANCE_SLOTS.find(slot => {
      return !activeBots.some(b => Math.abs((b.position.z - playerZ) - slot) < 7.0);
    });

    if (freeSlot !== undefined) {
      chosenOffset = freeSlot;
    } else {
      // All 3 slots occupied, stagger further ahead
      chosenOffset = 68.0 + (activeBots.length * 14.0);
    }

    const spawnZ = playerZ + chosenOffset;
    bot.spawn(chosenLane, spawnZ, variant);

    if (variant === "apex") {
      this.showFloatingBountyBanner("🚨 APEX ROGUE HARVESTER INBOUND!", "boss");
      this.safeAudio("playDialogue", "bujji");
      this.cameraManager.shake(0.5);
    } else {
      this.showFloatingBountyBanner("⚠️ ROGUE SCOUT BOT DETECTED!", "warning");
      this.safeAudio("playDialogue", "bujji");
      this.cameraManager.shake(0.3);
    }

    return bot;
  }

  getPowerupDuration(type) {
    const level = (this.powerupUpgrades && this.powerupUpgrades[type]) || 1;
    const durations = CONFIG.UPGRADE_TIERS?.DURATIONS || [8.0, 10.0, 13.0, 17.0, 22.0, 30.0];
    const index = Math.max(0, Math.min(durations.length - 1, level - 1));
    return durations[index];
  }

  toggleMonsterMode() {
    this.monsterEnabled = !this.monsterEnabled;
    localStorage.setItem("prabhas3DMonsterToggle", this.monsterEnabled ? "true" : "false");
    this.updateMonsterToggleUI();
    this.safeAudio("playPowerup");
  }

  updateMonsterToggleUI() {
    if (this.dom.monsterToggleStatus) {
      this.dom.monsterToggleStatus.textContent = this.monsterEnabled ? "ON" : "OFF";
      this.dom.monsterToggleStatus.className = `pill-value ${this.monsterEnabled ? "text-emerald" : "text-red"}`;
    }
  }

  openArmoryShop() {
    this.updateShopUI();
    if (this.dom.armoryModal) {
      this.dom.armoryModal.classList.add("active");
    }
  }

  closeArmoryShop() {
    if (this.dom.armoryModal) {
      this.dom.armoryModal.classList.remove("active");
    }
  }

  upgradePowerup(type) {
    const currentLevel = (this.powerupUpgrades && this.powerupUpgrades[type]) || 1;
    const maxLevel = CONFIG.UPGRADE_TIERS?.MAX_LEVEL || 6;
    if (currentLevel >= maxLevel) return;

    const costs = CONFIG.UPGRADE_TIERS?.COSTS || [0, 15000, 35000, 75000, 150000, 300000];
    const cost = costs[currentLevel];

    if (this.vaultUnits < cost) {
      this.safeAudio("playHit");
      return;
    }

    this.vaultUnits -= cost;
    localStorage.setItem("prabhas3DVaultUnits", this.vaultUnits.toString());
    this.powerupUpgrades[type] = currentLevel + 1;
    localStorage.setItem("prabhas3DPowerupUpgrades", JSON.stringify(this.powerupUpgrades));

    this.safeAudio("playPowerup");
    this.safeAudio("playDialogue", "milestone");
    this.updateMenuStats();
    this.updateShopUI();
  }

  updateShopUI() {
    if (this.dom.shopVaultUnits) {
      this.dom.shopVaultUnits.textContent = this.vaultUnits.toLocaleString();
    }

    const types = ["shield", "magnet", "jetpack", "multiplier"];
    const durations = CONFIG.UPGRADE_TIERS?.DURATIONS || [8.0, 10.0, 13.0, 17.0, 22.0, 30.0];
    const costs = CONFIG.UPGRADE_TIERS?.COSTS || [0, 15000, 35000, 75000, 150000, 300000];
    const maxLevel = CONFIG.UPGRADE_TIERS?.MAX_LEVEL || 6;

    types.forEach(type => {
      const level = (this.powerupUpgrades && this.powerupUpgrades[type]) || 1;
      const dur = durations[level - 1];

      // Update stat text
      const statEl = document.getElementById(`stat-${type}-dur`);
      if (statEl) {
        statEl.textContent = `Duration: ${dur}s${level < maxLevel ? ` (Next: ${durations[level]}s)` : " (MAX)"}`;
      }

      // Update level pips
      const pipsEl = document.getElementById(`pips-${type}`);
      if (pipsEl) {
        pipsEl.innerHTML = Array.from({ length: maxLevel }, (_, i) => 
          `<div class="level-pip ${i < level ? 'active' : ''}"></div>`
        ).join('');
      }

      // Update button
      const btn = document.getElementById(`btn-upgrade-${type}`);
      if (btn) {
        if (level >= maxLevel) {
          btn.disabled = true;
          btn.className = "btn-upgrade-action maxed";
          btn.innerHTML = `<span class="upgrade-btn-text">MAX LEVEL (${dur}s)</span>`;
        } else {
          const cost = costs[level];
          const canAfford = this.vaultUnits >= cost;
          btn.disabled = !canAfford;
          btn.className = "btn-upgrade-action interactive-ui";
          btn.innerHTML = `
            <span class="upgrade-btn-text">UPGRADE (+${durations[level] - dur}s)</span>
            <span class="upgrade-btn-cost"><img src="assets/ui/unit-coin.svg" class="unit-inline-icon" alt="Units"> ${cost.toLocaleString()}</span>
          `;
        }
      }
    });
  }
}
