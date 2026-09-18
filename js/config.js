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

  // Speed & Progression (Faster Velocity & Progressive Ramp)
  INITIAL_SPEED: 23.5, // m/s (~85 km/h)
  MAX_SPEED: 52.0,     // m/s (~187 km/h)
  SPEED_ACCELERATION: 0.014,

  // Kinematic Jump & Slide Physics (Fast & Decisive Subway Surfers Model)
  GRAVITY: -50.0,           // m/s^2 (crisp arc, reduced floatiness)
  JUMP_VELOCITY: 16.5,      // m/s
  FAST_FALL_VELOCITY: -42.0,// m/s (instant dive down)
  LANE_CHANGE_TIME: 0.13,   // seconds (snappy critically damped switch)
  SLIDE_DURATION: 0.54,     // seconds (tighter slide window)

  // Hitbox Dimensions
  PLAYER_NORMAL_HEIGHT: 1.85,
  PLAYER_SLIDE_HEIGHT: 0.65,
  PLAYER_WIDTH: 0.9,
  PLAYER_DEPTH: 0.7,

  // Power-Up Armory Upgrade Progression (6 Tiers: Base 6s -> 7.5s -> 9.5s -> 12s -> 15s -> 20s)
  UPGRADE_TIERS: {
    DURATIONS: [6.0, 7.5, 9.5, 12.0, 15.0, 20.0],
    COSTS: [0, 15000, 35000, 75000, 150000, 300000],
    MAX_LEVEL: 6
  },

  // Monster Robot Progression Settings (Mini every 150k, Apex every 400k, Nothing after 900k in 1M Heist mode)
  MONSTER_ROBOT: {
    MINI_INTERVAL: 150000,      // Mini Harvester every 150,000 score
    APEX_INTERVAL: 400000,      // Apex Boss Harvester every 400,000 score
    MAX_ACTIVE_BOTS: 3,         // Up to 3 active monsters across lanes
    MINI_HITS: 12,              // 12 laser hits for mini
    MINI_SCALE: 1.05,           // 1.05x scale for mini
    MINI_BOUNTY: 10000,         // +10,000 Units
    MINI_COINS_DROP: 1,         // 1 coin per hit
    APEX_HITS: 28,              // 28 laser hits for Apex
    APEX_SCALE: 1.5,            // 1.5x scale for Apex
    APEX_BOUNTY: 25000,         // +25,000 Units
    APEX_COINS_DROP: 2,         // 2 coins per hit
    HEIST_MAX_SPAWN_SCORE: 900000, // In 1M mode, nothing after 900k
    AHEAD_DISTANCE: 38.0,       // Spawns 38m ahead (within 55m laser range)
    TARGET_LEAD_MIN: 30.0,      // Lead distance window minimum
    TARGET_LEAD_MAX: 42.0,      // Lead distance window maximum
    COIN_MAGNET_RADIUS: 14.0,   // Strong vacuum magnet radius
    COIN_EAT_RADIUS: 3.2        // Ingestion intake core radius
  },

  // Bujji Companion Offset (Left Shoulder Side)
  BUJJI_OFFSET_X: -0.72,
  BUJJI_OFFSET_Y: 1.35,
  BUJJI_OFFSET_Z: -0.35,

  // Power-Up Parameters (Increased by 20% from reduced baseline)
  POWERUP_SPAWN_CHANCE: 0.0384,
  JETPACK_ALTITUDE: 8.0,
  SHIELD_BASE_DURATION: 6.0,
  JETPACK_BASE_DURATION: 6.0,
  MAGNET_BASE_DURATION: 6.0,
  DOUBLE_POINTS_BASE_DURATION: 6.0,
  SHIELD_DURATION: 6.0,
  JETPACK_DURATION: 6.0,
  MAGNET_DURATION: 6.0,
  DOUBLE_POINTS_DURATION: 6.0,
  MAGNET_RADIUS: 22.0,

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
