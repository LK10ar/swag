import { ParallaxRow } from './FadeIn';
import { useSettings } from '@/lib/settings';

function PhotoCard({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative h-44 w-64 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 md:h-56 md:w-80">
      <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
    </div>
  );
}

// Répète la rangée pour qu'elle reste pleine même avec peu de photos
function loop(urls: string[]) {
  if (urls.length === 0) return [];
  const times = Math.max(2, Math.ceil(12 / urls.length));
  return Array.from({ length: times }, () => urls).flat();
}

export default function MarqueeSection() {
  const { settings } = useSettings();
  const { label, topRow, bottomRow } = settings.marquee;
  const top = loop(topRow);
  const bottom = loop(bottomRow);

  if (top.length === 0 && bottom.length === 0) return null;

  return (
    <section className="relative bg-[#0C0C0C] py-20 md:py-32">
      <div className="mb-10 px-5 md:px-10">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-neon-green/60 to-transparent" />
          {label && <span className="text-xs font-medium uppercase tracking-[0.3em] text-white/40">{label}</span>}
          <div className="h-px flex-1 bg-gradient-to-l from-neon-pink/60 to-transparent" />
        </div>
      </div>

      {top.length > 0 && (
        <ParallaxRow speed={-30} className="mb-4">
          {top.map((src, i) => (
            <PhotoCard key={`t-${i}`} src={src} alt="Rock concert photography" />
          ))}
        </ParallaxRow>
      )}

      {bottom.length > 0 && (
        <ParallaxRow speed={30} className="">
          {bottom.map((src, i) => (
            <PhotoCard key={`b-${i}`} src={src} alt="Hard rock concert crowd" />
          ))}
        </ParallaxRow>
      )}
    </section>
  );
}
