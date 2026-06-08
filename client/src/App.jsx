import React from 'react';
import {
  Calculator,
  ChevronDown,
  Code2,
  FileText,
  Home,
  Image,
  Layers,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  Type
} from 'lucide-react';

import AdSlot from './components/AdSlot.jsx';
import TextTools, { TEXT_TOOLS } from './TextTools.jsx';
import DeveloperTools, { DEVELOPER_TOOLS } from './DeveloperTools.jsx';
import ImageTools, { IMAGE_TOOLS } from './ImageTools.jsx';
import PdfTools, { PDF_TOOLS } from './PdfTools.jsx';
import OfficeTools, { OFFICE_TOOLS } from './OfficeTools.jsx';
import CalculatorTools, { CALCULATOR_TOOLS } from './CalculatorTools.jsx';
import QrTools, { QR_TOOLS } from './QrTools.jsx';

const categories = [
  { id: 'all', label: 'All Tools', icon: Layers, path: '/' },
  { id: 'pdf', label: 'PDF Tools', icon: FileText, path: '/category/pdf' },
  { id: 'office', label: 'Office Converters', icon: FileText, path: '/category/office' },
  { id: 'image', label: 'Image Tools', icon: Image, path: '/category/image' },
  { id: 'text', label: 'Text Tools', icon: Type, path: '/category/text' },
  { id: 'developer', label: 'Developer Tools', icon: Code2, path: '/category/developer' },
  { id: 'calculator', label: 'Calculators', icon: Calculator, path: '/category/calculator' },
  { id: 'qr', label: 'QR Tools', icon: QrCode, path: '/category/qr' }
];

function categoryLabel(categoryId) {
  return categories.find(category => category.id === categoryId)?.label || 'All Tools';
}

const staticPages = {
  about: {
    title: 'About ConvertNest',
    description:
      'ConvertNest is an all-in-one online tools website for PDF, image, text, developer, calculator and QR tools.',
    content:
      'ConvertNest is built to help users complete everyday file and text conversion tasks quickly. Our goal is to keep tools simple, clean and useful for students, creators, developers, businesses and general users.'
  },
  contact: {
    title: 'Contact',
    description: 'Contact ConvertNest for support, feedback or business enquiries.',
    content:
      'For support, feedback or business enquiries, contact us at hello@convertnest.com. Replace this email with your official business email before publishing.'
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    description: 'Read the ConvertNest privacy policy.',
    content:
      'ConvertNest respects user privacy. Tools that work inside the browser may process files locally. Server-based tools may upload files temporarily for conversion. Add your complete privacy policy before AdSense approval.'
  },
  'terms-and-conditions': {
    title: 'Terms & Conditions',
    description: 'Read the ConvertNest terms and conditions.',
    content:
      'By using ConvertNest, users agree to use the tools responsibly. The website is provided for general utility purposes. Add complete legal terms before public launch.'
  },
  disclaimer: {
    title: 'Disclaimer',
    description: 'Read the ConvertNest disclaimer.',
    content:
      'ConvertNest provides tools for convenience. While we try to keep outputs accurate, users should verify important files, calculations and converted documents before professional use.'
  },
  'cookie-policy': {
    title: 'Cookie Policy',
    description: 'Read the ConvertNest cookie policy.',
    content:
      'ConvertNest may use cookies for analytics, preferences and advertising after approval. Add your full cookie policy before enabling ads or tracking services.'
  }
};

