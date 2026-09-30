import { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Lightbox from './Lightbox';
import MediaThumb from './MediaThumb';
import { useAlbums } from '@/lib/albums';
import { galleryItems } from '@/lib/gallery';

/** Page galerie complète : #/gallery */
export default function GalleryPage() {
  const { albums } = useAlbums();
  const [filter, setFilter] = useState('all');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const all = useMemo(() => galleryItems(albums), [albums]);
  const items = useMemo(() => (filter === 'all' ? all : all.filter((i) => i.albumId === filter)), [all, filter]);
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    all.forEach((i) => m.set(i.albumId, (m.get(i.albumId) ?? 0) + 1));
    return m;
  }, [all]);

  const chip = (active: boolean) =>
    `rounded-full border px-4 py-1.5 text-sm transition-colors ${
      active
        ? 'border-neon-pink bg-neon-pink/10 text-neon-pink'
        : 'border-white/15 text-white/60 hover:border-white/40 hover:text-white'
    }`;

  return (
    <section className="min-h-screen bg-[#0C0C0C] pb-24 pt-28 md:pb-36 md:pt-36">
      <div className="mx-auto max-w-7xl px-3 sm:px-5 md:px-10">
        <div className="px-2 md:px-0">
          <a
            href="#gallery"
            className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-white/60 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} /> Retour au site
          </a>

          <span className="mt-8 block text-xs font-medium uppercase tracking-[0.25em] text-white/50">Gallery</span>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl">
            From the <span className="neon-text-pink">archive</span>
          </h1>
          <p className="mt-3 text-sm text-white/40">
            {items.length} média{items.length > 1 ? 's' : ''}
          </p>

          {albums.length > 1 && (
            <div className="mt-6 flex flex-wrap gap-2">
              <button className={chip(filter === 'all')} onClick={() => setFilter('all')}>
                Tous ({all.length})
              </button>
              {albums
                .filter((a) => counts.has(a._id))
                .map((a) => (
                  <button key={a._id} className={chip(filter === a._id)} onClick={() => setFilter(a._id)}>
                    {a.title} ({counts.get(a._id)})
                  </button>
                ))}
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <p className="py-24 text-center text-white/40">Aucune photo pour l'instant.</p>
        ) : (
          <div className="mt-8 grid grid-cols-3 gap-1.5 sm:grid-cols-4 sm:gap-2 md:gap-3 lg:grid-cols-6">
            {items.map((photo, i) => (
              <button
                key={`${photo.url}-${i}`}
                onClick={() => setOpenIndex(i)}
                aria-label={`Ouvrir le média ${i + 1}`}
                className="group relative block aspect-square w-full overflow-hidden rounded-lg border border-white/10 md:rounded-xl"
              >
                <MediaThumb
                  photo={photo}
                  alt={photo.caption || `Photo ${i + 1}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {openIndex !== null && (
          <Lightbox
            photos={items}
            index={openIndex}
            onIndex={setOpenIndex}
            onClose={() => setOpenIndex(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
