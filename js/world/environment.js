/**
 * PRABHAS: WASTELAND 2898 AD (3D Runner - AAA Next-Gen)
 * Cinematic Desert Environment, Continuous Textured Terrain Floor & Monolithic Inverted Complex
 * Zero Framedrops, High Performance 60 FPS
 */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { CONFIG } from "../config.js?v=20261012_audio_atomic_v70";
import { textureGen } from "./textureGenerator.js?v=20261012_audio_atomic_v70";

export class Environment3D {
  constructor(scene) {
    this.scene = scene;
    this.complexGroup = new THREE.Group();
    this.sunGroup = new THREE.Group();
    this.skyDome = null;
    this.groundFloor = null;
    this.sunLight = null;
    this.sunTarget = null;
    this.sceneryNodes = [];
    this.initEnvironment();
  }

  initEnvironment() {
    // 1. Radiant World Background & Sunlit Atmospheric Fog
    this.scene.background = new THREE.Color(CONFIG.COLORS.SKY_TOP);
    this.scene.fog = new THREE.Fog(CONFIG.COLORS.FOG, 90, 420);

    // 2. Warm Hemispherical Desert Atmosphere Light (Clear Daylight Sky & Golden Ground Bounce)
    const hemiLight = new THREE.HemisphereLight(
      CONFIG.COLORS.HEMI_SKY,
      CONFIG.COLORS.HEMI_GROUND,
      2.0
    );
    hemiLight.position.set(0, 50, 0);
    this.scene.add(hemiLight);

    // 3. Directional Sun Light Tracking (High-Definition 1024x1024 extended-frustum shadow map)
    this.sunLight = new THREE.DirectionalLight(CONFIG.COLORS.SUN_LIGHT, 3.2);
    this.sunLight.position.set(30, 60, -25);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 1.0;
    this.sunLight.shadow.camera.far = 160.0;
    this.sunLight.shadow.camera.left = -22;
    this.sunLight.shadow.camera.right = 22;
    this.sunLight.shadow.camera.top = 22;
    this.sunLight.shadow.camera.bottom = -22;
    this.sunLight.shadow.bias = -0.0005;

    this.sunTarget = new THREE.Object3D();
    this.sunTarget.position.set(0, 0, 0);
    this.scene.add(this.sunTarget);
    this.sunLight.target = this.sunTarget;
    this.scene.add(this.sunLight);

    this.buildDaylightSkyDome();
    this.buildInfiniteDesertGroundFloor();
    this.buildMovieAccurateComplex();
  }

