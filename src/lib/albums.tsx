import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { fetchAlbums, type Album } from './api';
import { PHOTOS } from './photos';

// Albums de démonstration affichés tant que l'API n'a pas répondu (ou si elle est hors ligne)
const DEMO_ALBUMS: Album[] = PHOTOS.projects.map((p, i) => ({
  _id: `demo-${i}`,
  title: p.title,
  year: p.year,
  location: p.location,
  accent: p.accent,
  cover: p.image,
  order: i,
  photos: PHOTOS.gallery
    .slice(i * 3, i * 3 + 3)
    .map((url, j) => ({ _id: `demo-${i}-${j}`, url })),
}));

type Status = 'loading' | 'ready' | 'offline';

const CACHE_KEY = 'swag_albums_v1';
function readCache(): Album[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const list = raw ? (JSON.parse(raw) as Album[]) : null;
    return Array.isArray(list) && list.length > 0 ? list : DEMO_ALBUMS;
  } catch {
    return DEMO_ALBUMS;
  }
}
type Ctx = { albums: Album[]; status: Status; reload: () => void };

const AlbumsContext = createContext<Ctx>({ albums: DEMO_ALBUMS, status: 'loading', reload: () => {} });

export function AlbumsProvider({ children }: { children: ReactNode }) {
  const [albums, setAlbums] = useState<Album[]>(readCache);
  const [status, setStatus] = useState<Status>('loading');

  const reload = useCallback(() => {
    fetchAlbums()
      .then((data) => {
        setAlbums(data);
        setStatus('ready');
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch {
          /* stockage indisponible : pas grave */
        }
      })
      .catch(() => setStatus('offline'));
  }, []);

  useEffect(reload, [reload]);

  return <AlbumsContext.Provider value={{ albums, status, reload }}>{children}</AlbumsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAlbums = () => useContext(AlbumsContext);
