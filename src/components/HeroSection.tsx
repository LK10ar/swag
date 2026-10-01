import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import SpotlightReveal from './SpotlightReveal';
import ContactButton from './ContactButton';
import Magnet from './Magnet';
import RichText from './RichText';
import DecorLayer from './DecorLayer';
import HeroTitleText from './HeroTitleText';
import { useSettings } from '@/lib/settings';
import { heroFontSize } from '@/lib/hero';
import { safeHref } from '@/lib/helpers';

export default function HeroSection() {
  const { settings } = useSettings();
  const h = settings.hero;

  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden bg-[#0C0C0C]">
      <SpotlightReveal baseImage={h.base} revealImage={h.reveal} radius={280} className="absolute inset-0" />

      <div className="pointer-events-none absolute inset-0 z-[5]">
        <DecorLayer items={h.decor} />
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center">
        <Magnet padding={300} strength={10} className="w-full">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full"
            style={{ color: '#F4F1E8', willChange: 'transform' }}
          >
            <HeroTitleText title={h.title} />
          </motion.h2>
        </Magnet>
      </div>

      <div
        className="relative z-20 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-between px-5 pt-32 md:px-10 md:pt-40"
        style={{ paddingBottom: `calc(${heroFontSize(h.title.text, h.title.scale)} + 2rem)` }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex items-center gap-2"
        >
          {h.kicker && (
            <>
              <Zap size={16} className="flex-shrink-0 text-neon-green" style={{ filter: 'drop-shadow(0 0 4px #39FF14)' }} />
              <span className="text-xs font-medium uppercase tracking-[0.25em] text-white/70">{h.kicker}</span>
            </>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-start gap-8"
        >
          {h.tagline && (
            <h1 className="max-w-xl text-2xl font-medium leading-tight tracking-tight text-white md:text-3xl">
              <RichText text={h.tagline} />
            </h1>
          )}
          {h.buttonLabel && <ContactButton label={h.buttonLabel} href={safeHref(h.buttonHref)} accent="green" />}
        </motion.div>
      </div>
    </section>
  );
}
