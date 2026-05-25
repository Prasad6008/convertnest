import express from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs/promises';
import { randomUUID } from 'node:crypto';

import {
  convertWithLibreOffice,
  ensureStorage,
  outputsDir,
  publicDownloadUrl,
  pdfToDocx,
  pdfToExcel,
  pdfToPptEditable,
  pdfToPptExact
} from '../utils/office.js';

import { logUsage } from '../utils/logUsage.js';

const router = express.Router();
await ensureStorage();

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    await ensureStorage();
    cb(null, 'storage/uploads');
  },
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${randomUUID()}${path.extname(file.originalname)}`)
});

const upload = multer({
  storage,
  limits: { fileSize: Number(process.env.MAX_FILE_MB || 60) * 1024 * 1024 }
});

function scheduleDelete(filePath) {
  setTimeout(() => fs.unlink(filePath).catch(() => {}), 60 * 60 * 1000);
}

async function respondWithFile(req, res, outputPath, tool) {
  const stats = await fs.stat(outputPath);
  const uniqueName = `${tool}-${Date.now()}-${path.basename(outputPath).replace(/[^a-zA-Z0-9._-]/g, '')}`;
  const finalPath = path.join(outputsDir, uniqueName);
  if (outputPath !== finalPath) await fs.rename(outputPath, finalPath);
  scheduleDelete(finalPath);
  if (req.file?.path) scheduleDelete(req.file.path);

  await logUsage({
    tool,
    inputFileName: req.file?.originalname,
    outputFileName: uniqueName,
    inputSize: req.file?.size,
    outputSize: stats.size
  });

  res.json({
    ok: true,
    fileName: uniqueName,
    fileSizeBytes: stats.size,
    downloadUrl: publicDownloadUrl(uniqueName)
  });
}

router.post('/word-to-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'File is required.' });
    const outputPath = await convertWithLibreOffice(req.file.path);
    await respondWithFile(req, res, outputPath, 'word-to-pdf');
  } catch (error) {
    res.status(500).json({ error: error.message || 'Word to PDF failed.' });
  }
});

router.post('/ppt-to-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'File is required.' });
    const outputPath = await convertWithLibreOffice(req.file.path);
    await respondWithFile(req, res, outputPath, 'ppt-to-pdf');
  } catch (error) {
    res.status(500).json({ error: error.message || 'PowerPoint to PDF failed.' });
  }
});

router.post('/excel-to-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'File is required.' });
    const outputPath = await convertWithLibreOffice(req.file.path);
    await respondWithFile(req, res, outputPath, 'excel-to-pdf');
  } catch (error) {
    res.status(500).json({ error: error.message || 'Excel to PDF failed.' });
  }
});

router.post('/pdf-to-word', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File is required.' });
    }

    const mode = req.body.mode === 'exact' ? 'exact' : 'editable';
    const outputPath = path.join(outputsDir, `${path.parse(req.file.filename).name}.docx`);

    await pdfToDocx(req.file.path, outputPath, mode);
    await respondWithFile(req, res, outputPath, `pdf-to-word-${mode}`);
  } catch (error) {
    res.status(500).json({ error: error.message || 'PDF to Word failed.' });
  }
});

router.post('/pdf-to-ppt', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File is required.' });
    }

    const mode = req.body.mode === 'exact' ? 'exact' : 'editable';

    const outputPath = path.join(
      outputsDir,
      `${path.parse(req.file.filename).name}.pptx`
    );

    if (mode === 'exact') {
      await pdfToPptExact(req.file.path, outputPath);
    } else {
      await pdfToPptEditable(req.file.path, outputPath);
    }

    await respondWithFile(req, res, outputPath, `pdf-to-ppt-${mode}`);
  } catch (error) {
    res.status(500).json({
      error: error.message || 'PDF to PowerPoint failed.'
    });
  }
});

router.post('/pdf-to-excel', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File is required.' });
    }

    const outputPath = path.join(
      outputsDir,
      `${path.parse(req.file.filename).name}.xlsx`
    );

    await pdfToExcel(req.file.path, outputPath);
    await respondWithFile(req, res, outputPath, 'pdf-to-excel');
  } catch (error) {
    res.status(500).json({
      error: error.message || 'PDF to Excel failed.'
    });
  }
});

export default router;
