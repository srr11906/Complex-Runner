/**
 * PRABHAS: KASI 2898 AD (3D Runner)
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

    // Power-Up States
    this.hasShield = false;
    this.hasMagnet = false;
    this.magnetTimer = 0;
    this.hasJetpack = false;
    this.jetpackTimer = 0;
    this.hasMultiplier = false;
    this.multiplierTimer = 0;
    this.invulnerableTimer = 0;

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

  moveLeft() {
    if (this.currentLane < 2) {
      this.currentLane++;
      this.targetX = CONFIG.LANES[this.currentLane];
      this.turnDirection = 1;
      this.laneChangeTimer = CONFIG.LANE_CHANGE_TIME;
      return true;
    }
    return false;
  }

  moveRight() {
    if (this.currentLane > 0) {
      this.currentLane--;
      this.targetX = CONFIG.LANES[this.currentLane];
      this.turnDirection = -1;
      this.laneChangeTimer = CONFIG.LANE_CHANGE_TIME;
      return true;
    }
    return false;
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
    // 1. Power-Up Timers
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

    // 7. Update 3D Character Rig & Bujji Companion Animations
    const speedRatio = currentSpeed / CONFIG.INITIAL_SPEED;
    this.bhairava.updateAnimation(this.state, time, speedRatio, this.hasJetpack);
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
