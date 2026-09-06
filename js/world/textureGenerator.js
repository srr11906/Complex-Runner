/**
 * PRABHAS: KASI 2898 AD (3D Runner - AAA Next-Gen)
 * Procedural PBR High-Resolution Texture & Surface Shader Generator
 * Creates cached, highly detailed Canvas Textures for PBR Materials & Shanty Architecture
 */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

class TextureGenerator {
  constructor() {
    this.cache = new Map();
  }

  /**
   * 1. 2898 AD Dystopian Electromagnetic Highway Trackway
   * Monolithic titanium-composite slabs, embedded linear induction maglev rails, sleek optical guideways
   */
  getRoadTexture() {
    if (this.cache.has("road")) return this.cache.get("road");

    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");

    // 1. Dark Monolithic Titanium-Alloy Base
    ctx.fillStyle = "#1A1410";
    ctx.fillRect(0, 0, 1024, 1024);

    // 2. Heavy Composite Slab Expansion Seams (Every 256px)
    ctx.strokeStyle = "#0D0907";
    ctx.lineWidth = 8;
    for (let y = 0; y <= 1024; y += 256) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();

      // Heavy interlocking steel dowel anchors on seams
      ctx.fillStyle = "#382F26";
      for (let x = 32; x < 1024; x += 64) {
        ctx.fillRect(x - 6, y - 5, 12, 10);
      }
    }

