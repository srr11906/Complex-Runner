/**
 * PRABHAS: WASTELAND 2898 AD (3D Runner - AAA Level 100)
 * Smooth 3D Third-Person Follow Camera (Direct Tracking, Responsive Portrait FOV & Ground Clamp)
 * OPTIMIZATION: Zero Allocation in update loop
 */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { CONFIG } from "./config.js?v=20261012_audio_atomic_v70";

export class CameraManager3D {
  constructor(camera) {
    this.camera = camera;
    this.baseFov = 65;
    this.shakeIntensity = 0;
    this.baseOffset = new THREE.Vector3(0, 3.2, -6.2);
    this.currentOffset = new THREE.Vector3(0, 3.2, -6.2);
    this.lookOffset = new THREE.Vector3(0, 1.25, 18.0);
    this.lookTarget = new THREE.Vector3();
    this.targetRoll = 0;
    this.currentRoll = 0;
    this.currentLookY = 1.25;
  }

  shake(intensity = 0.5) {
    this.shakeIntensity = intensity;
  }

  update(dt, playerPosition, currentSpeed, isSliding = false, isLaneSwitching = false, turnDirection = 0) {
    // 1. Dynamic Spring Arm Distance & Elevation Scaling based on Player Altitude & Slide State
    const isJetpack = playerPosition.y >= 6.0;
    const isElevated = playerPosition.y >= 2.0;

    let targetOffsetY = this.baseOffset.y;
    let targetOffsetZ = this.baseOffset.z;

    if (isJetpack) {
      // Cinematic Wide Pull-Back for Jetpack Flight
      targetOffsetY = 4.2;
      targetOffsetZ = -8.4;
    } else if (isElevated) {
      // Train Rooftop Altitude Compensation (Smooth vista over train cars)
      targetOffsetY = 3.4 + (playerPosition.y - 2.0) * 0.35;
      targetOffsetZ = -6.4 - (playerPosition.y - 2.0) * 0.30;
    } else if (isSliding) {
      // Subway Surfers Signature Slide Camera Dip (Visceral ducking under hurdles)
      targetOffsetY = 2.38;
      targetOffsetZ = -5.9;
    }

    this.currentOffset.y = THREE.MathUtils.lerp(this.currentOffset.y, targetOffsetY, (isSliding ? 14.0 : 6.0) * dt);
    this.currentOffset.z = THREE.MathUtils.lerp(this.currentOffset.z, targetOffsetZ, 6.0 * dt);

    // 2. Critically Damped Spring Follow Tracking
    const targetX = playerPosition.x;
    const targetY = Math.max(1.8, playerPosition.y + this.currentOffset.y);
    const targetZ = playerPosition.z + this.currentOffset.z;

    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetX, 15.0 * dt);
    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetY, (isSliding ? 16.0 : 11.0) * dt);
    this.camera.position.z = targetZ;

    // 3. Camera Shake Decay with Frequency Flutter
    if (this.shakeIntensity > 0) {
      this.camera.position.x += (Math.random() - 0.5) * this.shakeIntensity;
      this.camera.position.y += (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeIntensity = Math.max(0, this.shakeIntensity - dt * 2.8);
    }

    // 4. Look-At Target with Altitude Horizon Pitch & Slide Dip Compensation
    const horizonCompY = isElevated ? 0.8 : (playerPosition.y * 0.4);
    const slideLookDip = isSliding ? 0.32 : 0.0;
    const targetLookY = playerPosition.y + this.lookOffset.y - horizonCompY - slideLookDip;
    this.currentLookY = THREE.MathUtils.lerp(this.currentLookY, targetLookY, (isSliding ? 16.0 : 11.0) * dt);

    this.lookTarget.set(
      this.camera.position.x * 0.85,
      this.currentLookY,
      playerPosition.z + this.lookOffset.z
    );
    this.camera.lookAt(this.lookTarget);

    // 5. Dynamic Banking Roll on Lane Switch and Air/Ground Combos
    if (isLaneSwitching && turnDirection !== 0) {
      this.targetRoll = -turnDirection * (isSliding ? 0.055 : 0.036);
    } else {
      this.targetRoll = 0;
    }
    this.currentRoll = THREE.MathUtils.lerp(this.currentRoll, this.targetRoll, 10.0 * dt);
    this.camera.rotation.z += this.currentRoll;

    // 6. Responsive Portrait / Landscape FOV + Dynamic High-Speed Tunnel Dilation + Slide Boost
    const aspect = this.camera.aspect || 1.0;
    const responsiveBaseFov = aspect < 1.0 ? THREE.MathUtils.clamp((65 / aspect) * 0.74, 65, 80) : 65;

    const speedRatio = Math.max(0, Math.min(1, (currentSpeed - CONFIG.INITIAL_SPEED) / ((CONFIG.MAX_SPEED || 42.0) - CONFIG.INITIAL_SPEED)));
    const slideFovBoost = isSliding ? 3.5 : 0.0;
    const targetFov = responsiveBaseFov + speedRatio * 9.5 + slideFovBoost;
    if (Math.abs(this.camera.fov - targetFov) > 0.02) {
      this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, (isSliding ? 12.0 : 5.0) * dt);
      this.camera.updateProjectionMatrix();
    }
  }
}
