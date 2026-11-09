/**
 * COMPLEX RUNNER - Next-Gen 3D Sci-Fi Runner
 * High-Precision 3D Collision Detection, Ramp Climbing & Rooftop Physics
 */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

// OPTIMIZATION: Object & Array Pooling to eliminate Garbage Collection micro-stutters and battery drain
const _pCenter = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _itemOffset = new THREE.Vector3();
const _collectedPool = [];
const _candidatesPool = [];
const _hitResultPool = [];
const _harpoonDestroyedPool = [];
const _robotArrayPool = [];
const _emptyList = Object.freeze([]);

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
        const trainLength = (mesh && mesh.userData && mesh.userData.trainLength) ? mesh.userData.trainLength : 22.0;
        const trainHalfD = trainLength / 2;
        const trainTopY = 4.15;

        const trainMinX = oPos.x - trainHalfW;
        const trainMaxX = oPos.x + trainHalfW;
        const trainMinZ = oPos.z - trainHalfD;
        const trainMaxZ = oPos.z + trainHalfD;

        const overlapX = pBounds.maxX > trainMinX && pBounds.minX < trainMaxX;

        if (overlapX) {
          if (hasRamp) {
            const rampLength = 9.0;
            const rampZStart = trainMinZ - rampLength;
            const rampZEnd = trainMinZ;

            if (pBounds.maxZ >= rampZStart && pBounds.minZ <= rampZEnd) {
              const climbProgress = Math.max(0, Math.min(1.0, (pBounds.centerZ - rampZStart) / rampLength));
              const rampElevation = climbProgress * trainTopY;
              targetGroundY = Math.max(targetGroundY, rampElevation);
              continue;
            }
          }

          // High-Precision AABB Box Overlap in longitudinal Z axis
          const overlapZ = pBounds.maxZ >= trainMinZ && pBounds.minZ <= trainMaxZ;
          if (overlapZ) {
            if (pBounds.minY >= trainTopY - 0.45) {
              // Player is running or landing on the train rooftop deck
              targetGroundY = Math.max(targetGroundY, trainTopY);
              continue;
            } else if (player.invulnerableTimer > 0) {
              // During invulnerability window: safely ride train roof
              targetGroundY = Math.max(targetGroundY, trainTopY);
              if (player.position.y < trainTopY) {
                player.position.y = trainTopY;
                player.isGrounded = true;
              }
              continue;
            } else {
              // Solid body collision (Moving train or front face of static train)
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

        const gateHalfW = 1.50;
        const gateMinX = oPos.x - gateHalfW;
        const gateMaxX = oPos.x + gateHalfW;
        const gateMinZ = oPos.z - 0.40;
        const gateMaxZ = oPos.z + 0.40;

        const overlapX = pBounds.maxX > gateMinX && pBounds.minX < gateMaxX;
        const overlapZ = pBounds.maxZ > gateMinZ && pBounds.minZ < gateMaxZ;

        if (overlapX && overlapZ) {
          // If jumping high above the gate structure (> 3.4m, e.g. off train roof or high jump)
          if (pBounds.minY >= 3.4) {
            continue;
          }
          // Slide clearance allows ducking under 1.25m opening
          if (pBounds.isSliding || pBounds.maxY <= 1.25) {
            if (!obs._clearedSlide) {
              obs._clearedSlide = true;
              return {
                type: "slide_cleared",
                obstacle: obs
              };
            }
            continue;
          }
          return {
            type: "collision",
            obstacle: obs,
            reason: "must_slide"
          };
        }
      } else if (type === "bounty_target" || type === "rival_hunter") {
        const targetHalfW = 1.8;
        const targetMinX = oPos.x - targetHalfW;
        const targetMaxX = oPos.x + targetHalfW;
        const targetMinZ = oPos.z - 3.2;
        const targetMaxZ = oPos.z + 3.2;

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
        const crateHalfW = 1.8;
        const crateMinX = oPos.x - crateHalfW;
        const crateMaxX = oPos.x + crateHalfW;
        const crateMinZ = oPos.z - 3.0;
        const crateMaxZ = oPos.z + 3.0;

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
        if (dist < (obs.radius || 5.2)) {
          return {
            type: "extraction_triggered",
            beacon: obs,
            rewardUnits: obs.rewardUnits || 15000
          };
        }
      } else if (type === "hurdle") {
        if (player.invulnerableTimer > 0) {
          continue; // Glitch safely through during invulnerability window
        }

        const hurdleHalfW = 1.34;
        const hurdleMinX = oPos.x - hurdleHalfW;
        const hurdleMaxX = oPos.x + hurdleHalfW;
        const hurdleMinZ = oPos.z - 0.45;
        const hurdleMaxZ = oPos.z + 0.45;
        const hurdleHeight = (obs.mesh && obs.mesh.userData && obs.mesh.userData.height) || 1.85;

        const overlapX = pBounds.maxX > hurdleMinX && pBounds.minX < hurdleMaxX;
        const overlapZ = pBounds.maxZ > hurdleMinZ && pBounds.minZ < hurdleMaxZ;

        if (overlapX && overlapZ) {
          if (pBounds.minY < hurdleHeight) {
            return {
              type: "collision",
              obstacle: obs,
              reason: "must_jump"
            };
          } else {
            if (!obs._clearedJump) {
              obs._clearedJump = true;
              return {
                type: "jump_cleared",
                obstacle: obs
              };
            }
          }
        }
      } else if (type === "blocker") {
        if (player.invulnerableTimer > 0) {
          continue;
        }

        // Precise single-lane clearance (width: 2.5m, pitch: 2.8m - zero side-lane clipping)
        const blockerHalfW = 1.25;
        const blockerMinX = oPos.x - blockerHalfW;
        const blockerMaxX = oPos.x + blockerHalfW;
        const blockerMinZ = oPos.z - 0.45;
        const blockerMaxZ = oPos.z + 0.45;

        const overlapX = pBounds.maxX > blockerMinX && pBounds.minX < blockerMaxX;
        const overlapZ = pBounds.maxZ > blockerMinZ && pBounds.minZ < blockerMaxZ;

        if (overlapX && overlapZ) {
          return {
            type: "collision",
            obstacle: obs,
            reason: "must_dodge_lane"
          };
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
   * Stops at the closest hit obstacle and deals damage to it
   */
  static checkLaserCollisions(laserData, obstacles, monsterRobot = null) {
    if (!laserData || !laserData.shot) return _emptyList;
    _candidatesPool.length = 0;
    const laneX = laserData.laneX;
    const startZ = laserData.playerZ;
    const maxRange = laserData.range || 38.0;

    // Check Monster Robots (supports single instance or multiple active robots)
    _robotArrayPool.length = 0;
    const robotList = Array.isArray(monsterRobot) ? monsterRobot : (monsterRobot ? (_robotArrayPool.push(monsterRobot), _robotArrayPool) : _robotArrayPool);
    for (let r = 0; r < robotList.length; r++) {
      const bot = robotList[r];
      if (bot && bot.active && !bot.isGlitching) {
        const isRobotLane = Math.abs(bot.position.x - laneX) < 1.6;
        if (isRobotLane) {
          const distFromPlayer = bot.position.z - startZ;
          if (distFromPlayer >= 0.0 && distFromPlayer <= maxRange) {
            _candidatesPool.push({
              type: "laser_monster_robot_hit",
              robot: bot,
              distance: Math.max(0.5, distFromPlayer),
              targetName: "Apex Harvester"
            });
          }
        }
      }
    }

    for (let i = 0; i < obstacles.length; i++) {
      const obs = obstacles[i];
      if (!obs || obs.destroyed || !obs.mesh || !obs.mesh.visible) continue;
      const oPos = obs.worldPos;

      const isSameLane = Math.abs(oPos.x - laneX) < 1.6;
      if (!isSameLane) continue;

      const obsHalfDepth = obs.type === "train" ? 11.0 : (obs.type === "laser_gate" ? 0.6 : (obs.type === "blocker" ? 0.7 : 0.4));
      const obsFrontZ = oPos.z - obsHalfDepth;
      const distFromPlayer = obsFrontZ - startZ;

      if (distFromPlayer >= 0.0 && distFromPlayer <= maxRange) {
        let hitType = "laser_destructible_hit";
        if (obs.type === "bounty_target" || obs.type === "rival_hunter") {
          hitType = "laser_bounty_capture";
        } else if (obs.type === "bounty_crate") {
          hitType = "laser_crate_breached";
        }

        _candidatesPool.push({
          type: hitType,
          obstacle: obs,
          distance: Math.max(0.5, distFromPlayer),
          rewardUnits: obs.rewardUnits || (obs.type === "bounty_crate" ? 10000 : 5000),
          targetName: obs.targetName || "Target"
        });
      }
    }

    if (_candidatesPool.length === 0) return _emptyList;

    // Sort by distance so closest obstacle is hit first
    _candidatesPool.sort((a, b) => a.distance - b.distance);

    // Return the closest hit entity that absorbs the laser beam (reusing pool)
    _hitResultPool[0] = _candidatesPool[0];
    _hitResultPool.length = 1;
    return _hitResultPool;
  }

  /**
   * Check Bujji EMP Harpoon automatic obstacle locks
   */
  static checkHarpoonLocks(player, obstacles) {
    if (!player.hasHarpoon) return _emptyList;
    _harpoonDestroyedPool.length = 0;
    const pZ = player.position.z;

    for (let i = 0; i < obstacles.length; i++) {
      const obs = obstacles[i];
      if (!obs.mesh || !obs.mesh.visible) continue;
      const oPos = obs.worldPos;

      if (oPos.z > pZ && oPos.z < pZ + 35.0) {
        if (obs.type === "bounty_target" || obs.type === "rival_hunter") {
          _harpoonDestroyedPool.push({ type: "harpoon_bounty_capture", obstacle: obs, rewardUnits: obs.rewardUnits || 5000, targetName: obs.targetName || "Target" });
        } else if (obs.type === "bounty_crate") {
          _harpoonDestroyedPool.push({ type: "harpoon_crate_breached", obstacle: obs, rewardUnits: obs.rewardUnits || 10000 });
        } else if (obs.type === "hurdle" || obs.type === "laser_gate") {
          _harpoonDestroyedPool.push({ type: "harpoon_obstacle_destroyed", obstacle: obs });
        }
      }
    }
    return _harpoonDestroyedPool;
  }

  /**
   * Check 3D collision / pickup with active collectibles (Zero-allocation per frame)
   */
  static checkCollectiblePickups(player, collectibles, dt) {
    _pCenter.set(player.position.x, player.position.y + 0.9, player.position.z);
    const magnetRadius = player.hasMagnet ? 28.0 : 0;
    _collectedPool.length = 0;

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
        _collectedPool.push(item);
      }
    }

    return _collectedPool;
  }
}
