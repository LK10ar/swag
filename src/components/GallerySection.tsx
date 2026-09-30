import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import AnimatedText from './AnimatedText';
import Lightbox from './Lightbox';
import MediaThumb from './MediaThumb';
import { useAlbums } from '@/lib/albums';
import { galleryItems } from '@/lib/gallery';

// 18 vignettes : 3 colonnes × 6 rangées sur mobile, 6 colonnes × 3 rangées sur ordinateur
const PREVIEW = 18;

export default function GallerySection() {
  const { albums } = useAlbums();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const all = useMemo(() => galleryItems(albums), [albums]);
  const photos = all.slice(0, PREVIEW);

  if (photos.length === 0) return null;

  return (
    <section id="gallery" className="relative bg-[#0C0C0C] py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-3 sm:px-5 md:px-10">
        <div className="mb-8 px-2 md:mb-12 md:px-0">
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-white/50">Gallery</span>
          <h2 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl">
            <AnimatedText text="From the" />{' '}
            <span className="neon-text-pink"><AnimatedText text="archive" delay={0.15} /></span>
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 md:grid-cols-6 md:gap-3">
          {photos.map((photo, i) => (
            <motion.button
              key={`${photo.url}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, delay: (i % 6) * 0.05 }}
              onClick={() => setOpenIndex(i)}
              aria-label={`Ouvrir la photo ${i + 1}`}
              className="group relative block aspect-square w-full overflow-hidden rounded-lg border border-white/10 md:rounded-xl"
            >
              <MediaThumb
                photo={photo}
                alt={photo.caption || `Rock photography ${i + 1}`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </motion.button>
          ))}
        </div>

        {all.length > PREVIEW && (
          <div className="mt-10 flex justify-center md:mt-14">
            <a
              href="#/gallery"
              className="group inline-flex items-center gap-3 rounded-full border-2 border-neon-pink px-8 py-3 text-sm font-semibold uppercase tracking-widest text-neon-pink transition-colors duration-200 hover:bg-neon-pink hover:text-[#0C0C0C] md:px-10 md:py-3.5 md:text-base"
            >
              Voir plus
              <span className="text-xs font-normal opacity-70">+{all.length - PREVIEW}</span>
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        )}
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
