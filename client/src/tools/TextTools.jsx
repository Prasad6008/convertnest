import React from 'react';
import { Copy, Download, RotateCcw } from 'lucide-react';

export const TEXT_TOOLS = [
  {
    id: 'uppercase-to-lowercase',
    title: 'Uppercase to Lowercase',
    description: 'Convert capital text into lowercase.'
  },
  {
    id: 'lowercase-to-uppercase',
    title: 'Lowercase to Uppercase',
    description: 'Convert lowercase text into uppercase.'
  },
  {
    id: 'title-case',
    title: 'Title Case Converter',
    description: 'Convert text into title case.'
  },
  {
    id: 'sentence-case',
    title: 'Sentence Case Converter',
    description: 'Convert text into sentence case.'
  },
  {
    id: 'capitalize-words',
    title: 'Capitalize Words',
    description: 'Capitalize the first letter of every word.'
  },
  {
    id: 'inverse-case',
    title: 'Inverse Case Converter',
    description: 'Swap uppercase letters to lowercase and lowercase letters to uppercase.'
  },
  {
    id: 'alternating-case',
    title: 'Alternating Case Converter',
    description: 'Convert text into alternating upper and lower case.'
  },
  {
    id: 'slug-generator',
    title: 'Slug Generator',
    description: 'Convert text into SEO friendly URL slugs.'
  },
  {
    id: 'remove-extra-spaces',
    title: 'Remove Extra Spaces',
    description: 'Clean repeated spaces and empty lines.'
  },
  {
    id: 'reverse-text',
    title: 'Reverse Text',
    description: 'Reverse the given text.'
  },
  {
    id: 'sort-lines',
    title: 'Sort Lines',
    description: 'Sort text lines alphabetically.'
  },
  {
    id: 'remove-duplicate-lines',
    title: 'Remove Duplicate Lines',
    description: 'Remove repeated lines from text.'
  },
  {
    id: 'word-counter',
    title: 'Word Counter',
    description: 'Count words, characters and lines.'
  },
  {
    id: 'text-to-base64',
    title: 'Text to Base64',
    description: 'Encode text into Base64.'
  },
  {
    id: 'base64-to-text',
    title: 'Base64 to Text',
    description: 'Decode Base64 into readable text.'
  }
];