const SEO_SLUGS = {
  // PDF tools
  'merge-pdf': 'merge-pdf',
  'split-pdf': 'split-pdf',
  'extract-pages': 'extract-pdf-pages',
  'remove-pages': 'remove-pdf-pages',
  'rotate-pdf': 'rotate-pdf',
  'watermark-pdf': 'watermark-pdf',
  'page-numbers': 'pdf-page-numbers',
  'compress-pdf': 'compress-pdf',

  // Image tools
  'jpg-png-webp': 'image-format-converter',
  'image-compressor': 'image-compressor',
  'image-resizer': 'image-resizer',
  'image-to-pdf': 'image-to-pdf-converter',
  'image-to-base64': 'image-to-base64-converter',
  'base64-to-image': 'base64-to-image-converter',
  'image-color-picker': 'image-color-picker',

  // Text tools
  'uppercase-to-lowercase': 'uppercase-to-lowercase-converter',
  'lowercase-to-uppercase': 'lowercase-to-uppercase-converter',
  'title-case': 'title-case-converter',
  'sentence-case': 'sentence-case-converter',
  'capitalize-words': 'capitalize-words',
  'inverse-case': 'inverse-case-converter',
  'alternating-case': 'alternating-case-converter',
  'slug-generator': 'slug-generator',
  'remove-extra-spaces': 'remove-extra-spaces',
  'reverse-text': 'reverse-text--converter',
  'sort-lines': 'sort-lines',
  'remove-duplicate-lines': 'remove-duplicate-lines',
  'word-counter': 'word-counter',
  'text-to-base64': 'text-to-base64-converter',
  'base64-to-text': 'base64-to-text-converter',

  // Developer tools
  'json-formatter': 'json-formatter',
  'json-minifier': 'json-minifier',
  'json-validator': 'json-validator',
  'xml-formatter': 'xml-formatter',
  'html-encoder': 'html-encoder',
  'html-decoder': 'html-decoder',
  'url-encoder': 'url-encoder',
  'url-decoder': 'url-decoder',
  'css-minifier': 'css-minifier',
  'javascript-minifier': 'javascript-minifier',
  'base64-encoder': 'base64-encoder',
  'base64-decoder': 'base64-decoder',
  'jwt-decoder': 'jwt-decoder',
  'uuid-generator': 'uuid-generator',
  'timestamp-converter': 'timestamp-converter',

  // Calculator tools
  'gst-calculator': 'gst-calculator',
  'emi-calculator': 'emi-calculator',
  'discount-calculator': 'discount-calculator',
  'percentage-calculator': 'percentage-calculator',
  'length-converter': 'length-converter',
  'weight-converter': 'weight-converter',
  'temperature-converter': 'temperature-converter',
  'data-storage': 'data-storage-converter',
  'date-difference': 'date-difference-calculator',
  'number-to-words': 'number-to-words-converter'
};

const SLUG_TO_TOOL_ID = Object.fromEntries(
  Object.entries(SEO_SLUGS).map(([toolId, slug]) => [slug, toolId])
);

function toolPath(toolId) {
  const slug = SEO_SLUGS[toolId] || `${toolId}-converter`;
  return `/${slug}`;
}

function toolIdFromSlug(slug) {
  if (!slug) return null;

  if (SLUG_TO_TOOL_ID[slug]) {
    return SLUG_TO_TOOL_ID[slug];
  }

  if (slug.endsWith('-converter')) {
    return slug.replace(/-converter$/, '');
  }

  if (slug.endsWith('-convertor')) {
    return slug.replace(/-convertor$/, '');
  }

  return null;
}

const allTools = [
  ...PDF_TOOLS.map(tool => ({
    ...tool,
    category: 'pdf',
    badge: 'PDF',
    icon: FileText,
    component: 'pdf'
  })),
  ...OFFICE_TOOLS.map(tool => ({
    ...tool,
    category: 'office',
    badge: 'Office',
    icon: FileText,
    component: 'office'
  })),
  ...IMAGE_TOOLS.map(tool => ({
    ...tool,
    category: 'image',
    badge: 'Image',
    icon: Image,
    component: 'image'
  })),
  ...TEXT_TOOLS.map(tool => ({
    ...tool,
    category: 'text',
    badge: 'Text',
    icon: Type,
    component: 'text'
  })),
  ...DEVELOPER_TOOLS.map(tool => ({
    ...tool,
    category: 'developer',
    badge: 'Dev',
    icon: Code2,
    component: 'developer'
  })),
  ...CALCULATOR_TOOLS.map(tool => ({
    ...tool,
    category: 'calculator',
    badge: 'Calc',
    icon: Calculator,
    component: 'calculator'
  })),
  ...QR_TOOLS.map(tool => ({
    ...tool,
    category: 'qr',
    badge: 'QR',
    icon: QrCode,
    component: 'qr'
  }))
].map(tool => ({
  ...tool,
  path: toolPath(tool.id)
}));

