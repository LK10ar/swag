// Injecte le SEO (réglé dans l'admin) dans index.html AVANT le build, pour que Google et les réseaux
// sociaux le lisent sans exécuter de JavaScript. Génère aussi robots.txt et sitemap.xml.
// Lancé par le workflow GitHub : `node scripts/seo.mjs`. Si l'API est injoignable, index.html reste tel quel.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const API = (process.env.VITE_API_URL || '').replace(/\/$/, '');
const SITE = process.env.SITE_URL ? new URL(process.env.SITE_URL).href : '';

const esc = (v) =>
  String(v ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function load() {
  if (!API) return null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const r = await fetch(`${API}/api/settings`, { signal: AbortSignal.timeout(60000) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (e) {
      console.warn(`[seo] tentative ${attempt} : ${e.message}`);
    }
  }
  return null;
}

const data = await load();
if (!data) {
  console.warn('[seo] réglages indisponibles : index.html inchangé.');
  process.exit(0);
}

const seo = data.seo ?? {};
const brand = data.brand ?? {};
const name = brand.name || 'swagtrickryan';
const title = seo.title || name;
const url = seo.canonical || SITE;
const lang = data.i18n?.defaultLang || 'fr';

const iconType = (u) =>
  /\.svg(\?|$)/i.test(u) ? ' type="image/svg+xml"' : /\.ico(\?|$)/i.test(u) ? ' type="image/x-icon"' : /\.png(\?|$)/i.test(u) ? ' type="image/png"' : '';

const tags = [
  `<title>${esc(title)}</title>`,
  seo.description && `<meta name="description" content="${esc(seo.description)}" />`,
  seo.keywords && `<meta name="keywords" content="${esc(seo.keywords)}" />`,
  seo.author && `<meta name="author" content="${esc(seo.author)}" />`,
  `<meta name="robots" content="${esc(seo.robots || 'index,follow')}" />`,
  url && `<link rel="canonical" href="${esc(url)}" />`,
  brand.favicon && `<link rel="icon" href="${esc(brand.favicon)}"${iconType(brand.favicon)} />`,
  `<meta property="og:type" content="website" />`,
  `<meta property="og:site_name" content="${esc(name)}" />`,
  `<meta property="og:title" content="${esc(title)}" />`,
  seo.description && `<meta property="og:description" content="${esc(seo.description)}" />`,
  url && `<meta property="og:url" content="${esc(url)}" />`,
  seo.ogImage && `<meta property="og:image" content="${esc(seo.ogImage)}" />`,
  `<meta name="twitter:card" content="${seo.ogImage ? 'summary_large_image' : 'summary'}" />`,
  `<meta name="twitter:title" content="${esc(title)}" />`,
  seo.description && `<meta name="twitter:description" content="${esc(seo.description)}" />`,
  seo.ogImage && `<meta name="twitter:image" content="${esc(seo.ogImage)}" />`,
  seo.twitter && `<meta name="twitter:site" content="${esc(seo.twitter)}" />`,
].filter(Boolean);

if (seo.schema !== false) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    jobTitle: 'Photographer',
    description: seo.description || undefined,
    url: url || undefined,
    image: seo.ogImage || undefined,
    sameAs: data.contact?.instagram ? [data.contact.instagram] : undefined,
  };
  tags.push(`<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`);
}

let html = readFileSync('index.html', 'utf8');
html = html
  .replace(/<!-- seo:start -->[\s\S]*?<!-- seo:end -->\s*/g, '')
  .replace(/<title>[\s\S]*?<\/title>\s*/g, '')
  .replace(/<link rel="icon"[^>]*>\s*/g, brand.favicon ? '' : (m) => m)
  .replace(/<html lang="[^"]*"/, `<html lang="${esc(lang)}"`)
  .replace('</head>', `    <!-- seo:start -->\n    ${tags.join('\n    ')}\n    <!-- seo:end -->\n  </head>`);
writeFileSync('index.html', html);

// robots.txt + sitemap.xml (utiles surtout avec un nom de domaine à la racine)
mkdirSync('public', { recursive: true });
const noindex = String(seo.robots || '').startsWith('noindex');
writeFileSync(
  'public/robots.txt',
  `User-agent: *\n${noindex ? 'Disallow: /' : 'Allow: /'}\n${url && !noindex ? `Sitemap: ${new URL('sitemap.xml', url).href}\n` : ''}`,
);
if (url && !noindex) {
  writeFileSync(
    'public/sitemap.xml',
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${esc(url)}</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url>\n</urlset>\n`,
  );
}
console.log('[seo] index.html, robots.txt et sitemap.xml mis à jour.');
