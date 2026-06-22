import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import mongoose from 'mongoose';

import convertRoutes from './routes/convertRoutes.js';
import imageRoutes from './routes/imageRoutes.js';
import { ensureStorage } from './utils/office.js';

const app = express();
const port =
  process.env.CLIENT_ORIGIN ||
  process.env.X_ZOHO_CATALYST_LISTEN_PORT ||
  process.env.PORT ||
  9000;

await ensureStorage();

const envAllowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://convertnest-pdf.netlify.app',
  ...envAllowedOrigins
];

function isAllowedOrigin(origin) {
  if (!origin) return true;

  if (allowedOrigins.includes(origin)) return true;

  // Allows Netlify deploy preview URLs like:
  // https://xxxx--convertnest-pdf.netlify.app
  if (origin.endsWith('.netlify.app')) return true;

  return false;
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      console.warn(`Blocked by CORS: ${origin}`);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/downloads', express.static(path.resolve('storage/outputs')));

/*
  Route aliases:

  Office/PDF tools:
  /api/convert/word-to-pdf
  /convert/word-to-pdf

  Image tools:
  /api/image/convert
  /image/convert
*/
// MongoDB Connection
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (mongoUri) {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.warn('⚠️ MongoDB connection failed. Continuing without DB logging.');
    console.warn(error.message);
  }
} else {
  console.warn('⚠️ No MongoDB URI found. Continuing without DB logging.');
}

// Routes:
app.use('/api/convert', convertRoutes);
app.use('/convert', convertRoutes);

app.use('/api/image', imageRoutes);
app.use('/image', imageRoutes);

app.get('/', (_req, res) => {
  res.send('✅ ConvertNest API is running');
});

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    app: 'ConvertNest API',
    port,
    allowedOrigins
  });
});

// Add this before app.listen
app.get('/api/test-db', async (_req, res) => {
  try {
    const UsageLog = (await import('./models/UsageLog.js')).default;
    console.log('readyState:', mongoose.connection.readyState);
    const doc = await UsageLog.create({ tool: 'test', inputFileName: 'test.pdf' });
    res.json({ ok: true, id: doc._id });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});



app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`✅ Allowed origins: ${allowedOrigins.join(', ')}`);
});
