/**
 * PRABHAS: KASI 2898 AD (3D Runner - AAA Level 100)
 * High-Poly Aerodynamic 3D Bujji AI Companion Drone Model (Elevated Height Y=1.95m, 45° Inward Angle)
 */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { CONFIG } from "../config.js";

export class BujjiModel {
  constructor() {
    this.root = new THREE.Group();
    this.eyeMesh = null;
    this.irisRings = [];
    this.thrusterFlames = [];

    // Elevated position high above shoulder (Y = 1.95m) on the requested opposite shoulder (X = +0.48m)
    this.baseLocalX = 0.48;
    this.baseLocalY = 1.95;
    this.baseLocalZ = 0.05;
    this.baseRotY = Math.PI / 4; // 45° inward angle facing towards character gaze

    this.root.position.set(this.baseLocalX, this.baseLocalY, this.baseLocalZ);
    this.root.rotation.y = this.baseRotY;

    this.buildModel();
  }

  buildModel() {
    // 1. High-Fidelity PBR Materials
    const yellowNanoMat = new THREE.MeshStandardMaterial({
      color: CONFIG.COLORS.BUJJI_YELLOW,
      roughness: 0.28,
      metalness: 0.75
    });

    const darkCarbonMat = new THREE.MeshStandardMaterial({
      color: CONFIG.COLORS.DARK_CARBON,
      roughness: 0.45,
      metalness: 0.85
    });

    const canopyGlassMat = new THREE.MeshStandardMaterial({
      color: 0x0F172A,
      roughness: 0.1,
      metalness: 0.95,
      transparent: true,
      opacity: 0.85
    });

    const cyanEyeMat = new THREE.MeshStandardMaterial({
      color: 0x00E5FF,
      emissive: 0x00E5FF,
      emissiveIntensity: 2.2,
      roughness: 0.1
    });

    const thrusterGlowMat = new THREE.MeshBasicMaterial({
      color: 0x00D2D9,
      transparent: true,
      opacity: 0.85
    });

    // 2. Smooth Aerodynamic Teardrop / Capsule Body
    const bodyGeo = new THREE.CapsuleGeometry(0.20, 0.32, 12, 24);
    const body = new THREE.Mesh(bodyGeo, yellowNanoMat);
    body.rotation.x = Math.PI / 2;
    body.castShadow = true;
    this.root.add(body);

    // Dark Carbon Lower Undercarriage Skirt
    const undercarriage = new THREE.Mesh(
      new THREE.CylinderGeometry(0.19, 0.17, 0.38, 20),
      darkCarbonMat
    );
    undercarriage.rotation.x = Math.PI / 2;
    undercarriage.position.y = -0.05;
    this.root.add(undercarriage);

    // Tinted Cockpit Dome on Top
    const canopyGeo = new THREE.SphereGeometry(0.14, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const canopy = new THREE.Mesh(canopyGeo, canopyGlassMat);
    canopy.position.set(0, 0.10, 0.03);
    canopy.scale.set(1.1, 0.9, 1.4);
    this.root.add(canopy);

    // 3. Swept Aerodynamic Side Winglets & Dual Spherical Thruster Nacelles
    for (let side of [-1, 1]) {
      const wingGeo = new THREE.BoxGeometry(0.12, 0.035, 0.34);
      const wing = new THREE.Mesh(wingGeo, darkCarbonMat);
      wing.position.set(side * 0.24, 0.02, -0.04);
      wing.rotation.z = side * 0.2;
      wing.castShadow = true;
      this.root.add(wing);

      const nacelle = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 16, 16),
        darkCarbonMat
      );
      nacelle.position.set(side * 0.28, -0.02, -0.16);
      this.root.add(nacelle);

      const nozzle = new THREE.Mesh(
        new THREE.TorusGeometry(0.048, 0.015, 10, 20),
        yellowNanoMat
      );
      nozzle.position.set(side * 0.28, -0.02, -0.22);
      this.root.add(nozzle);

      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.045, 0.18, 12),
        thrusterGlowMat
      );
      flame.rotation.x = -Math.PI / 2;
      flame.position.set(side * 0.28, -0.02, -0.32);
      this.root.add(flame);
      this.thrusterFlames.push(flame);
    }

    // 4. Signature Holographic Cyan Optic Eye
    const eyeHousing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.11, 0.045, 24),
      darkCarbonMat
    );
    eyeHousing.rotation.x = Math.PI / 2;
    eyeHousing.position.set(0, 0.03, 0.23);
    this.root.add(eyeHousing);

    this.eyeMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 20, 20),
      cyanEyeMat
    );
    this.eyeMesh.position.set(0, 0.03, 0.25);
    this.root.add(this.eyeMesh);

    const iris = new THREE.Mesh(
      new THREE.TorusGeometry(0.058, 0.009, 10, 24),
      new THREE.MeshBasicMaterial({ color: 0xFFFFFF })
    );
    iris.position.set(0, 0.03, 0.27);
    this.root.add(iris);
    this.irisRings.push(iris);

    // Compact companion scale
    this.root.scale.set(0.38, 0.38, 0.38);

    // Aid / Healing State
    this.isAiding = false;
    this.aidLerp = 0.0;
  }

  setAid(isAiding) {
    this.isAiding = isAiding;
  }

  update(time, isTurning = 0) {
    // Smooth transition between default shoulder hover and active healing overflight
    const targetAidLerp = this.isAiding ? 1.0 : 0.0;
    this.aidLerp += (targetAidLerp - this.aidLerp) * 0.15;

    const normalHoverX = this.baseLocalX + Math.cos(time * 3.5) * 0.015;
    const normalHoverY = this.baseLocalY + Math.sin(time * 5.0) * 0.03;
    const normalHoverZ = this.baseLocalZ;

    const aidHoverX = 0.0 + Math.sin(time * 8.0) * 0.06;
    const aidHoverY = 2.25 + Math.sin(time * 6.0) * 0.05;
    const aidHoverZ = 0.35 + Math.cos(time * 7.0) * 0.04;

    this.root.position.x = THREE.MathUtils.lerp(normalHoverX, aidHoverX, this.aidLerp);
    this.root.position.y = THREE.MathUtils.lerp(normalHoverY, aidHoverY, this.aidLerp);
    this.root.position.z = THREE.MathUtils.lerp(normalHoverZ, aidHoverZ, this.aidLerp);

    // Rotation: tilt forward/down towards Bhairava when aiding
    const normalRotY = this.baseRotY + isTurning * 0.2;
    const aidRotY = Math.sin(time * 4.0) * 0.15;
    this.root.rotation.y = THREE.MathUtils.lerp(normalRotY, aidRotY, this.aidLerp);

    const normalRotX = 0.05 + Math.sin(time * 5) * 0.02;
    const aidRotX = 0.55 + Math.sin(time * 8) * 0.05; // 30° downward tilt towards character
    this.root.rotation.x = THREE.MathUtils.lerp(normalRotX, aidRotX, this.aidLerp);

    this.root.rotation.z = (isTurning * 0.3) * (1.0 - this.aidLerp);

    // High-energy thruster flames during medical flight
    const baseFlameScale = 0.85 + Math.random() * 0.35;
    const aidFlameMultiplier = 1.0 + this.aidLerp * 0.8;
    this.thrusterFlames.forEach((f) => {
      f.scale.set(aidFlameMultiplier, baseFlameScale * aidFlameMultiplier, aidFlameMultiplier);
    });

    if (this.eyeMesh) {
      const normalGlow = 1.5 + Math.sin(time * 6) * 0.4;
      const aidGlow = 3.8 + Math.sin(time * 14) * 1.5; // Rapid emergency optical pulse
      this.eyeMesh.material.emissiveIntensity = THREE.MathUtils.lerp(normalGlow, aidGlow, this.aidLerp);
    }
  }
}
