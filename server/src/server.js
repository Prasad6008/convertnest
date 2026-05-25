import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import mongoose from 'mongoose';
import convertRoutes from './routes/convertRoutes.js';
import { ensureStorage } from './utils/office.js';
import imageRoutes from './routes/imageRoutes.js';

const app = express();
const port = process.env.PORT || 5000;

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

// app.use(cors({
//   origin(origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
//     return callback(new Error('Not allowed by CORS'));
//   },
//   credentials: true
// }));

const allowedOrigins = [
  'http://localhost:5173',
  'https://convertnest-pdf.netlify.app'
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false
  })
);

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/downloads', express.static(path.resolve('storage/outputs')));
app.use('/api/convert', convertRoutes);
app.use('/api/image', imageRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, app: 'Converters Website API' });
});

await ensureStorage();

if (process.env.MONGO_URI) {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.warn('⚠️ MongoDB connection failed. Continuing without DB logging.');
    console.warn(error.message);
  }
}

app.listen(port, () => {
  console.log(`✅ Converters API running on port ${port}`);
});
