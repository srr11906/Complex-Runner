/**
 * COMPLEX RUNNER - Next-Gen 3D Sci-Fi Runner
 * High-Performance 3D GLB Asset Preloader & Cloner
 * Handles game-ready assets from 3DAssets.dev with auto-bounding, caching & material optimization
 */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export const ASSET_MANIFEST = {};

class AssetLoader3D {
  constructor() {
    this.cache = new Map();
    this.meta = new Map();
    this.isLoaded = false;
    this.loadProgress = 0;
  }

  /**
   * Preload 3D assets (Instant resolution for procedural engine)
   */
  async preloadAll(onProgress = null) {
    this.isLoaded = true;
    this.loadProgress = 1.0;
    if (onProgress) onProgress(1, 1, "PROCEDURAL_PIPELINE");
    return Promise.resolve();
  }

  /**
   * Check if an asset is cached
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Get an instanced clone of a model, centered at bottom-center (y = 0)
   * Solves coordinate scaling and centering cleanly with a two-level pivot
   */
  createInstance(key, options = {}) {
    if (!this.cache.has(key)) return null;

    const source = this.cache.get(key);
    const meta = this.meta.get(key);
    const clone = source.clone(true);

    const wrapper = new THREE.Group();
    wrapper.name = `Instance_${key}`;

    const pivot = new THREE.Group();
    pivot.name = `Pivot_${key}`;

    // 1. Center raw clone inside pivot so its origin (0,0,0) sits at bottom-center
    clone.position.set(-meta.center.x, -meta.bbox.min.y, -meta.center.z);
    pivot.add(clone);

    // 2. Compute proper scaling
    let scaleX = options.scale || 1.0;
    let scaleY = options.scale || 1.0;
    let scaleZ = options.scale || 1.0;

    if (options.nonUniform) {
      if (options.targetWidth && meta.size.x > 0) scaleX = options.targetWidth / meta.size.x;
      if (options.targetHeight && meta.size.y > 0) scaleY = options.targetHeight / meta.size.y;
      if (options.targetLength && meta.size.z > 0) scaleZ = options.targetLength / meta.size.z;
    } else {
      // Aspect-ratio preserved fitting
      const scaleCandidates = [];
      if (options.targetHeight && meta.size.y > 0) {
        scaleCandidates.push(options.targetHeight / meta.size.y);
      }
      if (options.targetWidth && meta.size.x > 0) {
        scaleCandidates.push(options.targetWidth / meta.size.x);
      }
      if (options.targetLength && meta.size.z > 0) {
        scaleCandidates.push(options.targetLength / meta.size.z);
      }
      if (options.maxHeight && meta.size.y > 0) {
        scaleCandidates.push(options.maxHeight / meta.size.y);
      }
      if (options.maxWidth && meta.size.x > 0) {
        scaleCandidates.push(options.maxWidth / meta.size.x);
      }
      if (options.maxLength && meta.size.z > 0) {
        scaleCandidates.push(options.maxLength / meta.size.z);
      }

      if (scaleCandidates.length > 0) {
        const uniformScale = Math.min(...scaleCandidates);
        scaleX = uniformScale;
        scaleY = uniformScale;
        scaleZ = uniformScale;
      }
    }

    // Optional lane width clamping (lane is 3.0m wide; max in-lane width is 2.65m)
    if (options.clampLaneWidth) {
      const currentWidth = meta.size.x * scaleX;
      if (currentWidth > 2.65) {
        const factor = 2.65 / currentWidth;
        scaleX *= factor;
        scaleY *= factor;
        scaleZ *= factor;
      }
    }

    pivot.scale.set(scaleX, scaleY, scaleZ);

    // 3. Rotation around centered vertical axis
    if (options.rotationY) {
      pivot.rotation.y = options.rotationY;
    }

    wrapper.add(pivot);
    wrapper.userData.originalSize = meta.size;
    wrapper.userData.scaledSize = new THREE.Vector3(
      meta.size.x * scaleX,
      meta.size.y * scaleY,
      meta.size.z * scaleZ
    );

    return wrapper;
  }
}

export const assetLoader = new AssetLoader3D();
