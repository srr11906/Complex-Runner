/**
 * PRABHAS: KASI 2898 AD (3D Runner - AAA Next-Gen)
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

  // Speed & Progression (Reduced by 15% for optimal reaction time)
  INITIAL_SPEED: 18.7, // m/s (~67 km/h, reduced from 22.0)
  MAX_SPEED: 39.1,     // m/s (~140 km/h, reduced from 46.0)
  SPEED_ACCELERATION: 0.007,

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

  // Bujji Companion Offset (Left Shoulder Side)
  BUJJI_OFFSET_X: -0.72,
  BUJJI_OFFSET_Y: 1.35,
  BUJJI_OFFSET_Z: -0.35,

  // Power-Up Parameters
  JETPACK_ALTITUDE: 8.0,
  JETPACK_DURATION: 8.0,
  MAGNET_RADIUS: 25.0,
  MAGNET_DURATION: 10.0,
  DOUBLE_POINTS_DURATION: 12.0,

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
