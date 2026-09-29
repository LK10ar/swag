import { ParallaxRow } from './FadeIn';
import { PHOTOS } from '@/lib/photos';

function PhotoCard({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative h-44 w-64 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 md:h-56 md:w-80">
      <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
    </div>
  );
}

export default function MarqueeSection() {
  const top = [...PHOTOS.marquee.topRow, ...PHOTOS.marquee.topRow];
  const bottom = [...PHOTOS.marquee.bottomRow, ...PHOTOS.marquee.bottomRow];

  return (
    <section className="relative bg-[#0C0C0C] py-20 md:py-32">
      <div className="mb-10 px-5 md:px-10">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-neon-green/60 to-transparent" />
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-white/40">
            Live · Loud · Unfiltered
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-neon-pink/60 to-transparent" />
        </div>
      </div>

      <ParallaxRow speed={-30} className="mb-4">
        {top.map((src, i) => (
          <PhotoCard key={`t-${i}`} src={src} alt="Rock concert photography" />
        ))}
      </ParallaxRow>

      <ParallaxRow speed={30} className="">
        {bottom.map((src, i) => (
          <PhotoCard key={`b-${i}`} src={src} alt="Hard rock concert crowd" />
        ))}
      </ParallaxRow>
    </section>
  );
}
