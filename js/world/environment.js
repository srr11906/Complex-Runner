/**
 * PRABHAS: KASI 2898 AD (3D Runner - AAA Next-Gen)
 * Highly Optimized Cinematic Desert Environment & Continuous Terrain Floor
 * Zero Framedrops, High Performance 60 FPS
 */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { CONFIG } from "../config.js";
import { textureGen } from "./textureGenerator.js";

export class Environment3D {
  constructor(scene) {
    this.scene = scene;
    this.complexGroup = new THREE.Group();
    this.sunGroup = new THREE.Group();
    this.skyDome = null;
    this.groundFloor = null;
    this.sunLight = null;
    this.sunTarget = null;
    this.sandParticles = null;
    this.particleVelocities = [];
    this.sceneryNodes = [];
    this.initEnvironment();
  }

  initEnvironment() {
    // 1. Dark Amber-Brown World Background
    this.scene.background = new THREE.Color(CONFIG.COLORS.SKY_TOP);
    this.scene.fog = new THREE.FogExp2(CONFIG.COLORS.FOG, 0.0024);

    // 2. Warm Hemispherical Desert Atmosphere Light
    const hemiLight = new THREE.HemisphereLight(
      CONFIG.COLORS.HEMI_SKY,
      CONFIG.COLORS.HEMI_GROUND,
      2.8
    );
    hemiLight.position.set(0, 50, 0);
    this.scene.add(hemiLight);

    // 3. Directional Sun Light Tracking (Optimized 2048x2048 shadow map)
    this.sunLight = new THREE.DirectionalLight(CONFIG.COLORS.SUN_LIGHT, 3.4);
    this.sunLight.position.set(35, 75, -40);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 240;
    this.sunLight.shadow.camera.left = -28;
    this.sunLight.shadow.camera.right = 28;
    this.sunLight.shadow.camera.top = 28;
    this.sunLight.shadow.camera.bottom = -28;
    this.sunLight.shadow.bias = -0.0004;

    this.sunTarget = new THREE.Object3D();
    this.sunTarget.position.set(0, 0, 0);
    this.scene.add(this.sunTarget);
    this.sunLight.target = this.sunTarget;
    this.scene.add(this.sunLight);

    this.buildDaylightSkyDome();
    this.buildInfiniteDesertGroundFloor();
    this.buildMovieAccurateComplex();
    this.buildDynamicDesertScenery();
    this.buildSparklingSandParticles();
  }

  buildDaylightSkyDome() {
    const skyGeo = new THREE.SphereGeometry(600, 24, 16, 0, Math.PI * 2, 0, Math.PI);
    const count = skyGeo.attributes.position.count;
    const colors = new Float32Array(count * 3);

    const topColor = new THREE.Color(CONFIG.COLORS.SKY_TOP);
    const horizonColor = new THREE.Color(CONFIG.COLORS.SKY_HORIZON);
    const groundColor = new THREE.Color(CONFIG.COLORS.SAND_GROUND);

    for (let i = 0; i < count; i++) {
      const y = skyGeo.attributes.position.getY(i);
      let c;
      if (y >= 0) {
        const ratio = Math.max(0, Math.min(1, y / 500));
        c = new THREE.Color().copy(horizonColor).lerp(topColor, Math.pow(ratio, 0.65));
      } else {
        const ratio = Math.max(0, Math.min(1, -y / 300));
        c = new THREE.Color().copy(horizonColor).lerp(groundColor, Math.pow(ratio, 0.7));
      }
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    skyGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const skyMat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      side: THREE.BackSide,
      fog: false
    });

    this.skyDome = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(this.skyDome);

    // Radiant Sun Disk
    const sunDisk = new THREE.Mesh(
      new THREE.SphereGeometry(26, 18, 18),
      new THREE.MeshBasicMaterial({ color: 0xFFFDF0, fog: false })
    );
    sunDisk.position.set(140, 280, -220);
    this.sunGroup.add(sunDisk);

    const haloGeo = new THREE.RingGeometry(26, 75, 24);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xFDE047,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      fog: false
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.set(140, 280, -218);
    halo.lookAt(0, 0, 0);
    this.sunGroup.add(halo);

