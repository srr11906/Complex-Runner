/**
 * PRABHAS: KASI 2898 AD (3D Runner - AAA Next-Gen)
 * High-Performance Track Pool with 5 Distinct Dystopian Shanty & Container Architectures
 * Grounded Utility Pylons, Mounted AC Units, Truss Signboards & Zero Allocation Loop
 */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { CONFIG } from "../config.js";
import { ObstacleFactory3D } from "../models/obstacleModels.js";
import { CollectibleFactory3D } from "../models/collectibleModels.js";
import { textureGen } from "./textureGenerator.js";

export class TrackSegmentPool3D {
  constructor(scene) {
    this.scene = scene;
    this.obstacleFactory = new ObstacleFactory3D();
    this.collectibleFactory = new CollectibleFactory3D();

    this.activeChunks = [];
    this.nextChunkZ = 0;

    // Pre-allocated active query arrays to eliminate Garbage Collection churn
    this._activeObstaclesList = [];
    this._activeCollectiblesList = [];

    // High-Fidelity Materials with Procedural PBR Maps
    this.materials = {
      sandTerrain: new THREE.MeshStandardMaterial({
        map: textureGen.getSandTerrainTexture(),
        roughness: 0.94,
        metalness: 0.05
      }),
      stoneMat: new THREE.MeshStandardMaterial({
        color: CONFIG.COLORS.ANCIENT_STONE,
        roughness: 0.85,
        metalness: 0.15
      }),
      rustScrapMat: new THREE.MeshStandardMaterial({
        color: 0x4D2A18,
        roughness: 0.75,
        metalness: 0.45
      }),
      ground: new THREE.MeshStandardMaterial({
        map: textureGen.getRoadTexture(),
        roughness: 0.85,
        metalness: 0.15,
        side: THREE.DoubleSide
      }),
      roadSlab: new THREE.MeshStandardMaterial({
        color: 0x241D17,
        roughness: 0.95,
        metalness: 0.05
      }),
      roadBorder: new THREE.MeshStandardMaterial({
        color: 0xD97706,
        roughness: 0.35,
        metalness: 0.85
      }),
      shantyBuilding: new THREE.MeshStandardMaterial({
        map: textureGen.getShantyBuildingTexture(),
        roughness: 0.8,
        metalness: 0.25
      }),
      containerRust: new THREE.MeshStandardMaterial({
        map: textureGen.getContainerTexture("rust"),
        roughness: 0.65,
        metalness: 0.5
      }),
      containerCyan: new THREE.MeshStandardMaterial({
        map: textureGen.getContainerTexture("cyan"),
        roughness: 0.6,
        metalness: 0.55
      }),
      containerYellow: new THREE.MeshStandardMaterial({
        map: textureGen.getContainerTexture("yellow"),
        roughness: 0.6,
        metalness: 0.5
      }),
      tinRoof: new THREE.MeshStandardMaterial({
        color: 0x554B42,
        roughness: 0.75,
        metalness: 0.3,
        side: THREE.DoubleSide
      }),
      cableMat: new THREE.MeshBasicMaterial({
        color: 0x14171F
      }),
      scaffoldMat: new THREE.MeshStandardMaterial({
        color: 0x475569,
        roughness: 0.5,
        metalness: 0.8
      }),
      gantryFrame: new THREE.MeshStandardMaterial({
        color: 0x1E293B,
        roughness: 0.4,
        metalness: 0.85
      }),
      hazardStripe: new THREE.MeshBasicMaterial({
        color: 0xF59E0B
      }),
      beaconMat: new THREE.MeshBasicMaterial({
        color: 0xFF2222
      }),
      dishMat: new THREE.MeshStandardMaterial({
        color: 0xCBD5E1,
        roughness: 0.4,
        metalness: 0.7,
        side: THREE.DoubleSide
      }),
      bracketMat: new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.5,
        metalness: 0.85
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

  spawnChunk(isEmptySafe = false) {
    const chunkRoot = new THREE.Group();
    chunkRoot.position.z = this.nextChunkZ;

    const length = CONFIG.CHUNK_LENGTH;
    const roadWidth = 13.6;

    // 0. Continuous Ground Sand Terrain (280m wide segment locked to chunk, zero sliding)
    const sandPlane = new THREE.Mesh(this.geometries.terrainSand, this.materials.sandTerrain);
    sandPlane.rotation.x = -Math.PI / 2;
    sandPlane.position.set(0, -0.05, length / 2);
    sandPlane.receiveShadow = true;
    chunkRoot.add(sandPlane);

    // 1. Concrete Base Slab
    const slab = new THREE.Mesh(this.geometries.slab, this.materials.roadSlab);
    slab.position.set(0, -0.3, length / 2);
    slab.receiveShadow = true;
    chunkRoot.add(slab);

    // 2. Road
    const road = new THREE.Mesh(this.geometries.road, this.materials.ground);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.01, length / 2);
    road.receiveShadow = true;
    chunkRoot.add(road);

    // 3. Bronze Curbs
    for (let side of [-1, 1]) {
      const curb = new THREE.Mesh(this.geometries.curb, this.materials.roadBorder);
      curb.rotation.x = Math.PI / 2;
      curb.position.set(side * (roadWidth / 2), 0.14, length / 2);
      chunkRoot.add(curb);
    }

    // 4. Shanties & Stacked Containers
    this.buildDiverseRoadsideShanties(chunkRoot, length);

    // 5. Overhead Cables with Grounded Utility Pylons
    this.buildOverheadCables(chunkRoot, length);

    // 6. Roadside Desert Dunes & Crags (Attached to chunk for zero pop-in / no sliding)
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
          cBox.receiveShadow = true;
          chunkRoot.add(cBox);
        }
      } else if (archType === 1) {
        // ARCHETYPE 1: Cantilevered Tin Shanty with Mounted AC Unit & Solar Dish
        const bHeight = 10.0;
        const mainShanty = new THREE.Mesh(this.geometries.shanty1, this.materials.shantyBuilding);
        mainShanty.position.set(posX + side * 4.5, bHeight / 2 - 0.3, bZ);
        mainShanty.receiveShadow = true;
        chunkRoot.add(mainShanty);

        const roof = new THREE.Mesh(this.geometries.roof1, this.materials.tinRoof);
        roof.rotation.x = -Math.PI / 2;
        roof.rotation.z = side * 0.18;
        roof.position.set(mainShanty.position.x - (side * 0.8), bHeight + 0.1, bZ);
        chunkRoot.add(roof);

        // Solid Wall-Mounted AC Unit on Steel Shelf Bracket
        const acGroup = new THREE.Group();
        acGroup.position.set(posX - side * 0.2, bHeight * 0.65 - 0.3, bZ + 3.0);

        const acUnit = new THREE.Mesh(this.geometries.acUnit, this.materials.scaffoldMat);
        acGroup.add(acUnit);

        const acShelf = new THREE.Mesh(this.geometries.acShelf, this.materials.bracketMat);
        acShelf.position.y = -0.72;
        acGroup.add(acShelf);

        for (let sx of [-0.6, 0.6]) {
          const strut = new THREE.Mesh(this.geometries.acStrut, this.materials.bracketMat);
          strut.rotation.z = side * 0.45;
          strut.position.set(sx, -1.1, 0);
          acGroup.add(strut);
        }
        chunkRoot.add(acGroup);

        const dish = new THREE.Mesh(this.geometries.dish, this.materials.dishMat);
        dish.position.set(mainShanty.position.x, bHeight + 1.3, bZ - 3.0);
        dish.rotation.x = 0.4;
        dish.rotation.y = side > 0 ? -0.5 : 0.5;
        chunkRoot.add(dish);
      } else if (archType === 2) {
        // ARCHETYPE 2: Multi-Tier Tenement Tower with Solid Truss-Mounted Neon Billboard
        const bHeight = 18.0;
        const tower = new THREE.Mesh(this.geometries.shanty2, this.materials.shantyBuilding);
        tower.position.set(posX + side * 5.0, bHeight / 2 - 0.3, bZ);
        tower.receiveShadow = true;
        chunkRoot.add(tower);

        const mast = new THREE.Mesh(this.geometries.mast, this.materials.scaffoldMat);
        mast.position.set(tower.position.x, bHeight + 6.7, bZ);
        chunkRoot.add(mast);

        const beacon = new THREE.Mesh(this.geometries.beacon, this.materials.beaconMat);
        beacon.position.set(mast.position.x, bHeight + 13.9, mast.position.z);
        chunkRoot.add(beacon);

        // Truss-Mounted Signboard projecting from the wall
        const signGroup = new THREE.Group();
        const signX = posX - (side * 0.5);
        signGroup.position.set(signX, bHeight * 0.55 - 0.3, bZ);
        signGroup.rotation.y = side > 0 ? -Math.PI / 2 + 0.08 : Math.PI / 2 - 0.08;

        const chosenSign = signKeys[Math.floor(Math.random() * signKeys.length)];
        const signBoard = new THREE.Mesh(this.geometries.signBoard, this.signMaterials[chosenSign]);
        signGroup.add(signBoard);

        // Horizontal Iron Support Frame
        for (let fy of [-1.35, 1.35]) {
          const frame = new THREE.Mesh(this.geometries.signFrame, this.materials.bracketMat);
          frame.position.y = fy;
          signGroup.add(frame);
        }

        // Cantilever Wall Arm connecting sign to building
        const arm = new THREE.Mesh(this.geometries.signArm, this.materials.bracketMat);
        arm.position.set(side * 1.2, 0, -0.2);
        signGroup.add(arm);

        chunkRoot.add(signGroup);
      } else if (archType === 3) {
        // ARCHETYPE 3: Heavy Steel Structure & Rooftop Cistern
        const bHeight = 12.0;
        const baseBuilding = new THREE.Mesh(this.geometries.shanty3, this.materials.shantyBuilding);
        baseBuilding.position.set(posX + side * 4.25, bHeight / 2 - 0.3, bZ);
        baseBuilding.receiveShadow = true;
        chunkRoot.add(baseBuilding);

        const cistern = new THREE.Mesh(this.geometries.cistern, this.materials.containerRust);
        cistern.position.set(baseBuilding.position.x, bHeight + 1.5, bZ);
        chunkRoot.add(cistern);
      } else {
        // ARCHETYPE 4: Overhead Industrial Gantry Crane Superstructure
        if (side === 1) {
          const gantryGroup = new THREE.Group();
          gantryGroup.position.set(0, 0, bZ);

          for (let gx of [-14.5, 14.5]) {
            const pillar = new THREE.Mesh(this.geometries.gantryPillar, this.materials.gantryFrame);
            pillar.position.set(gx, 7.5, 0);
            pillar.receiveShadow = true;
            gantryGroup.add(pillar);
          }

          const topBeam = new THREE.Mesh(this.geometries.gantryTop, this.materials.gantryFrame);
          topBeam.position.set(0, 15.2, 0);
          gantryGroup.add(topBeam);

          const hazard = new THREE.Mesh(this.geometries.beacon, this.materials.hazardStripe);
          hazard.position.set(0, 13.9, 0);
          gantryGroup.add(hazard);

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
      // 1. Concrete & Steel Utility Pylon Posts firmly rooted in the roadside ground
      for (let side of [-1, 1]) {
        const poleX = side * 8.5;
        const pylon = new THREE.Mesh(this.geometries.pylonPole, this.materials.scaffoldMat);
        pylon.position.set(poleX, 7.0, cZ);
        pylon.receiveShadow = true;
        chunkRoot.add(pylon);

        // Crossarm Beam at top
        const arm = new THREE.Mesh(this.geometries.pylonArm, this.materials.bracketMat);
        arm.position.set(poleX - (side * 0.6), 14.2, cZ);
        chunkRoot.add(arm);

        // Ceramic Insulator
        const ins = new THREE.Mesh(this.geometries.insulator, this.materials.dishMat);
        ins.position.set(poleX, 13.8, cZ);
        chunkRoot.add(ins);
      }

      // 2. High-Voltage Catenary Cable draped between the two insulators
      const cable = new THREE.Mesh(this.geometries.cable, this.materials.cableMat);
      cable.position.z = cZ;
      chunkRoot.add(cable);
    }
  }

