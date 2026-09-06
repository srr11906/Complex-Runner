/**
 * PRABHAS: KASI 2898 AD (3D Runner - AAA Next-Gen)
 * High-Resolution 3D Collectible & Power-Up Models with Floating Iridescent Energy Bubbles
 * OPTIMIZATION: Shared Geometries & Textures for Zero Allocation Spikes
 */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { CONFIG } from "../config.js";

export class CollectibleFactory3D {
  constructor() {
    this.materials = {
      goldMedallion: new THREE.MeshStandardMaterial({
        color: 0xFDE047,
        roughness: 0.2,
        metalness: 0.95,
        emissive: 0xF59E0B,
        emissiveIntensity: 0.4
      }),
      emblemCore: new THREE.MeshBasicMaterial({
        color: 0x00E5FF
      }),
      magnetRed: new THREE.MeshStandardMaterial({
        color: 0xEF4444,
        roughness: 0.25,
        metalness: 0.85
      }),
      magnetSilver: new THREE.MeshStandardMaterial({
        color: 0xE2E8F0,
        roughness: 0.2,
        metalness: 0.95
      }),
      jetpackBody: new THREE.MeshStandardMaterial({
        color: 0x1E293B,
        roughness: 0.25,
        metalness: 0.95
      }),
      jetpackFlame: new THREE.MeshBasicMaterial({
        color: 0xF59E0B
      }),
      shieldCyan: new THREE.MeshStandardMaterial({
        color: 0x00E5FF,
        roughness: 0.15,
        metalness: 0.9,
        emissive: 0x00E5FF,
        emissiveIntensity: 1.2
      }),
      multiplierGold: new THREE.MeshStandardMaterial({
        color: 0xF59E0B,
        roughness: 0.15,
        metalness: 0.95,
        emissive: 0xFDE047,
        emissiveIntensity: 0.8
      })
    };

    // Pre-allocate shared geometries for instant instantiation without GPU buffer churn
    this.geometries = {
      bubbleSphere: new THREE.SphereGeometry(0.72, 16, 12),
      bubbleRing: new THREE.TorusGeometry(0.74, 0.02, 8, 20),
      coinRim: new THREE.CylinderGeometry(0.38, 0.38, 0.07, 18),
      coinInnerTorus: new THREE.TorusGeometry(0.28, 0.025, 6, 18),
      coinCrest: new THREE.ConeGeometry(0.16, 0.22, 4),
      magnetArch: new THREE.TorusGeometry(0.32, 0.085, 8, 16, Math.PI),
      magnetTip: new THREE.BoxGeometry(0.17, 0.16, 0.17),
      magnetSpark: new THREE.SphereGeometry(0.06, 6, 6),
      jetpackRocket: new THREE.CylinderGeometry(0.11, 0.11, 0.55, 12),
      jetpackNozzle: new THREE.ConeGeometry(0.14, 0.18, 12),
      jetpackHarness: new THREE.BoxGeometry(0.26, 0.28, 0.12),
      shieldHex: new THREE.CylinderGeometry(0.38, 0.38, 0.08, 6),
      shieldStar: new THREE.OctahedronGeometry(0.18, 0),
      multiplierCrest: new THREE.CylinderGeometry(0.38, 0.38, 0.08, 8),
      multiplierLabel: new THREE.PlaneGeometry(0.55, 0.55)
    };

    // Pre-create 2X multiplier texture
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(0, 0, 0, 0)";
    ctx.fillRect(0, 0, 128, 128);
    ctx.font = "900 64px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#FFFFFF";
    ctx.shadowColor = "#F59E0B";
    ctx.shadowBlur = 8;
    ctx.fillText("2X", 64, 64);
    this.multiplierTexture = new THREE.CanvasTexture(canvas);
    this.multiplierMaterial = new THREE.MeshBasicMaterial({ map: this.multiplierTexture, transparent: true, side: THREE.DoubleSide });
  }

