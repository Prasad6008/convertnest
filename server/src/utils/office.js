import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

export const uploadsDir = path.resolve('storage/uploads');
export const outputsDir = path.resolve('storage/outputs');

const libreOfficePath =
  process.env.LIBREOFFICE_PATH ||
  (process.platform === 'win32' ? 'soffice.exe' : 'soffice');

const pythonPath =
  process.env.PYTHON_PATH ||
  (process.platform === 'win32' ? 'python' : 'python3');

export async function ensureStorage() {
  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.mkdir(outputsDir, { recursive: true });
}

export function publicDownloadUrl(fileName) {
  const base =
    process.env.PUBLIC_BASE_URL ||
    `http://localhost:${process.env.PORT || 5000}`;

  return `${base.replace(/\/$/, '')}/downloads/${encodeURIComponent(fileName)}`;
}

function runCommand(command, args, errorPrefix) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      windowsHide: true,
      env: {
        ...process.env,
        HOME: process.env.HOME || process.cwd()
      }
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', chunk => {
      stdout += chunk.toString();
    });

    child.stderr?.on('data', chunk => {
      stderr += chunk.toString();
    });

    child.on('error', error => {
      reject(new Error(`${errorPrefix} failed to start: ${error.message}`));
    });

    child.on('close', code => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(
        new Error(
          stderr ||
            stdout ||
            `${errorPrefix} failed with exit code ${code}`
        )
      );
    });
  });
}

async function findLibreOfficeOutput(inputPath) {
  const parsed = path.parse(inputPath);
  const expectedOutputPath = path.join(outputsDir, `${parsed.name}.pdf`);

  try {
    await fs.access(expectedOutputPath);
    return expectedOutputPath;
  } catch {
    // Continue searching below.
  }

  const files = await fs.readdir(outputsDir);

  const matchedFile = files.find(file => {
    const parsedFile = path.parse(file);

    return (
      parsedFile.name === parsed.name &&
      parsedFile.ext.toLowerCase() === '.pdf'
    );
  });

  if (!matchedFile) {
    throw new Error('LibreOffice finished, but output PDF was not found.');
  }

  return path.join(outputsDir, matchedFile);
}

export async function convertWithLibreOffice(inputPath) {
  await ensureStorage();

  await runCommand(
    libreOfficePath,
    [
      '--headless',
      '--nologo',
      '--nodefault',
      '--nofirststartwizard',
      '--nolockcheck',
      '--norestore',
      '--convert-to',
      'pdf',
      '--outdir',
      outputsDir,
      inputPath
    ],
    'LibreOffice conversion'
  );

  return findLibreOfficeOutput(inputPath);
}

function getPythonScriptPath(scriptFileName) {
  return path.resolve(process.cwd(), 'src/utils', scriptFileName);
}

async function runPythonScript(scriptFileName, args, errorPrefix) {
  const scriptPath = getPythonScriptPath(scriptFileName);

  try {
    await fs.access(scriptPath);
  } catch {
    throw new Error(`Python script not found: ${scriptFileName}`);
  }

  await runCommand(
    pythonPath,
    [scriptPath, ...args],
    errorPrefix
  );
}

export async function pdfToDocx(inputPath, outputPath, mode = 'editable') {
  await ensureStorage();

  await runPythonScript(
    'pdfToWordPython.py',
    [inputPath, outputPath, mode],
    'Python'
  );

  return outputPath;
}

export async function pdfToExcel(inputPath, outputPath) {
  await ensureStorage();

  await runPythonScript(
    'pdfToExcelPython.py',
    [inputPath, outputPath],
    'Python'
  );

  return outputPath;
}

export async function pdfToPpt(inputPath, outputPath, mode = 'editable') {
  await ensureStorage();

  await runPythonScript(
    'pdfToPowerPointPython.py',
    [inputPath, outputPath, mode],
    'Python'
  );

  return outputPath;
}

export async function pdfToPptx(inputPath, outputPath, mode = 'editable') {
  return pdfToPpt(inputPath, outputPath, mode);
}

export async function pdfToPptEditable(inputPath, outputPath) {
  return pdfToPpt(inputPath, outputPath, 'editable');
}

export async function pdfToPptExact(inputPath, outputPath) {
  return pdfToPpt(inputPath, outputPath, 'exact');
}