  /**
   * Roadside Desert Dunes, Crags & Sunken Salvage firmly anchored to the chunk
   */
  buildRoadsideDunes(chunkRoot, length) {
    for (let side of [-1, 1]) {
      // 1. Primary Rolling Sand Dune Wave placed far enough to never overlap running lanes
      const dune = new THREE.Mesh(this.geometries.duneGeo, this.materials.sandTerrain);
      const duneX = side * (46.0 + Math.random() * 10.0);
      const duneZ = (length / 2) + (Math.random() - 0.5) * 22.0;
      dune.scale.set(1.2 + Math.random() * 0.4, 0.35 + Math.random() * 0.08, 1.3 + Math.random() * 0.4);
      dune.position.set(duneX, -2.5, duneZ);
      dune.rotation.y = Math.random() * Math.PI;
      dune.receiveShadow = true;
      chunkRoot.add(dune);

      // 2. Weathered Desert Rock Formations in roadside margin
      const rock = new THREE.Mesh(this.geometries.rockGeo, this.materials.stoneMat);
      rock.position.set(side * (28.0 + Math.random() * 8.0), 1.2, duneZ + (Math.random() - 0.5) * 12);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.scale.set(1.2, 0.8, 1.4);
      rock.receiveShadow = true;
      chunkRoot.add(rock);

      // 3. Low-Profile Windblown Sand Drifts lapping subtly against outer curbs (Never blocking lanes)
      const drift = new THREE.Mesh(this.geometries.driftGeo, this.materials.sandTerrain);
      const driftZ = (length * 0.3) + (Math.random() * length * 0.4);
      drift.position.set(side * 7.1, 0.06, driftZ);
      drift.rotation.z = side * 0.06;
      drift.scale.set(1.0 + Math.random() * 0.3, 1.0, 1.5 + Math.random() * 0.5);
      drift.receiveShadow = true;
      chunkRoot.add(drift);

      // 4. Sunken Industrial Scrap Conduit emerging from sand
      if (Math.random() > 0.4) {
        const pipe = new THREE.Mesh(this.geometries.pipeGeo, this.materials.rustScrapMat);
        pipe.position.set(side * (32.0 + Math.random() * 10.0), 1.0, duneZ);
        pipe.rotation.set(0.3, 0.6 * side, 0.8 * side);
        pipe.receiveShadow = true;
        chunkRoot.add(pipe);
      }
    }
  }

