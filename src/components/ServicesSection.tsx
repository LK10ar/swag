import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import RichText from './RichText';
import FadeIn from './FadeIn';
import DecorLayer from './DecorLayer';
import { ICONS } from '@/lib/icons';
import { ACCENT_MAP } from '@/lib/photos';
import { useSettings } from '@/lib/settings';

export default function ServicesSection() {
  const { settings, t } = useSettings();
  const s = settings.services;

  return (
    <section id="services" className="relative overflow-hidden bg-[#0C0C0C] py-24 md:py-36">
      <DecorLayer items={s.decor} area="services" />
      <div className="relative mx-auto max-w-7xl px-5 md:px-10">
        <div className="mb-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Zap size={18} className="text-neon-green" style={{ filter: 'drop-shadow(0 0 4px #39FF14)' }} />
              <span className="text-xs font-medium uppercase tracking-[0.25em] text-white/50">
                {s.kicker || t('nav.services')}
              </span>
            </div>
            <FadeIn y={30}>
              <h2 className="text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl">
                <RichText text={s.title} />
              </h2>
            </FadeIn>
          </div>
          {s.note && <p className="max-w-sm whitespace-pre-line text-sm leading-relaxed text-white/50">{s.note}</p>}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {s.items.map((service, i) => {
            const c = ACCENT_MAP[service.accent] ?? ACCENT_MAP.green;
            const Icon = ICONS[service.icon] ?? Zap;
            return (
              <motion.div
                key={`${service.title}-${i}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: (i % 4) * 0.08, duration: 0.5 }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors duration-300 hover:border-white/20 md:p-8"
              >
                <div
                  className="absolute -right-20 -top-20 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30"
                  style={{ background: c.raw }}
                />
                <div className="relative flex items-start justify-between gap-4">
                  <div
                    className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border-2"
                    style={{ borderColor: c.raw, boxShadow: `0 0 10px ${c.raw}40` }}
                  >
                    <Icon size={24} style={{ color: c.raw }} />
                  </div>
                  {service.price && (
                    <span className="text-right text-sm font-bold" style={{ color: c.raw }}>
                      {service.price}
                    </span>
                  )}
                </div>
                <h3 className="mt-6 text-xl font-bold tracking-tight text-white md:text-2xl">{service.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/50">{service.description}</p>
                <div
                  className="mt-6 h-px w-full"
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
