/**
 * COMPLEX RUNNER - Next-Gen 3D Sci-Fi Runner
 * Core 3D Game Engine & WebGL Render Loop with 1 Million Units Goal
 */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { CONFIG } from "./config.js?v=20261108_hardened_v84";
import { AudioManager3D } from "./audio.js?v=20261108_hardened_v84";
import { InputManager3D } from "./input.js?v=20261108_hardened_v84";
import { Player3D } from "./player3D.js?v=20261108_hardened_v84";
import { Environment3D } from "./world/environment.js?v=20261108_hardened_v84";
import { TrackSegmentPool3D } from "./world/segmentPool.js?v=20261108_hardened_v84";
import { CameraManager3D } from "./cameraManager.js?v=20261108_hardened_v84";
import { CollisionManager3D } from "./collision3D.js?v=20261108_hardened_v84";
import { MonsterRobotModel } from "./models/monsterRobotModel.js?v=20261108_hardened_v84";
import { BountyManager } from "./bountyManager.js?v=20261108_hardened_v84";
import { assetLoader } from "./models/assetLoader3D.js?v=20261108_hardened_v84";

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
    this.hasAchievedHeist = false;

    this.currentSpeed = CONFIG.INITIAL_SPEED;
    this.gameOverLockTime = 0;

    // Three.js Core
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.tractorBeam = null;

    // Subsystems
    this.audio = new AudioManager3D();
    // Bounty Hunter System (Commented out per user request)
    // this.bountyManager = new BountyManager({
    //   onBountyCaptured: (d) => this.onBountyCaptured(d),
    //   onContractComplete: (c, r) => this.onContractComplete(c, r),
    //   onStreakChange: (cnt, mult) => this.onStreakChange(cnt, mult)
    // });
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

    // Loop & Zero-Allocation Structures
    this.lastTime = 0;
    this.animId = null;
    this._boundGameLoop = (t) => this.gameLoop(t);
    this._laserData = { shot: true, laneX: 0, playerZ: 0, range: 55.0 };

    // DOM Elements
    this.dom = {};
  }

  safeAudio(fnName, a, b, c) {
    if (this.audio && typeof this.audio[fnName] === "function") {
      try {
        if (c !== undefined) {
          this.audio[fnName](a, b, c);
        } else if (b !== undefined) {
          this.audio[fnName](a, b);
        } else if (a !== undefined) {
          this.audio[fnName](a);
        } else {
          this.audio[fnName]();
        }
      } catch (e) {}
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
    this.init3DCardParallax();

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
    this.renderer.toneMappingExposure = 1.25;

    container.appendChild(this.renderer.domElement);

    // Warm Crisp Rim Backlight for Hero Silhouettes (High Visibility)
    this.rimLight = new THREE.DirectionalLight(0xFDE047, 1.1);
    this.rimLight.position.set(-15, 12, 10);
    this.rimLightTarget = new THREE.Object3D();
    this.scene.add(this.rimLightTarget);
    this.rimLight.target = this.rimLightTarget;
    this.scene.add(this.rimLight);

    // Camera-Following Soft Hero Fill Light (Illuminates back, vest, arms)
    this.heroFillLight = new THREE.DirectionalLight(0xFFFBEB, 0.75);
    this.heroFillLight.position.set(0, 8, -10);
    this.heroFillTarget = new THREE.Object3D();
    this.scene.add(this.heroFillTarget);
    this.heroFillLight.target = this.heroFillTarget;
    this.scene.add(this.heroFillLight);

    // Tractor Beam for Victory Sequence
    this.initTractorBeam();
  }

  initTractorBeam() {
    const group = new THREE.Group();
    group.visible = false;
    this.scene.add(group);

    // 1. Hyper-Luminous Inner Plasma Core (Additive Blending - Bright Radiant White-Cyan)
    const coreGeo = new THREE.CylinderGeometry(2.0, 2.0, 240, 24, 1, true);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xBAE6FD,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.y = 120;
    group.add(coreMesh);

    // 2. Translucent Electric Cyan Outer Hologram Column
    const outerGeo = new THREE.CylinderGeometry(4.8, 5.4, 240, 28, 1, true);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0x00E5FF,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    outerMesh.position.y = 120;
    group.add(outerMesh);

    // 3. Counter-Rotating Energy Spiral / Helix Ribbon
    const helixGeo = new THREE.CylinderGeometry(3.6, 3.8, 240, 12, 1, true);
    const helixMat = new THREE.MeshBasicMaterial({
      color: 0x38BDF8,
      wireframe: true,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const helixMesh = new THREE.Mesh(helixGeo, helixMat);
    helixMesh.position.y = 120;
    group.add(helixMesh);

    // 4. Ascending Plasma Rings (Light halos rushing upward into the sky)
    const rings = [];
    const ringGeo = new THREE.TorusGeometry(3.6, 0.16, 8, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x67E8F9,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    for (let i = 0; i < 7; i++) {
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = i * 32;
      group.add(ring);
      rings.push(ring);
    }

    // 5. Ground Graviton Anchor Pad & Shockwave Ring
    const groundPadGeo = new THREE.RingGeometry(0.5, 5.2, 32);
    const groundPadMat = new THREE.MeshBasicMaterial({
      color: 0x00E5FF,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const groundPad = new THREE.Mesh(groundPadGeo, groundPadMat);
    groundPad.rotation.x = -Math.PI / 2;
    groundPad.position.y = 0.06;
    group.add(groundPad);

    this.tractorBeam = {
      group,
      core: coreMesh,
      coreMat,
      outer: outerMesh,
      outerMat,
      helix: helixMesh,
      helixMat,
      rings,
      ringMat,
      groundPad,
      groundPadMat,
      active: false
    };
  }

  showTractorBeam(x, z) {
    if (!this.tractorBeam) return;
    this.tractorBeam.active = true;
    this.tractorBeam.group.position.set(x, 0, z);
    this.tractorBeam.group.visible = true;
    this.tractorBeam.coreMat.opacity = 0.85;
    this.tractorBeam.outerMat.opacity = 0.40;
    this.tractorBeam.helixMat.opacity = 0.65;
    this.tractorBeam.ringMat.opacity = 0.80;
    this.tractorBeam.groundPadMat.opacity = 0.75;
  }

  hideTractorBeam() {
    if (!this.tractorBeam) return;
    this.tractorBeam.active = false;
    this.tractorBeam.group.visible = false;
    this.tractorBeam.coreMat.opacity = 0;
    this.tractorBeam.outerMat.opacity = 0;
    this.tractorBeam.helixMat.opacity = 0;
    this.tractorBeam.ringMat.opacity = 0;
    this.tractorBeam.groundPadMat.opacity = 0;
  }

  updateTractorBeam(dt, time) {
    if (!this.tractorBeam || !this.tractorBeam.active) return;
    const tb = this.tractorBeam;

    // Counter-rotations for sci-fi dynamic swirl
    tb.core.rotation.y += dt * 1.2;
    tb.outer.rotation.y -= dt * 0.7;
    tb.helix.rotation.y += dt * 2.8;
    tb.groundPad.rotation.z += dt * 1.5;

    // Pulsating radiant energy core
    const pulse = 0.75 + 0.20 * Math.sin(time * 10.0);
    tb.coreMat.opacity = 0.85 * pulse;

    // Ascend plasma rings rapidly upward toward the sky
    const ringSpeed = 52.0;
    const maxHeight = 210.0;
    for (let i = 0; i < tb.rings.length; i++) {
      const ring = tb.rings[i];
      ring.position.y += dt * ringSpeed;
      if (ring.position.y > maxHeight) {
        ring.position.y = 0;
      }
      const progress = ring.position.y / maxHeight;
      const scale = 1.0 + progress * 0.40;
      ring.scale.set(scale, scale, 1.0);
    }
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

      // Map Selection Modal (Endless Run)
      mapSelectScreen: document.getElementById("map-select-screen"),
      btnSelectMapWasteland: document.getElementById("btn-select-map-wasteland"),
      btnSelectMapComplex: document.getElementById("btn-select-map-complex"),
      btnCloseMapSelect: document.getElementById("btn-close-map-select"),

      startScreen: document.getElementById("start-screen"),
      pauseScreen: document.getElementById("pause-screen"),
      gameOverScreen: document.getElementById("game-over-screen"),
      victoryScreen: document.getElementById("victory-screen"),
      btnVictoryContinue: document.getElementById("btn-victory-continue"),

      finalScore: document.getElementById("final-score-val"),
      finalHighScore: document.getElementById("final-high-val"),
      finalUnits: document.getElementById("final-units-val"),

      victoryScore: document.getElementById("victory-score-val"),
      victoryTime: document.getElementById("victory-time-val"),
      victoryUnits: document.getElementById("victory-units-val"),

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
      this.dom.btnModeEndless.addEventListener("click", () => {
        this.setGameMode("endless");
        this.openMapSelectModal();
      });
    }
    if (this.dom.btnStartRun) {
      this.dom.btnStartRun.addEventListener("click", () => {
        if (this.gameMode === "endless") {
          this.openMapSelectModal();
        } else {
          this.startNewGame("wasteland");
        }
      });
    }
    if (this.dom.btnSelectMapWasteland) {
      this.dom.btnSelectMapWasteland.addEventListener("click", () => {
        this.closeMapSelectModal();
        this.startNewGame("wasteland");
      });
    }
    if (this.dom.btnSelectMapComplex) {
      this.dom.btnSelectMapComplex.addEventListener("click", () => {
        this.closeMapSelectModal();
        this.startNewGame("complex");
      });
    }
    if (this.dom.btnCloseMapSelect) {
      this.dom.btnCloseMapSelect.addEventListener("click", () => {
        this.closeMapSelectModal();
      });
    }

    // Keyboard Shortcuts for Sector Dispatch Terminal [1: Wasteland, 2: Complex, ESC: Cancel]
    window.addEventListener("keydown", (e) => {
      if (this.dom.mapSelectScreen && this.dom.mapSelectScreen.classList.contains("active")) {
        if (e.key === "1") {
          e.preventDefault();
          this.closeMapSelectModal();
          this.startNewGame("wasteland");
        } else if (e.key === "2") {
          e.preventDefault();
          this.closeMapSelectModal();
          this.startNewGame("complex");
        } else if (e.key === "Escape") {
          e.preventDefault();
          this.closeMapSelectModal();
        }
      }
    });
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
    if (this.dom.btnVictoryContinue) {
      this.dom.btnVictoryContinue.addEventListener("click", () => this.continueToComplex());
    }
    if (this.dom.btnVictoryPlayAgain) {
      this.dom.btnVictoryPlayAgain.addEventListener("click", () => this.startNewGame("wasteland"));
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

    const currentMap = this.selectedMap || "wasteland";
    if (this.player) this.player.setOutfit(currentMap);
    if (this.trackPool) this.trackPool.setTheme(currentMap);
    if (this.environment) this.environment.setTheme(currentMap);

    this.updateHud();
  }

  openMapSelectModal() {
    if (this.dom.mapSelectScreen) {
      this.dom.mapSelectScreen.classList.add("active");
    }
  }

  closeMapSelectModal() {
    if (this.dom.mapSelectScreen) {
      this.dom.mapSelectScreen.classList.remove("active");
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
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  }

  startNewGame(mapTheme = null) {
    this.safeAudio("init");
    this.safeAudio("playMusic");
    this.safeAudio("playDialogue", "bujji");
    this.score = 0;
    this.units = 0;
    this.hasAchievedHeist = false;
    this.currentSpeed = CONFIG.INITIAL_SPEED;
    this.runDuration = 0;

    this._lastUnits = null;
    this._lastScore = null;
    this._lastGoalPct = null;
    this._lastGoalPillDisplay = null;

    if (mapTheme) {
      this.selectedMap = mapTheme;
    } else if (this.gameMode === "heist") {
      this.selectedMap = "wasteland";
    } else {
      this.selectedMap = this.selectedMap || "wasteland";
    }

    const isComplex = this.selectedMap === "complex";
    this.player.reset();
    this.player.setOutfit(isComplex ? "complex" : "wasteland");

    if (this.trackPool) this.trackPool.setTheme(isComplex ? "complex" : "wasteland");
    if (this.environment) this.environment.setTheme(isComplex ? "complex" : "wasteland");
    this.trackPool.init();

    this.lastMiniMilestone = 0;
    this.lastApexMilestone = 0;
    this.monsterSpawnCount = 0;
    if (this.monsterRobots) {
      this.monsterRobots.forEach(bot => {
        bot.active = false;
        if (bot.root) bot.root.visible = false;
      });
    }

    this.hideTractorBeam();
    this.isComplexDropActive = false;
    if (this.complexShockwaveMesh) this.complexShockwaveMesh.visible = false;

    this.state = GameState3D.PLAYING;
    this.showScreen(GameState3D.PLAYING);
    this.updateHud();
    if (this.bountyManager) {
      this.bountyManager.resetRun();
      this.updateBountyBoard();
    }
    this.safeAudio("playDialogue", "bujji");
  }

  /**
   * Complex Heist Milestone Reached: Continue to Complex with same score and active powerups!
   */
  continueToComplex() {
    this.hasAchievedHeist = true;
    this.selectedMap = "complex";

    // Smoothly transition environment, track pool, and Bhairava outfit to Complex
    this.player.setOutfit("complex");
    if (this.trackPool) this.trackPool.setTheme("complex");
    if (this.environment) this.environment.setTheme("complex");

    // Hide victory screen & tractor beam
    if (this.dom.victoryScreen) {
      this.dom.victoryScreen.classList.remove("active");
    }
    this.hideTractorBeam();

    // Reset arm rotations back from victory levitation pose
    if (this.player.bhairava?.parts) {
      const p = this.player.bhairava.parts;
      if (p.leftArm) p.leftArm.rotation.z = 0;
      if (p.rightArm) p.rightArm.rotation.z = 0;
    }

    // Retain current score, units, and active powerups with remaining timers!
    this.state = GameState3D.PLAYING;
    this.showScreen(GameState3D.PLAYING);
    this.lastTime = performance.now();
    this.lastRenderTime = performance.now();

    this.safeAudio("playMusic");
    this.safeAudio("playDialogue", "complex");

    this._lastGoalPillDisplay = null;
    this.updateHud();

    // Trigger cinematic fall-down animation onto the Complex
    this.startComplexDropSequence();
  }

  /**
   * Cinematic High-Altitude Drop onto Complex with Superhero 3-Point Touchdown
   */
  startComplexDropSequence() {
    this.isComplexDropActive = true;
    this.complexDropPhase = "falling";
    this.complexDropTimer = 0;

    // Drop from 38 meters above the track surface
    this.player.position.y = 38.0;
    this.player.root.position.copy(this.player.position);
    this.player.velocityY = -26.0;
    this.player.isGrounded = false;
    this.player.isJumping = false;
    this.player.isSliding = false;
    this.player.invulnerableTimer = 4.0; // Complete immunity during fall, impact & stand-up

    // Temporarily reduce forward speed during the skyfall descent
    this.savedDropSpeed = Math.max(CONFIG.INITIAL_SPEED, this.currentSpeed || CONFIG.INITIAL_SPEED);
    this.currentSpeed = 6.0;

    // Procedural expanding cyan/gold plasma shockwave ring
    if (!this.complexShockwaveMesh) {
      const geo = new THREE.RingGeometry(0.3, 0.7, 32);
      geo.rotateX(-Math.PI / 2);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x00E5FF,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      this.complexShockwaveMesh = new THREE.Mesh(geo, mat);
      this.scene.add(this.complexShockwaveMesh);
    }
    this.complexShockwaveMesh.visible = false;
  }

  updateComplexDrop(dt) {
    this.complexDropTimer += dt;
    const parts = this.player.bhairava?.parts;

    if (this.complexDropPhase === "falling") {
      // Accelerate downwards under heavy gravity
      this.player.velocityY -= 48.0 * dt;
      this.player.position.y += this.player.velocityY * dt;

      // Slowly inch forward so there is dynamic motion
      this.player.position.z += this.currentSpeed * dt;
      this.player.root.position.copy(this.player.position);

      // Diving skyfall pose
      if (parts) {
        if (parts.hips) {
          parts.hips.rotation.set(0.48, 0, 0);
        }
        if (parts.torso) parts.torso.rotation.set(0.25, 0, 0);
        if (parts.head) parts.head.rotation.set(-0.35, 0, 0);

        // Arms swept backwards aerodynamically
        if (parts.leftArm) parts.leftArm.rotation.set(-1.35, -0.15, 0.35);
        if (parts.rightArm) parts.rightArm.rotation.set(-1.35, 0.15, -0.35);
        if (parts.leftForearm) parts.leftForearm.rotation.set(-0.35, 0, 0);
        if (parts.rightForearm) parts.rightForearm.rotation.set(-0.35, 0, 0);

        // Legs trailing in streamline
        if (parts.leftLeg) parts.leftLeg.rotation.set(0.35, 0, -0.08);
        if (parts.rightLeg) parts.rightLeg.rotation.set(0.42, 0, 0.08);
        if (parts.leftCalf) parts.leftCalf.rotation.set(0.65, 0, 0);
        if (parts.rightCalf) parts.rightCalf.rotation.set(0.75, 0, 0);
      }

      // Check ground collision
      if (this.player.position.y <= 0) {
        this.player.position.y = 0;
        this.player.root.position.copy(this.player.position);
        this.player.velocityY = 0;
        this.player.isGrounded = true;
        this.complexDropPhase = "impact";
        this.complexDropTimer = 0;

        // Trigger superhero landing shockwave
        if (this.complexShockwaveMesh) {
          this.complexShockwaveMesh.position.set(this.player.position.x, 0.04, this.player.position.z);
          this.complexShockwaveMesh.scale.set(0.8, 0.8, 0.8);
          this.complexShockwaveMesh.material.opacity = 0.95;
          this.complexShockwaveMesh.visible = true;
        }

        // Camera impact shake and audio
        this.cameraManager.shake(0.75);
        this.safeAudio("playHit");
        this.safeAudio("playDialogue", "bujji");
      }
    } else if (this.complexDropPhase === "impact") {
      // 3-Point Superhero Landing Crouch Pose
      if (parts) {
        const baseY = this.player.bhairava.baseHipsY || 0.86;
        if (parts.hips) {
          parts.hips.position.y = baseY - 0.38;
          parts.hips.rotation.set(0.22, 0, 0);
        }
        if (parts.torso) parts.torso.rotation.set(0.72, 0, 0);
        if (parts.head) parts.head.rotation.set(-0.55, 0, 0);

        // Right arm punched into pavement
        if (parts.rightArm) parts.rightArm.rotation.set(1.25, 0.12, -0.15);
        if (parts.rightForearm) parts.rightForearm.rotation.set(0.10, 0, 0);

        // Left arm angled outward and back for balance
        if (parts.leftArm) parts.leftArm.rotation.set(-0.65, -0.25, 0.55);
        if (parts.leftForearm) parts.leftForearm.rotation.set(-0.45, 0, 0);

        // Right leg knee bent low
        if (parts.rightLeg) parts.rightLeg.rotation.set(-1.42, 0, 0.12);
        if (parts.rightCalf) parts.rightCalf.rotation.set(1.55, 0, 0);

        // Left leg wide athletic brace
        if (parts.leftLeg) parts.leftLeg.rotation.set(0.48, 0, -0.42);
        if (parts.leftCalf) parts.leftCalf.rotation.set(0.35, 0, 0);
      }

      // Expand shockwave ring
      if (this.complexShockwaveMesh && this.complexShockwaveMesh.visible) {
        const growth = 0.8 + this.complexDropTimer * 14.0;
        this.complexShockwaveMesh.scale.set(growth, growth, growth);
        this.complexShockwaveMesh.material.opacity = Math.max(0, 0.95 - this.complexDropTimer * 2.6);
      }

      // Hold impact pose for 0.38s
      if (this.complexDropTimer >= 0.38) {
        this.complexDropPhase = "recovery";
        this.complexDropTimer = 0;
      }
    } else if (this.complexDropPhase === "recovery") {
      const recDur = 0.28;
      const progress = Math.min(1.0, this.complexDropTimer / recDur);

      // Smoothly ramp speed back up
      this.currentSpeed = THREE.MathUtils.lerp(6.0, this.savedDropSpeed || CONFIG.INITIAL_SPEED, progress);
      this.player.position.z += this.currentSpeed * dt;
      this.player.root.position.copy(this.player.position);

      // Smoothly raise hips and limbs
      if (parts) {
        const baseY = this.player.bhairava.baseHipsY || 0.86;
        if (parts.hips) {
          parts.hips.position.y = THREE.MathUtils.lerp(baseY - 0.38, baseY, progress);
          parts.hips.rotation.x = THREE.MathUtils.lerp(0.22, 0, progress);
        }
        if (parts.torso) parts.torso.rotation.x = THREE.MathUtils.lerp(0.72, 0.18, progress);
        if (parts.head) parts.head.rotation.x = THREE.MathUtils.lerp(-0.55, 0, progress);

        if (parts.rightArm) parts.rightArm.rotation.x = THREE.MathUtils.lerp(1.25, 0, progress);
        if (parts.leftArm) parts.leftArm.rotation.x = THREE.MathUtils.lerp(-0.65, 0, progress);
        if (parts.rightLeg) parts.rightLeg.rotation.x = THREE.MathUtils.lerp(-1.42, 0, progress);
        if (parts.rightCalf) parts.rightCalf.rotation.x = THREE.MathUtils.lerp(1.55, 0, progress);
        if (parts.leftLeg) parts.leftLeg.rotation.x = THREE.MathUtils.lerp(0.48, 0, progress);
      }

      // Fade out shockwave ring completely
      if (this.complexShockwaveMesh && this.complexShockwaveMesh.visible) {
        this.complexShockwaveMesh.material.opacity = Math.max(0, 0.3 - progress * 0.3);
        if (progress >= 1.0) this.complexShockwaveMesh.visible = false;
      }

      if (progress >= 1.0) {
        // Drop sequence finished! Normal sprint loop resumes
        this.isComplexDropActive = false;
        if (this.complexShockwaveMesh) this.complexShockwaveMesh.visible = false;
        this.player.state = "running";
      }
    }
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
      "LOADING 3D GLB ASSETS (TRAINS & BARRICADES)...",
      "WARMING PLASMA GAUNTLETS...",
      "COMPLEX RUNNER INITIALIZED"
    ];

    const updateDisplay = (pct, text) => {
      if (fill) fill.style.width = `${pct}%`;
      if (pctText) pctText.textContent = `${pct}%`;
      if (statusText && text) statusText.textContent = text;
    };

    // Preload all 24 3D GLB assets in parallel with real progress callback
    assetLoader.preloadAll((completed, total, currentKey) => {
      const realPct = Math.floor((completed / total) * 85);
      const cleanKey = currentKey.replace(/_/g, " ").toUpperCase();
      updateDisplay(realPct, `LOADING ASSET (${completed}/${total}): ${cleanKey}...`);
    }).then(() => {
      // Smoothly advance from 85% to 100%
      let finishPct = 85;
      const finishInterval = setInterval(() => {
        finishPct += 5;
        if (finishPct >= 100) {
          finishPct = 100;
          clearInterval(finishInterval);
          updateDisplay(100, "COMPLEX RUNNER INITIALIZED");
          setTimeout(() => {
            if (loadingScreen) {
              loadingScreen.classList.remove("active");
              setTimeout(() => {
                loadingScreen.style.display = "none";
              }, 500);
            }
          }, 200);
        } else {
          updateDisplay(finishPct, "FINALIZING SHADER PIPELINE...");
        }
      }, 50);
    }).catch(() => {
      updateDisplay(100, "INITIALIZING FALLBACK SYSTEMS...");
      setTimeout(() => {
        if (loadingScreen) {
          loadingScreen.classList.remove("active");
          loadingScreen.style.display = "none";
        }
      }, 500);
    });
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
    if (this.bountyManager) {
      this.updateBountyBoard();
    }
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
    this.hideTractorBeam();
    this.isComplexDropActive = false;
    if (this.complexShockwaveMesh) this.complexShockwaveMesh.visible = false;
    this.updateHud();
  }

  gameOver() {
    this.state = GameState3D.GAME_OVER;
    this.gameOverLockTime = Date.now() + 1000;
    this.hideTractorBeam();
    this.isComplexDropActive = false;
    if (this.complexShockwaveMesh) this.complexShockwaveMesh.visible = false;
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

    // Position & trigger cinematic multi-layer ascension tractor beam on Player
    this.showTractorBeam(this.player.position.x, this.player.position.z);
    this.cameraManager.shake(0.35);

    // High Score Record
    if (this.score > this.highScore) {
      this.highScore = Math.floor(this.score);
      localStorage.setItem("prabhas3DHighScore", this.highScore.toString());
    }

    this.vaultUnits += this.units;
    localStorage.setItem("prabhas3DVaultUnits", this.vaultUnits.toString());
    this.updateMenuStats();

    if (this.dom.victoryScore) this.dom.victoryScore.textContent = Math.floor(this.score).toString().padStart(6, "0");
    if (this.dom.victoryTime) {
      const mins = Math.floor((this.runDuration || 0) / 60).toString().padStart(2, "0");
      const secs = Math.floor((this.runDuration || 0) % 60).toString().padStart(2, "0");
      this.dom.victoryTime.textContent = `${mins}:${secs}`;
    }
    if (this.dom.victoryUnits) this.dom.victoryUnits.textContent = this.units.toLocaleString() + " UNITS";

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
    if (this.state !== GameState3D.PLAYING || this.isComplexDropActive) return;
    this.player.moveLeft();
  }

  handleRight() {
    if (this.state !== GameState3D.PLAYING || this.isComplexDropActive) return;
    this.player.moveRight();
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
    if (this.state !== GameState3D.PLAYING || this.player.hasJetpack || this.isComplexDropActive) return;

    this._laserData.shot = true;
    this._laserData.laneX = this.player.position.x;
    this._laserData.playerZ = this.player.position.z;
    this._laserData.range = 55.0;

    const activeObstacles = this.trackPool.getAllActiveObstacles(this.player.position.z);
    const hitEntities = CollisionManager3D.checkLaserCollisions(this._laserData, activeObstacles, this.monsterRobots);

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
          if (this.bountyManager) this.bountyManager.recordLaserShot();
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

  /**
   * 3D Tactical Score & Unit Counter Punch Feedback (Zero Layout Thrashing, Throttled)
   */
  triggerHudPunch() {
    const now = performance.now();
    if (now - (this._lastHudPunchTime || 0) < 110) return;
    this._lastHudPunchTime = now;

    const unitsEl = this.dom.hudUnits;
    const scoreEl = this.dom.hudScore;
    if (unitsEl) {
      unitsEl.classList.remove("score-punch-3d");
      requestAnimationFrame(() => {
        if (unitsEl) unitsEl.classList.add("score-punch-3d");
      });
    }
    if (scoreEl) {
      scoreEl.classList.remove("score-punch-3d");
      requestAnimationFrame(() => {
        if (scoreEl) scoreEl.classList.add("score-punch-3d");
      });
    }
  }

  /**
   * Interactive 3D Perspective Card Tilt on Pointer Movement (Zero Garbage Collection & Idle during gameplay)
   */
  init3DCardParallax() {
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;
    let isMoving = false;

    window.addEventListener("pointermove", (e) => {
      // Battery & Performance: Ignore pointer parallax during active 3D gameplay
      if (this.state === GameState3D.PLAYING) return;
      const normX = (e.clientX / window.innerWidth) - 0.5;
      const normY = (e.clientY / window.innerHeight) - 0.5;
      targetRotX = normY * -10.0; // Max ±5 deg tilt
      targetRotY = normX * 10.0;
      isMoving = true;
    }, { passive: true });

    window.addEventListener("pointerleave", () => {
      targetRotX = 0;
      targetRotY = 0;
    }, { passive: true });

    const animateTilt = () => {
      // Idle completely during active 3D gameplay
      if (this.state === GameState3D.PLAYING) {
        requestAnimationFrame(animateTilt);
        return;
      }

      if (isMoving || Math.abs(currentRotX - targetRotX) > 0.05 || Math.abs(currentRotY - targetRotY) > 0.05) {
        currentRotX += (targetRotX - currentRotX) * 0.12;
        currentRotY += (targetRotY - currentRotY) * 0.12;

        const cards = document.querySelectorAll(
          ".menu-viewport.active .menu-center-box, " +
          ".menu-viewport.active .btn-play-massive, " +
          ".game-modal-screen.active .squircle-card, " +
          ".game-modal-screen.active .armory-card"
        );

        for (let i = 0; i < cards.length; i++) {
          cards[i].style.transform = `perspective(1000px) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg)`;
        }

        if (Math.abs(currentRotX) < 0.02 && Math.abs(currentRotY) < 0.02 && targetRotX === 0) {
          isMoving = false;
        }
      }
      requestAnimationFrame(animateTilt);
    };
    requestAnimationFrame(animateTilt);
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
    if (this.state !== GameState3D.PLAYING || this.isComplexDropActive) return;
    if (this.player.jump()) {
      this.safeAudio("playJump");
    }
  }

  handleSlide() {
    if (this.state !== GameState3D.PLAYING || this.isComplexDropActive) return;
    const act = this.player.slide();
    if (act === "dive") {
      this.safeAudio("playDive");
      this.cameraManager.shake(0.12);
    } else if (act) {
      this.safeAudio("playSlide");
    }
  }

  showScreen(targetState) {
    if (targetState === GameState3D.MENU) {
      this.updateMenuStats();
    }
    if (targetState === GameState3D.VICTORY) {
      if (this.dom.victoryScore) this.dom.victoryScore.textContent = Math.floor(this.score).toString().padStart(6, "0");
      if (this.dom.victoryTime) {
        const mins = Math.floor((this.runDuration || 0) / 60).toString().padStart(2, "0");
        const secs = Math.floor((this.runDuration || 0) % 60).toString().padStart(2, "0");
        this.dom.victoryTime.textContent = `${mins}:${secs}`;
      }
      if (this.dom.victoryUnits) this.dom.victoryUnits.textContent = this.units.toLocaleString() + " UNITS";
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

      if (this.hasAchievedHeist || this.selectedMap === "complex") {
        if (this._lastUnits !== this.units) {
          if (this.dom.hudUnits) this.dom.hudUnits.textContent = `${this.units.toLocaleString()} UNITS`;
          this._lastUnits = this.units;
        }
        if (this._lastGoalPct !== 100) {
          if (this.dom.hudGoalPct) this.dom.hudGoalPct.textContent = "100%";
          if (this.dom.hudGoalFill) this.dom.hudGoalFill.style.width = "100%";
          this._lastGoalPct = 100;
        }
      } else {
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
        const pctStr = `${pct.toFixed(1)}%`;
        if (this._lastJetpackPct !== pctStr) {
          this.dom.fillJetpack.style.width = pctStr;
          this._lastJetpackPct = pctStr;
        }
        const isUrgent = this.player.jetpackTimer <= 2.0;
        if (this._lastJetpackUrgent !== isUrgent) {
          if (this.dom.badgeJetpack) this.dom.badgeJetpack.classList.toggle("is-urgent", isUrgent);
          this._lastJetpackUrgent = isUrgent;
        }
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
        const pctStr = `${pct.toFixed(1)}%`;
        if (this._lastMagnetPct !== pctStr) {
          this.dom.fillMagnet.style.width = pctStr;
          this._lastMagnetPct = pctStr;
        }
        const isUrgent = this.player.magnetTimer <= 2.0;
        if (this._lastMagnetUrgent !== isUrgent) {
          if (this.dom.badgeMagnet) this.dom.badgeMagnet.classList.toggle("is-urgent", isUrgent);
          this._lastMagnetUrgent = isUrgent;
        }
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
        const pctStr = `${pct.toFixed(1)}%`;
        if (this._lastMultPct !== pctStr) {
          this.dom.fillMultiplier.style.width = pctStr;
          this._lastMultPct = pctStr;
        }
        const isUrgent = this.player.multiplierTimer <= 2.0;
        if (this._lastMultUrgent !== isUrgent) {
          if (this.dom.badgeMultiplier) this.dom.badgeMultiplier.classList.toggle("is-urgent", isUrgent);
          this._lastMultUrgent = isUrgent;
        }
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
        const pctStr = `${pct.toFixed(1)}%`;
        if (this._lastShieldPct !== pctStr) {
          this.dom.fillShield.style.width = pctStr;
          this._lastShieldPct = pctStr;
        }
        const isUrgent = this.player.shieldTimer <= 2.0;
        if (this._lastShieldUrgent !== isUrgent) {
          if (this.dom.badgeShield) this.dom.badgeShield.classList.toggle("is-urgent", isUrgent);
          this._lastShieldUrgent = isUrgent;
        }
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
        const pctStr = `${pct.toFixed(1)}%`;
        if (this._lastHarpoonPct !== pctStr) {
          this.dom.fillHarpoon.style.width = pctStr;
          this._lastHarpoonPct = pctStr;
        }
        const isUrgent = this.player.harpoonTimer <= 2.0;
        if (this._lastHarpoonUrgent !== isUrgent) {
          if (this.dom.badgeHarpoon) this.dom.badgeHarpoon.classList.toggle("is-urgent", isUrgent);
          this._lastHarpoonUrgent = isUrgent;
        }
      }
    }
  }

  gameLoop(timestamp) {
    this.animId = requestAnimationFrame(this._boundGameLoop);

    // Power optimization: Skip execution completely when tab is hidden/minimized
    if (this._isTabHidden) return;

    // Power optimization: Throttle rendering during idle/paused/menu states to 15-20 FPS
    if (this.state !== GameState3D.PLAYING && this.state !== GameState3D.VICTORY) {
      if (timestamp - this.lastRenderTime < 60) return;
    } else {
      // Fluid 60 FPS pacing: Prevents frame-drop jitter on 60Hz (which arrives ~15.8-16.6ms) while capping 120Hz at solid 60 FPS for 50% battery savings
      if (timestamp - this.lastRenderTime < 14.5) return;
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
      this.player.position.y += dt * 14;
      this.player.root.position.copy(this.player.position);

      // Heroic levitation pose: arms flared out in triumph
      if (this.player.bhairava?.parts) {
        const p = this.player.bhairava.parts;
        if (p.leftArm) p.leftArm.rotation.z = -0.45;
        if (p.rightArm) p.rightArm.rotation.z = 0.45;
      }

      // Update tractor beam dynamic ascension animation
      this.updateTractorBeam(dt, timestamp * 0.001);

      // Camera smoothly tracks player upward, tilting skyward toward the Complex clouds
      this.cameraManager.update(dt, this.player.position, 0, false, false, 0);
      if (this.camera) {
        this.camera.lookAt(this.player.position.x, this.player.position.y + 2.5, this.player.position.z + 10);
      }
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  update(dt, time) {
    // 0. Cinematic Complex Drop Sequence (High-Altitude Freefall to 3-Point Touchdown)
    if (this.isComplexDropActive) {
      this.updateComplexDrop(dt);

      // Advance track segments and environment so the city moves beneath him
      this.trackPool.update(this.player.position.z, false, dt);
      this.environment.update(time, this.player.position.z);

      // Third-person camera tracks player smoothly down to the ground
      this.cameraManager.update(
        dt,
        this.player.position,
        this.currentSpeed,
        false,
        false,
        0
      );

      // Dynamic cinematic lighting tracking player position
      if (this.rimLight && this.rimLightTarget) {
        this.rimLight.position.set(-15, 14, this.player.position.z + 10);
        this.rimLightTarget.position.set(0, 1.5, this.player.position.z);
      }
      if (this.heroFillLight && this.heroFillTarget) {
        this.heroFillLight.position.set(0, 8, this.player.position.z - 8);
        this.heroFillTarget.position.set(0, 1.5, this.player.position.z);
      }

      this.updateHud();
      return;
    }

    // 1. Progression & Multi-Tier Difficulty Speed Scaling (Subway Surfers gamemodes.json)
    const mult = this.player.hasMultiplier ? 2 : 1;
    this.score += dt * this.currentSpeed * 1.5 * mult;

    this.runDuration = (this.runDuration || 0) + dt;
    const t = this.runDuration;
    let targetSpeed = CONFIG.INITIAL_SPEED;

    if (t < 30.0) {
      // Stage 1 (0-30s): Initial steady run (23.5 -> 27.0 m/s)
      targetSpeed = CONFIG.INITIAL_SPEED + (t / 30.0) * 3.5;
    } else if (t < 75.0) {
      // Stage 2 (30-75s): Intermediate acceleration (27.0 -> 32.5 m/s)
      targetSpeed = 27.0 + ((t - 30.0) / 45.0) * 5.5;
    } else if (t < 150.0) {
      // Stage 3 (75-150s): Reflex challenge (32.5 -> 38.0 m/s)
      targetSpeed = 32.5 + ((t - 75.0) / 75.0) * 5.5;
    } else {
      // Stage 4 (150s+): Asymptotic approach towards peak MAX_SPEED (42.0 m/s)
      const extraT = t - 150.0;
      targetSpeed = 38.0 + (CONFIG.MAX_SPEED - 38.0) * (1.0 - Math.exp(-extraT / 90.0));
    }

    this.currentSpeed = THREE.MathUtils.lerp(this.currentSpeed, targetSpeed, Math.min(1.0, 4.0 * dt));
    this.safeAudio("updateSpeed", this.currentSpeed, CONFIG.INITIAL_SPEED, CONFIG.MAX_SPEED);

    // 2. Update Player Kinematics
    this.player.update(dt, this.currentSpeed, time);

    // 3. Update Infinite Track Segments & Complex Environment
    this.trackPool.update(this.player.position.z, this.player.hasJetpack, dt);
    this.environment.update(time, this.player.position.z);

    // 4. Update Third-Person Follow Camera with Slide Dip & Dynamic Roll
    this.cameraManager.update(
      dt,
      this.player.position,
      this.currentSpeed,
      this.player.state === "sliding",
      this.player.isLaneSwitching,
      this.player.turnDirection
    );
    if (this.rimLight && this.rimLightTarget) {
      this.rimLight.position.set(-15, 14, this.player.position.z + 10);
      this.rimLightTarget.position.set(0, 1.5, this.player.position.z);
    }
    if (this.heroFillLight && this.heroFillTarget) {
      this.heroFillLight.position.set(0, 8, this.player.position.z - 8);
      this.heroFillTarget.position.set(0, 1.5, this.player.position.z);
    }

    // 5. Collision Detection (Standard Obstacles: Trains, Hurdles, Laser Gates)
    const activeObstacles = this.trackPool.getAllActiveObstacles(this.player.position.z);
    const hitResult = CollisionManager3D.checkObstacleCollisions(this.player, activeObstacles);

    if (hitResult) {
      if (hitResult.type === "collision") {
        if (this.bountyManager) this.bountyManager.breakStreak();
        const isMovingTrain = !!(hitResult.obstacle?.mesh?.userData?.isMoving);

        if (this.player.hasShield) {
          // Shield absorbs collision
          this.player.breakShield();
          this.safeAudio("playShieldBreak");
          this.cameraManager.shake(0.55);

          // If hitting a static train with a shield, pop onto roof; moving train knocks back
          if (hitResult.obstacle && hitResult.obstacle.type === "train" && !isMovingTrain) {
            this.player.position.y = 4.15;
            this.player.groundElevation = 4.15;
            this.player.isGrounded = true;
            this.player.velocityY = 1.8;
          }
        } else if (this.player.invulnerableTimer <= 0) {
          if (this.player.healAidTimer > 0) {
            // Second hit during the 5-second Bujji Aid recovery window -> Run Ends!
            this.safeAudio("playHit");
            this.cameraManager.shake(0.75);
            this.gameOver();
            return;
          } else {
            // FIRST HIT: Trigger 5-Second Bujji Aid Second Chance!
            this.player.triggerBujjiAid(5.0);
            this.safeAudio("playHit");
            this.safeAudio("playDialogue", "bujji");
            this.cameraManager.shake(0.60);

            // Immediately clear/evade the hit obstacle so player NEVER takes a double-hit from the same object
            const hitObs = hitResult.obstacle;
            if (hitObs) {
              if (hitObs.type === "train") {
                // Bujji repulsor launches player onto train rooftop deck with full clearance
                this.player.position.y = 4.15;
                this.player.groundElevation = 4.15;
                this.player.isGrounded = true;
                this.player.velocityY = 2.2;
                this.player.invulnerableTimer = 2.5;
              } else {
                // Hurdle, gate, or tall blocker: Demolish the obstacle with kinetic feedback
                hitObs.destroyed = true;
                if (hitObs.mesh) {
                  hitObs.mesh.visible = false;
                  if (hitObs.mesh.userData) hitObs.mesh.userData.destroyed = true;
                }
                this.player.invulnerableTimer = 2.0;
              }
            }
          }
        }
      } else if (hitResult.type === "bounty_takedown") {
        const target = hitResult.target;
        if (target && !target.destroyed) {
          target.destroyed = true;
          if (target.mesh) target.mesh.visible = false;
          let reward = hitResult.rewardUnits || 5000;
          if (this.bountyManager) {
            reward = this.bountyManager.recordTakedown(hitResult.targetType || "scavenger", reward, hitResult.targetName || "TARGET");
          } else {
            reward *= mult;
          }
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
          let reward = hitResult.rewardUnits || 10000;
          if (this.bountyManager) {
            reward = this.bountyManager.recordTakedown("crate", reward, "Bounty Stash");
          } else {
            reward *= mult;
          }
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
          if (this.bountyManager) {
            this.bountyManager.progressContract("reach_streak", this.bountyManager.streakCount + 1, true);
          }
          this.showFloatingBountyBanner(`📡 EXTRACTION SECURED! +${reward.toLocaleString()} U`, "bounty");
          this.safeAudio("playPowerup");
          this.cameraManager.shake(0.4);
        }
      } else if (hitResult.type === "slide_cleared") {
        const bonus = 250 * mult;
        this.score += bonus;
        this.triggerHudPunch();
      } else if (hitResult.type === "jump_cleared") {
        const bonus = 250 * mult;
        this.score += bonus;
        this.triggerHudPunch();
      }
    }

    // 6. Collectible Item Pickup & Magnet Attraction (Spatially Filtered around Player)
    const activeCollectibles = this.trackPool.getAllActiveCollectibles(this.player.hasJetpack, this.player.position.z);
    const collected = CollisionManager3D.checkCollectiblePickups(this.player, activeCollectibles, dt);

    for (const item of collected) {
      if (item.type === "coin") {
        const prevUnits = this.units;
        const addUnits = item.points * mult;
        this.units += addUnits;
        this.score += addUnits;
        this.safeAudio("playCoin", mult);
        this.triggerHudPunch();

        // Milestone audio cues (Every 200k Units)
        if (Math.floor(this.units / 200000) > Math.floor(prevUnits / 200000)) {
          this.safeAudio("playDialogue", "milestone");
        }

        // Win Condition: 1 Million Units in Complex Heist mode -> Unlocks entry to Complex!
        if (this.gameMode === "heist" && !this.hasAchievedHeist && this.units >= CONFIG.TARGET_UNITS) {
          this.hasAchievedHeist = true;
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
        this.triggerHudPunch();
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
