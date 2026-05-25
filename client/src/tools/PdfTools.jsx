import React from 'react';
import JSZip from 'jszip';
import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';
import { ArrowDown, ArrowUp, Download, FileText, Loader2, X } from 'lucide-react';
import { downloadBlob, fileToArrayBuffer, formatBytes } from '../utils/files.js';

export const PDF_TOOLS = [
  { id: 'merge-pdf', title: 'Merge PDF', description: 'Combine multiple PDF files into one.' },
  { id: 'split-pdf', title: 'Split PDF', description: 'Split PDF pages into separate or grouped PDF files.' },
  { id: 'extract-pages', title: 'Extract PDF Pages', description: 'Extract selected page range from PDF.' },
  { id: 'remove-pages', title: 'Remove PDF Pages', description: 'Delete unwanted pages from PDF.' },
  { id: 'rotate-pdf', title: 'Rotate PDF', description: 'Rotate all PDF pages.' },
  { id: 'watermark-pdf', title: 'Add Watermark', description: 'Add text watermark to every page.' },
  { id: 'page-numbers', title: 'Add Page Numbers', description: 'Add page numbers to PDF.' },
  { id: 'compress-pdf', title: 'Compress PDF', description: 'Basic PDF optimization. For heavy image PDFs, advanced compression will be added soon.' }
];

function parsePages(text, total) {
  const pages = new Set();

  text
    .split(',')
    .map(x => x.trim())
    .filter(Boolean)
    .forEach(part => {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number);
        for (let i = start; i <= end; i++) {
          if (i >= 1 && i <= total) pages.add(i - 1);
        }
      } else {
        const n = Number(part);
        if (n >= 1 && n <= total) pages.add(n - 1);
      }
    });

  return [...pages].sort((a, b) => a - b);
}

function getButtonLabel(toolId) {
  const labels = {
    'merge-pdf': 'Merge PDFs',
    'split-pdf': 'Split PDF',
    'extract-pages': 'Extract Pages',
    'remove-pages': 'Remove Pages',
    'rotate-pdf': 'Rotate PDF',
    'watermark-pdf': 'Add Watermark',
    'page-numbers': 'Add Page Numbers',
    'compress-pdf': 'Compress PDF'
  };

  return labels[toolId] || 'Run Tool';
}

function buildSplitGroups(totalPages, splitMode, splitEvery) {
  if (splitMode === 'each') {
    return Array.from({ length: totalPages }, (_, index) => [index]);
  }

  const groupSize = Number(splitEvery);

  if (!Number.isInteger(groupSize) || groupSize < 1) {
    throw new Error('Please enter a valid divide number.');
  }

  if (groupSize >= totalPages) {
    throw new Error(`Divide by value must be less than total pages. This PDF has ${totalPages} pages.`);
  }

  const fullGroups = Math.floor(totalPages / groupSize);
  const remainder = totalPages % groupSize;
  const groups = [];
  let cursor = 0;

  for (let i = 0; i < fullGroups; i++) {
    const isLastGroup = i === fullGroups - 1;
    const currentGroupSize = isLastGroup ? groupSize + remainder : groupSize;

    const group = Array.from({ length: currentGroupSize }, (_, offset) => cursor + offset);
    groups.push(group);

    cursor += currentGroupSize;
  }

  return groups;
}

