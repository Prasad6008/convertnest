import React from 'react';
import axios from 'axios';
import { Download, FileUp, Loader2 } from 'lucide-react';
import { formatBytes } from './utils/files.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const OUTPUT_FORMATS = [
  { value: 'jpg', label: 'JPG' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png', label: 'PNG' },
  { value: 'webp', label: 'WEBP' },
  { value: 'avif', label: 'AVIF' },
  { value: 'tiff', label: 'TIFF' },
  { value: 'gif', label: 'GIF' },
  { value: 'ico', label: 'ICO' }
];

const QUALITY_FORMATS = ['jpg', 'jpeg', 'webp', 'avif', 'tiff'];

const ACCEPTED_INPUTS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.avif',
  '.tif',
  '.tiff',
  '.gif',
  '.svg'
].join(',');

function normalizeFormat(value) {
  const format = String(value || '').toLowerCase().replace('.', '');

  if (format === 'jpeg') return 'jpg';
  if (format === 'tif') return 'tiff';

  return format;
}

function getInputExtension(file) {
  if (!file?.name) return 'Not selected';

  const ext = file.name.split('.').pop();
  return ext ? ext.toUpperCase() : 'IMAGE';
}

function getInputFormat(file) {
  if (!file?.name) return '';

  const ext = file.name.split('.').pop();
  return normalizeFormat(ext);
}

function getAvailableOutputFormats(file) {
  const inputFormat = getInputFormat(file);

  if (!inputFormat) return OUTPUT_FORMATS;

  return OUTPUT_FORMATS.filter(item => {
    return normalizeFormat(item.value) !== inputFormat;
  });
}

export default function ImageFormatConverter() {
  const [file, setFile] = React.useState(null);
  const [format, setFormat] = React.useState('png');
  const [quality, setQuality] = React.useState(100);
  const [loading, setLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [result, setResult] = React.useState(null);
  const [error, setError] = React.useState('');

  const availableFormats = React.useMemo(() => {
    return getAvailableOutputFormats(file);
  }, [file]);

  const showQuality = QUALITY_FORMATS.includes(format);

  const sameFormatSelected =
    file && normalizeFormat(format) === getInputFormat(file);

  React.useEffect(() => {
    if (!file) return;

    const currentFormatAllowed = availableFormats.some(
      item => item.value === format
    );

    if (!currentFormatAllowed && availableFormats.length) {
      setFormat(availableFormats[0].value);
    }
  }, [file, availableFormats, format]);

  async function run() {
    if (!file) {
      setError('Please choose an image first.');
      return;
    }

    if (sameFormatSelected) {
      setError('Please choose a different output format.');
      return;
    }

    setError('');
    setResult(null);
    setLoading(true);
    setProgress(10);

    try {
      const form = new FormData();
      form.append('file', file);
      form.append('format', format);
      form.append('quality', String(quality));

      const response = await axios.post(`${API_URL}/image/convert`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: event => {
          if (!event.total) return;

          const upload = Math.round((event.loaded * 100) / event.total);
          setProgress(Math.min(70, 10 + Math.round(upload * 0.6)));
        }
      });

      setProgress(100);
      setResult(response.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          'Image conversion failed.'
      );
    } finally {
      setTimeout(() => setProgress(0), 900);
      setLoading(false);
    }
  }

  function viewResultFile() {
  if (!result?.downloadUrl) return;

  window.open(result.downloadUrl, '_blank', 'noopener,noreferrer');
}

async function downloadResultFile() {
  if (!result?.downloadUrl) return;

  try {
    const response = await axios.get(result.downloadUrl, {
      responseType: 'blob'
    });

    const blobUrl = URL.createObjectURL(response.data);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = result.fileName || `converted.${format}`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    setError('Download failed. Please try again.');
  }
}

  return (
    <div className="workspace image-format-workspace">
      <label className="dropzone clean-image-dropzone">
        <FileUp size={36} />

        <strong>{file ? file.name : 'Choose image file'}</strong>

        <span>
          {file
            ? `${getInputExtension(file)} · ${formatBytes(file.size)}`
            : 'Supports JPG, JPEG, PNG, WEBP, AVIF, TIFF, GIF and SVG input'}
        </span>

        <input
          type="file"
          accept={ACCEPTED_INPUTS}
          onChange={event => {
            const selectedFile = event.target.files?.[0] || null;
            const nextFormats = getAvailableOutputFormats(selectedFile);

            setFile(selectedFile);
            setResult(null);
            setError('');

            if (selectedFile && nextFormats.length) {
              setFormat(prev => {
                const isCurrentAllowed = nextFormats.some(
                  item => item.value === prev
                );

                return isCurrentAllowed ? prev : nextFormats[0].value;
              });
            }
          }}
        />
      </label>

      <div className="clean-converter-options">
        <div className="clean-option-card">
          <div>
            <span className="option-label">Input format</span>
            <strong>{getInputExtension(file)}</strong>
          </div>

          <small>Detected from uploaded file</small>
        </div>

        <div className="clean-to-badge">TO</div>

        <label className="clean-option-card">
          <div>
            <span className="option-label">Output format</span>

            <select
              value={format}
              onChange={event => {
                setFormat(event.target.value);
                setResult(null);
                setError('');
              }}
            >
              {availableFormats.map(item => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <small>
            {file
              ? `${getInputExtension(file)} to ${format.toUpperCase()}`
              : 'Choose the file type you want'}
          </small>
        </label>
      </div>

      {showQuality ? (
        <div className="quality-card">
          <div className="quality-head">
            <div>
              <strong>Output Quality</strong>
              <span>
                Higher quality gives a better image but larger file size.
              </span>
            </div>

            <b>{quality}%</b>
          </div>

          <div
            className="quality-range-wrap"
            style={{ '--quality-progress': `${quality}%` }}
          >
            <div className="quality-range-track">
              <span className="quality-range-fill" />
            </div>

            <input
              className="filled-range"
              type="range"
              min="1"
              max="100"
              value={quality}
              onChange={event => setQuality(Number(event.target.value))}
            />
          </div>
        </div>
      ) : (
        <div className="notice">
          Quality control is not needed for {format.toUpperCase()} output.
        </div>
      )}

      <button
        className={`primary-btn ${loading ? 'progress-btn' : ''}`}
        disabled={loading || sameFormatSelected}
        onClick={run}
        style={{ '--progress-width': `${progress}%` }}
      >
        {loading ? <Loader2 className="spin" size={18} /> : <Download size={18} />}
        {loading ? `Loading... ${progress}%` : `Convert to ${format.toUpperCase()}`}
      </button>

      {loading ? (
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      ) : null}

      {error ? <div className="error">{error}</div> : null}

      {result ? (
          <div className="result-card">
            <div>
              <strong>{result.fileName}</strong>
              <br />
              <span>{formatBytes(result.fileSizeBytes)}</span>
            </div>

            <div className="result-actions">
              <button
                type="button"
                className="view-btn"
                onClick={viewResultFile}
              >
                View
              </button>

              <button
                type="button"
                className="download-btn"
                onClick={downloadResultFile}
              >
                <Download size={18} /> Download
              </button>
            </div>
          </div>
        ) : null}
    </div>
  );
}