function toTitleCase(text) {
  return text.toLowerCase().replace(/\b[\w'’-]+/g, word => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
}

function toSentenceCase(text) {
  const lower = text.toLowerCase();

  return lower.replace(/(^\s*\w|[.!?]\s*\w)/g, match => {
    return match.toUpperCase();
  });
}

function capitalizeWords(text) {
  return text.replace(/\b\w/g, char => char.toUpperCase());
}

function inverseCase(text) {
  return text
    .split('')
    .map(char => {
      const upper = char.toUpperCase();
      const lower = char.toLowerCase();

      if (char === upper && char !== lower) return lower;
      if (char === lower && char !== upper) return upper;

      return char;
    })
    .join('');
}

function alternatingCase(text) {
  let count = 0;

  return text
    .split('')
    .map(char => {
      if (!/[a-zA-Z]/.test(char)) return char;

      const output = count % 2 === 0 ? char.toLowerCase() : char.toUpperCase();
      count += 1;

      return output;
    })
    .join('');
}

function makeSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function removeExtraSpaces(text) {
  return text
    .split('\n')
    .map(line => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
}

function sortLines(text) {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
    .join('\n');
}

function removeDuplicateLines(text) {
  const seen = new Set();

  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => {
      if (!line) return false;

      const key = line.toLowerCase();

      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    })
    .join('\n');
}

function safeTextToBase64(text) {
  try {
    return btoa(unescape(encodeURIComponent(text)));
  } catch {
    return 'Unable to encode this text.';
  }
}

function safeBase64ToText(text) {
  try {
    return decodeURIComponent(escape(atob(text.trim())));
  } catch {
    return 'Invalid Base64 text.';
  }
}

function getTextStats(text) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const lines = text ? text.split('\n').length : 0;

  return {
    words,
    characters,
    charactersNoSpaces,
    lines
  };
}

function transformText(toolId, input) {
  switch (toolId) {
    case 'uppercase-to-lowercase':
      return input.toLowerCase();

    case 'lowercase-to-uppercase':
      return input.toUpperCase();

    case 'title-case':
      return toTitleCase(input);

    case 'sentence-case':
      return toSentenceCase(input);

    case 'capitalize-words':
      return capitalizeWords(input);

    case 'inverse-case':
      return inverseCase(input);

    case 'alternating-case':
      return alternatingCase(input);

    case 'slug-generator':
      return makeSlug(input);

    case 'remove-extra-spaces':
      return removeExtraSpaces(input);

    case 'reverse-text':
      return input.split('').reverse().join('');

    case 'sort-lines':
      return sortLines(input);

    case 'remove-duplicate-lines':
      return removeDuplicateLines(input);

    case 'text-to-base64':
      return safeTextToBase64(input);

    case 'base64-to-text':
      return safeBase64ToText(input);

    case 'word-counter': {
      const stats = getTextStats(input);

      return `Words: ${stats.words}
Characters: ${stats.characters}
Characters without spaces: ${stats.charactersNoSpaces}
Lines: ${stats.lines}`;
    }

    default:
      return input;
  }
}

function downloadTextFile(text, fileName = 'converted-text.txt') {
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

export default function TextTools({ tool }) {
  const [input, setInput] = React.useState('');
  const [copied, setCopied] = React.useState(false);

  const output = React.useMemo(() => {
    return transformText(tool.id, input);
  }, [tool.id, input]);

  const inputStats = React.useMemo(() => getTextStats(input), [input]);
  const outputStats = React.useMemo(() => getTextStats(output), [output]);

  React.useEffect(() => {
    setCopied(false);
  }, [tool.id, input]);

  async function copyOutput() {
    if (!output.trim()) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1400);
    } catch {
      setCopied(false);
    }
  }

  function clearText() {
    setInput('');
    setCopied(false);
  }

  function downloadOutput() {
    if (!output.trim()) return;

    const safeName = tool.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    downloadTextFile(output, `${safeName || 'converted-text'}.txt`);
  }

  return (
    <div className="workspace text-live-tool">
      <div className="text-tool-topbar">
        <div>
          <span className="live-badge">Live Converter</span>
          <strong>Automatic Conversion</strong>
          <small>Type or paste text. Output updates automatically.</small>
        </div>

        <button type="button" className="clear-text-btn" onClick={clearText}>
          <RotateCcw size={16} />
          Reset
        </button>
      </div>

      <div className="text-live-grid">
        <div className="text-panel">
          <div className="text-panel-head">
            <div>
              <span>Input Text</span>
              <strong>Paste your text</strong>
            </div>

            <div className="text-count-pill">
              {inputStats.words} words
            </div>
          </div>

          <textarea
            className="premium-textarea"
            value={input}
            onChange={event => setInput(event.target.value)}
            placeholder="Start typing here..."
          />
        </div>

        <div className="text-panel output-panel">
          <div className="text-panel-head">
            <div>
              <span>Output Text</span>
              <strong>Auto converted result</strong>
            </div>

            <div className="text-count-pill">
              {outputStats.words} words
            </div>
          </div>

          <textarea
            className="premium-textarea output-textarea"
            value={output}
            readOnly
            placeholder="Converted output will appear here..."
          />
        </div>
      </div>

      <div className="text-action-row">
        <button
          type="button"
          className={`copy-output-btn ${copied ? 'is-copied' : ''}`}
          onClick={copyOutput}
          disabled={!output.trim()}
        >
          <Copy size={18} />
          {copied ? 'Copied ✓' : 'Copy Output'}
        </button>

        <button
          type="button"
          className="download-output-btn"
          onClick={downloadOutput}
          disabled={!output.trim()}
        >
          <Download size={18} />
          Download TXT
        </button>
      </div>

      <div className="text-stats-grid">
        <div className="text-stat-card">
          <span>Input Characters</span>
          <strong>{inputStats.characters}</strong>
        </div>

        <div className="text-stat-card">
          <span>Output Characters</span>
          <strong>{outputStats.characters}</strong>
        </div>

        <div className="text-stat-card">
          <span>Input Lines</span>
          <strong>{inputStats.lines}</strong>
        </div>

        <div className="text-stat-card">
          <span>Output Lines</span>
          <strong>{outputStats.lines}</strong>
        </div>
      </div>
    </div>
  );
}