  createEnergyBubble(colorHex = 0x00E5FF) {
    const bubbleGroup = new THREE.Group();

    const bubbleMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.32,
      side: THREE.DoubleSide
    });
    const bubble = new THREE.Mesh(this.geometries.bubbleSphere, bubbleMat);
    bubbleGroup.add(bubble);

    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(this.geometries.bubbleRing, ringMat);
    ring.rotation.x = Math.PI / 4;
    bubbleGroup.add(ring);

    return bubbleGroup;
  }

  createCoin() {
    const group = new THREE.Group();
    group.userData.type = "coin";
    group.userData.points = CONFIG.UNITS_PER_COIN;

    const rim = new THREE.Mesh(this.geometries.coinRim, this.materials.goldMedallion);
    rim.rotation.x = Math.PI / 2;
    rim.castShadow = true;
    group.add(rim);

    const innerTorus = new THREE.Mesh(this.geometries.coinInnerTorus, this.materials.goldMedallion);
    innerTorus.position.z = 0.04;
    group.add(innerTorus);

    const crest = new THREE.Mesh(this.geometries.coinCrest, this.materials.emblemCore);
    crest.rotation.x = Math.PI;
    crest.position.z = 0.04;
    group.add(crest);

    group.userData.radius = 0.55;
    return group;
  }

  createMagnet() {
    const group = new THREE.Group();
    group.userData.type = "powerup";
    group.userData.powerupType = "magnet";
    group.userData.duration = CONFIG.MAGNET_DURATION;

    group.add(this.createEnergyBubble(0x00E5FF));

    const arch = new THREE.Mesh(this.geometries.magnetArch, this.materials.magnetRed);
    arch.rotation.z = Math.PI;
    group.add(arch);

    for (let x of [-0.32, 0.32]) {
      const tip = new THREE.Mesh(this.geometries.magnetTip, this.materials.magnetSilver);
      tip.position.set(x, -0.1, 0);
      group.add(tip);

      const spark = new THREE.Mesh(this.geometries.magnetSpark, this.materials.emblemCore);
      spark.position.set(x, -0.2, 0);
      group.add(spark);
    }

    group.userData.radius = 0.85;
    return group;
  }

  createJetpack() {
    const group = new THREE.Group();
    group.userData.type = "powerup";
    group.userData.powerupType = "jetpack";
    group.userData.duration = CONFIG.JETPACK_DURATION;

    group.add(this.createEnergyBubble(0xF59E0B));

    for (let x of [-0.2, 0.2]) {
      const rocket = new THREE.Mesh(this.geometries.jetpackRocket, this.materials.jetpackBody);
      rocket.position.x = x;
      group.add(rocket);

      const nozzle = new THREE.Mesh(this.geometries.jetpackNozzle, this.materials.jetpackFlame);
      nozzle.rotation.x = Math.PI;
      nozzle.position.set(x, -0.36, 0);
      group.add(nozzle);
    }

    const harness = new THREE.Mesh(this.geometries.jetpackHarness, this.materials.magnetSilver);
    group.add(harness);

    group.userData.radius = 0.85;
    return group;
  }

  createShield() {
    const group = new THREE.Group();
    group.userData.type = "powerup";
    group.userData.powerupType = "shield";

    group.add(this.createEnergyBubble(0x38BDF8));

    const shieldMesh = new THREE.Mesh(this.geometries.shieldHex, this.materials.shieldCyan);
    shieldMesh.rotation.x = Math.PI / 2;
    group.add(shieldMesh);

    const star = new THREE.Mesh(this.geometries.shieldStar, this.materials.magnetSilver);
    star.position.z = 0.05;
    group.add(star);

    group.userData.radius = 0.85;
    return group;
  }

  createMultiplier() {
    const group = new THREE.Group();
    group.userData.type = "powerup";
    group.userData.powerupType = "multiplier";
    group.userData.duration = CONFIG.DOUBLE_POINTS_DURATION;

    group.add(this.createEnergyBubble(0xEC4899));

    const crest = new THREE.Mesh(this.geometries.multiplierCrest, this.materials.multiplierGold);
    crest.rotation.x = Math.PI / 2;
    group.add(crest);

    const label = new THREE.Mesh(this.geometries.multiplierLabel, this.multiplierMaterial);
    label.position.z = 0.05;
    group.add(label);

    group.userData.radius = 0.85;
    return group;
  }
}
