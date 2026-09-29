import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import SpotlightReveal from './SpotlightReveal';
import ContactButton from './ContactButton';
import Magnet from './Magnet';
import { PHOTOS } from '@/lib/photos';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#0C0C0C]">
      <SpotlightReveal
        baseImage={PHOTOS.heroBase}
        revealImage={PHOTOS.heroReveal}
        radius={280}
        className="absolute inset-0"
      />

      <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center">
        <Magnet padding={300} strength={10} className="w-full">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full select-none whitespace-nowrap text-center font-black uppercase leading-none tracking-tight"
          style={{ fontSize: '11.5vw', lineHeight: 1, color: '#F4F1E8', willChange: 'transform' }}
        >
          <span className="neon-text-green neon-flicker">S</span>wagtrickryan
        </motion.h2>
        </Magnet>
      </div>

      <div className="relative z-20 mx-auto flex min-h-screen max-w-7xl flex-col justify-between px-5 pb-24 pt-32 md:px-10 md:pt-40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex items-center gap-2"
        >
          <Zap size={16} className="text-neon-green" style={{ filter: 'drop-shadow(0 0 4px #39FF14)' }} />
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-white/70">
            Rock · Hard Rock · Metal Photography
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-start gap-8"
        >
          <h1 className="max-w-xl text-2xl font-medium leading-tight tracking-tight text-white md:text-3xl">
            <span className="neon-text-green">Raw</span> energy.{' '}
            <span className="neon-text-pink">Sweat</span>.{' '}
            <span className="neon-text-orange">Distortion</span>.<br />
            I freeze the chaos into frames that hit harder than the riff.
          </h1>
          <ContactButton label="Start a project" accent="green" />
        </motion.div>
      </div>
    </section>
  );
}
