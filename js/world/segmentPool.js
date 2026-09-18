/**
 * PRABHAS: KASI 2898 AD (3D Runner - AAA Next-Gen)
 * High-Performance Track Pool with 5 Distinct Dystopian Shanty & Container Architectures
 * Grounded Utility Pylons, Mounted AC Units, Truss Signboards & Zero Allocation Loop
 */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { CONFIG } from "../config.js?v=20260919_triangle_neon_v38";
import { ObstacleFactory3D } from "../models/obstacleModels.js?v=20260919_train_speed_fix_v40";
import { CollectibleFactory3D } from "../models/collectibleModels.js?v=20260919_gold_neon_tri_v39";
import { BountyModelFactory } from "../models/bountyModels.js?v=20260919_triangle_neon_v38";
import { textureGen } from "./textureGenerator.js?v=20260919_triangle_neon_v38";

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

    // Pre-allocated active query arrays to eliminate Garbage Collection churn
    this._activeObstaclesList = [];
    this._activeCollectiblesList = [];

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
      shantyBuilding: new THREE.MeshPhongMaterial({
        map: textureGen.getShantyBuildingTexture(),
        normalMap: textureGen.getShantyBuildingNormalMap(),
        normalScale: new THREE.Vector2(0.75, 0.75),
        shininess: 6
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
      container: new THREE.BoxGeometry(6.5, 4.2, 12.0),
      shanty1: new THREE.BoxGeometry(9.0, 10.0, 15.0),
      roof1: new THREE.PlaneGeometry(12.0, 17.0),
      acUnit: new THREE.BoxGeometry(1.6, 1.4, 1.2),
      acShelf: new THREE.BoxGeometry(1.8, 0.12, 1.4),
      acStrut: new THREE.CylinderGeometry(0.04, 0.04, 1.2, 4),
      shanty2: new THREE.BoxGeometry(10.0, 18.0, 16.0),
      mast: new THREE.CylinderGeometry(0.16, 0.3, 14, 6),
      beacon: new THREE.SphereGeometry(0.38, 6, 6),
      signBoard: new THREE.PlaneGeometry(5.4, 2.7),
      signFrame: new THREE.BoxGeometry(5.6, 0.15, 0.15),
      signArm: new THREE.BoxGeometry(2.4, 0.15, 0.15),
      shanty3: new THREE.BoxGeometry(8.5, 12.0, 14.0),
      cistern: new THREE.CylinderGeometry(2.0, 2.0, 3.5, 10),
      pylonPole: new THREE.CylinderGeometry(0.18, 0.26, 15.0, 6),
      pylonArm: new THREE.BoxGeometry(2.4, 0.18, 0.18),
      insulator: new THREE.CylinderGeometry(0.08, 0.08, 0.35, 6),
      cable: this.buildCableGeometry(),
      dish: new THREE.CylinderGeometry(1.4, 0.2, 0.5, 10, 1, true),
      gantryPillar: new THREE.BoxGeometry(1.2, 16.0, 1.2),
      gantryTop: new THREE.BoxGeometry(32.0, 1.4, 1.4),
      gantryCross: new THREE.BoxGeometry(0.25, 16.0, 0.25)
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

    // 4. Shanties & Stacked Containers
    this.buildDiverseRoadsideShanties(chunkRoot, length);

    // 5. Overhead Cables with Grounded Utility Pylons
    this.buildOverheadCables(chunkRoot, length);

    // 6. Roadside Desert Dunes & Crags
    this.buildRoadsideDunes(chunkRoot, length);

    const chunkData = {
      root: chunkRoot,
      startZ: this.nextChunkZ,
      endZ: this.nextChunkZ + length,
      obstacles: [],
      groundCollectibles: [],
      skyCollectibles: []
    };

    if (!isEmptySafe) {
      this.populateChunkPatterns(chunkData);
    }

    this.scene.add(chunkRoot);
    this.activeChunks.push(chunkData);
    this.nextChunkZ += length;
  }

  buildDiverseRoadsideShanties(chunkRoot, length) {
    const signKeys = ["lassi", "complex", "ore"];

    for (let side of [-1, 1]) {
      const posX = side * (14.0 + Math.random() * 2.0);
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
        // ARCHETYPE 1: Cantilevered Tin Shanty with Mounted AC Unit & Solar Dish
        const bHeight = 10.0;
        const mainShanty = new THREE.Mesh(this.geometries.shanty1, this.materials.shantyBuilding);
        mainShanty.position.set(posX + side * 4.5, bHeight / 2 - 0.3, bZ);
        this.freezeStatic(mainShanty);
        chunkRoot.add(mainShanty);

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
      } else if (archType === 2) {
        // ARCHETYPE 2: Multi-Tier Tenement Tower with Solid Truss-Mounted Neon Billboard
        const bHeight = 18.0;
        const tower = new THREE.Mesh(this.geometries.shanty2, this.materials.shantyBuilding);
        tower.position.set(posX + side * 5.0, bHeight / 2 - 0.3, bZ);
        this.freezeStatic(tower);
        chunkRoot.add(tower);

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
        // ARCHETYPE 3: Heavy Steel Structure & Rooftop Cistern
        const bHeight = 12.0;
        const baseBuilding = new THREE.Mesh(this.geometries.shanty3, this.materials.shantyBuilding);
        baseBuilding.position.set(posX + side * 4.25, bHeight / 2 - 0.3, bZ);
        this.freezeStatic(baseBuilding);
        chunkRoot.add(baseBuilding);

        const cistern = new THREE.Mesh(this.geometries.cistern, this.materials.containerRust);
        cistern.position.set(baseBuilding.position.x, bHeight + 1.5, bZ);
        this.freezeStatic(cistern);
        chunkRoot.add(cistern);
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
   * Roadside Desert Dunes, Crags & Sunken Salvage firmly anchored to the chunk
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

      const drift = new THREE.Mesh(this.geometries.driftGeo, this.materials.sandTerrain);
      const driftZ = (length * 0.3) + (Math.random() * length * 0.4);
      drift.position.set(side * 7.1, 0.06, driftZ);
      drift.rotation.z = side * 0.06;
      drift.scale.set(1.0 + Math.random() * 0.3, 1.0, 1.5 + Math.random() * 0.5);
      this.freezeStatic(drift);
      chunkRoot.add(drift);

      if (Math.random() > 0.4) {
        const pipe = new THREE.Mesh(this.geometries.pipeGeo, this.materials.rustScrapMat);
        pipe.position.set(side * (32.0 + Math.random() * 10.0), 1.0, duneZ);
        pipe.rotation.set(0.3, 0.6 * side, 0.8 * side);
        this.freezeStatic(pipe);
        chunkRoot.add(pipe);
      }
    }
  }

  populateChunkPatterns(chunkData) {
    const chunkRoot = chunkData.root;
    const lanes = CONFIG.LANES;
    const isDownstream = chunkData.startZ > 120;
    const trainRooftopCoinY = 5.00;

    // Early Game: Gentle readable introductory chunks for the first 250 meters
    if (chunkData.startZ < 250) {
      this.populateIntroductoryPattern(chunkData, lanes, trainRooftopCoinY);
    } else {
      // Mid-to-Late Game: Dynamic Mixed Flow with RARE Special Highlight Surges (max 2 chunks)
      if (this.zoneChunksRemaining <= 0) {
        const roll = Math.random();
        if (roll < 0.70) {
          // 70%: Dynamic Varied Transit Flow (balanced mix of trains, hurdles, gates, powerups)
          this.currentZone = "transit_chaos";
          this.zoneChunksRemaining = 1 + Math.floor(Math.random() * 2);
        } else if (roll < 0.85) {
          // 15%: Reward Oasis / Dash (relaxing high-density coin dash)
          this.currentZone = "reward_dash";
          this.zoneChunksRemaining = 1;
        } else if (roll < 0.93) {
          // 8%: Rare Freight Rush Surge (intense multi-train highway)
          this.currentZone = "train_yard";
          this.zoneChunksRemaining = 2;
        } else {
          // 7%: Rare Agility Parkour Surge (rhythmic hurdle jumping)
          this.currentZone = "obstacle_parkour";
          this.zoneChunksRemaining = 2;
        }
      }
      this.zoneChunksRemaining--;

      if (this.currentZone === "train_yard") {
        this.populateTrainYardPattern(chunkData, lanes, isDownstream, trainRooftopCoinY);
      } else if (this.currentZone === "obstacle_parkour") {
        this.populateObstacleParkourPattern(chunkData, lanes);
      } else if (this.currentZone === "transit_chaos") {
        this.populateTransitChaosPattern(chunkData, lanes, isDownstream, trainRooftopCoinY);
      } else {
        this.populateRewardDashPattern(chunkData, lanes, trainRooftopCoinY);
      }
    }

    // Sky Coins for Jetpack Flight (Strictly isolated at JETPACK_ALTITUDE)
    const skyLane = Math.floor(Math.random() * 3);
    this.spawnCoinLine(chunkData, lanes[skyLane], 8, 52, 7, CONFIG.JETPACK_ALTITUDE, true);
  }

  /**
   * EARLY GAME INTRODUCTORY FLOW (Z < 250m)
   * Clear, readable single hazards & welcoming coin arcs before intense thematic zones begin
   */
  populateIntroductoryPattern(chunkData, lanes, trainRooftopCoinY) {
    const zStart = chunkData.startZ;

    if (zStart < 60) {
      // Warmup Chunk 0: Pure open run with center coin ribbon
      this.spawnCoinLine(chunkData, lanes[1], 10, 50, 7, 0.85, false, true);
    } else if (zStart < 120) {
      // Warmup Chunk 1: Single Ramp Train on Lane 0 + Clear Center Run with Coins
      const trainL = this.obstacleFactory.createMaglevTrain(true, false, 20.0);
      trainL.position.set(lanes[0], 0, 24);
      this.registerObstacle(chunkData, trainL);
      this.spawnRampTrainCoins(chunkData, lanes[0], 24, 20.0, true, trainRooftopCoinY);

      this.spawnCoinLine(chunkData, lanes[1], 8, 48, 6, 0.85, false, true);
    } else if (zStart < 180) {
      // Warmup Chunk 2: Synchronized Hurdle Row at Z = 25 (---)
      const h0 = this.obstacleFactory.createLowHurdle();
      h0.position.set(lanes[0], 0, 25);
      this.registerObstacle(chunkData, h0);
      this.spawnCoinArc(chunkData, lanes[0], 25);

      const h1 = this.obstacleFactory.createLowHurdle();
      h1.position.set(lanes[1], 0, 25);
      this.registerObstacle(chunkData, h1);
      this.spawnCoinArc(chunkData, lanes[1], 25);

      this.spawnCoinLine(chunkData, lanes[2], 8, 48, 6, 0.85, false, false);
      if (Math.random() < 0.35) {
        this.spawnRandomPowerup(chunkData, lanes[2], 25, 1.2, true);
      }
    } else {
      // Warmup Chunk 3 (180 <= Z < 250): Synchronized Dual Slide Gate at Z = 28 (- -)
      const gateL = this.obstacleFactory.createPlasmaGate();
      gateL.position.set(lanes[0], 0, 28);
      this.registerObstacle(chunkData, gateL);

      const gateR = this.obstacleFactory.createPlasmaGate();
      gateR.position.set(lanes[2], 0, 28);
      this.registerObstacle(chunkData, gateR);

      this.spawnCoinLine(chunkData, lanes[1], 8, 48, 6, 0.85, false, true);
      this.spawnCoinLine(chunkData, lanes[0], 34, 52, 3, 0.85, false, false);
    }
  }

  /**
   * ZONE 1: FREIGHT YARD RUSH (Rare Highlight Surge: Pure Train Yard Corridors)
   * High-fun climbable ramps, roof-hopping links, and multi-car cargo highways
   */
  populateTrainYardPattern(chunkData, lanes, isDownstream, trainRooftopCoinY) {
    const sub = Math.floor(Math.random() * 4);

    if (sub === 0) {
      // Pattern 0: Roof-Hop Bridge (Climb ramp on Lane 0 or 2, hop across to Lane 1 roof)
      const train0 = this.obstacleFactory.createMaglevTrain(true, false, 20.0);
      train0.position.set(lanes[0], 0, 20);
      this.registerObstacle(chunkData, train0);
      this.spawnRampTrainCoins(chunkData, lanes[0], 20, 20.0, true, trainRooftopCoinY);

      const train1 = this.obstacleFactory.createMaglevTrain(false, false, 20.0);
      train1.position.set(lanes[1], 0, 32);
      this.registerObstacle(chunkData, train1);
      this.spawnRampTrainCoins(chunkData, lanes[1], 32, 20.0, false, trainRooftopCoinY);
      this.spawnRandomPowerup(chunkData, lanes[1], 32, trainRooftopCoinY, true);

      const train2 = this.obstacleFactory.createMaglevTrain(true, false, 20.0);
      train2.position.set(lanes[2], 0, 20);
      this.registerObstacle(chunkData, train2);
      this.spawnRampTrainCoins(chunkData, lanes[2], 20, 20.0, true, trainRooftopCoinY);
    } else if (sub === 1) {
      // Pattern 1: Twin Parallel 2-Car Express Highway with Open Center Canyon
      const train0 = this.obstacleFactory.createTwoCompartmentTrain(true, false, 13.5);
      train0.position.set(lanes[0], 0, 24);
      this.registerObstacle(chunkData, train0);
      this.spawnRampTrainCoins(chunkData, lanes[0], 24, 28.6, true, trainRooftopCoinY);

      const train2 = this.obstacleFactory.createTwoCompartmentTrain(true, false, 13.5);
      train2.position.set(lanes[2], 0, 24);
      this.registerObstacle(chunkData, train2);
      this.spawnRampTrainCoins(chunkData, lanes[2], 24, 28.6, true, trainRooftopCoinY);

      // Center clear canyon speed run with powerup
      this.spawnCoinLine(chunkData, lanes[1], 6, 48, 8, 0.85, false, true);
    } else if (sub === 2) {
      // Pattern 2: Wide Staggered Slalom (Generous 30m buffer between Lane 0 and Lane 2)
      const train0 = this.obstacleFactory.createMaglevTrain(true, false, 20.0);
      train0.position.set(lanes[0], 0, 16);
      this.registerObstacle(chunkData, train0);
      this.spawnRampTrainCoins(chunkData, lanes[0], 16, 20.0, true, trainRooftopCoinY);

      this.spawnCoinLine(chunkData, lanes[1], 6, 54, 8, 0.85, false, true);

      const train2 = this.obstacleFactory.createMaglevTrain(true, false, 20.0);
      train2.position.set(lanes[2], 0, 44);
      this.registerObstacle(chunkData, train2);
      this.spawnRampTrainCoins(chunkData, lanes[2], 44, 20.0, true, trainRooftopCoinY);
    } else {
      // Pattern 3: Center Articulated Maglev Cruiser with Ramp + Powerup Cache on Roof
      const train1 = this.obstacleFactory.createTwoCompartmentTrain(true, false, 13.5);
      train1.position.set(lanes[1], 0, 24);
      this.registerObstacle(chunkData, train1);
      this.spawnRampTrainCoins(chunkData, lanes[1], 24, 28.6, true, trainRooftopCoinY);
      this.spawnRandomPowerup(chunkData, lanes[1], 24, trainRooftopCoinY, true);

      this.spawnCoinLine(chunkData, lanes[0], 6, 50, 7, 0.85, false, false);
      this.spawnCoinLine(chunkData, lanes[2], 6, 50, 7, 0.85, false, false);
    }
  }

  /**
   * ZONE 2: GROUND AGILITY GAUNTLET (Rare Highlight Surge: Spaced Obstacle Formations)
   * Generous 30m+ runway spacing with clean readable jump arcs and slide gates
   */
  populateObstacleParkourPattern(chunkData, lanes) {
    const sub = Math.floor(Math.random() * 4);

    if (sub === 0) {
      // Single Major Encounter at Z = 26: Slide - Jump Arc - Slide Row (---)
      const gateL = this.obstacleFactory.createPlasmaGate();
      gateL.position.set(lanes[0], 0, 26);
      this.registerObstacle(chunkData, gateL);

      const hurdleC = this.obstacleFactory.createLowHurdle();
      hurdleC.position.set(lanes[1], 0, 26);
      this.registerObstacle(chunkData, hurdleC);
      this.spawnCoinArc(chunkData, lanes[1], 26);

      const gateR = this.obstacleFactory.createPlasmaGate();
      gateR.position.set(lanes[2], 0, 26);
      this.registerObstacle(chunkData, gateR);

      // Generous Entrance Runway (Z = 6..18) and Exit Runway (Z = 35..52)
      this.spawnCoinLine(chunkData, lanes[1], 6, 17, 2, 0.85, false);
      this.spawnCoinLine(chunkData, lanes[1], 35, 52, 3, 0.85, false, true);
    } else if (sub === 1) {
      // Single Major Encounter at Z = 26: Triple Hurdle Line with Parabolic Arcs (---)
      for (let l = 0; l < 3; l++) {
        const h = this.obstacleFactory.createLowHurdle();
        h.position.set(lanes[l], 0, 26);
        this.registerObstacle(chunkData, h);
        this.spawnCoinArc(chunkData, lanes[l], 26);
      }

      this.spawnCoinLine(chunkData, lanes[1], 6, 17, 2, 0.85, false);
      this.spawnCoinLine(chunkData, lanes[1], 35, 52, 3, 0.85, false, true);
    } else if (sub === 2) {
      // Generously Spaced 2-Step Slalom (34m gap: Step 1 at Z = 14, Step 2 at Z = 48)
      const h0 = this.obstacleFactory.createLowHurdle();
      h0.position.set(lanes[0], 0, 14);
      this.registerObstacle(chunkData, h0);
      this.spawnCoinArc(chunkData, lanes[0], 14);

      const h1 = this.obstacleFactory.createLowHurdle();
      h1.position.set(lanes[1], 0, 14);
      this.registerObstacle(chunkData, h1);
      this.spawnCoinArc(chunkData, lanes[1], 14);

      this.spawnCoinLine(chunkData, lanes[2], 6, 24, 3, 0.85, false);

      // Long Breathing Runway & Powerup Cache (Z = 24..38)
      if (Math.random() < 0.35) {
        this.spawnRandomPowerup(chunkData, lanes[1], 31, 1.2, true);
      }

      // Step 2 at Z = 48 (Ample 34m reaction distance)
      const h1b = this.obstacleFactory.createLowHurdle();
      h1b.position.set(lanes[1], 0, 48);
      this.registerObstacle(chunkData, h1b);
      this.spawnCoinArc(chunkData, lanes[1], 48);

      const h2 = this.obstacleFactory.createLowHurdle();
      h2.position.set(lanes[2], 0, 48);
      this.registerObstacle(chunkData, h2);
      this.spawnCoinArc(chunkData, lanes[2], 48);

      this.spawnCoinLine(chunkData, lanes[0], 34, 52, 3, 0.85, false);
    } else {
      // Single Major Encounter at Z = 26: Dual Plasma Gates with Center Runway ( - )
      const gL = this.obstacleFactory.createPlasmaGate();
      gL.position.set(lanes[0], 0, 26);
      this.registerObstacle(chunkData, gL);

      const gR = this.obstacleFactory.createPlasmaGate();
      gR.position.set(lanes[2], 0, 26);
      this.registerObstacle(chunkData, gR);

      this.spawnCoinLine(chunkData, lanes[1], 6, 52, 7, 0.85, false, true);
    }
  }

  /**
   * ZONE 3: DYNAMIC MIXED TRANSIT (70% Primary Game Flow - Balanced & Enjoyable)
   * Varied blend of climbable ramp trains, jump hurdles, slide gates & moving express encounters
   */
  populateTransitChaosPattern(chunkData, lanes, isDownstream, trainRooftopCoinY) {
    const sub = Math.floor(Math.random() * 5);

    if (sub === 0) {
      // 3-Way Choice: Slide Left (Gate), Jump Center (Hurdle Arc), or Climb Right (Ramp Train)
      const gateL = this.obstacleFactory.createPlasmaGate();
      gateL.position.set(lanes[0], 0, 24);
      this.registerObstacle(chunkData, gateL);
      this.spawnCoinLine(chunkData, lanes[0], 6, 18, 2, 0.85, false);
      this.spawnCoinLine(chunkData, lanes[0], 30, 50, 3, 0.85, false);

      const hurdleC = this.obstacleFactory.createLowHurdle();
      hurdleC.position.set(lanes[1], 0, 24);
      this.registerObstacle(chunkData, hurdleC);
      this.spawnCoinArc(chunkData, lanes[1], 24);
      this.spawnCoinLine(chunkData, lanes[1], 35, 52, 3, 0.85, false);

      const rampTrain = this.obstacleFactory.createMaglevTrain(true, false, 20.0);
      rampTrain.position.set(lanes[2], 0, 24);
      this.registerObstacle(chunkData, rampTrain);
      this.spawnRampTrainCoins(chunkData, lanes[2], 24, 20.0, true, trainRooftopCoinY);
    } else if (sub === 1) {
      // Moving Express Encounter + Ramp Train Sanctuary
      if (isDownstream) {
        const movingExpress = this.obstacleFactory.createTwoCompartmentTrain(false, true, 13.5);
        movingExpress.position.set(lanes[0], 0, 54);
        this.registerObstacle(chunkData, movingExpress);
      } else {
        const staticTrain = this.obstacleFactory.createMaglevTrain(false, false, 20.0);
        staticTrain.position.set(lanes[0], 0, 24);
        this.registerObstacle(chunkData, staticTrain);
      }

      const hurdleC = this.obstacleFactory.createLowHurdle();
      hurdleC.position.set(lanes[1], 0, 24);
      this.registerObstacle(chunkData, hurdleC);
      this.spawnCoinArc(chunkData, lanes[1], 24);
      this.spawnCoinLine(chunkData, lanes[1], 35, 52, 3, 0.85, false);

      const rampTrain = this.obstacleFactory.createTwoCompartmentTrain(true, false, 13.5);
      rampTrain.position.set(lanes[2], 0, 24);
      this.registerObstacle(chunkData, rampTrain);
      this.spawnRampTrainCoins(chunkData, lanes[2], 24, 28.6, true, trainRooftopCoinY);
    } else if (sub === 2) {
      // Center Maglev Ramp Train with Flanking Jump Hurdle & Coin Runway
      const hurdleL = this.obstacleFactory.createLowHurdle();
      hurdleL.position.set(lanes[0], 0, 24);
      this.registerObstacle(chunkData, hurdleL);
      this.spawnCoinArc(chunkData, lanes[0], 24);

      const rampTrain = this.obstacleFactory.createMaglevTrain(true, false, 20.0);
      rampTrain.position.set(lanes[1], 0, 24);
      this.registerObstacle(chunkData, rampTrain);
      this.spawnRampTrainCoins(chunkData, lanes[1], 24, 20.0, true, trainRooftopCoinY);
      this.spawnRandomPowerup(chunkData, lanes[1], 24, trainRooftopCoinY, true);

      this.spawnCoinLine(chunkData, lanes[2], 6, 52, 7, 0.85, false, false);
    } else if (sub === 3) {
      // Dual Side Maglev Ramp Trains with Center Speed Corridor
      const train0 = this.obstacleFactory.createMaglevTrain(true, false, 20.0);
      train0.position.set(lanes[0], 0, 24);
      this.registerObstacle(chunkData, train0);
      this.spawnRampTrainCoins(chunkData, lanes[0], 24, 20.0, true, trainRooftopCoinY);

      const train2 = this.obstacleFactory.createMaglevTrain(true, false, 20.0);
      train2.position.set(lanes[2], 0, 24);
      this.registerObstacle(chunkData, train2);
      this.spawnRampTrainCoins(chunkData, lanes[2], 24, 20.0, true, trainRooftopCoinY);

      this.spawnCoinLine(chunkData, lanes[1], 6, 50, 7, 0.85, false, true);
    } else {
      // Hurdle Road Barrier on Lane 0 + Slide Gate on Lane 2 + Center Ramp Train
      const hurdleL = this.obstacleFactory.createLowHurdle();
      hurdleL.position.set(lanes[0], 0, 24);
      this.registerObstacle(chunkData, hurdleL);
      this.spawnCoinArc(chunkData, lanes[0], 24);

      const rampTrain = this.obstacleFactory.createTwoCompartmentTrain(true, false, 13.5);
      rampTrain.position.set(lanes[1], 0, 24);
      this.registerObstacle(chunkData, rampTrain);
      this.spawnRampTrainCoins(chunkData, lanes[1], 24, 28.6, true, trainRooftopCoinY);

      const gateR = this.obstacleFactory.createPlasmaGate();
      gateR.position.set(lanes[2], 0, 24);
      this.registerObstacle(chunkData, gateR);
      this.spawnCoinLine(chunkData, lanes[2], 6, 18, 2, 0.85, false);
      this.spawnCoinLine(chunkData, lanes[2], 30, 50, 3, 0.85, false);
    }
  }

  /**
   * ZONE 4: REWARD DASH (15% Flow - Dense Coin Ribbons & Power-Up Cache)
   */
  populateRewardDashPattern(chunkData, lanes, trainRooftopCoinY) {
    const sub = Math.floor(Math.random() * 3);

    if (sub === 0) {
      // Pure Triple Coin Ribbon Across All 3 Lanes + Center Powerup
      this.spawnCoinLine(chunkData, lanes[1], 6, 48, 8, 0.85, false, true);
      this.spawnCoinLine(chunkData, lanes[0], 8, 46, 7, 0.85, false, false);
      this.spawnCoinLine(chunkData, lanes[2], 8, 46, 7, 0.85, false, false);

      if (Math.random() < 0.4) {
        this.spawnRandomPowerup(chunkData, lanes[1], 28, 1.2, true);
      }
    } else if (sub === 1) {
      // Center Ramp Train Oasis + Dual Side Ground Coin Ribbons
      const rampTrain = this.obstacleFactory.createMaglevTrain(true, false, 20.0);
      rampTrain.position.set(lanes[1], 0, 24);
      this.registerObstacle(chunkData, rampTrain);
      this.spawnRampTrainCoins(chunkData, lanes[1], 24, 20.0, true, trainRooftopCoinY);

      this.spawnRandomPowerup(chunkData, lanes[1], 24, trainRooftopCoinY, true);
      this.spawnCoinLine(chunkData, lanes[0], 8, 48, 7, 0.85, false);
      this.spawnCoinLine(chunkData, lanes[2], 8, 48, 7, 0.85, false);
    } else {
      // Twin Ramp Trains on Lanes 0 & 2 + Center Powerup Runway
      const train0 = this.obstacleFactory.createMaglevTrain(true, false, 20.0);
      train0.position.set(lanes[0], 0, 24);
      this.registerObstacle(chunkData, train0);
      this.spawnRampTrainCoins(chunkData, lanes[0], 24, 20.0, true, trainRooftopCoinY);

      const train2 = this.obstacleFactory.createMaglevTrain(true, false, 20.0);
      train2.position.set(lanes[2], 0, 24);
      this.registerObstacle(chunkData, train2);
      this.spawnRampTrainCoins(chunkData, lanes[2], 24, 20.0, true, trainRooftopCoinY);

      this.spawnCoinLine(chunkData, lanes[1], 6, 48, 7, 0.85, false, true);
    }
  }

  registerObstacle(chunkData, obstacle) {
    const defaultHp = obstacle.userData.type === "train" ? 10 : (obstacle.userData.type === "hurdle" || obstacle.userData.type === "laser_gate" ? 6 : 1);
    obstacle.userData.cachedCollisionData = {
      mesh: obstacle,
      chunkStartZ: chunkData.startZ,
      worldPos: new THREE.Vector3(obstacle.position.x, obstacle.position.y, chunkData.startZ + obstacle.position.z),
      type: obstacle.userData.type,
      hp: obstacle.userData.hp !== undefined ? obstacle.userData.hp : defaultHp,
      maxHp: obstacle.userData.maxHp !== undefined ? obstacle.userData.maxHp : defaultHp,
      requiresSlide: !!obstacle.userData.requiresSlide,
      requiresJump: !!obstacle.userData.requiresJump
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
   * Spawns non-overlapping, strictly straight/flat coins along the train rooftop deck only:
   * - ZERO coins on ramps/slides (clean ramp entrance)
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
    const step = (endZ - startZ) / (count - 1);
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
    if (!force) {
      const spawnRate = CONFIG.POWERUP_SPAWN_CHANCE !== undefined ? CONFIG.POWERUP_SPAWN_CHANCE : 0.0384;
      if (Math.random() > spawnRate) return;
    }

    let types = ["magnet", "jetpack", "shield", "multiplier"];
    // When Big Monster / Monster Robot is active, jetpack must not spawn
    const isMonsterActive = window.gameEngine3D?.hasActiveMonster?.() || window.gameEngine3D?.isBigMonsterActive?.() || window.gameEngine3D?.monsterRobots?.some(b => b.active && !b.isGlitching);
    if (isMonsterActive) {
      types = ["magnet", "shield", "multiplier"];
    }

    const chosen = types[Math.floor(Math.random() * types.length)];
    let powerup;

    if (chosen === "magnet") powerup = this.collectibleFactory.createMagnet();
    else if (chosen === "jetpack") powerup = this.collectibleFactory.createJetpack();
    else if (chosen === "shield") powerup = this.collectibleFactory.createShield();
    else powerup = this.collectibleFactory.createMultiplier();

    const actualY = customY !== undefined ? customY : 1.2;
    powerup.position.set(laneX, actualY, z);
    powerup.userData.isSky = false;
    const isJetpackActive = !!(window.gameEngine3D?.player?.hasJetpack);
    powerup.visible = !isJetpackActive;

    powerup.userData.cachedCollisionData = {
      mesh: powerup,
      chunkRoot: chunkData.root,
      worldPos: new THREE.Vector3(laneX, actualY, chunkData.startZ + z),
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
    if (this.activeChunks.length > 0 && playerZ > this.activeChunks[0].endZ + 12.0) {
      const oldChunk = this.activeChunks.shift();
      this.scene.remove(oldChunk.root);
      this.spawnChunk(false);
    }

    const currentSpeed = window.gameEngine3D?.currentSpeed || 23.5;
    for (let c = 0; c < this.activeChunks.length; c++) {
      const chunk = this.activeChunks[c];
      for (let o = 0; o < chunk.obstacles.length; o++) {
        const obs = chunk.obstacles[o];
        if (obs.userData.isMoving) {
          const effectiveSpeed = obs.userData.moveSpeed + (currentSpeed * 0.05);
          obs.position.z -= effectiveSpeed * dt;
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
      if (chunk.endZ < playerZ - 30 || chunk.startZ > playerZ + 80) continue;

      for (let o = 0; o < chunk.obstacles.length; o++) {
        const obs = chunk.obstacles[o];
        const data = obs.userData.cachedCollisionData;
        if (data) {
          data.worldPos.set(obs.position.x, obs.position.y, chunk.startZ + obs.position.z);
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
    const isComplex = theme === "complex" || theme === "complex_beta";
    if (isComplex) {
      if (typeof textureGen.getComplexMarbleTexture === "function") {
        this.materials.ground.map = textureGen.getComplexMarbleTexture();
      }
      this.materials.ground.shininess = 60;
      this.materials.ground.specular.setHex(0x666666);
      if (typeof textureGen.getComplexWaterTexture === "function") {
        this.materials.sandTerrain.map = textureGen.getComplexWaterTexture();
      }
      if (typeof textureGen.getComplexColonnadeTexture === "function") {
        this.materials.shantyBuilding.map = textureGen.getComplexColonnadeTexture();
      }
      this.materials.tinRoof.color.setHex(0xE2E8F0);
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
}
