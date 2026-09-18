/**
 * COMPLEX RUNNER - Next-Gen 3D Sci-Fi Runner
 * Main Web Application Entry Point
 */

import { GameEngine3D } from "./game3D.js?v=20260919_clean_trains_v42";

window.addEventListener("DOMContentLoaded", () => {
  const game = new GameEngine3D();
  game.init();
  window.gameEngine3D = game; // Expose for testing & debug inspection
});
