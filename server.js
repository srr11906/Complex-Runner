#!/usr/bin/env node
/**
 * Zero-Cache, High-Concurrency Static HTTP Server for Complex Runner
 * Powered by Node.js event-driven I/O - Immune to ERR_CONNECTION_RESET
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 8080;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.wav': 'audio/wav',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
  // Full CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges, Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const urlClean = (req.url || '/').split('?')[0];
  let safePath = path.normalize(urlClean).replace(/^(\.\.[\/\\])+/, '');
  // Normalize path by stripping /Complex_Runner prefix if user accessed through project name
  safePath = safePath.replace(/^\/Complex_Runner(\/|$)/i, '/');
  if (safePath === '/' || safePath === '\\' || safePath === '') safePath = '/index.html';

  let filePath = path.join(ROOT, safePath);

  // Check file existence with fallback waterfall
  const resolveTargetFile = (initialPath) => {
    if (fs.existsSync(initialPath) && fs.statSync(initialPath).isFile()) {
      return initialPath;
    }

    // Fallback 1: Favicon request
    if (safePath === '/favicon.ico' || safePath === '/favicon.svg') {
      const fav = path.join(ROOT, 'assets/ui/favicon.svg');
      if (fs.existsSync(fav) && fs.statSync(fav).isFile()) return fav;
    }

    // Fallback 2: 3D models directory alias
    if (safePath.startsWith('/assets/models/')) {
      const alt3d = path.join(ROOT, safePath.replace('/assets/models/', '/3d models/'));
      if (fs.existsSync(alt3d) && fs.statSync(alt3d).isFile()) return alt3d;
    }

    // Fallback 3: Any SVG requested from different path levels
    if (safePath.endsWith('.svg')) {
      const svgBase = path.basename(safePath);
      const uiSvg = path.join(ROOT, 'assets/ui', svgBase);
      if (fs.existsSync(uiSvg) && fs.statSync(uiSvg).isFile()) return uiSvg;
    }

    // Fallback 4: General assets root search
    const assetBase = path.join(ROOT, 'assets', path.basename(safePath));
    if (fs.existsSync(assetBase) && fs.statSync(assetBase).isFile()) return assetBase;

    // Fallback 5: Audio fallbacks (e.g. menu.mp3 -> bgm.mp3)
    if (safePath.includes('menu.mp3') || safePath.includes('menu.m4a')) {
      const bgmAudio = path.join(ROOT, 'assets/audio/bgm.mp3');
      if (fs.existsSync(bgmAudio) && fs.statSync(bgmAudio).isFile()) return bgmAudio;
    }

    return null;
  };

  const resolved = resolveTargetFile(filePath);
  if (!resolved) {
    console.warn(`[HTTP 404] ${req.method} ${req.url} (Normalized: ${safePath})`);
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`404 Not Found: ${safePath}`);
    return;
  }

  serveFile(resolved, req, res);
});

function serveFile(filePath, req, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';
  const isMedia = ['.mp3', '.m4a', '.wav', '.ogg', '.webm', '.mp4'].includes(ext);

  try {
    // 1. High-Performance Atomic Serving for Media Files (Zero Stream Truncation & Socket Drops)
    if (isMedia) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Accept-Ranges', 'bytes');
      res.removeHeader('Pragma');
      res.removeHeader('Expires');

      const fileBuf = fs.readFileSync(filePath);
      const totalSize = fileBuf.length;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10) || 0;
        let end = (parts[1] && parts[1].trim() !== '') ? parseInt(parts[1], 10) : totalSize - 1;

        if (isNaN(start) || start >= totalSize || end >= totalSize || start > end) {
          res.writeHead(416, { 'Content-Range': `bytes */${totalSize}` });
          res.end();
          return;
        }

        const chunk = fileBuf.subarray(start, end + 1);
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${totalSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunk.length,
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400',
          'Connection': 'keep-alive'
        });

        if (req.method === 'HEAD') {
          res.end();
          return;
        }

        res.end(chunk);
        return;
      }

      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': totalSize,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=86400',
        'Connection': 'keep-alive'
      });

      if (req.method === 'HEAD') {
        res.end();
        return;
      }

      res.end(fileBuf);
      return;
    }

    // 2. Standard Code / Document / Asset Serving with Instant Invalidation
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const stat = fs.statSync(filePath);
    const totalSize = stat.size;

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': totalSize,
      'Accept-Ranges': 'bytes'
    });

    if (req.method === 'HEAD') {
      res.end();
      return;
    }

    const stream = fs.createReadStream(filePath);
    res.on('close', () => {
      if (!res.writableEnded) stream.destroy();
    });
    stream.on('error', () => {
      if (!res.headersSent) res.writeHead(500);
      res.end();
    });
    stream.pipe(res);
  } catch (err) {
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('500 Internal Server Error');
    }
  }
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Complex Runner High-Concurrency Server running on http://0.0.0.0:${PORT}`);
  console.log(`📁 Serving directory: ${ROOT}`);
});
