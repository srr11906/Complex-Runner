/**
 * COMPLEX RUNNER - Next-Gen 3D Sci-Fi Runner
 * 3D Player Controller: Kinematic Movement, Lane Switching, Jumps, Slides, Jetpack
 */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { CONFIG } from "./config.js?v=20261108_sky_ascent_v81";
import { BhairavaModel } from "./models/bhairavaModel.js?v=20261108_sky_ascent_v81";
import { BujjiModel } from "./models/bujjiModel.js?v=20261108_sky_ascent_v81";

export class Player3D {
  constructor(scene) {
    this.scene = scene;
    this.root = new THREE.Group();

    // 3D Models
    this.bhairava = new BhairavaModel();
    this.bujji = new BujjiModel();
    this.root.add(this.bhairava.root);
    this.root.add(this.bujji.root);

    // Shield Aura Mesh
    const shieldGeo = new THREE.SphereGeometry(1.4, 24, 24);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0xFDE047,
      transparent: true,
      opacity: 0.35,
      wireframe: true
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldMesh.position.y = 1.0;
    this.shieldMesh.visible = false;
    this.root.add(this.shieldMesh);

    // Blue Holographic Glitch Healing Aura Field (80% Outer Wireframe Lattice / 20% Subtle Core)
    this.healGlitchGroup = new THREE.Group();
    this.healGlitchGroup.visible = false;

    // 1. Subtle 20% Inner Ambient Energy Glow
    const coreGeo = new THREE.CylinderGeometry(0.22, 0.92, 2.15, 16, 1, true);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x00E5FF,
      transparent: true,
      opacity: 0.10, // Very subtle, clean 20% inner wash
      side: THREE.DoubleSide
    });
    this.healGlitchCore = new THREE.Mesh(coreGeo, coreMat);
    this.healGlitchCore.position.set(0, 1.22, 0.05);
    this.healGlitchGroup.add(this.healGlitchCore);

    // 2. Dominant 80% Holographic Glitch Scanline Wireframe Lattice
    const latticeGeo = new THREE.CylinderGeometry(0.24, 0.98, 2.2, 12, 10, true);
    const latticeMat = new THREE.MeshBasicMaterial({
      color: 0x00E5FF,
      wireframe: true,
      transparent: true,
      opacity: 0.38, // Crisp, clean 80% outer wireframe
      side: THREE.DoubleSide
    });
    this.healGlitchLattice = new THREE.Mesh(latticeGeo, latticeMat);
    this.healGlitchLattice.position.set(0, 1.22, 0.05);
    this.healGlitchGroup.add(this.healGlitchLattice);

    this.root.add(this.healGlitchGroup);

    // =========================================================================
    // PLASMA GAUNTLET LASER BEAM (Spacebar Action)
    // =========================================================================
    this.laserBeamGroup = new THREE.Group();
    this.laserBeamGroup.visible = false;

    const outerLaserGeo = new THREE.CylinderGeometry(0.03, 0.03, 38.0, 12);
    const outerLaserMat = new THREE.MeshBasicMaterial({
      color: 0x00E5FF,
      transparent: true,
      opacity: 0.85
    });
    const outerLaser = new THREE.Mesh(outerLaserGeo, outerLaserMat);
    outerLaser.rotation.x = Math.PI / 2;
    outerLaser.position.set(0.32, 1.35, 19.0);
    outerLaser.name = "outerLaser";
    this.laserBeamGroup.add(outerLaser);

    const coreLaserGeo = new THREE.CylinderGeometry(0.0125, 0.0125, 38.0, 8);
    const coreLaserMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const coreLaser = new THREE.Mesh(coreLaserGeo, coreLaserMat);
    coreLaser.rotation.x = Math.PI / 2;
    coreLaser.position.set(0.32, 1.35, 19.0);
    coreLaser.name = "coreLaser";
    this.laserBeamGroup.add(coreLaser);

    // Muzzle Flash
    const muzzleFlash = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x00E5FF, transparent: true, opacity: 0.9 })
    );
    muzzleFlash.position.set(0.32, 1.35, 0.6);
    this.laserBeamGroup.add(muzzleFlash);

    this.root.add(this.laserBeamGroup);

    // Combat & Action States
    this.shootTimer = 0;
    this.laserCooldown = 0;
    this.hasHarpoon = false;
    this.harpoonTimer = 0;

    // State Variables
    this.currentLane = 1; // 0: Left (-3m), 1: Center (0m), 2: Right (+3m)
    this.targetX = CONFIG.LANES[1];
    this.position = new THREE.Vector3(0, 0, 0);
    this.velocityY = 0;
    this.isGrounded = true;
    this.groundElevation = 0; // Supports running on skiffs/containers!

    this.state = "running"; // "running" | "jumping" | "sliding" | "hit"
    this.slideTimer = 0;
    this.turnDirection = 0; // -1: Left, +1: Right

    // Input Buffer Queue (Subway Surfers 95ms input queue)
    this.inputBuffer = [];

    // Critically Damped Hermite Quintic Lane Transition Kinematics
    this.isLaneSwitching = false;
    this.laneStartX = CONFIG.LANES[1];
    this.laneElapsed = 0;
    this.laneDuration = CONFIG.LANE_CHANGE_TIME;

    // Fast-Fall Dive Down & Landing Impact Squash/Stretch
    this.isFastFalling = false;
    this.landingSquashTimer = 0;

    // Power-Up & Aid States
    this.hasShield = false;
    this.shieldTimer = 0;
    this.shieldMaxDuration = 8.0;
    this.hasMagnet = false;
    this.magnetTimer = 0;
    this.magnetMaxDuration = 8.0;
    this.hasJetpack = false;
    this.jetpackTimer = 0;
    this.jetpackMaxDuration = 8.0;
    this.hasMultiplier = false;
    this.multiplierTimer = 0;
    this.multiplierMaxDuration = 8.0;
    this.invulnerableTimer = 0;
    this.healAidTimer = 0; // 5-Second Grace Window

    // Pre-allocated collision bounds object
    this._bounds = {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
      minZ: 0,
      maxZ: 0,
      centerX: 0,
      centerY: 0,
      centerZ: 0,
      height: 0,
      isSliding: false
    };

    // -------------------------------------------------------------------------
    // SUBWAY SURFERS / REA RUNNER POLISH: HIGH-PERFORMANCE SLIDE FRICTION SPARKS
    // Zero-GC pooled particle system (42 particles) emitting behind sneaker soles
    // -------------------------------------------------------------------------
    const sparkCount = 42;
    this._sparkMaxCount = sparkCount;
    this._sparkGeo = new THREE.BufferGeometry();
    this._sparkPositions = new Float32Array(sparkCount * 3);
    this._sparkColors = new Float32Array(sparkCount * 3);
    this._sparkVelocities = new Float32Array(sparkCount * 3);
    this._sparkLifetimes = new Float32Array(sparkCount);
    this._sparkMaxLife = new Float32Array(sparkCount);

    for (let i = 0; i < sparkCount; i++) {
      this._sparkPositions[i * 3 + 1] = -999;
      this._sparkLifetimes[i] = 0;
    }

    this._sparkGeo.setAttribute("position", new THREE.BufferAttribute(this._sparkPositions, 3));
    this._sparkGeo.setAttribute("color", new THREE.BufferAttribute(this._sparkColors, 3));

    const sparkMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.slideSparks = new THREE.Points(this._sparkGeo, sparkMat);
    this.scene.add(this.slideSparks);

    // -------------------------------------------------------------------------
    // LANDING IMPACT SHOCKWAVE (Expanding Ground Ring on touchdown/fast-fall)
    // -------------------------------------------------------------------------
    const shockRingGeo = new THREE.RingGeometry(0.35, 0.55, 24);
    this.shockRingMat = new THREE.MeshBasicMaterial({
      color: 0xF59E0B,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.landingShockwave = new THREE.Mesh(shockRingGeo, this.shockRingMat);
    this.landingShockwave.rotation.x = -Math.PI / 2;
    this.landingShockwave.position.y = 0.04;
    this.landingShockwave.visible = false;
    this.scene.add(this.landingShockwave);
    this.shockwaveTimer = 0;

    this.scene.add(this.root);
  }

  reset() {
    this.currentLane = 1;
    this.targetX = CONFIG.LANES[1];
    this.position.set(0, 0, 0);
    this.velocityY = 0;
    this.isGrounded = true;
    this.groundElevation = 0;

    this.state = "running";
    this.slideTimer = 0;
    this.turnDirection = 0;

    this.inputBuffer = [];
    this.isLaneSwitching = false;
    this.laneStartX = CONFIG.LANES[1];
    this.laneElapsed = 0;
    this.isFastFalling = false;
    this.landingSquashTimer = 0;
    this.root.scale.set(1.0, 1.0, 1.0);

    this.hasShield = false;
    this.shieldTimer = 0;
    this.hasMagnet = false;
    this.magnetTimer = 0;
    this.hasJetpack = false;
    this.jetpackTimer = 0;
    this.hasMultiplier = false;
    this.multiplierTimer = 0;
    this.invulnerableTimer = 0;
    this.healAidTimer = 0; // 5-Second Grace Window

    this.shootTimer = 0;
    this.laserCooldown = 0;
    this.hasHarpoon = false;
    this.harpoonTimer = 0;
    if (this.laserBeamGroup) this.laserBeamGroup.visible = false;

    this.clearBujjiAid();

    if (this.shieldMesh) this.shieldMesh.visible = false;
    if (this.bhairava && this.bhairava.root) {
      this.bhairava.root.visible = true;
      this.bhairava.root.position.x = 0;
    }
    if (this.bujji && this.bujji.root) {
      this.bujji.root.visible = true;
    }
    if (this._sparkLifetimes) {
      for (let i = 0; i < this._sparkMaxCount; i++) {
        this._sparkPositions[i * 3 + 1] = -999;
        this._sparkLifetimes[i] = 0;
      }
      if (this._sparkGeo) this._sparkGeo.attributes.position.needsUpdate = true;
    }
    if (this.landingShockwave) {
      this.landingShockwave.visible = false;
      this.shockwaveTimer = 0;
    }
    this.root.rotation.set(0, 0, 0);
    this.updateTransform();
  }

  shootLaser(distance = 38.0) {
    if (this.hasJetpack || this.laserCooldown > 0) {
      return { shot: false };
    }

    // Snappy rapid-fire cooldown (up to ~5.5 shots per second)
    this.laserCooldown = 0.18;
    this.shootTimer = 0.18;
    if (this.laserBeamGroup) {
      this.laserBeamGroup.visible = true;
      const validDist = Math.max(0.5, Math.min(55.0, distance));
      const scaleZ = validDist / 38.0;
      const outer = this.laserBeamGroup.getObjectByName("outerLaser");
      const core = this.laserBeamGroup.getObjectByName("coreLaser");
      if (outer) {
        outer.scale.y = scaleZ;
        outer.position.z = (38.0 * scaleZ) / 2;
      }
      if (core) {
        core.scale.y = scaleZ;
        core.position.z = (38.0 * scaleZ) / 2;
      }
    }

    return {
      shot: true,
      laneX: this.position.x,
      playerZ: this.position.z,
      range: 55.0
    };
  }

  giveHarpoon(duration = 8.0) {
    this.hasHarpoon = true;
    this.harpoonTimer = duration;
  }

  /**
   * Subway Surfers Input Buffer System:
   * Queues rapid consecutive swipes (80-100ms window) so inputs are never dropped.
   */
  queueInput(action) {
    const now = performance.now();
    if (this.inputBuffer.length >= 2) this.inputBuffer.shift();
    this.inputBuffer.push({ action, time: now });
    return this.processInputBuffer();
  }

  processInputBuffer() {
    if (this.inputBuffer.length === 0) return null;
    const now = performance.now();
    const maxAge = (CONFIG.INPUT_BUFFER_TIME || 0.095) * 1000;
    while (this.inputBuffer.length > 0 && now - this.inputBuffer[0].time > maxAge) {
      this.inputBuffer.shift();
    }
    if (this.inputBuffer.length === 0) return null;

    const next = this.inputBuffer[0];
    let executed = false;
    let result = null;

    if (next.action === "left") {
      const progress = this.isLaneSwitching ? this.laneElapsed / this.laneDuration : 1.0;
      if (progress >= 0.45) {
        result = this.executeMoveLeft();
        executed = true;
      }
    } else if (next.action === "right") {
      const progress = this.isLaneSwitching ? this.laneElapsed / this.laneDuration : 1.0;
      if (progress >= 0.45) {
        result = this.executeMoveRight();
        executed = true;
      }
    } else if (next.action === "jump") {
      if (this.isGrounded || this.state === "sliding") {
        result = this.executeJump();
        executed = true;
      }
    } else if (next.action === "slide") {
      result = this.executeSlide();
      executed = true;
    }

    if (executed) {
      this.inputBuffer.shift();
      return result;
    }
    return null;
  }

  moveLeft() {
    return this.queueInput("left");
  }

  moveRight() {
    return this.queueInput("right");
  }

  jump() {
    return this.queueInput("jump");
  }

  slide() {
    return this.queueInput("slide");
  }

  executeMoveLeft() {
    if (this.currentLane < 2) {
      this.currentLane++;
      this.laneStartX = this.position.x;
      this.targetX = CONFIG.LANES[this.currentLane];
      this.turnDirection = 1;
      this.isLaneSwitching = true;
      this.laneElapsed = 0;
      this.laneDuration = CONFIG.LANE_CHANGE_TIME;
      return "moved";
    }
    return null;
  }

  executeMoveRight() {
    if (this.currentLane > 0) {
      this.currentLane--;
      this.laneStartX = this.position.x;
      this.targetX = CONFIG.LANES[this.currentLane];
      this.turnDirection = -1;
      this.isLaneSwitching = true;
      this.laneElapsed = 0;
      this.laneDuration = CONFIG.LANE_CHANGE_TIME;
      return "moved";
    }
    return null;
  }

  executeJump() {
    if (this.hasJetpack) return false;

    // Instant Slide Cancel: swiping UP during a slide immediately triggers full vertical jump!
    this.state = "jumping";
    this.slideTimer = 0;
    this.velocityY = CONFIG.JUMP_VELOCITY;
    this.isGrounded = false;
    this.isFastFalling = false;
    return true;
  }

  executeSlide() {
    if (this.hasJetpack) return false;

    if (!this.isGrounded) {
      // Fast-Fall Dive Down: Instant downward acceleration (-42m/s) in mid-air!
      this.velocityY = CONFIG.FAST_FALL_VELOCITY;
      this.isFastFalling = true;
      this.slideTimer = CONFIG.SLIDE_DURATION;
      return "dive";
    } else {
      // Ground slide
      this.state = "sliding";
      this.slideTimer = CONFIG.SLIDE_DURATION;
      this.isFastFalling = false;
      return "slide";
    }
  }

  triggerBujjiAid(duration = 5.0) {
    this.healAidTimer = duration;
    this.invulnerableTimer = 2.0; // 2.0s safe post-hit immunity so player clears the current obstacle
    if (this.healGlitchGroup) this.healGlitchGroup.visible = true;
    if (this.bujji) this.bujji.setAid(true);
  }

  clearBujjiAid() {
    this.healAidTimer = 0;
    if (this.healGlitchGroup) this.healGlitchGroup.visible = false;
    if (this.bujji) this.bujji.setAid(false);
  }

  giveShield(duration = 8.0) {
    this.hasShield = true;
    this.shieldTimer = duration;
    this.shieldMaxDuration = duration;
    this.invulnerableTimer = 0;
    if (this.shieldMesh) this.shieldMesh.visible = true;
  }

  breakShield() {
    this.hasShield = false;
    this.shieldTimer = 0;
    this.invulnerableTimer = 1.6;
    if (this.shieldMesh) this.shieldMesh.visible = false;
  }

  giveMagnet(duration = 8.0) {
    this.hasMagnet = true;
    this.magnetTimer = duration;
    this.magnetMaxDuration = duration;
  }

  giveJetpack(duration = 8.0) {
    this.hasJetpack = true;
    this.jetpackTimer = duration;
    this.jetpackMaxDuration = duration;
    this.state = "running";
    window.gameEngine3D?.trackPool?.setJetpackVisibility(true);
  }

  giveMultiplier(duration = 8.0) {
    this.hasMultiplier = true;
    this.multiplierTimer = duration;
    this.multiplierMaxDuration = duration;
  }

  update(dt, currentSpeed, time) {
    // 1. Power-Up & Action Timers
    if (this.hasShield) {
      this.shieldTimer -= dt;
      if (this.shieldTimer <= 0) {
        this.hasShield = false;
        this.shieldTimer = 0;
        if (this.shieldMesh) this.shieldMesh.visible = false;
      }
    }

    if (this.hasMagnet) {
      this.magnetTimer -= dt;
      if (this.magnetTimer <= 0) this.hasMagnet = false;
    }

    if (this.hasMultiplier) {
      this.multiplierTimer -= dt;
      if (this.multiplierTimer <= 0) this.hasMultiplier = false;
    }

    if (this.hasJetpack) {
      this.jetpackTimer -= dt;
      if (this.jetpackTimer <= 0) {
        this.hasJetpack = false;
        window.gameEngine3D?.trackPool?.setJetpackVisibility(false);
      }
    }

    if (this.hasHarpoon) {
      this.harpoonTimer -= dt;
      if (this.harpoonTimer <= 0) this.hasHarpoon = false;
    }

    if (this.laserCooldown > 0) {
      this.laserCooldown -= dt;
    }

    if (this.shootTimer > 0) {
      this.shootTimer -= dt;
      if (this.laserBeamGroup) {
        this.laserBeamGroup.visible = true;
        const currentScale = this.laserBeamGroup.scale.x;
        const targetScale = 1.0 + Math.sin(time * 50) * 0.15;
        this.laserBeamGroup.scale.x = THREE.MathUtils.lerp(currentScale, targetScale, 0.3);
        this.laserBeamGroup.scale.y = this.laserBeamGroup.scale.x;
      }
      if (this.shootTimer <= 0) {
        if (this.laserBeamGroup) this.laserBeamGroup.visible = false;
      }
    } else {
      if (this.laserBeamGroup && this.laserBeamGroup.visible) {
        this.laserBeamGroup.visible = false;
      }
    }

    // 2. Poll & Process Buffered Inputs (Subway Surfers responsive controls)
    this.processInputBuffer();

    // 3. Forward Movement along +Z axis
    this.position.z += currentSpeed * dt;

    // 4. Critically Damped Quintic Smoothstep Lane Transition Kinematics
    if (this.isLaneSwitching) {
      this.laneElapsed += dt;
      const tau = Math.min(1.0, this.laneElapsed / this.laneDuration);
      // Quintic Smoothstep: 6t^5 - 15t^4 + 10t^3 (C2 continuity, zero instantaneous jerk)
      const smoothTau = tau * tau * tau * (tau * (tau * 6.0 - 15.0) + 10.0);
      this.position.x = this.laneStartX + (this.targetX - this.laneStartX) * smoothTau;

      // Dynamic Banking Roll and Directional Yaw
      const rollFactor = Math.sin(Math.PI * tau);
      this.root.rotation.z = -this.turnDirection * 0.16 * rollFactor;
      this.root.rotation.y = this.turnDirection * 0.08 * rollFactor;

      if (tau >= 1.0) {
        this.position.x = this.targetX;
        this.isLaneSwitching = false;
        this.turnDirection = 0;
        this.root.rotation.z = 0;
        this.root.rotation.y = 0;
      }
    } else {
      this.position.x = this.targetX;
      this.root.rotation.z = THREE.MathUtils.lerp(this.root.rotation.z, 0, 16 * dt);
      this.root.rotation.y = THREE.MathUtils.lerp(this.root.rotation.y, 0, 16 * dt);
    }

    // 5. Vertical Jump, Apex Hangtime & Fast-Fall Kinematics
    const targetGroundY = this.hasJetpack ? CONFIG.JETPACK_ALTITUDE : this.groundElevation;

    if (this.hasJetpack) {
      // Smoothly ascend to jetpack altitude
      this.position.y = THREE.MathUtils.lerp(this.position.y, targetGroundY, 6 * dt);
      this.isGrounded = false;
      this.velocityY = 0;
    } else {
      if (!this.isGrounded) {
        // Subway Surfers Apex Hangtime: Soften gravity near jump peak (|vy| < 2.5 m/s)
        const isNearApex = !this.isFastFalling && Math.abs(this.velocityY) < 2.5;
        const currentGravity = isNearApex ? (CONFIG.APEX_GRAVITY || -34.0) : CONFIG.GRAVITY;

        this.velocityY += currentGravity * dt;
        this.position.y += this.velocityY * dt;

        if (this.position.y <= targetGroundY) {
          this.position.y = targetGroundY;
          this.velocityY = 0;
          this.isGrounded = true;
          this.isFastFalling = false;

          // Touchdown Squash and Stretch (0.09s impact feedback)
          this.landingSquashTimer = 0.09;

          // Trigger expanding impact shockwave ring on ground
          this.shockwaveTimer = 0.24;
          if (this.landingShockwave) {
            this.landingShockwave.position.set(this.position.x, targetGroundY + 0.04, this.position.z);
            this.landingShockwave.scale.set(0.6, 0.6, 1.0);
            this.landingShockwave.visible = true;
            this.shockRingMat.opacity = 0.85;
          }

          // Seamless ground roll if sliding or dive-down was performed
          if (this.slideTimer > 0) {
            this.state = "sliding";
          } else {
            this.state = "running";
          }
        }
      } else {
        // Snapped to ground elevation
        this.position.y = targetGroundY;
      }
    }

    // 6. Touchdown Landing Squash & Stretch Feedback
    if (this.landingSquashTimer > 0) {
      this.landingSquashTimer -= dt;
      const progress = Math.max(0, this.landingSquashTimer / 0.09);
      const squashY = 1.0 - 0.12 * Math.sin(progress * Math.PI);
      const stretchXZ = 1.0 + 0.06 * Math.sin(progress * Math.PI);
      this.root.scale.set(stretchXZ, squashY, stretchXZ);
    } else {
      this.root.scale.set(1.0, 1.0, 1.0);
    }

    // 7. Slide Timer Expiration
    if (this.state === "sliding") {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) {
        this.state = "running";
      }
    }

    // 6. Shield Pulse & Invulnerability Glitch Effect
    if (this.hasShield && this.shieldMesh) {
      this.shieldMesh.rotation.y += dt * 3.0;
      this.shieldMesh.rotation.x += dt * 1.5;
    }

    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
      const isVisible = Math.floor(time * 36) % 2 === 0;
      if (this.bhairava && this.bhairava.root) {
        this.bhairava.root.visible = isVisible;
        this.bhairava.root.position.x = (Math.random() - 0.5) * 0.08;
      }
      if (this.bujji && this.bujji.root) {
        this.bujji.root.visible = isVisible;
      }
      if (this.invulnerableTimer <= 0) {
        if (this.bhairava && this.bhairava.root) {
          this.bhairava.root.visible = true;
          this.bhairava.root.position.x = 0;
        }
        if (this.bujji && this.bujji.root) {
          this.bujji.root.visible = true;
        }
      }
    } else {
      if (this.bhairava && this.bhairava.root) {
        this.bhairava.root.visible = true;
        this.bhairava.root.position.x = 0;
      }
      if (this.bujji && this.bujji.root) {
        this.bujji.root.visible = true;
      }
    }

    // 7. Blue Holographic Glitch Healing Aura Animation (80% Outer Lattice / 20% Inner Glow)
    if (this.healAidTimer > 0) {
      this.healAidTimer -= dt;

      if (this.healGlitchGroup && this.healGlitchCore && this.healGlitchLattice) {
        this.healGlitchGroup.visible = true;

        // Periodic digital holographic de-sync glitch pulse
        const glitchCycle = (time * 12.0) % 1.0;
        const isGlitching = glitchCycle > 0.82; // Brief subtle glitch moments

        let offsetX = 0;
        let offsetZ = 0;
        let scaleJitter = 1.0;

        if (isGlitching) {
          // Subtle crisp stepped slice displacement
          offsetX = (Math.sin(time * 50.0) > 0 ? 0.04 : -0.04);
          offsetZ = (Math.cos(time * 40.0) > 0 ? 0.03 : -0.03);
          scaleJitter = 1.0 + Math.sin(time * 70.0) * 0.08;
          this.healGlitchCore.material.opacity = 0.16 + Math.random() * 0.08; // 20% faint inner glow
          this.healGlitchLattice.material.opacity = 0.52 + Math.random() * 0.18; // 80% primary wireframe
        } else {
          // Smooth atmospheric scanline float
          offsetX = Math.sin(time * 3.5) * 0.015;
          offsetZ = Math.cos(time * 4.0) * 0.015;
          scaleJitter = 1.0 + Math.sin(time * 6.0) * 0.025;
          this.healGlitchCore.material.opacity = 0.08 + Math.sin(time * 8.0) * 0.04;
          this.healGlitchLattice.material.opacity = 0.35 + Math.sin(time * 9.0) * 0.08;
        }

        this.healGlitchCore.position.x = offsetX;
        this.healGlitchCore.position.z = 0.05 + offsetZ;
        this.healGlitchCore.scale.set(scaleJitter, 1.0 + (scaleJitter - 1.0) * 0.3, scaleJitter);
        this.healGlitchCore.rotation.y += dt * 2.2;

        this.healGlitchLattice.position.x = -offsetX * 0.7;
        this.healGlitchLattice.position.z = 0.05 - offsetZ * 0.7;
        this.healGlitchLattice.scale.set(scaleJitter * 1.03, 1.0, scaleJitter * 1.03);
        this.healGlitchLattice.rotation.y -= dt * 3.5;
      }

      if (this.healAidTimer <= 0) {
        this.clearBujjiAid();
      }
    } else {
      if (this.healGlitchGroup && this.healGlitchGroup.visible) {
        this.clearBujjiAid();
      }
    }

    // 8. Ground Friction Slide Sparks & Dust Emitter (Subway Surfers signature kinetic fx)
    if (this._sparkLifetimes) {
      const isSlidingOnGround = this.state === "sliding" && this.isGrounded && !this.hasJetpack;
      let sparksUpdated = false;

      if (isSlidingOnGround) {
        // Emit 2-3 sparks per frame
        const emitCount = Math.min(3, Math.floor(Math.random() * 3) + 1);
        for (let e = 0; e < emitCount; e++) {
          for (let i = 0; i < this._sparkMaxCount; i++) {
            if (this._sparkLifetimes[i] <= 0) {
              const footSide = Math.random() > 0.5 ? 0.15 : -0.15;
              this._sparkPositions[i * 3] = this.position.x + footSide + (Math.random() - 0.5) * 0.08;
              this._sparkPositions[i * 3 + 1] = targetGroundY + 0.04 + Math.random() * 0.04;
              this._sparkPositions[i * 3 + 2] = this.position.z - 0.28 - Math.random() * 0.25;

              this._sparkVelocities[i * 3] = (Math.random() - 0.5) * 2.2 + (this.turnDirection * 0.8);
              this._sparkVelocities[i * 3 + 1] = Math.random() * 2.4 + 0.6;
              this._sparkVelocities[i * 3 + 2] = -currentSpeed * 0.42 - Math.random() * 3.5;

              const duration = 0.20 + Math.random() * 0.14;
              this._sparkLifetimes[i] = duration;
              this._sparkMaxLife[i] = duration;

              // High-voltage friction color (Amber Gold to Hot White)
              const hot = Math.random();
              this._sparkColors[i * 3] = 1.0;
              this._sparkColors[i * 3 + 1] = 0.65 + hot * 0.32;
              this._sparkColors[i * 3 + 2] = 0.15 + hot * 0.65;
              break;
            }
          }
        }
      }

      // Physics integration for active sparks
      for (let i = 0; i < this._sparkMaxCount; i++) {
        if (this._sparkLifetimes[i] > 0) {
          sparksUpdated = true;
          this._sparkLifetimes[i] -= dt;

          if (this._sparkLifetimes[i] <= 0) {
            this._sparkPositions[i * 3 + 1] = -999;
          } else {
            this._sparkPositions[i * 3] += this._sparkVelocities[i * 3] * dt;
            this._sparkPositions[i * 3 + 1] += this._sparkVelocities[i * 3 + 1] * dt;
            this._sparkPositions[i * 3 + 2] += this._sparkVelocities[i * 3 + 2] * dt;

            // Gravity
            this._sparkVelocities[i * 3 + 1] -= 15.0 * dt;

            // Ground collision bounce
            if (this._sparkPositions[i * 3 + 1] <= targetGroundY + 0.02) {
              this._sparkPositions[i * 3 + 1] = targetGroundY + 0.02;
              this._sparkVelocities[i * 3 + 1] = -this._sparkVelocities[i * 3 + 1] * 0.35;
            }

            // Fade intensity
            const lifeRatio = Math.max(0, this._sparkLifetimes[i] / this._sparkMaxLife[i]);
            this._sparkColors[i * 3] = lifeRatio;
            this._sparkColors[i * 3 + 1] = lifeRatio * 0.72;
            this._sparkColors[i * 3 + 2] = lifeRatio * 0.3;
          }
        }
      }

      if (sparksUpdated) {
        this._sparkGeo.attributes.position.needsUpdate = true;
        this._sparkGeo.attributes.color.needsUpdate = true;
      }
    }

    // 9. Update Landing Shockwave
    if (this.shockwaveTimer > 0) {
      this.shockwaveTimer -= dt;
      const progress = 1.0 - Math.max(0, this.shockwaveTimer / 0.24);
      const ringScale = 0.6 + progress * 2.8;
      this.landingShockwave.scale.set(ringScale, ringScale, 1.0);
      this.shockRingMat.opacity = Math.max(0, (1.0 - progress) * 0.82);
      if (this.shockwaveTimer <= 0) {
        this.landingShockwave.visible = false;
      }
    }

    // 10. Update 3D Character Rig & Bujji Companion Animations
    const speedRatio = currentSpeed / CONFIG.INITIAL_SPEED;
    const slideProgress = this.state === "sliding"
      ? Math.max(0, Math.min(1.0, 1.0 - (this.slideTimer / CONFIG.SLIDE_DURATION)))
      : 0;
    this.bhairava.updateAnimation(this.state, time, speedRatio, this.hasJetpack, this.shootTimer, slideProgress, this.turnDirection, this.isLaneSwitching);
    this.bujji.update(time, this.turnDirection);

    // Laser beam vertical alignment during slide vs running
    if (this.laserBeamGroup) {
      this.laserBeamGroup.position.y = this.state === "sliding" ? -0.72 : 0;
    }

    this.updateTransform();
  }

  updateTransform() {
    this.root.position.copy(this.position);
  }

  /**
   * 3D Collision Hitbox bounds calculation
   */
  getBounds() {
    const isSliding = this.state === "sliding" || (this.isFastFalling && this.slideTimer > 0);
    const height = isSliding ? CONFIG.PLAYER_SLIDE_HEIGHT : CONFIG.PLAYER_NORMAL_HEIGHT;
    const halfH = height / 2;
    const halfW = CONFIG.PLAYER_WIDTH / 2;
    const halfD = CONFIG.PLAYER_DEPTH / 2;

    this._bounds.minX = this.position.x - halfW;
    this._bounds.maxX = this.position.x + halfW;
    this._bounds.minY = this.position.y;
    this._bounds.maxY = this.position.y + height;
    this._bounds.minZ = this.position.z - halfD;
    this._bounds.maxZ = this.position.z + halfD;
    this._bounds.centerX = this.position.x;
    this._bounds.centerY = this.position.y + halfH;
    this._bounds.centerZ = this.position.z;
    this._bounds.height = height;
    this._bounds.isSliding = isSliding;

    return this._bounds;
  }

  setOutfit(theme) {
    if (this.bhairava && typeof this.bhairava.setOutfit === "function") {
      this.bhairava.setOutfit(theme);
    }
  }
}
