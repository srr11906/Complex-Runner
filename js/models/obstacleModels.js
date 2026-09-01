/**
 * PRABHAS: KASI 2898 AD (3D Runner - AAA Next-Gen)
 * Dystopian Floating Magnetic Repulsor Cargo Trains with High-Intensity Blue Booster Glow & Front Radiator Grills
 * True Movie Silhouette matching 'Vehicle and world(Ignore people).jpeg'
 */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { CONFIG } from "../config.js";
import { textureGen } from "../world/textureGenerator.js";

export class ObstacleFactory3D {
  constructor() {
    this.materials = {
      trainArmor: new THREE.MeshStandardMaterial({
        map: textureGen.getTrainArmorTexture(),
        roughness: 0.55,
        metalness: 0.75
      }),
      trainTrim: new THREE.MeshStandardMaterial({
        color: 0xD97706,
        roughness: 0.35,
        metalness: 0.8
      }),
      grillMat: new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.8,
        metalness: 0.9
      }),
      repulsorPlasma: new THREE.MeshBasicMaterial({
        color: 0x00E5FF,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
      }),
      repulsorHalo: new THREE.MeshBasicMaterial({
        color: 0x00E5FF,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide
      }),
      headlightGlow: new THREE.MeshBasicMaterial({
        color: 0xFFFDF0
      }),
      roofGrating: new THREE.MeshStandardMaterial({
        color: 0x1E293B,
        roughness: 0.7,
        metalness: 0.5
      }),
      rampSurface: new THREE.MeshStandardMaterial({
        map: textureGen.getTrainArmorTexture(),
        roughness: 0.6,
        metalness: 0.65,
        side: THREE.DoubleSide
      }),
      plasmaBeam: new THREE.MeshBasicMaterial({
        color: 0x00E5FF,
        transparent: true,
        opacity: 0.88
      }),
      carbonFrame: new THREE.MeshStandardMaterial({
        color: 0x0F172A,
        roughness: 0.35,
        metalness: 0.95
      })
    };
  }

  /**
   * 1. Dystopian Floating Magnetic Repulsor Cargo Train (3.4m High, Floats 0.75m on Glowing Boosters)
   * With Front Radiator Grille, Dual Headlights & Downward Blue Plasma Repulsor Flames
   */
  createMaglevTrain(hasRamp = false, isMoving = false, length = 22.0) {
    const group = new THREE.Group();
    group.userData.type = "train";
    group.userData.hasRamp = hasRamp;
    group.userData.isMoving = isMoving;
    group.userData.moveSpeed = isMoving ? 11.9 : 0;

    const width = 2.6;
    const bodyHeight = 3.4;
    const floatElevation = 0.75;
    const totalTopY = floatElevation + bodyHeight; // 4.15m

    // Main Train Carriage Body with PBR Weathered Armor Plates
    const bodyGeo = new THREE.BoxGeometry(width, bodyHeight, length);
    const body = new THREE.Mesh(bodyGeo, this.materials.trainArmor);
    body.position.y = floatElevation + bodyHeight / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Front Aerodynamic Slanted Nose Cabin
    const noseLength = 3.5;
    const noseGeo = new THREE.CylinderGeometry(width / 2, width / 2, noseLength, 16);
    const nose = new THREE.Mesh(noseGeo, this.materials.trainArmor);
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, floatElevation + bodyHeight / 2, length / 2 + 0.2);
    group.add(nose);

    // Front Heavy Industrial Radiator Grill (Matching Movie Reference)
    const grill = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.8, 0.4),
      this.materials.grillMat
    );
    grill.position.set(0, floatElevation + 1.2, length / 2 + 1.8);
    group.add(grill);

    // Horizontal grill slats
    for (let gy = -0.7; gy <= 0.7; gy += 0.35) {
      const slat = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.08, 0.45),
        this.materials.trainTrim
      );
      slat.position.set(0, floatElevation + 1.2 + gy, length / 2 + 1.8);
      group.add(slat);
    }

    // Glowing Dual Front High-Beam Headlights
    for (let x of [-0.85, 0.85]) {
      const headlight = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 16, 16),
        this.materials.headlightGlow
      );
      headlight.position.set(x, floatElevation + bodyHeight * 0.7, length / 2 + 1.85);
      group.add(headlight);
    }

    // =========================================================================
    // INTENSE BLUE MAGNETIC REPULSOR THRUSTERS & GROUND GLOW
    // =========================================================================
    const numRepulsors = 4;
    for (let i = 0; i < numRepulsors; i++) {
      const zOffset = -length / 2 + 2.8 + i * ((length - 5.6) / (numRepulsors - 1));
      for (let x of [-0.95, 0.95]) {
        // 1. Titanium Thruster Housing Pod
        const pod = new THREE.Mesh(
          new THREE.CylinderGeometry(0.38, 0.44, 0.28, 16),
          this.materials.carbonFrame
        );
        pod.position.set(x, floatElevation + 0.05, zOffset);
        group.add(pod);

        // 2. Glowing Blue Plasma Core Ring
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.35, 0.04, 8, 16),
          this.materials.repulsorPlasma
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.set(x, floatElevation - 0.08, zOffset);
        group.add(ring);

        // 3. Downward High-Velocity Plasma Flame Cone
        const flame = new THREE.Mesh(
          new THREE.ConeGeometry(0.28, 0.55, 16),
          this.materials.repulsorPlasma
        );
        flame.rotation.x = Math.PI; // Pointing downward to ground
        flame.position.set(x, floatElevation - 0.35, zOffset);
        group.add(flame);

        // 4. Ground Repulsor Light Halo
        const halo = new THREE.Mesh(
          new THREE.RingGeometry(0.15, 0.55, 16),
          this.materials.repulsorHalo
        );
        halo.rotation.x = -Math.PI / 2;
        halo.position.set(x, 0.04, zOffset);
        group.add(halo);
      }
    }

    // Real-Time Underside Blue Point Light
    const trainLight = new THREE.PointLight(0x00E5FF, 2.8, 12);
    trainLight.position.set(0, floatElevation, 0);
    group.add(trainLight);

    // Rooftop Safety Walking Grate
    const roofGrate = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.08, length - 2),
      this.materials.roofGrating
    );
    roofGrate.position.set(0, totalTopY + 0.04, 0);
    group.add(roofGrate);

    // =========================================================================
    // SOLID TRIANGULAR CLIMBING WEDGE RAMP
    // =========================================================================
    if (hasRamp) {
      const rampLength = 9.0;
      const rampZOffset = -length / 2 - rampLength / 2;

      const wHalf = width / 2;
      const z0 = -rampLength / 2;
      const z1 = rampLength / 2;
      const y0 = 0.0;
      const y1 = totalTopY;

      const rampPositions = new Float32Array([
        -wHalf, y0, z0,
         wHalf, y0, z0,
         wHalf, y1, z1,
        -wHalf, y0, z0,
         wHalf, y1, z1,
        -wHalf, y1, z1,
        -wHalf, y0, z0,
        -wHalf, y1, z1,
        -wHalf, y0, z1,
         wHalf, y0, z0,
         wHalf, y0, z1,
         wHalf, y1, z1,
        -wHalf, y0, z1,
         wHalf, y0, z1,
         wHalf, y1, z1,
        -wHalf, y0, z1,
         wHalf, y1, z1,
        -wHalf, y1, z1
      ]);

      const rampNormals = new Float32Array([
        0, 0.88, -0.47,  0, 0.88, -0.47,  0, 0.88, -0.47,
        0, 0.88, -0.47,  0, 0.88, -0.47,  0, 0.88, -0.47,
       -1, 0, 0,        -1, 0, 0,        -1, 0, 0,
        1, 0, 0,         1, 0, 0,         1, 0, 0,
        0, 0, 1,         0, 0, 1,         0, 0, 1,
        0, 0, 1,         0, 0, 1,         0, 0, 1
      ]);

      const rampGeo = new THREE.BufferGeometry();
      rampGeo.setAttribute("position", new THREE.BufferAttribute(rampPositions, 3));
      rampGeo.setAttribute("normal", new THREE.BufferAttribute(rampNormals, 3));

      const solidRampMesh = new THREE.Mesh(rampGeo, this.materials.rampSurface);
      solidRampMesh.position.set(0, 0, rampZOffset);
      solidRampMesh.castShadow = true;
      solidRampMesh.receiveShadow = true;
      group.add(solidRampMesh);

      // Hazard Yellow Warning Stripe on Ramp Edges
      for (let s of [-1, 1]) {
        const stripe = new THREE.Mesh(
          new THREE.BoxGeometry(0.18, 0.1, rampLength),
          this.materials.trainTrim
        );
        stripe.position.set(s * (width / 2 - 0.09), y1 / 2, rampZOffset);
        stripe.rotation.x = -Math.atan2(y1, rampLength);
        group.add(stripe);
      }

      group.userData.hasRamp = true;
    }

    return group;
  }

  /**
   * 2. High-Tech Plasma Laser Security Barrier (Requires Slide Under)
   */
  createPlasmaGate() {
    const group = new THREE.Group();
    group.userData.type = "laser_gate";
    group.userData.requiresSlide = true;

    const width = 3.2;
    const height = 3.6;

    for (let side of [-1, 1]) {
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.22, height, 16),
        this.materials.carbonFrame
      );
      pillar.position.set(side * (width / 2), height / 2, 0);
      pillar.castShadow = true;
      group.add(pillar);

      const lightNode = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 16, 16),
        this.materials.repulsorPlasma
      );
      lightNode.position.set(side * (width / 2), height - 0.2, 0);
      group.add(lightNode);
    }

    const crossBeam = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.4, 0.25, 0.25),
      this.materials.carbonFrame
    );
    crossBeam.position.set(0, height - 0.1, 0);
    group.add(crossBeam);

    // Glowing Cyan Plasma Laser Beams
    for (let beamY of [1.6, 2.2, 2.8]) {
      const laser = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, width, 12),
        this.materials.plasmaBeam
      );
      laser.rotation.z = Math.PI / 2;
      laser.position.set(0, beamY, 0);
      group.add(laser);
    }

    return group;
  }

  /**
   * 3. Low Scavenger Barricade Hurdle (Requires Jump Over)
   */
  createLowHurdle() {
    const group = new THREE.Group();
    group.userData.type = "hurdle";
    group.userData.requiresJump = true;

    const width = 2.4;
    const height = 0.95;

    const barricade = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, 0.4),
      this.materials.trainArmor
    );
    barricade.position.y = height / 2;
    barricade.castShadow = true;
    barricade.receiveShadow = true;
    group.add(barricade);

    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.16, 0.42),
      this.materials.trainTrim
    );
    stripe.position.y = height * 0.7;
    group.add(stripe);

    return group;
  }
}
