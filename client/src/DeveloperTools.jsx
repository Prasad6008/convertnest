import React from 'react';
import { Copy, Download, RefreshCcw } from 'lucide-react';

export const DEVELOPER_TOOLS = [
  {
    id: 'json-formatter',
    title: 'JSON Formatter',
    description: 'Beautify JSON data.'
  },
  {
    id: 'json-minifier',
    title: 'JSON Minifier',
    description: 'Minify JSON data.'
  },
  {
    id: 'json-validator',
    title: 'JSON Validator',
    description: 'Validate JSON syntax.'
  },
  {
    id: 'xml-formatter',
    title: 'XML Formatter',
    description: 'Format XML markup.'
  },
  {
    id: 'html-encoder',
    title: 'HTML Encoder',
    description: 'Convert HTML characters into entities.'
  },
  {
    id: 'html-decoder',
    title: 'HTML Decoder',
    description: 'Decode HTML entities into readable text.'
  },
  {
    id: 'url-encoder',
    title: 'URL Encoder',
    description: 'Encode text for safe URL usage.'
  },
  {
    id: 'url-decoder',
    title: 'URL Decoder',
    description: 'Decode URL encoded text.'
  },
  {
    id: 'css-minifier',
    title: 'CSS Minifier',
    description: 'Minify CSS code.'
  },
  {
    id: 'javascript-minifier',
    title: 'JavaScript Minifier',
    description: 'Minify JavaScript code.'
  },
  {
    id: 'base64-encoder',
    title: 'Base64 Encoder',
    description: 'Encode text into Base64.'
  },
  {
    id: 'base64-decoder',
    title: 'Base64 Decoder',
    description: 'Decode Base64 text.'
  },
  {
    id: 'jwt-decoder',
    title: 'JWT Decoder',
    description: 'Decode JWT header and payload.'
  },
  {
    id: 'uuid-generator',
    title: 'UUID Generator',
    description: 'Generate random UUID values.'
  },
  {
    id: 'timestamp-converter',
    title: 'Timestamp Converter',
    description: 'Convert Unix timestamp into readable date.'
  }
];

function formatJson(input) {
  if (!input.trim()) return '';
  return JSON.stringify(JSON.parse(input), null, 2);
}

function minifyJson(input) {
  if (!input.trim()) return '';
  return JSON.stringify(JSON.parse(input));
}

function validateJson(input) {
  if (!input.trim()) return '';

  const parsed = JSON.parse(input);
  const type = Array.isArray(parsed) ? 'Array' : typeof parsed;

  let extra = '';

  if (Array.isArray(parsed)) {
    extra = `Items: ${parsed.length}`;
  } else if (parsed && typeof parsed === 'object') {
    extra = `Keys: ${Object.keys(parsed).length}`;
  }

  return `✅ Valid JSON

Type: ${type}
${extra}`;
}

function formatXml(input) {
  if (!input.trim()) return '';

  const formatted = input
    .replace(/(>)(<)(\/*)/g, '$1\n$2$3')
    .split('\n');

  let indent = 0;

  return formatted
    .map(line => {
      const trimmed = line.trim();

      if (!trimmed) return '';

      if (trimmed.match(/^<\/\w/)) {
        indent = Math.max(indent - 1, 0);
      }

      const output = `${'  '.repeat(indent)}${trimmed}`;

      if (
        trimmed.match(/^<[^!?/][^>]*[^/]>/) &&
        !trimmed.match(/<\/[^>]+>$/)
      ) {
        indent += 1;
      }

      return output;
    })
    .filter(Boolean)
    .join('\n');
}

function encodeHtml(input) {
  if (!input) return '';

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function decodeHtml(input) {
  if (!input) return '';

  const textarea = document.createElement('textarea');
  textarea.innerHTML = input;
  return textarea.value;
}

function minifyCss(input) {
  if (!input.trim()) return '';

  return input
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

function minifyJs(input) {
  if (!input.trim()) return '';

  return input
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}();,:=+\-*/<>])\s*/g, '$1')
    .trim();
}

function encodeBase64(input) {
  if (!input) return '';

  try {
    return btoa(unescape(encodeURIComponent(input)));
  } catch {
    return 'Unable to encode this text.';
  }
}

function decodeBase64(input) {
  if (!input.trim()) return '';

  try {
    return decodeURIComponent(escape(atob(input.trim())));
  } catch {
    return 'Invalid Base64 text.';
  }
}

function base64UrlDecode(value) {
  const fixed = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = fixed.padEnd(fixed.length + ((4 - (fixed.length % 4)) % 4), '=');

  return decodeURIComponent(
    escape(atob(padded))
  );
}

function decodeJwt(input) {
  if (!input.trim()) return '';

  const parts = input.trim().split('.');

  if (parts.length < 2) {
    return 'Invalid JWT. JWT must contain header, payload and signature.';
  }

  try {
    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));

    return `HEADER:
${JSON.stringify(header, null, 2)}

PAYLOAD:
${JSON.stringify(payload, null, 2)}

SIGNATURE:
${parts[2] || 'No signature found'}`;
  } catch {
    return 'Invalid JWT. Unable to decode header or payload.';
  }
}

