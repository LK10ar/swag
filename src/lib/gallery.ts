import type { Album, PhotoType } from './api';

export type GalleryItem = {
  url: string;
  type?: PhotoType;
  caption?: string;
  albumId: string;
  albumTitle: string;
};

/** Tous les médias, une photo par album à tour de rôle (les événements sont mélangés, l'ordre dans chaque album est respecté). */
export function galleryItems(albums: Album[]): GalleryItem[] {
  const out: GalleryItem[] = [];
  const max = Math.max(0, ...albums.map((a) => a.photos.length));
  for (let i = 0; i < max; i++) {
    for (const a of albums) {
      const p = a.photos[i];
      if (p) out.push({ url: p.url, type: p.type, caption: p.caption || a.title, albumId: a._id, albumTitle: a.title });
    }
  }
  return out;
}
