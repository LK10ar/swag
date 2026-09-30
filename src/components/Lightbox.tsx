import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { mediaType, stillOf, youtubeId } from '@/lib/helpers';
import type { PhotoType } from '@/lib/api';

type Item = { url: string; type?: PhotoType; caption?: string };

type Props = {
  photos: Item[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
};

export default function Lightbox({ photos, index, onIndex, onClose }: Props) {
  const touchX = useRef<number | null>(null);
  const total = photos.length;

  const go = (dir: 1 | -1) => onIndex((index + dir + total) % total);

  // Clavier : flèches + Échap
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Précharge les photos voisines
  useEffect(() => {
    [index - 1, index + 1].forEach((i) => {
      const item = photos[(i + total) % total];
      const still = item && mediaType(item) === 'image' ? stillOf(item) : null;
      if (still) new Image().src = still;
    });
  }, [index, photos, total]);

  // Bloque le scroll de la page
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const current = photos[index];
  if (!current) return null;
  const type = mediaType(current);
  const ytId = type === 'youtube' ? youtubeId(current.url) : null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95"
      onClick={onClose}
      onTouchStart={(e) => {
        // on ne swipe pas quand on touche le lecteur vidéo
        touchX.current = (e.target as HTMLElement).closest('video,iframe') ? null : e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Visionneuse photo"
    >
      <button
        onClick={onClose}
        aria-label="Fermer"
        className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white hover:text-black md:right-8 md:top-8"
      >
        <X size={22} />
      </button>

      {total > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            aria-label="Photo précédente"
            className="absolute left-3 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white hover:text-black md:left-8"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            aria-label="Photo suivante"
            className="absolute right-3 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white hover:text-black md:right-8"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      <AnimatePresence mode="wait">
        {type === 'video' ? (
          <motion.video
            key={current.url}
            src={current.url}
            controls
            autoPlay
            playsInline
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[92vw] rounded-2xl bg-black md:max-w-[80vw]"
          />
        ) : type === 'youtube' && ytId ? (
          <motion.div
            key={current.url}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="aspect-video overflow-hidden rounded-2xl bg-black"
            style={{ width: 'min(92vw, calc(85vh * 1.7778))' }}
          >
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0`}
              title={current.caption || 'Vidéo YouTube'}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              className="h-full w-full"
            />
          </motion.div>
        ) : (
          <motion.img
            key={current.url}
            src={current.url}
            alt={current.caption || `Photo ${index + 1}`}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[92vw] select-none rounded-2xl object-contain md:max-w-[80vw]"
            draggable={false}
          />
        )}
      </AnimatePresence>

      <div className="pointer-events-none absolute bottom-5 left-0 right-0 flex flex-col items-center gap-1 px-6 text-center">
        {current.caption && <p className="text-sm text-white/80">{current.caption}</p>}
        <p className="text-xs tracking-widest text-white/50">
          {index + 1} / {total}
        </p>
      </div>
    </motion.div>,
    document.body,
  );
}
