import { motion } from 'framer-motion';
import { Camera, Instagram, Mail, ArrowUpRight } from 'lucide-react';
import AnimatedText from './AnimatedText';
import ContactButton from './ContactButton';

export default function Footer() {
  return (
    <footer id="contact" className="relative overflow-hidden bg-[#0C0C0C] pt-24 md:pt-36">
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-neon-green/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-neon-pink/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-5 md:px-10">
        <div className="flex items-center gap-2">
          <Mail size={18} className="text-neon-green" style={{ filter: 'drop-shadow(0 0 4px #39FF14)' }} />
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-white/50">Contact</span>
        </div>

        <h2 className="mt-6 text-5xl font-black leading-[90%] tracking-tighter text-white md:text-8xl">
          <AnimatedText text="Let's make" />{' '}
          <span className="neon-text-green"><AnimatedText text="something" delay={0.15} /></span>{' '}
          <span className="neon-text-pink"><AnimatedText text="loud" delay={0.3} /></span>.
        </h2>

        <div className="mt-12 flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-6">
            <p className="max-w-md text-base leading-relaxed text-white/50">
              Réserver un spectacle, planifier une pochette d’album ou avoir besoin de documenter une visite complète ? Je suis disponible
              - il suffit de me contacter.
            </p>
            <ContactButton label="Book a shoot" accent="green" />
          </div>

          <div className="flex flex-col gap-6">
            <a href="mailto:shoot@voltphoto.studio" className="group flex items-center gap-2 text-lg text-white/70 transition-colors hover:text-neon-green">
              shoot@voltphoto.studio
              <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <div className="flex gap-4">
              {[
                { label: 'Instagram', icon: Instagram },
                { label: 'Behance', icon: Camera },
                { label: '500px', icon: Camera },
              ].map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href="#"
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-white/60 transition-colors hover:border-neon-pink hover:text-neon-pink"
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col items-center justify-between gap-4 border-t border-white/10 py-8 md:flex-row">
          <div className="flex items-center gap-2">
            <Camera size={18} className="text-neon-green" style={{ filter: 'drop-shadow(0 0 4px #39FF14)' }} />
            <span className="text-lg font-extrabold tracking-tight text-white">swagtrickryan</span>
            <span className="ml-2 text-xs text-white/30">Rock & Hard Rock Photography</span>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs text-white/30"
          >
            © 2025 swagtrickryan. All frames reserved.
          </motion.p>
        </div>
      </div>
    </footer>
  );
}
