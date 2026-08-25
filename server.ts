import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { getAuth } from './src/lib/auth';
import { getNeonDb, schema } from './src/db';
import { eq } from 'drizzle-orm';
import { toNodeHandler } from 'better-auth/node';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// 1. Better-Auth API Handler
app.all('/api/auth/*', async (req, res) => {
  const auth = getAuth();
  if (!auth) {
    return res.status(503).json({
      error: 'Better-Auth is initializing or DATABASE_URL (Neon) is not configured yet.',
      requiresNeonConfig: true,
    });
  }
  return toNodeHandler(auth)(req, res);
});

// 2. Neon Database Health & Test Route
app.get('/api/neon/health', async (req, res) => {
  try {
    const db = getNeonDb();
    if (!db) {
      return res.status(200).json({
        connected: false,
        message: 'Neon DATABASE_URL non configuré. Mode local/PWA actif.',
      });
    }
    const result = await db.select().from(schema.users).limit(1);
    return res.status(200).json({
      connected: true,
      message: 'Connexion Neon PostgreSQL active et opérationnelle !',
      usersCount: result.length,
    });
  } catch (error: any) {
    return res.status(200).json({
      connected: false,
      message: error?.message || 'Erreur lors du test Neon',
    });
  }
});

// 3. Neon Products Sync API
app.get('/api/neon/products', async (req, res) => {
  try {
    const db = getNeonDb();
    if (!db) return res.json({ success: false, data: [] });
    const storeId = (req.query.storeId as string) || 'default';
    const items = await db.select().from(schema.products).where(eq(schema.products.storeId, storeId));
    return res.json({ success: true, data: items });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error?.message });
  }
});

app.post('/api/neon/products', async (req, res) => {
  try {
    const db = getNeonDb();
    if (!db) return res.json({ success: false, message: 'Neon non configuré' });
    const product = req.body;
    await db.insert(schema.products).values(product).onConflictDoUpdate({
      target: schema.products.id,
      set: product,
    });
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error?.message });
  }
});

// 4. Neon User Upsert API (Sync users from Google Login / Better-Auth)
app.post('/api/neon/sync-user', async (req, res) => {
  try {
    const db = getNeonDb();
    if (!db) return res.json({ success: false, message: 'Neon non configuré' });
    const { id, email, name, image, role, storeId, phone } = req.body;
    if (!id || !email) {
      return res.status(400).json({ success: false, error: 'id and email are required' });
    }
    await db.insert(schema.users).values({
      id,
      email,
      name: name || email.split('@')[0],
      image: image || null,
      role: role || 'ADMIN',
      storeId: storeId || null,
      phone: phone || null,
      emailVerified: true,
      updatedAt: new Date(),
    }).onConflictDoUpdate({
      target: schema.users.id,
      set: {
        name: name || email.split('@')[0],
        image: image || null,
        updatedAt: new Date(),
      },
    });
    return res.json({ success: true, message: 'Utilisateur synchronisé sur Neon' });
  } catch (error: any) {
    console.error('[Neon User Sync Error]:', error);
    return res.status(500).json({ success: false, error: error?.message });
  }
});

// 5. Vite middleware for development & Static server for production
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: 3000 },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Vendeo POS] Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
