/**
 * PRABHAS: KASI 2898 AD (3D Runner - AAA Next-Gen)
 * High-Resolution 3D Collectible & Power-Up Models with Floating Iridescent Energy Bubbles
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
  }

  /**
   * Universal Iridescent Floating Energy Bubble with Outer Glow Ring
   */
  createEnergyBubble(colorHex = 0x00E5FF) {
    const bubbleGroup = new THREE.Group();

    // 1. Translucent Iridescent Bubble Sphere
    const bubbleMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.32,
      side: THREE.DoubleSide
    });
    const bubble = new THREE.Mesh(new THREE.SphereGeometry(0.72, 24, 24), bubbleMat);
    bubbleGroup.add(bubble);

    // 2. Glowing Outer Fresnel Orbit Ring
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.74, 0.02, 12, 32), ringMat);
    ring.rotation.x = Math.PI / 4;
    bubbleGroup.add(ring);

    return bubbleGroup;
  }

  /**
   * 1. High-Poly 10,000 Units Complex Bounty Medallion (Sculpted Gold Coin)
   */
  createCoin() {
    const group = new THREE.Group();
    group.userData.type = "coin";
    group.userData.points = CONFIG.UNITS_PER_COIN; // 10,000 Units per token

    // Sculpted Outer Beveled Medallion Rim
    const rimGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.07, 24);
    const rim = new THREE.Mesh(rimGeo, this.materials.goldMedallion);
    rim.rotation.x = Math.PI / 2;
    rim.castShadow = true;
    group.add(rim);

    // Embossed Inner Ring
    const innerTorus = new THREE.Mesh(
      new THREE.TorusGeometry(0.28, 0.025, 8, 24),
      this.materials.goldMedallion
    );
    innerTorus.position.z = 0.04;
    group.add(innerTorus);

    // Glowing Complex Inverted Pyramid Crest at the Center
    const crestGeo = new THREE.ConeGeometry(0.16, 0.22, 4);
    const crest = new THREE.Mesh(crestGeo, this.materials.emblemCore);
    crest.rotation.x = Math.PI;
    crest.position.z = 0.04;
    group.add(crest);

    group.userData.radius = 0.55;
    return group;
  }

  /**
   * 2. Iconic Red & Silver Horseshoe Magnet (with Energy Bubble)
   */
  createMagnet() {
    const group = new THREE.Group();
    group.userData.type = "powerup";
    group.userData.powerupType = "magnet";
    group.userData.duration = CONFIG.MAGNET_DURATION;

    // Glowing Cyan Energy Bubble
    group.add(this.createEnergyBubble(0x00E5FF));

    // Red Curved Horseshoe Arch
    const arch = new THREE.Mesh(
      new THREE.TorusGeometry(0.32, 0.085, 12, 24, Math.PI),
      this.materials.magnetRed
    );
    arch.rotation.z = Math.PI;
    group.add(arch);

    // Dual Silver Magnetic Poles
    for (let x of [-0.32, 0.32]) {
      const tip = new THREE.Mesh(
        new THREE.BoxGeometry(0.17, 0.16, 0.17),
        this.materials.magnetSilver
      );
      tip.position.set(x, -0.1, 0);
      group.add(tip);

      // Glowing Magnetic Spark
      const spark = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 8, 8),
        this.materials.emblemCore
      );
      spark.position.set(x, -0.2, 0);
      group.add(spark);
    }

    group.userData.radius = 0.85;
    return group;
  }

  /**
   * 3. High-Tech Rocket Jetpack (with Energy Bubble)
   */
  createJetpack() {
    const group = new THREE.Group();
    group.userData.type = "powerup";
    group.userData.powerupType = "jetpack";
    group.userData.duration = CONFIG.JETPACK_DURATION;

    // Glowing Orange/Amber Energy Bubble
    group.add(this.createEnergyBubble(0xF59E0B));

    // Dual Rocket Thrusters
    for (let x of [-0.2, 0.2]) {
      const rocket = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.11, 0.55, 16),
        this.materials.jetpackBody
      );
      rocket.position.x = x;
      group.add(rocket);

      // Exhaust Nozzle & Flame
      const nozzle = new THREE.Mesh(
        new THREE.ConeGeometry(0.14, 0.18, 16),
        this.materials.jetpackFlame
      );
      nozzle.rotation.x = Math.PI;
      nozzle.position.set(x, -0.36, 0);
      group.add(nozzle);
    }

    // Central Stabilizer Harness
    const harness = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.28, 0.12),
      this.materials.magnetSilver
    );
    group.add(harness);

    group.userData.radius = 0.85;
    return group;
  }

  /**
   * 4. Glowing Hexagonal Hologram Shield (with Energy Bubble)
   */
  createShield() {
    const group = new THREE.Group();
    group.userData.type = "powerup";
    group.userData.powerupType = "shield";

    // Glowing Blue Energy Bubble
    group.add(this.createEnergyBubble(0x38BDF8));

    // Sculpted Hexagonal Shield Crest
    const shieldGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.08, 6);
    const shieldMesh = new THREE.Mesh(shieldGeo, this.materials.shieldCyan);
    shieldMesh.rotation.x = Math.PI / 2;
    group.add(shieldMesh);

    // Inner White Star / Crest
    const star = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.18, 0),
      this.materials.magnetSilver
    );
    star.position.z = 0.05;
    group.add(star);

    group.userData.radius = 0.85;
    return group;
  }

  /**
   * 5. Glowing 2X Multiplier Badge (with Energy Bubble)
   */
  createMultiplier() {
    const group = new THREE.Group();
    group.userData.type = "powerup";
    group.userData.powerupType = "multiplier";
    group.userData.duration = CONFIG.DOUBLE_POINTS_DURATION;

    // Glowing Magenta/Gold Energy Bubble
    group.add(this.createEnergyBubble(0xEC4899));

    // 2X Gold Octagonal Crest
    const crest = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.38, 0.08, 8),
      this.materials.multiplierGold
    );
    crest.rotation.x = Math.PI / 2;
    group.add(crest);

    // Canvas Texture for crisp "2X" symbol
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(0, 0, 0, 0)";
    ctx.fillRect(0, 0, 256, 256);
    ctx.font = "900 130px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#FFFFFF";
    ctx.shadowColor = "#F59E0B";
    ctx.shadowBlur = 16;
    ctx.fillText("2X", 128, 128);

    const tex = new THREE.CanvasTexture(canvas);
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(0.55, 0.55),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide })
    );
    label.position.z = 0.05;
    group.add(label);

    group.userData.radius = 0.85;
    return group;
  }
}