function getRoute() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const parts = path.split('/').filter(Boolean);

  // New SEO tool URLs:
  // /merge-pdf
  // /extract-pdf-pages
  // /image-compressor
  if (parts.length === 1) {
    const toolId = toolIdFromSlug(parts[0]);

    if (toolId) {
      const correctPath = toolPath(toolId);

      if (window.location.pathname !== correctPath) {
        window.history.replaceState({}, '', correctPath);
      }

      return { type: 'tool', toolId, category: 'all', pageId: null };
    }
  }

  // Old URL support:
  // /tools/merge-pdf → /merge-pdf
  if (parts[0] === 'tools' && parts[1]) {
    const newPath = toolPath(parts[1]);

    if (window.location.pathname !== newPath) {
      window.history.replaceState({}, '', newPath);
    }

    return { type: 'tool', toolId: parts[1], category: 'all', pageId: null };
  }

  if (parts[0] === 'category' && parts[1]) {
    return { type: 'category', category: parts[1], toolId: null, pageId: null };
  }

  if (parts[0] && staticPages[parts[0]]) {
    return { type: 'static', pageId: parts[0], category: 'all', toolId: null };
  }

  if (path !== '/') {
    return { type: 'not-found', category: 'all', toolId: null, pageId: null };
  }

  return { type: 'home', category: 'all', toolId: null, pageId: null };
}

function makeTitle(tool) {
  if (!tool) {
    return 'ConvertNest - Free Online PDF, Image, Text & Developer Tools';
  }

  return `${tool.title} Online Free - ConvertNest`;
}

function makeDescription(tool) {
  if (!tool) {
    return 'Use free online converter tools for PDF, Word, PowerPoint, Excel, JPG, PNG, WebP, text, JSON, QR codes and calculators.';
  }

  return `${tool.description} Use this free ${tool.title.toLowerCase()} tool online with a simple, fast and user-friendly interface.`;
}

function updateMeta(name, content) {
  let tag = document.querySelector(`meta[name="${name}"]`);

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }

  tag.setAttribute('content', content);
}

function ToolRunner({ tool }) {
  const props = { tool };

  if (tool.component === 'pdf') return <PdfTools {...props} />;
  if (tool.component === 'office') return <OfficeTools {...props} />;
  if (tool.component === 'image') return <ImageTools {...props} />;
  if (tool.component === 'text') return <TextTools {...props} />;
  if (tool.component === 'developer') return <DeveloperTools {...props} />;
  if (tool.component === 'calculator') return <CalculatorTools {...props} />;
  if (tool.component === 'qr') return <QrTools {...props} />;

  return <div className="notice">Tool not found.</div>;
}

function ToolCard({ tool, isActive = false }) {
  const Icon = tool.icon;

  return (
    <a className={`tool-card ${isActive ? 'active' : ''}`} href={tool.path}>
      <div className="tool-card-top">
        <div className="tool-icon">
          <Icon size={21} />
        </div>

        <span className="mini-badge">{tool.badge}</span>
      </div>

      <strong>{tool.title}</strong>
      <p>{tool.description}</p>

      <span className="open-tool-link">Open tool →</span>
    </a>
  );
}

function Sidebar({ activeCategory }) {
  const listRef = React.useRef(null);
  const itemRefs = React.useRef({});

  React.useEffect(() => {
    const list = listRef.current;
    const activeItem = itemRefs.current[activeCategory];

    if (!list || !activeItem) return;

    const listWidth = list.clientWidth;
    const itemLeft = activeItem.offsetLeft;
    const itemWidth = activeItem.clientWidth;
    const targetLeft = itemLeft - listWidth / 2 + itemWidth / 2;

    list.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: 'smooth'
    });
  }, [activeCategory]);

  return (
    <aside className="sidebar">
      <p className="eyebrow">Categories</p>

      <div className="category-list" ref={listRef}>
        {categories.map(item => {
          const Icon = item.icon;

          const count =
            item.id === 'all'
              ? allTools.length
              : allTools.filter(tool => tool.category === item.id).length;

          return (
            <a
              key={item.id}
              ref={element => {
                itemRefs.current[item.id] = element;
              }}
              className={`category-btn ${activeCategory === item.id ? 'active' : ''}`}
              href={item.path}
            >
              <span className="category-btn-label">
                <Icon size={16} /> {item.label}
              </span>

              <span className="category-count">{count}</span>
            </a>
          );
        })}
      </div>
    </aside>
  );
}

