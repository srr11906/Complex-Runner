/**
 * PRABHAS: WASTELAND 2898 AD (3D Runner - AAA Next-Gen)
 * High-Performance Track Pool with 5 Distinct Dystopian Shanty & Container Architectures
 * Grounded Utility Pylons, Mounted AC Units, Truss Signboards & Zero Allocation Loop
 */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { CONFIG } from "../config.js?v=20261108_hardened_v84";
import { ObstacleFactory3D } from "../models/obstacleModels.js?v=20261108_hardened_v84";
import { CollectibleFactory3D } from "../models/collectibleModels.js?v=20261108_hardened_v84";
import { BountyModelFactory } from "../models/bountyModels.js?v=20261108_hardened_v84";
import { textureGen } from "./textureGenerator.js?v=20261108_hardened_v84";
import { assetLoader } from "../models/assetLoader3D.js?v=20261108_hardened_v84";

export class TrackSegmentPool3D {
  constructor(scene) {
    this.scene = scene;
    this.obstacleFactory = new ObstacleFactory3D();
    this.collectibleFactory = new CollectibleFactory3D();
    this.bountyFactory = new BountyModelFactory();

    this.activeChunks = [];
    this.nextChunkZ = 0;

    // Stateful Thematic Zone Cadence Engine (3 to 5 chunk wave stretches)
    this.currentZone = "train_yard"; // "train_yard" | "obstacle_parkour" | "transit_chaos" | "reward_dash"
    this.zoneChunksRemaining = 4;
    this.currentTheme = "wasteland";

    // Pre-allocated active query arrays to eliminate Garbage Collection churn
    this._activeObstaclesList = [];
    this._activeCollectiblesList = [];

    // Subway Surfers Dynamic Spacing & Exclusion Matrix Tracking
    this.lastPowerupWorldZ = -100;
    this.lastJetpackWorldZ = -200;

    // Subway Surfers Route Scheduler Engine (WeightedScheduler & SequentialScheduler)
    this.lastSpawnEndPositions = {};
    this.entryQueue = [];
    this.mirrorProbability = 0.50; // Procedural horizontal symmetry (50% left-right inversion)
    this.isLandingScheduled = false;

    this.initWeightedSchedulerTable();

    // High-Efficiency Photorealistic Materials with Procedural Normal Maps
    this.materials = {
      sandTerrain: new THREE.MeshPhongMaterial({
        map: textureGen.getSandTerrainTexture(),
        normalMap: textureGen.getSandTerrainNormalMap(),
        normalScale: new THREE.Vector2(0.65, 0.65),
        shininess: 4
      }),
      stoneMat: new THREE.MeshLambertMaterial({
        color: CONFIG.COLORS.ANCIENT_STONE
      }),
      rustScrapMat: new THREE.MeshLambertMaterial({
        color: 0x4D2A18
      }),
      ground: new THREE.MeshPhongMaterial({
        map: textureGen.getRoadTexture(),
        normalMap: textureGen.getRoadNormalMap(),
        normalScale: new THREE.Vector2(0.35, 0.35),
        shininess: 16,
        specular: 0x222222,
        side: THREE.DoubleSide
      }),
      roadSlab: new THREE.MeshLambertMaterial({
        color: 0x241D17
      }),
      roadBorder: new THREE.MeshPhongMaterial({
        color: 0xD97706,
        shininess: 30
      }),
      shantyBuilding: new THREE.MeshStandardMaterial({
        map: textureGen.getShantyBuildingTexture(),
        normalMap: textureGen.getShantyBuildingNormalMap(),
        normalScale: new THREE.Vector2(0.95, 0.95),
        roughness: 0.68,
        metalness: 0.52
      }),
      shantyFooting: new THREE.MeshStandardMaterial({
        color: 0x2A1C12,
        roughness: 0.92,
        metalness: 0.30
      }),
      containerRust: new THREE.MeshPhongMaterial({
        map: textureGen.getContainerTexture("rust"),
        normalMap: textureGen.getContainerNormalMap(),
        normalScale: new THREE.Vector2(0.85, 0.85),
        shininess: 12
      }),
      containerCyan: new THREE.MeshPhongMaterial({
        map: textureGen.getContainerTexture("cyan"),
        normalMap: textureGen.getContainerNormalMap(),
        normalScale: new THREE.Vector2(0.85, 0.85),
        shininess: 12
      }),
      containerYellow: new THREE.MeshPhongMaterial({
        map: textureGen.getContainerTexture("yellow"),
        normalMap: textureGen.getContainerNormalMap(),
        normalScale: new THREE.Vector2(0.85, 0.85),
        shininess: 12
      }),
      tinRoof: new THREE.MeshLambertMaterial({
        color: 0x554B42,
        side: THREE.DoubleSide
      }),
      cableMat: new THREE.MeshBasicMaterial({
        color: 0x14171F
      }),
      scaffoldMat: new THREE.MeshLambertMaterial({
        color: 0x475569
      }),
      gantryFrame: new THREE.MeshLambertMaterial({
        color: 0x1E293B
      }),
      hazardStripe: new THREE.MeshBasicMaterial({
        color: 0xF59E0B
      }),
      beaconMat: new THREE.MeshBasicMaterial({
        color: 0xFF2222
      }),
      dishMat: new THREE.MeshLambertMaterial({
        color: 0xCBD5E1,
        side: THREE.DoubleSide
      }),
      bracketMat: new THREE.MeshLambertMaterial({
        color: 0x334155
      }),
      neonHaloCyan: new THREE.MeshBasicMaterial({
        color: 0x00E5FF,
        transparent: true,
        opacity: 0.32,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      }),
      neonHaloAmber: new THREE.MeshBasicMaterial({
        color: 0xF59E0B,
        transparent: true,
        opacity: 0.32,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      }),
      neonHaloRed: new THREE.MeshBasicMaterial({
        color: 0xEF4444,
        transparent: true,
        opacity: 0.32,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      }),
      tarpMat: new THREE.MeshLambertMaterial({
        color: 0x8C6239,
        side: THREE.DoubleSide
      }),
      curbBeaconCyan: new THREE.MeshBasicMaterial({
        color: 0x00E5FF,
        blending: THREE.AdditiveBlending
      }),
      curbBeaconAmber: new THREE.MeshBasicMaterial({
        color: 0xF59E0B,
        blending: THREE.AdditiveBlending
      }),
      complexColonnade: new THREE.MeshStandardMaterial({
        map: textureGen.getComplexColonnadeTexture(),
        roughness: 0.28,
        metalness: 0.15
      }),
      complexGold: new THREE.MeshStandardMaterial({
        color: 0xF59E0B,
        roughness: 0.2,
        metalness: 0.92
      }),
      complexWater: new THREE.MeshPhongMaterial({
        map: textureGen.getComplexWaterTexture(),
        transparent: true,
        opacity: 0.88,
        shininess: 90,
        specular: 0x00E5FF
      }),
      complexWaterfall: new THREE.MeshPhongMaterial({
        map: textureGen.getComplexWaterfallTexture(),
        transparent: true,
        opacity: 0.88,
        shininess: 120,
        specular: 0x38BDF8,
        side: THREE.DoubleSide
      }),
      complexBark: new THREE.MeshLambertMaterial({
        map: textureGen.getComplexBarkTexture()
      }),
      complexLeaf1: new THREE.MeshLambertMaterial({ color: 0x1B4332 }),
      complexLeaf2: new THREE.MeshLambertMaterial({ color: 0x2D6A4F }),
      complexLeaf3: new THREE.MeshLambertMaterial({ color: 0x40916C }),
      complexLeaf4: new THREE.MeshLambertMaterial({ color: 0x52B788 }),
      complexCliff: new THREE.MeshStandardMaterial({
        color: 0xE2E8F0,
        roughness: 0.45,
        metalness: 0.2
      }),
      complexMist: new THREE.MeshBasicMaterial({
        color: 0xE0F2FE,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide
      }),
      complexHedge: new THREE.MeshLambertMaterial({
        map: textureGen.getComplexHedgeTexture()
      })
    };

    const length = CONFIG.CHUNK_LENGTH;
    const roadWidth = 13.6;

    // Shared Track & Architecture Geometries
    this.geometries = {
      terrainSand: new THREE.PlaneGeometry(280, length),
      duneGeo: new THREE.SphereGeometry(24, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      driftGeo: new THREE.CylinderGeometry(1.6, 2.8, 0.16, 8, 1, false),
      rockGeo: new THREE.DodecahedronGeometry(4.5, 0),
      pipeGeo: new THREE.CylinderGeometry(1.2, 1.2, 24.0, 8),
      slab: new THREE.BoxGeometry(roadWidth, 0.6, length),
      road: new THREE.PlaneGeometry(roadWidth, length),
      curb: new THREE.CylinderGeometry(0.28, 0.28, length, 8),
      curbMarker: new THREE.CylinderGeometry(0.12, 0.16, 1.2, 6),
      curbRing: new THREE.TorusGeometry(0.24, 0.05, 6, 12),
      container: new THREE.BoxGeometry(6.5, 4.2, 12.0),
      shanty1: new THREE.BoxGeometry(9.0, 10.0, 15.0),
      shantyFooting1: new THREE.BoxGeometry(9.6, 2.5, 15.6),
      roof1: new THREE.PlaneGeometry(12.0, 17.0),
      tarpGeo: new THREE.PlaneGeometry(8.5, 6.0),
      ventDuct: new THREE.TorusGeometry(0.8, 0.28, 8, 12, Math.PI / 2),
      acUnit: new THREE.BoxGeometry(1.6, 1.4, 1.2),
      acShelf: new THREE.BoxGeometry(1.8, 0.12, 1.4),
      acStrut: new THREE.CylinderGeometry(0.04, 0.04, 1.2, 4),
      shanty2: new THREE.BoxGeometry(10.0, 18.0, 16.0),
      shantyFooting2: new THREE.BoxGeometry(10.6, 2.5, 16.6),
      mast: new THREE.CylinderGeometry(0.16, 0.3, 14, 6),
      beacon: new THREE.SphereGeometry(0.38, 6, 6),
      antennaSpire: new THREE.CylinderGeometry(0.04, 0.1, 4.0, 4),
      signBoard: new THREE.PlaneGeometry(5.4, 2.7),
      signBackHousing: new THREE.BoxGeometry(5.6, 2.9, 0.4),
      signGlowHalo: new THREE.PlaneGeometry(7.2, 4.4),
      signFrame: new THREE.BoxGeometry(5.6, 0.15, 0.15),
      signArm: new THREE.BoxGeometry(2.4, 0.15, 0.15),
      shanty3: new THREE.BoxGeometry(8.5, 12.0, 14.0),
      shantyFooting3: new THREE.BoxGeometry(9.2, 2.5, 14.6),
      cistern: new THREE.CylinderGeometry(2.0, 2.0, 3.5, 10),
      pylonPole: new THREE.CylinderGeometry(0.18, 0.26, 15.0, 6),
      pylonArm: new THREE.BoxGeometry(2.4, 0.18, 0.18),
      insulator: new THREE.CylinderGeometry(0.08, 0.08, 0.35, 6),
      cable: this.buildCableGeometry(),
      dish: new THREE.CylinderGeometry(1.4, 0.2, 0.5, 10, 1, true),
      gantryPillar: new THREE.BoxGeometry(1.2, 16.0, 1.2),
      gantryTop: new THREE.BoxGeometry(32.0, 1.4, 1.4),
      gantryCross: new THREE.BoxGeometry(0.25, 16.0, 0.25),
      colonnadePillar: new THREE.CylinderGeometry(0.65, 0.75, 14.0, 16),
      colonnadeCapital: new THREE.BoxGeometry(2.4, 0.9, 2.4),
      colonnadeBeam: new THREE.BoxGeometry(1.6, 1.2, length),
      waterCanal: new THREE.BoxGeometry(10.0, 0.8, length),
      hedgeCone: new THREE.ConeGeometry(1.8, 5.2, 12),
      fountainBasin: new THREE.CylinderGeometry(4.2, 3.8, 1.4, 16),
      fountainCore: new THREE.SphereGeometry(1.4, 16, 16),
      treeTrunk1: new THREE.CylinderGeometry(0.35, 0.55, 7.5, 8),
      treeTrunk2: new THREE.CylinderGeometry(0.28, 0.48, 12.0, 7),
      treeCanopySphere: new THREE.SphereGeometry(2.8, 8, 8),
      treeCanopyCone: new THREE.ConeGeometry(3.2, 5.5, 8),
      bushGeo: new THREE.SphereGeometry(1.4, 7, 6),
      cliffLedge: new THREE.BoxGeometry(12.0, 16.0, 18.0),
      cliffShelf: new THREE.BoxGeometry(14.0, 1.8, 14.0),
      waterfallCurtain: new THREE.PlaneGeometry(8.0, 15.0, 4, 8),
      waterMistRing: new THREE.RingGeometry(1.0, 4.5, 16)
    };

    this.signMaterials = {
      lassi: new THREE.MeshBasicMaterial({ map: textureGen.getNeonSignTexture("lassi"), side: THREE.DoubleSide }),
      complex: new THREE.MeshBasicMaterial({ map: textureGen.getNeonSignTexture("complex"), side: THREE.DoubleSide }),
      ore: new THREE.MeshBasicMaterial({ map: textureGen.getNeonSignTexture("ore"), side: THREE.DoubleSide })
    };
  }

  buildCableGeometry() {
    // Realistic catenary curve spanning between road utility poles at x = -8.5 to x = 8.5
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-8.5, 13.5, 0),
      new THREE.Vector3(0, 10.5, 1.8),
      new THREE.Vector3(8.5, 13.5, 0)
    );
    return new THREE.TubeGeometry(curve, 10, 0.045, 4, false);
  }

  init() {
    this.clear();
    this.nextChunkZ = -20;
    this.currentZone = "train_yard";
    this.zoneChunksRemaining = 4;
    this.lastSpawnEndPositions = {};
    this.entryQueue = [];
    this.isLandingScheduled = false;

    for (let i = 0; i < 2; i++) {
      this.spawnChunk(true);
    }

    for (let i = 2; i < CONFIG.ACTIVE_CHUNKS; i++) {
      this.spawnChunk(false);
    }
  }

  clear() {
    for (const chunk of this.activeChunks) {
      this.scene.remove(chunk.root);
    }
    this.activeChunks = [];
    this.nextChunkZ = 0;
  }

  freezeStatic(mesh) {
    if (!mesh) return mesh;
    mesh.updateMatrix();
    mesh.matrixAutoUpdate = false;
    return mesh;
  }

  spawnChunk(isEmptySafe = false) {
    const chunkRoot = new THREE.Group();
    chunkRoot.position.z = this.nextChunkZ;

    const length = CONFIG.CHUNK_LENGTH;
    const roadWidth = 13.6;

    // 0. Continuous Ground Sand Terrain
    const sandPlane = new THREE.Mesh(this.geometries.terrainSand, this.materials.sandTerrain);
    sandPlane.rotation.x = -Math.PI / 2;
    sandPlane.position.set(0, -0.05, length / 2);
    this.freezeStatic(sandPlane);
    chunkRoot.add(sandPlane);

    // 1. Concrete Base Slab
    const slab = new THREE.Mesh(this.geometries.slab, this.materials.roadSlab);
    slab.position.set(0, -0.3, length / 2);
    slab.receiveShadow = true;
    this.freezeStatic(slab);
    chunkRoot.add(slab);

    // 2. Road
    const road = new THREE.Mesh(this.geometries.road, this.materials.ground);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.01, length / 2);
    road.receiveShadow = true;
    this.freezeStatic(road);
    chunkRoot.add(road);

    // 3. Bronze Curbs
    for (let side of [-1, 1]) {
      const curb = new THREE.Mesh(this.geometries.curb, this.materials.roadBorder);
      curb.rotation.x = Math.PI / 2;
      curb.position.set(side * (roadWidth / 2), 0.14, length / 2);
      this.freezeStatic(curb);
      chunkRoot.add(curb);
    }

    // 3b. Roadside Superconductor Guide Markers with Glowing Cyan/Amber Rings
    for (let side of [-1, 1]) {
      const markerX = side * (roadWidth / 2 + 0.35);
      const ringMat = side === -1 ? this.materials.curbBeaconCyan : this.materials.curbBeaconAmber;
      for (let zOff of [12.0, 32.0, 52.0]) {
        const marker = new THREE.Mesh(this.geometries.curbMarker, this.materials.bracketMat);
        marker.position.set(markerX, 0.6, zOff);
        this.freezeStatic(marker);
        chunkRoot.add(marker);

        const ring = new THREE.Mesh(this.geometries.curbRing, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.set(markerX, 1.15, zOff);
        this.freezeStatic(ring);
        chunkRoot.add(ring);
      }
    }

    const chunkData = {
      root: chunkRoot,
      startZ: this.nextChunkZ,
      endZ: this.nextChunkZ + length,
      obstacles: [],
      groundCollectibles: [],
      skyCollectibles: [],
      glowHalos: []
    };

    if (this.currentTheme === "complex") {
      this.buildComplexForestAndWaterfalls(chunkRoot, length);
    } else {
      // 4. Shanties & Stacked Containers
      this.buildDiverseRoadsideShanties(chunkRoot, length, chunkData);

      // 5. Overhead Cables with Grounded Utility Pylons
      this.buildOverheadCables(chunkRoot, length);

      // 6. Roadside Desert Dunes & Crags
      this.buildRoadsideDunes(chunkRoot, length);
    }

    if (!isEmptySafe) {
      this.populateChunkPatterns(chunkData);
    }

    this.scene.add(chunkRoot);
    this.activeChunks.push(chunkData);
    this.nextChunkZ += length;
  }

  /**
   * The Complex: Realistic Utopian Biome, Lush Alien Forests & Cascading Waterfalls
   * Crystalline water canals, terraced stone cliffs, rushing vertical waterfalls, and multi-tier forest groves
   */
  buildComplexForestAndWaterfalls(chunkRoot, length) {
    const roadWidth = 13.6;

    for (let side of [-1, 1]) {
      // 1. Crystal Hydroponic Water Canal alongside road
      const canal = new THREE.Mesh(this.geometries.waterCanal, this.materials.complexWater);
      canal.position.set(side * (roadWidth / 2 + 5.5), -0.15, length / 2);
      this.freezeStatic(canal);
      chunkRoot.add(canal);

      // Gold / Marble Curb Border
      const curb = new THREE.Mesh(this.geometries.curb, this.materials.complexGold);
      curb.rotation.x = Math.PI / 2;
      curb.position.set(side * (roadWidth / 2 + 0.6), 0.15, length / 2);
      this.freezeStatic(curb);
      chunkRoot.add(curb);

      // 2. Cascading Terraced Waterfall & Cliff Reservoir
      const cliffX = side * 22.0;
      const cliffZ = length * 0.45;

      const cliff = new THREE.Mesh(this.geometries.cliffLedge, this.materials.complexCliff);
      cliff.position.set(cliffX, 8.0, cliffZ);
      this.freezeStatic(cliff);
      chunkRoot.add(cliff);

      const shelf = new THREE.Mesh(this.geometries.cliffShelf, this.materials.complexColonnade);
      shelf.position.set(cliffX - side * 2.0, 15.2, cliffZ);
      this.freezeStatic(shelf);
      chunkRoot.add(shelf);

      // Vertical Rushing Waterfall Curtain
      const waterfall = new THREE.Mesh(this.geometries.waterfallCurtain, this.materials.complexWaterfall);
      waterfall.position.set(side * (roadWidth / 2 + 9.8), 7.5, cliffZ);
      waterfall.rotation.y = side === 1 ? -Math.PI / 2 : Math.PI / 2;
      chunkRoot.add(waterfall);

      // Splash & Expanding Mist Ring at Waterfall Plunge Point
      const mist = new THREE.Mesh(this.geometries.waterMistRing, this.materials.complexMist);
      mist.rotation.x = -Math.PI / 2;
      mist.position.set(side * (roadWidth / 2 + 9.8), 0.25, cliffZ);
      chunkRoot.add(mist);

      // 3. Dense Realistic Utopian Forest Groves (Multi-layer foliage, varied species)
      const treeConfigs = [
        { z: length * 0.10, xOff: 1.8, type: "broadleaf", height: 8.5, mat: this.materials.complexLeaf2 },
        { z: length * 0.32, xOff: 5.5, type: "pine", height: 13.0, mat: this.materials.complexLeaf1 },
        { z: length * 0.65, xOff: 2.2, type: "broadleaf", height: 9.8, mat: this.materials.complexLeaf3 },
        { z: length * 0.88, xOff: 6.2, type: "flower", height: 7.8, mat: this.materials.complexLeaf4 }
      ];

      for (let t of treeConfigs) {
        const treeX = side * (roadWidth / 2 + 11.5 + t.xOff);
        const treeZ = t.z;

        // Tree Trunk
        const trunkGeo = t.type === "pine" ? this.geometries.treeTrunk2 : this.geometries.treeTrunk1;
        const trunk = new THREE.Mesh(trunkGeo, this.materials.complexBark);
        trunk.position.set(treeX, t.height * 0.45, treeZ);
        trunk.castShadow = true;
        this.freezeStatic(trunk);
        chunkRoot.add(trunk);

        // Foliage Canopy
        if (t.type === "pine") {
          for (let tier = 0; tier < 3; tier++) {
            const cone = new THREE.Mesh(this.geometries.treeCanopyCone, t.mat);
            cone.scale.set(1.0 - tier * 0.22, 1.0 - tier * 0.18, 1.0 - tier * 0.22);
            cone.position.set(treeX, 7.5 + tier * 2.8, treeZ);
            cone.castShadow = true;
            this.freezeStatic(cone);
            chunkRoot.add(cone);
          }
        } else {
          const canopy = new THREE.Mesh(this.geometries.treeCanopySphere, t.mat);
          canopy.scale.set(1.15, 0.95, 1.15);
          canopy.position.set(treeX, t.height, treeZ);
          canopy.castShadow = true;
          this.freezeStatic(canopy);
          chunkRoot.add(canopy);

          const subCanopy = new THREE.Mesh(this.geometries.treeCanopySphere, this.materials.complexLeaf3);
          subCanopy.scale.set(0.8, 0.75, 0.8);
          subCanopy.position.set(treeX + (side * 1.2), t.height + 1.2, treeZ + 0.8);
          this.freezeStatic(subCanopy);
          chunkRoot.add(subCanopy);
        }

        // Undergrowth bush at base
        const bush = new THREE.Mesh(this.geometries.bushGeo, this.materials.complexLeaf4);
        bush.position.set(treeX - side * 1.5, 0.8, treeZ + 1.2);
        this.freezeStatic(bush);
        chunkRoot.add(bush);
      }

      // 4. Futuristic Colonnaded Pavilions & Marble Arches Framing the Path
      for (let zOffset of [8.0, 32.0, 56.0]) {
        const pillarX = side * (roadWidth / 2 + 8.8);
        const pillar = new THREE.Mesh(this.geometries.colonnadePillar, this.materials.complexColonnade);
        pillar.position.set(pillarX, 7.0, zOffset);
        pillar.castShadow = true;
        this.freezeStatic(pillar);
        chunkRoot.add(pillar);

        const cap = new THREE.Mesh(this.geometries.colonnadeCapital, this.materials.complexGold);
        cap.position.set(pillarX, 14.4, zOffset);
        this.freezeStatic(cap);
        chunkRoot.add(cap);
      }
    }
  }

  buildDiverseRoadsideShanties(chunkRoot, length, chunkData) {
    const signKeys = ["lassi", "complex", "ore"];

    for (let side of [-1, 1]) {
      const posX = side * (15.5 + Math.random() * 2.0);
      const archType = Math.floor(Math.random() * 5);
      const bZ = (length / 2) + (Math.random() - 0.5) * 20;

      if (archType === 0) {
        // ARCHETYPE 0: Multi-Tier Cargo Container Stacks
        const containerMats = [this.materials.containerRust, this.materials.containerCyan, this.materials.containerYellow];
        const numContainers = 4;
        for (let c = 0; c < numContainers; c++) {
          const cMat = containerMats[c % containerMats.length];
          const cBox = new THREE.Mesh(this.geometries.container, cMat);
          const tier = c < 2 ? c : 1.5;
          const offsetX = side * (c * 1.6);
          cBox.position.set(
            posX + offsetX,
            (tier * 4.2) + 1.8,
            bZ + ((c % 2 === 0) ? -2.5 : 2.5)
          );
          cBox.rotation.y = (c % 2 === 0) ? 0.05 : -0.05;
          this.freezeStatic(cBox);
          chunkRoot.add(cBox);
        }
      } else if (archType === 1) {
        // ARCHETYPE 1: Cantilevered Scrap Tin Shanty with Mounted AC Unit & Solar Dish
        const bHeight = 10.0;
        const mainShanty = new THREE.Mesh(this.geometries.shanty1, this.materials.shantyBuilding);
        mainShanty.position.set(posX + side * 4.5, bHeight / 2 - 0.3, bZ);
        this.freezeStatic(mainShanty);
        chunkRoot.add(mainShanty);

        // Grounding Foundation Footing (Anchors firmly into sand terrain)
        const footing = new THREE.Mesh(this.geometries.shantyFooting1, this.materials.shantyFooting);
        footing.position.set(mainShanty.position.x, 0.75, bZ);
        this.freezeStatic(footing);
        chunkRoot.add(footing);

        const roof = new THREE.Mesh(this.geometries.roof1, this.materials.tinRoof);
        roof.rotation.x = -Math.PI / 2;
        roof.rotation.z = side * 0.18;
        roof.position.set(mainShanty.position.x - (side * 0.8), bHeight + 0.1, bZ);
        this.freezeStatic(roof);
        chunkRoot.add(roof);

        // Solid Wall-Mounted AC Unit on Steel Shelf Bracket
        const acGroup = new THREE.Group();
        acGroup.position.set(posX - side * 0.2, bHeight * 0.65 - 0.3, bZ + 3.0);

        const acUnit = new THREE.Mesh(this.geometries.acUnit, this.materials.scaffoldMat);
        this.freezeStatic(acUnit);
        acGroup.add(acUnit);

        const acShelf = new THREE.Mesh(this.geometries.acShelf, this.materials.bracketMat);
        acShelf.position.y = -0.72;
        this.freezeStatic(acShelf);
        acGroup.add(acShelf);

        for (let sx of [-0.6, 0.6]) {
          const strut = new THREE.Mesh(this.geometries.acStrut, this.materials.bracketMat);
          strut.rotation.z = side * 0.45;
          strut.position.set(sx, -1.1, 0);
          this.freezeStatic(strut);
          acGroup.add(strut);
        }
        this.freezeStatic(acGroup);
        chunkRoot.add(acGroup);

        const dish = new THREE.Mesh(this.geometries.dish, this.materials.dishMat);
        dish.position.set(mainShanty.position.x, bHeight + 1.3, bZ - 3.0);
        dish.rotation.x = 0.4;
        dish.rotation.y = side > 0 ? -0.5 : 0.5;
        this.freezeStatic(dish);
        chunkRoot.add(dish);

        // Hanging Canvas Sunshade Burlap Tarp
        const tarp = new THREE.Mesh(this.geometries.tarpGeo, this.materials.tarpMat);
        tarp.rotation.x = -Math.PI / 3.2;
        tarp.rotation.z = side * 0.12;
        tarp.position.set(mainShanty.position.x - side * 1.8, bHeight * 0.42, bZ + 4.0);
        this.freezeStatic(tarp);
        chunkRoot.add(tarp);

        // Industrial Rooftop Ventilation Duct Elbow
        const vent = new THREE.Mesh(this.geometries.ventDuct, this.materials.scaffoldMat);
        vent.position.set(mainShanty.position.x + side * 1.4, bHeight + 0.9, bZ + 2.5);
        vent.rotation.y = side > 0 ? 0.3 : Math.PI - 0.3;
        this.freezeStatic(vent);
        chunkRoot.add(vent);
      } else if (archType === 2) {
        // ARCHETYPE 2: Multi-Tier Scrap Tower with Solid Truss-Mounted Neon Billboard
        const bHeight = 18.0;
        const tower = new THREE.Mesh(this.geometries.shanty2, this.materials.shantyBuilding);
        tower.position.set(posX + side * 5.0, bHeight / 2 - 0.3, bZ);
        this.freezeStatic(tower);
        chunkRoot.add(tower);

        // Grounding Foundation Footing
        const footing = new THREE.Mesh(this.geometries.shantyFooting2, this.materials.shantyFooting);
        footing.position.set(tower.position.x, 0.75, bZ);
        this.freezeStatic(footing);
        chunkRoot.add(footing);

        const mast = new THREE.Mesh(this.geometries.mast, this.materials.scaffoldMat);
        mast.position.set(tower.position.x, bHeight + 6.7, bZ);
        this.freezeStatic(mast);
        chunkRoot.add(mast);

        const beacon = new THREE.Mesh(this.geometries.beacon, this.materials.beaconMat);
        beacon.position.set(mast.position.x, bHeight + 13.9, mast.position.z);
        this.freezeStatic(beacon);
        chunkRoot.add(beacon);

        // Truss-Mounted Signboard projecting from the wall
        const signGroup = new THREE.Group();
        const signX = posX - (side * 0.5);
        signGroup.position.set(signX, bHeight * 0.55 - 0.3, bZ);
        signGroup.rotation.y = side > 0 ? -Math.PI / 2 + 0.08 : Math.PI / 2 - 0.08;

        const chosenSign = signKeys[Math.floor(Math.random() * signKeys.length)];
        const signBoard = new THREE.Mesh(this.geometries.signBoard, this.signMaterials[chosenSign]);
        this.freezeStatic(signBoard);
        signGroup.add(signBoard);

        // 3D Solid Metallic Back-Housing for sign depth
        const housing = new THREE.Mesh(this.geometries.signBackHousing, this.materials.bracketMat);
        housing.position.z = -0.22;
        this.freezeStatic(housing);
        signGroup.add(housing);

        // Additive Glowing Neon Halo
        const haloMat = chosenSign === "complex" ? this.materials.neonHaloCyan : this.materials.neonHaloAmber;
        const halo = new THREE.Mesh(this.geometries.signGlowHalo, haloMat);
        halo.position.z = -0.25;
        signGroup.add(halo);
        if (chunkData && chunkData.glowHalos) {
          chunkData.glowHalos.push(halo);
        }

        // Horizontal Iron Support Frame
        for (let fy of [-1.35, 1.35]) {
          const frame = new THREE.Mesh(this.geometries.signFrame, this.materials.bracketMat);
          frame.position.y = fy;
          this.freezeStatic(frame);
          signGroup.add(frame);
        }

        // Cantilever Wall Arm connecting sign to building
        const arm = new THREE.Mesh(this.geometries.signArm, this.materials.bracketMat);
        arm.position.set(side * 1.2, 0, -0.2);
        this.freezeStatic(arm);
        signGroup.add(arm);

        this.freezeStatic(signGroup);
        chunkRoot.add(signGroup);
      } else if (archType === 3) {
        // ARCHETYPE 3: Heavy Scrap Steel Structure & Rooftop Cistern
        const bHeight = 12.0;
        const baseBuilding = new THREE.Mesh(this.geometries.shanty3, this.materials.shantyBuilding);
        baseBuilding.position.set(posX + side * 4.25, bHeight / 2 - 0.3, bZ);
        this.freezeStatic(baseBuilding);
        chunkRoot.add(baseBuilding);

        // Grounding Foundation Footing
        const footing = new THREE.Mesh(this.geometries.shantyFooting3, this.materials.shantyFooting);
        footing.position.set(baseBuilding.position.x, 0.75, bZ);
        this.freezeStatic(footing);
        chunkRoot.add(footing);

        const cistern = new THREE.Mesh(this.geometries.cistern, this.materials.containerRust);
        cistern.position.set(baseBuilding.position.x, bHeight + 1.5, bZ);
        this.freezeStatic(cistern);
        chunkRoot.add(cistern);

        // Rooftop Communication Antenna Spire with Aviation Warning Beacon
        const antenna = new THREE.Mesh(this.geometries.antennaSpire, this.materials.scaffoldMat);
        antenna.position.set(baseBuilding.position.x - side * 2.2, bHeight + 2.0, bZ - 2.5);
        this.freezeStatic(antenna);
        chunkRoot.add(antenna);

        const topBeacon = new THREE.Mesh(this.geometries.beacon, this.materials.beaconMat);
        topBeacon.position.set(antenna.position.x, bHeight + 4.0, antenna.position.z);
        this.freezeStatic(topBeacon);
        chunkRoot.add(topBeacon);
      } else {
        // ARCHETYPE 4: Overhead Industrial Gantry Crane Superstructure
        if (side === 1) {
          const gantryGroup = new THREE.Group();
          gantryGroup.position.set(0, 0, bZ);

          for (let gx of [-14.5, 14.5]) {
            const pillar = new THREE.Mesh(this.geometries.gantryPillar, this.materials.gantryFrame);
            pillar.position.set(gx, 7.5, 0);
            this.freezeStatic(pillar);
            gantryGroup.add(pillar);
          }

          const topBeam = new THREE.Mesh(this.geometries.gantryTop, this.materials.gantryFrame);
          topBeam.position.set(0, 15.2, 0);
          this.freezeStatic(topBeam);
          gantryGroup.add(topBeam);

          const hazard = new THREE.Mesh(this.geometries.beacon, this.materials.hazardStripe);
          hazard.position.set(0, 13.9, 0);
          this.freezeStatic(hazard);
          gantryGroup.add(hazard);

          this.freezeStatic(gantryGroup);
          chunkRoot.add(gantryGroup);
        }
      }
    }
  }

  /**
   * Grounded Overhead Catenary Power Cables with Highway Utility Pylons
   */
  buildOverheadCables(chunkRoot, length) {
    for (let cZ = 15; cZ < length; cZ += 30) {
      for (let side of [-1, 1]) {
        const poleX = side * 8.5;
        const pylon = new THREE.Mesh(this.geometries.pylonPole, this.materials.scaffoldMat);
        pylon.position.set(poleX, 7.0, cZ);
        this.freezeStatic(pylon);
        chunkRoot.add(pylon);

        const arm = new THREE.Mesh(this.geometries.pylonArm, this.materials.bracketMat);
        arm.position.set(poleX - (side * 0.6), 14.2, cZ);
        this.freezeStatic(arm);
        chunkRoot.add(arm);

        const ins = new THREE.Mesh(this.geometries.insulator, this.materials.dishMat);
        ins.position.set(poleX, 13.8, cZ);
        this.freezeStatic(ins);
        chunkRoot.add(ins);
      }

      const cable = new THREE.Mesh(this.geometries.cable, this.materials.cableMat);
      cable.position.z = cZ;
      this.freezeStatic(cable);
      chunkRoot.add(cable);
    }
  }

  /**
   * Roadside Desert Dunes, Crags & Sunken Salvage firmly anchored to the chunk (Zero Road Flow)
   */
  buildRoadsideDunes(chunkRoot, length) {
    for (let side of [-1, 1]) {
      const dune = new THREE.Mesh(this.geometries.duneGeo, this.materials.sandTerrain);
      const duneX = side * (46.0 + Math.random() * 10.0);
      const duneZ = (length / 2) + (Math.random() - 0.5) * 22.0;
      dune.scale.set(1.2 + Math.random() * 0.4, 0.35 + Math.random() * 0.08, 1.3 + Math.random() * 0.4);
      dune.position.set(duneX, -2.5, duneZ);
      dune.rotation.y = Math.random() * Math.PI;
      this.freezeStatic(dune);
      chunkRoot.add(dune);

      const rock = new THREE.Mesh(this.geometries.rockGeo, this.materials.stoneMat);
      rock.position.set(side * (28.0 + Math.random() * 8.0), 1.2, duneZ + (Math.random() - 0.5) * 12);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.scale.set(1.2, 0.8, 1.4);
      this.freezeStatic(rock);
      chunkRoot.add(rock);

      // Sunken Sand Drift Edge (Firmly outside road curb at |x| = 10.5m, y = -0.06 to guarantee zero flow onto road)
      const drift = new THREE.Mesh(this.geometries.driftGeo, this.materials.sandTerrain);
      const driftZ = (length * 0.3) + (Math.random() * length * 0.4);
      drift.position.set(side * 10.5, -0.06, driftZ);
      drift.rotation.z = side * 0.04;
      drift.scale.set(0.7 + Math.random() * 0.2, 0.7, 1.1 + Math.random() * 0.3);
      this.freezeStatic(drift);
      chunkRoot.add(drift);

      if (Math.random() > 0.4) {
        const pipe = new THREE.Mesh(this.geometries.pipeGeo, this.materials.rustScrapMat);
        pipe.position.set(side * (32.0 + Math.random() * 10.0), 1.0, duneZ);
        pipe.rotation.set(0.3, 0.6 * side, 0.8 * side);
        this.freezeStatic(pipe);
        chunkRoot.add(pipe);
      }

      // 3D GLB Environment Scenery Integration (E1-E5)
      // E1: Diesel Generator along roadside industrial scrap
      if (assetLoader.has("env_diesel_generator") && Math.random() > 0.45) {
        const gen = assetLoader.createInstance("env_diesel_generator", {
          targetWidth: 3.2,
          targetHeight: 2.2
        });
        if (gen) {
          gen.position.set(side * (21.0 + Math.random() * 4.0), 0, duneZ - 8);
          gen.rotation.y = side > 0 ? -Math.PI / 4 : Math.PI / 4;
          this.freezeStatic(gen);
          chunkRoot.add(gen);
        }
      }

      // E2: Transmission Antenna in outer communications corridor
      if (assetLoader.has("env_transmission_antenna") && Math.random() > 0.5) {
        const ant = assetLoader.createInstance("env_transmission_antenna", {
          targetHeight: 8.5
        });
        if (ant) {
          ant.position.set(side * (28.0 + Math.random() * 6.0), 0, duneZ + 6);
          this.freezeStatic(ant);
          chunkRoot.add(ant);
        }
      }

      // E3: Massive Broadcast Tower in mid-distance
      if (assetLoader.has("env_broadcast_tower") && Math.random() > 0.7) {
        const tower = assetLoader.createInstance("env_broadcast_tower", {
          targetHeight: 32.0
        });
        if (tower) {
          tower.position.set(side * (60.0 + Math.random() * 15.0), 0, duneZ);
          this.freezeStatic(tower);
          chunkRoot.add(tower);
        }
      }

      // E4 / E5: Distant Horizon Station Hub / Station Lab
      const stationKey = Math.random() > 0.5 ? "env_station_hub" : "env_station_lab";
      if (assetLoader.has(stationKey) && Math.random() > 0.65) {
        const station = assetLoader.createInstance(stationKey, {
          targetWidth: 26.0,
          targetHeight: 18.0
        });
        if (station) {
          station.position.set(side * (85.0 + Math.random() * 20.0), 0, duneZ + 15);
          station.rotation.y = (Math.random() - 0.5) * Math.PI;
          this.freezeStatic(station);
          chunkRoot.add(station);
        }
      }
    }
  }

  /**
   * Subway Surfers Route Scheduler Architecture (Reference: gamemodes.json & core_route_config.bundle)
   * Registers modular chunk encounters with distance brackets (minZ, maxZ), selection weights,
   * and anti-repetition minimum repeat distances (minRepeatDistance)
   */
  initWeightedSchedulerTable() {
    this.weightedEntries = [
      { id: "single_hazard_hurdle", weight: 20, minZ: 120, maxZ: 700, minRepeatDistance: 120, fn: (c, l) => this.spawnModule_SingleHazard(c, l, "hurdle") },
      { id: "single_hazard_gate", weight: 20, minZ: 120, maxZ: 700, minRepeatDistance: 120, fn: (c, l) => this.spawnModule_SingleHazard(c, l, "gate") },
      { id: "single_hazard_ramp", weight: 20, minZ: 120, maxZ: 900, minRepeatDistance: 120, fn: (c, l) => this.spawnModule_SingleHazard(c, l, "ramp") },
      { id: "slalom_chicane_2stage", weight: 28, minZ: 180, minRepeatDistance: 150, fn: (c, l) => this.spawnModule_SlalomChicane(c, l, 18) },
      { id: "choice_triad", weight: 35, minZ: 250, minRepeatDistance: 160, fn: (c, l) => this.spawnModule_ChoiceTriad(c, l, 25) },
      { id: "roof_transfer", weight: 32, minZ: 400, minRepeatDistance: 180, fn: (c, l) => this.spawnModule_RoofTransfer(c, l, 16) },
      { id: "moving_train_intercept", weight: 35, minZ: 500, minRepeatDistance: 160, fn: (c, l) => this.spawnModule_MovingTrainIntercept(c, l, 26) },
      { id: "trap_escape_ramp", weight: 30, minZ: 600, minRepeatDistance: 180, fn: (c, l) => this.spawnModule_TrapEscapeRamp(c, l, 25) },
      { id: "hurdle_rhythm_cadence", weight: 25, minZ: 650, minRepeatDistance: 180, fn: (c, l) => this.spawnModule_HurdleRhythmCadence(c, l, 12) },
      { id: "speed_chicane_agility", weight: 28, minZ: 900, minRepeatDistance: 200, fn: (c, l) => this.spawnModule_SpeedChicane(c, l, 14) },
      { id: "moving_train_and_ramp", weight: 28, minZ: 1000, minRepeatDistance: 200, fn: (c, l) => this.spawnModule_MovingTrainFollowedByStatic(c, l, 20) },
      { id: "dual_moving_trains", weight: 28, minZ: 1400, minRepeatDistance: 240, fn: (c, l) => this.spawnModule_DualMovingTrains(c, l, 26) },
      { id: "reward_oasis", weight: 14, minZ: 200, minRepeatDistance: 320, fn: (c, l) => this.spawnModule_RewardOasis(c, l) }
    ];
  }

  /**
   * Subway Surfers WeightedScheduler Selection:
   * Filters entries by worldZ distance range & minRepeatDistance (lastSpawnEndPositions)
   */
  selectNextWeightedModule(worldZ) {
    const available = this.weightedEntries.filter((entry) => {
      if (entry.minZ !== undefined && worldZ < entry.minZ) return false;
      if (entry.maxZ !== undefined && worldZ > entry.maxZ) return false;
      const lastEnd = this.lastSpawnEndPositions[entry.id] || -9999;
      if (entry.minRepeatDistance && (worldZ - lastEnd) < entry.minRepeatDistance) return false;
      return true;
    });

    if (available.length === 0) {
      // Fallback: relax minRepeatDistance if distance filters are satisfied
      const fallback = this.weightedEntries.filter((e) => {
        if (e.minZ !== undefined && worldZ < e.minZ) return false;
        if (e.maxZ !== undefined && worldZ > e.maxZ) return false;
        return true;
      });
      const chosen = fallback.length > 0 ? fallback[Math.floor(Math.random() * fallback.length)] : this.weightedEntries[0];
      this.lastSpawnEndPositions[chosen.id] = worldZ + CONFIG.CHUNK_LENGTH;
      return chosen;
    }

    const totalWeight = available.reduce((acc, e) => acc + e.weight, 0);
    let roll = Math.random() * totalWeight;
    for (let i = 0; i < available.length; i++) {
      const entry = available[i];
      roll -= entry.weight;
      if (roll <= 0 || i === available.length - 1) {
        this.lastSpawnEndPositions[entry.id] = worldZ + CONFIG.CHUNK_LENGTH;
        return entry;
      }
    }
    return available[0];
  }

  /**
   * Subway Surfers LandingChunkHelper:
   * Enqueues a guaranteed safe runway with zero ground obstacles when descending from Jetpack flight
   */
  scheduleLandingChunk() {
    this.entryQueue.push((chunkData, lanes) => {
      this.spawnCoinLine(chunkData, lanes[1], 4, 52, 9, 0.85, false, true);
      this.spawnCoinLine(chunkData, lanes[0], 8, 48, 7, 0.85, false, false);
      this.spawnCoinLine(chunkData, lanes[2], 8, 48, 7, 0.85, false, false);
    });
  }

  /**
   * Subway Surfers Difficulty Tier Resolver (gamemodes.json)
   */
  getDifficultyTier(worldZ) {
    if (worldZ < 120) return "START";
    if (worldZ < 500) return "EASY";
    if (worldZ < 1200) return "MEDIUM";
    if (worldZ < 2200) return "HARD";
    return "IMPOSSIBLE";
  }

  populateChunkPatterns(chunkData) {
    const rawLanes = CONFIG.LANES;
    const worldZ = chunkData.startZ;

    // 1. Procedural Horizontal Mirroring (Subway Surfers _mirrorProbability = 0.5)
    // Symmetrically inverts Left <-> Right track assignments to double authored pattern variety
    const isMirrored = Math.random() < this.mirrorProbability;
    const lanes = isMirrored ? [rawLanes[2], rawLanes[1], rawLanes[0]] : [rawLanes[0], rawLanes[1], rawLanes[2]];

    // 2. Sequential Queue Priority (e.g. Jetpack Landing Chunk)
    if (this.entryQueue.length > 0) {
      const queuedModule = this.entryQueue.shift();
      queuedModule(chunkData, lanes);
    } else if (worldZ < 120) {
      // Stage 1: Introductory Open Section (_introSection from SequentialScheduler)
      this.spawnModule_IntroSafe(chunkData, lanes);
    } else {
      // Stage 2+: Subway Surfers WeightedScheduler with distance filtering & minRepeatDistance
      const selectedEntry = this.selectNextWeightedModule(worldZ);
      selectedEntry.fn(chunkData, lanes);
    }

    // 3. Mathematical Solvability & Landing Clearance Invariants
    this.verifySolvability(chunkData);
    this.verifyLandingClearance(chunkData);

    // 4. Sky Coins for Jetpack Flight (Strictly isolated at JETPACK_ALTITUDE)
    const skyLane = Math.floor(Math.random() * 3);
    this.spawnCoinLine(chunkData, lanes[skyLane], 8, 52, 7, CONFIG.JETPACK_ALTITUDE, true);
  }

  /**
   * MODULE 0: INTRODUCTORY SAFE FLOW (_introSection from SequentialScheduler, Z < 120m)
   * Open runways, welcoming center coin ribbon, and introductory single ramp train
   */
  spawnModule_IntroSafe(chunkData, lanes) {
    if (chunkData.startZ < 60) {
      // Chunk 0: Pure open run with center coin ribbon
      this.spawnCoinLine(chunkData, lanes[1], 10, 50, 7, 0.85, false, true);
    } else {
      // Chunk 1: Single 2-Compartment Ramp Train on Lane 0 + Open Center & Right Tracks with Coins
      const trainL = this.obstacleFactory.createTwoCompartmentTrain(true, false, 11.5);
      trainL.position.set(lanes[0], 0, 24);
      this.registerObstacle(chunkData, trainL);
      this.spawnRampTrainCoins(chunkData, lanes[0], 24, 24.6, true, 5.00);

      this.spawnCoinLine(chunkData, lanes[1], 8, 48, 6, 0.85, false, true);
      this.spawnCoinLine(chunkData, lanes[2], 12, 44, 4, 0.85, false, false);
    }
  }

  /**
   * MODULE 1: SINGLE HAZARD (Easy - 1 Lane Occupied)
   * Low Hurdle, Slide Gate, or Climbable Ramp Train with 2 open lanes
   */
  spawnModule_SingleHazard(chunkData, lanes, specificType = null) {
    const laneIdx = Math.floor(Math.random() * 3);
    const chosenLane = lanes[laneIdx];
    const hazardType = specificType || (Math.random() < 0.35 ? "hurdle" : (Math.random() < 0.70 ? "gate" : "ramp"));

    if (hazardType === "hurdle") {
      const hurdle = this.obstacleFactory.createLowHurdle();
      hurdle.position.set(chosenLane, 0, 26);
      this.registerObstacle(chunkData, hurdle);
      this.spawnCoinArc(chunkData, chosenLane, 26);
    } else if (hazardType === "gate") {
      const gate = this.obstacleFactory.createPlasmaGate();
      gate.position.set(chosenLane, 0, 26);
      this.registerObstacle(chunkData, gate);
      this.spawnCoinLine(chunkData, chosenLane, 12, 40, 4, 0.85, false, false);
    } else {
      const train = this.obstacleFactory.createTwoCompartmentTrain(true, false, 11.5);
      train.position.set(chosenLane, 0, 24);
      this.registerObstacle(chunkData, train);
      this.spawnRampTrainCoins(chunkData, chosenLane, 24, 24.6, true, 5.00);
    }

    // Populate remaining open lanes with coin ribbons
    for (let i = 0; i < 3; i++) {
      if (i !== laneIdx) {
        this.spawnCoinLine(chunkData, lanes[i], 8, 48, 6, 0.85, false, i === 1);
      }
    }
  }

  /**
   * MODULE 2: SLALOM CHICANE (Easy / Medium)
   * Staggered hazards on Left (z = zStart) and Right (z = zStart + 24m)
   * Center runway remains open for weaving
   */
  spawnModule_SlalomChicane(chunkData, lanes, zStart = 16) {
    const hLeft = this.obstacleFactory.createLowHurdle();
    hLeft.position.set(lanes[0], 0, zStart);
    this.registerObstacle(chunkData, hLeft);
    this.spawnCoinArc(chunkData, lanes[0], zStart);

    const zRight = zStart + 24;
    const hRight = this.obstacleFactory.createPlasmaGate();
    hRight.position.set(lanes[2], 0, zRight);
    this.registerObstacle(chunkData, hRight);

    this.spawnCoinLine(chunkData, lanes[1], 6, 52, 8, 0.85, false, true);
    this.spawnCoinLine(chunkData, lanes[0], zStart + 12, 52, 4, 0.85, false, false);
  }

  /**
   * MODULE 3: THE CHOICE TRIAD (Subway Surfers Signature Encounter)
   * Lane A: Low Hurdle (Jump action)
   * Lane B: Slide Gate (Slide action)
   * Lane C: Climbable Ramp Train (Climb / Platform action)
   */
  spawnModule_ChoiceTriad(chunkData, lanes, zCenter = 25) {
    const perm = [0, 1, 2].sort(() => Math.random() - 0.5);
    const jumpLane = lanes[perm[0]];
    const slideLane = lanes[perm[1]];
    const rampLane = lanes[perm[2]];

    // 1. Jump Lane
    const hurdle = this.obstacleFactory.createLowHurdle();
    hurdle.position.set(jumpLane, 0, zCenter);
    this.registerObstacle(chunkData, hurdle);
    this.spawnCoinArc(chunkData, jumpLane, zCenter);

    // 2. Slide Lane
    const gate = this.obstacleFactory.createPlasmaGate();
    gate.position.set(slideLane, 0, zCenter);
    this.registerObstacle(chunkData, gate);
    this.spawnCoinLine(chunkData, slideLane, zCenter - 14, zCenter + 14, 3, 0.85, false, false);

    // 3. Ramp Train Lane
    const train = this.obstacleFactory.createTwoCompartmentTrain(true, false, 13.5);
    train.position.set(rampLane, 0, zCenter);
    this.registerObstacle(chunkData, train);
    this.spawnRampTrainCoins(chunkData, rampLane, zCenter, 28.6, true, 5.00);

    if (Math.random() < 0.35) {
      this.spawnRandomPowerup(chunkData, rampLane, zCenter, 5.00, true);
    }
  }

  /**
   * MODULE 4: ROOF-TO-ROOF TRANSFER (Subway Surfers Platforming)
   * Lane A: Maglev Train WITH Ramp (Starts at zStart, Length 20m)
   * Lane B: Maglev Train WITHOUT Ramp (Starts at zStart + 16m, Length 28.6m)
   * Lane C: Jumpable Low Hurdle with coin arc (Alternative route or climb Train A to Train B!)
   */
  spawnModule_RoofTransfer(chunkData, lanes, zStart = 16) {
    const laneA = lanes[0];
    const laneB = lanes[1];
    const blockedLane = lanes[2];

    // Train A: 2-Compartment With Climbable Ramp
    const trainA = this.obstacleFactory.createTwoCompartmentTrain(true, false, 11.5);
    trainA.position.set(laneA, 0, zStart);
    this.registerObstacle(chunkData, trainA);
    this.spawnRampTrainCoins(chunkData, laneA, zStart, 24.6, true, 5.00);

    // Train B: 2-Compartment Flat Roof (No Ramp) - Staggered overlap
    const zTrainB = zStart + 16;
    const trainB = this.obstacleFactory.createTwoCompartmentTrain(false, false, 12.0);
    trainB.position.set(laneB, 0, zTrainB);
    this.registerObstacle(chunkData, trainB);
    this.spawnRampTrainCoins(chunkData, laneB, zTrainB, 25.6, false, 5.00);

    // Powerup cache on the second train's roof as reward for roof-hopping
    this.spawnRandomPowerup(chunkData, laneB, zTrainB, 5.00, true);

    // Third lane has a jumpable low hurdle with coin arc (no impassable tall blocker)
    const hurdle = this.obstacleFactory.createLowHurdle();
    hurdle.position.set(blockedLane, 0, zStart);
    this.registerObstacle(chunkData, hurdle);
    this.spawnCoinArc(chunkData, blockedLane, zStart);
  }

  /**
   * MODULE 5: STATIC 3-CAR RAMP HYPERLOOP (Option A: Pure Subway Surfers Flow)
   * 3-Compartment Stationary Train with rear climbable incline ramp and rooftop coin ribbon
   * Flanked by safe alternate corridors (Low hurdle or open lane)
   */
  spawnModule_MovingTrainIntercept(chunkData, lanes, zCenter = 26) {
    const trainLaneIdx = Math.floor(Math.random() * 3);
    const trainLane = lanes[trainLaneIdx];

    // 3-Compartment Stationary Train with rear climbable ramp (Train_Ramp_3)
    const rampTrain = this.obstacleFactory.createThreeCompartmentTrain(true, false, 11.5);
    rampTrain.position.set(trainLane, 0, zCenter);
    this.registerObstacle(chunkData, rampTrain);
    this.spawnRampTrainCoins(chunkData, trainLane, zCenter, 37.7, true, 5.00);
    this.spawnRandomPowerup(chunkData, trainLane, zCenter, 5.00, true);

    // Safe adjacent lanes:
    for (let i = 0; i < 3; i++) {
      if (i === trainLaneIdx) continue;
      const safeLane = lanes[i];
      if (Math.random() < 0.5) {
        const hurdle = this.obstacleFactory.createLowHurdle();
        hurdle.position.set(safeLane, 0, zCenter);
        this.registerObstacle(chunkData, hurdle);
        this.spawnCoinArc(chunkData, safeLane, zCenter);
      } else {
        this.spawnCoinLine(chunkData, safeLane, 6, 52, 7, 0.85, false, true);
      }
    }
  }

  /**
   * MODULE 6: TRIPLE-ROUTE ESCAPE RAMP (Medium / Hard)
   * Outer Lane 0: Jumpable Low Hurdle with coin arc
   * Center Lane 1: 3-Compartment Train WITH INCLINE RAMP (Climb for high rewards!)
   * Outer Lane 2: Slidable Plasma Laser Gate
   * Zero impassable tall blockers - player has dynamic tactical choices across all 3 lanes!
   */
  spawnModule_TrapEscapeRamp(chunkData, lanes, zCenter = 25) {
    // Outer Lane 0: Jumpable Low Hurdle with high coin arc
    const h0 = this.obstacleFactory.createLowHurdle();
    h0.position.set(lanes[0], 0, zCenter);
    this.registerObstacle(chunkData, h0);
    this.spawnCoinArc(chunkData, lanes[0], zCenter);

    // Outer Lane 2: Slidable Plasma Laser Gate with low sliding coins
    const g2 = this.obstacleFactory.createPlasmaGate();
    g2.position.set(lanes[2], 0, zCenter);
    this.registerObstacle(chunkData, g2);
    this.spawnCoinLine(chunkData, lanes[2], zCenter - 4, zCenter + 4, 3, 0.45, false, false);

    // Center Lane: 3-Compartment Maglev Train with Incline Ramp (The High-Reward Route!)
    const rampTrain = this.obstacleFactory.createThreeCompartmentTrain(true, false, 11.5);
    rampTrain.position.set(lanes[1], 0, zCenter);
    this.registerObstacle(chunkData, rampTrain);
    this.spawnRampTrainCoins(chunkData, lanes[1], zCenter, 37.7, true, 5.00);
    this.spawnRandomPowerup(chunkData, lanes[1], zCenter, 5.00, true);
  }

  /**
   * MODULE 7: HURDLE RHYTHM CADENCE (Mystery Hurdle Mode from gamemodes.json)
   * Rhythmic 3-beat obstacle sequence: Hurdle (Jump) -> Slide Gate (Slide) -> Hurdle (Jump)
   */
  spawnModule_HurdleRhythmCadence(chunkData, lanes, zStart = 12) {
    const laneA = lanes[1]; // Center lane cadence

    // Beat 1: Low Hurdle at zStart
    const h1 = this.obstacleFactory.createLowHurdle();
    h1.position.set(laneA, 0, zStart);
    this.registerObstacle(chunkData, h1);
    this.spawnCoinArc(chunkData, laneA, zStart);

    // Beat 2: Slide Gate at zStart + 18m
    const zGate = zStart + 18;
    const g2 = this.obstacleFactory.createPlasmaGate();
    g2.position.set(laneA, 0, zGate);
    this.registerObstacle(chunkData, g2);
    this.spawnCoinLine(chunkData, laneA, zGate - 8, zGate + 8, 2, 0.85, false, false);

    // Beat 3: Low Hurdle at zStart + 36m
    const zHurdle3 = zStart + 36;
    const h3 = this.obstacleFactory.createLowHurdle();
    h3.position.set(laneA, 0, zHurdle3);
    this.registerObstacle(chunkData, h3);
    this.spawnCoinArc(chunkData, laneA, zHurdle3);

    // Flanking Lanes: Clear runs with coin ribbons and powerup
    this.spawnCoinLine(chunkData, lanes[0], 6, 52, 7, 0.85, false, false);
    this.spawnCoinLine(chunkData, lanes[2], 6, 52, 7, 0.85, false, true);
  }

  /**
   * MODULE 8: DUAL ROOF-TRANSFER TRAINS (Option A: Pure Subway Surfers Flow)
   * Dual stationary trains with climbable ramps on outer lanes
   * Center lane provides open corridor or ramp train sanctuary for mid-air roof jumping
   */
  spawnModule_DualMovingTrains(chunkData, lanes, zCenter = 26) {
    // Left Stationary Ramp Train (2-Compartment with Incline Ramp)
    const trainL = this.obstacleFactory.createTwoCompartmentTrain(true, false, 11.5);
    trainL.position.set(lanes[0], 0, zCenter);
    this.registerObstacle(chunkData, trainL);
    this.spawnRampTrainCoins(chunkData, lanes[0], zCenter, 24.6, true, 5.00);

    // Right Stationary Ramp Train (2-Compartment with Incline Ramp, slightly staggered)
    const trainR = this.obstacleFactory.createTwoCompartmentTrain(true, false, 11.5);
    trainR.position.set(lanes[2], 0, zCenter + 8);
    this.registerObstacle(chunkData, trainR);
    this.spawnRampTrainCoins(chunkData, lanes[2], zCenter + 8, 24.6, true, 5.00);

    // Center Sanctuary: Ramp Train or Open Runway with Coin Ribbon
    if (Math.random() < 0.5) {
      const centerRamp = this.obstacleFactory.createTwoCompartmentTrain(true, false, 11.5);
      centerRamp.position.set(lanes[1], 0, zCenter);
      this.registerObstacle(chunkData, centerRamp);
      this.spawnRampTrainCoins(chunkData, lanes[1], zCenter, 24.6, true, 5.00);
      this.spawnRandomPowerup(chunkData, lanes[1], zCenter, 5.00, true);
    } else {
      this.spawnCoinLine(chunkData, lanes[1], 6, 52, 8, 0.85, false, true);
    }
  }

  /**
   * MODULE 9: STAGGERED RAMP TRAINS & POWER-UP CACHE (Option A: Pure Subway Surfers Flow)
   * Lane 0 has a stationary climbable ramp train
   * Lane 1 has an open transition lane with coin line
   * Lane 2 has a static ramp train starting shortly after
   */
  spawnModule_MovingTrainFollowedByStatic(chunkData, lanes, zStart = 18) {
    // Lane 0: Stationary Ramp Train
    const train1 = this.obstacleFactory.createTwoCompartmentTrain(true, false, 11.5);
    train1.position.set(lanes[0], 0, zStart);
    this.registerObstacle(chunkData, train1);
    this.spawnRampTrainCoins(chunkData, lanes[0], zStart, 24.6, true, 5.00);

    // Lane 1: Open transition with coin line
    this.spawnCoinLine(chunkData, lanes[1], 6, 52, 7, 0.85, false, false);

    // Lane 2: Static Climbable Ramp Train
    const zTrainS = zStart + 12;
    const trainS = this.obstacleFactory.createTwoCompartmentTrain(true, false, 11.5);
    trainS.position.set(lanes[2], 0, zTrainS);
    this.registerObstacle(chunkData, trainS);
    this.spawnRampTrainCoins(chunkData, lanes[2], zTrainS, 24.6, true, 5.00);
    this.spawnRandomPowerup(chunkData, lanes[2], zTrainS, 5.00, true);
  }

  /**
   * MODULE 10: SPEED AGILITY CHICANE (High-Speed Rhythm: Jump & Slide Cadence)
   * Staggered jump & slide obstacles across lanes with fluid ribbon corridors:
   * Lane 0 at zStart (Low Hurdle) -> Lane 1 at zStart + 16m (Plasma Slide Gate) -> Lane 2 at zStart + 32m (Low Hurdle)
   * Zero impassable tall blockers - pure reflex agility!
   */
  spawnModule_SpeedChicane(chunkData, lanes, zStart = 14) {
    // Stagger 1: Lane 0 Low Hurdle with coin arc
    const h0 = this.obstacleFactory.createLowHurdle();
    h0.position.set(lanes[0], 0, zStart);
    this.registerObstacle(chunkData, h0);
    this.spawnCoinArc(chunkData, lanes[0], zStart);

    // Stagger 2: Lane 1 Plasma Slide Gate with low sliding coins
    const z1 = zStart + 16;
    const g1 = this.obstacleFactory.createPlasmaGate();
    g1.position.set(lanes[1], 0, z1);
    this.registerObstacle(chunkData, g1);
    this.spawnCoinLine(chunkData, lanes[1], z1 - 4, z1 + 4, 3, 0.45, false, false);

    // Stagger 3: Lane 2 Low Hurdle with coin arc
    const z2 = zStart + 32;
    const h2 = this.obstacleFactory.createLowHurdle();
    h2.position.set(lanes[2], 0, z2);
    this.registerObstacle(chunkData, h2);
    this.spawnCoinArc(chunkData, lanes[2], z2);

    // Guiding coin ribbon weaving through the open corridor
    this.spawnCoinLine(chunkData, lanes[1], zStart - 4, zStart + 10, 3, 0.85, false, false);
    this.spawnCoinLine(chunkData, lanes[2], zStart + 12, zStart + 26, 3, 0.85, false, false);
    this.spawnCoinLine(chunkData, lanes[0], zStart + 28, 52, 4, 0.85, false, true);
  }

  /**
   * MODULE 11: REWARD OASIS (10-15% Cadence)
   * Dense triple-lane coin dash with guaranteed powerup cache
   */
  spawnModule_RewardOasis(chunkData, lanes) {
    this.spawnCoinLine(chunkData, lanes[1], 6, 50, 8, 0.85, false, true);
    this.spawnCoinLine(chunkData, lanes[0], 8, 48, 7, 0.85, false, false);
    this.spawnCoinLine(chunkData, lanes[2], 8, 48, 7, 0.85, false, false);
  }

  /**
   * Subway Surfers Level Design Rule: Mathematical Solvability Invariant
   * Guarantees that at NO longitudinal slice along the track are all 3 lanes blocked by impassable walls.
   * If all 3 lanes contain obstacles, guarantees that at least one has a jumpable hurdle, slideable gate, or climbable ramp!
   */
  verifySolvability(chunkData) {
    const obstacles = chunkData.obstacles;
    if (!obstacles || obstacles.length < 3) return;

    // Discretize into longitudinal slices (8m bin window)
    const bins = {};
    for (let i = 0; i < obstacles.length; i++) {
      const obs = obstacles[i];
      const zBin = Math.round(obs.position.z / 8.0) * 8;
      if (!bins[zBin]) bins[zBin] = [];
      bins[zBin].push(obs);
    }

    for (const binKey in bins) {
      const group = bins[binKey];
      if (group.length >= 3) {
        // All 3 lanes occupied at this Z slice!
        const hasNavigablePath = group.some((o) =>
          o.userData.hasRamp ||
          o.userData.requiresJump ||
          o.userData.requiresSlide ||
          o.userData.type === "bounty_target" ||
          o.userData.type === "bounty_crate"
        );

        if (!hasNavigablePath) {
          // Guaranteed escape route: Convert center obstacle to have an accessible ramp
          const centerObs = group.find((o) => Math.abs(o.position.x - CONFIG.LANES[1]) < 0.5) || group[0];
          if (centerObs) {
            centerObs.userData.hasRamp = true;
          }
        }
      }
    }
  }

  /**
   * Subway Surfers Level Design Rule: Landing Clearance Invariant
   * When exiting/hopping off a train roof, ensures the downstream 14m landing zone has no impassable obstacles
   */
  verifyLandingClearance(chunkData) {
    const obstacles = chunkData.obstacles;
    if (!obstacles || obstacles.length === 0) return;

    for (let i = 0; i < obstacles.length; i++) {
      const obs = obstacles[i];
      if (obs.userData.type === "train") {
        const trainLen = obs.userData.trainLength || 20.0;
        const trainRearZ = obs.position.z + (trainLen / 2);
        const laneX = obs.position.x;

        // Check for any obstacle right behind train rear (within 14m landing zone)
        for (let j = 0; j < obstacles.length; j++) {
          if (i === j) continue;
          const other = obstacles[j];
          if (Math.abs(other.position.x - laneX) < 0.5) {
            const dist = other.position.z - trainRearZ;
            if (dist > 0 && dist < 14.0 && !other.userData.requiresJump && !other.userData.requiresSlide) {
              // Convert downstream landing obstacle into a jumpable low hurdle
              other.userData.requiresJump = true;
            }
          }
        }
      }
    }
  }

  registerObstacle(chunkData, obstacle) {
    let defaultHp = 1;
    if (obstacle.userData.type === "train") defaultHp = 10;
    else if (obstacle.userData.type === "blocker") defaultHp = 8;
    else if (obstacle.userData.type === "hurdle" || obstacle.userData.type === "laser_gate") defaultHp = 6;

    obstacle.userData.cachedCollisionData = {
      mesh: obstacle,
      chunkStartZ: chunkData.startZ,
      worldPos: new THREE.Vector3(obstacle.position.x, obstacle.position.y, chunkData.startZ + obstacle.position.z),
      type: obstacle.userData.type,
      hp: obstacle.userData.hp !== undefined ? obstacle.userData.hp : defaultHp,
      maxHp: obstacle.userData.maxHp !== undefined ? obstacle.userData.maxHp : defaultHp,
      requiresSlide: !!obstacle.userData.requiresSlide,
      requiresJump: !!obstacle.userData.requiresJump,
      requiresLaneChange: !!obstacle.userData.requiresLaneChange
    };
    chunkData.root.add(obstacle);
    chunkData.obstacles.push(obstacle);
  }

  /**
   * Spawns a smooth, long parabolic coin jump arc tailored to the character's jump physics:
   * Covers an extended 17m flight path (start take-off -> apex 3.55m over barrier -> touchdown)
   * ONLY spawned for low road barriers / jump hurdles.
   */
  spawnCoinArc(chunkData, laneX, centerZ, apexY = 3.55, spanZ = 17.0, count = 6) {
    const halfSpan = spanZ / 2;
    const startZ = centerZ - halfSpan;
    const groundY = 0.85;
    const isJetpackActive = !!(window.gameEngine3D?.player?.hasJetpack);

    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : (i / (count - 1));
      const zPos = startZ + t * spanZ;
      // Parabolic jump arc: y(t) = groundY + 4.0 * (apexY - groundY) * t * (1.0 - t)
      const yPos = groundY + 4.0 * (apexY - groundY) * t * (1.0 - t);

      const coin = this.collectibleFactory.createCoin();
      coin.position.set(laneX, yPos, zPos);
      coin.userData.isSky = false;
      coin.visible = !isJetpackActive;

      coin.userData.cachedCollisionData = {
        mesh: coin,
        chunkRoot: chunkData.root,
        worldPos: new THREE.Vector3(laneX, yPos, chunkData.startZ + zPos),
        type: "coin",
        powerupType: null,
        radius: 0.55,
        points: CONFIG.UNITS_PER_COIN,
        duration: 0,
        itemRef: coin
      };

      chunkData.root.add(coin);
      chunkData.groundCollectibles.push(coin);
    }
  }

  /**
   * Spawns non-overlapping coins along the train rooftop deck only:
   * - ZERO coins on ramps/slides (clean ramp entrance with full unobstructed visibility)
   * - Flat rooftop coins spanning the upper deck strictly horizontally at roofY (5.00m)
   */
  spawnRampTrainCoins(chunkData, laneX, trainZ, trainLength = 20.0, hasRamp = true, roofY = 5.00) {
    const isJetpackActive = !!(window.gameEngine3D?.player?.hasJetpack);
    const halfLen = trainLength / 2;

    // Rooftop Flat Straight Coins (Strictly horizontal flat line across the upper deck)
    const zRoofStart = trainZ - halfLen + 1.2;
    const zRoofEnd = trainZ + halfLen - 1.5;
    const roofSpan = zRoofEnd - zRoofStart;
    if (roofSpan > 4.0) {
      const roofCoinCount = Math.max(3, Math.min(7, Math.round(roofSpan / 3.8)));
      const step = roofSpan / (roofCoinCount - 1);
      for (let i = 0; i < roofCoinCount; i++) {
        const zPos = zRoofStart + i * step;

        const coin = this.collectibleFactory.createCoin();
        coin.position.set(laneX, roofY, zPos);
        coin.userData.isSky = false;
        coin.visible = !isJetpackActive;

        coin.userData.cachedCollisionData = {
          mesh: coin,
          chunkRoot: chunkData.root,
          worldPos: new THREE.Vector3(laneX, roofY, chunkData.startZ + zPos),
          type: "coin",
          powerupType: null,
          radius: 0.55,
          points: CONFIG.UNITS_PER_COIN,
          duration: 0,
          itemRef: coin
        };

        chunkData.root.add(coin);
        chunkData.groundCollectibles.push(coin);
      }
    }
  }

  spawnCoinLine(chunkData, laneX, startZ, endZ, count, yHeight, isSkyCoin = false, allowPowerup = true) {
    const step = count > 1 ? (endZ - startZ) / (count - 1) : 0;
    const powerupIndex = (allowPowerup && !isSkyCoin && Math.random() < 0.06) ? Math.floor(count / 2) : -1;
    const isJetpackActive = !!(window.gameEngine3D?.player?.hasJetpack);

    for (let i = 0; i < count; i++) {
      const zPos = startZ + i * step;

      if (i === powerupIndex) {
        this.spawnRandomPowerup(chunkData, laneX, zPos, yHeight, true);
        continue;
      }

      const coin = this.collectibleFactory.createCoin();
      coin.position.set(laneX, yHeight, zPos);
      coin.userData.isSky = isSkyCoin;
      coin.visible = isSkyCoin ? isJetpackActive : !isJetpackActive;

      coin.userData.cachedCollisionData = {
        mesh: coin,
        chunkRoot: chunkData.root,
        worldPos: new THREE.Vector3(laneX, yHeight, chunkData.startZ + coin.position.z),
        type: "coin",
        powerupType: null,
        radius: 0.55,
        points: CONFIG.UNITS_PER_COIN,
        duration: 0,
        itemRef: coin
      };

      chunkData.root.add(coin);
      if (isSkyCoin) {
        chunkData.skyCollectibles.push(coin);
      } else {
        chunkData.groundCollectibles.push(coin);
      }
    }
  }

  spawnRandomPowerup(chunkData, laneX, z, customY = 1.2, force = false) {
    const worldZ = chunkData.startZ + z;

    // Subway Surfers Dynamic Exclusion Matrix: Minimum 24m buffer between any powerups
    if (!force) {
      if (worldZ - this.lastPowerupWorldZ < 24.0) return;
      const spawnRate = CONFIG.POWERUP_SPAWN_CHANCE !== undefined ? CONFIG.POWERUP_SPAWN_CHANCE : 0.0384;
      if (Math.random() > spawnRate) return;
    }

    let types = ["magnet", "shield", "multiplier"];
    // Jetpack exclusion matrix: Minimum 80m buffer between jetpacks & only when monster not active
    const isMonsterActive = window.gameEngine3D?.hasActiveMonster?.() || window.gameEngine3D?.isBigMonsterActive?.() || window.gameEngine3D?.monsterRobots?.some(b => b.active && !b.isGlitching);
    if (!isMonsterActive && (worldZ - this.lastJetpackWorldZ >= 80.0)) {
      types.push("jetpack");
    }

    const chosen = types[Math.floor(Math.random() * types.length)];
    let powerup;

    if (chosen === "magnet") powerup = this.collectibleFactory.createMagnet();
    else if (chosen === "jetpack") {
      powerup = this.collectibleFactory.createJetpack();
      this.lastJetpackWorldZ = worldZ;
    }
    else if (chosen === "shield") powerup = this.collectibleFactory.createShield();
    else powerup = this.collectibleFactory.createMultiplier();

    this.lastPowerupWorldZ = worldZ;

    const actualY = customY !== undefined ? customY : 1.2;
    powerup.position.set(laneX, actualY, z);
    powerup.userData.isSky = false;
    const isJetpackActive = !!(window.gameEngine3D?.player?.hasJetpack);
    powerup.visible = !isJetpackActive;

    powerup.userData.cachedCollisionData = {
      mesh: powerup,
      chunkRoot: chunkData.root,
      worldPos: new THREE.Vector3(laneX, actualY, worldZ),
      type: powerup.userData.type,
      powerupType: powerup.userData.powerupType || null,
      radius: 0.85,
      points: 10000,
      duration: powerup.userData.duration || 0,
      itemRef: powerup
    };

    chunkData.root.add(powerup);
    chunkData.groundCollectibles.push(powerup);
  }

  spawnBountyTarget(chunkData, laneX, z, tier = 1) {
    let target;
    if (tier === 1) target = this.bountyFactory.createScavengerSkiff();
    else if (tier === 2) target = this.bountyFactory.createSmugglerSpeeder();
    else target = this.bountyFactory.createRogueDroid();

    target.position.set(laneX, 0, z);
    target.userData.cachedCollisionData = {
      mesh: target,
      chunkStartZ: chunkData.startZ,
      worldPos: new THREE.Vector3(laneX, target.position.y, chunkData.startZ + z),
      type: target.userData.type,
      targetTier: target.userData.targetTier,
      rewardUnits: target.userData.rewardUnits,
      targetName: target.userData.targetName,
      isTarget: true
    };

    chunkData.root.add(target);
    chunkData.obstacles.push(target);
  }

  spawnBountyCrate(chunkData, laneX, z, yElevation = 0, isHighValue = false) {
    const crate = this.bountyFactory.createBountyCrate(isHighValue);
    crate.position.set(laneX, yElevation, z);
    crate.userData.cachedCollisionData = {
      mesh: crate,
      chunkStartZ: chunkData.startZ,
      worldPos: new THREE.Vector3(laneX, yElevation, chunkData.startZ + z),
      type: crate.userData.type,
      rewardUnits: crate.userData.rewardUnits,
      isCrate: true
    };

    chunkData.root.add(crate);
    chunkData.obstacles.push(crate);
  }

  spawnExtractionBeacon(chunkData, laneX, z) {
    const beacon = this.bountyFactory.createExtractionBeacon();
    beacon.position.set(laneX, 0, z);
    beacon.userData.cachedCollisionData = {
      mesh: beacon,
      chunkStartZ: chunkData.startZ,
      worldPos: new THREE.Vector3(laneX, 0, chunkData.startZ + z),
      type: "extraction_beacon",
      isBeacon: true,
      radius: 3.5
    };

    chunkData.root.add(beacon);
    chunkData.obstacles.push(beacon);
  }

  spawnRivalHunter(chunkData, laneX, z) {
    const rival = this.bountyFactory.createRivalHunter();
    rival.position.set(laneX, 0, z);
    rival.userData.cachedCollisionData = {
      mesh: rival,
      chunkStartZ: chunkData.startZ,
      worldPos: new THREE.Vector3(laneX, 0, chunkData.startZ + z),
      type: "rival_hunter",
      rewardUnits: 10000,
      targetName: "Rival Outlaw Skiff",
      isRival: true
    };

    chunkData.root.add(rival);
    chunkData.obstacles.push(rival);
  }

  update(playerZ, isJetpack = false, dt = 0.016) {
    // Subway Surfers LandingChunkHelper: When jetpack flight is nearing completion (< 1.5s), enqueues safe landing runway
    if (isJetpack || window.gameEngine3D?.player?.hasJetpack) {
      const timer = window.gameEngine3D?.player?.jetpackTimer || 0;
      if (timer < 1.5 && !this.isLandingScheduled) {
        this.isLandingScheduled = true;
        this.scheduleLandingChunk();
      }
    } else {
      this.isLandingScheduled = false;
    }

    if (this.activeChunks.length > 0 && playerZ > this.activeChunks[0].endZ + 12.0) {
      const oldChunk = this.activeChunks.shift();
      this.scene.remove(oldChunk.root);
      oldChunk.obstacles.length = 0;
      oldChunk.groundCollectibles.length = 0;
      oldChunk.skyCollectibles.length = 0;
      if (oldChunk.glowHalos) oldChunk.glowHalos.length = 0;
      this.spawnChunk(false);
    }

    const currentSpeed = window.gameEngine3D?.currentSpeed || 23.5;
    if (this.obstacleFactory?.materials?.amberBlinkerDynamic) {
      const strobe = Math.floor(performance.now() * 0.005) % 2 === 0;
      this.obstacleFactory.materials.amberBlinkerDynamic.color.setHex(strobe ? 0xFFB300 : 0x331A00);
    }

    for (let c = 0; c < this.activeChunks.length; c++) {
      const chunk = this.activeChunks[c];
      for (let o = 0; o < chunk.obstacles.length; o++) {
        const obs = chunk.obstacles[o];
        if (obs.userData.isMoving) {
          // Responsive Subway Surfers moving train approach closing speed
          const effectiveSpeed = obs.userData.moveSpeed + (currentSpeed * 0.35);
          obs.position.z -= effectiveSpeed * dt;

          const trainWorldZ = chunk.startZ + obs.position.z;
          const distToPlayer = trainWorldZ - playerZ;

          // Dynamic Oncoming Train Horn Cue (sounds when oncoming train is within 48m)
          if (!obs.userData.hasHornSounded && distToPlayer > 0 && distToPlayer < 48.0) {
            obs.userData.hasHornSounded = true;
            if (window.gameEngine3D?.safeAudio) {
              window.gameEngine3D.safeAudio("playTrainHorn");
            }
          }

          // Dynamic Train Rush/Pass Sound Cue (sounds when train rushes within 18m)
          if (!obs.userData.hasPassSounded && distToPlayer > -15.0 && distToPlayer < 18.0) {
            obs.userData.hasPassSounded = true;
            if (window.gameEngine3D?.safeAudio) {
              window.gameEngine3D.safeAudio("playTrainPass");
            }
          }

          // Maintain real-time collision data world position
          if (obs.userData.cachedCollisionData) {
            obs.userData.cachedCollisionData.worldPos.set(obs.position.x, obs.position.y, trainWorldZ);
          }
        }
      }
    }

    const time = performance.now() * 0.003;
    for (let c = 0; c < this.activeChunks.length; c++) {
      const chunk = this.activeChunks[c];
      const inFrustum = (chunk.endZ >= playerZ - 10 && chunk.startZ <= playerZ + 80);

      const groundList = chunk.groundCollectibles;
      for (let i = 0; i < groundList.length; i++) {
        const item = groundList[i];
        if (!item.userData.collected) {
          item.visible = !isJetpack;
          if (inFrustum && !isJetpack) {
            item.rotation.y = time * 2.2;
          }
        }
      }

      const skyList = chunk.skyCollectibles;
      for (let i = 0; i < skyList.length; i++) {
        const item = skyList[i];
        if (!item.userData.collected) {
          item.visible = isJetpack;
          if (inFrustum && isJetpack) {
            item.rotation.y = time * 2.5;
          }
        }
      }

      // Sinusoidal Atmospheric Breathing Glow for Shanty Neon Halos
      if (inFrustum && chunk.glowHalos && chunk.glowHalos.length > 0) {
        const haloPulse = 0.28 + 0.12 * Math.sin(time * 3.5 + c);
        for (let h = 0; h < chunk.glowHalos.length; h++) {
          chunk.glowHalos[h].material.opacity = haloPulse;
        }
      }
    }

    // Animate Complex Waterfalls & Canals Flow
    if (this.currentTheme === "complex") {
      const stepDt = dt || 0.016;
      if (this.materials.complexWaterfall && this.materials.complexWaterfall.map) {
        this.materials.complexWaterfall.map.offset.y -= stepDt * 2.8;
      }
      if (this.materials.complexWater && this.materials.complexWater.map) {
        this.materials.complexWater.map.offset.y -= stepDt * 0.85;
      }
    }
  }

  setJetpackVisibility(isJetpack) {
    for (let c = 0; c < this.activeChunks.length; c++) {
      const chunk = this.activeChunks[c];
      const groundList = chunk.groundCollectibles;
      for (let i = 0; i < groundList.length; i++) {
        const item = groundList[i];
        if (!item.userData.collected) {
          item.visible = !isJetpack;
        }
      }
      const skyList = chunk.skyCollectibles;
      for (let i = 0; i < skyList.length; i++) {
        const item = skyList[i];
        if (!item.userData.collected) {
          item.visible = isJetpack;
        }
      }
    }
  }

  getAllActiveObstacles(playerZ = 0) {
    this._activeObstaclesList.length = 0;
    for (let c = 0; c < this.activeChunks.length; c++) {
      const chunk = this.activeChunks[c];
      for (let o = 0; o < chunk.obstacles.length; o++) {
        const obs = chunk.obstacles[o];
        const data = obs.userData.cachedCollisionData;
        if (data) {
          const worldZ = chunk.startZ + obs.position.z;
          // Obstacle-level relevance window (-35m behind player up to +95m ahead)
          // Crucial for moving trains advancing across chunk boundaries!
          if (worldZ < playerZ - 35.0 || worldZ > playerZ + 95.0) continue;
          data.worldPos.set(obs.position.x, obs.position.y, worldZ);
          this._activeObstaclesList.push(data);
        }
      }
    }
    return this._activeObstaclesList;
  }

  getAllActiveCollectibles(isJetpack = false, playerZ = 0) {
    this._activeCollectiblesList.length = 0;
    for (let c = 0; c < this.activeChunks.length; c++) {
      const chunk = this.activeChunks[c];
      if (chunk.endZ < playerZ - 20 || chunk.startZ > playerZ + 80) continue;

      const targetGroup = isJetpack ? chunk.skyCollectibles : chunk.groundCollectibles;
      for (let i = 0; i < targetGroup.length; i++) {
        const item = targetGroup[i];
        if (!item.userData.collected && item.visible) {
          const data = item.userData.cachedCollisionData;
          if (data) {
            data.worldPos.set(item.position.x, item.position.y, chunk.startZ + item.position.z);
            this._activeCollectiblesList.push(data);
          }
        }
      }
    }
    return this._activeCollectiblesList;
  }

  /**
   * Switch environmental track segment textures between Wastelands & Complex High-Tech Realm
   */
  setTheme(theme = "wasteland") {
    this.currentTheme = theme;
    if (this.obstacleFactory && typeof this.obstacleFactory.setTheme === "function") {
      this.obstacleFactory.setTheme(theme);
    }
    const isComplex = theme === "complex" || theme === "complex_beta";
    if (isComplex) {
      if (typeof textureGen.getComplexMarbleTexture === "function") {
        this.materials.ground.map = textureGen.getComplexMarbleTexture();
      }
      this.materials.ground.shininess = 32;
      this.materials.ground.specular.setHex(0x334155);
      if (typeof textureGen.getComplexWaterTexture === "function") {
        this.materials.sandTerrain.map = textureGen.getComplexWaterTexture();
      }
      if (typeof textureGen.getComplexColonnadeTexture === "function") {
        this.materials.shantyBuilding.map = textureGen.getComplexColonnadeTexture();
      }
      this.materials.tinRoof.color.setHex(0x94A3B8);
      this.materials.roadBorder.color.setHex(0x00E5FF);
      this.materials.roadSlab.color.setHex(0x0F172A);
    } else {
      if (typeof textureGen.getRoadTexture === "function") {
        this.materials.ground.map = textureGen.getRoadTexture();
      }
      this.materials.ground.shininess = 16;
      this.materials.ground.specular.setHex(0x222222);
      if (typeof textureGen.getSandTerrainTexture === "function") {
        this.materials.sandTerrain.map = textureGen.getSandTerrainTexture();
      }
      if (typeof textureGen.getShantyBuildingTexture === "function") {
        this.materials.shantyBuilding.map = textureGen.getShantyBuildingTexture();
      }
      this.materials.tinRoof.color.setHex(0x554B42);
      this.materials.roadBorder.color.setHex(0xD97706);
      this.materials.roadSlab.color.setHex(0x241D17);
    }
    this.materials.ground.needsUpdate = true;
    this.materials.sandTerrain.needsUpdate = true;
    this.materials.shantyBuilding.needsUpdate = true;
  }

  /**
   * Transition running environment smoothly from Wasteland to The Complex
   * Purges roadside shanties/containers and generates utopian lush forests and waterfalls
   */
  transitionToComplex(playerZ = 0) {
    this.setTheme("complex");

    const roadWidth = 13.6;
    for (let c = 0; c < this.activeChunks.length; c++) {
      const chunk = this.activeChunks[c];
      if (chunk.endZ > playerZ - 20) {
        // Remove old wasteland roadside shanties, containers, dunes, cables
        const toRemove = [];
        chunk.root.children.forEach(child => {
          if (Math.abs(child.position.x) > roadWidth / 2 + 0.5) {
            toRemove.push(child);
          }
        });
        toRemove.forEach(mesh => chunk.root.remove(mesh));

        // Rebuild lush forest groves & waterfalls in forward chunks
        this.buildComplexForestAndWaterfalls(chunk.root, CONFIG.CHUNK_LENGTH);
      }
    }
  }
}
