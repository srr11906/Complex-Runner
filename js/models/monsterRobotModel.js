/**
 * COMPLEX RUNNER - Next-Gen 3D Sci-Fi Runner
 * Movie-Authentic Wastelands "Apex Rogue Harvester" Rival Mecha
 * - Full Silver Shiny Chrome Armor with Red Minimalist Racing Design
 * - Solid 100% Body Integrity throughout all 25 Laser Hits (No premature disappearance)
 * - Emissive Laser Hit Flash (No color corruption or material bleaching)
 * - 12m High-Power Magnetic Coin Vacuum
 * - Ejects Reclaimable Coins Backward towards Bhairava on Laser Hits
 * - Upon 25-Hit Destruction: Spawns High-Altitude Sky Beacon Beam + 50,000 Bounty Drop
 */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { CONFIG } from "../config.js";

const _tempVec = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _chunkOffset = new THREE.Vector3();

export class MonsterRobotModel {
  constructor(scene) {
    this.scene = scene;
    this.root = new THREE.Group();
    this.root.name = "WastelandsRogueHarvester";
    this.root.visible = false;

    this.active = false;
    this.hp = CONFIG.MONSTER_ROBOT ? CONFIG.MONSTER_ROBOT.MAX_HITS : 25;
    this.maxHp = this.hp;
    this.laneIndex = 1;
    this.targetX = CONFIG.LANES[1];
    this.position = new THREE.Vector3(0, 0, 0);
    this.velocityY = 0;
    this.isGrounded = true;
    this.groundElevation = 0;
    this.state = "idle"; // "spawning" | "running" | "jumping" | "sliding" | "glitching"
    this.slideTimer = 0;
    this.recoilTimer = 0;
    this.glitchTimer = 0;
    this.spawnTimer = 0;
    this.isGlitching = false;
    this.lifetime = 0;
    this.laneSwitchCooldown = 0;

    this.parts = {};
    this.materials = {};
    this.droppedCoins = [];
    this.hpBarMesh = null;
    this.hpFillMesh = null;
    this.bountyBeacon = null;

    this.scaleFactor = CONFIG.MONSTER_ROBOT?.SCALE || 1.5;

    this.buildMaterials();
    this.buildModel();
    this.buildHpBar();
    this.buildDroppedCoinsPool();
    this.buildBountyBeacon();

    if (this.scene) {
      this.scene.add(this.root);
    }
  }

  buildMaterials() {
    // 1. Full Silver Shiny Metallic Chrome Armor
    this.materials.silverArmor = new THREE.MeshStandardMaterial({
      color: 0xE8ECF2,
      metalness: 0.96,
      roughness: 0.14,
      emissive: 0x000000
    });

    // 2. Dark Titanium Skeletal Joints
    this.materials.darkTitanium = new THREE.MeshStandardMaterial({
      color: 0x384152,
      metalness: 0.88,
      roughness: 0.28,
      emissive: 0x000000
    });

    // 3. Simple Crisp Red Accent Plating & Stripes
    this.materials.redAccent = new THREE.MeshStandardMaterial({
      color: 0xEF4444,
      metalness: 0.35,
      roughness: 0.35,
      emissive: 0x220000
    });

    // 4. Crimson Glowing Optic Visor
    this.materials.redOptic = new THREE.MeshBasicMaterial({
      color: 0xFF1744
    });

    // 5. Cyan Magnetic Intake Core
    this.materials.cyanVacuum = new THREE.MeshBasicMaterial({
      color: 0x00E5FF
    });

    // 6. Amber Thruster Jet Flames
    this.materials.thrusterFlame = new THREE.MeshBasicMaterial({
      color: 0xFF6D00
    });
  }

