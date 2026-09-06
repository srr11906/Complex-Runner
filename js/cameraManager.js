/**
 * PRABHAS: KASI 2898 AD (3D Runner - AAA Level 100)
 * Smooth 3D Third-Person Follow Camera (Direct Tracking, Responsive Portrait FOV & Ground Clamp)
 * OPTIMIZATION: Zero Allocation in update loop
 */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { CONFIG } from "./config.js";

export class CameraManager3D {
  constructor(camera) {
    this.camera = camera;
    this.baseFov = 65;
    this.shakeIntensity = 0;
    this.offset = new THREE.Vector3(0, 3.2, -6.2);
    this.lookOffset = new THREE.Vector3(0, 1.2, 16.0);
    this.lookTarget = new THREE.Vector3();
  }

  shake(intensity = 0.5) {
    this.shakeIntensity = intensity;
  }

  update(dt, playerPosition, currentSpeed) {
    // 1. Direct Horizontal & Vertical Tracking (Keeps player centered on track)
    const targetX = playerPosition.x;
    const targetY = Math.max(2.5, playerPosition.y + this.offset.y); // Clamped strictly above road
    const targetZ = playerPosition.z + this.offset.z;

    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetX, 14 * dt);
    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetY, 10 * dt);
    this.camera.position.z = targetZ;

    // 2. Camera Shake Decay
    if (this.shakeIntensity > 0) {
      this.camera.position.x += (Math.random() - 0.5) * this.shakeIntensity;
      this.camera.position.y += (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeIntensity = Math.max(0, this.shakeIntensity - dt * 2.5);
    }

    // 3. Dynamic Look-At Target (Zero-allocation)
    this.lookTarget.set(
      this.camera.position.x,
      playerPosition.y + this.lookOffset.y,
      playerPosition.z + this.lookOffset.z
    );
    this.camera.lookAt(this.lookTarget);

    // 4. Responsive Portrait / Landscape FOV + Speed Dilation
    const aspect = this.camera.aspect || 1.0;
    const responsiveBaseFov = aspect < 1.0 ? THREE.MathUtils.clamp(65 / aspect * 0.74, 65, 80) : 65;

    const speedRatio = (currentSpeed - CONFIG.INITIAL_SPEED) / (CONFIG.MAX_SPEED - CONFIG.INITIAL_SPEED);
    const targetFov = responsiveBaseFov + speedRatio * 10;
    if (Math.abs(this.camera.fov - targetFov) > 0.02) {
      this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, 5 * dt);
      this.camera.updateProjectionMatrix();
    }
  }
}
