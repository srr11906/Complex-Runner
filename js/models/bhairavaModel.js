/**
 * COMPLEX RUNNER - Next-Gen 3D Sci-Fi Runner
 * Authentic Heroic Bhairava 3D Character Model (Prabhas - Kalki 2898 AD)
 * Features:
 *  - Commanding 1.94m athletic hero stature with broad masculine V-taper shoulders and long runner legs
 *  - Sculpted organic procedural anatomy (ZERO box geometries across the entire character)
 *  - Proud athletic neck (height 0.16m) cleanly rising from popped collar with sternocleidomastoid bands & Adam's apple
 *  - Iconic Kalki 2898 AD Prabhas hairstyle: thick, luscious, full-volume wavy swept-back hair with layered crown crest,
 *    temporal side locks, full nape cascade & casual parted brow lock (ZERO bald spots, ZERO ponytail/man-bun)
 *  - Form-fitting tactical runner vest with Kantha armor chest plates, flush crimson chevron & pop collar
 *  - Billowing dynamic duster scarf / jacket tails with real-time aerodynamic flutter
 *  - Asymmetric left arm with rolled sleeve, sculpted organic hand & fingerless glove
 *  - Bujji cybernetic gauntlet on right arm with glowing cyan longitudinal power cell, triple conduit rings & wrist blaster
 *  - Athletic jogger pants with curved knee armor guards
 *  - Aerodynamic high-top runner sneakers with contoured rubber soles, rounded toe caps, padded tongue & heel rocket thrusters
 *  - Full kinematic animation suite: double-bounce sprint gait, tucked spring jump, banked power slide, superhero flight
 */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { CONFIG } from "../config.js?v=20261108_hardened_v84";
import { textureGen } from "../world/textureGenerator.js?v=20261108_hardened_v84";

export class BhairavaModel {
  constructor() {
    this.root = new THREE.Group();
    this.parts = {};
    this.cloakSegments = [];
    this.bootThrusters = [];
    this.thrusterFlames = [];
    this.innerFlames = [];
    this.shockRings = [];
    this._bootThrustersVisible = false;
    this.outfitTheme = "wasteland";

    // Proportional Base Heights (Commanding 1.94m Athletic Stature)
    this.baseHipsY = 1.08;

    this.buildModel();
  }