  populateChunkPatterns(chunkData) {
    const chunkRoot = chunkData.root;
    const lanes = CONFIG.LANES;
    const patternType = Math.floor(Math.random() * 5);
    const trainRooftopCoinY = 5.65;

    if (patternType === 0) {
      const trainLane = Math.floor(Math.random() * 3);
      const train = this.obstacleFactory.createMaglevTrain(true, false, 24.0);
      train.position.set(lanes[trainLane], 0, 26);
      this.registerObstacle(chunkData, train);

      this.spawnCoinLine(chunkData, lanes[trainLane], 14, 38, 6, trainRooftopCoinY, false);

      const sideLane = (trainLane + 1) % 3;
      const hurdle = this.obstacleFactory.createLowHurdle();
      hurdle.position.set(lanes[sideLane], 0, 20);
      this.registerObstacle(chunkData, hurdle);

      const pLane = (trainLane + 2) % 3;
      this.spawnRandomPowerup(chunkData, lanes[pLane], 28);
    } else if (patternType === 1) {
      // Rightmost lane (User POV): Moving Maglev Train advancing towards player at balanced speed
      const movingTrain = this.obstacleFactory.createMaglevTrain(false, true, 22.0);
      movingTrain.position.set(lanes[0], 0, 54);
      this.registerObstacle(chunkData, movingTrain);

      // Leftmost lane (User POV): Climbable Ramp Train with rooftop coins
      const rampTrain = this.obstacleFactory.createMaglevTrain(true, false, 22.0);
      rampTrain.position.set(lanes[2], 0, 25);
      this.registerObstacle(chunkData, rampTrain);

      this.spawnCoinLine(chunkData, lanes[2], 14, 36, 5, trainRooftopCoinY, false);
      this.spawnCoinLine(chunkData, lanes[1], 10, 48, 6, 0.85, false);
    } else if (patternType === 2) {
      for (let l of [0, 2]) {
        const train = this.obstacleFactory.createMaglevTrain(l === 2, false, 24.0);
        train.position.set(lanes[l], 0, 28);
        this.registerObstacle(chunkData, train);
      }
      this.spawnCoinLine(chunkData, lanes[1], 8, 50, 7, 0.85, false);
      this.spawnRandomPowerup(chunkData, lanes[1], 28);
    } else if (patternType === 3) {
      const train1 = this.obstacleFactory.createMaglevTrain(true, false, 22.0);
      train1.position.set(lanes[0], 0, 24);
      this.registerObstacle(chunkData, train1);

      const train2 = this.obstacleFactory.createMaglevTrain(false, false, 22.0);
      train2.position.set(lanes[1], 0, 28);
      this.registerObstacle(chunkData, train2);

      this.spawnCoinLine(chunkData, lanes[0], 12, 34, 5, trainRooftopCoinY, false);

      const gate = this.obstacleFactory.createPlasmaGate();
      gate.position.set(lanes[2], 0, 26);
      this.registerObstacle(chunkData, gate);
    } else {
      const train = this.obstacleFactory.createMaglevTrain(true, false, 26.0);
      train.position.set(lanes[1], 0, 26);
      this.registerObstacle(chunkData, train);
      this.spawnCoinLine(chunkData, lanes[1], 12, 40, 6, trainRooftopCoinY, false);

      for (let side of [0, 2]) {
        const hurdle = this.obstacleFactory.createLowHurdle();
        hurdle.position.set(lanes[side], 0, 18);
        this.registerObstacle(chunkData, hurdle);
      }
    }

    // Sky Coins for Jetpack Flight
    const skyLane = Math.floor(Math.random() * 3);
    this.spawnCoinLine(chunkData, lanes[skyLane], 8, 52, 7, CONFIG.JETPACK_ALTITUDE, true);
  }

