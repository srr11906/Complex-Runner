/**
 * COMPLEX RUNNER - Next-Gen 3D Sci-Fi Runner
 * AAA Procedural Canvas Texture & Bump Map Generator
 * Creates cached, highly detailed Canvas Textures for PBR Materials & Shanty Architecture
 */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

class TextureGenerator {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Fast Sobel Filter to generate high-fidelity Tangent-Space Normal Maps from Canvas Grayscale
   */
  generateNormalMapFromCanvas(srcCanvas, strength = 2.0) {
    const width = srcCanvas.width;
    const height = srcCanvas.height;
    const srcCtx = srcCanvas.getContext("2d");
    const srcData = srcCtx.getImageData(0, 0, width, height).data;

    const normCanvas = document.createElement("canvas");
    normCanvas.width = width;
    normCanvas.height = height;
    const normCtx = normCanvas.getContext("2d");
    const normImgData = normCtx.createImageData(width, height);
    const dstData = normImgData.data;

    // Helper to get grayscale height (0.0 to 1.0)
    const getHeight = (x, y) => {
      const px = Math.max(0, Math.min(width - 1, x));
      const py = Math.max(0, Math.min(height - 1, y));
      const idx = (py * width + px) * 4;
      return (srcData[idx] * 0.299 + srcData[idx + 1] * 0.587 + srcData[idx + 2] * 0.114) / 255.0;
    };

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Sobel filter kernels
        // [-1 0 1]      [-1 -2 -1]
        // [-2 0 2]  dx  [ 0  0  0] dy
        // [-1 0 1]      [ 1  2  1]
        const tl = getHeight(x - 1, y - 1);
        const t  = getHeight(x,     y - 1);
        const tr = getHeight(x + 1, y - 1);
        const l  = getHeight(x - 1, y);
        const r  = getHeight(x + 1, y);
        const bl = getHeight(x - 1, y + 1);
        const b  = getHeight(x,     y + 1);
        const br = getHeight(x + 1, y + 1);

        const dx = (tr + 2.0 * r + br) - (tl + 2.0 * l + bl);
        const dy = (bl + 2.0 * b + br) - (tl + 2.0 * t + tr);

        let nx = -dx * strength;
        let ny = -dy * strength;
        let nz = 1.0;

        // Normalize vector
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
        nx /= len;
        ny /= len;
        nz /= len;

        const idx = (y * width + x) * 4;
        dstData[idx]     = Math.floor((nx * 0.5 + 0.5) * 255); // R -> X
        dstData[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255); // G -> Y
        dstData[idx + 2] = Math.floor((nz * 0.5 + 0.5) * 255); // B -> Z
        dstData[idx + 3] = 255;
      }
    }

    normCtx.putImageData(normImgData, 0, 0);
    return normCanvas;
  }

  /**
   * 1. Dystopian Electromagnetic Highway Trackway
   * Monolithic titanium-composite slabs, embedded linear induction maglev rails, sleek optical guideways
   */
  getRoadTexture() {
    if (this.cache.has("road")) return this.cache.get("road");

    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");

    // 1. Sleek Matte Obsidian Composite Road Surface
    ctx.fillStyle = "#17181E";
    ctx.fillRect(0, 0, 1024, 1024);

    // 2. Extremely Subtle Smooth Tonal Texture (Zero harsh static)
    const imgData = ctx.getImageData(0, 0, 1024, 1024);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const grain = (Math.random() - 0.5) * 6;
      data[i] = Math.max(0, Math.min(255, data[i] + grain));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + grain));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + grain * 1.1));
    }
    ctx.putImageData(imgData, 0, 0);

    // 3. Clean Transverse Expansion Seams (Every 512px)
    for (let y = 0; y <= 1024; y += 512) {
      // Recessed seam groove
      ctx.fillStyle = "#0C0D11";
      ctx.fillRect(0, y - 2, 1024, 4);
      // Subtle top specular edge highlight
      ctx.fillStyle = "#262A34";
      ctx.fillRect(0, y + 2, 1024, 1.5);
    }

    // 4. Sleek Minimalist Maglev Guide Tracks (3 Lanes: Left 170, Center 512, Right 854)
    const laneCenters = [170, 512, 854];
    for (const lx of laneCenters) {
      // Recessed dark metallic trench
      ctx.fillStyle = "#1E222A";
      ctx.fillRect(lx - 12, 0, 24, 1024);

      // Dark titanium track edges
      ctx.fillStyle = "#333945";
      ctx.fillRect(lx - 12, 0, 2, 1024);
      ctx.fillRect(lx + 10, 0, 2, 1024);

      // Soft ambient cyan glow
      ctx.fillStyle = "rgba(0, 229, 255, 0.12)";
      ctx.fillRect(lx - 6, 0, 12, 1024);

      // Luminous cyan superconductor core beam
      ctx.fillStyle = "rgba(0, 229, 255, 0.85)";
      ctx.fillRect(lx - 2, 0, 4, 1024);
    }

    // 5. Clean Futuristic Dashed Amber Lane Dividers
    ctx.strokeStyle = "rgba(245, 158, 11, 0.45)";
    ctx.lineWidth = 2.5;
    ctx.setLineDash([48, 32]);
    ctx.beginPath();
    ctx.moveTo(341, 0);
    ctx.lineTo(341, 1024);
    ctx.moveTo(682, 0);
    ctx.lineTo(682, 1024);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // 6. Smooth Desert Sand Border Blending at Outer Margins
    const leftGrad = ctx.createLinearGradient(0, 0, 36, 0);
    leftGrad.addColorStop(0, "rgba(54, 38, 22, 0.75)");
    leftGrad.addColorStop(0.6, "rgba(54, 38, 22, 0.25)");
    leftGrad.addColorStop(1, "rgba(54, 38, 22, 0)");
    ctx.fillStyle = leftGrad;
    ctx.fillRect(0, 0, 36, 1024);

    const rightGrad = ctx.createLinearGradient(1024, 0, 988, 0);
    rightGrad.addColorStop(0, "rgba(54, 38, 22, 0.75)");
    rightGrad.addColorStop(0.6, "rgba(54, 38, 22, 0.25)");
    rightGrad.addColorStop(1, "rgba(54, 38, 22, 0)");
    ctx.fillStyle = rightGrad;
    ctx.fillRect(988, 0, 36, 1024);

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
    ctx.fillText("COMPLEX-CORRIDOR // FREIGHT 3000", 60, 240);
    ctx.font = "bold 20px monospace";
    ctx.fillText("MAX LOAD • 100,000 U • COMPLEX CLASS-IV", 60, 275);

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set("trainArmor", texture);
    return texture;
  }

  /**
   * 3. Dystopian Wasteland Salvage Megastructure Facade (Corrugated Iron, Welded Rust Plates, Structural I-Beams, Stencils, Grated Vents - ZERO Cement)
   */
  getShantyBuildingTexture() {
    if (this.cache.has("shantyBuilding")) return this.cache.get("shantyBuilding");

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");

    // 1. Dark Rusted Steel & Industrial Alloy Base (#1F1813 / #281F18)
    ctx.fillStyle = "#221A14";
    ctx.fillRect(0, 0, 512, 1024);

    // 2. Patchwork Salvage Plates (Weathered Rust, Burnt Metal, Oxidized Copper & Scrapped Titanium)
    const plateColors = [
      "#4A2E1B", // Deep Rust Iron
      "#5E3821", // Weathered Orange-Brown Oxide
      "#382B22", // Burnt Heavy Alloy
      "#2B3338", // Oxidized Scrapped Teal Steel
      "#6B3D22", // Rich Iron Oxide
      "#1E2328"  // Charred Titanium Scrap
    ];

    for (let y = 0; y < 1024; y += 64) {
      for (let x = 0; x < 512; x += 128) {
        const pColor = plateColors[Math.floor(Math.random() * plateColors.length)];
        ctx.fillStyle = pColor;
        ctx.fillRect(x + 2, y + 2, 124, 60);

        // Corrugated metal vertical sinusoidal ridges
        for (let rx = x + 6; rx < x + 122; rx += 8) {
          // Highlight edge
          ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
          ctx.fillRect(rx, y + 2, 3, 60);
          // Shadow trough
          ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
          ctx.fillRect(rx + 3, y + 2, 4, 60);
        }

        // Heavy Welded Seam Lines & Rivet Rows along Plate Edges
        ctx.strokeStyle = "#110D0A";
        ctx.lineWidth = 2.5;
        ctx.strokeRect(x + 2, y + 2, 124, 60);

        // Welded Rivet Dots
        ctx.fillStyle = "rgba(255, 210, 160, 0.55)";
        for (let rvx = x + 8; rvx < x + 120; rvx += 16) {
          ctx.beginPath();
          ctx.arc(rvx, y + 5, 1.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(rvx, y + 59, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 3. Heavy Structural Steel Girders & Diagonal Cross-Trusses (#151B22)
    ctx.fillStyle = "#161B22";
    ctx.strokeStyle = "#0D1117";
    ctx.lineWidth = 3;

    // Horizontal I-Beam Girders
    for (let gy of [0, 256, 512, 768, 1020]) {
      ctx.fillRect(0, gy, 512, 14);
      ctx.strokeRect(0, gy, 512, 14);
      // Girder rivets
      ctx.fillStyle = "#D4D4D8";
      for (let rx = 12; rx < 500; rx += 24) {
        ctx.fillRect(rx, gy + 4, 3, 3);
      }
      ctx.fillStyle = "#161B22";
    }

    // Vertical Corner Channelling Columns
    for (let gx of [0, 250, 498]) {
      ctx.fillRect(gx, 0, 14, 1024);
      ctx.strokeRect(gx, 0, 14, 1024);
    }

    // Diagonal Reinforcement Struts in Selected Bays
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#1A222B";
    for (let by = 14; by < 1000; by += 256) {
      ctx.beginPath();
      ctx.moveTo(14, by);
      ctx.lineTo(248, by + 242);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(264, by);
      ctx.lineTo(498, by + 242);
      ctx.stroke();
    }

    // 4. Dystopian Stenciled Markings & Warning Hazard Stripes
    ctx.fillStyle = "rgba(245, 158, 11, 0.85)";
    ctx.font = "900 15px monospace";
    ctx.fillText("// WASTELAND SECTOR-04 // SALVAGE UNIT", 30, 285);
    ctx.fillText("CAUTION: HIGH-VOLTAGE INDUCTION", 30, 540);
    ctx.fillText("WATER CONDENSER TERMINAL // 2898", 30, 795);

    // Hazard Stripes on Lower Girder
    ctx.fillStyle = "#F59E0B";
    ctx.fillRect(20, 990, 472, 16);
    ctx.fillStyle = "#111317";
    for (let hx = 20; hx < 480; hx += 20) {
      ctx.beginPath();
      ctx.moveTo(hx, 1006);
      ctx.lineTo(hx + 10, 990);
      ctx.lineTo(hx + 16, 990);
      ctx.lineTo(hx + 6, 1006);
      ctx.closePath();
      ctx.fill();
    }

    // 5. High-Tech Cyber Slits & Grated Observation Ports (Warm amber & electric cyan glowing optics)
    for (let wy = 50; wy < 950; wy += 85) {
      for (let wx = 35; wx < 480; wx += 80) {
        if (Math.random() > 0.40) {
          const isCyan = Math.random() > 0.72;
          const glowColor = isCyan ? "#00E5FF" : "#F59E0B";

          // Recessed Slit Housing
          ctx.fillStyle = "#0A0D10";
          ctx.fillRect(wx - 2, wy - 2, 38, 18);

          // Glowing Narrow Horizontal Slit
          ctx.fillStyle = glowColor;
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = 10;
          ctx.fillRect(wx + 2, wy + 3, 30, 8);
          ctx.shadowBlur = 0;

          // Metal Grate Bars over the slit
          ctx.strokeStyle = "#161B22";
          ctx.lineWidth = 1.8;
          for (let bx = wx + 8; bx <= wx + 26; bx += 6) {
            ctx.beginPath();
            ctx.moveTo(bx, wy);
            ctx.lineTo(bx, wy + 14);
            ctx.stroke();
          }
        }
      }
    }

    // 6. Realistic Weathering: Deep Rust Runoff, Industrial Grease & Sand Dust Wash
    ctx.fillStyle = "rgba(40, 18, 8, 0.65)";
    for (let s = 0; s < 45; s++) {
      const gx = Math.random() * 512;
      const gw = 6 + Math.random() * 18;
      const gh = 80 + Math.random() * 260;
      ctx.fillRect(gx, Math.random() * 700, gw, gh);
    }

    // Baked Sand Dust accumulation at bottom third
    const sandWash = ctx.createLinearGradient(0, 700, 0, 1024);
    sandWash.addColorStop(0, "rgba(117, 72, 32, 0)");
    sandWash.addColorStop(1, "rgba(117, 72, 32, 0.65)");
    ctx.fillStyle = sandWash;
    ctx.fillRect(0, 700, 512, 324);

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
    ctx.fillText("SECTOR-LOGISTICS // 3000", 45, 230);
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
   * 4b. Subway Surfers Detour / Lane Closed Roadblock Signboard Texture
   * High-contrast directional neon chevrons with diagonal hazard borders
   */
  getDetourSignTexture(direction = "right") {
    const key = `detour_${direction}`;
    if (this.cache.has(key)) return this.cache.get(key);

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    // 1. Dark Carbon Armor Plate
    ctx.fillStyle = "#0B0F19";
    ctx.fillRect(0, 0, 512, 256);

    // 2. Bold Diagonal Hazard Caution Border (Top & Bottom)
    const drawHazardStripe = (y, h) => {
      ctx.fillStyle = "#F59E0B";
      ctx.fillRect(0, y, 512, h);
      ctx.fillStyle = "#111827";
      for (let x = -30; x < 540; x += 36) {
        ctx.beginPath();
        ctx.moveTo(x, y + h);
        ctx.lineTo(x + 20, y);
        ctx.lineTo(x + 36, y);
        ctx.lineTo(x + 16, y + h);
        ctx.closePath();
        ctx.fill();
      }
    };
    drawHazardStripe(0, 28);
    drawHazardStripe(228, 28);

    // 3. Inner Slate Plate with Thin Gold Border
    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 3;
    ctx.strokeRect(12, 34, 488, 188);

    // 4. "LANE CLOSED" Text Header
    ctx.font = "900 24px sans-serif";
    ctx.fillStyle = "#F59E0B";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "#F59E0B";
    ctx.shadowBlur = 10;
    ctx.fillText("DETOUR // LANE CLOSED", 256, 62);
    ctx.shadowBlur = 0;

    // 5. Massive Directional Chevron Arrows
    ctx.lineWidth = 22;
    ctx.lineCap = "round";
    ctx.lineJoin = "miter";
    ctx.strokeStyle = "#FBBF24";
    ctx.shadowColor = "#F59E0B";
    ctx.shadowBlur = 18;

    const isRight = direction !== "left";
    const isBoth = direction === "both";

    if (isBoth) {
      // Bidirectional chevrons
      const leftXs = [160, 100];
      for (let cx of leftXs) {
        ctx.beginPath();
        ctx.moveTo(cx + 25, 110);
        ctx.lineTo(cx - 20, 150);
        ctx.lineTo(cx + 25, 190);
        ctx.stroke();
      }
      const rightXs = [352, 412];
      for (let cx of rightXs) {
        ctx.beginPath();
        ctx.moveTo(cx - 25, 110);
        ctx.lineTo(cx + 20, 150);
        ctx.lineTo(cx - 25, 190);
        ctx.stroke();
      }
    } else {
      // 3 Bold Sequential Chevrons
      const arrowXs = isRight ? [160, 256, 352] : [352, 256, 160];
      for (let cx of arrowXs) {
        ctx.beginPath();
        if (isRight) {
          ctx.moveTo(cx - 30, 110);
          ctx.lineTo(cx + 24, 150);
          ctx.lineTo(cx - 30, 190);
        } else {
          ctx.moveTo(cx + 30, 110);
          ctx.lineTo(cx - 24, 150);
          ctx.lineTo(cx + 30, 190);
        }
        ctx.stroke();
      }
    }
    ctx.shadowBlur = 0;

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * 4c. High-Visibility Hurdle Hazard Plank Texture
   */
  getHurdlePlankTexture() {
    if (this.cache.has("hurdlePlank")) return this.cache.get("hurdlePlank");

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");

    // Vibrant Yellow Base
    ctx.fillStyle = "#FBBF24";
    ctx.fillRect(0, 0, 512, 128);

    // Diagonal Black Hazard Stripes
    ctx.fillStyle = "#0F172A";
    for (let x = -80; x < 600; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 128);
      ctx.lineTo(x + 40, 0);
      ctx.lineTo(x + 72, 0);
      ctx.lineTo(x + 32, 128);
      ctx.closePath();
      ctx.fill();
    }

    // Outer Dark Metal Edge Trim
    ctx.strokeStyle = "#1E293B";
    ctx.lineWidth = 6;
    ctx.strokeRect(0, 0, 512, 128);

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set("hurdlePlank", texture);
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
   * 7. Procedural Natural Sunbaked Desert Sand & Dune Ground Texture
   */
  getSandTerrainTexture() {
    if (this.cache.has("sandTerrain")) return this.cache.get("sandTerrain");

    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");

    // Realistic Darker Sunbaked Wastelands Sand Base (#5C3617 / #482910)
    ctx.fillStyle = "#5C3617";
    ctx.fillRect(0, 0, 1024, 1024);

    // Fine Mineral Grain & Iron-Oxide Particle Noise
    const imgData = ctx.getImageData(0, 0, 1024, 1024);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 22;
      data[i] = Math.max(0, Math.min(255, data[i] + noise * 1.10));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise * 0.80));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise * 0.45));
    }
    ctx.putImageData(imgData, 0, 0);

    // Windblown Sand Dunes & Natural Shadow Ripples
    ctx.lineWidth = 14;
    for (let y = 0; y < 1024; y += 32) {
      ctx.strokeStyle = (y % 64 === 0) ? "rgba(118, 70, 30, 0.45)" : "rgba(60, 32, 14, 0.45)";
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= 1024; x += 128) {
        const waveY = y + Math.sin((x / 1024) * Math.PI * 4 + y) * 12;
        ctx.lineTo(x, waveY);
      }
      ctx.stroke();
    }

    // Weathered Ancient Earth, Scorched Bedrock & Pebble Scatter
    for (let i = 0; i < 40; i++) {
      const rx = Math.random() * 1024;
      const ry = Math.random() * 1024;
      const rrad = 25 + Math.random() * 65;
      const rGrad = ctx.createRadialGradient(rx, ry, 0, rx, ry, rrad);
      rGrad.addColorStop(0, "rgba(42, 22, 9, 0.60)");
      rGrad.addColorStop(0.7, "rgba(95, 52, 22, 0.25)");
      rGrad.addColorStop(1, "rgba(110, 60, 25, 0)");
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

  /**
   * 8. Road Highway Normal Map (3D expansion seams, induction trenches, micro-grit relief)
   */
  getRoadNormalMap() {
    if (this.cache.has("road_norm")) return this.cache.get("road_norm");
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, 512, 512);

    // Subtle Expansion joint trenches
    ctx.fillStyle = "#404040";
    for (let y = 0; y <= 512; y += 256) {
      ctx.fillRect(0, y - 1, 512, 2);
    }

    // Induction lane trenches
    for (let lx of [85, 256, 427]) {
      ctx.fillStyle = "#555555";
      ctx.fillRect(lx - 6, 0, 12, 512);
      ctx.fillStyle = "#B0B0B0";
      ctx.fillRect(lx - 1, 0, 2, 512);
    }

    const normCanvas = this.generateNormalMapFromCanvas(canvas, 0.75);
    const texture = new THREE.CanvasTexture(normCanvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 4);
    this.cache.set("road_norm", texture);
    return texture;
  }

  /**
   * 9. Sand Terrain Dune & Ripple Normal Map
   */
  getSandTerrainNormalMap() {
    if (this.cache.has("sandTerrain_norm")) return this.cache.get("sandTerrain_norm");
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, 512, 512);

    // Sand dune ridges
    ctx.lineWidth = 10;
    for (let y = 0; y < 512; y += 24) {
      ctx.strokeStyle = (y % 48 === 0) ? "#D0D0D0" : "#404040";
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= 512; x += 64) {
        const waveY = y + Math.sin((x / 512) * Math.PI * 4 + y) * 8;
        ctx.lineTo(x, waveY);
      }
      ctx.stroke();
    }

    const normCanvas = this.generateNormalMapFromCanvas(canvas, 1.8);
    const texture = new THREE.CanvasTexture(normCanvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 6);
    this.cache.set("sandTerrain_norm", texture);
    return texture;
  }

  /**
   * 10. Maglev Train Armor Plate Normal Map
   */
  getTrainArmorNormalMap() {
    if (this.cache.has("trainArmor_norm")) return this.cache.get("trainArmor_norm");
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, 512, 256);

    // Panel seams
    ctx.strokeStyle = "#101010";
    ctx.lineWidth = 3;
    for (let y = 32; y < 256; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();

      // Raised rivets
      ctx.fillStyle = "#FFFFFF";
      for (let x = 8; x < 512; x += 16) {
        ctx.beginPath();
        ctx.arc(x, y - 5, 2, 0, Math.PI * 2);
        ctx.arc(x, y + 5, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const normCanvas = this.generateNormalMapFromCanvas(canvas, 2.2);
    const texture = new THREE.CanvasTexture(normCanvas);
    this.cache.set("trainArmor_norm", texture);
    return texture;
  }

  /**
   * 11. Bhairava Realism Cloth Weave Bump Map
   */
  getClothBumpMap() {
    if (this.cache.has("clothBump")) return this.cache.get("clothBump");
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, 256, 256);

    // High frequency cross-hatch fabric weave
    ctx.strokeStyle = "#A0A0A0";
    ctx.lineWidth = 1;
    for (let i = 0; i < 256; i += 4) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 256);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(256, i);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    this.cache.set("clothBump", texture);
    return texture;
  }

  /**
   * 12. Bhairava Cybernetic Gauntlet Normal & Specular Texture
   */
  getCyberGauntletTexture() {
    if (this.cache.has("cyberGauntlet")) return this.cache.get("cyberGauntlet");
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    // Gunmetal base
    ctx.fillStyle = "#1E222A";
    ctx.fillRect(0, 0, 256, 256);

    // Laser engraved circuit conduits
    ctx.strokeStyle = "#00E5FF";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(20, 40);
    ctx.lineTo(100, 40);
    ctx.lineTo(130, 80);
    ctx.lineTo(220, 80);
    ctx.moveTo(30, 180);
    ctx.lineTo(110, 180);
    ctx.lineTo(140, 140);
    ctx.lineTo(230, 140);
    ctx.stroke();

    // Golden power nodes
    ctx.fillStyle = "#F59E0B";
    for (let x of [40, 120, 200]) {
      ctx.fillRect(x - 4, 110, 8, 36);
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set("cyberGauntlet", texture);
    return texture;
  }

  /**
   * 13. Dystopian Shanty Salvage Normal Map (3D corrugated iron ridges, welded plate seams, structural I-beams, slit grates)
   */
  getShantyBuildingNormalMap() {
    if (this.cache.has("shanty_norm")) return this.cache.get("shanty_norm");
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, 512, 1024);

    // Corrugated iron sinusoidal vertical ridges
    for (let y = 0; y < 1024; y += 64) {
      for (let x = 0; x < 512; x += 128) {
        for (let rx = x + 6; rx < x + 122; rx += 8) {
          ctx.fillStyle = "#B0B0B0";
          ctx.fillRect(rx, y + 2, 3, 60);
          ctx.fillStyle = "#404040";
          ctx.fillRect(rx + 3, y + 2, 4, 60);
        }

        // Heavy Welded Seams
        ctx.strokeStyle = "#202020";
        ctx.lineWidth = 3;
        ctx.strokeRect(x + 2, y + 2, 124, 60);
      }
    }

    // Heavy Structural I-Beams (Raised 3D Girders)
    for (let gy of [0, 256, 512, 768, 1020]) {
      ctx.fillStyle = "#E0E0E0";
      ctx.fillRect(0, gy, 512, 4);
      ctx.fillStyle = "#303030";
      ctx.fillRect(0, gy + 10, 512, 4);
    }
    for (let gx of [0, 250, 498]) {
      ctx.fillStyle = "#E0E0E0";
      ctx.fillRect(gx, 0, 4, 1024);
      ctx.fillStyle = "#303030";
      ctx.fillRect(gx + 10, 0, 4, 1024);
    }

    // Recessed Slits & Grated Portholes
    for (let wy = 50; wy < 950; wy += 85) {
      for (let wx = 35; wx < 480; wx += 80) {
        ctx.fillStyle = "#181818";
        ctx.fillRect(wx - 2, wy - 2, 38, 18);
        ctx.fillStyle = "#B0B0B0";
        ctx.fillRect(wx + 2, wy + 3, 30, 8);
      }
    }

    const normCanvas = this.generateNormalMapFromCanvas(canvas, 2.2);
    const texture = new THREE.CanvasTexture(normCanvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set("shanty_norm", texture);
    return texture;
  }

  /**
   * 14. Corrugated Cargo Container Normal Map
   */
  getContainerNormalMap() {
    if (this.cache.has("container_norm")) return this.cache.get("container_norm");
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, 512, 512);

    // Accordion corrugation ridges
    const ridgeWidth = 32;
    for (let x = 0; x < 512; x += ridgeWidth) {
      ctx.fillStyle = "#E0E0E0";
      ctx.fillRect(x, 0, ridgeWidth / 2, 512);
      ctx.fillStyle = "#202020";
      ctx.fillRect(x + ridgeWidth / 2, 0, ridgeWidth / 2, 512);
    }

    // Steel perimeter frame (raised)
    ctx.fillStyle = "#C0C0C0";
    ctx.fillRect(0, 0, 512, 24);
    ctx.fillRect(0, 488, 512, 24);
    ctx.fillRect(0, 0, 24, 512);
    ctx.fillRect(488, 0, 24, 512);

    // Recessed corner twist-lock holes
    ctx.fillStyle = "#101010";
    for (let cx of [4, 480]) {
      for (let cy of [4, 480]) {
        ctx.beginPath();
        ctx.arc(cx + 14, cy + 14, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const normCanvas = this.generateNormalMapFromCanvas(canvas, 2.2);
    const texture = new THREE.CanvasTexture(normCanvas);
    this.cache.set("container_norm", texture);
    return texture;
  }

  /**
   * 15. The Complex - Pristine Carrara White Marble & Gold Trackway
   */
  getComplexMarbleTexture() {
    return this.getComplexMarbleRoadTexture();
  }

  getComplexMarbleRoadTexture() {
    if (this.cache.has("complex_marble_road")) return this.cache.get("complex_marble_road");

    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");

    // Eye-pleasing soft architectural tech-marble base (softened shade, zero harsh pure white glare)
    ctx.fillStyle = "#DDE4EC";
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle natural marble veining
    ctx.strokeStyle = "rgba(148, 163, 184, 0.38)";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      let startX = Math.random() * 1024;
      let startY = 0;
      ctx.moveTo(startX, startY);
      for (let step = 0; step < 6; step++) {
        const nextX = startX + (Math.random() - 0.5) * 160;
        const nextY = startY + 180 + Math.random() * 60;
        ctx.quadraticCurveTo(startX + (Math.random() - 0.5) * 60, startY + 80, nextX, nextY);
        startX = nextX;
        startY = nextY;
      }
      ctx.stroke();
    }

    // Polished Marble Slab Tile Grid (512x512)
    ctx.fillStyle = "rgba(203, 213, 225, 0.7)";
    for (let y = 0; y <= 1024; y += 256) {
      ctx.fillRect(0, y - 1, 1024, 2);
    }
    for (let x = 0; x <= 1024; x += 256) {
      ctx.fillRect(x - 1, 0, 2, 1024);
    }

    // Inlaid Royal Gold Linear Geometry
    ctx.strokeStyle = "rgba(217, 119, 6, 0.75)";
    ctx.lineWidth = 4.0;
    ctx.strokeRect(32, 32, 960, 960);
    ctx.strokeRect(64, 64, 896, 896);

    // 3 Maglev Superconducting Slots with Cyan Aura
    const lanes = [170, 512, 854];
    for (const lx of lanes) {
      // Recessed groove
      ctx.fillStyle = "#E2E8F0";
      ctx.fillRect(lx - 10, 0, 20, 1024);
      // Gold trim lines
      ctx.fillStyle = "#F59E0B";
      ctx.fillRect(lx - 10, 0, 2, 1024);
      ctx.fillRect(lx + 8, 0, 2, 1024);
      // Cyan beam
      ctx.fillStyle = "rgba(0, 229, 255, 0.9)";
      ctx.fillRect(lx - 2, 0, 4, 1024);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set("complex_marble_road", texture);
    return texture;
  }

  /**
   * 16. The Complex - Crystal Cyan Hydroponic Water Caustics
   */
  getComplexWaterTexture() {
    if (this.cache.has("complex_water")) return this.cache.get("complex_water");

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // Deep Aqua-Cyan Water Gradient
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, "#0891B2");
    grad.addColorStop(0.5, "#06B6D4");
    grad.addColorStop(1, "#0284C7");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Animated Caustic Rings / Ripple Network
    ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
    ctx.lineWidth = 2.0;
    for (let i = 0; i < 28; i++) {
      ctx.beginPath();
      const cx = (i * 73) % 512;
      const cy = (i * 97) % 512;
      const r = 24 + (i % 5) * 12;
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set("complex_water", texture);
    return texture;
  }

  /**
   * 17. The Complex - Fluted Greco-Futuristic Colonnade Pillar
   */
  getComplexColonnadeTexture() {
    if (this.cache.has("complex_colonnade")) return this.cache.get("complex_colonnade");

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#F1F5F9";
    ctx.fillRect(0, 0, 512, 512);

    // Vertical Fluting Grooves
    const fluteWidth = 32;
    for (let x = 0; x < 512; x += fluteWidth) {
      const g = ctx.createLinearGradient(x, 0, x + fluteWidth, 0);
      g.addColorStop(0, "#E2E8F0");
      g.addColorStop(0.5, "#FFFFFF");
      g.addColorStop(1, "#CBD5E1");
      ctx.fillStyle = g;
      ctx.fillRect(x, 0, fluteWidth, 512);

      // Gold inlay rib
      ctx.fillStyle = "#D97706";
      ctx.fillRect(x, 0, 1.5, 512);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set("complex_colonnade", texture);
    return texture;
  }

  /**
   * 18. The Complex - Elysian Hydroponic Garden Topiary & Foliage
   */
  getComplexHedgeTexture() {
    if (this.cache.has("complex_hedge")) return this.cache.get("complex_hedge");

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // Deep Emerald Botanical Base
    ctx.fillStyle = "#064E3B";
    ctx.fillRect(0, 0, 512, 512);

    // Leaf cluster stippling with vibrant jade & gold flecks
    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = 2 + Math.random() * 3.5;
      const palette = ["#047857", "#10B981", "#34D399", "#059669", "#F59E0B"];
      ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set("complex_hedge", texture);
    return texture;
  }

  /**
   * 19. The Complex - Rushing Cascading Waterfall Texture (Animated Vertical Streams & White Foam)
   */
  getComplexWaterfallTexture() {
    if (this.cache.has("complex_waterfall")) return this.cache.get("complex_waterfall");

    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // Base translucent deep azure-cyan torrent gradient
    const grad = ctx.createLinearGradient(0, 0, 256, 0);
    grad.addColorStop(0, "#0369A1");
    grad.addColorStop(0.3, "#0284C7");
    grad.addColorStop(0.7, "#0EA5E9");
    grad.addColorStop(1, "#0369A1");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 512);

    // Vertical falling water ribbons and foam streamers
    for (let i = 0; i < 120; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 512;
      const w = 1.5 + Math.random() * 3.5;
      const h = 40 + Math.random() * 120;
      const alpha = 0.35 + Math.random() * 0.55;
      ctx.fillStyle = `rgba(240, 253, 250, ${alpha})`;
      ctx.fillRect(x, y, w, h);
    }

    // Frothy water spray speckles
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    for (let i = 0; i < 600; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 512;
      const r = 0.8 + Math.random() * 1.6;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set("complex_waterfall", texture);
    return texture;
  }

  /**
   * 20. The Complex - Organic Tree Bark Texture
   */
  getComplexBarkTexture() {
    if (this.cache.has("complex_bark")) return this.cache.get("complex_bark");

    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#2D1F15";
    ctx.fillRect(0, 0, 256, 512);

    // Vertical furrow bark striations
    for (let x = 0; x < 256; x += 4) {
      const shade = Math.floor(25 + Math.random() * 25);
      ctx.fillStyle = `rgb(${shade + 18}, ${shade + 8}, ${shade})`;
      ctx.fillRect(x, 0, 3, 512);
    }

    // Moss and lichen patches
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 512;
      ctx.fillStyle = "rgba(45, 106, 79, 0.4)";
      ctx.fillRect(x, y, 6, 14);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set("complex_bark", texture);
    return texture;
  }
}

export const textureGen = new TextureGenerator();
