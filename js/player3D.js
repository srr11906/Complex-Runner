/**
 * COMPLEX RUNNER - Next-Gen 3D Sci-Fi Runner
 * 3D Player Controller: Kinematic Movement, Lane Switching, Jumps, Slides, Jetpack
 */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { CONFIG } from "./config.js";
import { BhairavaModel } from "./models/bhairavaModel.js";
import { BujjiModel } from "./models/bujjiModel.js";

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
    this.laneChangeTimer = 0;
    this.turnDirection = 0; // -1: Left, +1: Right

    // Power-Up & Aid States
    this.hasShield = false;
    this.hasMagnet = false;
    this.magnetTimer = 0;
    this.hasJetpack = false;
    this.jetpackTimer = 0;
    this.hasMultiplier = false;
    this.multiplierTimer = 0;
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
    this.laneChangeTimer = 0;
    this.turnDirection = 0;

    this.hasShield = false;
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
    this.root.rotation.set(0, 0, 0);
    this.updateTransform();
  }

  shootLaser(distance = 38.0) {
    if (this.hasJetpack) {
      return { shot: false };
    }

    // Instant continuous rapid fire with smooth visual punch
    this.shootTimer = 0.24;
    if (this.laserBeamGroup) {
      this.laserBeamGroup.visible = true;
      const validDist = Math.max(0.5, Math.min(38.0, distance));
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
      laneX: this.targetX,
      playerZ: this.position.z,
      range: 38.0
    };
  }

  giveHarpoon(duration = 8.0) {
    this.hasHarpoon = true;
    this.harpoonTimer = duration;
  }

  moveLeft() {
    if (this.currentLane < 2) {
      this.currentLane++;
      this.targetX = CONFIG.LANES[this.currentLane];
      this.turnDirection = 1;
      this.laneChangeTimer = CONFIG.LANE_CHANGE_TIME;
      return "moved";
    }
    return "barrier_hit";
  }

  moveRight() {
    if (this.currentLane > 0) {
      this.currentLane--;
      this.targetX = CONFIG.LANES[this.currentLane];
      this.turnDirection = -1;
      this.laneChangeTimer = CONFIG.LANE_CHANGE_TIME;
      return "moved";
    }
    return "barrier_hit";
  }

  jump() {
    if (this.hasJetpack) return false;

    if (this.isGrounded || this.state === "sliding") {
      // Cancel slide directly into jump if sliding
      this.state = "jumping";
      this.slideTimer = 0;
      this.velocityY = CONFIG.JUMP_VELOCITY;
      this.isGrounded = false;
      return true;
    }
    return false;
  }

  slide() {
    if (this.hasJetpack) return false;

    if (!this.isGrounded) {
      // In air -> Fast Fall / Dive snap!
      this.velocityY = CONFIG.FAST_FALL_VELOCITY;
      this.slideTimer = CONFIG.SLIDE_DURATION;
      return "dive";
    } else {
      // Ground slide
      this.state = "sliding";
      this.slideTimer = CONFIG.SLIDE_DURATION;
      return "slide";
    }
  }

  triggerBujjiAid(duration = 5.0) {
    this.healAidTimer = duration;
    this.invulnerableTimer = 1.2; // 1.2s brief post-hit immunity so player clears the current obstacle
    if (this.healGlitchGroup) this.healGlitchGroup.visible = true;
    if (this.bujji) this.bujji.setAid(true);
  }

  clearBujjiAid() {
    this.healAidTimer = 0;
    if (this.healGlitchGroup) this.healGlitchGroup.visible = false;
    if (this.bujji) this.bujji.setAid(false);
  }

  giveShield() {
    this.hasShield = true;
    this.invulnerableTimer = 0;
    if (this.shieldMesh) this.shieldMesh.visible = true;
  }

  breakShield() {
    this.hasShield = false;
    this.invulnerableTimer = 1.6;
    if (this.shieldMesh) this.shieldMesh.visible = false;
  }

  giveMagnet(duration = CONFIG.MAGNET_DURATION) {
    this.hasMagnet = true;
    this.magnetTimer = duration;
  }

  giveJetpack(duration = CONFIG.JETPACK_DURATION) {
    this.hasJetpack = true;
    this.jetpackTimer = duration;
    this.state = "running";
  }

  giveMultiplier(duration = CONFIG.DOUBLE_POINTS_DURATION) {
    this.hasMultiplier = true;
    this.multiplierTimer = duration;
  }

  update(dt, currentSpeed, time) {
    // 1. Power-Up & Action Timers
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
      }
    }

    if (this.hasHarpoon) {
      this.harpoonTimer -= dt;
      if (this.harpoonTimer <= 0) this.hasHarpoon = false;
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

    // 2. Forward Movement along +Z axis
    this.position.z += currentSpeed * dt;

    // 3. Smooth Lane Transition Interpolation (Critically Damped Spring)
    const laneSpeed = 1.0 / CONFIG.LANE_CHANGE_TIME;
    this.position.x = THREE.MathUtils.lerp(this.position.x, this.targetX, Math.min(1.0, 18 * dt));

    if (Math.abs(this.position.x - this.targetX) < 0.04) {
      this.turnDirection = 0;
    }

    // Dynamic Banking Roll on turn ($Z$-axis tilt)
    const targetRoll = -this.turnDirection * 0.18;
    this.root.rotation.z = THREE.MathUtils.lerp(this.root.rotation.z, targetRoll, 15 * dt);

    // 4. Vertical Jump & Gravity Kinematics
    const targetGroundY = this.hasJetpack ? CONFIG.JETPACK_ALTITUDE : this.groundElevation;

    if (this.hasJetpack) {
      // Smoothly ascend to jetpack altitude
      this.position.y = THREE.MathUtils.lerp(this.position.y, targetGroundY, 6 * dt);
      this.isGrounded = false;
      this.velocityY = 0;
    } else {
      if (!this.isGrounded) {
        this.velocityY += CONFIG.GRAVITY * dt;
        this.position.y += this.velocityY * dt;

        if (this.position.y <= targetGroundY) {
          this.position.y = targetGroundY;
          this.velocityY = 0;
          this.isGrounded = true;
          this.state = this.slideTimer > 0 ? "sliding" : "running";
        }
      } else {
        // Snapped to ground elevation
        this.position.y = targetGroundY;
      }
    }

    // 5. Slide Timer Expiration
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

    // 8. Update 3D Character Rig & Bujji Companion Animations
    const speedRatio = currentSpeed / CONFIG.INITIAL_SPEED;
    this.bhairava.updateAnimation(this.state, time, speedRatio, this.hasJetpack, this.shootTimer);
    this.bujji.update(time, this.turnDirection);

    this.updateTransform();
  }

  updateTransform() {
    this.root.position.copy(this.position);
  }

  /**
   * 3D Collision Hitbox bounds calculation
   */
  getBounds() {
    const isSliding = this.state === "sliding";
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
}
