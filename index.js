'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = parseInt(process.env.FRONTEND_PORT || '8080', 10);
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8'
};

function safeResolve(requestPath) {
  const cleanPath = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '');
  const resolved = path.normalize(path.join(ROOT, cleanPath));
  if (!resolved.startsWith(ROOT)) return null;
  return resolved;
}

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let filePath = safeResolve(decodeURIComponent(url.pathname));

  if (!filePath) {
    return send(res, 403, 'Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        const fallback = path.join(ROOT, '404.html');
        return fs.readFile(fallback, (fallbackErr, fallbackData) => {
          if (fallbackErr) return send(res, 404, 'Not found');
          send(res, 404, fallbackData, 'text/html; charset=utf-8');
        });
      }

      const ext = path.extname(filePath).toLowerCase();
      send(res, 200, data, MIME_TYPES[ext] || 'application/octet-stream');
    });
  });
});

server.listen(PORT, () => {
  console.log(`QualitetMarket frontend running on http://localhost:${PORT}`);
});
