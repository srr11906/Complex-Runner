/**
 * PRABHAS: KASI 2898 AD (3D Runner - AAA Next-Gen)
 * Authentic 3D Sculpted Bhairava Model with Flowing Duster Cloak, Kantha Armor, Red Crest & Bujji Drone
 * True Movie Likeness matching 'Bhairava outfit.jpg', 'Bhairava and Bujji look.jpg' and 'World and complex in background.webp'
 */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { CONFIG } from "../config.js";
import { textureGen } from "../world/textureGenerator.js";

export class BhairavaModel {
  constructor() {
    this.root = new THREE.Group();
    this.parts = {};
    this.cloakSegments = [];
    this.bootThrusters = [];
    this.thrusterFlames = [];
    this.innerFlames = [];
    this.shockRings = [];
    this.thrusterLight = null;
    this.buildModel();
  }

  buildModel() {
    // 1. High-Fidelity Photorealistic PBR Materials with Tactile Micro-Detail Bump Maps
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xB8805A, // Balanced, natural cinematic warm Indian skin tone (calibrated)
      roughness: 0.52,
      metalness: 0.08
    });

    const beardMat = new THREE.MeshStandardMaterial({
      color: 0x14100E,
      roughness: 0.85,
      metalness: 0.05
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x120E0C,
      roughness: 0.75,
      metalness: 0.08
    });

    const clothBump = textureGen.getClothBumpMap();

    const vestMat = new THREE.MeshStandardMaterial({
      color: 0x5C4A3A, // Balanced Scavenger Khaki / Sand
      roughness: 0.72,
      metalness: 0.10,
      bumpMap: clothBump,
      bumpScale: 0.03
    });

    const kanthaArmorMat = new THREE.MeshStandardMaterial({
      color: 0x2A231E, // Dark Kantha Armor Plating
      roughness: 0.55,
      metalness: 0.38
    });

    const redInsigniaMat = new THREE.MeshBasicMaterial({
      color: 0xEF4444 // Iconic Red Y-Collar Emblem
    });

    const bronzeTrimMat = new THREE.MeshStandardMaterial({
      color: 0xD9982E, // Warm Antique Brass / Gold Buckles
      roughness: 0.26,
      metalness: 0.88
    });

    const cyberGauntletMat = new THREE.MeshStandardMaterial({
      color: 0x242C38,
      map: textureGen.getCyberGauntletTexture(),
      roughness: 0.25,
      metalness: 0.90
    });

    const cyanCellMat = new THREE.MeshBasicMaterial({
      color: 0x00E5FF // Glowing Teal/Cyan Gauntlet Energy Cell
    });

    const dusterCloakMat = new THREE.MeshStandardMaterial({
      color: 0x3E3228, // Balanced Scavenger Duster Trench Coat
      roughness: 0.78,
      metalness: 0.08,
      bumpMap: clothBump,
      bumpScale: 0.04,
      side: THREE.DoubleSide
    });

    const pantsMat = new THREE.MeshStandardMaterial({
      color: 0x2A2A32, // Balanced Tactical Combat Pants
      roughness: 0.80,
      metalness: 0.06,
      bumpMap: clothBump,
      bumpScale: 0.02
    });

    const bootMat = new THREE.MeshStandardMaterial({
      color: 0x1A1715,
      roughness: 0.55,
      metalness: 0.40
    });

    const darkTitaniumMat = new THREE.MeshStandardMaterial({
      color: 0x0F172A,
      roughness: 0.3,
      metalness: 0.95
    });

    const plasmaFlameMat = new THREE.MeshBasicMaterial({
      color: 0x00E5FF,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    });

    const thermalCoreMat = new THREE.MeshBasicMaterial({
      color: 0xFFFDF0,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide
    });

    const shockRingMat = new THREE.MeshBasicMaterial({
      color: 0x38BDF8,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });

    // 2. Root Hips & Pelvis
    const hips = new THREE.Group();
    hips.position.y = 0.95;
    this.root.add(hips);
    this.parts.hips = hips;

    const pelvis = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.21, 0.22, 20),
      pantsMat
    );
    pelvis.castShadow = true;
    hips.add(pelvis);

    // Scavenger Utility Belt & Brass Buckle
    const belt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.255, 0.255, 0.08, 20),
      vestMat
    );
    belt.position.y = 0.08;
    hips.add(belt);

    const buckle = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.08, 0.04),
      bronzeTrimMat
    );
    buckle.position.set(0, 0.08, 0.24);
    hips.add(buckle);

    // Side Holster & Scavenger Pouches
    for (let p of [-0.23, 0.23]) {
      const pouch = new THREE.Mesh(
        new THREE.BoxGeometry(0.09, 0.12, 0.07),
        vestMat
      );
      pouch.position.set(p, 0.06, 0.08);
      hips.add(pouch);
    }

    // 3. Torso (Sculpted Kantha Armor & Khaki Vest)
    const torso = new THREE.Group();
    torso.position.y = 0.11;
    hips.add(torso);
    this.parts.torso = torso;

    // Muscular Chest Core
    const chestCore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.33, 0.25, 0.52, 20),
      kanthaArmorMat
    );
    chestCore.position.y = 0.26;
    chestCore.castShadow = true;
    torso.add(chestCore);

    // Iconic Red V/Y-Chevron Collar Crest (Matching Movie Reference)
    const redChevronLeft = new THREE.Mesh(
      new THREE.BoxGeometry(0.035, 0.14, 0.02),
      redInsigniaMat
    );
    redChevronLeft.rotation.z = -0.45;
    redChevronLeft.position.set(-0.04, 0.44, 0.26);
    torso.add(redChevronLeft);

    const redChevronRight = new THREE.Mesh(
      new THREE.BoxGeometry(0.035, 0.14, 0.02),
      redInsigniaMat
    );
    redChevronRight.rotation.z = 0.45;
    redChevronRight.position.set(0.04, 0.44, 0.26);
    torso.add(redChevronRight);

    // Sculpted Khaki Vest Overlayer
    const vestBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.27, 0.48, 20),
      vestMat
    );
    vestBody.position.y = 0.25;
    vestBody.castShadow = true;
    torso.add(vestBody);

    // Diagonal Scavenger Bandolier Strap & Brass Ammo Nodes
    const bandolier = new THREE.Mesh(
      new THREE.CylinderGeometry(0.36, 0.28, 0.06, 20),
      vestMat
    );
    bandolier.rotation.z = 0.45;
    bandolier.position.set(0, 0.26, 0.02);
    torso.add(bandolier);

    for (let c of [-0.1, 0.0, 0.1]) {
      const cartridge = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.08, 8),
        bronzeTrimMat
      );
      cartridge.position.set(c * 1.2, 0.26 + c * 0.4, 0.28);
      torso.add(cartridge);
    }

    // Shoulder Pauldrons / Heavy Straps
    for (let side of [-1, 1]) {
      const strap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.32, 16),
        vestMat
      );
      strap.rotation.z = side * 0.45;
      strap.position.set(side * 0.3, 0.46, 0);
      torso.add(strap);
    }

    // =========================================================================
    // FLOWING TACTICAL DUSTER CLOAK / TRENCH COAT (Matching Movie Reference)
    // =========================================================================
    const cloakGroup = new THREE.Group();
    cloakGroup.position.set(0, 0.46, -0.15);
    torso.add(cloakGroup);
    this.parts.cloak = cloakGroup;

    // 3 Segmented Flowing Panels that ripple in the wind
    for (let i = 0; i < 3; i++) {
      const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(0.24, 0.85, 4, 6),
        dusterCloakMat
      );
      panel.position.set((i - 1) * 0.16, -0.42, 0);
      panel.castShadow = true;
      cloakGroup.add(panel);
      this.cloakSegments.push(panel);
    }

    // 4. Sculpted Head & Top-Knot Hair Bun (Restored from commit b6f725cf8c3169730ebde6fed393133617044a0d)
    const headGroup = new THREE.Group();
    headGroup.position.y = 0.56;
    torso.add(headGroup);
    this.parts.head = headGroup;

    // Muscular Neck
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.15, 0.14, 16),
      skinMat
    );
    neck.position.y = 0.07;
    headGroup.add(neck);

    // Sculpted Head / Jawline
    const headMesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.17, 0.15, 12, 20),
      skinMat
    );
    headMesh.position.y = 0.23;
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // Sculpted Beard & Mustache (Prabhas signature look)
    const beard = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.12, 0.14),
      beardMat
    );
    beard.position.set(0, 0.14, 0.11);
    headGroup.add(beard);

    const mustache = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.04, 0.08),
      beardMat
    );
    mustache.position.set(0, 0.21, 0.16);
    headGroup.add(mustache);

    // Layered Hair & Top-Knot Man-Bun
    const hairCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.185, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.56),
      hairMat
    );
    hairCap.position.y = 0.25;
    headGroup.add(hairCap);

    const manBun = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 16, 16),
      hairMat
    );
    manBun.position.set(0, 0.39, -0.07);
    headGroup.add(manBun);

    const hairTie = new THREE.Mesh(
      new THREE.TorusGeometry(0.08, 0.02, 10, 20),
      bronzeTrimMat
    );
    hairTie.position.set(0, 0.37, -0.07);
    hairTie.rotation.x = Math.PI / 4;
    headGroup.add(hairTie);

    // 5. Left Arm (Kantha Armored Bracer & Wraps)
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.36, 0.44, 0);
    torso.add(leftArm);
    this.parts.leftArm = leftArm;

    // Anatomical Shoulder Deltoid & Socket Cap (Zero seams/gaps on rotation)
    const leftShoulderBall = new THREE.Mesh(
      new THREE.SphereGeometry(0.108, 16, 16),
      vestMat
    );
    leftShoulderBall.position.set(0, 0, 0);
    leftShoulderBall.castShadow = true;
    leftArm.add(leftShoulderBall);

    const leftShoulderCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.115, 0.105, 0.08, 16),
      kanthaArmorMat
    );
    leftShoulderCap.position.set(0, -0.02, 0);
    leftShoulderCap.castShadow = true;
    leftArm.add(leftShoulderCap);

    // Upper Arm / Muscular Bicep
    const leftBicep = new THREE.Mesh(
      new THREE.CylinderGeometry(0.098, 0.088, 0.28, 16),
      skinMat
    );
    leftBicep.position.y = -0.15;
    leftBicep.castShadow = true;
    leftArm.add(leftBicep);

    // Seamless Elbow Joint
    const leftElbow = new THREE.Mesh(
      new THREE.SphereGeometry(0.090, 14, 14),
      skinMat
    );
    leftElbow.position.y = -0.29;
    leftElbow.castShadow = true;
    leftArm.add(leftElbow);

    // Forearm / Kantha Bracer
    const leftGauntlet = new THREE.Mesh(
      new THREE.CylinderGeometry(0.096, 0.086, 0.26, 16),
      vestMat
    );
    leftGauntlet.position.y = -0.42;
    leftGauntlet.castShadow = true;
    leftArm.add(leftGauntlet);

    // Decorative Antique Bronze Bracer Rings
    for (let r of [-0.32, -0.51]) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.088, 0.012, 8, 16),
        bronzeTrimMat
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = r;
      leftArm.add(ring);
    }

    // Wrist Joint & Sculpted Hand
    const leftWrist = new THREE.Mesh(
      new THREE.CylinderGeometry(0.086, 0.082, 0.06, 16),
      bronzeTrimMat
    );
    leftWrist.position.y = -0.54;
    leftWrist.castShadow = true;
    leftArm.add(leftWrist);

    const leftHand = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 14, 14),
      skinMat
    );
    leftHand.position.y = -0.59;
    leftHand.castShadow = true;
    leftArm.add(leftHand);

    const leftThumb = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.024, 0.045, 8, 8),
      skinMat
    );
    leftThumb.position.set(-0.045, -0.57, 0.035);
    leftThumb.rotation.z = -0.35;
    leftArm.add(leftThumb);

    // 6. Right Arm (Cybernetic Laser Gauntlet with Glowing Power Cell)
    const rightArm = new THREE.Group();
    rightArm.position.set(0.36, 0.44, 0);
    torso.add(rightArm);
    this.parts.rightArm = rightArm;

    // Anatomical Shoulder Deltoid & Socket Cap (Zero seams/gaps on rotation)
    const rightShoulderBall = new THREE.Mesh(
      new THREE.SphereGeometry(0.108, 16, 16),
      vestMat
    );
    rightShoulderBall.position.set(0, 0, 0);
    rightShoulderBall.castShadow = true;
    rightArm.add(rightShoulderBall);

    const rightShoulderCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.115, 0.105, 0.08, 16),
      kanthaArmorMat
    );
    rightShoulderCap.position.set(0, -0.02, 0);
    rightShoulderCap.castShadow = true;
    rightArm.add(rightShoulderCap);

    // Upper Arm / Muscular Bicep
    const rightBicep = new THREE.Mesh(
      new THREE.CylinderGeometry(0.098, 0.088, 0.28, 16),
      skinMat
    );
    rightBicep.position.y = -0.15;
    rightBicep.castShadow = true;
    rightArm.add(rightBicep);

    // Seamless Elbow Joint
    const rightElbow = new THREE.Mesh(
      new THREE.SphereGeometry(0.092, 14, 14),
      darkTitaniumMat
    );
    rightElbow.position.y = -0.29;
    rightElbow.castShadow = true;
    rightArm.add(rightElbow);

    // Cybernetic Gauntlet Forearm
    const rightGauntlet = new THREE.Mesh(
      new THREE.CylinderGeometry(0.108, 0.095, 0.26, 16),
      cyberGauntletMat
    );
    rightGauntlet.position.y = -0.42;
    rightGauntlet.castShadow = true;
    rightArm.add(rightGauntlet);

    // Glowing Teal/Cyan Power Cell on Gauntlet
    const rightCell = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.16, 0.04),
      cyanCellMat
    );
    rightCell.position.set(0.08, -0.42, 0.06);
    rightArm.add(rightCell);

    for (let r of [-0.34, -0.42, -0.50]) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.095, 0.012, 8, 16),
        new THREE.MeshBasicMaterial({ color: 0x00E5FF })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = r;
      rightArm.add(ring);
    }

    // Wrist Joint & Cybernetic Hand Fist
    const rightWrist = new THREE.Mesh(
      new THREE.CylinderGeometry(0.095, 0.092, 0.06, 16),
      cyberGauntletMat
    );
    rightWrist.position.y = -0.54;
    rightWrist.castShadow = true;
    rightArm.add(rightWrist);

    const rightHand = new THREE.Mesh(
      new THREE.BoxGeometry(0.085, 0.10, 0.095),
      cyberGauntletMat
    );
    rightHand.position.y = -0.59;
    rightHand.castShadow = true;
    rightArm.add(rightHand);

    const rightThumb = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.024, 0.045, 8, 8),
      cyberGauntletMat
    );
    rightThumb.position.set(0.045, -0.57, 0.035);
    rightThumb.rotation.z = 0.35;
    rightArm.add(rightThumb);

    // 7. Legs & Heavy Combat Boots with Integrated Jet Thrusters
    const legSides = [
      { name: "leftLeg", posX: -0.16 },
      { name: "rightLeg", posX: 0.16 }
    ];

    legSides.forEach((legData) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(legData.posX, -0.08, 0);
      hips.add(legGroup);
      this.parts[legData.name] = legGroup;

      const thigh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.125, 0.105, 0.4, 16),
        pantsMat
      );
      thigh.position.y = -0.2;
      thigh.castShadow = true;
      legGroup.add(thigh);

      const knee = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.12, 0.06),
        kanthaArmorMat
      );
      knee.position.set(0, -0.38, 0.08);
      legGroup.add(knee);

      const calf = new THREE.Mesh(
        new THREE.CylinderGeometry(0.105, 0.09, 0.36, 16),
        bootMat
      );
      calf.position.y = -0.56;
      calf.castShadow = true;
      legGroup.add(calf);

      const foot = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.1, 0.28),
        bootMat
      );
      foot.position.set(0, -0.74, 0.06);
      foot.castShadow = true;
      legGroup.add(foot);

      // Embedded Shoe Jet Thrusters
      const bootThrusterGroup = new THREE.Group();
      bootThrusterGroup.position.set(0, -0.79, 0.04);
      bootThrusterGroup.visible = false;
      legGroup.add(bootThrusterGroup);
      this.bootThrusters.push(bootThrusterGroup);

      const nozzle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.075, 0.09, 0.08, 16),
        darkTitaniumMat
      );
      nozzle.position.y = 0.02;
      bootThrusterGroup.add(nozzle);

      const trim = new THREE.Mesh(
        new THREE.TorusGeometry(0.08, 0.015, 8, 16),
        plasmaFlameMat
      );
      trim.rotation.x = Math.PI / 2;
      trim.position.y = 0.04;
      bootThrusterGroup.add(trim);

      // 0.4m Streamlined Plume
      const outerFlame = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.40, 16),
        plasmaFlameMat
      );
      outerFlame.rotation.x = Math.PI;
      outerFlame.position.y = -0.20;
      bootThrusterGroup.add(outerFlame);
      this.thrusterFlames.push(outerFlame);

      const innerFlame = new THREE.Mesh(
        new THREE.ConeGeometry(0.045, 0.28, 12),
        thermalCoreMat
      );
      innerFlame.rotation.x = Math.PI;
      innerFlame.position.y = -0.14;
      bootThrusterGroup.add(innerFlame);
      this.innerFlames.push(innerFlame);

      for (let yOffset of [-0.10, -0.20, -0.30]) {
        const shockRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.065 + yOffset * -0.04, 0.008, 8, 16),
          shockRingMat
        );
        shockRing.rotation.x = Math.PI / 2;
        shockRing.position.y = yOffset;
        bootThrusterGroup.add(shockRing);
        this.shockRings.push(shockRing);
      }
    });

    this.thrusterLight = new THREE.PointLight(0x00E5FF, 0, 12);
    this.thrusterLight.position.set(0, -0.5, 0);
    hips.add(this.thrusterLight);

    this.root.traverse((child) => {
      if (child.isMesh && !child.material.transparent) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }

  updateAnimation(state, time, speedRatio = 1.0, isJetpack = false, shootTimer = 0) {
    const { hips, torso, head, leftArm, rightArm, leftLeg, rightLeg, cloak } = this.parts;

    // Flowing Duster Cloak Physics (Wind flutter)
    if (cloak) {
      cloak.rotation.x = THREE.MathUtils.lerp(cloak.rotation.x, -0.35 - (speedRatio * 0.4), 0.2);
      this.cloakSegments.forEach((seg, idx) => {
        seg.rotation.y = Math.sin(time * 18 + idx) * 0.08;
      });
    }

    // Toggle and animate shoe thruster boosters
    if (isJetpack) {
      this.bootThrusters.forEach((bt) => (bt.visible = true));
      if (this.thrusterLight) this.thrusterLight.intensity = 3.5 + Math.random() * 1.5;

      const flickerY = 1.0 + Math.random() * 0.35 + Math.sin(time * 24) * 0.15;
      const flickerXZ = 0.95 + Math.random() * 0.2;

      this.thrusterFlames.forEach((flame) => flame.scale.set(flickerXZ, flickerY, flickerXZ));
      this.innerFlames.forEach((inner) => inner.scale.set(flickerXZ * 0.9, flickerY * 0.95, flickerXZ * 0.9));

      hips.position.y = 0.95;
      hips.rotation.x = THREE.MathUtils.lerp(hips.rotation.x, -0.62, 0.15);
      torso.rotation.x = THREE.MathUtils.lerp(torso.rotation.x, 0.12, 0.15);
      leftLeg.rotation.x = THREE.MathUtils.lerp(leftLeg.rotation.x, 0.45, 0.15);
      rightLeg.rotation.x = THREE.MathUtils.lerp(rightLeg.rotation.x, 0.55, 0.15);
      leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, -1.35, 0.15);
      rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, -1.35, 0.15);
      return;
    }

    this.bootThrusters.forEach((bt) => (bt.visible = false));
    if (this.thrusterLight) this.thrusterLight.intensity = 0;

    if (state === "sliding") {
      hips.position.y = THREE.MathUtils.lerp(hips.position.y, 0.32, 0.25);
      hips.rotation.x = THREE.MathUtils.lerp(hips.rotation.x, -0.75, 0.25);
      torso.rotation.x = THREE.MathUtils.lerp(torso.rotation.x, 0.35, 0.25);
      leftLeg.rotation.x = THREE.MathUtils.lerp(leftLeg.rotation.x, -1.15, 0.25);
      rightLeg.rotation.x = THREE.MathUtils.lerp(rightLeg.rotation.x, -0.95, 0.25);
      leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, 0.65, 0.25);
      if (shootTimer > 0) {
        rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, -Math.PI / 2, 0.45);
        rightArm.rotation.y = THREE.MathUtils.lerp(rightArm.rotation.y, -0.12, 0.4);
        rightArm.rotation.z = THREE.MathUtils.lerp(rightArm.rotation.z, 0.08, 0.4);
      } else {
        rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, 0.65, 0.25);
      }
      return;
    }

    if (state === "jumping") {
      hips.position.y = THREE.MathUtils.lerp(hips.position.y, 0.95, 0.2);
      hips.rotation.x = THREE.MathUtils.lerp(hips.rotation.x, -0.28, 0.2);
      leftLeg.rotation.x = THREE.MathUtils.lerp(leftLeg.rotation.x, 0.85, 0.2);
      rightLeg.rotation.x = THREE.MathUtils.lerp(rightLeg.rotation.x, -0.65, 0.2);
      leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, -1.45, 0.2);
      if (shootTimer > 0) {
        rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, -Math.PI / 2, 0.45);
        rightArm.rotation.y = THREE.MathUtils.lerp(rightArm.rotation.y, -0.12, 0.4);
        rightArm.rotation.z = THREE.MathUtils.lerp(rightArm.rotation.z, 0.08, 0.4);
      } else {
        rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, 0.85, 0.2);
      }
      return;
    }

    // High-energy athletic running loop
    hips.position.y = THREE.MathUtils.lerp(hips.position.y, 0.95 + Math.abs(Math.sin(time * 16 * speedRatio)) * 0.09, 0.25);
    hips.rotation.x = 0;
    torso.rotation.x = 0.14;

    const runCycle = Math.sin(time * 16 * speedRatio);
    leftLeg.rotation.x = runCycle * 0.98;
    rightLeg.rotation.x = -runCycle * 0.98;
    leftArm.rotation.x = -runCycle * 0.88;
    leftArm.rotation.y = THREE.MathUtils.lerp(leftArm.rotation.y, 0, 0.2);
    leftArm.rotation.z = THREE.MathUtils.lerp(leftArm.rotation.z, 0, 0.2);
    head.rotation.y = Math.sin(time * 8 * speedRatio) * 0.06;

    // Right Arm: Chest-Level Laser Shoot Override
    if (shootTimer > 0) {
      const shootProgress = shootTimer / 0.24;
      rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, -Math.PI / 2, 0.45); 
      rightArm.rotation.y = THREE.MathUtils.lerp(rightArm.rotation.y, -0.12, 0.4);
      rightArm.rotation.z = THREE.MathUtils.lerp(rightArm.rotation.z, 0.08, 0.4);
      torso.rotation.x -= 0.05 * shootProgress; // Slight tactical recoil
    } else {
      rightArm.rotation.x = runCycle * 0.88;
      rightArm.rotation.y = THREE.MathUtils.lerp(rightArm.rotation.y, 0, 0.2);
      rightArm.rotation.z = THREE.MathUtils.lerp(rightArm.rotation.z, 0, 0.2);
    }
  }
}