function Header() {
  const [isToolsOpen, setIsToolsOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  const menuCategories = categories.filter(category => category.id !== 'all');

  const popularToolIds = [
    'merge-pdf',
    'split-pdf',
    'compress-pdf',
    'word-to-pdf',
    'pdf-to-word',
    'image-compressor',
    'image-resizer',
    'json-formatter',
    'word-counter',
    'text-qr'
  ];

  const popularTools = popularToolIds
    .map(id => allTools.find(tool => tool.id === id))
    .filter(Boolean);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (!dropdownRef.current) return;

      if (!dropdownRef.current.contains(event.target)) {
        setIsToolsOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsToolsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <header className="header">
      <div className="header-inner">
        <a className="brand" href="/">
          <img
            className="brand-logo"
            src="/logo-main.png"
            width="300"
            height="100"
            alt="ConvertNest"
          />
        </a>

        <nav className="header-actions">
          <a className="header-pill" href="/">
            <Home size={16} /> Home
          </a>

          <div className="header-dropdown" ref={dropdownRef}>
            <button
              type="button"
              className={`header-pill header-dropdown-btn ${isToolsOpen ? 'active' : ''}`}
              onClick={() => setIsToolsOpen(prev => !prev)}
              aria-expanded={isToolsOpen}
            >
              <Layers size={16} />
              Tools
              <ChevronDown
                size={16}
                className={`dropdown-chevron ${isToolsOpen ? 'open' : ''}`}
              />
            </button>

            {isToolsOpen ? (
              <div className="mega-menu">
                <div className="mega-menu-intro">
                  <p className="eyebrow">Tool Library</p>

                  <h3>Choose any converter</h3>

                  <p>
                    Browse PDF, office, image, text, developer, calculator and QR tools
                    from one clean menu.
                  </p>

                  <a
                    className="mega-all-tools"
                    href="/"
                    onClick={() => setIsToolsOpen(false)}
                  >
                    View all {allTools.length}+ tools →
                  </a>
                </div>

                <div className="mega-category-grid">
                  {menuCategories.map(category => {
                    const Icon = category.icon;
                    const categoryTools = allTools
                      .filter(tool => tool.category === category.id)
                      .slice(0, 5);

                    const totalCount = allTools.filter(
                      tool => tool.category === category.id
                    ).length;

                    return (
                      <div className="mega-category" key={category.id}>
                        <a
                          className="mega-category-title"
                          href={category.path}
                          onClick={() => setIsToolsOpen(false)}
                        >
                          <span>
                            <Icon size={17} />
                            {category.label}
                          </span>

                          <small>{totalCount}</small>
                        </a>

                        <div className="mega-tool-links">
                          {categoryTools.map(tool => (
                            <a
                              key={tool.id}
                              href={tool.path}
                              onClick={() => setIsToolsOpen(false)}
                            >
                              {tool.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mega-popular">
                  <span>Popular:</span>

                  {popularTools.map(tool => (
                    <a
                      key={tool.id}
                      href={tool.path}
                      onClick={() => setIsToolsOpen(false)}
                    >
                      {tool.title}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* <span className="header-pill hide-on-mobile">
            <ShieldCheck size={16} /> Local-first tools
          </span> */}

          {/* <span className="header-pill hide-on-mobile">
            <Sparkles size={16} /> SEO pages
          </span> */}
          
        </nav>
      </div>
    </header>
  );
}

function HomePage({ route }) {
  const [globalSearch, setGlobalSearch] = React.useState('');
  const [categorySearch, setCategorySearch] = React.useState('');

  const activeCategory = categories.some(category => category.id === route.category)
    ? route.category
    : 'all';

  const globalQuery = globalSearch.toLowerCase().trim();
  const categoryQuery = categorySearch.toLowerCase().trim();

  const isCategoryPage = route.type === 'category' && activeCategory !== 'all';

  const baseCategoryTools = React.useMemo(() => {
    if (activeCategory === 'all') return allTools;
    return allTools.filter(tool => tool.category === activeCategory);
  }, [activeCategory]);

  const filtered = React.useMemo(() => {
    if (globalQuery) {
      return allTools.filter(tool =>
        `${tool.title} ${tool.description} ${tool.badge} ${categoryLabel(tool.category)}`
          .toLowerCase()
          .includes(globalQuery)
      );
    }

    if (categoryQuery) {
      return baseCategoryTools.filter(tool =>
        `${tool.title} ${tool.description} ${tool.badge}`
          .toLowerCase()
          .includes(categoryQuery)
      );
    }

    return baseCategoryTools;
  }, [globalQuery, categoryQuery, baseCategoryTools]);

  const pageTitle = isCategoryPage
    ? `${categoryLabel(activeCategory)} - Free Online Converter Tools`
    : 'Free Online Converter Tools';

  React.useEffect(() => {
    const title = isCategoryPage
      ? `${categoryLabel(activeCategory)} Online - ConvertNest`
      : makeTitle(null);

    document.title = title;

    updateMeta(
      'description',
      isCategoryPage
        ? `Browse free ${categoryLabel(activeCategory).toLowerCase()} including ${baseCategoryTools
            .slice(0, 5)
            .map(tool => tool.title)
            .join(', ')} and more.`
        : makeDescription(null)
    );

    updateMeta('robots', 'index, follow');
  }, [activeCategory, isCategoryPage, baseCategoryTools]);

  React.useEffect(() => {
    setCategorySearch('');
  }, [activeCategory]);

  return (
    <>
      <section className="hero" id="top">
        <div className="hero-card">
          <p className="eyebrow">All-in-one converter website</p>

          <h1>{pageTitle}</h1>

          <p className="main-copy">
            Every converter now has its own SEO-friendly page. Open any tool like
            Word to PDF, JPG to PNG, JSON Formatter or QR Code Generator and the
            URL will change to a dedicated page.
          </p>

          <div className="searchbar">
            <Search size={20} />

            <input
              value={globalSearch}
              onChange={event => setGlobalSearch(event.target.value)}
              placeholder="Search all tools like JPG to PNG, Word to PDF, JSON formatter..."
            />
          </div>
        </div>

        <div className="stats-card">
          <div className="stat">
            <strong>{allTools.length}+</strong>
            <span>working tools</span>
          </div>

          <div className="stat">
            <strong>{categories.length - 1}</strong>
            <span>tool categories</span>
          </div>

          <div className="stat">
            <strong>URL</strong>
            <span>separate page per tool</span>
          </div>
        </div>
      </section>

      <main className="main-layout">
        <Sidebar activeCategory={activeCategory} />

        <section className="content">
          <AdSlot label="Top banner advertisement" />

          <div className="section-head category-search-head">
            <div>
              <p className="eyebrow">
                {globalQuery ? 'Overall Search Results' : categoryLabel(activeCategory)}
              </p>

              <h2>
                {filtered.length}{' '}
                {globalQuery || categoryQuery ? 'tools found' : 'tools available'}
              </h2>
            </div>

            <div className="category-tool-search">
              <Search size={18} />

              <input
                value={categorySearch}
                onChange={event => setCategorySearch(event.target.value)}
                placeholder="Search"
                disabled={Boolean(globalQuery)}
              />
            </div>
          </div>

          {globalQuery ? (
            <div className="notice">
              Showing results from all categories for “{globalSearch}”. Clear the top
              search to search only inside {categoryLabel(activeCategory)}.
            </div>
          ) : null}

          <div className="tools-grid">
            {filtered.map(tool => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>

          {!filtered.length ? (
            <div className="notice">No tools found. Try another keyword.</div>
          ) : null}

          <AdSlot label="Bottom advertisement" />
        </section>
      </main>
    </>
  );
}

function ToolPage({ tool }) {
  const related = allTools
    .filter(item => item.category === tool.category && item.id !== tool.id)
    .slice(0, 6);

  React.useEffect(() => {
    document.title = makeTitle(tool);
    updateMeta('description', makeDescription(tool));
    updateMeta('robots', 'index, follow');
  }, [tool]);

  return (
    <>
      <section className="tool-hero">
        <div className="breadcrumb">
          <a href="/">Home</a>
          <span>/</span>
          <a href={`/category/${tool.category}`}>{categoryLabel(tool.category)}</a>
          <span>/</span>
          <strong>{tool.title}</strong>
        </div>

        <div className="tool-hero-card">
          <div>
            <p className="eyebrow">Free online converter</p>
            <h1>{tool.title}</h1>
            <p className="main-copy">{makeDescription(tool)}</p>
          </div>

          <span className="badge big-badge">{tool.badge}</span>
        </div>
      </section>

      <main className="main-layout">
        <Sidebar activeCategory={tool.category} />

        <section className="content">
          <AdSlot label={`${tool.title} top advertisement`} />

          <section className="tool-panel" id="converter">
            <div className="tool-header">
              <div>
                <p className="eyebrow">Converter workspace</p>
                <h2>{tool.title}</h2>
                <p>{tool.description}</p>
              </div>

              <span className="badge">{tool.badge}</span>
            </div>

            <ToolRunner tool={tool} />
          </section>

          <section className="seo-content-card">
            <h2>How to use {tool.title}</h2>

            <ol>
              <li>Upload or paste your input in the tool workspace.</li>
              <li>Choose the required options if the tool asks for settings.</li>
              <li>Click the action button and wait for the result.</li>
              <li>Preview, copy or download the converted output.</li>
            </ol>

            <p>
              This page has a dedicated URL for SEO, so you can submit it to
              search engines, create a sitemap and run advertisements on this
              individual converter page.
            </p>
          </section>

          {related.length ? (
            <section className="related-section">
              <div className="section-head">
                <div>
                  <p className="eyebrow">Related tools</p>
                  <h2>More {categoryLabel(tool.category)}</h2>
                </div>
              </div>

              <div className="tools-grid compact-grid">
                {related.map(item => (
                  <ToolCard key={item.id} tool={item} />
                ))}
              </div>
            </section>
          ) : null}

          <AdSlot label={`${tool.title} bottom advertisement`} />
        </section>
      </main>
    </>
  );
}

function StaticPage({ pageId }) {
  const page = staticPages[pageId];

  React.useEffect(() => {
    if (!page) return;

    document.title = `${page.title} - ConvertNest`;
    updateMeta('description', page.description);
    updateMeta('robots', 'index, follow');
  }, [page, pageId]);

  if (!page) return <NotFoundPage />;

  return (
    <main className="static-page">
      <section className="static-card">
        <p className="eyebrow">ConvertNest</p>
        <h1>{page.title}</h1>
        <p className="main-copy">{page.description}</p>

        <div className="static-content">
          <p>{page.content}</p>
        </div>
      </section>
    </main>
  );
}

function NotFoundPage() {
  React.useEffect(() => {
    document.title = 'Tool Not Found - ConvertNest';
    updateMeta(
      'description',
      'The requested converter tool was not found. Browse all free converter tools on ConvertNest.'
    );
    updateMeta('robots', 'noindex, follow');
  }, []);

  return (
    <main className="not-found-page">
      <div className="tool-panel">
        <p className="eyebrow">404</p>
        <h1>Tool not found</h1>
        <p className="main-copy">
          The converter page you opened does not exist. Go back to the homepage
          and choose another tool.
        </p>

        <a className="primary-btn" href="/">
          Go to all tools
        </a>
      </div>
    </main>
  );
}

const SCROLL_KEY = 'convertnest-scroll-memory-v4';

function getPathKey() {
  return `${window.location.pathname}${window.location.search}`;
}

function readScrollStore() {
  try {
    return JSON.parse(sessionStorage.getItem(SCROLL_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeScrollStore(store) {
  sessionStorage.setItem(SCROLL_KEY, JSON.stringify(store));
}

function saveScrollPosition(pathKey) {
  const store = readScrollStore();

  store[pathKey] = {
    x: window.scrollX,
    y: window.scrollY
  };

  writeScrollStore(store);
}

function restoreScrollPosition(pathKey) {
  const store = readScrollStore();
  const saved = store[pathKey];

  if (!saved) {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    return;
  }

  let tries = 0;

  function restore() {
    tries += 1;

    const maxScroll =
      Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) -
      window.innerHeight;

    if (maxScroll >= saved.y || tries > 30) {
      window.scrollTo({
        top: Math.min(saved.y || 0, Math.max(0, maxScroll)),
        left: saved.x || 0,
        behavior: 'auto'
      });

      return;
    }

    requestAnimationFrame(restore);
  }

  requestAnimationFrame(restore);
}

function GoogleTranslateLoader() {
  React.useEffect(() => {
    window.googleTranslateElementInit = function () {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          autoDisplay: false
        },
        'google_translate_element'
      );

      setTimeout(removeGoogleTranslateTopBar, 500);
    };

    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src =
        'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }

    const interval = setInterval(removeGoogleTranslateTopBar, 500);

    const observer = new MutationObserver(() => {
      removeGoogleTranslateTopBar();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    });

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  return <div id="google_translate_element" className="google-translate-box" />;
}

function triggerGoogleTranslate(languageCode) {
  let tries = 0;

  function run() {
    tries += 1;

    const combo = document.querySelector('.goog-te-combo');

    if (!combo) {
      if (tries < 20) {
        setTimeout(run, 300);
      }
      return;
    }

    combo.value = languageCode;
    combo.dispatchEvent(new Event('change'));

    setTimeout(removeGoogleTranslateTopBar, 300);
    setTimeout(removeGoogleTranslateTopBar, 900);
    setTimeout(removeGoogleTranslateTopBar, 1500);
  }

  run();
}

function removeGoogleTranslateTopBar() {
  document.body.style.top = '0px';
  document.body.style.position = 'static';
  document.documentElement.style.marginTop = '0px';

  const selectors = [
    '.goog-te-banner-frame',
    '.goog-te-banner-frame.skiptranslate',
    'iframe.goog-te-banner-frame',
    'body > .skiptranslate',
    '.VIpgJd-ZVi9od-ORHb',
    '.VIpgJd-ZVi9od-ORHb-OEVmcd',
    '#goog-gt-tt',
    '.goog-te-balloon-frame'
  ];

  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(element => {
      element.style.display = 'none';
      element.style.visibility = 'hidden';
      element.style.height = '0';
      element.style.opacity = '0';
      element.style.pointerEvents = 'none';
    });
  });
}

function Footer() {
  const [languageOpen, setLanguageOpen] = React.useState(false);
  const [selectedLanguage, setSelectedLanguage] = React.useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('convertnest-language'));

      return saved?.label || 'English';
    } catch {
      return 'English';
    }
  });

  const footerPopularTools = allTools.slice(0, 18);

  const footerSocialLinks = [
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/',
      icon: '/social/instagram.png'
    },
    {
      label: 'Facebook',
      href: 'https://www.facebook.com/',
      icon: '/social/facebook.png'
    },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/',
      icon: '/social/linkedin.png'
    }
  ];

  const languages = [
    { label: 'English', code: 'en' },
    { label: 'தமிழ்', code: 'ta' },
    { label: 'हिन्दी', code: 'hi' },
    { label: 'മലയാളം', code: 'ml' },
    { label: 'ಕನ್ನಡ', code: 'kn' },
    { label: 'తెలుగు', code: 'te' },
    { label: 'Español', code: 'es' },
    { label: 'Français', code: 'fr' },
    { label: 'Deutsch', code: 'de' },
    { label: 'Italiano', code: 'it' },
    { label: 'Português', code: 'pt' },
    { label: 'العربية', code: 'ar' },
    { label: '中文', code: 'zh' },
    { label: '日本語', code: 'ja' },
    { label: '한국어', code: 'ko' },
    { label: 'Bahasa Indonesia', code: 'id' },
    { label: 'Bahasa Melayu', code: 'ms' },
    { label: 'Tiếng Việt', code: 'vi' }
  ];

  React.useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('convertnest-language'));

      if (saved?.code && saved.code !== 'en') {
        document.documentElement.lang = saved.code;

        setTimeout(() => {
          triggerGoogleTranslate(saved.code);
        }, 1000);
      }
    } catch {
      // ignore
    }
  }, []);

  function changeLanguage(language) {
      setSelectedLanguage(language.label);

      localStorage.setItem(
        'convertnest-language',
        JSON.stringify(language)
      );

      document.documentElement.lang = language.code;
      setLanguageOpen(false);

      setTimeout(() => {
        triggerGoogleTranslate(language.code);
      }, 300);
   }

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand-block">
          <a className="footer-brand" href="/">
            <img src="/logo-footer.png" alt="ConvertNest" />
          </a>

          <p>
            ConvertNest gives you simple online tools for PDFs, images, text,
            developer utilities, calculators and QR codes — all in one clean workspace.
          </p>

          <div className="footer-contact-list">
            <a href="mailto:support@convertpdfonline.in">
              <span className="footer-mini-icon">✉</span>
              support@convertpdfonline.in 
            </a>

            {/* <a href="tel:+910000000000">
              <span className="footer-mini-icon">☎</span>
              +91 00000 00000
            </a> */}

            {/* <span>
              <span className="footer-mini-icon"><img style={{ width: 16, height: 16 }} src="/public/location.png" alt="India" /></span>
              India
            </span> */}
          </div>

         {/* <div className="footer-socials">
            {footerSocialLinks.map(item => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                aria-label={item.label}
                title={item.label}
              >
                <img
                  className="footer-social-img"
                  src={item.icon}
                  alt={item.label}
                  loading="lazy"
                  style={{ width: 20, height: 20 }}
                />
              </a>
            ))}
          </div> */}
        </div>

        <div className="footer-column">
          <h3>Categories</h3>

          <div className="footer-link-list">
            {categories.map(category => (
              <a key={category.id} href={category.path}>
                {category.label}
              </a>
            ))}
          </div>
        </div>

        <div className="footer-column">
          <h3>Popular Tools</h3>

          <div className="footer-link-list two-column-links">
            {footerPopularTools.map(tool => (
              <a key={tool.id} href={tool.path}>
                {tool.title}
              </a>
            ))}
          </div>
        </div>

        <div className="footer-column">
          <h3>Required Links</h3>

          <div className="footer-link-list">
            <a href="/about">About ConvertNest</a>
            <a href="/contact">Contact</a>
            <a href="/privacy-policy">Privacy Policy</a>
            <a href="/terms-and-conditions">Terms & Conditions</a>
            <a href="/disclaimer">Disclaimer</a>
            <a href="/cookie-policy">Cookie Policy</a>
            <a href="/sitemap.xml">Sitemap</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="language-selector notranslate" translate="no">
            <button
              type="button"
              className="language-btn notranslate"
              translate="no"
              onClick={() => setLanguageOpen(prev => !prev)}
            >
              <span translate="no">🌐</span>
              <span translate="no">{selectedLanguage}</span>
              <span translate="no">▲</span>
            </button>

            {languageOpen ? (
              <div className="language-menu notranslate" translate="no">
                {languages.map(language => (
                  <button
                    key={language.code}
                    type="button"
                    translate="no"
                    className={`notranslate ${
                      selectedLanguage === language.label ? 'active' : ''
                    }`}
                    onClick={() => changeLanguage(language)}
                  >
                    <span translate="no">
                      {selectedLanguage === language.label ? '✓' : ''}
                    </span>

                    <span translate="no">{language.label}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

        <p>© {new Date().getFullYear()} ConvertNest. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default function App() {
  const [route, setRoute] = React.useState(getRoute());

  const currentPathRef = React.useRef(getPathKey());
  const navigationTypeRef = React.useRef('LOAD');

  React.useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  React.useEffect(() => {
    let ticking = false;

    function handleScroll() {
      if (ticking) return;

      ticking = true;

      requestAnimationFrame(() => {
        saveScrollPosition(currentPathRef.current);
        ticking = false;
      });
    }

    function handleInternalLinkClick(event) {
      const link = event.target.closest?.('a[href]');

      if (!link) return;

      const href = link.getAttribute('href') || '';

      // Do not intercept download links, blob links, file links, mail, phone, external actions
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('blob:') ||
        href.startsWith('data:') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:') ||
        link.hasAttribute('download') ||
        link.classList.contains('download-btn') ||
        link.target === '_blank' ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const url = new URL(href, window.location.href);

      // Do not intercept backend/external links
      if (url.origin !== window.location.origin) return;

      // Do not intercept files
      if (
        url.pathname.startsWith('/downloads/') ||
        url.pathname.endsWith('.pdf') ||
        url.pathname.endsWith('.docx') ||
        url.pathname.endsWith('.pptx') ||
        url.pathname.endsWith('.xlsx') ||
        url.pathname.endsWith('.png') ||
        url.pathname.endsWith('.jpg') ||
        url.pathname.endsWith('.jpeg') ||
        url.pathname.endsWith('.webp') ||
        url.pathname.endsWith('.ico') ||
        url.pathname.endsWith('.xml') ||
        url.pathname.endsWith('.txt')
      ) {
        return;
      }

      const nextPath = `${url.pathname}${url.search}`;

      if (nextPath === getPathKey()) return;

      event.preventDefault();

      saveScrollPosition(currentPathRef.current);

      navigationTypeRef.current = 'PUSH';

      window.history.pushState({}, '', nextPath);

      setRoute(getRoute());
    }

    function handlePopState() {
      saveScrollPosition(currentPathRef.current);

      navigationTypeRef.current = 'POP';

      setRoute(getRoute());
    }

    function handleBeforeUnload() {
      saveScrollPosition(currentPathRef.current);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleInternalLinkClick, true);

    return () => {
      saveScrollPosition(currentPathRef.current);

      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleInternalLinkClick, true);
    };
  }, []);

  React.useLayoutEffect(() => {
    const newPath = getPathKey();
    const navigationType = navigationTypeRef.current;

    currentPathRef.current = newPath;

    if (navigationType === 'POP' || navigationType === 'LOAD') {
      restoreScrollPosition(newPath);
    } else {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto'
      });
    }

    navigationTypeRef.current = 'IDLE';
  }, [route.type, route.toolId, route.category, route.pageId]);

  const selectedTool = route.toolId
    ? allTools.find(tool => tool.id === route.toolId)
    : null;

  return (
    <div className="app-shell">
      <Header />
      <GoogleTranslateLoader />

      {route.type === 'tool' ? (
        selectedTool ? <ToolPage tool={selectedTool} /> : <NotFoundPage />
      ) : route.type === 'static' ? (
        <StaticPage pageId={route.pageId} />
      ) : route.type === 'not-found' ? (
        <NotFoundPage />
      ) : (
        <HomePage route={route} />
      )}

      <Footer />
    </div>
  );
}
