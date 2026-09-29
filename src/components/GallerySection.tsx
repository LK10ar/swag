import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AnimatedText from './AnimatedText';
import Lightbox from './Lightbox';
import { useAlbums } from '@/lib/albums';

const MAX_PHOTOS = 12;

export default function GallerySection() {
  const { albums } = useAlbums();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Une photo par album à tour de rôle, pour mélanger les événements
  const photos = useMemo(() => {
    const out: { url: string; caption?: string }[] = [];
    const max = Math.max(0, ...albums.map((a) => a.photos.length));
    for (let i = 0; i < max && out.length < MAX_PHOTOS; i++) {
      for (const a of albums) {
        const p = a.photos[i];
        if (p && out.length < MAX_PHOTOS) out.push({ url: p.url, caption: p.caption || a.title });
      }
    }
    return out;
  }, [albums]);

  if (photos.length === 0) return null;

  return (
    <section id="gallery" className="relative bg-[#0C0C0C] py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="mb-12">
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-white/50">Gallery</span>
          <h2 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl">
            <AnimatedText text="From the" />{' '}
            <span className="neon-text-pink"><AnimatedText text="archive" delay={0.15} /></span>
          </h2>
        </div>

        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
          {photos.map((photo, i) => (
            <motion.button
              key={`${photo.url}-${i}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              onClick={() => setOpenIndex(i)}
              aria-label={`Ouvrir la photo ${i + 1}`}
              className="group relative block w-full overflow-hidden rounded-xl border border-white/10"
            >
              <img
                src={photo.url}
                alt={photo.caption || `Rock photography ${i + 1}`}
                className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {openIndex !== null && (
          <Lightbox
            photos={photos}
            index={openIndex}
            onIndex={setOpenIndex}
            onClose={() => setOpenIndex(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