function convertTimestamp(input) {
  if (!input.trim()) {
    const now = new Date();

    return `Current Date:
${now.toString()}

Unix Timestamp:
${Math.floor(now.getTime() / 1000)}

ISO:
${now.toISOString()}`;
  }

  const raw = input.trim();
  const number = Number(raw);

  if (!Number.isNaN(number)) {
    const milliseconds = raw.length <= 10 ? number * 1000 : number;
    const date = new Date(milliseconds);

    if (Number.isNaN(date.getTime())) {
      return 'Invalid timestamp.';
    }

    return `Readable Date:
${date.toString()}

UTC:
${date.toUTCString()}

ISO:
${date.toISOString()}

Unix Seconds:
${Math.floor(date.getTime() / 1000)}

Milliseconds:
${date.getTime()}`;
  }

  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    return 'Invalid date or timestamp.';
  }

  return `Unix Seconds:
${Math.floor(date.getTime() / 1000)}

Milliseconds:
${date.getTime()}

ISO:
${date.toISOString()}`;
}

function transformDeveloperText(toolId, input) {
  try {
    switch (toolId) {
      case 'json-formatter':
        return formatJson(input);

      case 'json-minifier':
        return minifyJson(input);

      case 'json-validator':
        return validateJson(input);

      case 'xml-formatter':
        return formatXml(input);

      case 'html-encoder':
        return encodeHtml(input);

      case 'html-decoder':
        return decodeHtml(input);

      case 'url-encoder':
        return input ? encodeURIComponent(input) : '';

      case 'url-decoder':
        return input ? decodeURIComponent(input) : '';

      case 'css-minifier':
        return minifyCss(input);

      case 'javascript-minifier':
        return minifyJs(input);

      case 'base64-encoder':
        return encodeBase64(input);

      case 'base64-decoder':
        return decodeBase64(input);

      case 'jwt-decoder':
        return decodeJwt(input);

      case 'timestamp-converter':
        return convertTimestamp(input);

      default:
        return input;
    }
  } catch (error) {
    return `❌ ${error.message || 'Invalid input.'}`;
  }
}

function getStats(text) {
  return {
    lines: text ? text.split('\n').length : 0,
    characters: text.length
  };
}

function downloadTextFile(text, fileName) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

function createUuid() {
  if (crypto?.randomUUID) return crypto.randomUUID();

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;

    return value.toString(16);
  });
}

function getPlaceholder(toolId) {
  if (toolId.includes('json')) return 'Paste JSON data here...';
  if (toolId === 'xml-formatter') return 'Paste XML data here...';
  if (toolId === 'css-minifier') return 'Paste CSS code here...';
  if (toolId === 'javascript-minifier') return 'Paste JavaScript code here...';
  if (toolId === 'jwt-decoder') return 'Paste JWT token here...';
  if (toolId === 'timestamp-converter') return 'Paste Unix timestamp or date here...';

  return 'Paste data here...';
}

export default function DeveloperTools({ tool }) {
  const [input, setInput] = React.useState('');
  const [copied, setCopied] = React.useState(false);
  const [uuid, setUuid] = React.useState(createUuid);

  const isUuidTool = tool.id === 'uuid-generator';

  const output = React.useMemo(() => {
    if (isUuidTool) return uuid;

    return transformDeveloperText(tool.id, input);
  }, [tool.id, input, uuid, isUuidTool]);

  const inputStats = React.useMemo(() => getStats(input), [input]);
  const outputStats = React.useMemo(() => getStats(output), [output]);

  React.useEffect(() => {
    setInput('');
    setCopied(false);

    if (tool.id === 'uuid-generator') {
      setUuid(createUuid());
    }
  }, [tool.id]);

  React.useEffect(() => {
    setCopied(false);
  }, [input, uuid]);

  async function copyOutput() {
    if (!output.trim()) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setCopied(false);
    }
  }

  function downloadOutput() {
    if (!output.trim()) return;

    const fileName =
      tool.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'developer-output';

    downloadTextFile(output, `${fileName}.txt`);
  }

  return (
    <div className="workspace clean-dev-tool">
      {!isUuidTool ? (
        <label className="input-group clean-dev-textarea-group">
          <div className="dev-label-row">
            <span>Input</span>

            <small>
              {inputStats.characters} characters · {inputStats.lines} lines
            </small>
          </div>

          <textarea
            value={input}
            onChange={event => setInput(event.target.value)}
            placeholder={getPlaceholder(tool.id)}
          />
        </label>
      ) : (
        <div className="dev-live-note">
          <div>
            <strong>UUID generated automatically</strong>
            <span>Use refresh only when you need a new UUID.</span>
          </div>

          <button
            type="button"
            className="dev-reset-btn"
            onClick={() => setUuid(createUuid())}
          >
            <RefreshCcw size={16} />
            New UUID
          </button>
        </div>
      )}

      <div className="dev-action-buttons">
        <button
          type="button"
          className={`dev-copy-btn ${copied ? 'is-copied' : ''}`}
          onClick={copyOutput}
          disabled={!output.trim()}
        >
          <Copy size={18} />
          {copied ? 'Copied ✓' : 'Copy'}
        </button>

        <button
          type="button"
          className="dev-download-btn"
          onClick={downloadOutput}
          disabled={!output.trim()}
        >
          <Download size={18} />
          Download
        </button>
      </div>

      <label className="input-group clean-dev-textarea-group">
        <div className="dev-label-row">
          <span>Output</span>

          <small>
            {outputStats.characters} characters · {outputStats.lines} lines
          </small>
        </div>

        <textarea
          value={output}
          readOnly
          placeholder="Your result will appear here."
        />
      </label>
    </div>
  );
}