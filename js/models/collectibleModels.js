/**
 * COMPLEX RUNNER - Next-Gen 3D Sci-Fi Runner
 * High-Resolution 3D Collectible & Power-Up Models with Floating Iridescent Energy Bubbles
 * Features tactile radial milled notches, raised 3D beveled rims, cybernetic cores & orbital rings
 */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { CONFIG } from "../config.js?v=20260919_triangle_neon_v38";

export class CollectibleFactory3D {
  constructor() {
    this.materials = {
      // 1. Polished Royal Gold Alloy (High Metalness, Rich Warm Specular)
      goldArmor: new THREE.MeshStandardMaterial({
        color: 0xFBBF24,
        metalness: 0.95,
        roughness: 0.16,
        emissive: 0xD97706,
        emissiveIntensity: 0.22
      }),

      // 2. Satin Gold Medallion Inset (Warm metallic luster)
      goldSatin: new THREE.MeshStandardMaterial({
        color: 0xEAB308,
        metalness: 0.94,
        roughness: 0.22,
        emissive: 0xB45309,
        emissiveIntensity: 0.18
      }),

      // 3. Bright Champagne Gold Bezel & Chiseled Highlights
      goldTrim: new THREE.MeshStandardMaterial({
        color: 0xFEF08A,
        metalness: 0.98,
        roughness: 0.10
      }),

      // 4. Ultra-Vibrant Unlit Neon Cyan (Maximum visibility at all distances & angles)
      neonCyan: new THREE.MeshBasicMaterial({
        color: 0x00FFFF
      }),

      // 4b. Hot-White Core Neon
      neonCyanCore: new THREE.MeshBasicMaterial({
        color: 0xE0FFFF
      }),

      // 4c. Alias emblemCore for backwards compatibility with magnet/shield powerups
      emblemCore: new THREE.MeshBasicMaterial({
        color: 0x00FFFF
      }),

      // 5. Ruby Metallic Magnet Body
      magnetRed: new THREE.MeshStandardMaterial({
        color: 0xEF4444,
        metalness: 0.88,
        roughness: 0.22,
        emissive: 0x450A0A,
        emissiveIntensity: 0.25
      }),

      // 6. Polished Platinum Chrome
      chromeSilver: new THREE.MeshStandardMaterial({
        color: 0xF1F5F9,
        metalness: 0.98,
        roughness: 0.12
      }),

      // 7. Copper / Amber Induction Coils
      inductionCopper: new THREE.MeshStandardMaterial({
        color: 0xF59E0B,
        metalness: 0.92,
        roughness: 0.20
      }),

      // 8. Jetpack Titanium Body
      jetpackTitanium: new THREE.MeshStandardMaterial({
        color: 0x475569,
        metalness: 0.90,
        roughness: 0.28,
        emissive: 0x0F172A,
        emissiveIntensity: 0.20
      }),

      // 9. Jetpack Thermal Gold Shroud
      jetpackGold: new THREE.MeshStandardMaterial({
        color: 0xD97706,
        metalness: 0.92,
        roughness: 0.22
      }),

      // 10. Jetpack Energetic Plasma Flame
      jetpackFlame: new THREE.MeshBasicMaterial({
        color: 0xFF6D00
      }),

      // 11. Aegis Shield Luminous Cyan
      shieldCyan: new THREE.MeshStandardMaterial({
        color: 0x00E5FF,
        roughness: 0.12,
        metalness: 0.92,
        emissive: 0x00E5FF,
        emissiveIntensity: 0.75
      }),

      // 12. 2X Multiplier Radiant Gold
      multiplierGold: new THREE.MeshStandardMaterial({
        color: 0xFBBF24,
        roughness: 0.14,
        metalness: 0.96,
        emissive: 0xF59E0B,
        emissiveIntensity: 0.85
      }),

      // 13. Iridescent Translucent Orbital Bubble (Dynamic Sci-Fi Shell)
      bubbleCyan: new THREE.MeshPhongMaterial({
        color: 0x00E5FF,
        transparent: true,
        opacity: 0.22,
        shininess: 90,
        specular: 0xFFFFFF,
        side: THREE.DoubleSide
      }),
      bubbleAmber: new THREE.MeshPhongMaterial({
        color: 0xF59E0B,
        transparent: true,
        opacity: 0.22,
        shininess: 90,
        specular: 0xFFFFFF,
        side: THREE.DoubleSide
      }),
      bubbleRingCyan: new THREE.MeshBasicMaterial({
        color: 0x00E5FF,
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide
      }),
      bubbleRingWhite: new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.80,
        side: THREE.DoubleSide
      })
    };

    // Pre-allocate shared geometries for instant instantiation without GPU buffer churn
    this.geometries = {
      // 3D Realistic Gold Coin with Detailed Inner Circle Solid Neon Triangle
      coinPlate: new THREE.CylinderGeometry(0.35, 0.35, 0.06, 28),
      coinRim: new THREE.TorusGeometry(0.36, 0.045, 8, 28),
      coinMilledNotch: new THREE.BoxGeometry(0.028, 0.076, 0.74),
      coinInnerBezel: new THREE.TorusGeometry(0.24, 0.022, 8, 28),
      coinInnerDisc: new THREE.CylinderGeometry(0.23, 0.23, 0.066, 28),
      coinNeonCircle: new THREE.TorusGeometry(0.18, 0.014, 8, 28),
      coinGoldTriBezel: new THREE.CylinderGeometry(0.155, 0.155, 0.074, 3),
      coinNeonTriSolid: new THREE.CylinderGeometry(0.142, 0.142, 0.082, 3),
      coinNeonTriHighlight: new THREE.CylinderGeometry(0.082, 0.082, 0.088, 3),
      coinTriangleNode: new THREE.SphereGeometry(0.028, 8, 8),
      coinVertexConduit: new THREE.BoxGeometry(0.018, 0.08, 0.045),
      coinCenterDot: new THREE.SphereGeometry(0.05, 8, 8),

      // Orbital Bubbles
      bubbleSphere: new THREE.SphereGeometry(0.72, 18, 14),
      bubbleRingMajor: new THREE.TorusGeometry(0.76, 0.022, 8, 28),
      bubbleRingMinor: new THREE.TorusGeometry(0.76, 0.016, 8, 28),

      // Magnet Geometries
      magnetArch: new THREE.TorusGeometry(0.34, 0.085, 12, 28, Math.PI),
      magnetTip: new THREE.BoxGeometry(0.18, 0.18, 0.18),
      magnetCoil: new THREE.TorusGeometry(0.10, 0.022, 6, 16),
      magnetArc: new THREE.TorusGeometry(0.34, 0.024, 6, 20, Math.PI),
      magnetSpark: new THREE.SphereGeometry(0.06, 8, 8),

      // Jetpack Geometries
      jetpackRocket: new THREE.CylinderGeometry(0.12, 0.12, 0.54, 16),
      jetpackCone: new THREE.ConeGeometry(0.12, 0.18, 16),
      jetpackNozzle: new THREE.ConeGeometry(0.14, 0.18, 14),
      jetpackFlare: new THREE.ConeGeometry(0.10, 0.28, 12),
      jetpackHarness: new THREE.BoxGeometry(0.30, 0.20, 0.12),
      jetpackManifold: new THREE.CylinderGeometry(0.04, 0.04, 0.32, 8),

      // Shield Geometries
      shieldHex: new THREE.CylinderGeometry(0.42, 0.42, 0.08, 6),
      shieldStar: new THREE.OctahedronGeometry(0.22, 0),
      shieldRing: new THREE.TorusGeometry(0.44, 0.032, 8, 24),
      shieldTrace: new THREE.BoxGeometry(0.03, 0.04, 0.80),

      // Multiplier Geometries
      multiplierCrest: new THREE.CylinderGeometry(0.42, 0.42, 0.08, 8),
      multiplierRing: new THREE.TorusGeometry(0.44, 0.034, 8, 24),
      multiplierLabel: new THREE.PlaneGeometry(0.6, 0.6)
    };

    // Pre-create 2X multiplier texture
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(0, 0, 0, 0)";
    ctx.fillRect(0, 0, 128, 128);
    ctx.font = "900 68px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#FFFFFF";
    ctx.shadowColor = "#F59E0B";
    ctx.shadowBlur = 12;
    ctx.fillText("2X", 64, 64);
    this.multiplierTexture = new THREE.CanvasTexture(canvas);
    this.multiplierMaterial = new THREE.MeshBasicMaterial({ map: this.multiplierTexture, transparent: true, side: THREE.DoubleSide });
  }

  createEnergyBubble(theme = "cyan") {
    const bubbleGroup = new THREE.Group();
    const sphereMat = theme === "amber" ? this.materials.bubbleAmber : this.materials.bubbleCyan;
    const ringMat = theme === "amber" ? this.materials.bubbleRingWhite : this.materials.bubbleRingCyan;

    // Translucent shimmering containment sphere
    const bubble = new THREE.Mesh(this.geometries.bubbleSphere, sphereMat);
    bubbleGroup.add(bubble);

    // Dual counter-angled gyroscopic orbital rings
    const ring1 = new THREE.Mesh(this.geometries.bubbleRingMajor, ringMat);
    ring1.rotation.x = Math.PI / 4;
    ring1.rotation.y = 0.2;
    bubbleGroup.add(ring1);

    const ring2 = new THREE.Mesh(this.geometries.bubbleRingMinor, this.materials.bubbleRingWhite);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = -0.2;
    bubbleGroup.add(ring2);

    return bubbleGroup;
  }

  /**
   * Premium 3D Royal Gold Coin with Detailed Inner Circle Solid Neon Triangle Emblem
   * Full warm metallic gold body, champagne gold raised beveled rim, 12 milled radial notches,
   * stepped inner gold medallion disc, luminous neon cyan cyber circle,
   * and high-detail solid filled neon Delta triangle with chiseled gold casing and corner micro-capacitors.
   */
  createCoin() {
    const group = new THREE.Group();
    group.userData.type = "coin";
    group.userData.points = CONFIG.UNITS_PER_COIN;

    // 1. Rich Gleaming Polished Royal Gold Base Plate
    const plate = new THREE.Mesh(this.geometries.coinPlate, this.materials.goldArmor);
    plate.rotation.x = Math.PI / 2;
    group.add(plate);

    // 2. Raised Beveled Outer Rim (Champagne gold)
    const rim = new THREE.Mesh(this.geometries.coinRim, this.materials.goldTrim);
    group.add(rim);

    // 3. Tactile Milled Radial Edge Notches (12 ribs at 30 deg increments)
    for (let i = 0; i < 6; i++) {
      const notch = new THREE.Mesh(this.geometries.coinMilledNotch, this.materials.goldTrim);
      notch.rotation.z = (i * Math.PI) / 6;
      group.add(notch);
    }

    // 4. Stepped Inner Circle Gold Medallion Platform
    const innerDisc = new THREE.Mesh(this.geometries.coinInnerDisc, this.materials.goldSatin);
    innerDisc.rotation.x = Math.PI / 2;
    group.add(innerDisc);

    // 5. Raised Inner Concentric Gold Bezel Ring (Framing the inner circle)
    const innerBezel = new THREE.Mesh(this.geometries.coinInnerBezel, this.materials.goldTrim);
    group.add(innerBezel);

    // 6. Glowing Neon Cyan Cyber Ring inside the Inner Circle
    const neonCircle = new THREE.Mesh(this.geometries.coinNeonCircle, this.materials.neonCyan);
    group.add(neonCircle);

    // 7. Solid Filled Glowing Neon Triangle Emblem (Centered in inner circle)
    // 7a. Chiseled Gold Outer Triangular Bezel (Holding the solid neon crystal)
    const triBezel = new THREE.Mesh(this.geometries.coinGoldTriBezel, this.materials.goldTrim);
    triBezel.rotation.x = Math.PI / 2;
    group.add(triBezel);

    // 7b. Solid Filled Radiant Neon Cyan Triangle Prism
    const triSolid = new THREE.Mesh(this.geometries.coinNeonTriSolid, this.materials.neonCyan);
    triSolid.rotation.x = Math.PI / 2;
    group.add(triSolid);

    // 7c. Solid Filled Hot-White Core Neon Accent
    const triHighlight = new THREE.Mesh(this.geometries.coinNeonTriHighlight, this.materials.neonCyanCore);
    triHighlight.rotation.x = Math.PI / 2;
    group.add(triHighlight);

    // 8. Micro Corner Glow Capacitors at 3 Triangle Vertices (Front & Back faces)
    const vertexRadius = 0.142;
    const nodeCoords = [
      [0, vertexRadius],
      [-vertexRadius * Math.sin(Math.PI / 3), -vertexRadius * Math.cos(Math.PI / 3)],
      [vertexRadius * Math.sin(Math.PI / 3), -vertexRadius * Math.cos(Math.PI / 3)]
    ];
    for (const [nx, ny] of nodeCoords) {
      for (const nz of [-0.042, 0.042]) {
        const node = new THREE.Mesh(this.geometries.coinTriangleNode, this.materials.neonCyanCore);
        node.position.set(nx, ny, nz);
        group.add(node);
      }
    }

    // 9. 3 Micro-Conduit Circuit Traces routing from triangle tips to inner neon circle
    const rayAngles = [0, (2 * Math.PI) / 3, -(2 * Math.PI) / 3];
    for (const angle of rayAngles) {
      const conduit = new THREE.Mesh(this.geometries.coinVertexConduit, this.materials.neonCyan);
      // Midpoint between triangle tip (0.142) and neon circle (0.18) -> 0.16
      conduit.position.set(-0.16 * Math.sin(angle), 0.16 * Math.cos(angle), 0);
      conduit.rotation.z = angle;
      group.add(conduit);
    }

    group.userData.radius = 0.55;
    return group;
  }

  /**
   * High-Tech 3D Horseshoe Magnet with Induction Coils & Magnetic Flux Field
   */
  createMagnet() {
    const group = new THREE.Group();
    group.userData.type = "powerup";
    group.userData.powerupType = "magnet";
    group.userData.duration = CONFIG.MAGNET_DURATION;

    group.add(this.createEnergyBubble("cyan"));

    // Heavy Ruby Metallic Horseshoe Arch
    const arch = new THREE.Mesh(this.geometries.magnetArch, this.materials.magnetRed);
    arch.rotation.z = Math.PI;
    group.add(arch);

    // Silver Chrome Magnetic Pole Tips (North / South)
    for (let x of [-0.34, 0.34]) {
      const tip = new THREE.Mesh(this.geometries.magnetTip, this.materials.chromeSilver);
      tip.position.set(x, -0.1, 0);
      group.add(tip);

      // Gold Induction Flux Coils
      const coil = new THREE.Mesh(this.geometries.magnetCoil, this.materials.inductionCopper);
      coil.position.set(x, 0.05, 0);
      coil.rotation.x = Math.PI / 2;
      group.add(coil);

      // Luminous Charge Sparks
      const spark = new THREE.Mesh(this.geometries.magnetSpark, this.materials.emblemCore);
      spark.position.set(x, -0.22, 0);
      group.add(spark);
    }

    // Glowing Cyan Magnetic Force Field Arc between tips
    const arc = new THREE.Mesh(this.geometries.magnetArc, this.materials.emblemCore);
    arc.position.set(0, -0.1, 0);
    group.add(arc);

    group.userData.radius = 0.85;
    return group;
  }

  /**
   * Dual Titanium Rocket Jetpack with Gold Shrouds & Plasma Exhausts
   */
  createJetpack() {
    const group = new THREE.Group();
    group.userData.type = "powerup";
    group.userData.powerupType = "jetpack";
    group.userData.duration = CONFIG.JETPACK_DURATION;

    group.add(this.createEnergyBubble("amber"));

    // Dual Rocket Thrusters with Nosecones and Fiery Exhausts
    for (let x of [-0.22, 0.22]) {
      const rocket = new THREE.Mesh(this.geometries.jetpackRocket, this.materials.jetpackTitanium);
      rocket.position.x = x;
      group.add(rocket);

      const shroud = new THREE.Mesh(this.geometries.jetpackCone, this.materials.jetpackGold);
      shroud.position.set(x, 0.35, 0);
      group.add(shroud);

      const nozzle = new THREE.Mesh(this.geometries.jetpackNozzle, this.materials.chromeSilver);
      nozzle.rotation.x = Math.PI;
      nozzle.position.set(x, -0.35, 0);
      group.add(nozzle);

      const flame = new THREE.Mesh(this.geometries.jetpackFlare, this.materials.jetpackFlame);
      flame.rotation.x = Math.PI;
      flame.position.set(x, -0.52, 0);
      group.add(flame);
    }

    // Chrome Harness & Fuel Manifold
    const harness = new THREE.Mesh(this.geometries.jetpackHarness, this.materials.chromeSilver);
    group.add(harness);

    const manifold = new THREE.Mesh(this.geometries.jetpackManifold, this.materials.inductionCopper);
    manifold.rotation.z = Math.PI / 2;
    manifold.position.set(0, 0.12, 0.04);
    group.add(manifold);

    group.userData.radius = 0.85;
    return group;
  }

  /**
   * Hexagonal Aegis Force Shield with Circuit Traces & Chrome Star Core
   */
  createShield() {
    const group = new THREE.Group();
    group.userData.type = "powerup";
    group.userData.powerupType = "shield";

    group.add(this.createEnergyBubble("cyan"));

    // Glowing Hexagonal Energy Shield Emitter
    const shieldMesh = new THREE.Mesh(this.geometries.shieldHex, this.materials.shieldCyan);
    shieldMesh.rotation.x = Math.PI / 2;
    group.add(shieldMesh);

    // Raised Chrome Bezel Outer Ring
    const ring = new THREE.Mesh(this.geometries.shieldRing, this.materials.chromeSilver);
    group.add(ring);

    // Radial Circuit Traces
    for (let angle of [0, Math.PI / 3, (2 * Math.PI) / 3]) {
      const trace = new THREE.Mesh(this.geometries.shieldTrace, this.materials.chromeSilver);
      trace.rotation.z = angle;
      group.add(trace);
    }

    // Gleaming 3D Faceted Aegis Star
    const star = new THREE.Mesh(this.geometries.shieldStar, this.materials.chromeSilver);
    star.position.z = 0.06;
    group.add(star);

    // Glowing Central Cybernetic Node
    const coreNode = new THREE.Mesh(this.geometries.coinCenterDot, this.materials.emblemCore);
    coreNode.position.z = 0.08;
    group.add(coreNode);

    group.userData.radius = 0.85;
    return group;
  }

  /**
   * Royal Sunburst 2X Score Multiplier Medallion
   */
  createMultiplier() {
    const group = new THREE.Group();
    group.userData.type = "powerup";
    group.userData.powerupType = "multiplier";
    group.userData.duration = CONFIG.DOUBLE_POINTS_DURATION;

    group.add(this.createEnergyBubble("amber"));

    // Multi-Tiered Golden Sunburst Medallion
    const crest = new THREE.Mesh(this.geometries.multiplierCrest, this.materials.multiplierGold);
    crest.rotation.x = Math.PI / 2;
    group.add(crest);

    // Raised Diamond-Cut Outer Ring
    const ring = new THREE.Mesh(this.geometries.multiplierRing, this.materials.goldTrim);
    group.add(ring);

    // 8 Radial Notches
    for (let angle of [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4]) {
      const rib = new THREE.Mesh(this.geometries.coinRib, this.materials.goldArmor);
      rib.rotation.z = angle;
      group.add(rib);
    }

    // Floating 3D Embossed "2X" Emblem Label
    const label = new THREE.Mesh(this.geometries.multiplierLabel, this.multiplierMaterial);
    label.position.z = 0.06;
    group.add(label);

    group.userData.radius = 0.85;
    return group;
  }
}

