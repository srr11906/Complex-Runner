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
      if (!obs || obs.destroyed || !obs.mesh || !obs.mesh.visible || (obs.mesh.userData && obs.mesh.userData.destroyed)) {
        continue;
      }
      const oPos = obs.worldPos;
      const type = obs.type;
      const mesh = obs.mesh;
      const hasRamp = !!(mesh && mesh.userData && mesh.userData.hasRamp);
      const isMoving = !!(mesh && mesh.userData && mesh.userData.isMoving);

      if (type === "train") {
        const trainHalfW = 1.35;
        const trainLength = 22.0;
        const trainHalfD = trainLength / 2;
        const trainTopY = 4.15;

        const trainMinX = oPos.x - trainHalfW;
        const trainMaxX = oPos.x + trainHalfW;
        const trainMinZ = isMoving ? (oPos.z - trainHalfD - 1.8) : (oPos.z - trainHalfD);
        const trainMaxZ = isMoving ? (oPos.z + trainHalfD) : (oPos.z + trainHalfD + 1.8);

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
      } else if (type === "bounty_target" || type === "rival_hunter") {
        const targetHalfW = 1.1;
        const targetMinX = oPos.x - targetHalfW;
        const targetMaxX = oPos.x + targetHalfW;
        const targetMinZ = oPos.z - 1.2;
        const targetMaxZ = oPos.z + 1.2;

        const overlapX = pBounds.maxX > targetMinX && pBounds.minX < targetMaxX;
        const overlapZ = pBounds.maxZ > targetMinZ && pBounds.minZ < targetMaxZ;

        if (overlapX && overlapZ) {
          return {
            type: "bounty_takedown",
            target: obs,
            rewardUnits: obs.rewardUnits || 5000,
            targetName: obs.targetName || "Target"
          };
        }
      } else if (type === "bounty_crate") {
        const crateHalfW = 1.0;
        const crateMinX = oPos.x - crateHalfW;
        const crateMaxX = oPos.x + crateHalfW;
        const crateMinZ = oPos.z - 0.9;
        const crateMaxZ = oPos.z + 0.9;

        const overlapX = pBounds.maxX > crateMinX && pBounds.minX < crateMaxX;
        const overlapZ = pBounds.maxZ > crateMinZ && pBounds.minZ < crateMaxZ;

        if (overlapX && overlapZ) {
          return {
            type: "crate_breached",
            crate: obs,
            rewardUnits: obs.rewardUnits || 10000
          };
        }
      } else if (type === "extraction_beacon") {
        const dist = Math.hypot(pBounds.centerX - oPos.x, pBounds.centerZ - oPos.z);
        if (dist < (obs.radius || 3.5)) {
          return {
            type: "extraction_triggered",
            beacon: obs
          };
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
        const hurdleHeight = 1.90;

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
   * Check Gauntlet Laser Beam intersection along player lane (38m range)
   */
  static checkLaserCollisions(laserData, obstacles) {
    if (!laserData || !laserData.shot) return [];
    const hitEntities = [];
    const laneX = laserData.laneX;
    const startZ = laserData.playerZ;
    const endZ = laserData.playerZ + laserData.range;

    for (let i = 0; i < obstacles.length; i++) {
      const obs = obstacles[i];
      if (!obs.mesh || !obs.mesh.visible) continue;
      const oPos = obs.worldPos;

      const isSameLane = Math.abs(oPos.x - laneX) < 1.6;
      const obsDepth = obs.type === "train" ? 12.0 : 1.5;
      const isInRange = (oPos.z + obsDepth) >= startZ && (oPos.z - obsDepth) <= endZ;

      if (isSameLane && isInRange) {
        if (obs.type === "bounty_target" || obs.type === "rival_hunter") {
          hitEntities.push({ type: "laser_bounty_capture", obstacle: obs, rewardUnits: obs.rewardUnits || 5000, targetName: obs.targetName || "Target" });
        } else if (obs.type === "bounty_crate") {
          hitEntities.push({ type: "laser_crate_breached", obstacle: obs, rewardUnits: obs.rewardUnits || 10000 });
        } else if (obs.type === "hurdle" || obs.type === "laser_gate" || obs.type === "train") {
          hitEntities.push({ type: "laser_destructible_hit", obstacle: obs });
        }
      }
    }
    return hitEntities;
  }

  /**
   * Check Bujji EMP Harpoon automatic obstacle locks
   */
  static checkHarpoonLocks(player, obstacles) {
    if (!player.hasHarpoon) return [];
    const destroyed = [];
    const pZ = player.position.z;

    for (let i = 0; i < obstacles.length; i++) {
      const obs = obstacles[i];
      if (!obs.mesh || !obs.mesh.visible) continue;
      const oPos = obs.worldPos;

      if (oPos.z > pZ && oPos.z < pZ + 35.0) {
        if (obs.type === "bounty_target" || obs.type === "rival_hunter") {
          destroyed.push({ type: "harpoon_bounty_capture", obstacle: obs, rewardUnits: obs.rewardUnits || 5000, targetName: obs.targetName || "Target" });
        } else if (obs.type === "bounty_crate") {
          destroyed.push({ type: "harpoon_crate_breached", obstacle: obs, rewardUnits: obs.rewardUnits || 10000 });
        } else if (obs.type === "hurdle" || obs.type === "laser_gate") {
          destroyed.push({ type: "harpoon_obstacle_destroyed", obstacle: obs });
        }
      }
    }
    return destroyed;
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
