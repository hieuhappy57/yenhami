import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const publicRoot = path.resolve(root, '../../public');
const port = Number(process.env.PORT || 3018);
const assets = new Set([
  '/brand/ha-mi-logo-mark-256.png',
  '/brand/dishes/tu-quy-an-nhien-v2.webp',
  '/brand/catalog/hu-75ml-duong-phen-v2.webp',
]);
const server = http.createServer(async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405).end('Demo only');
    return;
  }
  const url = new URL(req.url || '/', 'http://localhost');
  const assetPath = url.pathname.startsWith('/assets/') ? url.pathname.slice(7) : null;
  const file = url.pathname === '/' || url.pathname === '/index.html'
    ? path.join(root, 'index.html')
    : assetPath && assets.has(assetPath) ? path.join(publicRoot, assetPath) : null;
  if (!file) { res.writeHead(404).end('Not found'); return; }
  try {
    const data = await readFile(file);
    const type = file.endsWith('.webp') ? 'image/webp' : file.endsWith('.png') ? 'image/png' : 'text/html; charset=utf-8';
    res.writeHead(200, { 'Content-Type': type });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch { res.writeHead(404).end('Not found'); }
});
server.listen(port, '127.0.0.1', () => process.stdout.write(`Ha Mi isolated demo: http://127.0.0.1:${port}/\n`));