  buildDaylightSkyDome() {
    const skyGeo = new THREE.SphereGeometry(600, 24, 16, 0, Math.PI * 2, 0, Math.PI);
    const count = skyGeo.attributes.position.count;
    const colors = new Float32Array(count * 3);

    const topColor = new THREE.Color(CONFIG.COLORS.SKY_TOP);
    const midColor = new THREE.Color(0x92400E); // Warm sunset amber transition band
    const horizonColor = new THREE.Color(CONFIG.COLORS.SKY_HORIZON);
    const groundColor = new THREE.Color(CONFIG.COLORS.SAND_GROUND);

    for (let i = 0; i < count; i++) {
      const y = skyGeo.attributes.position.getY(i);
      let c;
      if (y > 0) {
        const ratio = Math.min(1.0, y / 600);
        if (ratio < 0.35) {
          c = new THREE.Color().copy(horizonColor).lerp(midColor, ratio / 0.35);
        } else {
          c = new THREE.Color().copy(midColor).lerp(topColor, Math.pow((ratio - 0.35) / 0.65, 0.7));
        }
      } else {
        const ratio = Math.min(1.0, -y / 600);
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

    // High-Intensity Sun Orb & Dual Anamorphic Corona Halos
    const sunDisk = new THREE.Mesh(
      new THREE.SphereGeometry(26, 18, 18),
      new THREE.MeshBasicMaterial({ color: 0xFFFDF0, fog: false })
    );
    sunDisk.position.set(130, 240, -420);
    this.sunGroup.add(sunDisk);

    // Inner Radiant Corona Ring
    const innerHaloGeo = new THREE.RingGeometry(26, 85, 24);
    const innerHaloMat = new THREE.MeshBasicMaterial({
      color: 0xF59E0B,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      fog: false
    });
    const innerHalo = new THREE.Mesh(innerHaloGeo, innerHaloMat);
    innerHalo.position.copy(sunDisk.position);
    innerHalo.lookAt(0, 0, 0);
    this.sunGroup.add(innerHalo);

    // Outer Atmospheric Scattering Flare Halo
    const outerHaloGeo = new THREE.RingGeometry(85, 175, 24);
    const outerHaloMat = new THREE.MeshBasicMaterial({
      color: 0xD97706,
      transparent: true,
      opacity: 0.20,
      side: THREE.DoubleSide,
      fog: false
    });
    const outerHalo = new THREE.Mesh(outerHaloGeo, outerHaloMat);
    outerHalo.position.copy(sunDisk.position);
    outerHalo.lookAt(0, 0, 0);
    this.sunGroup.add(outerHalo);

    this.scene.add(this.sunGroup);
  }

  buildInfiniteDesertGroundFloor() {
    const floorGeo = new THREE.PlaneGeometry(1200, 1200, 1, 1);
    const floorMat = new THREE.MeshPhongMaterial({
      color: 0xFFFFFF,
      map: textureGen.getSandTerrainTexture(),
      normalMap: textureGen.getSandTerrainNormalMap(),
      normalScale: new THREE.Vector2(0.85, 0.85),
      shininess: 4,
      specular: 0x22140A
    });

    this.groundFloor = new THREE.Mesh(floorGeo, floorMat);
    this.groundFloor.rotation.x = -Math.PI / 2;
    this.groundFloor.position.set(0, -0.7, 0);
    this.groundFloor.receiveShadow = true;
    this.scene.add(this.groundFloor);
  }

  /**
   * Reverted Movie-Accurate Complex (v1 Initial Push State)
   */
  buildMovieAccurateComplex() {
    this.complexGroup.position.set(0, 145, 380);

    const complexMat = new THREE.MeshLambertMaterial({
      map: textureGen.getComplexMonolithTexture()
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
      new THREE.MeshLambertMaterial({
        color: 0x1E293B
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

  update(time, playerZ) {
    if (this.complexGroup) {
      this.complexGroup.position.z = playerZ + 380;
      this.complexGroup.rotation.y = time * 0.035;
    }

    if (this.sunGroup) {
      this.sunGroup.position.z = playerZ;
    }

    if (this.skyDome) {
      this.skyDome.position.z = playerZ;
    }

    // Step the deep horizon floor in large increments to avoid any sliding visual artifacts
    if (this.groundFloor) {
      this.groundFloor.position.z = Math.floor(playerZ / 200) * 200;
    }

    if (this.sunLight && this.sunTarget) {
      this.sunLight.position.set(35, 75, playerZ - 40);
      this.sunTarget.position.set(0, 0, playerZ + 20);
    }
  }

  setTheme(theme = "wasteland") {
    const isComplex = theme === "complex" || theme === "complex_beta";
    if (isComplex) {
      // In Complex map: player is ALREADY inside the Complex, remove the floating triangular pyramid
      if (this.complexGroup) {
        this.complexGroup.visible = false;
      }
      // Lush, pristine utopian daylight sky and atmospheric mist
      this.scene.background = new THREE.Color(0x38BDF8);
      if (this.scene.fog) {
        this.scene.fog.color.setHex(0xBAE6FD);
        this.scene.fog.near = 110;
        this.scene.fog.far = 480;
      }
      if (this.sunLight) {
        this.sunLight.color.setHex(0xF1F5F9);
        this.sunLight.intensity = 2.9;
      }
      if (this.groundFloor && this.groundFloor.material) {
        this.groundFloor.material.map = textureGen.getComplexWaterTexture();
        this.groundFloor.material.needsUpdate = true;
      }
      this.updateSkyDomeTheme(true);
    } else {
      // Wasteland: Monolithic inverted Complex pyramid visible in sky
      if (this.complexGroup) {
        this.complexGroup.visible = true;
      }
      this.scene.background = new THREE.Color(CONFIG.COLORS.SKY_TOP);
      if (this.scene.fog) {
        this.scene.fog.color.setHex(CONFIG.COLORS.FOG);
        this.scene.fog.near = 90;
        this.scene.fog.far = 420;
      }
      if (this.sunLight) {
        this.sunLight.color.setHex(CONFIG.COLORS.SUN_LIGHT);
        this.sunLight.intensity = 3.75;
      }
      if (this.groundFloor && this.groundFloor.material) {
        this.groundFloor.material.map = textureGen.getSandTerrainTexture();
        this.groundFloor.material.needsUpdate = true;
      }
      this.updateSkyDomeTheme(false);
    }
  }

  updateSkyDomeTheme(isComplex) {
    if (!this.skyDome || !this.skyDome.geometry) return;
    const geo = this.skyDome.geometry;
    const count = geo.attributes.position.count;
    const colors = geo.attributes.color.array;

    const topColor = isComplex ? new THREE.Color(0x0284C7) : new THREE.Color(CONFIG.COLORS.SKY_TOP);
    const midColor = isComplex ? new THREE.Color(0x38BDF8) : new THREE.Color(0x92400E);
    const horizonColor = isComplex ? new THREE.Color(0xBAE6FD) : new THREE.Color(CONFIG.COLORS.SKY_HORIZON);
    const groundColor = isComplex ? new THREE.Color(0x15803D) : new THREE.Color(CONFIG.COLORS.SAND_GROUND);

    for (let i = 0; i < count; i++) {
      const y = geo.attributes.position.getY(i);
      let c;
      if (y > 0) {
        const ratio = Math.min(1.0, y / 600);
        if (ratio < 0.35) {
          c = new THREE.Color().copy(horizonColor).lerp(midColor, ratio / 0.35);
        } else {
          c = new THREE.Color().copy(midColor).lerp(topColor, Math.pow((ratio - 0.35) / 0.65, 0.7));
        }
      } else {
        const ratio = Math.min(1.0, -y / 600);
        c = new THREE.Color().copy(horizonColor).lerp(groundColor, Math.pow(ratio, 0.7));
      }
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geo.attributes.color.needsUpdate = true;
  }
}
