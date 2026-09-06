/**
 * PRABHAS: KASI 2898 AD (3D Runner - AAA Next-Gen)
 * High-Precision 3D Collision Detection, Ramp Climbing & Rooftop Physics
 */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

// OPTIMIZATION: Object Pooling to eliminate Garbage Collection micro-stutters and battery drain
const _pCenter = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _itemOffset = new THREE.Vector3();

export class CollisionManager3D {
  /**
   * Check 3D collision & vertical ramp/rooftop elevation with active obstacles
   */
  static checkObstacleCollisions(player, obstacles) {
    if (player.hasJetpack) {
      player.groundElevation = 0;
      return null;
    }

    const pBounds = player.getBounds();
    let targetGroundY = 0;

    for (let i = 0; i < obstacles.length; i++) {
      const obs = obstacles[i];
      const oPos = obs.worldPos;
      const type = obs.type;
      const mesh = obs.mesh;
      const hasRamp = !!(mesh && mesh.userData && mesh.userData.hasRamp);

      if (type === "train") {
        const trainHalfW = 1.35;
        const trainLength = 22.0;
        const trainHalfD = trainLength / 2;
        const trainTopY = 4.15;

        const trainMinX = oPos.x - trainHalfW;
        const trainMaxX = oPos.x + trainHalfW;
        const trainMinZ = oPos.z - trainHalfD;
        const trainMaxZ = oPos.z + trainHalfD + 1.8;

        const overlapX = pBounds.maxX > trainMinX && pBounds.minX < trainMaxX;

        if (overlapX) {
          if (hasRamp) {
            const rampLength = 9.0;
            const rampZStart = trainMinZ - rampLength;
            const rampZEnd = trainMinZ;

            if (pBounds.centerZ >= rampZStart && pBounds.centerZ <= rampZEnd) {
              const climbProgress = Math.max(0, Math.min(1.0, (pBounds.centerZ - rampZStart) / rampLength));
              const rampElevation = climbProgress * trainTopY;
              targetGroundY = Math.max(targetGroundY, rampElevation);
              continue;
            }
          }

          if (pBounds.centerZ >= trainMinZ && pBounds.centerZ <= trainMaxZ) {
            if (pBounds.minY >= trainTopY - 0.6) {
              targetGroundY = Math.max(targetGroundY, trainTopY);
              continue;
            } else if (player.invulnerableTimer > 0) {
              // During invulnerability: safely ride the train roof rather than clipping through inside
              targetGroundY = Math.max(targetGroundY, trainTopY);
              if (player.position.y < trainTopY) {
                player.position.y = trainTopY;
                player.isGrounded = true;
              }
              continue;
            } else {
              return {
                type: "collision",
                obstacle: obs
              };
            }
          }
        }
      } else if (type === "laser_gate") {
        if (player.invulnerableTimer > 0) {
          continue; // Glitch safely through during invulnerability window
        }

        const gateHalfW = 1.6;
        const gateMinX = oPos.x - gateHalfW;
        const gateMaxX = oPos.x + gateHalfW;
        const gateMinZ = oPos.z - 0.6;
        const gateMaxZ = oPos.z + 0.6;

        const overlapX = pBounds.maxX > gateMinX && pBounds.minX < gateMaxX;
        const overlapZ = pBounds.maxZ > gateMinZ && pBounds.minZ < gateMaxZ;

        if (overlapX && overlapZ) {
          if (player.state !== "sliding") {
            return {
              type: "collision",
              obstacle: obs,
              reason: "must_slide"
            };
          }
        }
      } else if (type === "hurdle") {
        if (player.invulnerableTimer > 0) {
          continue; // Glitch safely through during invulnerability window
        }

        const hurdleHalfW = 1.25;
        const hurdleMinX = oPos.x - hurdleHalfW;
        const hurdleMaxX = oPos.x + hurdleHalfW;
        const hurdleMinZ = oPos.z - 0.5;
        const hurdleMaxZ = oPos.z + 0.5;
        const hurdleHeight = 0.95;

        const overlapX = pBounds.maxX > hurdleMinX && pBounds.minX < hurdleMaxX;
        const overlapZ = pBounds.maxZ > hurdleMinZ && pBounds.minZ < hurdleMaxZ;

        if (overlapX && overlapZ) {
          if (pBounds.minY < hurdleHeight) {
            return {
              type: "collision",
              obstacle: obs,
              reason: "must_jump"
            };
          }
        }
      }
    }

    player.groundElevation = targetGroundY;

    if (player.position.y > player.groundElevation + 0.15) {
      player.isGrounded = false;
    }

    return null;
  }

  /**
   * Check 3D collision / pickup with active collectibles
   */
  static checkCollectiblePickups(player, collectibles, dt) {
    _pCenter.set(player.position.x, player.position.y + 0.9, player.position.z);
    const magnetRadius = player.hasMagnet ? 28.0 : 0;
    const collectedItems = [];

    for (let i = 0; i < collectibles.length; i++) {
      const item = collectibles[i];
      if (item.itemRef.userData.collected || !item.itemRef.visible) continue;

      const itemPos = item.worldPos;
      const dist = _pCenter.distanceTo(itemPos);

      // 1. Magnetic Attraction Pull
      if (player.hasMagnet && dist < magnetRadius) {
        _dir.subVectors(_pCenter, itemPos).normalize();
        item.itemRef.position.addScaledVector(_dir, 42.0 * dt);
        
        _itemOffset.set(0, 0, item.chunkRoot.position.z);
        itemPos.copy(item.itemRef.position).add(_itemOffset);
      }

      // 2. Pickup Collision Check
      const pickupRadius = (item.radius || 0.65) + 0.9;
      if (dist < pickupRadius) {
        item.itemRef.userData.collected = true;
        item.itemRef.visible = false;
        collectedItems.push(item);
      }
    }

    return collectedItems;
  }
}
