/**
 * COMPLEX RUNNER - Next-Gen 3D Sci-Fi Runner
 * Core Configuration, Daytime Lighting & Physics Constants
 */

export const CONFIG = {
  // Goal: 1 Million Units to Unlock the Complex!
  TARGET_UNITS: 1000000,
  UNITS_PER_COIN: 1000, // 1,000 Units per token

  // World Metrics (Extended 420m Track View Distance - Optimized for 60 FPS)
  LANES: [-3.0, 0.0, 3.0],
  LANE_WIDTH: 3.0,
  CHUNK_LENGTH: 60.0,
  ACTIVE_CHUNKS: 7, // 7 Chunks = 420m view horizon (High performance 60 FPS)
  GROUND_Y: 0.0,

  // Speed & Progression (15% Speed Boost for Intense Reflex Gameplay)
  INITIAL_SPEED: 21.5, // m/s (~77 km/h)
  MAX_SPEED: 45.0,     // m/s (~162 km/h)
  SPEED_ACCELERATION: 0.008,

  // Kinematic Jump & Slide Physics (Subway Surfers Mathematical Model)
  GRAVITY: -44.0,           // m/s^2
  JUMP_VELOCITY: 15.6,      // m/s (gives ~2.76m peak height)
  FAST_FALL_VELOCITY: -38.0,// m/s (instant dive down)
  LANE_CHANGE_TIME: 0.16,   // seconds (smooth critically damped switch)
  SLIDE_DURATION: 0.65,     // seconds

  // Hitbox Dimensions
  PLAYER_NORMAL_HEIGHT: 1.85,
  PLAYER_SLIDE_HEIGHT: 0.65,
  PLAYER_WIDTH: 0.9,
  PLAYER_DEPTH: 0.7,

  // Power-Up Armory Upgrade Progression (6 Tiers: Base 8s -> +2s -> +3s -> +4s -> +5s -> +8s)
  UPGRADE_TIERS: {
    DURATIONS: [8.0, 10.0, 13.0, 17.0, 22.0, 30.0],
    COSTS: [0, 15000, 35000, 75000, 150000, 300000],
    MAX_LEVEL: 6
  },

  // Monster Robot Progression Settings (Apex at 250k, Mini at 100k)
  MONSTER_ROBOT: {
    APEX_INTERVAL: 250000,      // Apex boss every 250k
    MINI_INTERVAL: 100000,      // Mini titan every 100k
    APEX_HITS: 25,              // 25 laser hits
    MINI_HITS: 10,              // 10 laser hits
    APEX_SCALE: 1.5,            // 1.5x scale
    MINI_SCALE: 1.0,            // 1.0x scale
    APEX_BOUNTY: 25000,         // +25,000 Units (Balanced)
    MINI_BOUNTY: 10000,         // +10,000 Units (Balanced)
    APEX_COINS_DROP: 2,         // 2 coins per hit
    MINI_COINS_DROP: 1,         // 1 coin per hit
    HEIST_MAX_SPAWN_SCORE: 900000, // No monster spawns after 900k in Heist mode
    AHEAD_DISTANCE: 38.0,       // Spawns 38m ahead (within 55m laser range)
    TARGET_LEAD_MIN: 30.0,      // Lead distance window minimum
    TARGET_LEAD_MAX: 42.0,      // Lead distance window maximum
    COIN_MAGNET_RADIUS: 12.0,   // Strong vacuum magnet radius for Apex
    COIN_EAT_RADIUS: 3.2        // Ingestion intake core radius
  },

  // Bujji Companion Offset (Left Shoulder Side)
  BUJJI_OFFSET_X: -0.72,
  BUJJI_OFFSET_Y: 1.35,
  BUJJI_OFFSET_Z: -0.35,

  // Power-Up Parameters (Rare & Rewarding Spawn Rate)
  POWERUP_SPAWN_CHANCE: 0.16,
  JETPACK_ALTITUDE: 8.0,
  SHIELD_BASE_DURATION: 8.0,
  JETPACK_BASE_DURATION: 8.0,
  MAGNET_BASE_DURATION: 8.0,
  DOUBLE_POINTS_BASE_DURATION: 8.0,
  MAGNET_RADIUS: 25.0,

  // Rich Dark Brown Desert & Cinematic Golden Amber Palette
  COLORS: {
    SKY_TOP: 0x2E1D11,        // Dark Amber-Bronze Desert Sky
    SKY_HORIZON: 0xB4681E,    // Warm Golden Desert Horizon
    SUN_LIGHT: 0xFFFBEB,      // Radiant Sunlight
    HEMI_SKY: 0x7A481E,       // Warm Amber Atmosphere Bounce
    HEMI_GROUND: 0x3D230F,    // Dark Brown Sand Ground Bounce
    FOG: 0x4D3017,            // Rich Dark Brown Desert Dust Haze
    SAND_GROUND: 0x4A2E16,    // Rich Dark Amber-Brown Desert Wasteland
    ROAD_SURFACE: 0x2E241B,   // Weathered Dark Asphalt
    ROAD_TRIM: 0xD97706,      // Luminous Amber Trim
    COMPLEX_WHITE: 0x1E293B,  // Monolithic Complex Alloy
    COMPLEX_GLOW: 0xFDE047,   // Radiant Golden Power Conduits
    COMPLEX_GOLD: 0xF59E0B,   // Royal Gold Complex Trim
    BUJJI_YELLOW: 0xFBBF24,   // Bujji Golden Pearl Chassis
    BUJJI_CYAN: 0x06B6D4,     // Bujji Cyan Holographic Optic
    DARK_CARBON: 0x1E293B,    // Carbon Fiber Composite
    RUST_BRONZE: 0x854D0E,    // Weathered Ancient Bronze
    ANCIENT_STONE: 0xA89B8C,  // Weathered Ghat Stone
    NEON_CYAN: 0x00E5FF,
    NEON_GOLD: 0xFDE047,
    NEON_RED: 0xEF4444
  }
};
