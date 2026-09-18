/**
 * COMPLEX RUNNER - Next-Gen 3D Sci-Fi Runner
 * Dystopian Floating Magnetic Repulsor Cargo Trains & Obstacles
 */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { CONFIG } from "../config.js?v=20260919_triangle_neon_v38";
import { textureGen } from "../world/textureGenerator.js?v=20260919_triangle_neon_v38";

export class ObstacleFactory3D {
  constructor() {
    this.materials = {
      trainArmor: new THREE.MeshStandardMaterial({
        map: textureGen.getTrainArmorTexture(),
        normalMap: textureGen.getTrainArmorNormalMap(),
        normalScale: new THREE.Vector2(0.85, 0.85),
        roughness: 0.45,
        metalness: 0.82
      }),
      trainTrim: new THREE.MeshStandardMaterial({
        color: 0xD97706,
        roughness: 0.28,
        metalness: 0.85
      }),
      grillMat: new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.7,
        metalness: 0.95
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
        roughness: 0.6,
        metalness: 0.6
      }),
      rampSurface: new THREE.MeshStandardMaterial({
        map: textureGen.getTrainArmorTexture(),
        normalMap: textureGen.getTrainArmorNormalMap(),
        normalScale: new THREE.Vector2(0.85, 0.85),
        roughness: 0.5,
        metalness: 0.75,
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
      }),
      headlightBeam: new THREE.MeshBasicMaterial({
        color: 0xFEF08A,
        transparent: true,
        opacity: 0.30,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }),
      headlightCoreBeam: new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.50,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }),
      warningBeacon: new THREE.MeshBasicMaterial({
        color: 0xF59E0B
      }),
      bellowsMat: new THREE.MeshStandardMaterial({
        color: 0x181E24,
        roughness: 0.85,
        metalness: 0.20
      })
    };

    // Pre-allocated shared geometries
    this.geometries = {
      trainNose: new THREE.CylinderGeometry(1.3, 1.3, 3.5, 12),
      trainGrill: new THREE.BoxGeometry(1.6, 1.8, 0.4),
      grillSlat: new THREE.BoxGeometry(1.5, 0.08, 0.45),
      headlight: new THREE.SphereGeometry(0.24, 10, 10),
      headlightBeamCone: new THREE.ConeGeometry(0.85, 18.0, 14, 1, true),
      warningBeaconDome: new THREE.SphereGeometry(0.20, 8, 8),
      thrusterPod: new THREE.CylinderGeometry(0.38, 0.44, 0.28, 12),
      thrusterRing: new THREE.TorusGeometry(0.35, 0.04, 6, 12),
      thrusterFlame: new THREE.ConeGeometry(0.28, 0.55, 12),
      thrusterHalo: new THREE.RingGeometry(0.15, 0.55, 12),
      gatePillar: new THREE.CylinderGeometry(0.16, 0.22, 3.6, 10),
      gateLightNode: new THREE.SphereGeometry(0.24, 10, 10),
      gateCrossBeam: new THREE.BoxGeometry(3.6, 0.25, 0.25),
      gateLaser: new THREE.CylinderGeometry(0.05, 0.05, 3.2, 8),
      hurdleBarricade: new THREE.BoxGeometry(2.4, 1.90, 0.55),
      hurdleStripe: new THREE.BoxGeometry(2.42, 0.28, 0.57),
      rampGuideEdge: new THREE.BoxGeometry(0.06, 0.12, 9.0),
      rampCenterTread: new THREE.BoxGeometry(0.7, 0.04, 8.8),
      bellowsRingGeo: new THREE.BoxGeometry(2.45, 3.2, 0.22),
      couplerPlateGeo: new THREE.BoxGeometry(1.6, 0.12, 1.8),
      couplerRodGeo: new THREE.CylinderGeometry(0.08, 0.08, 1.6, 8)
    };

    this.trainBodyGeos = {};
    this.trainRoofGeos = {};
    this.rampGeo = this.buildRampGeometry(2.6, 9.0, 4.15);
    this.rampStripeGeo = new THREE.BoxGeometry(0.18, 0.1, 9.0);
  }

  getTrainBodyGeo(length) {
    if (!this.trainBodyGeos[length]) {
      this.trainBodyGeos[length] = new THREE.BoxGeometry(2.6, 3.4, length);
    }
    return this.trainBodyGeos[length];
  }

  getTrainRoofGeo(length) {
    if (!this.trainRoofGeos[length]) {
      this.trainRoofGeos[length] = new THREE.BoxGeometry(1.6, 0.08, length - 2);
    }
    return this.trainRoofGeos[length];
  }

  buildRampGeometry(width, rampLength, totalTopY) {
    const wHalf = width / 2;
    const z0 = -rampLength / 2;
    const z1 = rampLength / 2;
    const y0 = 0.0;
    const y1 = totalTopY;

    // 18 vertices (6 triangles)
    const rampPositions = new Float32Array([
      // Top Slope (2 triangles)
      -wHalf, y0, z0,
       wHalf, y0, z0,
       wHalf, y1, z1,
      -wHalf, y0, z0,
       wHalf, y1, z1,
      -wHalf, y1, z1,

      // Left Side Wall (1 triangle)
      -wHalf, y0, z0,
      -wHalf, y1, z1,
      -wHalf, y0, z1,

      // Right Side Wall (1 triangle)
       wHalf, y0, z0,
       wHalf, y0, z1,
       wHalf, y1, z1,

      // Back Wall (2 triangles)
      -wHalf, y0, z1,
       wHalf, y0, z1,
       wHalf, y1, z1,
      -wHalf, y0, z1,
       wHalf, y1, z1,
      -wHalf, y1, z1
    ]);

    const rampNormals = new Float32Array([
      // Top slope
      0, 0.88, -0.47,  0, 0.88, -0.47,  0, 0.88, -0.47,
      0, 0.88, -0.47,  0, 0.88, -0.47,  0, 0.88, -0.47,

      // Left side (-X)
     -1, 0, 0,        -1, 0, 0,        -1, 0, 0,

      // Right side (+X)
      1, 0, 0,         1, 0, 0,         1, 0, 0,

      // Back face (+Z)
      0, 0, 1,         0, 0, 1,         0, 0, 1,
      0, 0, 1,         0, 0, 1,         0, 0, 1
    ]);

    const rampUVs = new Float32Array([
      // Top slope
      0, 0,  1, 0,  1, 1,
      0, 0,  1, 1,  0, 1,

      // Left side
      0, 0,  1, 1,  1, 0,

      // Right side
      0, 0,  1, 0,  1, 1,

      // Back face
      0, 0,  1, 0,  1, 1,
      0, 0,  1, 1,  0, 1
    ]);

    const rampGeo = new THREE.BufferGeometry();
    rampGeo.setAttribute("position", new THREE.BufferAttribute(rampPositions, 3));
    rampGeo.setAttribute("normal", new THREE.BufferAttribute(rampNormals, 3));
    rampGeo.setAttribute("uv", new THREE.BufferAttribute(rampUVs, 2));
    return rampGeo;
  }

  createMaglevTrain(hasRamp = false, isMoving = false, length = 22.0) {
    const group = new THREE.Group();
    group.userData.type = "train";
    group.userData.hasRamp = hasRamp;
    group.userData.isMoving = isMoving;
    group.userData.moveSpeed = isMoving ? 3.0 : 0; // Fair, smooth advance speed
    group.userData.hp = 10;
    group.userData.maxHp = 10;
    group.userData.trainLength = length;

    const width = 2.6;
    const bodyHeight = 3.4;
    const floatElevation = 0.75;
    const totalTopY = floatElevation + bodyHeight;

    if (isMoving) {
      group.rotation.y = Math.PI; // Reverse train direction so front nose & headlights face oncoming player!
    }

    const body = new THREE.Mesh(this.getTrainBodyGeo(length), this.materials.trainArmor);
    body.position.y = floatElevation + bodyHeight / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    const nose = new THREE.Mesh(this.geometries.trainNose, this.materials.trainArmor);
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, floatElevation + bodyHeight / 2, length / 2 + 0.2);
    group.add(nose);

    const grill = new THREE.Mesh(this.geometries.trainGrill, this.materials.grillMat);
    grill.position.set(0, floatElevation + 1.2, length / 2 + 1.8);
    group.add(grill);

    for (let gy = -0.7; gy <= 0.7; gy += 0.35) {
      const slat = new THREE.Mesh(this.geometries.grillSlat, this.materials.trainTrim);
      slat.position.set(0, floatElevation + 1.2 + gy, length / 2 + 1.8);
      group.add(slat);
    }

    for (let x of [-0.85, 0.85]) {
      const headlight = new THREE.Mesh(this.geometries.headlight, this.materials.headlightGlow);
      headlight.position.set(x, floatElevation + bodyHeight * 0.7, length / 2 + 1.85);
      group.add(headlight);
    }

    const numRepulsors = 4;
    for (let i = 0; i < numRepulsors; i++) {
      const zOffset = -length / 2 + 2.8 + i * ((length - 5.6) / (numRepulsors - 1));
      for (let x of [-0.95, 0.95]) {
        const pod = new THREE.Mesh(this.geometries.thrusterPod, this.materials.carbonFrame);
        pod.position.set(x, floatElevation + 0.05, zOffset);
        group.add(pod);

        const ring = new THREE.Mesh(this.geometries.thrusterRing, this.materials.repulsorPlasma);
        ring.rotation.x = Math.PI / 2;
        ring.position.set(x, floatElevation - 0.08, zOffset);
        group.add(ring);

        const flame = new THREE.Mesh(this.geometries.thrusterFlame, this.materials.repulsorPlasma);
        flame.rotation.x = Math.PI;
        flame.position.set(x, floatElevation - 0.35, zOffset);
        group.add(flame);

        const halo = new THREE.Mesh(this.geometries.thrusterHalo, this.materials.repulsorHalo);
        halo.rotation.x = -Math.PI / 2;
        halo.position.set(x, 0.04, zOffset);
        group.add(halo);
      }
    }

    const roofGrate = new THREE.Mesh(this.getTrainRoofGeo(length), this.materials.roofGrating);
    roofGrate.position.set(0, totalTopY + 0.04, 0);
    group.add(roofGrate);

    if (hasRamp) {
      const rampLength = 9.0;
      const rampZOffset = -length / 2 - rampLength / 2;
      const rampAngle = -Math.atan2(totalTopY, rampLength);

      // Solid Ramp Body (with full UVs and normal maps)
      const solidRampMesh = new THREE.Mesh(this.rampGeo, this.materials.rampSurface);
      solidRampMesh.position.set(0, 0, rampZOffset);
      solidRampMesh.castShadow = true;
      solidRampMesh.receiveShadow = true;
      group.add(solidRampMesh);

      // Symmetrical Left and Right Heavy Carbon Rail Bases & Luminous Guides
      for (let s of [-1, 1]) {
        const railBase = new THREE.Mesh(this.rampStripeGeo, this.materials.carbonFrame);
        railBase.position.set(s * (width / 2 - 0.08), totalTopY / 2, rampZOffset);
        railBase.rotation.x = rampAngle;
        group.add(railBase);

        const guideEdge = new THREE.Mesh(
          this.geometries.rampGuideEdge,
          this.materials.plasmaBeam
        );
        guideEdge.position.set(s * (width / 2 - 0.04), totalTopY / 2 + 0.06, rampZOffset);
        guideEdge.rotation.x = rampAngle;
        group.add(guideEdge);
      }

      // Center Induction Grip Tread
      const centerTread = new THREE.Mesh(
        this.geometries.rampCenterTread,
        this.materials.roofGrating
      );
      centerTread.position.set(0, totalTopY / 2 + 0.02, rampZOffset);
      centerTread.rotation.x = rampAngle;
      group.add(centerTread);

      group.userData.hasRamp = true;
    }

    return group;
  }

  /**
   * 2-Compartment Articulated Maglev Cargo Train (Engine + Articulated Bellows + Rear Coach)
   */
  createTwoCompartmentTrain(hasRamp = false, isMoving = false, carLength = 13.5) {
    const group = new THREE.Group();
    const couplerLength = 1.6;
    const totalTrainLength = carLength * 2 + couplerLength; // 28.6m

    group.userData.type = "train";
    group.userData.hasRamp = hasRamp;
    group.userData.isMoving = isMoving;
    group.userData.moveSpeed = isMoving ? 3.0 : 0;
    group.userData.hp = 16;
    group.userData.maxHp = 16;
    group.userData.trainLength = totalTrainLength;
    group.userData.isTwoCompartment = true;

    const width = 2.6;
    const bodyHeight = 3.4;
    const floatElevation = 0.75;
    const totalTopY = floatElevation + bodyHeight;

    const frontCarZ = couplerLength / 2 + carLength / 2; // +7.55
    const rearCarZ = -(couplerLength / 2 + carLength / 2); // -7.55

    if (isMoving) {
      group.rotation.y = Math.PI; // Face oncoming player
    }

    // 1. Front Engine Car
    const frontBody = new THREE.Mesh(this.getTrainBodyGeo(carLength), this.materials.trainArmor);
    frontBody.position.set(0, floatElevation + bodyHeight / 2, frontCarZ);
    frontBody.castShadow = true;
    frontBody.receiveShadow = true;
    group.add(frontBody);

    const nose = new THREE.Mesh(this.geometries.trainNose, this.materials.trainArmor);
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, floatElevation + bodyHeight / 2, frontCarZ + carLength / 2 + 0.2);
    group.add(nose);

    const grill = new THREE.Mesh(this.geometries.trainGrill, this.materials.grillMat);
    grill.position.set(0, floatElevation + 1.2, frontCarZ + carLength / 2 + 1.8);
    group.add(grill);

    for (let gy = -0.7; gy <= 0.7; gy += 0.35) {
      const slat = new THREE.Mesh(this.geometries.grillSlat, this.materials.trainTrim);
      slat.position.set(0, floatElevation + 1.2 + gy, frontCarZ + carLength / 2 + 1.8);
      group.add(slat);
    }

    for (let x of [-0.85, 0.85]) {
      const headlight = new THREE.Mesh(this.geometries.headlight, this.materials.headlightGlow);
      headlight.position.set(x, floatElevation + bodyHeight * 0.7, frontCarZ + carLength / 2 + 1.85);
      group.add(headlight);
    }

    // 2. Articulated Bellows Gangway (Center Coupler at z = 0)
    for (let bz = -0.6; bz <= 0.6; bz += 0.3) {
      const bellow = new THREE.Mesh(this.geometries.bellowsRingGeo, this.materials.bellowsMat);
      bellow.position.set(0, floatElevation + bodyHeight / 2, bz);
      group.add(bellow);
    }

    // Seamless Coupler Roof Bridge Plate
    const couplerBridge = new THREE.Mesh(this.geometries.couplerPlateGeo, this.materials.roofGrating);
    couplerBridge.position.set(0, totalTopY + 0.04, 0);
    group.add(couplerBridge);

    // Dual Heavy Hydraulic Coupling Struts
    for (let s of [-0.9, 0.9]) {
      const rod = new THREE.Mesh(this.geometries.couplerRodGeo, this.materials.carbonFrame);
      rod.rotation.x = Math.PI / 2;
      rod.position.set(s, floatElevation + 0.6, 0);
      group.add(rod);
    }

    // 3. Rear Cargo Coach
    const rearBody = new THREE.Mesh(this.getTrainBodyGeo(carLength), this.materials.trainArmor);
    rearBody.position.set(0, floatElevation + bodyHeight / 2, rearCarZ);
    rearBody.castShadow = true;
    rearBody.receiveShadow = true;
    group.add(rearBody);

    // Repulsors under both cars
    for (let carCenter of [frontCarZ, rearCarZ]) {
      for (let zRel of [-carLength / 2 + 2.2, carLength / 2 - 2.2]) {
        for (let x of [-0.95, 0.95]) {
          const pod = new THREE.Mesh(this.geometries.thrusterPod, this.materials.carbonFrame);
          pod.position.set(x, floatElevation + 0.05, carCenter + zRel);
          group.add(pod);

          const ring = new THREE.Mesh(this.geometries.thrusterRing, this.materials.repulsorPlasma);
          ring.rotation.x = Math.PI / 2;
          ring.position.set(x, floatElevation - 0.08, carCenter + zRel);
          group.add(ring);

          const flame = new THREE.Mesh(this.geometries.thrusterFlame, this.materials.repulsorPlasma);
          flame.rotation.x = Math.PI;
          flame.position.set(x, floatElevation - 0.35, carCenter + zRel);
          group.add(flame);

          const halo = new THREE.Mesh(this.geometries.thrusterHalo, this.materials.repulsorHalo);
          halo.rotation.x = -Math.PI / 2;
          halo.position.set(x, 0.04, carCenter + zRel);
          group.add(halo);
        }
      }
    }

    // Continuous Full-Length Rooftop Gratings
    const frontRoof = new THREE.Mesh(this.getTrainRoofGeo(carLength), this.materials.roofGrating);
    frontRoof.position.set(0, totalTopY + 0.04, frontCarZ);
    group.add(frontRoof);

    const rearRoof = new THREE.Mesh(this.getTrainRoofGeo(carLength), this.materials.roofGrating);
    rearRoof.position.set(0, totalTopY + 0.04, rearCarZ);
    group.add(rearRoof);

    // 4. Optional Climbable Rear Ramp attached to the back of the rear coach
    if (hasRamp) {
      const rampLength = 9.0;
      const rampZOffset = -totalTrainLength / 2 - rampLength / 2;
      const rampAngle = -Math.atan2(totalTopY, rampLength);

      const solidRampMesh = new THREE.Mesh(this.rampGeo, this.materials.rampSurface);
      solidRampMesh.position.set(0, 0, rampZOffset);
      solidRampMesh.castShadow = true;
      solidRampMesh.receiveShadow = true;
      group.add(solidRampMesh);

      for (let s of [-1, 1]) {
        const railBase = new THREE.Mesh(this.rampStripeGeo, this.materials.carbonFrame);
        railBase.position.set(s * (width / 2 - 0.08), totalTopY / 2, rampZOffset);
        railBase.rotation.x = rampAngle;
        group.add(railBase);

        const guideEdge = new THREE.Mesh(this.geometries.rampGuideEdge, this.materials.plasmaBeam);
        guideEdge.position.set(s * (width / 2 - 0.04), totalTopY / 2 + 0.06, rampZOffset);
        guideEdge.rotation.x = rampAngle;
        group.add(guideEdge);
      }

      const centerTread = new THREE.Mesh(this.geometries.rampCenterTread, this.materials.roofGrating);
      centerTread.position.set(0, totalTopY / 2 + 0.02, rampZOffset);
      centerTread.rotation.x = rampAngle;
      group.add(centerTread);

      group.userData.hasRamp = true;
    }

    return group;
  }

  createPlasmaGate() {
    const group = new THREE.Group();
    group.userData.type = "laser_gate";
    group.userData.requiresSlide = true;
    group.userData.hp = 6;
    group.userData.maxHp = 6;

    const width = 3.2;
    const height = 3.6;

    for (let side of [-1, 1]) {
      const pillar = new THREE.Mesh(this.geometries.gatePillar, this.materials.carbonFrame);
      pillar.position.set(side * (width / 2), height / 2, 0);
      pillar.castShadow = true;
      group.add(pillar);

      const lightNode = new THREE.Mesh(this.geometries.gateLightNode, this.materials.repulsorPlasma);
      lightNode.position.set(side * (width / 2), height - 0.2, 0);
      group.add(lightNode);
    }

    const crossBeam = new THREE.Mesh(this.geometries.gateCrossBeam, this.materials.carbonFrame);
    crossBeam.position.set(0, height - 0.1, 0);
    group.add(crossBeam);

    for (let beamY of [1.6, 2.2, 2.8]) {
      const laser = new THREE.Mesh(this.geometries.gateLaser, this.materials.plasmaBeam);
      laser.rotation.z = Math.PI / 2;
      laser.position.set(0, beamY, 0);
      group.add(laser);
    }

    return group;
  }

  createLowHurdle() {
    const group = new THREE.Group();
    group.userData.type = "hurdle";
    group.userData.requiresJump = true;
    group.userData.hp = 6;
    group.userData.maxHp = 6;

    const height = 1.90;

    const barricade = new THREE.Mesh(this.geometries.hurdleBarricade, this.materials.trainArmor);
    barricade.position.y = height / 2;
    barricade.castShadow = true;
    barricade.receiveShadow = true;
    group.add(barricade);

    const stripe = new THREE.Mesh(this.geometries.hurdleStripe, this.materials.trainTrim);
    stripe.position.y = height * 0.7;
    group.add(stripe);

    return group;
  }
}