  buildModel() {
    const clothBump = textureGen.getClothBumpMap();

    // 1. High-Fidelity PBR Materials
    this.materials = {
      // Warm masculine Indian skin tone with healthy specular sheen
      skinMat: new THREE.MeshStandardMaterial({
        color: 0xB57B56,
        roughness: 0.44,
        metalness: 0.05
      }),
      lipMat: new THREE.MeshStandardMaterial({
        color: 0x985842,
        roughness: 0.40,
        metalness: 0.04
      }),
      beardMat: new THREE.MeshStandardMaterial({
        color: 0x14100D,
        roughness: 0.80,
        metalness: 0.04
      }),
      hairMat: new THREE.MeshStandardMaterial({
        color: 0x14100D,
        roughness: 0.55,
        metalness: 0.10
      }),
      eyeWhiteMat: new THREE.MeshStandardMaterial({
        color: 0xF8FAFC,
        roughness: 0.18,
        metalness: 0.05
      }),
      eyeIrisMat: new THREE.MeshStandardMaterial({
        color: 0x3E2415,
        roughness: 0.25,
        metalness: 0.10
      }),
      eyePupilMat: new THREE.MeshBasicMaterial({
        color: 0x0A0604
      }),
      eyeGlintMat: new THREE.MeshBasicMaterial({
        color: 0xFFFFFF
      }),
      headbandMat: new THREE.MeshStandardMaterial({
        color: 0x2A241E,
        roughness: 0.78,
        metalness: 0.10,
        bumpMap: clothBump,
        bumpScale: 0.02
      }),
      // Tactical sleeveless runner vest (athletic charcoal/khaki)
      vestMat: new THREE.MeshStandardMaterial({
        color: 0x48392B,
        roughness: 0.65,
        metalness: 0.15,
        bumpMap: clothBump,
        bumpScale: 0.03
      }),
      vestTrimMat: new THREE.MeshStandardMaterial({
        color: 0x282018,
        roughness: 0.58,
        metalness: 0.22
      }),
      kanthaArmorMat: new THREE.MeshStandardMaterial({
        color: 0x241D17,
        roughness: 0.36,
        metalness: 0.72
      }),
      redInsigniaMat: new THREE.MeshBasicMaterial({
        color: 0xEF4444
      }),
      bronzeTrimMat: new THREE.MeshStandardMaterial({
        color: 0xD9982E,
        roughness: 0.24,
        metalness: 0.92
      }),
      // Bujji cybernetic gauntlet
      cyberGauntletMat: new THREE.MeshStandardMaterial({
        color: 0x1A202A,
        map: textureGen.getCyberGauntletTexture(),
        roughness: 0.18,
        metalness: 0.95
      }),
      gauntletMaroonMat: new THREE.MeshStandardMaterial({
        color: 0x6E1818,
        roughness: 0.22,
        metalness: 0.88
      }),
      cyanCellMat: new THREE.MeshBasicMaterial({
        color: 0x00E5FF
      }),
      // Dynamic runner jacket tails / duster scarf
      dusterCloakMat: new THREE.MeshStandardMaterial({
        color: 0x382C22,
        roughness: 0.72,
        metalness: 0.10,
        bumpMap: clothBump,
        bumpScale: 0.03,
        side: THREE.DoubleSide
      }),
      // Cuffed tactical cargo joggers
      pantsMat: new THREE.MeshStandardMaterial({
        color: 0x1C1C1C,
        roughness: 0.88,
        metalness: 0.0,
        bumpMap: clothBump,
        bumpScale: 0.02
      }),
      // High-top runner sneaker materials
      sneakerUpperMat: new THREE.MeshStandardMaterial({
        color: 0x181614,
        roughness: 0.42,
        metalness: 0.38
      }),
      sneakerSoleMat: new THREE.MeshStandardMaterial({
        color: 0xE8ECF0,
        roughness: 0.32,
        metalness: 0.08
      }),
      sneakerAccentMat: new THREE.MeshStandardMaterial({
        color: 0xD9982E,
        roughness: 0.28,
        metalness: 0.82
      }),
      darkTitaniumMat: new THREE.MeshStandardMaterial({
        color: 0x0E1420,
        roughness: 0.20,
        metalness: 0.96
      }),
      plasmaFlameMat: new THREE.MeshBasicMaterial({
        color: 0x00E5FF,
        transparent: true,
        opacity: 0.88,
        side: THREE.DoubleSide
      }),
      thermalCoreMat: new THREE.MeshBasicMaterial({
        color: 0xFFFDF0,
        transparent: true,
        opacity: 0.96,
        side: THREE.DoubleSide
      }),
      shockRingMat: new THREE.MeshBasicMaterial({
        color: 0x38BDF8,
        transparent: true,
        opacity: 0.92,
        side: THREE.DoubleSide
      })
    };

    const m = this.materials;

    // =========================================================================
    // 2. PELVIS / HIPS (Heroic Athletic Stance at y = 1.08)
    // =========================================================================
    const hips = new THREE.Group();
    hips.position.y = this.baseHipsY;
    this.root.add(hips);
    this.parts.hips = hips;

    // Muscular Pelvis Core
    const pelvis = new THREE.Mesh(
      new THREE.CylinderGeometry(0.245, 0.21, 0.26, 24),
      m.pantsMat
    );
    pelvis.position.y = 0;
    pelvis.castShadow = true;
    pelvis.receiveShadow = false;
    hips.add(pelvis);

    // Contoured Tactical Utility Belt
    const belt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.258, 0.258, 0.08, 24),
      m.vestTrimMat
    );
    belt.position.y = 0.08;
    hips.add(belt);

    // Sleek Rounded Bronze Buckle
    const buckle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.052, 0.052, 0.03, 16),
      m.bronzeTrimMat
    );
    buckle.rotation.x = Math.PI / 2;
    buckle.position.set(0, 0.08, 0.258);
    hips.add(buckle);

    const buckleCore = new THREE.Mesh(
      new THREE.TorusGeometry(0.036, 0.007, 8, 16),
      m.darkTitaniumMat
    );
    buckleCore.position.set(0, 0.08, 0.272);
    hips.add(buckleCore);

    // Dual Ergonomic Tactical Pouches (Smooth Contoured Capsules)
    for (let side of [-0.23, 0.23]) {
      const pouch = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.038, 0.065, 12, 16),
        m.vestMat
      );
      pouch.position.set(side, 0.05, 0.06);
      pouch.rotation.z = side * 0.12;
      hips.add(pouch);

      const latch = new THREE.Mesh(
        new THREE.SphereGeometry(0.012, 8, 8),
        m.bronzeTrimMat
      );
      latch.position.set(side, 0.07, 0.10);
      hips.add(latch);
    }

    // Rear Tech Pack (Smooth Contoured Power Capsule)
    const rearPack = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.048, 0.13, 12, 16),
      m.kanthaArmorMat
    );
    rearPack.rotation.z = Math.PI / 2;
    rearPack.position.set(0, 0.05, -0.215);
    hips.add(rearPack);

    // Aerodynamic Slide Wind Streaks (Trailing Cyan Ribbons)
    this.slideWindStreaks = new THREE.Group();
    this.slideWindStreaks.visible = false;
    const windGeo = new THREE.ConeGeometry(0.045, 1.45, 8, 1, true);
    const windMat = new THREE.MeshBasicMaterial({
      color: 0x00E5FF,
      transparent: true,
      opacity: 0.40,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    for (let s of [-0.26, 0.26]) {
      const streak = new THREE.Mesh(windGeo, windMat);
      streak.rotation.x = -Math.PI / 2;
      streak.position.set(s, -0.16, -0.85);
      this.slideWindStreaks.add(streak);
    }
    hips.add(this.slideWindStreaks);

    // =========================================================================
    // 3. TORSO (Broad Masculine V-Taper Heroic Silhouette)
    // =========================================================================
    const torso = new THREE.Group();
    torso.position.y = 0.12;
    hips.add(torso);
    this.parts.torso = torso;

    // Muscular V-Taper Core
    const chestCore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.23, 0.54, 24),
      m.kanthaArmorMat
    );
    chestCore.position.y = 0.27;
    chestCore.castShadow = true;
    torso.add(chestCore);

    // Anatomical Sculpted Pectoral Muscles (Curved Sliced Spheres - NO BOXES!)
    for (let s of [-0.10, 0.10]) {
      const pecGeo = new THREE.SphereGeometry(0.115, 20, 16);
      pecGeo.scale(1.16, 0.82, 0.45);
      const pec = new THREE.Mesh(pecGeo, m.kanthaArmorMat);
      pec.position.set(s, 0.37, 0.215);
      pec.rotation.y = s * 0.14;
      pec.rotation.z = -s * 0.08;
      torso.add(pec);
    }

    // Iconic Kalki V-Chevron Insignia (Curved Flush Angled Capsules)
    for (let s of [-1, 1]) {
      const chevron = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.015, 0.13, 8, 14),
        m.redInsigniaMat
      );
      chevron.rotation.z = s * 0.45;
      chevron.position.set(s * 0.048, 0.43, 0.265);
      torso.add(chevron);
    }

    // Form-Fitting Sleeveless Tactical Runner Vest
    const vestBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.335, 0.245, 0.50, 24, 1, true),
      m.vestMat
    );
    vestBody.position.y = 0.26;
    vestBody.castShadow = true;
    torso.add(vestBody);

    // Popped High Tactical Collar (Flanking Neck Base Seamlessly at y = 0.46)
    const popCollar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.20, 0.18, 0.08, 20, 1, true, -Math.PI * 0.72, Math.PI * 1.44),
      m.vestTrimMat
    );
    popCollar.position.set(0, 0.46, 0.01);
    torso.add(popCollar);

    // Draped Hood at Upper Back (Sculpted Torus Arc)
    const foldedHood = new THREE.Mesh(
      new THREE.TorusGeometry(0.14, 0.05, 12, 20, Math.PI * 0.90),
      m.vestMat
    );
    foldedHood.position.set(0, 0.42, -0.15);
    foldedHood.rotation.x = Math.PI * 0.42;
    torso.add(foldedHood);

    // Diagonal Scavenger Bandolier Strap
    const bandolier = new THREE.Mesh(
      new THREE.CylinderGeometry(0.342, 0.252, 0.055, 24, 1, true),
      m.vestTrimMat
    );
    bandolier.rotation.z = 0.48;
    bandolier.position.set(0, 0.27, 0.02);
    torso.add(bandolier);

    // Bronze Energy Cartridges
    for (let c of [-0.11, -0.01, 0.09]) {
      const cartridge = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.018, 0.08, 12),
        m.bronzeTrimMat
      );
      cartridge.position.set(c * 1.35, 0.27 + c * 0.45, 0.285);
      torso.add(cartridge);
    }

    // Dynamic Billowing Runner Scarf / Cloak Tails
    const cloakGroup = new THREE.Group();
    cloakGroup.position.set(0, 0.40, -0.16);
    torso.add(cloakGroup);
    this.parts.cloak = cloakGroup;

    for (let i = 0; i < 3; i++) {
      const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(0.20, 0.78, 4, 6),
        m.dusterCloakMat
      );
      panel.position.set((i - 1) * 0.14, -0.38, 0);
      panel.castShadow = true;
      cloakGroup.add(panel);
      this.cloakSegments.push(panel);
    }

    // =========================================================================
    // 4. HEROIC HEAD & PROUD MUSCULAR NECK (Prabhas - Kalki 2898 AD)
    // =========================================================================
    // HeadGroup sits proudly on torso (y = 0.50), with neck extending cleanly up out of the collar
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.50, 0);
    torso.add(headGroup);
    this.parts.head = headGroup;

    // Muscular Anatomical Neck (Lengthened to 0.20m for a proud, commanding warrior silhouette!)
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.116, 0.142, 0.20, 20),
      m.skinMat
    );
    neck.position.set(0, 0.100, 0.015);
    neck.rotation.x = 0.06;
    neck.castShadow = true;
    headGroup.add(neck);

    // Anatomical Sternocleidomastoid Neck Bands
    for (let s of [-0.046, 0.046]) {
      const scm = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.016, 0.13, 8, 12),
        m.skinMat
      );
      scm.position.set(s, 0.095, 0.060);
      scm.rotation.z = -s * 0.30;
      scm.rotation.x = 0.12;
      headGroup.add(scm);
    }

    // Subtle Adam's Apple Contour
    const adamsApple = new THREE.Mesh(
      new THREE.SphereGeometry(0.015, 8, 8),
      m.skinMat
    );
    adamsApple.position.set(0, 0.105, 0.082);
    headGroup.add(adamsApple);

    // Trapezius slope on back of neck (Connecting neck seamlessly to upper back)
    const trapBack = new THREE.Mesh(
      new THREE.CylinderGeometry(0.128, 0.160, 0.18, 16),
      m.skinMat
    );
    trapBack.position.set(0, 0.085, -0.040);
    trapBack.rotation.x = -0.12;
    headGroup.add(trapBack);

    // Elevated Cranium Group (Lifts head, face, and hair by +0.040m above lengthened neck)
    const craniumGroup = new THREE.Group();
    craniumGroup.position.set(0, 0.040, 0);
    headGroup.add(craniumGroup);

    // Heroic Sculpted Facial Cranium (Centered at y = 0.185, chin sits 0.14m above collar rim!)
    const headMesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.118, 0.115, 16, 24),
      m.skinMat
    );
    headMesh.position.set(0, 0.185, 0.020);
    headMesh.castShadow = true;
    craniumGroup.add(headMesh);

    // Defined Masculine Chin with subtle cleft contour
    const chin = new THREE.Mesh(
      new THREE.SphereGeometry(0.042, 16, 14),
      m.skinMat
    );
    chin.scale.set(1.15, 0.85, 0.98);
    chin.position.set(0, 0.100, 0.098);
    craniumGroup.add(chin);

    // Sculpted Jaw Angles (Connecting Ear to Chin with sharp athletic mandibular border)
    for (let s of [-1, 1]) {
      const jawAngle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.034, 0.042, 0.11, 12),
        m.skinMat
      );
      jawAngle.rotation.z = s * 0.50;
      jawAngle.rotation.y = s * 0.26;
      jawAngle.position.set(s * 0.080, 0.135, 0.042);
      craniumGroup.add(jawAngle);

      // Defined High Cheekbones (Malar Contour)
      const cheek = new THREE.Mesh(
        new THREE.SphereGeometry(0.034, 12, 12),
        m.skinMat
      );
      cheek.scale.set(1.15, 0.80, 0.50);
      cheek.position.set(s * 0.084, 0.175, 0.088);
      craniumGroup.add(cheek);

      // Sculpted Ears
      const ear = new THREE.Mesh(
        new THREE.TorusGeometry(0.028, 0.009, 8, 14, Math.PI * 1.15),
        m.skinMat
      );
      ear.rotation.y = s * 0.35;
      ear.position.set(s * 0.128, 0.190, 0.008);
      craniumGroup.add(ear);
    }

    // Straight Regal Nose Bridge & Tip
    const noseBridge = new THREE.Mesh(
      new THREE.CylinderGeometry(0.013, 0.018, 0.082, 12),
      m.skinMat
    );
    noseBridge.rotation.x = 0.20;
    noseBridge.position.set(0, 0.210, 0.138);
    craniumGroup.add(noseBridge);

    const noseTip = new THREE.Mesh(
      new THREE.SphereGeometry(0.017, 12, 12),
      m.skinMat
    );
    noseTip.position.set(0, 0.180, 0.155);
    craniumGroup.add(noseTip);

    // Expressive Almond Eyes & Confident Focused Brow
    for (let es of [-0.058, 0.058]) {
      // White Eye Sclera
      const eyeWhite = new THREE.Mesh(
        new THREE.SphereGeometry(0.030, 14, 14),
        m.eyeWhiteMat
      );
      eyeWhite.position.set(es, 0.205, 0.128);
      craniumGroup.add(eyeWhite);

      // Warm Hazel-Brown Iris
      const iris = new THREE.Mesh(
        new THREE.SphereGeometry(0.018, 12, 12),
        m.eyeIrisMat
      );
      iris.position.set(es, 0.205, 0.150);
      craniumGroup.add(iris);

      // Pupil & Specular Glint
      const pupil = new THREE.Mesh(
        new THREE.SphereGeometry(0.009, 8, 8),
        m.eyePupilMat
      );
      pupil.position.set(es, 0.205, 0.160);
      craniumGroup.add(pupil);

      const glint = new THREE.Mesh(
        new THREE.SphereGeometry(0.0035, 6, 6),
        m.eyeGlintMat
      );
      glint.position.set(es + 0.004, 0.210, 0.166);
      craniumGroup.add(glint);

      // Upper Eyelid Fold
      const eyelid = new THREE.Mesh(
        new THREE.TorusGeometry(0.030, 0.006, 8, 16, Math.PI * 0.70),
        m.skinMat
      );
      eyelid.rotation.z = (es > 0 ? -0.15 : 0.15);
      eyelid.position.set(es, 0.216, 0.132);
      craniumGroup.add(eyelid);

      // Sculpted Warrior Brow (Curved Capsule)
      const brow = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.011, 0.056, 8, 14),
        m.hairMat
      );
      brow.rotation.z = Math.PI / 2 + (es > 0 ? 0.16 : -0.16);
      brow.position.set(es, 0.240, 0.138);
      craniumGroup.add(brow);
    }

    // Defined Masculine Lips
    const upperLip = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.008, 0.042, 8, 12),
      m.lipMat
    );
    upperLip.rotation.z = Math.PI / 2;
    upperLip.position.set(0, 0.145, 0.136);
    craniumGroup.add(upperLip);

    const lowerLip = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.009, 0.036, 8, 12),
      m.lipMat
    );
    lowerLip.rotation.z = Math.PI / 2;
    lowerLip.position.set(0, 0.130, 0.132);
    craniumGroup.add(lowerLip);

    // Sculpted Trimmed Scavenger Mustache
    const mustache = new THREE.Mesh(
      new THREE.TorusGeometry(0.036, 0.012, 10, 20, Math.PI * 0.86),
      m.beardMat
    );
    mustache.rotation.x = Math.PI * 0.88;
    mustache.position.set(0, 0.158, 0.146);
    craniumGroup.add(mustache);

    // Signature Trimmed Beard & Goatee (Prabhas Style)
    const beardJawBand = new THREE.Mesh(
      new THREE.TorusGeometry(0.110, 0.016, 10, 24, Math.PI * 0.72),
      m.beardMat
    );
    beardJawBand.rotation.x = Math.PI * 0.65;
    beardJawBand.position.set(0, 0.118, 0.048);
    craniumGroup.add(beardJawBand);

    // Sculpted Chin Goatee
    const goatee = new THREE.Mesh(
      new THREE.ConeGeometry(0.030, 0.075, 14),
      m.beardMat
    );
    goatee.rotation.x = -0.32;
    goatee.position.set(0, 0.080, 0.096);
    craniumGroup.add(goatee);

    // Tactical Runner Forehead Wrap / Headband
    const headband = new THREE.Mesh(
      new THREE.CylinderGeometry(0.140, 0.140, 0.042, 28, 1, true),
      m.headbandMat
    );
    headband.position.set(0, 0.235, 0.018);
    craniumGroup.add(headband);

    // =========================================================================
    // AUTHENTIC KALKI 2898 AD PRABHAS HAIRSTYLE
    // Thick, full, voluminous, layered wavy hair (ZERO bald spots, ZERO ponytail)
    // =========================================================================
    const hairGroup = new THREE.Group();
    craniumGroup.add(hairGroup);

    // 1. Full-Coverage Thick Outer Hair Shell (Radius 0.150 completely envelopes skull 0.118!)
    // phiLength 0.85 * PI covers all the way from brow down to back of neck. Zero skin visible from behind/above!
    const hairShell = new THREE.Mesh(
      new THREE.SphereGeometry(0.150, 28, 28, 0, Math.PI * 2, 0, Math.PI * 0.85),
      m.hairMat
    );
    hairShell.position.set(0, 0.195, -0.010);
    hairShell.castShadow = true;
    hairGroup.add(hairShell);

    // 2. High Frontal Brushed-Back Hair Wave Crest (Full volume rising over forehead, sweeping back)
    const frontWave = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.055, 0.15, 14, 18),
      m.hairMat
    );
    frontWave.rotation.x = -0.28;
    frontWave.rotation.z = Math.PI / 2;
    frontWave.position.set(0, 0.285, 0.045);
    frontWave.castShadow = true;
    hairGroup.add(frontWave);

    // 3. Thick Layered Crown Waves (Brushed Back toward occiput)
    for (let c of [-0.05, 0.05]) {
      const crownLock = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.052, 0.16, 12, 16),
        m.hairMat
      );
      crownLock.rotation.x = -0.42;
      crownLock.rotation.z = c * 0.35;
      crownLock.position.set(c, 0.275, -0.020);
      crownLock.castShadow = true;
      hairGroup.add(crownLock);
    }

    // 4. Center Swept-Back Crest (The prominent dorsal wave visible in third-person camera)
    const crestLock = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.058, 0.18, 14, 18),
      m.hairMat
    );
    crestLock.rotation.x = -0.48;
    crestLock.position.set(0, 0.280, -0.025);
    crestLock.castShadow = true;
    hairGroup.add(crestLock);

    // 5. Wavy Side Volumes & Temple Locks (Thick hair framing the face and ears)
    for (let s of [-1, 1]) {
      // Side hair volume above ear
      const sideBulge = new THREE.Mesh(
        new THREE.SphereGeometry(0.095, 16, 16),
        m.hairMat
      );
      sideBulge.scale.set(0.85, 1.25, 1.15);
      sideBulge.position.set(s * 0.118, 0.210, 0.010);
      hairGroup.add(sideBulge);

      // Temple lock curling in front of ear
      const templeLock = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.028, 0.10, 8, 14),
        m.hairMat
      );
      templeLock.rotation.z = s * 0.28;
      templeLock.rotation.x = 0.18;
      templeLock.position.set(s * 0.112, 0.190, 0.055);
      hairGroup.add(templeLock);

      // Mid-ear side wave flowing down
      const sideWave = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.032, 0.12, 8, 14),
        m.hairMat
      );
      sideWave.rotation.z = s * 0.15;
      sideWave.rotation.x = -0.22;
      sideWave.position.set(s * 0.125, 0.170, -0.010);
      hairGroup.add(sideWave);

      // Posterior ear lock flowing to nape
      const postEarLock = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.034, 0.12, 8, 14),
        m.hairMat
      );
      postEarLock.rotation.z = s * 0.18;
      postEarLock.rotation.x = -0.45;
      postEarLock.position.set(s * 0.115, 0.150, -0.060);
      hairGroup.add(postEarLock);
    }

    // 6. Natural Nape Hair Flow (Dominant view from third-person follow camera!)
    // Upper Nape Dome
    const upperNape = new THREE.Mesh(
      new THREE.SphereGeometry(0.125, 20, 18),
      m.hairMat
    );
    upperNape.scale.set(1.15, 0.95, 0.90);
    upperNape.position.set(0, 0.180, -0.075);
    upperNape.castShadow = true;
    hairGroup.add(upperNape);

    // Mid-to-Lower Nape Layered Locks (Cascading down the back of the neck toward the collar)
    const midNapeLocks = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.048, 0.15, 12, 18),
      m.hairMat
    );
    midNapeLocks.rotation.z = Math.PI / 2;
    midNapeLocks.position.set(0, 0.125, -0.085);
    midNapeLocks.castShadow = true;
    hairGroup.add(midNapeLocks);

    // Collar-Grazing Lower Hair Fringe (Resting softly above the popped vest collar)
    for (let s of [-0.05, 0, 0.05]) {
      const collarLock = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.026, 0.07, 8, 12),
        m.hairMat
      );
      collarLock.rotation.x = -0.35;
      collarLock.rotation.z = s * 0.5;
      collarLock.position.set(s, 0.080, -0.088);
      hairGroup.add(collarLock);
    }

    // 7. Casual Frontal Fringe Strands (Parted textured lock over the brow)
    const fringeStrand = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.018, 0.07, 8, 12),
      m.hairMat
    );
    fringeStrand.rotation.z = 0.50;
    fringeStrand.rotation.x = 0.32;
    fringeStrand.position.set(-0.035, 0.255, 0.120);
    hairGroup.add(fringeStrand);

    // =========================================================================
    // 5. LEFT ARM (Broad Muscular Arm with Rolled Sleeve & Sculpted Glove)
    // =========================================================================
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.42, 0.45, 0);
    torso.add(leftArm);
    this.parts.leftArm = leftArm;

    // Muscular Deltoid Shoulder
    const leftShoulder = new THREE.Mesh(
      new THREE.SphereGeometry(0.115, 20, 18),
      m.vestMat
    );
    leftArm.add(leftShoulder);

    // Curved Pauldron Armor Plate (Smooth Sphere Segment - NO BOX!)
    const leftPauldron = new THREE.Mesh(
      new THREE.SphereGeometry(0.128, 16, 16, 0, Math.PI, 0, Math.PI * 0.62),
      m.kanthaArmorMat
    );
    leftPauldron.rotation.y = Math.PI / 2;
    leftPauldron.position.set(-0.02, 0.04, 0);
    leftArm.add(leftPauldron);

    const pauldronStripe = new THREE.Mesh(
      new THREE.TorusGeometry(0.124, 0.014, 8, 18, Math.PI * 0.8),
      m.redInsigniaMat
    );
    pauldronStripe.rotation.y = Math.PI / 2;
    pauldronStripe.position.set(-0.02, 0.04, 0);
    leftArm.add(pauldronStripe);

    // Rolled Sleeve Cuff
    const sleeveCuff = new THREE.Mesh(
      new THREE.TorusGeometry(0.102, 0.020, 12, 24),
      m.vestMat
    );
    sleeveCuff.rotation.x = Math.PI / 2;
    sleeveCuff.position.y = -0.06;
    leftArm.add(sleeveCuff);

    // Muscular Tanned Bicep (Smooth Capsule)
    const leftBicep = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.092, 0.15, 14, 18),
      m.skinMat
    );
    leftBicep.position.y = -0.15;
    leftBicep.castShadow = true;
    leftArm.add(leftBicep);

    // Articulated Left Forearm
    const leftForearm = new THREE.Group();
    leftForearm.position.set(0, -0.27, 0);
    leftArm.add(leftForearm);
    this.parts.leftForearm = leftForearm;

    const leftElbow = new THREE.Mesh(
      new THREE.SphereGeometry(0.088, 16, 16),
      m.skinMat
    );
    leftForearm.add(leftElbow);

    const leftForearmMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.086, 0.070, 0.26, 18),
      m.skinMat
    );
    leftForearmMesh.position.y = -0.13;
    leftForearmMesh.castShadow = true;
    leftForearm.add(leftForearmMesh);

    // Athletic Wrist Wrap
    const wristWrap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.075, 0.07, 18),
      m.vestTrimMat
    );
    wristWrap.position.y = -0.23;
    leftForearm.add(wristWrap);

    // Sculpted Organic Runner Hand / Fingerless Glove (NO BOX!)
    const leftPalm = new THREE.Mesh(
      new THREE.SphereGeometry(0.050, 14, 12),
      m.darkTitaniumMat
    );
    leftPalm.scale.set(1.0, 1.15, 0.65);
    leftPalm.position.y = -0.29;
    leftForearm.add(leftPalm);

    // Curled Knuckle Bar (Smooth Capsule)
    const leftKnuckles = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.020, 0.062, 10, 14),
      m.darkTitaniumMat
    );
    leftKnuckles.rotation.z = Math.PI / 2;
    leftKnuckles.position.set(0, -0.33, 0.018);
    leftForearm.add(leftKnuckles);

    // Thumb Grip
    const leftThumb = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.015, 0.036, 8, 10),
      m.darkTitaniumMat
    );
    leftThumb.rotation.z = 0.52;
    leftThumb.position.set(0.032, -0.30, 0.024);
    leftForearm.add(leftThumb);

    // =========================================================================
    // 6. RIGHT ARM (Iconic Bujji Cybernetic Gauntlet & Wrist Blaster)
    // =========================================================================
    const rightArm = new THREE.Group();
    rightArm.position.set(0.42, 0.45, 0);
    torso.add(rightArm);
    this.parts.rightArm = rightArm;

    const rightShoulder = new THREE.Mesh(
      new THREE.SphereGeometry(0.115, 20, 18),
      m.vestMat
    );
    rightArm.add(rightShoulder);

    const rightSleeveCuff = new THREE.Mesh(
      new THREE.TorusGeometry(0.102, 0.020, 12, 24),
      m.vestMat
    );
    rightSleeveCuff.rotation.x = Math.PI / 2;
    rightSleeveCuff.position.y = -0.06;
    rightArm.add(rightSleeveCuff);

    const rightBicep = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.092, 0.15, 14, 18),
      m.skinMat
    );
    rightBicep.position.y = -0.15;
    rightBicep.castShadow = true;
    rightArm.add(rightBicep);

    // Cybernetic Gauntlet Forearm Pivot
    const rightForearm = new THREE.Group();
    rightForearm.position.set(0, -0.27, 0);
    rightArm.add(rightForearm);
    this.parts.rightForearm = rightForearm;

    // Titanium Servo Elbow Hinge
    const rightElbow = new THREE.Mesh(
      new THREE.CylinderGeometry(0.080, 0.080, 0.05, 18),
      m.darkTitaniumMat
    );
    rightElbow.rotation.z = Math.PI / 2;
    rightForearm.add(rightElbow);

    // Maroon Exoskeleton Gauntlet Chassis
    const rightGauntlet = new THREE.Mesh(
      new THREE.CylinderGeometry(0.108, 0.090, 0.28, 20),
      m.gauntletMaroonMat
    );
    rightGauntlet.position.y = -0.13;
    rightGauntlet.castShadow = true;
    rightForearm.add(rightGauntlet);

    // Dorsal Glowing Cyan Longitudinal Power Cell (Sculpted Capsule - NO BOX!)
    const rightCell = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.022, 0.13, 10, 16),
      m.cyanCellMat
    );
    rightCell.position.set(0.086, -0.13, 0.060);
    rightForearm.add(rightCell);

    // Triple Luminous Energy Conduit Rings
    for (let r of [-0.05, -0.13, -0.21]) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.094, 0.012, 10, 24),
        m.cyanCellMat
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = r;
      rightForearm.add(ring);
    }

    // Wrist Blaster Emitter Muzzle
    const blasterMuzzle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.030, 0.040, 0.07, 16),
      m.darkTitaniumMat
    );
    blasterMuzzle.position.set(0, -0.25, 0.065);
    blasterMuzzle.rotation.x = Math.PI / 2;
    rightForearm.add(blasterMuzzle);

    // Inner Blaster Energy Core Aperture
    const blasterAperture = new THREE.Mesh(
      new THREE.SphereGeometry(0.016, 12, 12),
      m.cyanCellMat
    );
    blasterAperture.position.set(0, -0.25, 0.095);
    rightForearm.add(blasterAperture);

    // Sculpted Cybernetic Fist (Articulated Titanium - NO BOX!)
    const rightPalm = new THREE.Mesh(
      new THREE.SphereGeometry(0.052, 14, 12),
      m.darkTitaniumMat
    );
    rightPalm.scale.set(1.0, 1.15, 0.65);
    rightPalm.position.y = -0.30;
    rightForearm.add(rightPalm);

    const rightKnuckles = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.022, 0.065, 10, 14),
      m.darkTitaniumMat
    );
    rightKnuckles.rotation.z = Math.PI / 2;
    rightKnuckles.position.set(0, -0.34, 0.020);
    rightForearm.add(rightKnuckles);

    const rightKnuckleGlow = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.009, 0.055, 8, 12),
      m.cyanCellMat
    );
    rightKnuckleGlow.rotation.z = Math.PI / 2;
    rightKnuckleGlow.position.set(0, -0.34, 0.035);
    rightForearm.add(rightKnuckleGlow);

    // =========================================================================
    // 7. LEGS & HIGH-TOP RUNNER SNEAKERS (Long Heroic 1.94m Scale, NO BOXES!)
    // =========================================================================
    const legSides = [
      { name: "leftLeg", calfName: "leftCalf", posX: -0.17 },
      { name: "rightLeg", calfName: "rightCalf", posX: 0.17 }
    ];

    legSides.forEach((legData) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(legData.posX, -0.10, 0);
      hips.add(legGroup);
      this.parts[legData.name] = legGroup;

      // Muscular Thigh with Athletic Jogger Cut (Smooth Capsule - 0.50m length)
      const thigh = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.124, 0.26, 16, 20),
        m.pantsMat
      );
      thigh.position.y = -0.22;
      thigh.castShadow = true;
      thigh.receiveShadow = false;
      legGroup.add(thigh);

      // Articulated Knee & Calf Group
      const calfGroup = new THREE.Group();
      calfGroup.position.set(0, -0.44, 0);
      legGroup.add(calfGroup);
      this.parts[legData.calfName] = calfGroup;

      // Anatomical Curved Kantha Knee Guard (Curved Sliced Sphere - NO BOX!)
      const knee = new THREE.Mesh(
        new THREE.SphereGeometry(0.072, 16, 14),
        m.kanthaArmorMat
      );
      knee.scale.set(1.0, 1.25, 0.55);
      knee.position.set(0, 0, 0.082);
      calfGroup.add(knee);

      // Cuffed Calf Jogger (Tapered Muscular Cylinder)
      const calf = new THREE.Mesh(
        new THREE.CylinderGeometry(0.106, 0.080, 0.40, 18),
        m.pantsMat
      );
      calf.position.y = -0.20;
      calf.castShadow = true;
      calf.receiveShadow = false;
      calfGroup.add(calf);

      // Jogger Ankle Cuff (Curved Torus Hem)
      const ankleCuff = new THREE.Mesh(
        new THREE.TorusGeometry(0.086, 0.018, 12, 20),
        m.vestTrimMat
      );
      ankleCuff.rotation.x = Math.PI / 2;
      ankleCuff.position.y = -0.38;
      calfGroup.add(ankleCuff);

      // =======================================================================
      // AERODYNAMIC HIGH-TOP RUNNER SNEAKER (Contoured Forms - ZERO BOXES!)
      // =======================================================================
      const sneakerGroup = new THREE.Group();
      sneakerGroup.position.set(0, -0.42, 0.06);
      calfGroup.add(sneakerGroup);

      // 1. Contoured Aerodynamic Sole (Curved Capsule with Beveled Rocker)
      const soleGeo = new THREE.CapsuleGeometry(0.078, 0.18, 14, 18);
      soleGeo.scale(0.96, 0.44, 1.12);
      const sole = new THREE.Mesh(soleGeo, m.sneakerSoleMat);
      sole.rotation.x = Math.PI / 2;
      sole.position.set(0, -0.06, 0.02);
      sole.castShadow = true;
      sneakerGroup.add(sole);

      // 2. Contoured Sneaker Body Upper
      const upperGeo = new THREE.CapsuleGeometry(0.075, 0.16, 14, 18);
      upperGeo.scale(0.94, 0.62, 1.08);
      const upper = new THREE.Mesh(upperGeo, m.sneakerUpperMat);
      upper.rotation.x = Math.PI / 2;
      upper.position.set(0, 0.01, 0.01);
      upper.castShadow = true;
      sneakerGroup.add(upper);

      // 3. Padded Ankle Collar
      const ankleCollar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.086, 0.080, 0.08, 16),
        m.sneakerUpperMat
      );
      ankleCollar.position.set(0, 0.06, -0.02);
      sneakerGroup.add(ankleCollar);

      // 4. Smooth Rounded Rubber Toe Cap
      const toeCap = new THREE.Mesh(
        new THREE.SphereGeometry(0.068, 14, 12),
        m.sneakerSoleMat
      );
      toeCap.scale.set(1.05, 0.70, 0.95);
      toeCap.position.set(0, -0.04, 0.155);
      sneakerGroup.add(toeCap);

      // 5. Padded Tongue & Instep Flap
      const tongue = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.036, 0.070, 10, 14),
        m.sneakerAccentMat
      );
      tongue.rotation.x = -0.38;
      tongue.position.set(0, 0.07, 0.065);
      sneakerGroup.add(tongue);

      // 6. Heel Counter & Thruster Housing
      const heelCounter = new THREE.Mesh(
        new THREE.SphereGeometry(0.065, 12, 12),
        m.darkTitaniumMat
      );
      heelCounter.scale.set(0.95, 0.85, 0.80);
      heelCounter.position.set(0, -0.03, -0.09);
      sneakerGroup.add(heelCounter);

      // 7. Embedded High-Output Heel Thruster Nozzle
      const bootThrusterGroup = new THREE.Group();
      bootThrusterGroup.position.set(0, -0.07, -0.10);
      bootThrusterGroup.visible = false;
      sneakerGroup.add(bootThrusterGroup);
      this.bootThrusters.push(bootThrusterGroup);

      const nozzle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.038, 0.055, 0.07, 14),
        m.darkTitaniumMat
      );
      nozzle.castShadow = false;
      nozzle.receiveShadow = false;
      bootThrusterGroup.add(nozzle);

      // Outer Cyan Plasma Flame
      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.090, 0.58, 12, 1, true),
        m.plasmaFlameMat
      );
      flame.castShadow = false;
      flame.receiveShadow = false;
      flame.rotation.x = Math.PI;
      flame.position.y = -0.34;
      bootThrusterGroup.add(flame);
      this.thrusterFlames.push(flame);

      // Inner White-Hot Thermal Core
      const innerFlame = new THREE.Mesh(
        new THREE.ConeGeometry(0.048, 0.40, 12, 1, true),
        m.thermalCoreMat
      );
      innerFlame.castShadow = false;
      innerFlame.receiveShadow = false;
      innerFlame.rotation.x = Math.PI;
      innerFlame.position.y = -0.23;
      bootThrusterGroup.add(innerFlame);
      this.innerFlames.push(innerFlame);

      // Pulsing Mach Shock Diamond Rings
      for (let s of [-0.16, -0.30, -0.44]) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(0.02, 0.07, 12),
          m.shockRingMat
        );
        ring.castShadow = false;
        ring.receiveShadow = false;
        ring.rotation.x = Math.PI / 2;
        ring.position.y = s;
        bootThrusterGroup.add(ring);
        this.shockRings.push(ring);
      }
    });

    // Apply shadow casting to character mesh (strictly excluding thrusters)
    this.root.traverse((child) => {
      let isBooster = false;
      let p = child;
      while (p) {
        if (this.bootThrusters && this.bootThrusters.includes(p)) {
          isBooster = true;
          break;
        }
        p = p.parent;
      }

      if (isBooster) {
        if (child.isMesh) {
          child.castShadow = false;
          child.receiveShadow = false;
        }
        return;
      }

      if (child.isMesh && !child.material.transparent) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Enforce zero shadow casting / receiving across all booster assemblies
    this.bootThrusters.forEach((bt) => {
      bt.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = false;
          child.receiveShadow = false;
        }
      });
    });
  }

  /**
   * High-Energy Athletic Kinematics Animation Loop
   */
  updateAnimation(state, time, speedRatio = 1.0, isJetpack = false, shootTimer = 0, slideProgress = 0, turnDirection = 0, isLaneSwitching = false) {
    const {
      hips, torso, head,
      leftArm, leftForearm, rightArm, rightForearm,
      leftLeg, leftCalf, rightLeg, rightCalf,
      cloak
    } = this.parts;

    if (!hips || !torso) return;

    // Aerodynamic Wind Streaks (Active during high-speed slide)
    if (this.slideWindStreaks) {
      const isSliding = state === "sliding";
      this.slideWindStreaks.visible = isSliding;
      if (isSliding) {
        const flutter = 1.0 + Math.sin(time * 42.0) * 0.18;
        this.slideWindStreaks.scale.set(1.0, 1.0, flutter);
      }
    }

    // 1. Aerodynamic Flowing Runner Scarf / Jacket Tails
    if (cloak) {
      const baseWindAngle = isJetpack ? -1.45 : (state === "sliding" ? -1.48 : (-0.45 - Math.min(0.55, speedRatio * 0.38)));
      cloak.rotation.x = THREE.MathUtils.lerp(cloak.rotation.x, baseWindAngle, 0.24);
      if (state === "sliding") {
        cloak.rotation.y = THREE.MathUtils.lerp(cloak.rotation.y, 0, 0.24);
        cloak.rotation.z = THREE.MathUtils.lerp(cloak.rotation.z, 0, 0.24);
      }
      this.cloakSegments.forEach((seg, idx) => {
        const flutterFreq = isJetpack ? 34 : (state === "sliding" ? 38 : 24);
        seg.rotation.y = Math.sin(time * flutterFreq + idx * 1.3) * (state === "sliding" ? 0.22 : 0.14);
        seg.rotation.z = Math.cos(time * (flutterFreq * 0.8) + idx * 1.1) * 0.08;
      });
    }

    // 2. Jetpack Thrusters & Superhero Flight Mode
    if (isJetpack) {
      if (!this._bootThrustersVisible) {
        for (let i = 0; i < this.bootThrusters.length; i++) {
          this.bootThrusters[i].visible = true;
        }
        this._bootThrustersVisible = true;
      }

      const flickerY = 1.0 + Math.random() * 0.35 + Math.sin(time * 28) * 0.15;
      const flickerXZ = 0.95 + Math.random() * 0.2;
      for (let i = 0; i < this.thrusterFlames.length; i++) {
        this.thrusterFlames[i].scale.set(flickerXZ, flickerY, flickerXZ);
      }
      for (let i = 0; i < this.innerFlames.length; i++) {
        this.innerFlames[i].scale.set(flickerXZ * 0.9, flickerY * 0.95, flickerXZ * 0.9);
      }

      // Aerodynamic superhero posture
      hips.position.y = THREE.MathUtils.lerp(hips.position.y, this.baseHipsY, 0.20);
      hips.rotation.set(-0.62, 0, 0);
      torso.rotation.set(0.14, 0, 0);
      head.rotation.set(0.48, 0, 0);

      if (leftLeg) leftLeg.rotation.set(0.50, 0, 0);
      if (leftCalf) leftCalf.rotation.set(0.15, 0, 0);
      if (rightLeg) rightLeg.rotation.set(0.55, 0, 0);
      if (rightCalf) rightCalf.rotation.set(0.15, 0, 0);

      if (leftArm) leftArm.rotation.set(-1.42, 0, 0.15);
      if (leftForearm) leftForearm.rotation.set(-0.25, 0, 0);

      if (shootTimer > 0) {
        if (rightArm) rightArm.rotation.set(-Math.PI / 2, -0.10, 0.08);
        if (rightForearm) rightForearm.rotation.set(0, 0, 0);
      } else {
        if (rightArm) rightArm.rotation.set(-1.42, 0, -0.15);
        if (rightForearm) rightForearm.rotation.set(-0.25, 0, 0);
      }
      return;
    }

    if (this._bootThrustersVisible) {
      for (let i = 0; i < this.bootThrusters.length; i++) {
        this.bootThrusters[i].visible = false;
      }
      this._bootThrustersVisible = false;
    }

    // 3. Masculine Athletic Power Slide (Enhanced with Lateral Turn Banking)
    if (state === "sliding") {
      let slideWeight = 1.0;
      if (slideProgress < 0.18) {
        slideWeight = Math.sin((slideProgress / 0.18) * (Math.PI / 2));
      } else if (slideProgress > 0.76) {
        slideWeight = Math.cos(((slideProgress - 0.76) / 0.24) * (Math.PI / 2));
      }
      slideWeight = Math.max(0, Math.min(1.0, slideWeight));

      const isFullSlide = slideProgress >= 0.18 && slideProgress <= 0.76;
      const groundChatter = isFullSlide ? Math.sin(time * 38.0) * 0.008 : 0;
      const slideBanking = (isLaneSwitching && turnDirection !== 0) ? (turnDirection * 0.16 * slideWeight) : 0;

      // Hips Pose
      const targetHipsY = THREE.MathUtils.lerp(this.baseHipsY, 0.28 + groundChatter, slideWeight);
      const targetHipsRotX = THREE.MathUtils.lerp(0, -0.68, slideWeight);

      hips.position.y = THREE.MathUtils.lerp(hips.position.y, targetHipsY, 0.36);
      hips.rotation.x = THREE.MathUtils.lerp(hips.rotation.x, targetHipsRotX, 0.36);
      hips.rotation.y = THREE.MathUtils.lerp(hips.rotation.y, slideBanking * 0.5, 0.36);
      hips.rotation.z = THREE.MathUtils.lerp(hips.rotation.z, -slideBanking, 0.36);

      // Torso Lean
      const targetTorsoRotX = THREE.MathUtils.lerp(0.18, 0.46, slideWeight);
      torso.rotation.x = THREE.MathUtils.lerp(torso.rotation.x, targetTorsoRotX, 0.36);
      torso.rotation.y = THREE.MathUtils.lerp(torso.rotation.y, slideBanking * 0.3, 0.36);
      torso.rotation.z = THREE.MathUtils.lerp(torso.rotation.z, -slideBanking * 0.7, 0.36);

      // Head Horizon Lock
      const targetHeadRotX = THREE.MathUtils.lerp(0, 0.26, slideWeight);
      head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, targetHeadRotX, 0.36);
      head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, 0, 0.36);
      head.rotation.z = THREE.MathUtils.lerp(head.rotation.z, 0, 0.36);

      // Symmetric Legs
      const legPitch = THREE.MathUtils.lerp(0, -1.15, slideWeight);
      const calfPitch = THREE.MathUtils.lerp(0, 1.45, slideWeight);
      const legFlare = THREE.MathUtils.lerp(0, 0.06, slideWeight);

      if (leftLeg) {
        leftLeg.rotation.x = THREE.MathUtils.lerp(leftLeg.rotation.x, legPitch, 0.36);
        leftLeg.rotation.y = THREE.MathUtils.lerp(leftLeg.rotation.y, 0, 0.36);
        leftLeg.rotation.z = THREE.MathUtils.lerp(leftLeg.rotation.z, -legFlare, 0.36);
      }
      if (leftCalf) {
        leftCalf.rotation.x = THREE.MathUtils.lerp(leftCalf.rotation.x, calfPitch, 0.36);
        leftCalf.rotation.y = THREE.MathUtils.lerp(leftCalf.rotation.y, 0, 0.36);
        leftCalf.rotation.z = THREE.MathUtils.lerp(leftCalf.rotation.z, 0, 0.36);
      }

      if (rightLeg) {
        rightLeg.rotation.x = THREE.MathUtils.lerp(rightLeg.rotation.x, legPitch, 0.36);
        rightLeg.rotation.y = THREE.MathUtils.lerp(rightLeg.rotation.y, 0, 0.36);
        rightLeg.rotation.z = THREE.MathUtils.lerp(rightLeg.rotation.z, legFlare, 0.36);
      }
      if (rightCalf) {
        rightCalf.rotation.x = THREE.MathUtils.lerp(rightCalf.rotation.x, calfPitch, 0.36);
        rightCalf.rotation.y = THREE.MathUtils.lerp(rightCalf.rotation.y, 0, 0.36);
        rightCalf.rotation.z = THREE.MathUtils.lerp(rightCalf.rotation.z, 0, 0.36);
      }

      // Symmetric Arms
      const armPitch = THREE.MathUtils.lerp(0, 0.75, slideWeight);
      const armYaw = THREE.MathUtils.lerp(0, 0.14, slideWeight);
      const armRoll = THREE.MathUtils.lerp(0, 0.22, slideWeight);
      const forearmPitch = THREE.MathUtils.lerp(0, -0.35, slideWeight);

      if (leftArm) {
        leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, armPitch, 0.36);
        leftArm.rotation.y = THREE.MathUtils.lerp(leftArm.rotation.y, -armYaw, 0.36);
        leftArm.rotation.z = THREE.MathUtils.lerp(leftArm.rotation.z, armRoll, 0.36);
      }
      if (leftForearm) {
        leftForearm.rotation.x = THREE.MathUtils.lerp(leftForearm.rotation.x, forearmPitch, 0.36);
        leftForearm.rotation.y = THREE.MathUtils.lerp(leftForearm.rotation.y, 0, 0.36);
        leftForearm.rotation.z = THREE.MathUtils.lerp(leftForearm.rotation.z, 0, 0.36);
      }

      if (shootTimer > 0) {
        if (rightArm) rightArm.rotation.set(-Math.PI / 2, -0.12, 0.08);
        if (rightForearm) rightForearm.rotation.set(0, 0, 0);
      } else {
        if (rightArm) {
          rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, armPitch, 0.36);
          rightArm.rotation.y = THREE.MathUtils.lerp(rightArm.rotation.y, armYaw, 0.36);
          rightArm.rotation.z = THREE.MathUtils.lerp(rightArm.rotation.z, -armRoll, 0.36);
        }
        if (rightForearm) {
          rightForearm.rotation.x = THREE.MathUtils.lerp(rightForearm.rotation.x, forearmPitch, 0.36);
          rightForearm.rotation.y = THREE.MathUtils.lerp(rightForearm.rotation.y, 0, 0.36);
          rightForearm.rotation.z = THREE.MathUtils.lerp(rightForearm.rotation.z, 0, 0.36);
        }
      }
      return;
    }

    // 4. Springy Athletic Tuck Jump
    if (state === "jumping") {
      hips.position.y = THREE.MathUtils.lerp(hips.position.y, this.baseHipsY, 0.24);
      hips.rotation.x = THREE.MathUtils.lerp(hips.rotation.x, -0.26, 0.24);
      hips.rotation.y = THREE.MathUtils.lerp(hips.rotation.y, 0, 0.24);
      hips.rotation.z = THREE.MathUtils.lerp(hips.rotation.z, 0, 0.24);

      torso.rotation.x = THREE.MathUtils.lerp(torso.rotation.x, 0.14, 0.24);
      torso.rotation.y = THREE.MathUtils.lerp(torso.rotation.y, 0, 0.24);
      head.rotation.set(0.12, 0, 0);

      // Both knees flexed up in mid-air tuck
      if (leftLeg) leftLeg.rotation.x = THREE.MathUtils.lerp(leftLeg.rotation.x, 0.72, 0.25);
      if (leftCalf) leftCalf.rotation.x = THREE.MathUtils.lerp(leftCalf.rotation.x, 1.05, 0.25);
      if (rightLeg) rightLeg.rotation.x = THREE.MathUtils.lerp(rightLeg.rotation.x, 0.45, 0.25);
      if (rightCalf) rightCalf.rotation.x = THREE.MathUtils.lerp(rightCalf.rotation.x, 0.88, 0.25);

      if (leftArm) {
        leftArm.rotation.set(-1.20, -0.12, 0.20);
        if (leftForearm) leftForearm.rotation.set(-0.70, 0, 0);
      }

      if (shootTimer > 0) {
        if (rightArm) rightArm.rotation.set(-Math.PI / 2, -0.12, 0.08);
        if (rightForearm) rightForearm.rotation.set(0, 0, 0);
      } else {
        if (rightArm) {
          rightArm.rotation.set(-1.05, 0.12, -0.20);
          if (rightForearm) rightForearm.rotation.set(-0.70, 0, 0);
        }
      }
      return;
    }

    // 5. Classic High-Energy Athletic Sprint Gait
    const strideSpeed = Math.min(1.48, Math.max(0.9, speedRatio));
    const phase = time * 15.6 * strideSpeed;

    // Double-bounce (2 vertical peaks per full stride cycle)
    const verticalBob = Math.sin(phase * 2.0) * 0.052;
    hips.position.y = THREE.MathUtils.lerp(hips.position.y, this.baseHipsY + verticalBob, 0.30);
    hips.rotation.x = THREE.MathUtils.lerp(hips.rotation.x, 0, 0.26);
    hips.rotation.y = Math.sin(phase) * 0.06;
    hips.rotation.z = Math.sin(phase) * 0.042;

    // Torso counter-twist & forward athletic charge lean
    torso.rotation.x = 0.18 + (speedRatio - 1.0) * 0.05;
    torso.rotation.y = -Math.sin(phase) * 0.14;
    torso.rotation.z = -Math.sin(phase) * 0.035;

    // Horizon lookahead head stabilization
    head.rotation.y = -torso.rotation.y * 0.65;
    head.rotation.x = -torso.rotation.x * 0.45;

    const sinP = Math.sin(phase);
    const cosP = Math.cos(phase);

    // Left Leg
    if (leftLeg) leftLeg.rotation.x = sinP * 0.92;
    if (leftCalf) {
      const kneeBendL = sinP < 0 ? Math.pow(-sinP, 1.2) * 1.30 : Math.max(0, cosP * 0.38);
      leftCalf.rotation.x = kneeBendL;
    }

    // Right Leg
    if (rightLeg) rightLeg.rotation.x = -sinP * 0.92;
    if (rightCalf) {
      const kneeBendR = sinP > 0 ? Math.pow(sinP, 1.2) * 1.30 : Math.max(0, -cosP * 0.38);
      rightCalf.rotation.x = kneeBendR;
    }

    // Left Arm athletic pump
    if (leftArm) {
      leftArm.rotation.x = -sinP * 0.78;
      leftArm.rotation.y = -0.12;
      leftArm.rotation.z = 0.14;
    }
    if (leftForearm) {
      leftForearm.rotation.x = -0.98 - sinP * 0.26;
    }

    // Right Arm: Blaster Recoil vs Running Pump
    if (shootTimer > 0) {
      const shootProgress = shootTimer / 0.18;
      if (rightArm) {
        rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, -Math.PI / 2, 0.50);
        rightArm.rotation.y = THREE.MathUtils.lerp(rightArm.rotation.y, -0.12, 0.48);
        rightArm.rotation.z = THREE.MathUtils.lerp(rightArm.rotation.z, 0.08, 0.48);
      }
      if (rightForearm) {
        rightForearm.rotation.x = THREE.MathUtils.lerp(rightForearm.rotation.x, 0.0, 0.50);
      }
      torso.rotation.x -= 0.07 * shootProgress;
    } else {
      if (rightArm) {
        rightArm.rotation.x = sinP * 0.78;
        rightArm.rotation.y = 0.12;
        rightArm.rotation.z = -0.14;
      }
      if (rightForearm) {
        rightForearm.rotation.x = -0.98 + sinP * 0.26;
      }
    }
  }

  /**
   * Outfit Themes: Wasteland Scavenger Runner vs Complex High-Tech Infiltration Suit
   */
  setOutfit(theme = "wasteland") {
    this.outfitTheme = theme;
    const isComplex = theme === "complex" || theme === "complex_beta";
    const m = this.materials;
    if (!m) return;

    const clothBump = textureGen.getClothBumpMap();

    if (isComplex) {
      // Eye-pleasing soft platinum cyber-vest (softened shade, zero harsh pure white glare)
      m.vestMat.color.setHex(0xCBD5E1);
      m.vestMat.metalness = 0.58;
      m.vestMat.roughness = 0.30;
      m.vestMat.bumpMap = clothBump;
      m.vestMat.bumpScale = 0.012;

      m.kanthaArmorMat.color.setHex(0x0F172A);
      m.kanthaArmorMat.metalness = 0.88;
      m.kanthaArmorMat.roughness = 0.22;

      // Soft platinum-slate cyber-cloak (pleasant satin texture)
      m.dusterCloakMat.color.setHex(0xB0BAC6);
      m.dusterCloakMat.metalness = 0.30;
      m.dusterCloakMat.roughness = 0.38;
      m.dusterCloakMat.bumpMap = clothBump;
      m.dusterCloakMat.bumpScale = 0.012;

      m.redInsigniaMat.color.setHex(0x00E5FF);

      m.bronzeTrimMat.color.setHex(0xFBBF24);
      m.bronzeTrimMat.metalness = 0.98;
      m.bronzeTrimMat.roughness = 0.12;

      m.pantsMat.color.setHex(0x1E1E1E);
      m.pantsMat.metalness = 0.0;
      m.pantsMat.roughness = 0.88;
      m.pantsMat.bumpMap = null;

      m.sneakerUpperMat.color.setHex(0xA0AEC0);
      m.sneakerUpperMat.metalness = 0.65;
      m.sneakerSoleMat.color.setHex(0x00E5FF);

      m.cyberGauntletMat.color.setHex(0x0F172A);
      m.cyberGauntletMat.metalness = 0.95;
      m.cyberGauntletMat.roughness = 0.12;

      m.gauntletMaroonMat.color.setHex(0x1E293B);
      m.cyanCellMat.color.setHex(0x00E5FF);
    } else {
      m.vestMat.color.setHex(0x48392B);
      m.vestMat.metalness = 0.15;
      m.vestMat.roughness = 0.65;
      m.vestMat.bumpMap = clothBump;

      m.kanthaArmorMat.color.setHex(0x241D17);
      m.kanthaArmorMat.metalness = 0.70;
      m.kanthaArmorMat.roughness = 0.36;

      m.dusterCloakMat.color.setHex(0x382C22);
      m.dusterCloakMat.metalness = 0.10;
      m.dusterCloakMat.roughness = 0.72;
      m.dusterCloakMat.bumpMap = clothBump;

      m.redInsigniaMat.color.setHex(0xEF4444);

      m.bronzeTrimMat.color.setHex(0xD9982E);
      m.bronzeTrimMat.metalness = 0.92;
      m.bronzeTrimMat.roughness = 0.24;

      m.pantsMat.color.setHex(0x1C1C1C);
      m.pantsMat.metalness = 0.0;
      m.pantsMat.roughness = 0.88;
      m.pantsMat.bumpMap = clothBump;

      m.sneakerUpperMat.color.setHex(0x181614);
      m.sneakerUpperMat.metalness = 0.38;
      m.sneakerSoleMat.color.setHex(0xE8ECF0);

      m.cyberGauntletMat.color.setHex(0x1A202A);
      m.cyberGauntletMat.metalness = 0.95;
      m.cyberGauntletMat.roughness = 0.18;

      m.gauntletMaroonMat.color.setHex(0x6E1818);
      m.cyanCellMat.color.setHex(0x00E5FF);
    }
  }
}
