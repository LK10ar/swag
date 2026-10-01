import { useEffect } from 'react';
import { useSettings } from '@/lib/settings';

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!content) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string, type?: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!href) {
    if (rel === 'canonical') el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
  if (type) el.type = type;
  else el.removeAttribute('type');
}

const iconType = (url: string) =>
  /\.svg(\?|$)/i.test(url) ? 'image/svg+xml' : /\.ico(\?|$)/i.test(url) ? 'image/x-icon' : /\.(png)(\?|$)/i.test(url) ? 'image/png' : undefined;

/** Met à jour le titre, la description, le favicon, le partage et les données structurées selon l'admin */
export default function SiteHead() {
  const { settings, lang } = useSettings();
  const { seo, brand, contact } = settings;

  useEffect(() => {
    const title = seo.title || brand.name;
    document.documentElement.lang = lang;
    document.title = title;
    setMeta('name', 'description', seo.description);
    setMeta('name', 'keywords', seo.keywords);
    setMeta('name', 'author', seo.author);
    setMeta('name', 'robots', seo.robots);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', brand.name);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', seo.description);
    setMeta('property', 'og:image', seo.ogImage);
    setMeta('name', 'twitter:card', seo.ogImage ? 'summary_large_image' : 'summary');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', seo.description);
    setMeta('name', 'twitter:image', seo.ogImage);
    setMeta('name', 'twitter:site', seo.twitter);
    setLink('canonical', seo.canonical);
    if (brand.favicon) setLink('icon', brand.favicon, iconType(brand.favicon));

    const id = 'ld-json';
    document.getElementById(id)?.remove();
    if (seo.schema) {
      const script = document.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      script.text = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: brand.name,
        jobTitle: 'Photographer',
        description: seo.description,
        url: seo.canonical || window.location.origin + window.location.pathname,
        ...(seo.ogImage ? { image: seo.ogImage } : {}),
        ...(contact.instagram ? { sameAs: [contact.instagram] } : {}),
      });
      document.head.appendChild(script);
    }
  }, [seo, brand, contact.instagram, lang]);

  return null;
}
