import { createServer } from 'http';
import { MongoClient } from 'mongodb';

const MONGO_URI = 'mongodb://cloude:15874ads@193.168.173.80:27017/Tower?authSource=Tower';
const MONGO_COLLECTION = 'itemsV3';
const API_PORT = 3001;

let db = null;

const client = new MongoClient(MONGO_URI);
client.connect()
  .then(() => {
    db = client.db('Tower');
    console.log(`✅  MongoDB connected → Tower/${MONGO_COLLECTION}`);
  })
  .catch((err) => {
    console.error(`❌  MongoDB connection failed: ${err.message}`);
  });

function send(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

/** Read full request body as parsed JSON */
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
      catch (e) { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${API_PORT}`);

  if (url.pathname === '/api/health') {
    return send(res, 200, { ok: true, dbConnected: db !== null });
  }

  // ── GET /api/itemsV2 — list all items ──────────────────────────────────────
  if (url.pathname === '/api/itemsV2' && req.method === 'GET') {
    if (!db) return send(res, 503, { error: 'Database not connected yet' });
    try {
      const items = await db.collection(MONGO_COLLECTION).find({}).toArray();
      console.log(`Found ${items.length} items`);
      const clean = items.map(({ _id, ...rest }) => rest);
      return send(res, 200, clean);
    } catch (err) {
      console.error(err);
      return send(res, 500, { error: err.message });
    }
  }

  // ── POST /api/itemsV2 — create new item ───────────────────────────────────
  if (url.pathname === '/api/itemsV2' && req.method === 'POST') {
    if (!db) return send(res, 503, { error: 'Database not connected yet' });
    try {
      const item = await readBody(req);
      if (!item.name) return send(res, 400, { error: 'Item must have a name' });
      // Check for duplicate name
      const existing = await db.collection(MONGO_COLLECTION).findOne({ name: item.name });
      if (existing) return send(res, 409, { error: `Item "${item.name}" already exists. Use PUT to update.` });
      await db.collection(MONGO_COLLECTION).insertOne(item);
      console.log(`✅  Created item "${item.name}"`);
      return send(res, 201, { ok: true, name: item.name });
    } catch (err) {
      console.error(err);
      return send(res, 500, { error: err.message });
    }
  }

  // ── PUT /api/itemsV2/:name — update existing item ─────────────────────────
  const putMatch = url.pathname.match(/^\/api\/itemsV2\/(.+)$/);
  if (putMatch && req.method === 'PUT') {
    if (!db) return send(res, 503, { error: 'Database not connected yet' });
    try {
      const name = decodeURIComponent(putMatch[1]);
      const item = await readBody(req);
      const result = await db.collection(MONGO_COLLECTION).replaceOne(
        { name },
        { ...item, name },
        { upsert: true }
      );
      const action = result.upsertedCount > 0 ? 'Created' : 'Updated';
      console.log(`✅  ${action} item "${name}"`);
      return send(res, 200, { ok: true, action: action.toLowerCase(), name });
    } catch (err) {
      console.error(err);
      return send(res, 500, { error: err.message });
    }
  }

  send(res, 404, { error: `Unknown route: ${url.pathname}` });
});

server.listen(API_PORT, () => {
  console.log(`🚀  API server listening on http://localhost:${API_PORT}`);
});