  buildModel() {
    const { silverArmor, darkTitanium, redAccent, redOptic, cyanVacuum, thrusterFlame } = this.materials;

    // Main Scaled Group
    const mainGroup = new THREE.Group();
    mainGroup.scale.set(this.scaleFactor, this.scaleFactor, this.scaleFactor);
    this.parts.main = mainGroup;
    this.root.add(mainGroup);

    // Hips / Pelvis
    const hips = new THREE.Group();
    hips.position.y = 1.35;
    mainGroup.add(hips);
    this.parts.hips = hips;

    const pelvisMesh = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.45, 0.65), darkTitanium);
    hips.add(pelvisMesh);

    // Front Red Inset Belt
    const redBelt = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.1), redAccent);
    redBelt.position.set(0, -0.05, 0.34);
    hips.add(redBelt);

    // Torso (Shiny Silver with Red Chest Insignia)
    const torso = new THREE.Group();
    torso.position.y = 0.35;
    hips.add(torso);
    this.parts.torso = torso;

    const torsoMesh = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.95, 0.8), silverArmor);
    torso.add(torsoMesh);

    // Red Racing Chest Chevrons
    const redStripeLeft = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.65, 0.04), redAccent);
    redStripeLeft.position.set(-0.35, 0.05, 0.41);
    torso.add(redStripeLeft);

    const redStripeRight = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.65, 0.04), redAccent);
    redStripeRight.position.set(0.35, 0.05, 0.41);
    torso.add(redStripeRight);

    // Central Glowing Cyan Magnetic Intake Vortex
    const vacuumCoreGroup = new THREE.Group();
    vacuumCoreGroup.position.set(0, 0.12, 0.42);

    const vortexRim = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.06, 12, 24), redAccent);
    vacuumCoreGroup.add(vortexRim);

    const vortexCore = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.1, 24), cyanVacuum);
    vortexCore.rotation.x = Math.PI / 2;
    vacuumCoreGroup.add(vortexCore);

    // Spinning Fan Blades
    const fanBladeGeo = new THREE.BoxGeometry(0.48, 0.05, 0.02);
    for (let angle = 0; angle < Math.PI; angle += Math.PI / 3) {
      const blade = new THREE.Mesh(fanBladeGeo, darkTitanium);
      blade.rotation.z = angle;
      vacuumCoreGroup.add(blade);
    }

    torso.add(vacuumCoreGroup);
    this.parts.vacuumCore = vacuumCoreGroup;

    // Dual Shoulder Turbine Grinders (Silver & Red Trim)
    for (let side of [-1, 1]) {
      const turbine = new THREE.Group();
      turbine.position.set(side * 0.72, 0.52, -0.15);

      const turbineHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.8, 16), silverArmor);
      turbineHousing.rotation.x = -Math.PI / 2 + 0.2;
      turbine.add(turbineHousing);

      const redRim = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.04, 8, 16), redAccent);
      redRim.position.z = 0.4;
      turbine.add(redRim);

      const exhaustGlow = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.35, 12, 1, true), cyanVacuum);
      exhaustGlow.rotation.x = Math.PI / 2;
      exhaustGlow.position.z = 0.45;
      turbine.add(exhaustGlow);

      const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8), darkTitanium);
      stack.position.set(0, 0.35, -0.2);
      stack.rotation.x = -0.3;
      turbine.add(stack);

      torso.add(turbine);
    }

    // Heavy Mecha Head with Silver Helmet & Red Cyclops Visor
    const head = new THREE.Group();
    head.position.y = 0.72;
    torso.add(head);
    this.parts.head = head;

    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.42, 0.55), silverArmor);
    head.add(headMesh);

    // Red Brow Visor Trim
    const redBrow = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.08, 0.1), redAccent);
    redBrow.position.set(0, 0.16, 0.28);
    head.add(redBrow);

    // Glowing Crimson Cyclops Visor
    const eyeVisor = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.1), redOptic);
    eyeVisor.position.set(0, 0.05, 0.28);
    head.add(eyeVisor);

    // Arms (Shiny Silver Upper Arm & Forearm with Red Accent Stripes)
    const buildArm = (side) => {
      const armRoot = new THREE.Group();
      armRoot.position.set(side * 0.8, 0.35, 0);

      const shoulderPad = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), silverArmor);
      shoulderPad.scale.set(1.2, 1.0, 1.0);
      armRoot.add(shoulderPad);

      const redShoulderCap = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.08, 0.35), redAccent);
      redShoulderCap.position.y = 0.16;
      armRoot.add(redShoulderCap);

      const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.65, 8), darkTitanium);
      upperArm.position.y = -0.35;
      armRoot.add(upperArm);

      const elbow = new THREE.Group();
      elbow.position.y = -0.7;
      armRoot.add(elbow);

      const forearm = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.65, 0.32), silverArmor);
      forearm.position.y = -0.32;
      elbow.add(forearm);

      // Red Forearm Guard Stripe
      const forearmRed = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.04), redAccent);
      forearmRed.position.set(0, -0.32, 0.17);
      elbow.add(forearmRed);

      // 3 Claws
      for (let c of [-0.1, 0, 0.1]) {
        const claw = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.3, 0.08), redAccent);
        claw.position.set(c, -0.72, 0.05);
        claw.rotation.x = 0.2;
        elbow.add(claw);
      }

      torso.add(armRoot);
      return { armRoot, elbow };
    };

    this.parts.leftArm = buildArm(-1);
    this.parts.rightArm = buildArm(1);

    // Legs (Shiny Silver Thighs, Red Knee Plates, Dark Titanium Shins)
    const buildLeg = (side) => {
      const legRoot = new THREE.Group();
      legRoot.position.set(side * 0.38, -0.22, 0);

      const hipJoint = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), darkTitanium);
      legRoot.add(hipJoint);

      const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 0.8, 8), silverArmor);
      thigh.position.y = -0.4;
      legRoot.add(thigh);

      const knee = new THREE.Group();
      knee.position.y = -0.8;
      legRoot.add(knee);

      // Red Knee Cap Guard
      const redKnee = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.14), redAccent);
      redKnee.position.set(0, 0, 0.15);
      knee.add(redKnee);

      const shin = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.85, 0.32), darkTitanium);
      shin.position.y = -0.42;
      knee.add(shin);

      const shinPlate = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.6, 0.08), silverArmor);
      shinPlate.position.set(0, -0.38, 0.18);
      knee.add(shinPlate);

      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.2, 0.75), silverArmor);
      foot.position.set(0, -0.88, 0.18);
      knee.add(foot);

      const thruster = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.25, 8), thrusterFlame);
      thruster.position.set(0, -0.82, -0.25);
      thruster.rotation.x = Math.PI / 4;
      knee.add(thruster);

      hips.add(legRoot);
      return { legRoot, knee };
    };

    this.parts.leftLeg = buildLeg(-1);
    this.parts.rightLeg = buildLeg(1);

    // Shadows
    this.root.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }

  buildHpBar() {
    const hpGroup = new THREE.Group();
    hpGroup.position.set(0, 4.4, 0);

    const bgMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 0.22),
      new THREE.MeshBasicMaterial({ color: 0x111827, side: THREE.DoubleSide })
    );
    hpGroup.add(bgMesh);

    const borderMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.28, 0.30),
      new THREE.MeshBasicMaterial({ color: 0xEF4444, side: THREE.DoubleSide })
    );
    borderMesh.position.z = -0.01;
    hpGroup.add(borderMesh);

    const fillGeo = new THREE.PlaneGeometry(2.16, 0.18);
    fillGeo.translate(1.08, 0, 0); // Anchor to left edge
    const fillMesh = new THREE.Mesh(
      fillGeo,
      new THREE.MeshBasicMaterial({ color: 0x10B981, side: THREE.DoubleSide })
    );
    fillMesh.position.set(-1.08, 0, 0.01);
    hpGroup.add(fillMesh);

    this.hpBarMesh = hpGroup;
    this.hpFillMesh = fillMesh;
    this.root.add(hpGroup);
  }

  buildDroppedCoinsPool() {
    this.droppedCoins = [];
    const coinGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.08, 16);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xF59E0B,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xD97706,
      emissiveIntensity: 0.4
    });

    for (let i = 0; i < 30; i++) {
      const coin = new THREE.Mesh(coinGeo, coinMat);
      coin.rotation.x = Math.PI / 2;
      coin.visible = false;
      coin.userData = {
        active: false,
        velX: 0,
        velY: 0,
        velZ: 0,
        life: 0,
        collected: false
      };
      if (this.scene) this.scene.add(coin);
      this.droppedCoins.push(coin);
    }
  }

  /**
   * High-Visibility Sky Beacon & 50,000 Bounty Drop
   */
  buildBountyBeacon() {
    const beaconGroup = new THREE.Group();
    beaconGroup.visible = false;

    // 1. Massive Sky Light Ray (Vertical Glowing Pillar shooting 50m up into the clouds)
    const skyRayGeo = new THREE.CylinderGeometry(0.4, 0.8, 50.0, 16, 1, true);
    const skyRayMat = new THREE.MeshBasicMaterial({
      color: 0xF59E0B,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const skyRay = new THREE.Mesh(skyRayGeo, skyRayMat);
    skyRay.position.y = 25.0;
    beaconGroup.add(skyRay);

    // Inner White Core Ray
    const coreRayGeo = new THREE.CylinderGeometry(0.12, 0.22, 50.0, 8, 1, true);
    const coreRayMat = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const coreRay = new THREE.Mesh(coreRayGeo, coreRayMat);
    coreRay.position.y = 25.0;
    beaconGroup.add(coreRay);

    // 2. Floating Golden Bounty Crate / Power Core
    const crateGeo = new THREE.BoxGeometry(1.4, 1.4, 1.4);
    const crateMat = new THREE.MeshStandardMaterial({
      color: 0xF59E0B,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0xD97706,
      emissiveIntensity: 0.5
    });
    const crateMesh = new THREE.Mesh(crateGeo, crateMat);
    crateMesh.position.y = 1.4;
    beaconGroup.add(crateMesh);

    // Glowing Cyan Energy Rings around crate
    const ringGeo = new THREE.TorusGeometry(1.1, 0.08, 8, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00E5FF });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 2;
    ring1.position.y = 1.4;
    beaconGroup.add(ring1);

    const ring2 = new THREE.Mesh(ringGeo, ringMat);
    ring2.rotation.y = Math.PI / 2;
    ring2.position.y = 1.4;
    beaconGroup.add(ring2);

    beaconGroup.userData = {
      active: false,
      collected: false,
      rewardUnits: 50000,
      skyRay,
      crateMesh,
      ring1,
      ring2
    };

    if (this.scene) this.scene.add(beaconGroup);
    this.bountyBeacon = beaconGroup;
  }

  spawn(laneIndex, zPos) {
    this.active = true;
    this.hp = CONFIG.MONSTER_ROBOT ? CONFIG.MONSTER_ROBOT.MAX_HITS : 25;
    this.maxHp = this.hp;
    this.laneIndex = Math.max(0, Math.min(2, laneIndex));
    this.targetX = CONFIG.LANES[this.laneIndex];
    this.position.set(this.targetX, 14.0, zPos);
    this.root.position.copy(this.position);
    this.root.scale.set(1, 1, 1);
    this.root.visible = true;
    this.velocityY = -35.0;
    this.isGrounded = false;
    this.groundElevation = 0;
    this.state = "spawning";
    this.spawnTimer = 0.7;
    this.slideTimer = 0;
    this.recoilTimer = 0;
    this.glitchTimer = 0;
    this.isGlitching = false;
    this.lifetime = 0;

    // Ensure all materials are fully restored
    this.restoreMaterials();
    this.updateHpBar();
  }

  restoreMaterials() {
    this.materials.silverArmor.emissive.setHex(0x000000);
    this.materials.silverArmor.color.setHex(0xE8ECF2);
    this.materials.darkTitanium.emissive.setHex(0x000000);
    this.materials.redAccent.emissive.setHex(0x220000);
    this.materials.redAccent.color.setHex(0xEF4444);

    this.root.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.transparent = false;
        child.material.opacity = 1.0;
      }
    });
  }

  updateHpBar() {
    if (!this.hpFillMesh) return;
    const pct = Math.max(0, Math.min(1.0, this.hp / this.maxHp));
    this.hpFillMesh.scale.x = pct;
    if (pct > 0.5) {
      this.hpFillMesh.material.color.setHex(0x10B981);
    } else if (pct > 0.25) {
      this.hpFillMesh.material.color.setHex(0xF59E0B);
    } else {
      this.hpFillMesh.material.color.setHex(0xEF4444);
    }
  }

  /**
   * Clean Laser Hit Reaction using Emissive Highlights (Zero Color Corruption)
   */
  takeLaserHit() {
    if (!this.active || this.isGlitching) return { destroyed: false, hp: this.hp, coinsDropped: 0 };

    this.hp--;
    this.recoilTimer = 0.25;
    this.updateHpBar();

    // Recoil Flinch
    this.parts.main.position.x = (Math.random() - 0.5) * 0.3;
    this.parts.main.position.y = (Math.random() - 0.5) * 0.2;

    // Emissive Flash on armor without changing base colors
    this.materials.silverArmor.emissive.setHex(0x666666);
    this.materials.redAccent.emissive.setHex(0x991111);

    setTimeout(() => {
      this.parts.main.position.set(0, 0, 0);
      this.materials.silverArmor.emissive.setHex(0x000000);
      this.materials.redAccent.emissive.setHex(0x220000);
    }, 60);

    // Eject Reclaimable Coins Backward out of the salvage exhaust
    const coinsToDrop = CONFIG.MONSTER_ROBOT?.COINS_PER_HIT_DROP || 3;
    this.ejectCoinsBackward(coinsToDrop);

    if (this.hp <= 0) {
      this.startGlitchDespawn();
      return { destroyed: true, hp: 0, coinsDropped: coinsToDrop };
    }

    return { destroyed: false, hp: this.hp, coinsDropped: coinsToDrop };
  }

  ejectCoinsBackward(count = 3) {
    let droppedCount = 0;
    for (let i = 0; i < this.droppedCoins.length && droppedCount < count; i++) {
      const coin = this.droppedCoins[i];
      if (!coin.userData.active) {
        coin.userData.active = true;
        coin.userData.collected = false;
        coin.userData.life = 4.0;
        coin.position.set(
          this.position.x + (Math.random() - 0.5) * 1.2,
          this.position.y + 2.0 + Math.random() * 0.8,
          this.position.z - 1.0
        );
        coin.userData.velX = (Math.random() - 0.5) * 3.5;
        coin.userData.velY = 5.0 + Math.random() * 3.5;
        coin.userData.velZ = -14.0 - Math.random() * 5.0;
        coin.visible = true;
        droppedCount++;
      }
    }
  }

  startGlitchDespawn() {
    this.isGlitching = true;
    this.state = "glitching";
    this.glitchTimer = 1.3;
    this.ejectCoinsBackward(8);

    // Spawn High-Altitude Sky Beacon Beam on the road
    this.spawnBountyBeacon(this.position.x, this.position.z + 2.0);
  }

  spawnBountyBeacon(x, z) {
    if (!this.bountyBeacon) return;
    this.bountyBeacon.position.set(x, 0, z);
    this.bountyBeacon.visible = true;
    this.bountyBeacon.userData.active = true;
    this.bountyBeacon.userData.collected = false;
  }

  /**
   * Main Autonomous AI & Kinematic Animation Update
   */
  update(dt, playerSpeed, playerZ, obstacles = [], collectibles = [], player = null) {
    // 1. Update Dropped Coin Physics & Player Pickups
    this.updateDroppedCoins(dt, player);

    // 2. Update Sky Bounty Beacon Animation & Collision
    this.updateBountyBeacon(dt, player);

    if (!this.active) return;

    this.lifetime += dt;

    // Despawn check if too far ahead, behind, or timeout
    if (this.position.z < playerZ - 10 || this.position.z > playerZ + 90 || this.lifetime > (CONFIG.MONSTER_ROBOT?.DESPAWN_TIME || 55.0)) {
      if (!this.isGlitching) {
        this.active = false;
        this.root.visible = false;
        return;
      }
    }

    // 3. Glitch Disintegration Phase
    if (this.isGlitching) {
      this.glitchTimer -= dt;
      const progress = 1.0 - (this.glitchTimer / 1.3);

      this.root.position.x = this.targetX + (Math.random() - 0.5) * (0.6 + progress * 1.0);
      this.root.position.y = this.position.y + (Math.random() - 0.5) * (0.4 + progress * 0.8);
      const glitchScale = Math.max(0.01, (1.0 - progress * 0.95) * (1.0 + (Math.random() - 0.5) * 0.3));
      this.root.scale.set(glitchScale, glitchScale, glitchScale);

      this.root.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.transparent = true;
          child.material.opacity = Math.random() > 0.25 ? (1.0 - progress) : 0.08;
        }
      });

      if (this.glitchTimer <= 0) {
        this.active = false;
        this.root.visible = false;
        this.isGlitching = false;
        this.restoreMaterials();
      }
      return;
    }

    // 4. Kinetic Spawn Animation (Impact Slam)
    if (this.state === "spawning") {
      this.velocityY += CONFIG.GRAVITY * 1.5 * dt;
      this.position.y += this.velocityY * dt;

      if (this.position.y <= this.groundElevation) {
        this.position.y = this.groundElevation;
        this.velocityY = 0;
        this.isGrounded = true;
        this.state = "running";
      }

      this.root.position.copy(this.position);
      return;
    }

    if (this.laneSwitchCooldown > 0) {
      this.laneSwitchCooldown -= dt;
    }

    // 5. Autonomous Speed Control: Keep Mecha within 30m - 42m lead distance
    const minLead = CONFIG.MONSTER_ROBOT?.TARGET_LEAD_MIN || 30.0;
    const maxLead = CONFIG.MONSTER_ROBOT?.TARGET_LEAD_MAX || 42.0;
    const currentLead = this.position.z - playerZ;
    let botSpeed = playerSpeed;

    if (currentLead < minLead) {
      botSpeed = playerSpeed * 1.25;
    } else if (currentLead > maxLead) {
      botSpeed = playerSpeed * 0.78;
    }

    this.position.z += botSpeed * dt;

    this.position.x = THREE.MathUtils.lerp(this.position.x, this.targetX, 16 * dt);

    // AI Obstacle Avoidance (Accurate train ramp climbing, slide avoidance, hurdle leaping)
    this.evaluateAIPathfinding(obstacles);

    // Vertical Physics
    if (!this.isGrounded) {
      this.velocityY += CONFIG.GRAVITY * dt;
      this.position.y += this.velocityY * dt;

      if (this.position.y <= this.groundElevation) {
        this.position.y = this.groundElevation;
        this.velocityY = 0;
        this.isGrounded = true;
        if (this.state === "jumping") this.state = "running";
      }
    } else {
      this.position.y = THREE.MathUtils.lerp(this.position.y, this.groundElevation, 22 * dt);
    }

    if (this.slideTimer > 0) {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0 && this.state === "sliding") {
        this.state = "running";
      }
    }

    // 6. 12-Meter High-Power Magnetic Coin Vacuum
    this.vacuumCoinsWithMagnet(collectibles, dt);

    // 7. Update Transform
    this.root.position.copy(this.position);

    // Keep HP bar facing camera
    if (this.hpBarMesh) {
      this.hpBarMesh.lookAt(this.position.x, this.position.y + 4.4, this.position.z - 10);
    }

    // 8. Kinematic Rigged Animations
    this.animate(dt, botSpeed / CONFIG.INITIAL_SPEED);
  }

  /**
   * Update Sky Bounty Beacon Animation and Player Collision
   */
  updateBountyBeacon(dt, player) {
    if (!this.bountyBeacon || !this.bountyBeacon.userData.active) return;

    const time = performance.now() * 0.001;
    const { skyRay, crateMesh, ring1, ring2 } = this.bountyBeacon.userData;

    // Rotate crate and energy rings
    if (crateMesh) {
      crateMesh.rotation.y += 2.5 * dt;
      crateMesh.position.y = 1.4 + Math.sin(time * 4.0) * 0.25;
    }
    if (ring1) ring1.rotation.z += 3.5 * dt;
    if (ring2) ring2.rotation.x += 3.5 * dt;

    // Pulse Sky Ray
    if (skyRay) {
      skyRay.material.opacity = 0.65 + Math.sin(time * 6.0) * 0.2;
    }

    // Check collision with player
    if (player && !this.bountyBeacon.userData.collected) {
      const pPos = player.position;
      const bPos = this.bountyBeacon.position;
      const dist = Math.hypot(pPos.x - bPos.x, pPos.z - bPos.z);

      if (dist < 2.4 && Math.abs(pPos.y - bPos.y) < 3.5) {
        this.bountyBeacon.userData.collected = true;
        this.bountyBeacon.userData.active = false;
        this.bountyBeacon.visible = false;

        // Reward +50,000 Units & Trigger Victory Toast Banner
        if (window.gameEngine3D) {
          const reward = this.bountyBeacon.userData.rewardUnits || 50000;
          window.gameEngine3D.units += reward;
          window.gameEngine3D.score += reward;
          window.gameEngine3D.showFloatingBountyBanner(`💎 +50,000 BOUNTY SECURED!`, "boss");
          window.gameEngine3D.safeAudio("playPowerup");
          window.gameEngine3D.safeAudio("playDialogue", "complex");
          window.gameEngine3D.cameraManager.shake(0.5);
        }
      }
    }
  }

  updateDroppedCoins(dt, player) {
    if (!player) return;
    const pX = player.position.x;
    const pY = player.position.y + 0.9;
    const pZ = player.position.z;

    for (let i = 0; i < this.droppedCoins.length; i++) {
      const coin = this.droppedCoins[i];
      if (!coin.userData.active) continue;

      coin.userData.life -= dt;
      if (coin.userData.life <= 0 || coin.userData.collected) {
        coin.userData.active = false;
        coin.visible = false;
        continue;
      }

      // Physics
      coin.userData.velY += CONFIG.GRAVITY * 0.7 * dt;
      coin.position.x += coin.userData.velX * dt;
      coin.position.y += coin.userData.velY * dt;
      coin.position.z += coin.userData.velZ * dt;

      if (coin.position.y < 0.85) {
        coin.position.y = 0.85;
        coin.userData.velY = -coin.userData.velY * 0.4;
      }

      coin.rotation.y += 6.0 * dt;

      const distToPlayer = Math.hypot(coin.position.x - pX, coin.position.y - pY, coin.position.z - pZ);
      if (distToPlayer < 1.8) {
        coin.userData.collected = true;
        coin.userData.active = false;
        coin.visible = false;
        if (window.gameEngine3D) {
          window.gameEngine3D.units += CONFIG.UNITS_PER_COIN;
          window.gameEngine3D.score += CONFIG.UNITS_PER_COIN;
          window.gameEngine3D.safeAudio("playCoin", 1);
        }
      }
    }
  }

  evaluateAIPathfinding(obstacles) {
    let targetGround = 0;

    for (let i = 0; i < obstacles.length; i++) {
      const obs = obstacles[i];
      if (!obs || obs.destroyed || !obs.mesh || !obs.mesh.visible) continue;
      const oPos = obs.worldPos;

      const isSameLane = Math.abs(oPos.x - this.targetX) < 1.5;
      if (!isSameLane) continue;

      const distZ = oPos.z - this.position.z;

      // 1. Train Handling (Ramps & Solid Obstacles)
      if (obs.type === "train") {
        const hasRamp = obs.mesh && obs.mesh.userData && obs.mesh.userData.hasRamp;
        const trainHalfLength = 12.0; // 24m train
        const trainTopY = 4.15;

        if (hasRamp) {
          const rampLength = 9.0;
          const rampStartDist = trainHalfLength + rampLength;
          const rampEndDist = trainHalfLength;

          if (distZ >= rampEndDist && distZ <= rampStartDist) {
            const climbProgress = 1.0 - ((distZ - rampEndDist) / rampLength);
            targetGround = Math.max(targetGround, climbProgress * trainTopY);
          } else if (distZ >= -trainHalfLength && distZ < rampEndDist) {
            targetGround = Math.max(targetGround, trainTopY);
          }
        } else {
          if (distZ > 0 && distZ < 26.0) {
            this.switchLaneAvoidance();
          } else if (Math.abs(distZ) <= trainHalfLength + 2.0) {
            this.switchLaneAvoidance();
          }
        }
      }
      // 2. Slide Gate Handling
      else if (obs.type === "laser_gate") {
        if (distZ > -2.0 && distZ < 20.0) {
          this.slide();
        }
      }
      // 3. Jump Hurdle Handling
      else if (obs.type === "hurdle") {
        if (distZ > 0.5 && distZ < 14.0 && this.isGrounded && this.state !== "jumping") {
          this.jump();
        }
      }
    }

    this.groundElevation = targetGround;
  }

  switchLaneAvoidance() {
    if (this.laneSwitchCooldown > 0) return;
    this.laneSwitchCooldown = 0.85;
    const offset = Math.random() < 0.5 ? 1 : 2;
    this.laneIndex = (this.laneIndex + offset) % 3;
    this.targetX = CONFIG.LANES[this.laneIndex];
  }

  jump() {
    if (!this.isGrounded) return;
    this.isGrounded = false;
    this.velocityY = CONFIG.JUMP_VELOCITY * 0.95;
    this.state = "jumping";
  }

  slide() {
    this.state = "sliding";
    this.slideTimer = CONFIG.SLIDE_DURATION;
  }

  vacuumCoinsWithMagnet(collectibles, dt) {
    const magnetRadius = CONFIG.MONSTER_ROBOT ? CONFIG.MONSTER_ROBOT.COIN_MAGNET_RADIUS : 12.0;
    const eatRadius = CONFIG.MONSTER_ROBOT ? CONFIG.MONSTER_ROBOT.COIN_EAT_RADIUS : 3.2;
    const botPos = this.position;
    const vortexCenterY = botPos.y + 2.0;

    for (let i = 0; i < collectibles.length; i++) {
      const item = collectibles[i];
      if (!item || !item.itemRef || item.itemRef.userData.collected || !item.itemRef.visible) continue;
      if (item.type !== "coin") continue;

      const itemPos = item.worldPos;
      const dist = Math.hypot(itemPos.x - botPos.x, itemPos.y - vortexCenterY, itemPos.z - botPos.z);

      if (dist < magnetRadius) {
        _tempVec.set(botPos.x, vortexCenterY, botPos.z);
        _dir.subVectors(_tempVec, itemPos).normalize();
        item.itemRef.position.addScaledVector(_dir, 38.0 * dt);

        if (item.chunkRoot) {
          _chunkOffset.set(0, 0, item.chunkRoot.position.z);
          itemPos.copy(item.itemRef.position).add(_chunkOffset);
        }
      }

      if (dist < eatRadius) {
        item.itemRef.userData.collected = true;
        item.itemRef.visible = false;

        if (this.parts.vacuumCore) {
          this.parts.vacuumCore.scale.set(1.4, 1.4, 1.4);
          setTimeout(() => {
            if (this.parts.vacuumCore) this.parts.vacuumCore.scale.set(1, 1, 1);
          }, 80);
        }
      }
    }
  }

  animate(dt, speedRatio = 1.0) {
    const time = performance.now() * 0.001;
    const { hips, torso, head, leftArm, rightArm, leftLeg, rightLeg, vacuumCore } = this.parts;

    if (vacuumCore) {
      vacuumCore.rotation.z += 12.0 * dt;
    }

    if (this.state === "sliding") {
      hips.position.y = THREE.MathUtils.lerp(hips.position.y, 0.45, 0.25);
      hips.rotation.x = THREE.MathUtils.lerp(hips.rotation.x, -0.65, 0.25);
      torso.rotation.x = THREE.MathUtils.lerp(torso.rotation.x, 0.4, 0.25);
      leftLeg.legRoot.rotation.x = -1.1;
      rightLeg.legRoot.rotation.x = -0.9;
      leftArm.armRoot.rotation.x = 0.6;
      rightArm.armRoot.rotation.x = 0.6;
      return;
    }

    if (this.state === "jumping") {
      hips.position.y = THREE.MathUtils.lerp(hips.position.y, 1.35, 0.2);
      hips.rotation.x = THREE.MathUtils.lerp(hips.rotation.x, -0.25, 0.2);
      leftLeg.legRoot.rotation.x = 0.75;
      rightLeg.legRoot.rotation.x = -0.55;
      leftArm.armRoot.rotation.x = -1.2;
      rightArm.armRoot.rotation.x = -1.2;
      return;
    }

    hips.position.y = 1.35 + Math.abs(Math.sin(time * 14 * speedRatio)) * 0.14;
    hips.rotation.x = 0;
    torso.rotation.x = 0.12;

    const runCycle = Math.sin(time * 14 * speedRatio);
    leftLeg.legRoot.rotation.x = runCycle * 0.95;
    rightLeg.legRoot.rotation.x = -runCycle * 0.95;
    leftLeg.knee.rotation.x = Math.max(0, -runCycle * 0.85);
    rightLeg.knee.rotation.x = Math.max(0, runCycle * 0.85);

    leftArm.armRoot.rotation.x = -runCycle * 0.9;
    rightArm.armRoot.rotation.x = runCycle * 0.9;

    head.rotation.y = Math.sin(time * 6) * 0.12;
  }
}
