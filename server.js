const http = require('http');
const fs = require('fs');
const path = require('path');
const { readVegetables, writeVegetables, nextId } = require('./lib/csv');
const { login, isValidToken, logout, getTokenFromCookies } = require('./lib/auth');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let chunks = '';
    req.on('data', (chunk) => {
      chunks += chunk;
      if (chunks.length > 1e6) {
        reject(new Error('Body too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(chunks));
    req.on('error', reject);
  });
}

function requireAuth(req) {
  const token = getTokenFromCookies(req.headers.cookie);
  return isValidToken(token);
}

function serveStatic(req, res, urlPath) {
  let filePath = path.join(PUBLIC_DIR, decodeURIComponent(urlPath));
  if (urlPath.endsWith('/')) filePath = path.join(filePath, 'index.html');
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const { pathname } = url;

  try {
    if (pathname === '/api/vegetables' && req.method === 'GET') {
      const all = requireAuth(req);
      const vegetables = readVegetables();
      const result = all ? vegetables : vegetables.filter((v) => v.active);
      sendJson(res, 200, result);
      return;
    }

    if (pathname === '/api/vegetables' && req.method === 'POST') {
      if (!requireAuth(req)) return sendJson(res, 401, { error: 'Nicht angemeldet' });
      const body = JSON.parse(await readBody(req));
      const vegetables = readVegetables();
      const veg = {
        id: nextId(vegetables),
        name: String(body.name || '').trim(),
        price: parseFloat(body.price) || 0,
        active: Boolean(body.active),
      };
      if (!veg.name) return sendJson(res, 400, { error: 'Name fehlt' });
      vegetables.push(veg);
      writeVegetables(vegetables);
      sendJson(res, 201, veg);
      return;
    }

    const vegMatch = pathname.match(/^\/api\/vegetables\/(\d+)$/);
    if (vegMatch && (req.method === 'PUT' || req.method === 'DELETE')) {
      if (!requireAuth(req)) return sendJson(res, 401, { error: 'Nicht angemeldet' });
      const id = vegMatch[1];
      let vegetables = readVegetables();
      const idx = vegetables.findIndex((v) => v.id === id);
      if (idx === -1) return sendJson(res, 404, { error: 'Nicht gefunden' });

      if (req.method === 'DELETE') {
        vegetables.splice(idx, 1);
        writeVegetables(vegetables);
        return sendJson(res, 200, { ok: true });
      }

      const body = JSON.parse(await readBody(req));
      vegetables[idx] = {
        ...vegetables[idx],
        name: body.name !== undefined ? String(body.name).trim() : vegetables[idx].name,
        price: body.price !== undefined ? parseFloat(body.price) : vegetables[idx].price,
        active: body.active !== undefined ? Boolean(body.active) : vegetables[idx].active,
      };
      writeVegetables(vegetables);
      sendJson(res, 200, vegetables[idx]);
      return;
    }

    if (pathname === '/api/login' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req));
      const token = login(body.password);
      if (!token) return sendJson(res, 401, { error: 'Falsches Passwort' });
      res.setHeader('Set-Cookie', `session=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=86400`);
      sendJson(res, 200, { ok: true });
      return;
    }

    if (pathname === '/api/logout' && req.method === 'POST') {
      logout(getTokenFromCookies(req.headers.cookie));
      res.setHeader('Set-Cookie', 'session=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0');
      sendJson(res, 200, { ok: true });
      return;
    }

    if (pathname === '/api/session' && req.method === 'GET') {
      sendJson(res, 200, { authenticated: requireAuth(req) });
      return;
    }

    if (req.method === 'GET') {
      serveStatic(req, res, pathname);
      return;
    }

    sendJson(res, 404, { error: 'Not found' });
  } catch (err) {
    console.error(err);
    sendJson(res, 500, { error: 'Serverfehler' });
  }
});

server.listen(PORT, () => {
  console.log(`GemueseApp läuft auf http://localhost:${PORT}`);
});
