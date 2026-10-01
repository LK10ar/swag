import type { Album, PhotoType } from './api';

export type GalleryItem = {
  url: string;
  type?: PhotoType;
  caption?: string;
  albumId: string;
  albumTitle: string;
};

/** Tous les médias, rangés album par album, dans l'ordre choisi : les photos voisines restent côte à côte. */
export function galleryItems(albums: Album[]): GalleryItem[] {
  return albums.flatMap((a) =>
    a.photos.map((p) => ({ url: p.url, type: p.type, caption: p.caption || a.title, albumId: a._id, albumTitle: a.title })),
  );
}
