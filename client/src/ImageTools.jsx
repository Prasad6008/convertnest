import React from 'react';
import { Download, Image as ImageIcon, Loader2 } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import {
  downloadBlob,
  fileToDataUrl,
  formatBytes,
  imageFromFile
} from './utils/files.js';
import ImageFormatConverter from './ImageFormatConverter.jsx';

export const IMAGE_TOOLS = [
  {
    id: 'jpg-png-webp',
    title: 'Image Format Converter',
    description: 'Convert JPG, JPEG, PNG, WEBP, AVIF, TIFF, GIF, SVG and ICO formats.'
  },
  {
    id: 'image-compressor',
    title: 'Image Compressor',
    description: 'Compress images by target KB size.'
  },
  {
    id: 'image-resizer',
    title: 'Image Resizer',
    description: 'Resize image width and height.'
  },
  {
    id: 'image-to-pdf',
    title: 'Image to PDF',
    description: 'Convert JPG, PNG or WEBP images to PDF.'
  },
  {
    id: 'image-to-base64',
    title: 'Image to Base64',
    description: 'Convert an image into Base64 text.'
  },
  {
    id: 'base64-to-image',
    title: 'Base64 to Image',
    description: 'Convert Base64 text back into an image file.'
  },
  {
    id: 'image-color-picker',
    title: 'Image Color Picker',
    description: 'Preview image and pick approximate pixel color.'
  }
];

function canvasToBlob(canvas, mime, quality = 0.92) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) reject(new Error('Image conversion failed.'));
        else resolve(blob);
      },
      mime,
      quality
    );
  });
}

async function convertImage(file, options) {
  const img = await imageFromFile(file);

  const originalWidth = img.naturalWidth || img.width;
  const originalHeight = img.naturalHeight || img.height;

  const width = options.width || originalWidth;
  const height =
    options.height || Math.round((width / originalWidth) * originalHeight);

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width);
  canvas.height = Math.round(height);

  const ctx = canvas.getContext('2d');

  if (options.mime === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return canvasToBlob(canvas, options.mime, options.quality);
}

