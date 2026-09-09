/**
 * PRABHAS: KASI 2898 AD (3D Runner - Bounty Hunter System)
 * 3D Models: Live Bounty Targets, Crates, Harpoon, Boss Skiff & Extraction Beacon
 * High-performance shared geometries and PBR materials
 */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { CONFIG } from "../config.js";

export class BountyModelFactory {
  constructor() {
    this.materials = {
      rustMetal: new THREE.MeshStandardMaterial({ color: 0x854D0E, roughness: 0.8, metalness: 0.6 }),
      darkCarbon: new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.4, metalness: 0.8 }),
      chromeAlloy: new THREE.MeshStandardMaterial({ color: 0x94A3B8, roughness: 0.2, metalness: 0.9 }),
      goldTrim: new THREE.MeshStandardMaterial({ color: 0xF59E0B, roughness: 0.3, metalness: 0.8 }),
      hazardStripe: new THREE.MeshBasicMaterial({ color: 0xFBBF24 }),
      cyanEnergy: new THREE.MeshBasicMaterial({ color: 0x00E5FF, transparent: true, opacity: 0.85 }),
      amberEnergy: new THREE.MeshBasicMaterial({ color: 0xF59E0B, transparent: true, opacity: 0.85 }),
      redSensor: new THREE.MeshBasicMaterial({ color: 0xEF4444 }),
      beaconGlow: new THREE.MeshBasicMaterial({ color: 0x00E5FF, transparent: true, opacity: 0.6, side: THREE.DoubleSide }),
      bracketLine: new THREE.MeshBasicMaterial({ color: 0x00E5FF, wireframe: true, transparent: true, opacity: 0.75 })
    };

    this.geometries = {
      skiffBody: new THREE.BoxGeometry(1.6, 0.4, 3.2),
      skiffNose: new THREE.ConeGeometry(0.8, 1.2, 4),
      thrusterPod: new THREE.CylinderGeometry(0.18, 0.22, 0.6, 12),
      thrusterGlow: new THREE.ConeGeometry(0.16, 0.45, 12),
      droidSphere: new THREE.SphereGeometry(0.55, 16, 16),
      droidRing: new THREE.TorusGeometry(0.7, 0.04, 8, 20),
      crateBox: new THREE.BoxGeometry(1.4, 1.2, 1.4),
      crateTrim: new THREE.BoxGeometry(1.44, 0.15, 1.44),
      harpoonTip: new THREE.ConeGeometry(0.2, 0.7, 8),
      harpoonShaft: new THREE.CylinderGeometry(0.06, 0.06, 1.2, 8),
      targetBracket: new THREE.BoxGeometry(1.8, 1.8, 1.8),
      beaconRing: new THREE.RingGeometry(1.2, 2.6, 24)
    };
  }

  /**
   * Tier 1: Scavenger Raider Skiff (5,000 Units Reward)
   */
  createScavengerSkiff() {
    const group = new THREE.Group();
    group.userData = { type: "bounty_target", targetTier: 1, rewardUnits: 5000, targetName: "Scavenger Raider", isTarget: true };

    const body = new THREE.Mesh(this.geometries.skiffBody, this.materials.rustMetal);
    body.position.y = 0.55;
    body.castShadow = true;
    group.add(body);

    const nose = new THREE.Mesh(this.geometries.skiffNose, this.materials.rustMetal);
    nose.rotation.x = -Math.PI / 2;
    nose.position.set(0, 0.55, 2.0);
    group.add(nose);

    // Rear Thrusters
    for (let x of [-0.55, 0.55]) {
      const pod = new THREE.Mesh(this.geometries.thrusterPod, this.materials.darkCarbon);
      pod.rotation.x = Math.PI / 2;
      pod.position.set(x, 0.55, -1.6);
      group.add(pod);

      const flame = new THREE.Mesh(this.geometries.thrusterGlow, this.materials.amberEnergy);
      flame.rotation.x = -Math.PI / 2;
      flame.position.set(x, 0.55, -2.0);
      group.add(flame);
    }

    // Holographic Bounty Target Bracket
    const bracket = new THREE.Mesh(this.geometries.targetBracket, this.materials.bracketLine);
    bracket.position.y = 0.8;
    group.add(bracket);

    return group;
  }

  /**
   * Tier 2: Smuggler Speeder (10,000 Units Reward)
   */
  createSmugglerSpeeder() {
    const group = new THREE.Group();
    group.userData = { type: "bounty_target", targetTier: 2, rewardUnits: 10000, targetName: "Smuggler Speeder", isTarget: true };

    const body = new THREE.Mesh(this.geometries.skiffBody, this.materials.darkCarbon);
    body.position.y = 0.65;
    body.scale.set(1.1, 0.9, 1.2);
    body.castShadow = true;
    group.add(body);

    const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 12), this.materials.goldTrim);
    canopy.position.set(0, 0.95, 0.2);
    group.add(canopy);

    for (let x of [-0.85, 0.85]) {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 1.8), this.materials.chromeAlloy);
      wing.position.set(x, 0.65, -0.2);
      group.add(wing);

      const flame = new THREE.Mesh(this.geometries.thrusterGlow, this.materials.cyanEnergy);
      flame.rotation.x = -Math.PI / 2;
      flame.position.set(x, 0.65, -1.5);
      group.add(flame);
    }

    const bracket = new THREE.Mesh(this.geometries.targetBracket, this.materials.bracketLine);
    bracket.position.y = 0.85;
    group.add(bracket);

    return group;
  }

  /**
   * Tier 3: Complex Rogue Droid (25,000 Units Reward)
   */
  createRogueDroid() {
    const group = new THREE.Group();
    group.userData = { type: "bounty_target", targetTier: 3, rewardUnits: 25000, targetName: "Rogue Surveillance Droid", isTarget: true };

    const core = new THREE.Mesh(this.geometries.droidSphere, this.materials.darkCarbon);
    core.position.y = 1.35;
    core.castShadow = true;
    group.add(core);

    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), this.materials.redSensor);
    eye.position.set(0, 1.35, 0.48);
    group.add(eye);

    const ring = new THREE.Mesh(this.geometries.droidRing, this.materials.cyanEnergy);
    ring.position.y = 1.35;
    group.add(ring);

    const bracket = new THREE.Mesh(this.geometries.targetBracket, this.materials.bracketLine);
    bracket.position.y = 1.35;
    group.add(bracket);

    return group;
  }

  /**
   * Mini-Boss: Manas Enforcer Skiff (50,000 / 100,000 Units Reward)
   */
  createBossSkiff(isCommander = false) {
    const group = new THREE.Group();
    const units = isCommander ? 100000 : 50000;
    const name = isCommander ? "Elite Complex Commander" : "Manas Enforcer Skiff";
    group.userData = { type: "bounty_boss", targetTier: isCommander ? 5 : 4, rewardUnits: units, targetName: name, isBoss: true };

    const hull = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.9, 5.5), isCommander ? this.materials.darkCarbon : this.materials.rustMetal);
    hull.position.y = 1.8;
    hull.castShadow = true;
    group.add(hull);

    const bridge = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 2.2), this.materials.chromeAlloy);
    bridge.position.set(0, 2.45, -0.4);
    group.add(bridge);

    const eye = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.2, 0.08), this.materials.redSensor);
    eye.position.set(0, 2.45, 0.72);
    group.add(eye);

    // Front Heavy Turret Laser Cannons
    for (let x of [-1.2, 1.2]) {
      const cannon = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.6, 10), this.materials.darkCarbon);
      cannon.rotation.x = Math.PI / 2;
      cannon.position.set(x, 1.6, 2.4);
      group.add(cannon);
    }

    // Heavy Thrusters
    for (let x of [-1.1, 0, 1.1]) {
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.2, 12), this.materials.amberEnergy);
      flame.rotation.x = -Math.PI / 2;
      flame.position.set(x, 1.8, -3.2);
      group.add(flame);
    }

    return group;
  }

  /**
   * Bounty Supply Stash Crate (10,000 / 25,000 Units)
   */
  createBountyCrate(isHighValue = false) {
    const group = new THREE.Group();
    const units = isHighValue ? 25000 : 10000;
    group.userData = { type: "bounty_crate", rewardUnits: units, isHighValue, isCrate: true };

    const crate = new THREE.Mesh(this.geometries.crateBox, isHighValue ? this.materials.goldTrim : this.materials.darkCarbon);
    crate.position.y = 0.6;
    crate.castShadow = true;
    group.add(crate);

    const lock = new THREE.Mesh(this.geometries.crateTrim, isHighValue ? this.materials.amberEnergy : this.materials.cyanEnergy);
    lock.position.y = 0.6;
    group.add(lock);

    return group;
  }

  /**
   * Rival Bounty Hunter Skiff (Ambush Event)
   */
  createRivalHunter() {
    const group = this.createScavengerSkiff();
    group.userData.type = "rival_hunter";
    group.userData.rewardUnits = 10000;
    group.userData.targetName = "Rival Outlaw Skiff";
    group.userData.isRival = true;
    return group;
  }

  /**
   * Extraction Beacon Zone (Vacuum All Units)
   */
  createExtractionBeacon() {
    const group = new THREE.Group();
    group.userData = { type: "extraction_beacon", radius: 4.0 };

    const ring = new THREE.Mesh(this.geometries.beaconRing, this.materials.beaconGlow);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.08;
    group.add(ring);

    const column = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 8.0, 16, 1, true), this.materials.cyanEnergy);
    column.position.y = 4.0;
    group.add(column);

    return group;
  }

  /**
   * EMP Harpoon Weapon Pickup Item
   */
  createHarpoonPickup() {
    const group = new THREE.Group();
    group.userData = { type: "powerup", powerupType: "harpoon", duration: 8.0 };

    const shaft = new THREE.Mesh(this.geometries.harpoonShaft, this.materials.goldTrim);
    shaft.position.y = 1.0;
    group.add(shaft);

    const tip = new THREE.Mesh(this.geometries.harpoonTip, this.materials.cyanEnergy);
    tip.position.y = 1.65;
    group.add(tip);

    const ring = new THREE.Mesh(this.geometries.droidRing, this.materials.cyanEnergy);
    ring.position.y = 1.0;
    group.add(ring);

    return group;
  }
}
