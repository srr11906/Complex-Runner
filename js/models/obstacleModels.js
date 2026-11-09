/**
 * COMPLEX RUNNER - Next-Gen 3D Sci-Fi Runner
 * Dystopian Floating Magnetic Repulsor Cargo Trains & Obstacles
 */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { CONFIG } from "../config.js?v=20261108_hardened_v84";
import { textureGen } from "../world/textureGenerator.js?v=20261108_hardened_v84";
import { assetLoader } from "./assetLoader3D.js?v=20261108_hardened_v84";

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
      // 6 Distinct Luxury Train Materials for The Complex (Rich, High-Gloss, High-Contrast)
      complexTrains: [
        {
          name: "pearl_cream",
          body: new THREE.MeshStandardMaterial({ color: 0xFDFBF7, roughness: 0.16, metalness: 0.88 }),
          trim: new THREE.MeshStandardMaterial({ color: 0xF59E0B, roughness: 0.20, metalness: 0.95 }),
          roof: new THREE.MeshStandardMaterial({ color: 0xE2E8F0, roughness: 0.22, metalness: 0.80 }),
          window: new THREE.MeshBasicMaterial({ color: 0x00E5FF })
        },
        {
          name: "royal_obsidian",
          body: new THREE.MeshStandardMaterial({ color: 0x0B0F17, roughness: 0.12, metalness: 0.96 }),
          trim: new THREE.MeshStandardMaterial({ color: 0xFBBF24, roughness: 0.18, metalness: 0.95 }),
          roof: new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.22, metalness: 0.85 }),
          window: new THREE.MeshBasicMaterial({ color: 0x38BDF8 })
        },
        {
          name: "electric_aqua",
          body: new THREE.MeshStandardMaterial({ color: 0x06B6D4, roughness: 0.14, metalness: 0.90 }),
          trim: new THREE.MeshStandardMaterial({ color: 0xF1F5F9, roughness: 0.16, metalness: 0.95 }),
          roof: new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.20, metalness: 0.82 }),
          window: new THREE.MeshBasicMaterial({ color: 0xFFFFFF })
        },
        {
          name: "imperial_ruby",
          body: new THREE.MeshStandardMaterial({ color: 0x9F1239, roughness: 0.16, metalness: 0.85 }),
          trim: new THREE.MeshStandardMaterial({ color: 0xFBBF24, roughness: 0.18, metalness: 0.95 }),
          roof: new THREE.MeshStandardMaterial({ color: 0x4C0519, roughness: 0.25, metalness: 0.78 }),
          window: new THREE.MeshBasicMaterial({ color: 0xFDE047 })
        },
        {
          name: "solar_amber",
          body: new THREE.MeshStandardMaterial({ color: 0xD97706, roughness: 0.15, metalness: 0.88 }),
          trim: new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.20, metalness: 0.92 }),
          roof: new THREE.MeshStandardMaterial({ color: 0x78350F, roughness: 0.25, metalness: 0.78 }),
          window: new THREE.MeshBasicMaterial({ color: 0x00E5FF })
        },
        {
          name: "emerald_jade",
          body: new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.15, metalness: 0.88 }),
          trim: new THREE.MeshStandardMaterial({ color: 0xFDE68A, roughness: 0.18, metalness: 0.95 }),
          roof: new THREE.MeshStandardMaterial({ color: 0x064E3B, roughness: 0.25, metalness: 0.78 }),
          window: new THREE.MeshBasicMaterial({ color: 0x6EE7B7 })
        }
      ],
      complexRampSurface: new THREE.MeshStandardMaterial({
        color: 0xE2E8F0,
        roughness: 0.20,
        metalness: 0.88,
        side: THREE.DoubleSide
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
      amberBlinkerOn: new THREE.MeshBasicMaterial({
        color: 0xFFB300
      }),
      amberBlinkerOff: new THREE.MeshBasicMaterial({
        color: 0x331A00
      }),
      amberBlinkerDynamic: new THREE.MeshBasicMaterial({
        color: 0xFFB300
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
      gateLightNode: new THREE.SphereGeometry(0.22, 10, 10),
      gateCrossBeam: new THREE.BoxGeometry(3.6, 0.45, 0.4),
      gateChevronGeo: new THREE.ConeGeometry(0.14, 0.28, 4),
      gateLaser: new THREE.CylinderGeometry(0.045, 0.045, 3.2, 8),
      hurdleFootGeo: new THREE.BoxGeometry(0.35, 0.16, 0.65),
      hurdlePillarGeo: new THREE.CylinderGeometry(0.06, 0.08, 1.05, 8),
      hurdlePlankGeo: new THREE.BoxGeometry(2.4, 0.30, 0.10),
      hurdleStripeGeo: new THREE.BoxGeometry(2.42, 0.12, 0.12),
      hurdleBeaconGeo: new THREE.SphereGeometry(0.12, 8, 8),
      hurdleBeaconMount: new THREE.BoxGeometry(0.4, 0.08, 0.14),
      rampGuideEdge: new THREE.BoxGeometry(0.06, 0.12, 9.0),
      rampCenterTread: new THREE.BoxGeometry(0.7, 0.04, 8.8),
      bellowsRingGeo: new THREE.BoxGeometry(2.45, 3.2, 0.22),
      couplerPlateGeo: new THREE.BoxGeometry(1.6, 0.12, 1.8),
      couplerRodGeo: new THREE.CylinderGeometry(0.08, 0.08, 1.6, 8),
      jerseyBaseGeo: new THREE.BoxGeometry(2.5, 0.75, 0.70),
      jerseyStripeGeo: new THREE.BoxGeometry(2.52, 0.18, 0.72),
      blockerUprightGeo: new THREE.BoxGeometry(0.14, 2.9, 0.14),
      blockerCrossBeamGeo: new THREE.BoxGeometry(2.45, 0.12, 0.12),
      blockerSignPlateGeo: new THREE.BoxGeometry(2.35, 1.45, 0.08),
      blockerChevronPlateGeo: new THREE.BoxGeometry(0.35, 0.70, 0.10),
      blockerFenceGeo: new THREE.PlaneGeometry(2.35, 2.0),
      blockerBeacon: new THREE.SphereGeometry(0.18, 8, 8),
      gateCrossStripe: new THREE.BoxGeometry(3.62, 0.15, 0.42),
      hurdleConcreteFoot: new THREE.BoxGeometry(0.48, 0.22, 0.85),
      hurdlePlankLow: new THREE.BoxGeometry(2.4, 0.42, 0.14),
      hurdlePlankMid: new THREE.BoxGeometry(2.4, 0.42, 0.14),
      hurdlePlankTop: new THREE.BoxGeometry(2.44, 0.46, 0.18),
      hurdleLightStrip: new THREE.BoxGeometry(1.6, 0.08, 0.20),
      hurdleTallPillarGeo: new THREE.CylinderGeometry(0.09, 0.11, 1.85, 8),
      hurdleKickstandGeo: new THREE.CylinderGeometry(0.06, 0.06, 1.25, 8),
      hurdleBeaconCrownGeo: new THREE.CylinderGeometry(0.12, 0.14, 0.12, 8),
      hurdleBeaconSphereGeo: new THREE.SphereGeometry(0.16, 8, 8),
      hurdleXBraceGeo: new THREE.CylinderGeometry(0.05, 0.05, 2.40, 6),
      blockerArrowGeo: new THREE.BoxGeometry(1.6, 0.8, 0.08),
      blockerSignBoxGeo: new THREE.BoxGeometry(2.38, 1.48, 0.18),
      coachWindowGeo: new THREE.BoxGeometry(2.64, 0.78, 1.35),
      coachDoorGeo: new THREE.BoxGeometry(2.65, 2.15, 1.40),
      doorIndicatorLightGeo: new THREE.BoxGeometry(2.66, 0.08, 0.24),
      trainWindshieldGeo: new THREE.BoxGeometry(2.20, 0.85, 0.28),
      trainCabSideWindowGeo: new THREE.BoxGeometry(2.64, 0.70, 1.10),
      roofAcUnitGeo: new THREE.BoxGeometry(1.40, 0.20, 2.80),
      trainTailLightGeo: new THREE.BoxGeometry(0.24, 0.14, 0.08)
    };

    this.materials.trainTailLight = new THREE.MeshBasicMaterial({ color: 0xEF4444 });
    this.materials.doorIndicatorLight = new THREE.MeshBasicMaterial({ color: 0x10B981 });
    this.materials.coachDoorMat = new THREE.MeshStandardMaterial({
      color: 0x1E293B,
      roughness: 0.35,
      metalness: 0.85
    });
    this.materials.blockerBeacon = new THREE.MeshBasicMaterial({ color: 0xEF4444 });
    this.materials.hazardStripe = new THREE.MeshStandardMaterial({
      color: 0xF59E0B,
      roughness: 0.35,
      metalness: 0.75
    });
    this.materials.jerseyConcrete = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.90,
      metalness: 0.10
    });
    this.materials.detourPlate = new THREE.MeshStandardMaterial({
      color: 0x0F172A,
      roughness: 0.40,
      metalness: 0.85
    });
    this.materials.chevronNeon = new THREE.MeshBasicMaterial({
      color: 0xFBBF24
    });
    this.materials.chevronBlack = new THREE.MeshStandardMaterial({
      color: 0x000000,
      roughness: 0.95
    });
    this.materials.wireMesh = new THREE.MeshStandardMaterial({
      color: 0x64748B,
      wireframe: true
    });
    this.materials.hurdlePlankMat = new THREE.MeshStandardMaterial({
      map: textureGen.getHurdlePlankTexture(),
      roughness: 0.42,
      metalness: 0.70
    });

    this.detourSignMaterials = new Map();
    this.detourArrowMaterials = new Map();

    this.trainBodyGeos = {};
    this.trainRoofGeos = {};
    this.trainLiveryGeos = {};
    this.rampGeo = this.buildRampGeometry(2.6, 9.0, 4.15);
    this.rampStripeGeo = new THREE.BoxGeometry(0.18, 0.1, 9.0);
  }

  getDetourSignMaterials(detourDirection) {
    if (!this.detourSignMaterials.has(detourDirection)) {
      const signTexture = textureGen.getDetourSignTexture(detourDirection);
      const signFrontMat = new THREE.MeshStandardMaterial({
        map: signTexture,
        roughness: 0.35,
        metalness: 0.70
      });
      const mats = [
        this.materials.carbonFrame,
        this.materials.carbonFrame,
        this.materials.carbonFrame,
        this.materials.carbonFrame,
        signFrontMat,
        this.materials.carbonFrame
      ];
      this.detourSignMaterials.set(detourDirection, mats);
    }
    return this.detourSignMaterials.get(detourDirection);
  }

  getDetourArrowMaterial(detourDirection) {
    if (!this.detourArrowMaterials.has(detourDirection)) {
      const mat = new THREE.MeshStandardMaterial({
        map: textureGen.getDetourSignTexture(detourDirection),
        roughness: 0.35,
        metalness: 0.70
      });
      this.detourArrowMaterials.set(detourDirection, mat);
    }
    return this.detourArrowMaterials.get(detourDirection);
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

  getTrainLiveryGeo(length) {
    if (!this.trainLiveryGeos[length]) {
      this.trainLiveryGeos[length] = new THREE.BoxGeometry(2.63, 0.14, Math.max(0.5, length - 0.4));
    }
    return this.trainLiveryGeos[length];
  }

  /**
   * Adds authentic high-speed train coach detailing to any car (Engine Cab or Passenger/Cargo Coach)
   * Left & Right flank windows, sliding doors with LED indicators, metallic liveries, rooftop HVAC pods, red tail lights
   */
  addCoachDetails(group, carCenterZ, carLength, width, bodyHeight, floatElevation, trainMats, isEngine = false, hasRearDoor = false) {
    // 1. Sleek Flank Livery Accent Stripe along both sides of this car
    const livery = new THREE.Mesh(this.getTrainLiveryGeo(carLength), trainMats.trim);
    livery.position.set(0, floatElevation + bodyHeight * 0.42, carCenterZ);
    group.add(livery);

    // 2. Rooftop Aerodynamic Climate Pod (HVAC cooler unit)
    const acUnit = new THREE.Mesh(this.geometries.roofAcUnitGeo, this.materials.carbonFrame);
    acUnit.position.set(0, floatElevation + bodyHeight + 0.12, carCenterZ);
    group.add(acUnit);

    const windowY = floatElevation + bodyHeight * 0.65;

    if (isEngine) {
      // FRONT ENGINE CAB:
      // A. Aerodynamic Cockpit Windshield Visor (Tilted forward over the cab nose)
      const visor = new THREE.Mesh(this.geometries.trainWindshieldGeo, trainMats.window);
      visor.rotation.x = 0.22;
      visor.position.set(0, floatElevation + bodyHeight * 0.72, carCenterZ + carLength / 2 - 0.15);
      group.add(visor);

      // B. Driver Side Cab Windows (left & right)
      const cabWindow = new THREE.Mesh(this.geometries.trainCabSideWindowGeo, trainMats.window);
      cabWindow.position.set(0, windowY, carCenterZ + carLength / 2 - 1.8);
      group.add(cabWindow);

      // C. Mid/Aft Crew Windows along engine flank
      const crewZOffsets = [-carLength / 4, 0];
      for (const zRel of crewZOffsets) {
        const win = new THREE.Mesh(this.geometries.coachWindowGeo, trainMats.window);
        win.position.set(0, windowY, carCenterZ + zRel);
        group.add(win);
      }
    } else {
      // PASSENGER / CARGO COACH:
      // A. Passenger Entry Sliding Doors with Emerald Status Indicators
      const door = new THREE.Mesh(this.geometries.coachDoorGeo, this.materials.coachDoorMat);
      door.position.set(0, floatElevation + 1.10, carCenterZ);
      group.add(door);

      const doorLight = new THREE.Mesh(this.geometries.doorIndicatorLightGeo, this.materials.doorIndicatorLight);
      doorLight.position.set(0, floatElevation + 2.22, carCenterZ);
      group.add(doorLight);

      // B. Symmetrical Rows of Illuminated Passenger Windows (both flanks)
      const winOffsets = [-carLength * 0.35, -carLength * 0.18, carLength * 0.18, carLength * 0.35];
      for (const zRel of winOffsets) {
        if (Math.abs(zRel) < carLength / 2 - 1.0) {
          const win = new THREE.Mesh(this.geometries.coachWindowGeo, trainMats.window);
          win.position.set(0, windowY, carCenterZ + zRel);
          group.add(win);
        }
      }

      // C. Red glowing tail lights at rear bulkhead if rear car
      if (hasRearDoor) {
        const rearZ = carCenterZ - carLength / 2 - 0.04;
        for (const tx of [-0.92, 0.92]) {
          const tailLight = new THREE.Mesh(this.geometries.trainTailLightGeo, this.materials.trainTailLight);
          tailLight.position.set(tx, floatElevation + 1.15, rearZ);
          group.add(tailLight);
        }
      }
    }
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

  setTheme(theme = "wasteland") {
    this.currentTheme = theme;
  }

  getNextTrainMaterialSet() {
    if (this.currentTheme === "complex" && this.materials.complexTrains) {
      this.complexTrainPaletteIndex = (this.complexTrainPaletteIndex || 0) + 1;
      const palette = this.materials.complexTrains[this.complexTrainPaletteIndex % this.materials.complexTrains.length];
      return {
        body: palette.body,
        trim: palette.trim,
        roof: palette.roof,
        ramp: this.materials.complexRampSurface,
        window: palette.window
      };
    }
    return {
      body: this.materials.trainArmor,
      trim: this.materials.trainTrim,
      roof: this.materials.roofGrating,
      ramp: this.materials.rampSurface,
      window: this.materials.headlightGlow
    };
  }

  freezeStaticChildren(group) {
    if (!group) return group;
    group.traverse((child) => {
      if (child !== group) {
        child.updateMatrix();
        child.matrixAutoUpdate = false;
      }
    });
    return group;
  }

  createMaglevTrain(hasRamp = false, isMoving = false, length = 22.0) {
    if (!length || length <= 0) {
      length = 22.0;
    }
    const group = new THREE.Group();
    group.userData.type = "train";
    group.userData.hasRamp = hasRamp;
    group.userData.isMoving = isMoving;
    group.userData.moveSpeed = isMoving ? 3.0 : 0; // Fair, smooth advance speed
    group.userData.hp = 10;
    group.userData.maxHp = 10;
    group.userData.trainLength = length;

    const trainMats = this.getNextTrainMaterialSet();
    const width = 2.6;
    const bodyHeight = 3.4;
    const floatElevation = 0.75;
    const totalTopY = floatElevation + bodyHeight;

    if (isMoving) {
      group.rotation.y = Math.PI; // Reverse train direction so front nose & headlights face oncoming player!
      group.userData.moveSpeed = 11.5; // Responsive Subway Surfers forward approach speed
      
      // Dual Subway Surfers Emergency Hazard Warning Blinkers on Cab Roof
      const blinkers = [];
      for (let bx of [-0.65, 0.65]) {
        const beacon = new THREE.Mesh(this.geometries.warningBeaconDome, this.materials.amberBlinkerDynamic);
        beacon.position.set(bx, totalTopY + 0.16, length / 2 + 1.2);
        group.add(beacon);
        blinkers.push(beacon);
      }
      group.userData.blinkers = blinkers;
      group.userData.hasHornSounded = false;
      group.userData.hasPassSounded = false;
    }

    const hasGLB = assetLoader.has("train_high_speed_nose");
    if (hasGLB) {
      const trainModel = assetLoader.createInstance("train_high_speed_nose", {
        targetLength: length,
        targetWidth: width,
        targetHeight: bodyHeight
      });
      if (trainModel) {
        trainModel.position.set(0, floatElevation, 0);
        group.add(trainModel);
      }
    } else {
      const body = new THREE.Mesh(this.getTrainBodyGeo(length), trainMats.body);
      body.position.y = floatElevation + bodyHeight / 2;
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);

      const nose = new THREE.Mesh(this.geometries.trainNose, trainMats.body);
      nose.rotation.x = Math.PI / 2;
      nose.position.set(0, floatElevation + bodyHeight / 2, length / 2 + 0.2);
      group.add(nose);

      const grill = new THREE.Mesh(this.geometries.trainGrill, this.materials.grillMat);
      grill.position.set(0, floatElevation + 1.2, length / 2 + 1.8);
      group.add(grill);

      for (let gy = -0.7; gy <= 0.7; gy += 0.35) {
        const slat = new THREE.Mesh(this.geometries.grillSlat, trainMats.trim);
        slat.position.set(0, floatElevation + 1.2 + gy, length / 2 + 1.8);
        group.add(slat);
      }

      for (let x of [-0.85, 0.85]) {
        const headlight = new THREE.Mesh(this.geometries.headlight, trainMats.window);
        headlight.position.set(x, floatElevation + bodyHeight * 0.7, length / 2 + 1.85);
        group.add(headlight);
      }

      // Add high-speed train coach detailing (cockpit visor, driver windows, side passenger windows, flank liveries)
      this.addCoachDetails(group, 0, length, width, bodyHeight, floatElevation, trainMats, true, hasRamp);
    }

    if (!hasGLB) {
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

      const roofGrate = new THREE.Mesh(this.getTrainRoofGeo(length), trainMats.roof);
      roofGrate.position.set(0, totalTopY + 0.04, 0);
      group.add(roofGrate);
    }

    if (hasRamp) {
      const rampLength = 9.0;
      const rampZOffset = -length / 2 - rampLength / 2;
      const rampAngle = -Math.atan2(totalTopY, rampLength);

      // Solid Ramp Body (with full UVs and normal maps)
      const solidRampMesh = new THREE.Mesh(this.rampGeo, trainMats.ramp);
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

    return this.freezeStaticChildren(group);
  }

  /**
   * 2-Compartment Articulated Maglev Cargo Train (Engine + Articulated Bellows + Rear Coach)
   */
  createTwoCompartmentTrain(hasRamp = false, isMoving = false, carLength = 13.5) {
    if (!carLength || carLength <= 0) {
      carLength = 13.5;
    }
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

    const trainMats = this.getNextTrainMaterialSet();
    const width = 2.6;
    const bodyHeight = 3.4;
    const floatElevation = 0.75;
    const totalTopY = floatElevation + bodyHeight;

    const frontCarZ = couplerLength / 2 + carLength / 2; // +7.55
    const rearCarZ = -(couplerLength / 2 + carLength / 2); // -7.55

    if (isMoving) {
      group.rotation.y = Math.PI; // Face oncoming player
      group.userData.moveSpeed = 12.0;

      // Dual Subway Surfers Emergency Hazard Warning Blinkers on Engine Cab Roof
      const blinkers = [];
      for (let bx of [-0.65, 0.65]) {
        const beacon = new THREE.Mesh(this.geometries.warningBeaconDome, this.materials.amberBlinkerDynamic);
        beacon.position.set(bx, totalTopY + 0.16, frontCarZ + carLength / 2 + 1.2);
        group.add(beacon);
        blinkers.push(beacon);
      }
      group.userData.blinkers = blinkers;
      group.userData.hasHornSounded = false;
      group.userData.hasPassSounded = false;
    }

    // 1. Front Engine Car (T3: train_metro_car or procedural fallback)
    if (assetLoader.has("train_metro_car")) {
      const frontModel = assetLoader.createInstance("train_metro_car", {
        targetLength: carLength,
        targetWidth: width,
        targetHeight: bodyHeight
      });
      if (frontModel) {
        frontModel.position.set(0, floatElevation, frontCarZ);
        group.add(frontModel);
      }
    } else {
      const frontBody = new THREE.Mesh(this.getTrainBodyGeo(carLength), trainMats.body);
      frontBody.position.set(0, floatElevation + bodyHeight / 2, frontCarZ);
      frontBody.castShadow = true;
      frontBody.receiveShadow = true;
      group.add(frontBody);

      const nose = new THREE.Mesh(this.geometries.trainNose, trainMats.body);
      nose.rotation.x = Math.PI / 2;
      nose.position.set(0, floatElevation + bodyHeight / 2, frontCarZ + carLength / 2 + 0.2);
      group.add(nose);

      const grill = new THREE.Mesh(this.geometries.trainGrill, this.materials.grillMat);
      grill.position.set(0, floatElevation + 1.2, frontCarZ + carLength / 2 + 1.8);
      group.add(grill);

      for (let gy = -0.7; gy <= 0.7; gy += 0.35) {
        const slat = new THREE.Mesh(this.geometries.grillSlat, trainMats.trim);
        slat.position.set(0, floatElevation + 1.2 + gy, frontCarZ + carLength / 2 + 1.8);
        group.add(slat);
      }

      for (let x of [-0.85, 0.85]) {
        const headlight = new THREE.Mesh(this.geometries.headlight, trainMats.window);
        headlight.position.set(x, floatElevation + bodyHeight * 0.7, frontCarZ + carLength / 2 + 1.85);
        group.add(headlight);
      }

      // Front Engine Cab detailing: visor, driver windows, crew windows, flank livery
      this.addCoachDetails(group, frontCarZ, carLength, width, bodyHeight, floatElevation, trainMats, true, false);
    }

    // 2. Articulated Bellows Gangway (Center Coupler at z = 0)
    for (let bz = -0.6; bz <= 0.6; bz += 0.3) {
      const bellow = new THREE.Mesh(this.geometries.bellowsRingGeo, this.materials.bellowsMat);
      bellow.position.set(0, floatElevation + bodyHeight / 2, bz);
      group.add(bellow);
    }

    // Seamless Coupler Roof Bridge Plate
    const couplerBridge = new THREE.Mesh(this.geometries.couplerPlateGeo, trainMats.roof);
    couplerBridge.position.set(0, totalTopY + 0.04, 0);
    group.add(couplerBridge);

    // Dual Heavy Hydraulic Coupling Struts
    for (let s of [-0.9, 0.9]) {
      const rod = new THREE.Mesh(this.geometries.couplerRodGeo, this.materials.carbonFrame);
      rod.rotation.x = Math.PI / 2;
      rod.position.set(s, floatElevation + 0.6, 0);
      group.add(rod);
    }

    // 3. Rear Cargo Coach (T4: train_metro_coach or procedural fallback)
    if (assetLoader.has("train_metro_coach")) {
      const rearModel = assetLoader.createInstance("train_metro_coach", {
        targetLength: carLength,
        targetWidth: width,
        targetHeight: bodyHeight
      });
      if (rearModel) {
        rearModel.position.set(0, floatElevation, rearCarZ);
        group.add(rearModel);
      }
    } else {
      const rearBody = new THREE.Mesh(this.getTrainBodyGeo(carLength), trainMats.body);
      rearBody.position.set(0, floatElevation + bodyHeight / 2, rearCarZ);
      rearBody.castShadow = true;
      rearBody.receiveShadow = true;
      group.add(rearBody);

      // Rear Passenger Coach detailing: passenger sliding doors, row of illuminated passenger windows, red tail lights
      this.addCoachDetails(group, rearCarZ, carLength, width, bodyHeight, floatElevation, trainMats, false, true);
    }

    const hasGLBTwo = assetLoader.has("train_metro_car") || assetLoader.has("train_metro_coach");
    if (!hasGLBTwo) {
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
      const frontRoof = new THREE.Mesh(this.getTrainRoofGeo(carLength), trainMats.roof);
      frontRoof.position.set(0, totalTopY + 0.04, frontCarZ);
      group.add(frontRoof);

      const rearRoof = new THREE.Mesh(this.getTrainRoofGeo(carLength), trainMats.roof);
      rearRoof.position.set(0, totalTopY + 0.04, rearCarZ);
      group.add(rearRoof);
    }

    // 4. Optional Climbable Rear Ramp attached to the back of the rear coach
    if (hasRamp) {
      const rampLength = 9.0;
      const rampZOffset = -totalTrainLength / 2 - rampLength / 2;
      const rampAngle = -Math.atan2(totalTopY, rampLength);

      const solidRampMesh = new THREE.Mesh(this.rampGeo, trainMats.ramp);
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

    return this.freezeStaticChildren(group);
  }

  createPlasmaGate() {
    const group = new THREE.Group();
    group.userData.type = "laser_gate";
    group.userData.requiresSlide = true;
    group.userData.hp = 6;
    group.userData.maxHp = 6;

    const width = 3.2;
    const height = 3.6;

    if (assetLoader.has("barrier_blast_gate")) {
      const gateModel = assetLoader.createInstance("barrier_blast_gate", {
        targetWidth: width,
        targetHeight: height
      });
      if (gateModel) {
        gateModel.position.set(0, 0, 0);
        group.add(gateModel);
      }
    } else {
      // 1. Heavy Industrial Steel Uprights with Hazard Bands
      for (let side of [-1, 1]) {
        const pillar = new THREE.Mesh(this.geometries.gatePillar, this.materials.carbonFrame);
        pillar.position.set(side * (width / 2), height / 2, 0);
        pillar.castShadow = true;
        group.add(pillar);

        // Warning Strobe Nodes at Crown
        const lightNode = new THREE.Mesh(this.geometries.gateLightNode, this.materials.repulsorPlasma);
        lightNode.position.set(side * (width / 2), height - 0.2, 0);
        group.add(lightNode);
      }

      // 2. High-Voltage Overhead Gantry Box Housing
      const crossBeam = new THREE.Mesh(this.geometries.gateCrossBeam, this.materials.carbonFrame);
      crossBeam.position.set(0, height - 0.22, 0);
      group.add(crossBeam);

      // Hazard Stripes on Overhead Crossbar
      const crossStripe = new THREE.Mesh(this.geometries.gateCrossStripe, this.materials.hazardStripe);
      crossStripe.position.set(0, height - 0.22, 0);
      group.add(crossStripe);

      // Downward Pointing Neon Slide Indicator Chevrons (Guides player: SLIDE UNDER!)
      for (let cx of [-0.8, 0, 0.8]) {
        const chevron = new THREE.Mesh(this.geometries.gateChevronGeo, this.materials.chevronNeon);
        chevron.position.set(cx, height - 0.55, 0.22);
        chevron.rotation.x = Math.PI; // Inverted cone pointing downward
        group.add(chevron);
      }
    }

    // 3. Dense Electrified High-Voltage Lasers (y = 1.45 to 2.65m, leaving 0-1.25m free for slide)
    for (let beamY of [1.45, 2.05, 2.65]) {
      const laser = new THREE.Mesh(this.geometries.gateLaser, this.materials.plasmaBeam);
      laser.rotation.z = Math.PI / 2;
      laser.position.set(0, beamY, 0);
      group.add(laser);
    }

    return this.freezeStaticChildren(group);
  }

  createPlasmaSlideGate() {
    return this.createPlasmaGate();
  }

  createLowHurdle() {
    const group = new THREE.Group();
    group.userData.type = "hurdle";
    group.userData.requiresJump = true;
    group.userData.hp = 6;
    group.userData.maxHp = 6;

    const height = 1.85; // Imposing, tall 1.85m industrial barricade (chest/eye height) - cleared cleanly by 2.8m jump!
    group.userData.height = height;
    const width = 2.68;

    const hasBarricade = assetLoader.has("barrier_road_barricade");
    const hasRoadblock = assetLoader.has("barrier_concrete_roadblock");

    if (hasBarricade || hasRoadblock) {
      const modelKey = hasBarricade ? "barrier_road_barricade" : "barrier_concrete_roadblock";
      const hurdleModel = assetLoader.createInstance(modelKey, {
        targetWidth: width,
        targetHeight: height,
        clampLaneWidth: true
      });
      if (hurdleModel) {
        hurdleModel.position.set(0, 0, 0);
        group.add(hurdleModel);
      }
    } else {
      // 1. Heavy Weighted Base Concrete Footings & Dual A-Frame Struts
      for (let side of [-1, 1]) {
        const legX = side * (width / 2 - 0.16);

        // Heavy industrial concrete footing block
        const foot = new THREE.Mesh(this.geometries.hurdleConcreteFoot, this.materials.jerseyConcrete);
        foot.position.set(legX, 0.11, 0);
        foot.castShadow = true;
        group.add(foot);

        // Vertical structural steel upright
        const pillar = new THREE.Mesh(this.geometries.hurdleTallPillarGeo, this.materials.carbonFrame);
        pillar.position.set(legX, height / 2, 0);
        pillar.castShadow = true;
        group.add(pillar);

        // Angled rear diagonal kickstand strut (gives realistic 3D depth and weight)
        const strut = new THREE.Mesh(this.geometries.hurdleKickstandGeo, this.materials.carbonFrame);
        strut.position.set(legX, 0.65, -0.32);
        strut.rotation.x = -0.55;
        strut.castShadow = true;
        group.add(strut);

        // Top Hazard Warning Strobe Beacon on each pillar crown
        const beaconBase = new THREE.Mesh(this.geometries.hurdleBeaconCrownGeo, this.materials.carbonFrame);
        beaconBase.position.set(legX, height + 0.06, 0);
        group.add(beaconBase);

        const beacon = new THREE.Mesh(this.geometries.hurdleBeaconSphereGeo, this.materials.amberBlinkerOn);
        beacon.position.set(legX, height + 0.18, 0);
        group.add(beacon);
      }

      // 2. Heavy Diagonal Steel X-Brace between Uprights
      for (let dir of [-1, 1]) {
        const brace = new THREE.Mesh(this.geometries.hurdleXBraceGeo, this.materials.carbonFrame);
        brace.position.set(0, 1.05, -0.05);
        brace.rotation.z = dir * Math.atan2(1.2, width - 0.32);
        group.add(brace);
      }

      // 3. Triple Stacked Heavy Barricade Planks with Diagonal Hazard Striping (Pre-allocated Shared Geometries & Material)
      const plankConfigs = [
        { y: 0.52, geo: this.geometries.hurdlePlankLow },
        { y: 1.10, geo: this.geometries.hurdlePlankMid },
        { y: 1.68, geo: this.geometries.hurdlePlankTop }
      ];

      for (let cfg of plankConfigs) {
        const plank = new THREE.Mesh(cfg.geo, this.materials.hurdlePlankMat);
        plank.position.set(0, cfg.y, 0);
        plank.castShadow = true;
        plank.receiveShadow = true;
        group.add(plank);
      }
    }

    // 4. Central Warning Light Strip on Top Beam
    const lightStrip = new THREE.Mesh(this.geometries.hurdleLightStrip, this.materials.amberBlinkerOn);
    lightStrip.position.set(0, 1.93, 0);
    group.add(lightStrip);

    return this.freezeStaticChildren(group);
  }

  /**
   * Subway Surfers Fortified Roadblock / Detour Barrier (Lane Change Blocker)
   * Impassable 3.8m tall fortified barrier - cannot be jumped or slid under, forces a lane change!
   */
  createTallBlocker(detourDirection = "right") {
    const group = new THREE.Group();
    group.userData.type = "blocker";
    group.userData.requiresLaneChange = true;
    group.userData.hp = 8;
    group.userData.maxHp = 8;

    const height = 3.8;

    const hasWall = assetLoader.has("barrier_container_wall");
    const hasGuide = assetLoader.has("barrier_reflective_guide");

    if (hasWall || hasGuide) {
      const modelKey = hasWall ? "barrier_container_wall" : "barrier_reflective_guide";
      const blockerModel = assetLoader.createInstance(modelKey, {
        targetWidth: 2.6,
        targetHeight: height,
        clampLaneWidth: true
      });
      if (blockerModel) {
        blockerModel.position.set(0, 0, 0);
        group.add(blockerModel);
      }

      // High-visibility detour indicator mounted cleanly on top/face (Pre-allocated Geometry & Material)
      const arrowMesh = new THREE.Mesh(this.geometries.blockerArrowGeo, this.getDetourArrowMaterial(detourDirection));
      arrowMesh.position.set(0, 2.2, 0.35);
      group.add(arrowMesh);

      // Warning strobe on crown
      for (let bx of [-0.9, 0.9]) {
        const beacon = new THREE.Mesh(this.geometries.blockerBeacon, this.materials.blockerBeacon);
        beacon.position.set(bx, height + 0.1, 0);
        group.add(beacon);
      }
    } else {
      // 1. Reinforced Concrete Jersey Crash Barrier Base (Weighted foundation)
      const base = new THREE.Mesh(this.geometries.jerseyBaseGeo, this.materials.jerseyConcrete);
      base.position.set(0, 0.38, 0);
      base.castShadow = true;
      base.receiveShadow = true;
      group.add(base);

      const baseStripe = new THREE.Mesh(this.geometries.jerseyStripeGeo, this.materials.hazardStripe);
      baseStripe.position.set(0, 0.38, 0);
      group.add(baseStripe);

      // 2. Heavy Dual Carbon Steel Framework Uprights
      for (let side of [-1, 1]) {
        const upright = new THREE.Mesh(this.geometries.blockerUprightGeo, this.materials.carbonFrame);
        upright.position.set(side * 1.15, 2.15, 0);
        group.add(upright);
      }

      // Heavy Horizontal Cross Beams
      for (let cy of [1.15, 2.95, 3.55]) {
        const beam = new THREE.Mesh(this.geometries.blockerCrossBeamGeo, this.materials.carbonFrame);
        beam.position.set(0, cy, 0);
        group.add(beam);
      }

      // 3. High-Visibility Illuminated Detour Signboard (Pre-allocated Shared Geometry & Materials)
      const signMaterials = this.getDetourSignMaterials(detourDirection);
      const signBox = new THREE.Mesh(this.geometries.blockerSignBoxGeo, signMaterials);
      signBox.position.set(0, 2.22, 0.04);
      signBox.castShadow = true;
      group.add(signBox);

      // 4. Dual Top-Mounted High-Intensity Hazard Warning Beacons
      for (let bx of [-1.15, 1.15]) {
        const beacon = new THREE.Mesh(this.geometries.blockerBeacon, this.materials.blockerBeacon);
        beacon.position.set(bx, 3.68, 0);
        group.add(beacon);
      }
    }

    return this.freezeStaticChildren(group);
  }

  /**
   * 3-Compartment Heavy Maglev Freight Train (Train_Static_3 / Train_Moving_3)
   * Subway Surfers flagship 3-wagon consist: Engine + Mid Cargo + Rear Coach (Total length: ~37.7m)
   */
  createThreeCompartmentTrain(hasRamp = false, isMoving = false, carLength = 11.5) {
    if (!carLength || carLength <= 0) {
      carLength = 11.5;
    }
    const group = new THREE.Group();
    const couplerLength = 1.6;
    const totalTrainLength = carLength * 3 + couplerLength * 2; // 37.7m

    group.userData.type = "train";
    group.userData.hasRamp = hasRamp;
    group.userData.isMoving = isMoving;
    group.userData.moveSpeed = isMoving ? 3.0 : 0;
    group.userData.hp = 24;
    group.userData.maxHp = 24;
    group.userData.trainLength = totalTrainLength;
    group.userData.carCount = 3;

    const trainMats = this.getNextTrainMaterialSet();
    const width = 2.6;
    const bodyHeight = 3.4;
    const floatElevation = 0.75;
    const totalTopY = floatElevation + bodyHeight;

    const carSpacing = carLength + couplerLength; // 13.1m
    const frontCarZ = carSpacing;                 // +13.1m
    const midCarZ = 0;                            // 0.0m
    const rearCarZ = -carSpacing;                 // -13.1m

    if (isMoving) {
      group.rotation.y = Math.PI; // Face oncoming player
      group.userData.moveSpeed = 12.0;

      // Dual Subway Surfers Emergency Hazard Warning Blinkers on Engine Cab Roof
      const blinkers = [];
      for (let bx of [-0.65, 0.65]) {
        const beacon = new THREE.Mesh(this.geometries.warningBeaconDome, this.materials.amberBlinkerDynamic);
        beacon.position.set(bx, totalTopY + 0.16, frontCarZ + carLength / 2 + 1.2);
        group.add(beacon);
        blinkers.push(beacon);
      }
      group.userData.blinkers = blinkers;
      group.userData.hasHornSounded = false;
    }

    // 1. Front Engine Car (T5: train_freight_locomotive or procedural fallback)
    if (assetLoader.has("train_freight_locomotive")) {
      const frontModel = assetLoader.createInstance("train_freight_locomotive", {
        targetLength: carLength,
        targetWidth: width,
        targetHeight: bodyHeight
      });
      if (frontModel) {
        frontModel.position.set(0, floatElevation, frontCarZ);
        group.add(frontModel);
      }
    } else {
      const frontBody = new THREE.Mesh(this.getTrainBodyGeo(carLength), trainMats.body);
      frontBody.position.set(0, floatElevation + bodyHeight / 2, frontCarZ);
      frontBody.castShadow = true;
      frontBody.receiveShadow = true;
      group.add(frontBody);

      const nose = new THREE.Mesh(this.geometries.trainNose, trainMats.body);
      nose.rotation.x = Math.PI / 2;
      nose.position.set(0, floatElevation + bodyHeight / 2, frontCarZ + carLength / 2 + 0.2);
      group.add(nose);

      const grill = new THREE.Mesh(this.geometries.trainGrill, this.materials.grillMat);
      grill.position.set(0, floatElevation + 1.2, frontCarZ + carLength / 2 + 1.8);
      group.add(grill);

      for (let gy = -0.7; gy <= 0.7; gy += 0.35) {
        const slat = new THREE.Mesh(this.geometries.grillSlat, trainMats.trim);
        slat.position.set(0, floatElevation + 1.2 + gy, frontCarZ + carLength / 2 + 1.8);
        group.add(slat);
      }

      for (let x of [-0.85, 0.85]) {
        const headlight = new THREE.Mesh(this.geometries.headlight, trainMats.window);
        headlight.position.set(x, floatElevation + bodyHeight * 0.7, frontCarZ + carLength / 2 + 1.85);
        group.add(headlight);
      }

      // Front Engine Locomotive detailing: cockpit visor, driver windows, crew windows, flank livery
      this.addCoachDetails(group, frontCarZ, carLength, width, bodyHeight, floatElevation, trainMats, true, false);
    }

    // 2. Middle Cargo Coach (T6: train_container_wagon or procedural fallback)
    if (assetLoader.has("train_container_wagon")) {
      const midModel = assetLoader.createInstance("train_container_wagon", {
        targetLength: carLength,
        targetWidth: width,
        targetHeight: bodyHeight
      });
      if (midModel) {
        midModel.position.set(0, floatElevation, midCarZ);
        group.add(midModel);
      }
    } else {
      const midBody = new THREE.Mesh(this.getTrainBodyGeo(carLength), trainMats.body);
      midBody.position.set(0, floatElevation + bodyHeight / 2, midCarZ);
      midBody.castShadow = true;
      midBody.receiveShadow = true;
      group.add(midBody);

      // Middle Cargo / Passenger Coach detailing: passenger sliding doors, row of illuminated passenger windows, rooftop HVAC
      this.addCoachDetails(group, midCarZ, carLength, width, bodyHeight, floatElevation, trainMats, false, false);
    }

    // 3. Rear Cargo Coach (T6: train_container_wagon or procedural fallback)
    if (assetLoader.has("train_container_wagon")) {
      const rearModel = assetLoader.createInstance("train_container_wagon", {
        targetLength: carLength,
        targetWidth: width,
        targetHeight: bodyHeight
      });
      if (rearModel) {
        rearModel.position.set(0, floatElevation, rearCarZ);
        group.add(rearModel);
      }
    } else {
      const rearBody = new THREE.Mesh(this.getTrainBodyGeo(carLength), trainMats.body);
      rearBody.position.set(0, floatElevation + bodyHeight / 2, rearCarZ);
      rearBody.castShadow = true;
      rearBody.receiveShadow = true;
      group.add(rearBody);

      // Rear Passenger Coach detailing: passenger sliding doors, row of illuminated passenger windows, red tail lights
      this.addCoachDetails(group, rearCarZ, carLength, width, bodyHeight, floatElevation, trainMats, false, true);
    }

    // Articulated Bellows & Couplers between cars (at z = +6.55 and z = -6.55)
    for (const couplerZ of [carSpacing / 2, -carSpacing / 2]) {
      for (let bz = -0.6; bz <= 0.6; bz += 0.3) {
        const bellow = new THREE.Mesh(this.geometries.bellowsRingGeo, this.materials.bellowsMat);
        bellow.position.set(0, floatElevation + bodyHeight / 2, couplerZ + bz);
        group.add(bellow);
      }

      const couplerBridge = new THREE.Mesh(this.geometries.couplerPlateGeo, trainMats.roof);
      couplerBridge.position.set(0, totalTopY + 0.04, couplerZ);
      group.add(couplerBridge);

      for (let s of [-0.9, 0.9]) {
        const rod = new THREE.Mesh(this.geometries.couplerRodGeo, this.materials.carbonFrame);
        rod.rotation.x = Math.PI / 2;
        rod.position.set(s, floatElevation + 0.6, couplerZ);
        group.add(rod);
      }
    }

    const hasGLBThree = assetLoader.has("train_freight_locomotive") || assetLoader.has("train_container_wagon");
    if (!hasGLBThree) {
      // Repulsors under all 3 cars
      for (let carCenter of [frontCarZ, midCarZ, rearCarZ]) {
        for (let zRel of [-carLength / 2 + 2.0, carLength / 2 - 2.0]) {
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

      // Continuous Rooftop Gratings on all 3 cars
      for (let carCenter of [frontCarZ, midCarZ, rearCarZ]) {
        const roof = new THREE.Mesh(this.getTrainRoofGeo(carLength), trainMats.roof);
        roof.position.set(0, totalTopY + 0.04, carCenter);
        group.add(roof);
      }
    }

    // Optional Climbable Rear Ramp attached to the back of the rear coach
    if (hasRamp) {
      const rampLength = 9.0;
      const rampZOffset = -totalTrainLength / 2 - rampLength / 2;
      const rampAngle = -Math.atan2(totalTopY, rampLength);

      const solidRampMesh = new THREE.Mesh(this.rampGeo, trainMats.ramp);
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

    return this.freezeStaticChildren(group);
  }
}