    // 3. Fine Industrial Alloy Micro-Grit Noise
    const imgData = ctx.getImageData(0, 0, 1024, 1024);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 22;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise * 0.85));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise * 0.65));
    }
    ctx.putImageData(imgData, 0, 0);

    // 4. Embedded Linear Maglev Induction Rails (3 Lanes: Center at X=170, 512, 854)
    const laneCenters = [170, 512, 854];
    for (const lx of laneCenters) {
      // Recessed magnetic trench
      ctx.fillStyle = "rgba(10, 7, 5, 0.92)";
      ctx.fillRect(lx - 26, 0, 52, 1024);

      // Outer guide rail strips
      ctx.fillStyle = "#2D241C";
      ctx.fillRect(lx - 26, 0, 4, 1024);
      ctx.fillRect(lx + 22, 0, 4, 1024);

      // Glowing Maglev Power Conduit Rail Core
      ctx.fillStyle = "rgba(0, 229, 255, 0.55)";
      ctx.fillRect(lx - 4, 0, 8, 1024);

      // Embedded Electromagnetic Coils
      ctx.fillStyle = "#F59E0B";
      for (let y = 8; y < 1024; y += 32) {
        ctx.fillRect(lx - 18, y, 36, 12);
      }
    }

    // 5. High-Tech Optical Guideway Lane Boundaries (Solid thin laser guideways, NO asphalt dashed lines)
    ctx.strokeStyle = "rgba(217, 119, 6, 0.5)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(341, 0);
    ctx.lineTo(341, 1024);
    ctx.moveTo(682, 0);
    ctx.lineTo(682, 1024);
    ctx.stroke();

    // 6. Futuristic Sector Stencils
    ctx.fillStyle = "rgba(203, 213, 225, 0.35)";
    ctx.font = "900 22px monospace";
    ctx.fillText("KASI MAGLEV // CORRIDOR-01", 50, 130);
    ctx.fillText("KASI MAGLEV // CORRIDOR-01", 50, 642);
    ctx.fillText("INDUCTION 750V // ACTIVE", 390, 380);
    ctx.fillText("INDUCTION 750V // ACTIVE", 390, 892);

    // 7. Desert Sand Weathering along Highway Margins
    for (let i = 0; i < 40; i++) {
      const edge = Math.random() > 0.5 ? 0 : 1024;
      const sy = Math.random() * 1024;
      const rad = 45 + Math.random() * 80;
      const grad = ctx.createRadialGradient(edge, sy, 0, edge, sy, rad);
      grad.addColorStop(0, "rgba(58, 35, 15, 0.7)");
      grad.addColorStop(0.6, "rgba(58, 35, 15, 0.25)");
      grad.addColorStop(1, "rgba(58, 35, 15, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(edge, sy, rad, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 4);
    this.cache.set("road", texture);
    return texture;
  }

  /**
   * 2. Weathered Industrial Train Armor (Steel, Rivets, Hazard Chevrons, Rust)
   */
  getTrainArmorTexture() {
    if (this.cache.has("trainArmor")) return this.cache.get("trainArmor");

    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // Dark Heavy Steel Base
    ctx.fillStyle = "#2A2E38";
    ctx.fillRect(0, 0, 1024, 512);

    // Metal plate horizontal seams
    ctx.strokeStyle = "#141720";
    ctx.lineWidth = 4;
    for (let y = 64; y < 512; y += 128) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();

      // Rivet rows
      ctx.fillStyle = "#4A5260";
      for (let x = 16; x < 1024; x += 32) {
        ctx.beginPath();
        ctx.arc(x, y - 8, 3, 0, Math.PI * 2);
        ctx.arc(x, y + 8, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Heavy Scratches and Scuffs
    ctx.strokeStyle = "rgba(200, 215, 230, 0.4)";
    ctx.lineWidth = 1.5;
    for (let s = 0; s < 40; s++) {
      ctx.beginPath();
      let sx = Math.random() * 1024;
      let sy = Math.random() * 512;
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + (Math.random() - 0.5) * 70, sy + (Math.random() - 0.5) * 20);
      ctx.stroke();
    }

    // Weathered Rust Patches
    for (let r = 0; r < 25; r++) {
      const rx = Math.random() * 1024;
      const ry = Math.random() * 512;
      const rrad = 20 + Math.random() * 60;
      const rustGrad = ctx.createRadialGradient(rx, ry, 0, rx, ry, rrad);
      rustGrad.addColorStop(0, "rgba(150, 65, 20, 0.75)");
      rustGrad.addColorStop(0.5, "rgba(120, 50, 15, 0.4)");
      rustGrad.addColorStop(1, "rgba(100, 40, 10, 0)");
      ctx.fillStyle = rustGrad;
      ctx.beginPath();
      ctx.arc(rx, ry, rrad, 0, Math.PI * 2);
      ctx.fill();
    }

    // Hazard Warning Chevrons on bottom strip
    ctx.fillStyle = "#F59E0B";
    ctx.fillRect(0, 460, 1024, 52);
    ctx.fillStyle = "#111827";
    for (let ch = -50; ch < 1050; ch += 50) {
      ctx.beginPath();
      ctx.moveTo(ch, 512);
      ctx.lineTo(ch + 25, 460);
      ctx.lineTo(ch + 50, 460);
      ctx.lineTo(ch + 25, 512);
      ctx.closePath();
      ctx.fill();
    }

    // Industrial Stencil Markings
    ctx.fillStyle = "rgba(248, 250, 252, 0.8)";
    ctx.font = "bold 32px monospace";
    ctx.fillText("KASI-CORRIDOR // FREIGHT 2898", 60, 240);
    ctx.font = "bold 20px monospace";
    ctx.fillText("MAX LOAD • 100,000 U • COMPLEX CLASS-IV", 60, 275);

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set("trainArmor", texture);
    return texture;
  }

  /**
   * 3. Dystopian Kasi Shanty Megastructure Facade (Weathered Corrugated Metal, Neon Windows, AC Vents)
   */
  getShantyBuildingTexture() {
    if (this.cache.has("shantyBuilding")) return this.cache.get("shantyBuilding");

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");

    // Weathered concrete base
    ctx.fillStyle = "#332B25";
    ctx.fillRect(0, 0, 512, 1024);

    // Corrugated iron and rusted sheet modules
    const colors = ["#4A3B32", "#5C3E2D", "#2C3539", "#6E4D3B", "#382D24"];
    for (let y = 0; y < 1024; y += 64) {
      for (let x = 0; x < 512; x += 128) {
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillRect(x + 2, y + 2, 124, 60);

        // Corrugated vertical ridges
        ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
        ctx.lineWidth = 2;
        for (let rx = x + 10; rx < x + 120; rx += 12) {
          ctx.beginPath();
          ctx.moveTo(rx, y + 2);
          ctx.lineTo(rx, y + 62);
          ctx.stroke();
        }
      }
    }

    // Illuminated Window Grids (Warm amber and cyber cyan lights)
    for (let wy = 40; wy < 1000; wy += 80) {
      for (let wx = 30; wx < 500; wx += 70) {
        if (Math.random() > 0.35) {
          const isCyan = Math.random() > 0.7;
          ctx.fillStyle = isCyan ? "#00E5FF" : "#F59E0B";
          ctx.shadowColor = ctx.fillStyle;
          ctx.shadowBlur = 8;
          ctx.fillRect(wx, wy, 24, 18);
          ctx.shadowBlur = 0;

          // Window frame cross
          ctx.strokeStyle = "#1A1410";
          ctx.lineWidth = 2;
          ctx.strokeRect(wx, wy, 24, 18);
        }
      }
    }

    // Weathering grunge streaks & rain drips
    ctx.fillStyle = "rgba(15, 10, 8, 0.55)";
    for (let s = 0; s < 35; s++) {
      const gx = Math.random() * 512;
      const gw = 8 + Math.random() * 25;
      const gh = 100 + Math.random() * 320;
      ctx.fillRect(gx, Math.random() * 600, gw, gh);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set("shantyBuilding", texture);
    return texture;
  }

  /**
   * 4. Realistic Corrugated Cargo Container Texture with Stencils
   */
  getContainerTexture(colorType = "rust") {
    const key = `container_${colorType}`;
    if (this.cache.has(key)) return this.cache.get(key);

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    let baseColor = "#8C3B1E";
    let darkColor = "#5A2310";
    let lightColor = "#B04E28";

    if (colorType === "cyan") {
      baseColor = "#2A6A78";
      darkColor = "#1B444D";
      lightColor = "#398B9E";
    } else if (colorType === "yellow") {
      baseColor = "#B8860B";
      darkColor = "#7A5907";
      lightColor = "#E0A30D";
    } else if (colorType === "dark") {
      baseColor = "#27272A";
      darkColor = "#18181B";
      lightColor = "#3F3F46";
    }

    // Base background
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 512);

    // Corrugated vertical ridges
    const ridgeWidth = 32;
    for (let x = 0; x < 512; x += ridgeWidth) {
      ctx.fillStyle = lightColor;
      ctx.fillRect(x, 0, ridgeWidth / 2, 512);
      ctx.fillStyle = darkColor;
      ctx.fillRect(x + ridgeWidth / 2, 0, ridgeWidth / 2, 512);
    }

    // Steel Frame Border
    ctx.fillStyle = "#1E293B";
    ctx.fillRect(0, 0, 512, 24);
    ctx.fillRect(0, 488, 512, 24);
    ctx.fillRect(0, 0, 24, 512);
    ctx.fillRect(488, 0, 24, 512);

    // Corner Castings (Twist Lock holes)
    ctx.fillStyle = "#0F172A";
    for (let cx of [4, 480]) {
      for (let cy of [4, 480]) {
        ctx.fillRect(cx, cy, 28, 28);
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(cx + 14, cy + 14, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#0F172A";
      }
    }

    // Stenciled Logistics Text & Serial Codes
    ctx.fillStyle = "rgba(244, 244, 245, 0.85)";
    ctx.font = "bold 26px monospace";
    ctx.fillText("KASI-LOGISTICS // 2898", 45, 230);
    ctx.font = "bold 18px monospace";
    ctx.fillText("SECTOR 7-G • FREIGHT CONTAINER", 45, 260);
    ctx.fillText("MAX PAYLOAD 45,000 KG", 45, 285);

    // Hazard Stripes
    ctx.fillStyle = "#F59E0B";
    ctx.fillRect(24, 460, 464, 28);
    ctx.fillStyle = "#111827";
    for (let h = 0; h < 464; h += 30) {
      ctx.beginPath();
      ctx.moveTo(24 + h, 488);
      ctx.lineTo(24 + h + 15, 460);
      ctx.lineTo(24 + h + 25, 460);
      ctx.lineTo(24 + h + 10, 488);
      ctx.closePath();
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * 5. Inverted Pyramid Complex Monolith Texture (Obsidian Alloy & Gold Circuits)
   */
  getComplexMonolithTexture() {
    if (this.cache.has("complexMonolith")) return this.cache.get("complexMonolith");

    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");

    // Dark Titanium Alloy Base
    ctx.fillStyle = "#0D1117";
    ctx.fillRect(0, 0, 1024, 1024);

    // High-Tech Monolithic Panel Grooves
    ctx.strokeStyle = "#1F2937";
    ctx.lineWidth = 6;
    for (let y = 0; y <= 1024; y += 128) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }
    for (let x = 0; x <= 1024; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1024);
      ctx.stroke();
    }

    // Glowing Gold Geometric Energy Conduit Lines
    ctx.strokeStyle = "#FDE047";
    ctx.shadowColor = "#F59E0B";
    ctx.shadowBlur = 12;
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(512, 0);
    ctx.lineTo(512, 1024);
    ctx.moveTo(0, 512);
    ctx.lineTo(1024, 512);
    ctx.moveTo(128, 128);
    ctx.lineTo(896, 896);
    ctx.moveTo(128, 896);
    ctx.lineTo(896, 128);
    ctx.stroke();
    ctx.shadowBlur = 0;

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set("complexMonolith", texture);
    return texture;
  }

  /**
   * 6. Holographic Neon Billboard Sign Textures
   */
  getNeonSignTexture(type = "lassi") {
    const key = `neon_${type}`;
    if (this.cache.has(key)) return this.cache.get(key);

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#0A0D14";
    ctx.fillRect(0, 0, 512, 256);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (type === "lassi") {
      ctx.strokeStyle = "#FF007F";
      ctx.lineWidth = 6;
      ctx.strokeRect(16, 16, 480, 224);

      ctx.font = "900 42px 'Inter', sans-serif";
      ctx.fillStyle = "#FF77C6";
      ctx.shadowColor = "#FF007F";
      ctx.shadowBlur = 18;
      ctx.fillText("ALMOST REAL", 256, 100);
      ctx.font = "900 58px 'Inter', sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText("LASSI", 256, 165);
    } else if (type === "complex") {
      ctx.strokeStyle = "#F59E0B";
      ctx.lineWidth = 6;
      ctx.strokeRect(16, 16, 480, 224);

      ctx.font = "900 36px 'Inter', sans-serif";
      ctx.fillStyle = "#FDE047";
      ctx.shadowColor = "#F59E0B";
      ctx.shadowBlur = 18;
      ctx.fillText("COMPLEX ACCESS", 256, 95);
      ctx.font = "900 48px 'Inter', sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText("1,000,000 U", 256, 160);
    } else if (type === "ore") {
      ctx.strokeStyle = "#00E5FF";
      ctx.lineWidth = 6;
      ctx.strokeRect(16, 16, 480, 224);

      ctx.font = "900 38px 'Inter', sans-serif";
      ctx.fillStyle = "#67E8F9";
      ctx.shadowColor = "#00E5FF";
      ctx.shadowBlur = 18;
      ctx.fillText("NO WATER", 256, 95);
      ctx.font = "900 52px 'Inter', sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText("BUY ORE", 256, 160);
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * 7. Procedural Dark Brown Desert Sand & Volcanic Crag Ground Texture
   */
  getSandTerrainTexture() {
    if (this.cache.has("sandTerrain")) return this.cache.get("sandTerrain");

    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");

    // Rich Dark Amber-Brown Desert Sand Base (#3D2411 / #4A2E16)
    ctx.fillStyle = "#3D2411";
    ctx.fillRect(0, 0, 1024, 1024);

    // Fine Dark Earth Grain Noise
    const imgData = ctx.getImageData(0, 0, 1024, 1024);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 24;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise * 0.85));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise * 0.65));
    }
    ctx.putImageData(imgData, 0, 0);

    // Windblown Dark Sand Dunes & Ripples
    ctx.lineWidth = 16;
    for (let y = 0; y < 1024; y += 32) {
      ctx.strokeStyle = (y % 64 === 0) ? "rgba(85, 48, 23, 0.45)" : "rgba(35, 18, 8, 0.4)";
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= 1024; x += 128) {
        const waveY = y + Math.sin((x / 1024) * Math.PI * 4 + y) * 12;
        ctx.lineTo(x, waveY);
      }
      ctx.stroke();
    }

    // Rocky Basalt Gravel & Sunken Ancient Earth Formations
    for (let i = 0; i < 40; i++) {
      const rx = Math.random() * 1024;
      const ry = Math.random() * 1024;
      const rrad = 30 + Math.random() * 80;
      const rGrad = ctx.createRadialGradient(rx, ry, 0, rx, ry, rrad);
      rGrad.addColorStop(0, "rgba(25, 12, 5, 0.65)");
      rGrad.addColorStop(0.7, "rgba(65, 36, 17, 0.25)");
      rGrad.addColorStop(1, "rgba(75, 42, 20, 0)");
      ctx.fillStyle = rGrad;
      ctx.beginPath();
      ctx.arc(rx, ry, rrad, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 6);
    this.cache.set("sandTerrain", texture);
    return texture;
  }
}

export const textureGen = new TextureGenerator();
