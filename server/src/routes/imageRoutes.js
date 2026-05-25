import express from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

import {
  ensureStorage,
  outputsDir
} from '../utils/office.js';

const router = express.Router();

const uploadsDir = path.resolve('storage/uploads');

await ensureStorage();
await fs.mkdir(uploadsDir, { recursive: true });
await fs.mkdir(outputsDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase();
      cb(null, `${randomUUID()}${ext}`);
    }
  }),
  limits: {
    fileSize: Number(process.env.MAX_FILE_MB || 60) * 1024 * 1024
  }
});

const allowedOutputFormats = new Set([
  'jpg',
  'jpeg',
  'png',
  'webp',
  'avif',
  'tiff',
  'gif',
  'ico'
]);

function safeFileName(name) {
  return String(name || 'converted')
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-z0-9-_]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'converted';
}

function getBaseUrl(req) {
  return process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
}

async function makeIco(inputPath, outputPath) {
  const tempDir = path.join(uploadsDir, `ico-${randomUUID()}`);
  await fs.mkdir(tempDir, { recursive: true });

  const sizes = [16, 32, 48, 64, 128, 256];
  const pngPaths = [];

  for (const size of sizes) {
    const pngPath = path.join(tempDir, `${size}.png`);

    await sharp(inputPath)
      .rotate()
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(pngPath);

    pngPaths.push(pngPath);
  }

  const icoBuffer = await pngToIco(pngPaths);
  await fs.writeFile(outputPath, icoBuffer);

  await fs.rm(tempDir, { recursive: true, force: true });
}

async function convertImage(inputPath, outputPath, format, quality) {
  const q = Math.max(1, Math.min(100, Number(quality || 90)));

  if (format === 'ico') {
    await makeIco(inputPath, outputPath);
    return;
  }

  let image = sharp(inputPath, {
    animated: format === 'gif'
  }).rotate();

  if (format === 'jpg' || format === 'jpeg') {
    await image
      .flatten({ background: '#ffffff' })
      .jpeg({ quality: q, mozjpeg: true })
      .toFile(outputPath);
    return;
  }

  if (format === 'png') {
    await image
      .png({ quality: q, compressionLevel: 9 })
      .toFile(outputPath);
    return;
  }

  if (format === 'webp') {
    await image
      .webp({ quality: q })
      .toFile(outputPath);
    return;
  }

  if (format === 'avif') {
    await image
      .avif({ quality: q })
      .toFile(outputPath);
    return;
  }

  if (format === 'tiff') {
    await image
      .tiff({ quality: q })
      .toFile(outputPath);
    return;
  }

  if (format === 'gif') {
    await image
      .gif()
      .toFile(outputPath);
    return;
  }

  throw new Error('Unsupported output format.');
}

router.post('/convert', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required.' });
    }

    const format = String(req.body.format || 'png').toLowerCase();

    if (!allowedOutputFormats.has(format)) {
      return res.status(400).json({ error: 'Unsupported output format.' });
    }

    const ext = format === 'jpeg' ? 'jpg' : format;
    const baseName = safeFileName(req.file.originalname);
    const outputFileName = `${baseName}-${Date.now()}.${ext}`;
    const outputPath = path.join(outputsDir, outputFileName);

    await convertImage(req.file.path, outputPath, format, req.body.quality);

    const stat = await fs.stat(outputPath);

    return res.json({
      fileName: outputFileName,
      fileSizeBytes: stat.size,
      downloadUrl: `${getBaseUrl(req)}/downloads/${outputFileName}`
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Image conversion failed.'
    });
  }
});

export default router;