import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

import { PDFParse } from 'pdf-parse';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import pptxgen from 'pptxgenjs';
import XLSX from 'xlsx';

export const uploadsDir = path.resolve('storage/uploads');
export const outputsDir = path.resolve('storage/outputs');

export async function ensureStorage() {
  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.mkdir(outputsDir, { recursive: true });
}

export function publicDownloadUrl(fileName) {
  const base = process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
  return `${base}/downloads/${encodeURIComponent(fileName)}`;
}

export async function convertWithLibreOffice(inputPath) {
  await ensureStorage();
  const soffice = process.env.LIBREOFFICE_PATH || 'soffice';

  await new Promise((resolve, reject) => {
    const child = spawn(soffice, [
      '--headless',
      '--nologo',
      '--nofirststartwizard',
      '--convert-to', 'pdf',
      '--outdir', outputsDir,
      inputPath
    ], { windowsHide: true });

    let stderr = '';
    child.stderr.on('data', chunk => { stderr += chunk.toString(); });
    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(stderr || `LibreOffice conversion failed with code ${code}`));
    });
  });

  const parsed = path.parse(inputPath);
  const outputFile = `${parsed.name}.pdf`;
  return path.join(outputsDir, outputFile);
}

async function extractPdfText(inputPath) {
  const buffer = await fs.readFile(inputPath);
  const parser = new PDFParse({ data: buffer });
  try {
    const parsed = await parser.getText();
    return parsed.text || '';
  } finally {
    await parser.destroy();
  }
}

export async function pdfToDocx(inputPath, outputPath, mode = 'editable') {
  const pythonCommand = process.env.PYTHON_PATH || 'python';
  const scriptPath = path.resolve(process.cwd(), 'src/utils/pdfToWordPython.py');

  await new Promise((resolve, reject) => {
    const child = spawn(
      pythonCommand,
      [scriptPath, inputPath, outputPath, mode],
      { windowsHide: true }
    );

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', chunk => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', chunk => {
      stderr += chunk.toString();
    });

    child.on('error', error => {
      reject(new Error(`Python failed to start: ${error.message}`));
    });

    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(stderr || stdout || `PDF to Word failed with code ${code}`));
      }
    });
  });
}

// export async function pdfToPpt(inputPath, outputPath) {
//   const pythonCommand = process.env.PYTHON_PATH || 'python';
//   const scriptPath = path.resolve(process.cwd(), 'src/utils/pdfToPowerPointPython.py');

//   await new Promise((resolve, reject) => {
//     const child = spawn(
//       pythonCommand,
//       [scriptPath, inputPath, outputPath],
//       { windowsHide: true }
//     );

//     let stdout = '';
//     let stderr = '';

//     child.stdout.on('data', chunk => {
//       stdout += chunk.toString();
//     });

//     child.stderr.on('data', chunk => {
//       stderr += chunk.toString();
//     });

//     child.on('error', error => {
//       reject(new Error(`Python failed to start: ${error.message}`));
//     });

//     child.on('close', code => {
//       if (code === 0) {
//         resolve();
//       } else {
//         reject(new Error(stderr || stdout || `PDF to PowerPoint failed with code ${code}`));
//       }
//     });
//   });
// }

export async function pdfToExcel(inputPath, outputPath) {
  const pythonCommand = process.env.PYTHON_PATH || 'python';
  const scriptPath = path.resolve(
    process.cwd(),
    'src/utils/pdfToExcelPython.py'
  );

  await new Promise((resolve, reject) => {
    const child = spawn(
      pythonCommand,
      [scriptPath, inputPath, outputPath],
      { windowsHide: true }
    );

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', chunk => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', chunk => {
      stderr += chunk.toString();
    });

    child.on('error', error => {
      reject(new Error(`Python failed to start: ${error.message}`));
    });

    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(stderr || stdout || `PDF to Excel failed with code ${code}`));
      }
    });
  });
}


export async function pdfToPpt(inputPath, outputPath) {
  const pythonCommand = process.env.PYTHON_PATH || 'python';
  const scriptPath = path.resolve(
    process.cwd(),
    'src/utils/pdfToPowerPointPython.py'
  );

  await new Promise((resolve, reject) => {
    const child = spawn(
      pythonCommand,
      [scriptPath, inputPath, outputPath],
      { windowsHide: true }
    );

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', chunk => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', chunk => {
      stderr += chunk.toString();
    });

    child.on('error', error => {
      reject(new Error(`Python failed to start: ${error.message}`));
    });

    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(stderr || stdout || `PDF to PowerPoint failed with code ${code}`));
      }
    });
  });
}





export async function pdfToPptEditable(inputPath, outputPath) {
  const pythonCommand = process.env.PYTHON_PATH || 'python';
  const scriptPath = path.resolve(
    process.cwd(),
    'src/utils/pdfToPowerPointPython.py'
  );

  await new Promise((resolve, reject) => {
    const child = spawn(
      pythonCommand,
      [scriptPath, inputPath, outputPath, 'editable'],
      { windowsHide: true }
    );

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', chunk => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', chunk => {
      stderr += chunk.toString();
    });

    child.on('error', error => {
      reject(new Error(`Python failed to start: ${error.message}`));
    });

    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(stderr || stdout || `Editable PDF to PowerPoint failed with code ${code}`));
      }
    });
  });
}

export async function pdfToPptExact(inputPath, outputPath) {
  const pythonCommand = process.env.PYTHON_PATH || 'python';
  const scriptPath = path.resolve(
    process.cwd(),
    'src/utils/pdfToPowerPointPython.py'
  );

  await new Promise((resolve, reject) => {
    const child = spawn(
      pythonCommand,
      [scriptPath, inputPath, outputPath, 'exact'],
      { windowsHide: true }
    );

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', chunk => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', chunk => {
      stderr += chunk.toString();
    });

    child.on('error', error => {
      reject(new Error(`Python failed to start: ${error.message}`));
    });

    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(stderr || stdout || `Exact PDF to PowerPoint failed with code ${code}`));
      }
    });
  });
}
