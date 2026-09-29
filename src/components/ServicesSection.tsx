import { motion } from 'framer-motion';
import { Aperture, Zap, Video, Disc3 } from 'lucide-react';
import AnimatedText from './AnimatedText';
import { ACCENT_MAP, type AccentColor } from '@/lib/photos';

const SERVICES: {
  icon: typeof Aperture;
  title: string;
  description: string;
  accent: AccentColor;
  price: string;
}[] = [
  {
    icon: Aperture,
    title: 'LIVE SHOW COVERAGE',
    description: 'Full concert coverage from soundcheck to last encore. 200+ edited shots delivered in 48h.',
    accent: 'green',
    price: 'From €450',
  },
  {
    icon: Disc3,
    title: 'ALBUM & PRESS KITS',
    description: 'Studio and location shoots for album covers, press releases, and promo campaigns.',
    accent: 'orange',
    price: 'From €800',
  },
  {
    icon: Video,
    title: 'MUSIC VIDEOS',
    description: 'Cinematic live sessions, lyric videos, and behind-the-scenes tour documentaries.',
    accent: 'pink',
    price: 'From €2,500',
  },
  {
    icon: Zap,
    title: 'FESTIVAL COVERAGE',
    description: 'Multi-day festival documentation — stages, crowds, backstage, and artist portraits.',
    accent: 'blue',
    price: 'Custom',
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="relative bg-[#0C0C0C] py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="mb-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Zap size={18} className="text-neon-green" style={{ filter: 'drop-shadow(0 0 4px #39FF14)' }} />
              <span className="text-xs font-medium uppercase tracking-[0.25em] text-white/50">Services</span>
            </div>
            <h2 className="text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl">
              <AnimatedText text="What I" />{' '}
              <span className="neon-text-orange"><AnimatedText text="deliver" delay={0.15} /></span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-white/50">
            Every package includes full editing, online gallery, and commercial usage rights. No hidden fees.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {SERVICES.map((service, i) => {
            const c = ACCENT_MAP[service.accent];
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition-colors duration-300 hover:border-white/20"
              >
                <div
                  className="absolute -right-20 -top-20 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30"
                  style={{ background: c.raw }}
                />
                <div className="relative flex items-start justify-between">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-xl border-2"
                    style={{ borderColor: c.raw, boxShadow: `0 0 10px ${c.raw}40` }}
                  >
                    <Icon size={24} style={{ color: c.raw }} />
                  </div>
                  <span className="text-sm font-bold" style={{ color: c.raw }}>{service.price}</span>
                </div>
                <h3 className="mt-6 text-2xl font-bold tracking-tight text-white">{service.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/50">{service.description}</p>
                <div
                  className="mt-6 h-px w-full transition-all duration-500 group-hover:w-full"
                  style={{ background: `linear-gradient(90deg, ${c.raw}, transparent)` }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