  registerObstacle(chunkData, obstacle) {
    obstacle.userData.cachedCollisionData = {
      mesh: obstacle,
      chunkStartZ: chunkData.startZ,
      worldPos: new THREE.Vector3(obstacle.position.x, obstacle.position.y, chunkData.startZ + obstacle.position.z),
      type: obstacle.userData.type,
      requiresSlide: !!obstacle.userData.requiresSlide,
      requiresJump: !!obstacle.userData.requiresJump
    };
    chunkData.root.add(obstacle);
    chunkData.obstacles.push(obstacle);
  }

  spawnCoinLine(chunkData, laneX, startZ, endZ, count, yHeight, isSkyCoin = false) {
    const step = (endZ - startZ) / (count - 1);
    for (let i = 0; i < count; i++) {
      const coin = this.collectibleFactory.createCoin();
      coin.position.set(laneX, yHeight, startZ + i * step);
      coin.userData.isSky = isSkyCoin;
      coin.visible = !isSkyCoin;

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

  spawnRandomPowerup(chunkData, laneX, z) {
    const types = ["magnet", "jetpack", "shield", "multiplier"];
    const chosen = types[Math.floor(Math.random() * types.length)];
    let powerup;

    if (chosen === "magnet") powerup = this.collectibleFactory.createMagnet();
    else if (chosen === "jetpack") powerup = this.collectibleFactory.createJetpack();
    else if (chosen === "shield") powerup = this.collectibleFactory.createShield();
    else powerup = this.collectibleFactory.createMultiplier();

    powerup.position.set(laneX, 1.2, z);
    powerup.userData.isSky = false;

    powerup.userData.cachedCollisionData = {
      mesh: powerup,
      chunkRoot: chunkData.root,
      worldPos: new THREE.Vector3(laneX, 1.2, chunkData.startZ + z),
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

  update(playerZ, isJetpack = false, dt = 0.016) {
    if (this.activeChunks.length > 0 && playerZ > this.activeChunks[0].endZ + 75) {
      const oldChunk = this.activeChunks.shift();
      this.scene.remove(oldChunk.root);
      this.spawnChunk(false);
    }

    for (let c = 0; c < this.activeChunks.length; c++) {
      const chunk = this.activeChunks[c];
      for (let o = 0; o < chunk.obstacles.length; o++) {
        const obs = chunk.obstacles[o];
        if (obs.userData.isMoving) {
          obs.position.z -= obs.userData.moveSpeed * dt;
        }
      }
    }

    const time = performance.now() * 0.003;
    for (let c = 0; c < this.activeChunks.length; c++) {
      const chunk = this.activeChunks[c];
      const groundList = chunk.groundCollectibles;
      for (let i = 0; i < groundList.length; i++) {
        const item = groundList[i];
        if (!item.userData.collected) {
          item.visible = !isJetpack;
          item.rotation.y = time * 2.2;
        }
      }

      const skyList = chunk.skyCollectibles;
      for (let i = 0; i < skyList.length; i++) {
        const item = skyList[i];
        if (!item.userData.collected) {
          item.visible = isJetpack;
          item.rotation.y = time * 2.5;
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
}
