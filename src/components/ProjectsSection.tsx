import { useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import FadeIn from './FadeIn';
import LiveProjectButton from './LiveProjectButton';
import AlbumViewer from './AlbumViewer';
import { useAlbums } from '@/lib/albums';
import type { Album } from '@/lib/api';
import { ACCENT_MAP, PLACEHOLDER_IMAGE } from '@/lib/photos';

const pad = (n: number) => String(n).padStart(2, '0');
const label = (a: Album) => [a.year, a.location].filter(Boolean).join(' · ');

// 3 images pour la grille de la carte : couverture + premières photos, complétées par le placeholder
function cardImages(album: Album): string[] {
  const urls = [album.cover, ...album.photos.map((p) => p.url)].filter(Boolean);
  const unique = urls.filter((u, i) => urls.indexOf(u) === i);
  while (unique.length < 3) unique.push(PLACEHOLDER_IMAGE);
  return unique.slice(0, 3);
}

function ProjectCard({
  album,
  index,
  total,
  progress,
  onOpen,
}: {
  album: Album;
  index: number;
  total: number;
  progress: MotionValue<number>;
  onOpen: () => void;
}) {
  const rangeStart = index / total;
  const targetScale = 1 - (total - 1 - index) * 0.03;
  const scale = useTransform(progress, [rangeStart, 1], [1, targetScale]);
  const c = ACCENT_MAP[album.accent] ?? ACCENT_MAP.green;
  const [img1, img2, img3] = cardImages(album);

  return (
    <div className="sticky top-24 flex items-start justify-center md:top-32" style={{ minHeight: '85vh' }}>
      <motion.div
        style={{ scale, marginTop: `${index * 28}px`, transformOrigin: 'top' }}
        onClick={onOpen}
        className="relative flex w-full max-w-[1760px] cursor-pointer flex-col gap-6 rounded-[40px] border-2 border-[#D7E2EA] bg-[#0C0C0C] p-4 sm:gap-8 sm:rounded-[50px] sm:p-6 md:gap-10 md:rounded-[60px] md:p-8"
      >
        {/* Ligne du haut */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-center gap-6 sm:gap-8 md:gap-10">
            <span
              className="font-black uppercase leading-none text-[#D7E2EA]"
              style={{ fontSize: 'clamp(3rem, min(10vw, 14vh), 140px)' }}
            >
              {pad(index + 1)}
            </span>
            <div className="flex flex-col gap-2 sm:gap-4 md:gap-6">
              <span
                className="font-medium uppercase"
                style={{ fontSize: 'clamp(1rem, 2.2vw, 2.1rem)', color: c.raw }}
              >
                {label(album)}
              </span>
              <span
                className="font-light tracking-wide text-[#D7E2EA]"
                style={{ fontSize: 'clamp(0.9rem, 2vw, 2rem)' }}
              >
                {album.title}
              </span>
            </div>
          </div>
          <LiveProjectButton label="Open album" onClick={onOpen} />
        </div>

        {/* Grille d'images */}
        <div className="flex w-full flex-col gap-4 md:flex-row md:gap-5">
          <div className="flex w-full flex-col gap-4 md:w-[40%] md:gap-5">
            <img
              src={img1}
              alt={`${album.title} — aperçu 1`}
              loading="lazy"
              className="w-full rounded-[40px] object-cover sm:rounded-[50px] md:rounded-[60px]"
              style={{ height: 'clamp(130px, min(16vw, 17vh), 230px)' }}
            />
            <img
              src={img2}
              alt={`${album.title} — aperçu 2`}
              loading="lazy"
              className="w-full rounded-[30px] object-cover sm:rounded-[40px] md:rounded-[60px]"
              style={{ height: 'clamp(160px, min(22vw, 25vh), 340px)' }}
            />
          </div>
          <img
            src={img3}
            alt={`${album.title} — aperçu 3`}
            loading="lazy"
            className="min-h-[200px] w-full self-stretch rounded-[30px] object-cover sm:rounded-[40px] md:w-[60%] md:rounded-[60px]"
          />
        </div>
      </motion.div>
    </div>
  );
}

export default function ProjectsSection() {
  const { albums, status } = useAlbums();
  const sectionRef = useRef<HTMLElement>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });

  const openIndex = albums.findIndex((a) => a._id === openId);
  const openAlbum = openIndex >= 0 ? albums[openIndex] : null;

  return (
    <section
      id="work"
      ref={sectionRef}
      className="relative z-10 -mt-10 rounded-t-[40px] bg-[#0C0C0C] px-5 pb-24 sm:-mt-12 sm:rounded-t-[50px] sm:px-8 md:-mt-14 md:rounded-t-[60px] md:px-10 md:pb-32"
    >
      <div className="flex flex-col items-center py-20 sm:py-24 md:py-32">
        <FadeIn y={40} className="w-full">
          <h2
            className="hero-heading w-full text-center font-black uppercase leading-none tracking-tight"
            style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
          >
            Project
          </h2>
        </FadeIn>
      </div>

      {albums.length === 0 && status === 'ready' ? (
        <p className="pb-24 text-center text-white/50">Les premiers albums arrivent bientôt.</p>
      ) : (
        albums.map((album, i) => (
          <ProjectCard
            key={album._id}
            album={album}
            index={i}
            total={albums.length}
            progress={scrollYProgress}
            onOpen={() => setOpenId(album._id)}
          />
        ))
      )}

      <AnimatePresence>
        {openAlbum && (
          <AlbumViewer
            key={openAlbum._id}
            album={openAlbum}
            number={pad(openIndex + 1)}
            onClose={() => setOpenId(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
