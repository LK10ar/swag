import { motion } from 'framer-motion';
import { Flame, Music, Camera } from 'lucide-react';
import AnimatedText from './AnimatedText';
import { PHOTOS } from '@/lib/photos';

const STATS = [
  { value: '250+', label: 'Shows Shot', color: '#39FF14' },
  { value: '12', label: 'Years In Pit', color: '#FF6B00' },
  { value: '40+', label: 'Bands Covered', color: '#FF10A0' },
  { value: '8', label: 'Countries', color: '#00F0FF' },
];

export default function AboutSection() {
  return (
    <section id="about" className="relative bg-[#0C0C0C] py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="grid gap-12 md:grid-cols-2 md:gap-20">
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl border border-white/10">
              <img
                src={PHOTOS.portraits.main}
                alt="swagtrickryan portrait"
                className="w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <Camera size={16} className="text-neon-green" style={{ filter: 'drop-shadow(0 0 4px #39FF14)' }} />
                <span className="text-sm font-medium text-white/80">swagtrickryan — Behind the lens</span>
              </div>
            </div>
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full border-2 border-neon-green/40" style={{ boxShadow: '0 0 15px rgba(57,255,20,0.3)' }} />
            <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full border-2 border-neon-pink/40" style={{ boxShadow: '0 0 15px rgba(255,16,160,0.3)' }} />
          </div>

          <div className="flex flex-col justify-center gap-8">
            <div className="flex items-center gap-2">
              <Flame size={18} className="text-neon-orange" style={{ filter: 'drop-shadow(0 0 4px #FF6B00)' }} />
              <span className="text-xs font-medium uppercase tracking-[0.25em] text-white/50">About</span>
            </div>

            <h2 className="text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl">
              <AnimatedText text="I don't shoot" />{' '}
              <span className="neon-text-green"><AnimatedText text="portraits" delay={0.2} /></span>.<br />
              <AnimatedText text="I capture" delay={0.3} />{' '}
              <span className="neon-text-pink"><AnimatedText text="sonic violence" delay={0.4} /></span>{' '}
              <AnimatedText text="in frames" delay={0.5} />.
            </h2>

            <p className="text-base leading-relaxed text-white/60 md:text-lg">
              Twelve years in photo pits across Europe and Japan. From basement hardcore gigs to
              stadium metal festivals — I live for the three seconds between the riff and the
              chaos. My camera doesn't flinch when the mosh pit erupts. It leans in.
            </p>

            <p className="flex items-center gap-2 text-sm text-white/40">
              <Music size={14} className="text-neon-blue" />
              Currently touring with: DEADLOCK · ASHFALL · The Vulture Cult
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 md:grid-cols-4">
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 text-center"
                >
                  <div className="text-2xl font-extrabold md:text-3xl" style={{ color: stat.color, textShadow: `0 0 10px ${stat.color}40` }}>
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-wide text-white/40">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