    this.scene.add(this.sunGroup);
  }

  buildInfiniteDesertGroundFloor() {
    const floorGeo = new THREE.PlaneGeometry(1000, 1000, 1, 1);
    const floorMat = new THREE.MeshStandardMaterial({
      color: CONFIG.COLORS.SAND_GROUND,
      roughness: 0.95,
      metalness: 0.05,
      side: THREE.DoubleSide
    });

    this.groundFloor = new THREE.Mesh(floorGeo, floorMat);
    this.groundFloor.rotation.x = -Math.PI / 2;
    this.groundFloor.position.set(0, -0.6, 0);
    this.groundFloor.receiveShadow = true;
    this.scene.add(this.groundFloor);
  }

  buildMovieAccurateComplex() {
    this.complexGroup.position.set(0, 145, 380);

    const complexMat = new THREE.MeshStandardMaterial({
      map: textureGen.getComplexMonolithTexture(),
      roughness: 0.35,
      metalness: 0.8
    });

    const goldenCoreMat = new THREE.MeshBasicMaterial({
      color: 0xFFFBEB,
      fog: false
    });

    const goldenCoronaMat = new THREE.MeshBasicMaterial({
      color: 0xFDE047,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
      fog: false
    });

    const cyanTrenchMat = new THREE.MeshBasicMaterial({
      color: 0xF59E0B,
      fog: false
    });

    const pyramidGeo = new THREE.CylinderGeometry(110, 8, 120, 4, 1, false);
    const pyramidMesh = new THREE.Mesh(pyramidGeo, complexMat);
    pyramidMesh.rotation.y = Math.PI / 4;
    this.complexGroup.add(pyramidMesh);

    const coreSphere = new THREE.Mesh(
      new THREE.SphereGeometry(24, 24, 24),
      goldenCoreMat
    );
    coreSphere.position.set(0, 10, 0);
    this.complexGroup.add(coreSphere);

    for (let r of [32, 52]) {
      const corona = new THREE.Mesh(
        new THREE.RingGeometry(24, r, 24),
        goldenCoronaMat
      );
      corona.position.set(0, 10, 0);
      corona.rotation.y = Math.PI / 4;
      this.complexGroup.add(corona);
    }

    const orbitRing = new THREE.Mesh(
      new THREE.TorusGeometry(135, 3.0, 12, 48),
      new THREE.MeshStandardMaterial({
        color: 0x1E293B,
        roughness: 0.3,
        metalness: 0.9
      })
    );
    orbitRing.rotation.x = Math.PI / 2;
    orbitRing.position.y = 45;
    this.complexGroup.add(orbitRing);

    for (let i = 1; i <= 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(95 - i * 25, 1.2, 6, 24),
        cyanTrenchMat
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 50 - i * 30;
      this.complexGroup.add(ring);
    }

    this.scene.add(this.complexGroup);
  }

  buildDynamicDesertScenery() {
    const sandMat = new THREE.MeshStandardMaterial({
      color: CONFIG.COLORS.SAND_GROUND,
      roughness: 0.92,
      metalness: 0.05
    });

    const stoneMat = new THREE.MeshStandardMaterial({
      color: CONFIG.COLORS.ANCIENT_STONE,
      roughness: 0.85,
      metalness: 0.1
    });

    const numDunes = 24;
    for (let i = 0; i < numDunes; i++) {
      const side = (i % 2 === 0) ? 1 : -1;
      const zPos = (i * 32) - 40;

      const cluster = new THREE.Group();

      const duneMesh = new THREE.Mesh(
        new THREE.SphereGeometry(22, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2),
        sandMat
      );
      duneMesh.scale.set(1.2, 0.42, 1.4);
      duneMesh.position.set(0, -3.2, 0);
      duneMesh.receiveShadow = true;
      cluster.add(duneMesh);

      if (i % 3 === 0) {
        const spire = new THREE.Mesh(
          new THREE.CylinderGeometry(1.4, 3.2, 26, 6),
          stoneMat
        );
        spire.position.set(side * 4, 10, 0);
        cluster.add(spire);

        const dome = new THREE.Mesh(
          new THREE.SphereGeometry(2.4, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2),
          stoneMat
        );
        dome.position.set(spire.position.x, 23, 0);
        cluster.add(dome);
      }

      cluster.position.set(side * (44 + (i % 4) * 4), 0, zPos);
      this.scene.add(cluster);
      this.sceneryNodes.push(cluster);
    }
  }

  buildSparklingSandParticles() {
    const count = 180; // Optimized lightweight particle count
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    this.particleVelocities = [];

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      positions[idx] = (Math.random() - 0.5) * 50;
      positions[idx + 1] = Math.random() * 16;
      positions[idx + 2] = Math.random() * 220 - 30;

      this.particleVelocities.push({
        x: (Math.random() - 0.5) * 0.3,
        z: -0.8
      });
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xFFFBEB,
      size: 0.18,
      transparent: true,
      opacity: 0.7,
      fog: true
    });

    this.sandParticles = new THREE.Points(geometry, material);
    this.scene.add(this.sandParticles);
  }

  update(time, playerZ) {
    if (this.complexGroup) {
      this.complexGroup.position.z = playerZ + 380;
    }

    if (this.sunGroup) {
      this.sunGroup.position.z = playerZ;
    }

    if (this.skyDome) {
      this.skyDome.position.z = playerZ;
    }

    if (this.groundFloor) {
      this.groundFloor.position.z = playerZ;
    }

    if (this.sunLight && this.sunTarget) {
      this.sunLight.position.set(35, 75, playerZ - 40);
      this.sunTarget.position.set(0, 0, playerZ + 20);
      this.sunTarget.updateMatrixWorld();
    }

    const totalSpan = this.sceneryNodes.length * 32;
    for (const node of this.sceneryNodes) {
      if (node.position.z < playerZ - 60) {
        node.position.z += totalSpan;
      }
    }

    if (this.sandParticles) {
      const positions = this.sandParticles.geometry.attributes.position.array;
      for (let i = 0; i < this.particleVelocities.length; i++) {
        const idx = i * 3;
        if (positions[idx + 2] < playerZ - 15) {
          positions[idx + 2] = playerZ + 200 + Math.random() * 20;
          positions[idx] = (Math.random() - 0.5) * 50;
        }
      }
      this.sandParticles.geometry.attributes.position.needsUpdate = true;
    }
  }
}