export default function PdfTools({ tool }) {
  const [files, setFiles] = React.useState([]);
  const [pages, setPages] = React.useState('1-2');
  const [angle, setAngle] = React.useState('90');
  const [watermark, setWatermark] = React.useState('CONFIDENTIAL');
  const [splitMode, setSplitMode] = React.useState('each');
  const [splitEvery, setSplitEvery] = React.useState('2');
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [previewUrl, setPreviewUrl] = React.useState('');

  const multiple = tool.id === 'merge-pdf';
  const buttonLabel = getButtonLabel(tool.id);

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function showPreview(blob) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(blob));
  }

  function handleFilesChange(event) {
    setFiles(Array.from(event.target.files || []));
    setMessage('');

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
  }

  function moveFile(index, direction) {
    setFiles(prev => {
      const next = [...prev];
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= next.length) return prev;

      const selectedFile = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = selectedFile;

      return next;
    });

    setMessage('');
    setPreviewUrl('');
  }

  function removeFile(indexToRemove) {
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setMessage('');
    setPreviewUrl('');
  }

  function validateBeforeRun() {
    if (!files.length) {
      return 'Please choose PDF file first.';
    }

    if (tool.id === 'merge-pdf' && files.length < 2) {
      return 'Please upload two PDFs to merge.';
    }

    return '';
  }

  async function run() {
    const validationError = validateBeforeRun();

    if (validationError) {
      setMessage(validationError);
      setPreviewUrl('');
      return;
    }

    setLoading(true);
    setMessage('');
    setPreviewUrl('');

    try {
      let blob;

      if (tool.id === 'merge-pdf') {
        const out = await PDFDocument.create();

        for (const file of files) {
          const src = await PDFDocument.load(await fileToArrayBuffer(file));
          const copied = await out.copyPages(src, src.getPageIndices());
          copied.forEach(page => out.addPage(page));
        }

        blob = new Blob([await out.save()], { type: 'application/pdf' });
        downloadBlob(blob, 'merged.pdf');
        showPreview(blob);
      }

      if (tool.id === 'split-pdf') {
        const src = await PDFDocument.load(await fileToArrayBuffer(files[0]));
        const totalPages = src.getPageCount();

        if (totalPages <= 1) {
          throw new Error('Please upload a PDF with more than 1 page to split.');
        }

        const groups = buildSplitGroups(totalPages, splitMode, splitEvery);
        const zip = new JSZip();

        for (let i = 0; i < groups.length; i++) {
          const out = await PDFDocument.create();
          const copied = await out.copyPages(src, groups[i]);

          copied.forEach(page => out.addPage(page));

          const firstPage = groups[i][0] + 1;
          const lastPage = groups[i][groups[i].length - 1] + 1;

          const fileName =
            splitMode === 'each'
              ? `page-${firstPage}.pdf`
              : `part-${i + 1}-pages-${firstPage}-to-${lastPage}.pdf`;

          zip.file(fileName, await out.save());
        }

        blob = await zip.generateAsync({ type: 'blob' });

        const zipName =
          splitMode === 'each'
            ? 'split-each-page.zip'
            : `split-divide-by-${splitEvery}.zip`;

        downloadBlob(blob, zipName);

        setMessage(`Done. Created ${groups.length} PDF files inside ZIP. Output size: ${formatBytes(blob.size)}`);
        return;
      }

      if (tool.id === 'extract-pages' || tool.id === 'remove-pages') {
        const src = await PDFDocument.load(await fileToArrayBuffer(files[0]));
        const chosen = parsePages(pages, src.getPageCount());

        const finalPages =
          tool.id === 'extract-pages'
            ? chosen
            : src.getPageIndices().filter(index => !chosen.includes(index));

        if (!finalPages.length) throw new Error('No pages selected.');

        const out = await PDFDocument.create();
        const copied = await out.copyPages(src, finalPages);
        copied.forEach(page => out.addPage(page));

        blob = new Blob([await out.save()], { type: 'application/pdf' });
        downloadBlob(blob, `${tool.id}.pdf`);
        showPreview(blob);
      }

      if (tool.id === 'rotate-pdf') {
        const src = await PDFDocument.load(await fileToArrayBuffer(files[0]));
        src.getPages().forEach(page => page.setRotation(degrees(Number(angle))));

        blob = new Blob([await src.save()], { type: 'application/pdf' });
        downloadBlob(blob, 'rotated.pdf');
        showPreview(blob);
      }

      if (tool.id === 'watermark-pdf') {
        const src = await PDFDocument.load(await fileToArrayBuffer(files[0]));
        const font = await src.embedFont(StandardFonts.HelveticaBold);

        src.getPages().forEach(page => {
          const { width, height } = page.getSize();

          page.drawText(watermark, {
            x: width * 0.18,
            y: height * 0.48,
            size: Math.max(28, width / 13),
            font,
            color: rgb(0.85, 0.15, 0.12),
            opacity: 0.22,
            rotate: degrees(35)
          });
        });

        blob = new Blob([await src.save()], { type: 'application/pdf' });
        downloadBlob(blob, 'watermarked.pdf');
        showPreview(blob);
      }

      if (tool.id === 'page-numbers') {
        const src = await PDFDocument.load(await fileToArrayBuffer(files[0]));
        const font = await src.embedFont(StandardFonts.Helvetica);

        src.getPages().forEach((page, index) => {
          const { width } = page.getSize();

          page.drawText(`${index + 1}`, {
            x: width / 2 - 8,
            y: 22,
            size: 12,
            font,
            color: rgb(0.15, 0.15, 0.15)
          });
        });

        blob = new Blob([await src.save()], { type: 'application/pdf' });
        downloadBlob(blob, 'page-numbers.pdf');
        showPreview(blob);
      }

      if (tool.id === 'compress-pdf') {
        const src = await PDFDocument.load(await fileToArrayBuffer(files[0]));

        blob = new Blob([await src.save({ useObjectStreams: true })], {
          type: 'application/pdf'
        });

        downloadBlob(blob, 'compressed.pdf');
        showPreview(blob);
      }

      setMessage(`Done. ${blob ? `Output size: ${formatBytes(blob.size)}` : ''}`);
    } catch (err) {
      setMessage(err.message || 'PDF tool failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="workspace">
      <label className="dropzone">
        <FileText size={34} />
        <strong>
          {files.length
            ? `${files.length} PDF file(s) selected`
            : multiple
              ? 'Choose PDF files'
              : 'Choose PDF file'}
        </strong>
        <span>
          {multiple
            ? 'Select at least 2 PDFs. You can reorder before merging.'
            : tool.id === 'split-pdf'
              ? 'Upload a PDF with more than 1 page.'
              : 'Single PDF file'}
        </span>
        <input
          type="file"
          accept="application/pdf,.pdf"
          multiple={multiple}
          onChange={handleFilesChange}
        />
      </label>

      {files.length ? (
        <div className="file-list">
          {multiple ? (
            <div className="merge-order-note">
              <strong>Merge order</strong>
              <span>PDFs will be merged in this exact order.</span>
            </div>
          ) : null}

          {files.map((file, index) => (
            <div className="file-row reorder-file-row" key={`${file.name}-${index}`}>
              <div className="file-name-block">
                <strong>{index + 1}. {file.name}</strong>
                <span>{formatBytes(file.size)}</span>
              </div>

              {multiple ? (
                <div className="merge-order-actions">
                  <button
                    type="button"
                    className="mini-action-btn"
                    onClick={() => moveFile(index, -1)}
                    disabled={index === 0}
                    title="Move up"
                  >
                    <ArrowUp size={16} />
                  </button>

                  <button
                    type="button"
                    className="mini-action-btn"
                    onClick={() => moveFile(index, 1)}
                    disabled={index === files.length - 1}
                    title="Move down"
                  >
                    <ArrowDown size={16} />
                  </button>

                  <button
                    type="button"
                    className="remove-action-btn"
                    onClick={() => removeFile(index)}
                    title="Remove file"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {tool.id === 'split-pdf' ? (
        <div className="split-options-box">
          <div className="split-options-title">
            <strong>Split Options</strong>
            <span>Choose how you want to split your PDF.</span>
          </div>

          <label className="split-option-card">
            <input
              type="radio"
              name="splitMode"
              value="each"
              checked={splitMode === 'each'}
              onChange={() => setSplitMode('each')}
            />
            <div>
              <strong>Split each page separately</strong>
              <span>Every page will become a separate PDF file inside a ZIP.</span>
            </div>
          </label>

          <label className="split-option-card">
            <input
              type="radio"
              name="splitMode"
              value="divide"
              checked={splitMode === 'divide'}
              onChange={() => setSplitMode('divide')}
            />
            <div>
              <strong>Split divide by pages</strong>
              <span>Example: 12 pages ÷ 3 = 4 PDFs. 10 pages ÷ 3 = 3 PDFs, last PDF gets extra page.</span>

              {splitMode === 'divide' ? (
                <div className="split-divide-input">
                  <span>Divide by</span>
                  <input
                    type="number"
                    min="1"
                    value={splitEvery}
                    onChange={e => setSplitEvery(e.target.value)}
                    placeholder="Example: 3"
                  />
                  <small>Enter how many pages should be in each PDF group.</small>
                </div>
              ) : null}
            </div>
          </label>
        </div>
      ) : null}

      {['extract-pages', 'remove-pages'].includes(tool.id) ? (
        <label className="input-group">
          <span>Pages</span>
          <input
            value={pages}
            onChange={e => setPages(e.target.value)}
            placeholder="Example: 1,3,5-7"
          />
          <small>Use comma and ranges. Example: 1,3,5-7</small>
        </label>
      ) : null}

      {tool.id === 'rotate-pdf' ? (
        <label className="input-group">
          <span>Angle</span>
          <select value={angle} onChange={e => setAngle(e.target.value)}>
            <option value="90">90°</option>
            <option value="180">180°</option>
            <option value="270">270°</option>
          </select>
        </label>
      ) : null}

      {tool.id === 'watermark-pdf' ? (
        <label className="input-group">
          <span>Watermark text</span>
          <input value={watermark} onChange={e => setWatermark(e.target.value)} />
        </label>
      ) : null}

      <div className="actions">
        <button
          className={`primary-btn ${loading ? 'progress-btn' : ''}`}
          onClick={run}
          disabled={loading}
          style={{ '--progress-width': loading ? '80%' : '0%' }}
        >
          {loading ? <Loader2 className="spin" size={18} /> : <Download size={18} />}
          {loading ? 'Loading... 80%' : buttonLabel}
        </button>
      </div>

      {message ? (
        <div className={message.includes('failed') || message.includes('Please') || message.includes('No pages') || message.includes('valid') || message.includes('less than') ? 'error' : 'success'}>
          {message}
        </div>
      ) : null}

      {previewUrl ? (
        <iframe
          className="preview-frame"
          src={`${previewUrl}#toolbar=1&navpanes=0`}
          title="PDF preview"
        />
      ) : null}
    </div>
  );
}