export default function ImageTools({ tool }) {
  const [files, setFiles] = React.useState([]);
  const [format, setFormat] = React.useState('image/png');
  const [quality, setQuality] = React.useState(0.82);
  const [width, setWidth] = React.useState('');
  const [height, setHeight] = React.useState('');
  const [output, setOutput] = React.useState('');
  const [preview, setPreview] = React.useState('');
  const [base64, setBase64] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState('');

  const [hoveredColor, setHoveredColor] = React.useState(null);
  const [pickedColor, setPickedColor] = React.useState(null);
  const [copiedColor, setCopiedColor] = React.useState(false);
  const [pickerTooltip, setPickerTooltip] = React.useState({ x: 0, y: 0 });

  const [targetKb, setTargetKb] = React.useState('');
  const [compressInfo, setCompressInfo] = React.useState(null);
  const [compressedBlob, setCompressedBlob] = React.useState(null);

  const [resizeInfo, setResizeInfo] = React.useState(null);
  const [resizedBlob, setResizedBlob] = React.useState(null);
  const [originalImageInfo, setOriginalImageInfo] = React.useState(null);
  const [keepAspect, setKeepAspect] = React.useState(true);

  const canvasRef = React.useRef(null);
  const pickerWrapRef = React.useRef(null);

  React.useEffect(() => {
    return () => {
      if (preview?.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  React.useEffect(() => {
    if (tool.id === 'image-color-picker' && files[0]) {
      loadColorPicker(files[0]);
    }
  }, [tool.id, files]);

  if (
    tool.id === 'jpg-png-webp' ||
    tool.id === 'image-converter' ||
    tool.title?.toLowerCase().includes('image format converter') ||
    tool.title?.toLowerCase().includes('jpg / png / webp')
  ) {
    return <ImageFormatConverter />;
  }

  function getExtension() {
    if (format === 'image/jpeg') return 'jpg';
    if (format === 'image/png') return 'png';
    if (format === 'image/webp') return 'webp';
    return 'png';
  }

  function resetOutput() {
    setOutput('');
    setMessage('');

    setCompressInfo(null);
    setCompressedBlob(null);

    setResizeInfo(null);
    setResizedBlob(null);

    if (preview?.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }

    setPreview('');
  }

  function clearPreviewOnly() {
    if (preview?.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }

    setPreview('');
  }

  function getOriginalKb() {
    if (!files[0]) return 0;
    return Math.ceil(files[0].size / 1024);
  }

  function clampNumber(value, min, max) {
    return Math.max(min, Math.min(max, Number(value)));
  }

  function getCompressionPercent() {
    const originalKb = getOriginalKb();

    if (!originalKb || !targetKb) return 0;

    return Math.min(100, Math.round((Number(targetKb) / originalKb) * 100));
  }

  function handleTargetKbChange(value) {
    const originalKb = getOriginalKb();

    if (value === '') {
      setTargetKb('');
      setCompressInfo(null);
      setCompressedBlob(null);
      clearPreviewOnly();
      return;
    }

    if (!originalKb) {
      setTargetKb(value);
      setCompressInfo(null);
      setCompressedBlob(null);
      clearPreviewOnly();
      return;
    }

    const maxKb = Math.max(1, originalKb - 1);
    const nextValue = clampNumber(value || 1, 1, maxKb);

    setTargetKb(String(nextValue));
    setCompressInfo(null);
    setCompressedBlob(null);
    clearPreviewOnly();
  }

  function getCompressOutputMime(file) {
    if (file?.type === 'image/png') return 'image/webp';
    if (file?.type === 'image/webp') return 'image/webp';
    return 'image/jpeg';
  }

  function getCompressExtension(mime) {
    if (mime === 'image/webp') return 'webp';
    if (mime === 'image/png') return 'png';
    return 'jpg';
  }

  async function canvasToCompressedBlob(canvas, mime, qualityValue) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        blob => {
          if (!blob) reject(new Error('Compression failed.'));
          else resolve(blob);
        },
        mime,
        qualityValue
      );
    });
  }

  async function compressImageToTarget(file, targetSizeKb) {
    const img = await imageFromFile(file);

    const outputMime = getCompressOutputMime(file);
    const targetBytes = Number(targetSizeKb) * 1024;

    let scale = 1;
    let bestBlob = null;
    let bestQuality = 0.9;
    let finalWidth = img.naturalWidth || img.width;
    let finalHeight = img.naturalHeight || img.height;

    for (let scaleTry = 0; scaleTry < 9; scaleTry++) {
      const canvas = document.createElement('canvas');

      finalWidth = Math.max(
        1,
        Math.round((img.naturalWidth || img.width) * scale)
      );

      finalHeight = Math.max(
        1,
        Math.round((img.naturalHeight || img.height) * scale)
      );

      canvas.width = finalWidth;
      canvas.height = finalHeight;

      const ctx = canvas.getContext('2d');

      if (outputMime === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      let low = 0.05;
      let high = 0.95;

      for (let i = 0; i < 13; i++) {
        const mid = (low + high) / 2;
        const blob = await canvasToCompressedBlob(canvas, outputMime, mid);

        if (blob.size <= targetBytes) {
          bestBlob = blob;
          bestQuality = mid;
          low = mid;
        } else {
          high = mid;
        }
      }

      if (bestBlob && bestBlob.size <= targetBytes) {
        break;
      }

      scale *= 0.88;
    }

    if (!bestBlob) {
      const canvas = document.createElement('canvas');

      canvas.width = finalWidth;
      canvas.height = finalHeight;

      const ctx = canvas.getContext('2d');

      if (outputMime === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      bestQuality = 0.05;
      bestBlob = await canvasToCompressedBlob(canvas, outputMime, bestQuality);
    }

    return {
      blob: bestBlob,
      outputMime,
      usedQuality: Math.round(bestQuality * 100),
      width: finalWidth,
      height: finalHeight,
      reachedTarget: bestBlob.size <= targetBytes
    };
  }

  function previewCompressedImage() {
    if (!preview) return;
    window.open(preview, '_blank', 'noopener,noreferrer');
  }

  function downloadCompressedImage() {
    if (!compressedBlob) return;

    const ext = getCompressExtension(compressedBlob.type || 'image/jpeg');
    downloadBlob(compressedBlob, `compressed-image.${ext}`);
  }

  function getImageOutputMime(file) {
    if (file?.type === 'image/png') return 'image/png';
    if (file?.type === 'image/webp') return 'image/webp';
    if (file?.type === 'image/jpeg' || file?.type === 'image/jpg') {
      return 'image/jpeg';
    }

    return 'image/png';
  }

  function getImageExtensionFromMime(mime) {
    if (mime === 'image/webp') return 'webp';
    if (mime === 'image/jpeg') return 'jpg';
    return 'png';
  }

  function getResizeQualityPercent() {
    return Math.round(Number(quality) * 100);
  }

  async function loadResizeMeta(file) {
    if (!file) {
      setOriginalImageInfo(null);
      return;
    }

    const img = await imageFromFile(file);

    const info = {
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height,
      size: file.size
    };

    setOriginalImageInfo(info);
    setWidth(String(info.width));
    setHeight(String(info.height));
  }

  function handleResizeWidthChange(value) {
    setWidth(value);
    setResizeInfo(null);
    setResizedBlob(null);
    clearPreviewOnly();

    if (!keepAspect || !originalImageInfo || !value) return;

    const nextHeight = Math.round(
      (Number(value) / originalImageInfo.width) * originalImageInfo.height
    );

    setHeight(String(nextHeight));
  }

  function handleResizeHeightChange(value) {
    setHeight(value);
    setResizeInfo(null);
    setResizedBlob(null);
    clearPreviewOnly();

    if (!keepAspect || !originalImageInfo || !value) return;

    const nextWidth = Math.round(
      (Number(value) / originalImageInfo.height) * originalImageInfo.width
    );

    setWidth(String(nextWidth));
  }

  async function resizeImageKeepingSameFormat(file) {
    const img = await imageFromFile(file);

    const originalWidth = img.naturalWidth || img.width;
    const originalHeight = img.naturalHeight || img.height;

    let targetWidth = width ? Number(width) : originalWidth;
    let targetHeight = height ? Number(height) : originalHeight;

    if (!targetWidth || targetWidth <= 0) {
      throw new Error('Width must be greater than 0.');
    }

    if (!targetHeight || targetHeight <= 0) {
      throw new Error('Height must be greater than 0.');
    }

    targetWidth = Math.round(targetWidth);
    targetHeight = Math.round(targetHeight);

    const canvas = document.createElement('canvas');

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');
    const outputMime = getImageOutputMime(file);

    if (outputMime === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    const blob = await canvasToBlob(canvas, outputMime, Number(quality));
    const ext = getImageExtensionFromMime(outputMime);

    const originalName = file.name.replace(/\.[^/.]+$/, '') || 'image';

    return {
      blob,
      width: targetWidth,
      height: targetHeight,
      outputMime,
      fileName: `${originalName}-resized.${ext}`
    };
  }

  function previewResizedImage() {
    if (!preview) return;
    window.open(preview, '_blank', 'noopener,noreferrer');
  }

  function downloadResizedImage() {
    if (!resizedBlob || !resizeInfo) return;
    downloadBlob(resizedBlob, resizeInfo.fileName);
  }

  async function run() {
    setLoading(true);
    setMessage('');

    try {
      if (tool.id === 'base64-to-image') {
        if (!base64.trim()) {
          throw new Error('Please paste Base64 image text first.');
        }

        const clean = base64.includes(',') ? base64.split(',')[1] : base64;
        const bytes = atob(clean);
        const buffer = new Uint8Array(bytes.length);

        for (let i = 0; i < bytes.length; i++) {
          buffer[i] = bytes.charCodeAt(i);
        }

        const blob = new Blob([buffer], { type: format });

        downloadBlob(blob, `base64-image.${getExtension()}`);
        setMessage('Image downloaded successfully.');
        return;
      }

      if (!files.length) {
        throw new Error('Please choose image file first.');
      }

      if (tool.id === 'image-to-base64') {
        const dataUrl = await fileToDataUrl(files[0]);

        setOutput(dataUrl);
        setPreview(dataUrl);
        setMessage('Base64 generated successfully.');
        return;
      }

      if (tool.id === 'image-to-pdf') {
        const pdfDoc = await PDFDocument.create();

        for (const file of files) {
          const convertedBlob = file.type.includes('png')
            ? file
            : await convertImage(file, {
                mime: 'image/jpeg',
                quality: 0.92
              });

          const imageBytes = await convertedBlob.arrayBuffer();

          const embedded = file.type.includes('png')
            ? await pdfDoc.embedPng(imageBytes)
            : await pdfDoc.embedJpg(imageBytes);

          const page = pdfDoc.addPage([embedded.width, embedded.height]);

          page.drawImage(embedded, {
            x: 0,
            y: 0,
            width: embedded.width,
            height: embedded.height
          });
        }

        const bytes = await pdfDoc.save();

        downloadBlob(
          new Blob([bytes], { type: 'application/pdf' }),
          'images-to-pdf.pdf'
        );

        setMessage('PDF downloaded successfully.');
        return;
      }

      const file = files[0];

      if (tool.id === 'image-compressor') {
        const originalKb = Math.ceil(file.size / 1024);
        const targetSizeKb = Number(targetKb);

        if (!targetSizeKb || targetSizeKb <= 0) {
          throw new Error('Please enter target size in KB.');
        }

        if (targetSizeKb >= originalKb) {
          throw new Error('Target size must be smaller than the original image size.');
        }

        const compressed = await compressImageToTarget(file, targetSizeKb);
        const blob = compressed.blob;

        clearPreviewOnly();

        const previewUrl = URL.createObjectURL(blob);

        setPreview(previewUrl);
        setCompressedBlob(blob);

        setCompressInfo({
          before: file.size,
          after: blob.size,
          targetKb: targetSizeKb,
          percent: Math.round((targetSizeKb / originalKb) * 100),
          quality: compressed.usedQuality,
          width: compressed.width,
          height: compressed.height,
          reachedTarget: compressed.reachedTarget
        });

        setMessage(
          compressed.reachedTarget
            ? 'Image compressed successfully.'
            : 'Compressed to the lowest possible size, but exact target KB could not be reached.'
        );

        return;
      }

      if (tool.id === 'image-resizer') {
        const resized = await resizeImageKeepingSameFormat(file);

        clearPreviewOnly();

        const previewUrl = URL.createObjectURL(resized.blob);

        setPreview(previewUrl);
        setResizedBlob(resized.blob);

        setResizeInfo({
          fileName: resized.fileName,
          beforeSize: file.size,
          afterSize: resized.blob.size,
          beforeWidth: originalImageInfo?.width,
          beforeHeight: originalImageInfo?.height,
          afterWidth: resized.width,
          afterHeight: resized.height,
          outputFormat: getImageExtensionFromMime(resized.outputMime).toUpperCase()
        });

        setMessage('Image resized successfully.');
        return;
      }

      const targetWidth = width ? Number(width) : undefined;
      const targetHeight = height ? Number(height) : undefined;

      if (targetWidth && targetWidth <= 0) {
        throw new Error('Width must be greater than 0.');
      }

      if (targetHeight && targetHeight <= 0) {
        throw new Error('Height must be greater than 0.');
      }

      const blob = await convertImage(file, {
        mime: format,
        quality: Number(quality),
        width: targetWidth,
        height: targetHeight
      });

      const previewUrl = URL.createObjectURL(blob);

      setPreview(previewUrl);
      setMessage(
        `Ready. Original: ${formatBytes(file.size)} · New: ${formatBytes(blob.size)}`
      );

      downloadBlob(blob, `converted-image.${getExtension()}`);
    } catch (err) {
      setMessage(err.message || 'Image conversion failed.');
    } finally {
      setLoading(false);
    }
  }

  async function loadColorPicker(file) {
    if (!file || !canvasRef.current) return;

    const img = await imageFromFile(file);
    const canvas = canvasRef.current;

    const maxWidth = 900;
    const scale = Math.min(1, maxWidth / img.naturalWidth);

    canvas.width = img.naturalWidth * scale;
    canvas.height = img.naturalHeight * scale;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  function getCanvasColor(event) {
    const canvas = canvasRef.current;

    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();

    const x = Math.floor(
      (event.clientX - rect.left) * (canvas.width / rect.width)
    );

    const y = Math.floor(
      (event.clientY - rect.top) * (canvas.height / rect.height)
    );

    if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) {
      return null;
    }

    const [r, g, b] = canvas
      .getContext('2d')
      .getImageData(x, y, 1, 1).data;

    const hex =
      '#' +
      [r, g, b]
        .map(value => value.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase();

    return {
      hex,
      rgb: `rgb(${r}, ${g}, ${b})`
    };
  }

  function moveColorPicker(event) {
    const color = getCanvasColor(event);

    if (!color || !pickerWrapRef.current) return;

    const wrapRect = pickerWrapRef.current.getBoundingClientRect();

    const localX = event.clientX - wrapRect.left;
    const localY = event.clientY - wrapRect.top;

    const tooltipWidth = 175;
    const tooltipHeight = 64;
    const gap = 16;
    const padding = 10;

    let x = localX + gap;
    let y = localY + gap;

    if (x + tooltipWidth > wrapRect.width - padding) {
      x = localX - tooltipWidth - gap;
    }

    if (y + tooltipHeight > wrapRect.height - padding) {
      y = localY - tooltipHeight - gap;
    }

    x = Math.max(padding, Math.min(x, wrapRect.width - tooltipWidth - padding));
    y = Math.max(padding, Math.min(y, wrapRect.height - tooltipHeight - padding));

    setHoveredColor(color);
    setPickerTooltip({ x, y });
  }

  function leaveColorPicker() {
    setHoveredColor(null);
  }

  function pickColor(event) {
    const color = getCanvasColor(event);

    if (!color) return;

    setPickedColor(color);
    setOutput(`${color.hex}\n${color.rgb}`);
    setCopiedColor(false);
    setMessage('');
  }

  async function copyPickedColor() {
    if (!pickedColor) return;

    try {
      await navigator.clipboard.writeText(pickedColor.hex);
      setCopiedColor(true);

      setTimeout(() => {
        setCopiedColor(false);
      }, 1400);
    } catch {
      setMessage('Copy failed. Please copy manually.');
    }
  }

  function getButtonLabel() {
    if (tool.id === 'image-compressor') return 'Compress Image';
    if (tool.id === 'image-resizer') return 'Resize Image';
    if (tool.id === 'image-to-pdf') return 'Create PDF';
    if (tool.id === 'image-to-base64') return 'Generate Base64';
    if (tool.id === 'base64-to-image') return 'Download Image';

    return 'Convert / Download';
  }

  const acceptedImages =
    'image/png,image/jpeg,image/webp,image/gif,image/svg+xml';

  return (
    <div className="workspace">
      {tool.id !== 'base64-to-image' ? (
        <label className="dropzone">
          <ImageIcon size={34} />

          <strong>
            {files.length
              ? `${files.length} image(s) selected`
              : 'Choose image file'}
          </strong>

          <span>
            JPG, JPEG, PNG, WEBP, GIF and SVG supported for these browser tools.
          </span>

          <input
            type="file"
            multiple={tool.id === 'image-to-pdf'}
            accept={acceptedImages}
            onChange={event => {
              const chosen = Array.from(event.target.files || []);

              setFiles(chosen);
              resetOutput();

              setHoveredColor(null);
              setPickedColor(null);
              setCopiedColor(false);
              setPickerTooltip({ x: 0, y: 0 });

              if (tool.id === 'image-compressor' && chosen[0]) {
                const originalKb = Math.ceil(chosen[0].size / 1024);
                setTargetKb(String(Math.max(1, Math.round(originalKb * 0.6))));
              }

              if (tool.id === 'image-resizer' && chosen[0]) {
                loadResizeMeta(chosen[0]);
              }
            }}
          />
        </label>
      ) : (
        <label className="input-group">
          <span>Paste Base64 image text</span>

          <textarea
            value={base64}
            onChange={event => setBase64(event.target.value)}
            placeholder="data:image/png;base64,..."
          />
        </label>
      )}

      {tool.id === 'image-compressor' ? (
        <div className="smart-compressor-panel">
          <div className="compress-size-row">
            <div className="compress-size-card">
              <span>Before Compress Size</span>
              <strong>
                {files[0] ? formatBytes(files[0].size) : 'Upload image'}
              </strong>
            </div>

            <div className="compress-size-card">
              <span>Output Compress Size</span>
              <strong>
                {compressInfo ? formatBytes(compressInfo.after) : 'Not compressed'}
              </strong>
            </div>
          </div>

          <div className="target-compress-card">
            <div className="target-compress-head">
              <div>
                <strong>Target Compress Size</strong>
                <span>Reduce or increase the KB value using the track.</span>
              </div>

              <b>{getCompressionPercent()}%</b>
            </div>

            <div className="target-control-row">
              <div
                className="target-range-wrap"
                style={{ '--target-progress': `${getCompressionPercent()}%` }}
              >
                <div className="target-range-track">
                  <span className="target-range-fill" />
                </div>

                <input
                  className="target-filled-range"
                  type="range"
                  min="1"
                  max={Math.max(1, getOriginalKb() - 1)}
                  value={targetKb || 1}
                  disabled={!files[0]}
                  onChange={event => handleTargetKbChange(event.target.value)}
                />
              </div>

              <div className="target-kb-input">
                <input
                  type="number"
                  min="1"
                  max={Math.max(1, getOriginalKb() - 1)}
                  value={targetKb}
                  disabled={!files[0]}
                  onChange={event => handleTargetKbChange(event.target.value)}
                  placeholder="234"
                />

                <span>KB</span>
              </div>
            </div>

            <small>
              Example: If original image is 500 KB and you set 234 KB, the image will compress close to 234 KB.
            </small>
          </div>

          {compressInfo ? (
            <div className="compress-output-card">
              <div>
                <span>Compression Completed</span>
                <strong>{formatBytes(compressInfo.after)}</strong>
                <small>
                  Target: {compressInfo.targetKb} KB · Used quality: {compressInfo.quality}%
                  {compressInfo.width && compressInfo.height
                    ? ` · ${compressInfo.width}×${compressInfo.height}px`
                    : ''}
                </small>
              </div>

              <div className="resize-actions">
                <button
                  type="button"
                  className="view-btn"
                  onClick={previewCompressedImage}
                >
                  Preview
                </button>

                <button
                  type="button"
                  className="download-btn"
                  onClick={downloadCompressedImage}
                >
                  <Download size={18} /> Download
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {tool.id === 'image-resizer' ? (
        <div className="smart-resizer-panel">
          <div className="resize-info-row">
            <div className="resize-info-card">
              <span>Original Image</span>
              <strong>
                {originalImageInfo
                  ? `${originalImageInfo.width} × ${originalImageInfo.height}px`
                  : 'Upload image'}
              </strong>
              <small>
                {files[0] ? formatBytes(files[0].size) : 'No image selected'}
              </small>
            </div>

            <div className="resize-info-card">
              <span>Output Image</span>
              <strong>
                {resizeInfo
                  ? `${resizeInfo.afterWidth} × ${resizeInfo.afterHeight}px`
                  : 'Not resized'}
              </strong>
              <small>
                {resizeInfo ? formatBytes(resizeInfo.afterSize) : 'Waiting for resize'}
              </small>
            </div>
          </div>

          <div className="resize-settings-card">
            <div className="resize-settings-head">
              <div>
                <strong>Resize Dimensions</strong>
                <span>Output format stays the same as uploaded image.</span>
              </div>

              <b>
                {files[0]
                  ? getImageExtensionFromMime(getImageOutputMime(files[0])).toUpperCase()
                  : 'FORMAT'}
              </b>
            </div>

            <div className="resize-dimension-grid">
              <label className="resize-input-box">
                <span>Width</span>

                <input
                  type="number"
                  value={width}
                  onChange={event => handleResizeWidthChange(event.target.value)}
                  placeholder="Example: 1080"
                />

                <small>px</small>
              </label>

              <label className="resize-input-box">
                <span>Height</span>

                <input
                  type="number"
                  value={height}
                  onChange={event => handleResizeHeightChange(event.target.value)}
                  placeholder="Example: 1080"
                />

                <small>px</small>
              </label>
            </div>

            <label className="aspect-check">
              <input
                type="checkbox"
                checked={keepAspect}
                onChange={event => setKeepAspect(event.target.checked)}
              />

              <span>Keep original aspect ratio</span>
            </label>
          </div>

          {['image/jpeg', 'image/webp'].includes(getImageOutputMime(files[0])) ? (
            <div className="resize-quality-card">
              <div className="resize-quality-head">
                <div>
                  <strong>Output Quality</strong>
                  <span>Lower quality gives smaller file size.</span>
                </div>

                <b>{getResizeQualityPercent()}%</b>
              </div>

              <div
                className="resize-range-wrap"
                style={{ '--resize-progress': `${getResizeQualityPercent()}%` }}
              >
                <div className="resize-range-track">
                  <span className="resize-range-fill" />
                </div>

                <input
                  className="resize-filled-range"
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.01"
                  value={quality}
                  onChange={event => {
                    setQuality(event.target.value);
                    setResizeInfo(null);
                    setResizedBlob(null);
                    clearPreviewOnly();
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="notice">
              Quality control is only needed for JPG and WEBP. PNG keeps clean image quality.
            </div>
          )}

          {resizeInfo ? (
            <div className="resize-output-card">
              <div>
                <span>Resize Completed</span>
                <strong>{resizeInfo.fileName}</strong>
                <small>
                  Before: {formatBytes(resizeInfo.beforeSize)} · After: {formatBytes(resizeInfo.afterSize)}
                </small>
              </div>

              <div className="resize-actions">
                <button
                  type="button"
                  className="view-btn"
                  onClick={previewResizedImage}
                >
                  Preview
                </button>

                <button
                  type="button"
                  className="download-btn"
                  onClick={downloadResizedImage}
                >
                  <Download size={18} /> Download
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {!['image-compressor', 'image-resizer'].includes(tool.id) ? (
        <div className="input-grid">
          {tool.id === 'base64-to-image' ? (
            <label className="input-group">
              <span>Output format</span>

              <select
                value={format}
                onChange={event => setFormat(event.target.value)}
              >
                <option value="image/png">PNG</option>
                <option value="image/jpeg">JPG</option>
                <option value="image/webp">WEBP</option>
              </select>
            </label>
          ) : null}
        </div>
      ) : null}

      {tool.id === 'image-color-picker' ? (
        <div className="color-picker-area">
          <div className="color-canvas-wrap" ref={pickerWrapRef}>
            <canvas
              ref={canvasRef}
              onMouseMove={moveColorPicker}
              onMouseLeave={leaveColorPicker}
              onClick={pickColor}
              className="color-picker-canvas"
            />

            {hoveredColor ? (
              <div
                className="color-hover-tooltip"
                style={{
                  left: `${pickerTooltip.x}px`,
                  top: `${pickerTooltip.y}px`
                }}
              >
                <span
                  className="color-hover-swatch"
                  style={{ background: hoveredColor.hex }}
                />

                <div>
                  <strong>{hoveredColor.hex}</strong>
                  <small>{hoveredColor.rgb}</small>
                </div>
              </div>
            ) : null}
          </div>

          {pickedColor ? (
            <div className="premium-picked-color-card">
              <div className="premium-color-preview">
                <span
                  className="premium-color-swatch"
                  style={{ background: pickedColor.hex }}
                />

                <div>
                  <span className="premium-color-label">Selected Color</span>
                  <strong>{pickedColor.hex}</strong>
                </div>
              </div>

              <div className="premium-color-values">
                <div className="color-value-pill">
                  <span>HEX</span>
                  <b>{pickedColor.hex}</b>
                </div>

                <div className="color-value-pill">
                  <span>RGB</span>
                  <b>{pickedColor.rgb}</b>
                </div>
              </div>

              <button
                type="button"
                className={`copy-color-btn premium-copy-btn ${copiedColor ? 'is-copied' : ''}`}
                onClick={copyPickedColor}
              >
                {copiedColor ? 'Copied ✓' : 'Copy Color'}
              </button>
            </div>
          ) : (
            <div className="color-picker-help">
              <strong>Pick a color from your image</strong>
              <span>
                Move your cursor to preview colors. Click any area to select and copy the color code.
              </span>
            </div>
          )}
        </div>
      ) : null}

      {tool.id !== 'image-color-picker' ? (
        <div className="actions">
          <button
            className={`primary-btn ${loading ? 'progress-btn' : ''}`}
            onClick={run}
            disabled={loading}
            style={{ '--progress-width': loading ? '70%' : '0%' }}
          >
            {loading ? (
              <Loader2 className="spin" size={18} />
            ) : (
              <Download size={18} />
            )}

            {loading ? 'Loading... 70%' : getButtonLabel()}
          </button>
        </div>
      ) : null}

      {message && tool.id !== 'image-color-picker' ? (
        <div
          className={
            message.includes('failed') ||
            message.includes('Please') ||
            message.includes('Target') ||
            message.includes('greater') ||
            message.includes('smaller')
              ? 'error'
              : 'success'
          }
        >
          {message}
        </div>
      ) : null}

      {message && tool.id === 'image-color-picker' ? (
        <div className="error">{message}</div>
      ) : null}

      {output && tool.id === 'image-to-base64' ? (
        <div className="output-box">{output}</div>
      ) : null}

      {preview && !['image-compressor', 'image-resizer'].includes(tool.id) ? (
        <div className="image-preview utility-card">
          <img src={preview} alt="Preview" />
        </div>
      ) : null}
    </div>
  );
}