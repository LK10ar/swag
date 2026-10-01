import type { CSSProperties } from 'react';
import type { Photo } from './api';

export const LIGHT = '#D7E2EA';

export function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

export const mediaType = (p: Pick<Photo, 'type'>) => p.type ?? 'image';

/** Image fixe utilisable comme vignette (null pour un fichier vidéo) */
export function stillOf(p: Pick<Photo, 'type' | 'url'>): string | null {
  const t = mediaType(p);
  if (t === 'image') return p.url;
  if (t === 'youtube') {
    const id = youtubeId(p.url);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  }
  return null;
}

/** Noir ou blanc, selon ce qui se lit le mieux sur cette couleur de fond */
export function readableOn(hex: string): string {
  const n = parseInt(hex.replace('#', ''), 16);
  if (Number.isNaN(n)) return '#0C0C0C';
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#0C0C0C' : '#FFFFFF';
}

/** Variables CSS pour le bouton "Open album" d'un album (couleur + survol) */
export function btnVars(a: { buttonColor?: string; hoverColor?: string }): CSSProperties {
  const s: Record<string, string> = {};
  if (a.buttonColor) s['--btn'] = a.buttonColor;
  if (a.hoverColor) {
    s['--hov'] = a.hoverColor;
    s['--hov-text'] = readableOn(a.hoverColor);
  }
  return s as CSSProperties;
}

/** N'autorise que http(s), mailto, tel, les ancres et les chemins relatifs dans les liens éditables */
export function safeHref(href: string | undefined): string {
  const h = (href || '').trim();
  return /^(https?:\/\/|mailto:|tel:|#|\/)/i.test(h) ? h : '#';
}

/** "@pseudo" à partir d'un lien de profil (ex. https://www.instagram.com/swagtrickryan/) */
export function handleFromUrl(url: string): string {
  try {
    const seg = new URL(url).pathname.split('/').filter(Boolean)[0];
    return seg ? `@${seg}` : 'Instagram';
  } catch {
    return 'Instagram';
  }
}
