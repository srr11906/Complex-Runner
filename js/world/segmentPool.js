/**
 * PRABHAS: KASI 2898 AD (3D Runner - AAA Next-Gen)
 * High-Performance Track Pool with 4 Distinct Shanty Architectures & Optimized 60 FPS Draw Calls
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

    // High-Fidelity PBR Track & Multi-Architecture Materials
    this.materials = {
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
      rustContainer: new THREE.MeshStandardMaterial({
        color: 0x8C3B1E,
        roughness: 0.7,
        metalness: 0.4
      }),
      cyanContainer: new THREE.MeshStandardMaterial({
        color: 0x2A6A78,
        roughness: 0.65,
        metalness: 0.45
      }),
      yellowContainer: new THREE.MeshStandardMaterial({
        color: 0xB8860B,
        roughness: 0.6,
        metalness: 0.4
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
      })
    };
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

    // 1. Solid 3D Concrete Base Slab
    const slabGeo = new THREE.BoxGeometry(roadWidth, 0.6, length);
    const slab = new THREE.Mesh(slabGeo, this.materials.roadSlab);
    slab.position.set(0, -0.3, length / 2);
    slab.receiveShadow = true;
    chunkRoot.add(slab);

    // 2. High-Res PBR Sand-Dusted Road
    const roadGeo = new THREE.PlaneGeometry(roadWidth, length);
    const road = new THREE.Mesh(roadGeo, this.materials.ground);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.01, length / 2);
    road.receiveShadow = true;
    chunkRoot.add(road);

    // 3. Bronze Highway Guard Curbs
    for (let side of [-1, 1]) {
      const curbGeo = new THREE.CylinderGeometry(0.28, 0.28, length, 10);
      const curb = new THREE.Mesh(curbGeo, this.materials.roadBorder);
      curb.rotation.x = Math.PI / 2;
      curb.position.set(side * (roadWidth / 2), 0.14, length / 2);
      chunkRoot.add(curb);
    }

    // 4. Optimized Roadside Shanties
    this.buildDiverseRoadsideShanties(chunkRoot, length);

    // 5. Overhead High-Voltage Catenary Power Cables
    this.buildOverheadCables(chunkRoot, length);

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

  /**
   * 4 Distinct Dystopian Shanty Architectures (Optimized for 60 FPS)
   */
  buildDiverseRoadsideShanties(chunkRoot, length) {
    const signTypes = ["lassi", "complex", "ore"];

    for (let side of [-1, 1]) {
      const posX = side * (14.0 + Math.random() * 2.0);
      const archType = Math.floor(Math.random() * 4);
      const bZ = (length / 2) + (Math.random() - 0.5) * 20;

      if (archType === 0) {
        // ARCHETYPE 1: Staggered Multi-Color Cargo Containers
        const containerMats = [this.materials.rustContainer, this.materials.cyanContainer, this.materials.yellowContainer];
        const numContainers = 3;

        for (let c = 0; c < numContainers; c++) {
          const cMat = containerMats[c % containerMats.length];
          const cBox = new THREE.Mesh(
            new THREE.BoxGeometry(6.5, 4.2, 12.0),
            cMat
          );
          cBox.position.set(
            posX + (side * (c * 1.8)),
            (c * 4.2) + 2.1,
            bZ + ((c % 2 === 0) ? -2 : 2)
          );
          cBox.receiveShadow = true;
          chunkRoot.add(cBox);
        }

      } else if (archType === 1) {
        // ARCHETYPE 2: Slanted Corrugated Tin Shanty with Overhang Roof
        const bWidth = 9.0;
        const bHeight = 10.0;
        const bDepth = 15.0;

        const mainShanty = new THREE.Mesh(
          new THREE.BoxGeometry(bWidth, bHeight, bDepth),
          this.materials.shantyBuilding
        );
        mainShanty.position.set(posX + side * (bWidth / 2), bHeight / 2, bZ);
        mainShanty.receiveShadow = true;
        chunkRoot.add(mainShanty);

        // Slanted Corrugated Overhang Tin Roof
        const roof = new THREE.Mesh(
          new THREE.PlaneGeometry(bWidth + 3.0, bDepth + 2.0),
          this.materials.tinRoof
        );
        roof.rotation.x = -Math.PI / 2;
        roof.rotation.z = side * 0.18;
        roof.position.set(mainShanty.position.x - (side * 0.8), bHeight + 0.4, bZ);
        chunkRoot.add(roof);

        // AC Unit Box on side
        const acUnit = new THREE.Mesh(
          new THREE.BoxGeometry(1.6, 1.4, 1.2),
          this.materials.scaffoldMat
        );
        acUnit.position.set(side * 8.5, bHeight * 0.65, bZ + 3.0);
        chunkRoot.add(acUnit);

      } else if (archType === 2) {
        // ARCHETYPE 3: Multi-Tier Concrete Tenement Tower with Antenna & Neon Billboard
        const bWidth = 10.0;
        const bHeight = 18.0;
        const bDepth = 16.0;

        const tower = new THREE.Mesh(
          new THREE.BoxGeometry(bWidth, bHeight, bDepth),
          this.materials.shantyBuilding
        );
        tower.position.set(posX + side * (bWidth / 2), bHeight / 2, bZ);
        tower.receiveShadow = true;
        chunkRoot.add(tower);

        // Communication Antenna Mast
        const mast = new THREE.Mesh(
          new THREE.CylinderGeometry(0.16, 0.3, 14, 6),
          this.materials.scaffoldMat
        );
        mast.position.set(tower.position.x, bHeight + 7, bZ);
        chunkRoot.add(mast);

        const beacon = new THREE.Mesh(
          new THREE.SphereGeometry(0.38, 6, 6),
          new THREE.MeshBasicMaterial({ color: 0xFF2222 })
        );
        beacon.position.set(mast.position.x, bHeight + 14.2, mast.position.z);
        chunkRoot.add(beacon);

        // Holographic Neon Sign
        const chosenSign = signTypes[Math.floor(Math.random() * signTypes.length)];
        const signTex = textureGen.getNeonSignTexture(chosenSign);
        const signBoard = new THREE.Mesh(
          new THREE.PlaneGeometry(5.4, 2.7),
          new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide })
        );
        signBoard.position.set(side * 7.5, bHeight * 0.55, bZ);
        signBoard.rotation.y = side > 0 ? -Math.PI / 2 + 0.12 : Math.PI / 2 - 0.12;
        chunkRoot.add(signBoard);

      } else {
        // ARCHETYPE 4: Heavy Steel Structure & Rooftop Cistern
        const bWidth = 8.5;
        const bHeight = 12.0;
        const bDepth = 14.0;

        const baseBuilding = new THREE.Mesh(
          new THREE.BoxGeometry(bWidth, bHeight, bDepth),
          this.materials.shantyBuilding
        );
        baseBuilding.position.set(posX + side * (bWidth / 2), bHeight / 2, bZ);
        baseBuilding.receiveShadow = true;
        chunkRoot.add(baseBuilding);

        // Rooftop Water Tank Cistern
        const cistern = new THREE.Mesh(
          new THREE.CylinderGeometry(2.0, 2.0, 3.5, 12),
          this.materials.rustContainer
        );
        cistern.position.set(baseBuilding.position.x, bHeight + 1.8, bZ);
        chunkRoot.add(cistern);
      }
    }
  }

  /**
   * Overhead Catenary Power Cables
   */
  buildOverheadCables(chunkRoot, length) {
    for (let cZ = 15; cZ < length; cZ += 30) {
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-9.5, 12.0, cZ),
        new THREE.Vector3(0, 8.8, cZ + 2),
        new THREE.Vector3(9.5, 12.0, cZ)
      );
      const tubeGeo = new THREE.TubeGeometry(curve, 10, 0.045, 4, false);
      const cable = new THREE.Mesh(tubeGeo, this.materials.cableMat);
      chunkRoot.add(cable);
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
      chunkRoot.add(train);
      chunkData.obstacles.push(train);

      this.spawnCoinLine(chunkData, lanes[trainLane], 14, 38, 6, trainRooftopCoinY, false);

      const sideLane = (trainLane + 1) % 3;
      const hurdle = this.obstacleFactory.createLowHurdle();
      hurdle.position.set(lanes[sideLane], 0, 20);
      chunkRoot.add(hurdle);
      chunkData.obstacles.push(hurdle);

      const pLane = (trainLane + 2) % 3;
      this.spawnRandomPowerup(chunkData, lanes[pLane], 28);

    } else if (patternType === 1) {
      const moveLane = 0;
      const movingTrain = this.obstacleFactory.createMaglevTrain(false, true, 22.0);
      movingTrain.position.set(lanes[moveLane], 0, 32);
      chunkRoot.add(movingTrain);
      chunkData.obstacles.push(movingTrain);

      const rampTrain = this.obstacleFactory.createMaglevTrain(true, false, 22.0);
      rampTrain.position.set(lanes[2], 0, 25);
      chunkRoot.add(rampTrain);
      chunkData.obstacles.push(rampTrain);
      this.spawnCoinLine(chunkData, lanes[2], 14, 36, 5, trainRooftopCoinY, false);

      this.spawnCoinLine(chunkData, lanes[1], 10, 48, 6, 0.85, false);

    } else if (patternType === 2) {
      for (let l of [0, 2]) {
        const train = this.obstacleFactory.createMaglevTrain(l === 2, false, 24.0);
        train.position.set(lanes[l], 0, 28);
        chunkRoot.add(train);
        chunkData.obstacles.push(train);
      }
      this.spawnCoinLine(chunkData, lanes[1], 8, 50, 7, 0.85, false);
      this.spawnRandomPowerup(chunkData, lanes[1], 28);

    } else if (patternType === 3) {
      const train1 = this.obstacleFactory.createMaglevTrain(true, false, 22.0);
      train1.position.set(lanes[0], 0, 24);
      chunkRoot.add(train1);
      chunkData.obstacles.push(train1);

      const train2 = this.obstacleFactory.createMaglevTrain(false, false, 22.0);
      train2.position.set(lanes[1], 0, 28);
      chunkRoot.add(train2);
      chunkData.obstacles.push(train2);

      this.spawnCoinLine(chunkData, lanes[0], 12, 34, 5, trainRooftopCoinY, false);

      const gate = this.obstacleFactory.createPlasmaGate();
      gate.position.set(lanes[2], 0, 26);
      chunkRoot.add(gate);
      chunkData.obstacles.push(gate);

    } else {
      const train = this.obstacleFactory.createMaglevTrain(true, false, 26.0);
      train.position.set(lanes[1], 0, 26);
      chunkRoot.add(train);
      chunkData.obstacles.push(train);
      this.spawnCoinLine(chunkData, lanes[1], 12, 40, 6, trainRooftopCoinY, false);

      for (let side of [0, 2]) {
        const hurdle = this.obstacleFactory.createLowHurdle();
        hurdle.position.set(lanes[side], 0, 18);
        chunkRoot.add(hurdle);
        chunkData.obstacles.push(hurdle);
      }
    }

    // Sky Coins for Jetpack Flight
    const skyLane = Math.floor(Math.random() * 3);
    this.spawnCoinLine(chunkData, lanes[skyLane], 8, 52, 7, CONFIG.JETPACK_ALTITUDE, true);
  }

  spawnCoinLine(chunkData, laneX, startZ, endZ, count, yHeight, isSkyCoin = false) {
    const step = (endZ - startZ) / (count - 1);
    for (let i = 0; i < count; i++) {
      const coin = this.collectibleFactory.createCoin();
      coin.position.set(laneX, yHeight, startZ + i * step);
      coin.userData.isSky = isSkyCoin;
      coin.visible = !isSkyCoin;
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
    chunkData.root.add(powerup);
    chunkData.groundCollectibles.push(powerup);
  }

  update(playerZ, isJetpack = false, dt = 0.016) {
    if (this.activeChunks.length > 0 && playerZ > this.activeChunks[0].endZ + 75) {
      const oldChunk = this.activeChunks.shift();
      this.scene.remove(oldChunk.root);
      this.spawnChunk(false);
    }

    for (const chunk of this.activeChunks) {
      for (const obs of chunk.obstacles) {
        if (obs.userData.isMoving) {
          obs.position.z -= obs.userData.moveSpeed * dt;
        }
      }
    }

    const time = performance.now() * 0.003;
    for (const chunk of this.activeChunks) {
      for (const item of chunk.groundCollectibles) {
        if (!item.userData.collected) {
          item.visible = !isJetpack;
          item.rotation.y = time * 2.2;
          if (item.userData.type === "powerup") {
            item.position.y += Math.sin(time * 3 + item.position.z) * 0.004;
          }
        }
      }

      for (const item of chunk.skyCollectibles) {
        if (!item.userData.collected) {
          item.visible = isJetpack;
          item.rotation.y = time * 2.5;
        }
      }
    }
  }

  getAllActiveObstacles() {
    const list = [];
    for (const chunk of this.activeChunks) {
      for (const obs of chunk.obstacles) {
        list.push({
          mesh: obs,
          chunkStartZ: chunk.startZ,
          worldPos: new THREE.Vector3(
            obs.position.x,
            obs.position.y,
            chunk.startZ + obs.position.z
          ),
          type: obs.userData.type,
          requiresSlide: !!obs.userData.requiresSlide,
          requiresJump: !!obs.userData.requiresJump
        });
      }
    }
    return list;
  }

  getAllActiveCollectibles(isJetpack = false) {
    const list = [];
    for (const chunk of this.activeChunks) {
      const targetGroup = isJetpack ? chunk.skyCollectibles : chunk.groundCollectibles;
      for (const item of targetGroup) {
        if (!item.userData.collected && item.visible) {
          list.push({
            mesh: item,
            chunkRoot: chunk.root,
            worldPos: new THREE.Vector3(
              item.position.x,
              item.position.y,
              chunk.startZ + item.position.z
            ),
            type: item.userData.type,
            powerupType: item.userData.powerupType || null,
            radius: item.userData.radius || 0.6,
            points: item.userData.points || 10000,
            duration: item.userData.duration || 0,
            itemRef: item
          });
        }
      }
    }
    return list;
  }
}
