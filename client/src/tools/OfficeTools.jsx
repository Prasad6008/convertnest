import React from 'react';
import axios from 'axios';
import { Download, FileUp, Loader2 } from 'lucide-react';
import { formatBytes } from '../utils/files.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const OFFICE_TOOLS = [
  {
    id: 'word-to-pdf',
    title: 'Word to PDF',
    description: 'Convert DOC/DOCX files to PDF.',
    endpoint: '/convert/word-to-pdf',
    accept: '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  },
  {
    id: 'ppt-to-pdf',
    title: 'PowerPoint to PDF',
    description: 'Convert PPT/PPTX files to PDF.',
    endpoint: '/convert/ppt-to-pdf',
    accept: '.ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation'
  },
  {
    id: 'excel-to-pdf',
    title: 'Excel to PDF',
    description: 'Convert XLS/XLSX files to PDF.',
    endpoint: '/convert/excel-to-pdf',
    accept: '.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  },
  {
    id: 'pdf-to-word',
    title: 'PDF to Word',
    description: 'Convert PDF to editable or exact-layout Word document.',
    endpoint: '/convert/pdf-to-word',
    accept: '.pdf,application/pdf'
  },
  {
    id: 'pdf-to-ppt',
    title: 'PDF to PowerPoint',
    description: 'Convert readable PDF text to PPTX slides.',
    endpoint: '/convert/pdf-to-ppt',
    accept: '.pdf,application/pdf'
  },
  {
    id: 'pdf-to-excel',
    title: 'PDF to Excel',
    description: 'Convert readable PDF text into XLSX.',
    endpoint: '/convert/pdf-to-excel',
    accept: '.pdf,application/pdf'
  }
];

function getButtonLabel(toolId) {
  const labels = {
    'word-to-pdf': 'Convert Word to PDF',
    'ppt-to-pdf': 'Convert PowerPoint to PDF',
    'excel-to-pdf': 'Convert Excel to PDF',
    'pdf-to-word': 'Convert PDF to Word',
    'pdf-to-ppt': 'Convert PDF to PowerPoint',
    'pdf-to-excel': 'Convert PDF to Excel'
  };

  return labels[toolId] || 'Convert File';
}

export default function OfficeTools({ tool }) {
  const [file, setFile] = React.useState(null);
  const [result, setResult] = React.useState(null);
  const [preview, setPreview] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [pdfWordMode, setPdfWordMode] = React.useState('editable');
  // const [pdfPptMode, setPdfPptMode] = React.useState('exact');
  const [pdfPptMode, setPdfPptMode] = React.useState('editable');

  const progressTimer = React.useRef(null);

  React.useEffect(() => {
    return () => {
      if (progressTimer.current) clearInterval(progressTimer.current);
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function resetOutput() {
    setError('');
    setResult(null);

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview('');
  }

  function startSoftProgress() {
    if (progressTimer.current) clearInterval(progressTimer.current);

    progressTimer.current = setInterval(() => {
      setProgress(prev => {
        if (prev < 40) return prev + 4;
        if (prev < 75) return prev + 2;
        if (prev < 94) return prev + 1;
        return prev;
      });
    }, 600);
  }

  async function run() {
    if (!file) {
      setError('Please choose a file first.');
      return;
    }

    resetOutput();

    setLoading(true);
    setProgress(8);
    startSoftProgress();

    try {
      const form = new FormData();
      form.append('file', file);

      if (tool.id === 'pdf-to-word') {
        form.append('mode', pdfWordMode);
      }

      if (tool.id === 'pdf-to-ppt') {
        form.append('mode', pdfPptMode);
      }

      const response = await axios.post(`${API_URL}${tool.endpoint}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: event => {
          if (!event.total) return;

          const upload = Math.round((event.loaded * 100) / event.total);
          const mappedProgress = Math.min(55, 8 + Math.round(upload * 0.47));

          setProgress(prev => Math.max(prev, mappedProgress));
        }
      });

      setProgress(100);
      setResult(response.data);

      if (response.data?.fileName?.toLowerCase().endsWith('.pdf')) {
        const blobResponse = await axios.get(response.data.downloadUrl, {
          responseType: 'blob'
        });

        const blob = new Blob([blobResponse.data], { type: 'application/pdf' });
        setPreview(URL.createObjectURL(blob));
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Conversion failed.');
    } finally {
      if (progressTimer.current) clearInterval(progressTimer.current);

      setTimeout(() => {
        setProgress(0);
      }, 900);

      setLoading(false);
    }
  }

  return (
    <div className="workspace">
      <label className="dropzone">
        <FileUp size={34} />
        <strong>{file ? file.name : 'Choose file'}</strong>
        <span>{file ? formatBytes(file.size) : 'Upload supported document'}</span>

        <input
          type="file"
          accept={tool.accept}
          onChange={event => {
            setFile(event.target.files?.[0] || null);
            resetOutput();
          }}
        />
      </label>

      {tool.id === 'pdf-to-word' ? (
  <div className="conversion-mode-box">
    <div className="conversion-mode-head">
      <strong>PDF to Word Mode</strong>
      <span>Choose editability or exact design.</span>
    </div>

    <label className="conversion-mode-card">
      <input
        type="radio"
        name="pdfWordMode"
        value="editable"
        checked={pdfWordMode === 'editable'}
        onChange={() => setPdfWordMode('editable')}
      />

      <div>
        <strong>Editable Word</strong>
        <span>
          Best when you want to edit the text. Layout, spacing, tables and images may slightly change.
        </span>
      </div>
    </label>

    <label className="conversion-mode-card">
      <input
        type="radio"
        name="pdfWordMode"
        value="exact"
        checked={pdfWordMode === 'exact'}
        onChange={() => setPdfWordMode('exact')}
      />

      <div>
        <strong>Exact Layout Word</strong>
        <span>
          Looks almost exactly like the PDF. Text becomes image-based and not fully editable.
        </span>
      </div>
    </label>
  </div>
) : null}

          {tool.id === 'pdf-to-ppt' ? (
            <div className="conversion-mode-box">
              <div className="conversion-mode-head">
                <strong>PDF to PowerPoint Mode</strong>
                <span>Choose editability or exact design.</span>
              </div>

              <label className="conversion-mode-card">
                <input
                  type="radio"
                  name="pdfPptMode"
                  value="editable"
                  checked={pdfPptMode === 'editable'}
                  onChange={() => setPdfPptMode('editable')}
                />

                <div>
                  <strong>Editable PPT</strong>
                  <span>
                    Text can be edited. Best for content editing, but layout, fonts, images and spacing may change.
                  </span>
                </div>
              </label>

              <label className="conversion-mode-card">
                <input
                  type="radio"
                  name="pdfPptMode"
                  value="exact"
                  checked={pdfPptMode === 'exact'}
                  onChange={() => setPdfPptMode('exact')}
                />

                <div>
                  <strong>Exact Layout PPT</strong>
                  <span>
                    Looks almost exactly like the PDF. Each page becomes a full slide image, so text is not editable.
                  </span>
                </div>
              </label>
            </div>
          ) : null}

          {!['pdf-to-word', 'pdf-to-ppt'].includes(tool.id) ? (
            // <div className="notice">
            //   Word/PPT/Excel to PDF needs LibreOffice on the backend.
            // </div>
          ) : null}

      <button
        className={`primary-btn ${loading ? 'progress-btn' : ''}`}
        disabled={loading}
        onClick={run}
        style={{ '--progress-width': `${progress}%` }}
      >
        {loading ? <Loader2 className="spin" size={18} /> : <Download size={18} />}
        {loading ? `Loading... ${progress}%` : getButtonLabel(tool.id)}
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

          <a
            className="download-btn"
            href={result.downloadUrl}
            target="_blank"
            rel="noreferrer"
            download
          >
            <Download size={18} /> Download
          </a>
        </div>
      ) : null}

      {preview ? (
        <iframe
          className="preview-frame"
          src={`${preview}#toolbar=1&navpanes=0`}
          title="PDF preview"
        />
      ) : null}
    </div>
  );
}
