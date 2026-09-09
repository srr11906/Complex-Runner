/**
 * PRABHAS: KASI 2898 AD (3D Runner - Bounty Hunter System)
 * Bounty Manager: Live Contracts, Hunter Ranks, Streak Multipliers & Boss Showdown
 */

export class BountyManager {
  constructor(callbacks = {}) {
    this.callbacks = {
      onBountyCaptured: callbacks.onBountyCaptured || (() => {}),
      onContractComplete: callbacks.onContractComplete || (() => {}),
      onBossSpawn: callbacks.onBossSpawn || (() => {}),
      onBossDefeated: callbacks.onBossDefeated || (() => {}),
      onStreakChange: callbacks.onStreakChange || (() => {})
    };

    this.lifetimeBountyUnits = parseInt(localStorage.getItem("prabhas_lifetime_bounties") || "0", 10);
    this.streakCount = 0;
    this.streakMultiplier = 1.0;

    // Mini-Boss Showdown State
    this.activeBoss = null;
    this.bossTimer = 0;
    this.bossMilestonesHit = { 250000: false, 500000: false };

    // Contracts
    this.contracts = this.loadContracts();
  }

  loadContracts() {
    const saved = localStorage.getItem("prabhas_bounty_contracts");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse contracts", e);
      }
    }
    return this.generateNewContracts();
  }

  saveContracts() {
    localStorage.setItem("prabhas_bounty_contracts", JSON.stringify(this.contracts));
    localStorage.setItem("prabhas_lifetime_bounties", this.lifetimeBountyUnits.toString());
  }

  generateNewContracts() {
    const contractPool = [
      { id: "c_laser_1", title: "Gauntlet Sniper", desc: "Blast 3 obstacles with Gauntlet Laser", target: 3, current: 0, reward: 5000, type: "shoot_laser" },
      { id: "c_scav_1", title: "Kasi Cleanup", desc: "Capture 1 Scavenger Raider", target: 1, current: 0, reward: 5000, type: "capture_scavenger" },
      { id: "c_crate_1", title: "Crate Breacher", desc: "Breach 2 Bounty Stash Crates", target: 2, current: 0, reward: 10000, type: "break_crate" },
      { id: "c_smug_1", title: "Speeder Intercept", desc: "Capture 1 Smuggler Speeder", target: 1, current: 0, reward: 10000, type: "capture_smuggler" },
      { id: "c_droid_1", title: "Droid Eliminator", desc: "Capture 2 Rogue Surveillance Droids", target: 2, current: 0, reward: 25000, type: "capture_droid" },
      { id: "c_streak_1", title: "Hunter Renown", desc: "Reach a 3x Bounty Capture Streak", target: 3, current: 0, reward: 25000, type: "reach_streak" }
    ];

    // Pick 1 Easy (5k), 1 Medium (10k), 1 Hard (25k)
    const easy = contractPool.filter(c => c.reward === 5000)[Math.floor(Math.random() * 2)];
    const med = contractPool.filter(c => c.reward === 10000)[Math.floor(Math.random() * 2)];
    const hard = contractPool.filter(c => c.reward === 25000)[Math.floor(Math.random() * 2)];

    return [easy, med, hard];
  }

  resetRun() {
    this.streakCount = 0;
    this.streakMultiplier = 1.0;
    this.activeBoss = null;
    this.bossTimer = 0;
    this.bossMilestonesHit = { 250000: false, 500000: false };
    this.callbacks.onStreakChange(this.streakCount, this.streakMultiplier);
  }

  recordTakedown(targetType, baseReward, targetName = "Target") {
    this.streakCount++;
    if (this.streakCount >= 4) this.streakMultiplier = 2.0;
    else if (this.streakCount === 3) this.streakMultiplier = 1.5;
    else if (this.streakCount === 2) this.streakMultiplier = 1.2;
    else this.streakMultiplier = 1.0;

    const finalUnits = Math.round(baseReward * this.streakMultiplier);
    this.lifetimeBountyUnits += finalUnits;
    this.saveContracts();

    this.callbacks.onStreakChange(this.streakCount, this.streakMultiplier);
    this.callbacks.onBountyCaptured({ targetName, targetType, baseReward, finalUnits, multiplier: this.streakMultiplier });

    // Check Contract Progress
    if (targetType === "scavenger" || targetType === "bounty_target_1") this.progressContract("capture_scavenger", 1);
    if (targetType === "smuggler" || targetType === "bounty_target_2") this.progressContract("capture_smuggler", 1);
    if (targetType === "droid" || targetType === "bounty_target_3") this.progressContract("capture_droid", 1);
    if (targetType === "crate") this.progressContract("break_crate", 1);
    this.progressContract("reach_streak", this.streakCount, true);

    return finalUnits;
  }

  recordLaserShot() {
    this.progressContract("shoot_laser", 1);
  }

  breakStreak() {
    if (this.streakCount > 0) {
      this.streakCount = 0;
      this.streakMultiplier = 1.0;
      this.callbacks.onStreakChange(this.streakCount, this.streakMultiplier);
    }
  }

  progressContract(type, amount = 1, isAbsolute = false) {
    for (let c of this.contracts) {
      if (c.type === type && !c.completed) {
        if (isAbsolute) {
          c.current = Math.max(c.current, amount);
        } else {
          c.current += amount;
        }

        if (c.current >= c.target) {
          c.current = c.target;
          c.completed = true;
          this.lifetimeBountyUnits += c.reward;
          this.callbacks.onContractComplete(c, c.reward);
        }
        this.saveContracts();
      }
    }
  }

  claimAllCompleted() {
    let replaced = false;
    for (let i = 0; i < this.contracts.length; i++) {
      if (this.contracts[i].completed) {
        const pool = this.generateNewContracts();
        this.contracts[i] = pool[i] || pool[0];
        replaced = true;
      }
    }
    if (replaced) this.saveContracts();
  }

  getHunterRank() {
    const units = this.lifetimeBountyUnits;
    if (units >= 500000) return { title: "Legendary Complex Raider", rank: 4, badge: "🏆 MASTER", icon: "👑" };
    if (units >= 200000) return { title: "Elite Bounty Hunter", rank: 3, badge: "⚡ ELITE", icon: "🎯" };
    if (units >= 50000) return { title: "Outlaw Tracker", rank: 2, badge: "🔥 TRACKER", icon: "🗡️" };
    return { title: "Kasi Scavenger", rank: 1, badge: "🌱 NOVICE", icon: "🏜️" };
  }
}
