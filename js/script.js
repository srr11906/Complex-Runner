/**
 * PRABHAS: KASI 2898 AD (3D Runner)
 * Main Web Application Entry Point
 */

import { GameEngine3D } from "./game3D.js?v=20260914_complex_v6";

window.addEventListener("DOMContentLoaded", () => {
  const game = new GameEngine3D();
  game.init();
  window.gameEngine3D = game; // Expose for testing & debug inspection
});
