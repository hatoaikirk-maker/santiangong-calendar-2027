// 後端：本機預覽用的靜態伺服器＋日曆 API（Node.js 內建模組，不需安裝任何套件）
// 啟動：node server.js　→　瀏覽器開 http://localhost:8080
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 8080;
const HOST = '127.0.0.1'; // 資安：只綁本機，不對外開放

// 只允許這些副檔名，其他一律拒絕（避免讀到 .js 原始碼以外的敏感檔）
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp',
};
const BLOCK = new Set(['server.js']); // 後端原始碼不對外提供

// 資安標頭
const SEC = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'",
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

function send(res, code, body, type) {
  res.writeHead(code, Object.assign({ 'Content-Type': type || 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }, SEC));
  res.end(body);
}

const server = http.createServer((req, res) => {
  // 只接受 GET / HEAD
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method Not Allowed');

  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { return send(res, 400, 'Bad Request'); }

  // API：回傳日曆資料
  if (pathname === '/api/days') {
    return fs.readFile(path.join(ROOT, 'days.json'), (err, buf) => err ? send(res, 500, 'Server Error') : send(res, 200, buf, TYPES['.json']));
  }

  if (pathname === '/') pathname = '/index.html';
  // 資安：擋掉空字元與路徑穿越（../）
  if (pathname.includes('\0')) return send(res, 400, 'Bad Request');
  const file = path.normalize(path.join(ROOT, pathname));
  if (!file.startsWith(ROOT + path.sep)) return send(res, 403, 'Forbidden');
  const ext = path.extname(file).toLowerCase();
  if (!TYPES[ext] || BLOCK.has(path.basename(file)) || path.basename(file).startsWith('.')) return send(res, 404, 'Not Found');

  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) return send(res, 404, 'Not Found');
    res.writeHead(200, Object.assign({ 'Content-Type': TYPES[ext], 'Content-Length': st.size, 'Cache-Control': 'no-cache' }, SEC));
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).on('error', () => res.destroy()).pipe(res);
  });
});

server.listen(PORT, HOST, () => console.log('月曆模擬已啟動：http://localhost:' + PORT));
