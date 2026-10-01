import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import Lightbox from './Lightbox';
import MediaThumb from './MediaThumb';
import Masonry from './Masonry';
import type { Album } from '@/lib/api';
import { ACCENT_MAP } from '@/lib/photos';
import { LIGHT } from '@/lib/helpers';
import { useSettings } from '@/lib/settings';

type Props = { album: Album; number: string; onClose: () => void };

export default function AlbumViewer({ album, number, onClose }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const c = ACCENT_MAP[album.accent] ?? ACCENT_MAP.green;
  const { t } = useSettings();

  // Échap ferme l'album (la lightbox gère son propre Échap)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && openIndex === null) onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openIndex, onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[100] overflow-y-auto bg-[#0C0C0C]"
      role="dialog"
      aria-modal="true"
      aria-label={`Album ${album.title}`}
    >
      <div className="sticky top-0 z-10 border-b border-white/10 bg-[#0C0C0C]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-10 md:py-6">
          <div className="flex min-w-0 items-center gap-4 md:gap-8">
            <span
              className="font-black leading-none"
              style={{ fontSize: 'clamp(2rem, 6vw, 80px)', color: album.numberColor || LIGHT }}
            >
              {number}
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-xl font-black uppercase tracking-tight text-[#F4F1E8] md:text-4xl">
                {album.title}
              </h3>
              <p className="text-sm font-medium uppercase" style={{ color: c.raw }}>
                {[album.year, album.location].filter(Boolean).join(' · ')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer l'album"
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors hover:bg-white/10 active:bg-white/20"
            style={{ borderColor: album.buttonColor || LIGHT, color: album.buttonColor || LIGHT }}
          >
            <X size={22} />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8 md:px-10 md:py-12">
        {album.photos.length === 0 ? (
          <p className="py-24 text-center text-white/50">{t('album.empty')}</p>
        ) : (
          <Masonry
            items={album.photos}
            render={(photo, i) => (
              <motion.button
                key={photo._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 8) * 0.05, duration: 0.5 }}
                onClick={() => setOpenIndex(i)}
                className="group relative block w-full overflow-hidden rounded-3xl border border-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ outlineColor: c.raw }}
                aria-label={`Ouvrir le média ${i + 1}`}
              >
                <MediaThumb
                  photo={photo}
                  alt={photo.caption || `${album.title} — média ${i + 1}`}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {photo.caption && (
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-left text-sm text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {photo.caption}
                  </span>
                )}
              </motion.button>
            )}
          />
        )}
      </div>

      <AnimatePresence>
        {openIndex !== null && (
          <Lightbox
            photos={album.photos}
            index={openIndex}
            onIndex={setOpenIndex}
            onClose={() => setOpenIndex(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>,
    document.body,
  );
}
