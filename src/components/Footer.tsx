import { useEffect, useRef } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { ArrowUp, Copyright, Instagram, Mail } from 'lucide-react';
import Brand from './Brand';
import LangSwitch from './LangSwitch';
import { useSettings } from '@/lib/settings';
import { NAV_TARGETS } from '@/lib/nav';
import { rgba, heroFontSize } from '@/lib/hero';
import { handleFromUrl, safeHref } from '@/lib/helpers';

/* Cube filaire qui tourne en 3D */
function Cube({
  size,
  color,
  className,
  duration = 20,
  still,
}: {
  size: number;
  color: string;
  className: string;
  duration?: number;
  still?: boolean;
}) {
  const h = size / 2;
  const faces = [
    `rotateY(0deg) translateZ(${h}px)`,
    `rotateY(90deg) translateZ(${h}px)`,
    `rotateY(180deg) translateZ(${h}px)`,
    `rotateY(-90deg) translateZ(${h}px)`,
    `rotateX(90deg) translateZ(${h}px)`,
    `rotateX(-90deg) translateZ(${h}px)`,
  ];
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute ${className}`} style={{ width: size, height: size, perspective: 700 }}>
      <motion.div
        className="h-full w-full"
        style={{ transformStyle: 'preserve-3d', rotateX: still ? 25 : undefined, rotateY: still ? 35 : undefined }}
        animate={still ? undefined : { rotateX: [0, 360], rotateY: [0, 360] }}
        transition={{ duration, repeat: Infinity, ease: 'linear' }}
      >
        {faces.map((transform, i) => (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              transform,
              border: `2px solid ${color}`,
              background: rgba(color, 0.05),
              boxShadow: `0 0 14px ${rgba(color, 0.45)}, inset 0 0 14px ${rgba(color, 0.25)}`,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}

const LAYERS = 9;

export default function Footer() {
  const { settings, t } = useSettings();
  const reduced = !!useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { instagram, email } = settings.contact;
  const f = settings.footer;
  const name = settings.brand.name;
  const navItems = settings.nav.items.filter((i) => i.visible);

  // Inclinaison 3D du nom : suit la souris (ordinateur) ou se balance tout seul (mobile)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 80, damping: 18 });
  const sy = useSpring(my, { stiffness: 80, damping: 18 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-16, 16]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [12, -12]);

  useEffect(() => {
    if (reduced) return;
    if (!window.matchMedia('(hover: none)').matches) return;
    const a = animate(mx, [-0.35, 0.35], { duration: 5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' });
    const b = animate(my, [-0.15, 0.2], { duration: 7, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' });
    return () => {
      a.stop();
      b.stop();
    };
  }, [reduced, mx, my]);

  function onMove(e: React.PointerEvent) {
    if (reduced || e.pointerType === 'touch' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onLeave() {
    if (window.matchMedia('(hover: none)').matches) return;
    mx.set(0);
    my.set(0);
  }

  const band = [f.tagline, settings.hero.kicker, name].filter(Boolean);
  const bandRow = (key: string) => (
    <div key={key} className="flex flex-shrink-0 items-center gap-8 pr-8">
      {[...band, ...band].map((txt, i) => (
        <span key={i} className="flex items-center gap-8 whitespace-nowrap text-sm font-semibold uppercase tracking-[0.3em] text-white/50 md:text-base">
          {txt}
          <span className="text-neon-pink" style={{ textShadow: '0 0 10px #FF10A0' }}>✦</span>
        </span>
      ))}
    </div>
  );

  const linkCls = 'text-sm text-white/60 transition-colors hover:text-neon-green';

  return (
    <footer ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className="relative overflow-hidden bg-[#0C0C0C] pt-20 md:pt-28">
      {/* Décor de fond : lueurs + sol en perspective */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-neon-green/15 blur-[120px]"
          animate={reduced ? undefined : { x: [0, 60, 0], y: [0, 30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-40 top-40 h-96 w-96 rounded-full bg-neon-pink/15 blur-[120px]"
          animate={reduced ? undefined : { x: [0, -60, 0], y: [0, -30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-x-0 bottom-0 h-[55%] overflow-hidden" style={{ perspective: 500 }}>
          <div
            className="absolute inset-x-[-50%] bottom-0 h-[200%] origin-bottom"
            style={{
              transform: 'rotateX(68deg)',
              backgroundImage:
                'linear-gradient(rgba(255,16,160,0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,20,0.22) 1px, transparent 1px)',
              backgroundSize: '56px 56px',
              WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 70%)',
              maskImage: 'linear-gradient(to top, black 0%, transparent 70%)',
            }}
          />
        </div>
      </div>

      <Cube size={64} color="#39FF14" className="left-[6%] top-28 hidden sm:block" duration={22} still={reduced} />
      <Cube size={44} color="#FF10A0" className="right-[8%] top-44" duration={18} still={reduced} />
      <Cube size={90} color="#00F0FF" className="bottom-24 right-[14%] hidden md:block" duration={28} still={reduced} />
      <Cube size={36} color="#FF6B00" className="bottom-40 left-[12%] hidden md:block" duration={16} still={reduced} />

      {/* Bandeau défilant */}
      <div className="relative -rotate-1 border-y border-white/10 bg-black/40 py-3 backdrop-blur-sm">
        <div className="overflow-hidden">
          <motion.div
            className="flex w-max"
            animate={reduced ? undefined : { x: ['0%', '-50%'] }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          >
            {bandRow('a')}
            {bandRow('b')}
          </motion.div>
        </div>
      </div>

      {/* Nom en 3D */}
      <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-10 md:py-24" style={{ perspective: 1000 }}>
        <motion.div
          role="img"
          aria-label={name}
          className="relative mx-auto w-full select-none text-center font-black uppercase leading-none tracking-tight"
          style={{
            rotateX: reduced ? 0 : rotateX,
            rotateY: reduced ? 0 : rotateY,
            transformStyle: 'preserve-3d',
            fontSize: heroFontSize(name, 92),
            willChange: 'transform',
          }}
        >
          {Array.from({ length: LAYERS }, (_, i) => {
            const depth = LAYERS - 1 - i; // 0 = face avant
            return (
              <span
                key={i}
                aria-hidden="true"
                className="block whitespace-nowrap"
                style={{
                  position: depth === 0 ? 'relative' : 'absolute',
                  inset: depth === 0 ? undefined : 0,
                  transform: `translateZ(${-depth * 9}px)`,
                  color: depth === 0 ? '#F4F1E8' : depth % 2 ? '#FF10A0' : '#8a0a5c',
                  opacity: depth === 0 ? 1 : Math.max(0.12, 0.8 - depth * 0.09),
                  textShadow: depth === 0 ? '0 0 30px rgba(57,255,20,0.35)' : undefined,
                }}
              >
                {name}
              </span>
            );
          })}
        </motion.div>
      </div>

      {/* Liens */}
      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 pb-12 md:grid-cols-3 md:px-10">
        <div className="flex flex-col gap-4">
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-white/40">{t('footer.navigation')}</span>
          <nav className="flex flex-col gap-2.5">
            {navItems.map((item) => (
              <a key={item.id} href={NAV_TARGETS[item.id]} className={linkCls}>
                {item.label || t(`nav.${item.id}`)}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-4">
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-white/40">{t('footer.follow')}</span>
          <div className="flex flex-col gap-2.5">
            {instagram && (
              <a href={safeHref(instagram)} target="_blank" rel="noopener noreferrer" className={`${linkCls} inline-flex items-center gap-2`}>
                <Instagram size={16} /> {handleFromUrl(instagram)}
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} className={`${linkCls} inline-flex items-center gap-2 break-all`}>
                <Mail size={16} /> {email}
              </a>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {settings.i18n.enabled.length > 0 && <LangSwitch />}
          {f.text && <p className="max-w-sm text-sm leading-relaxed text-white/40">{f.text}</p>}
        </div>
      </div>

      {/* Droits d'auteur */}
      {f.showNotice && (
        <div className="relative mx-auto max-w-7xl px-5 pb-8 md:px-10">
          <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm md:flex-row md:items-center md:gap-6 md:p-6">
            <Copyright size={22} className="flex-shrink-0 text-neon-pink" style={{ filter: 'drop-shadow(0 0 4px #FF10A0)' }} />
            <p className="text-xs leading-relaxed text-white/50 md:text-sm">
              <strong className="font-semibold text-white/80">{t('footer.noticeTitle')}</strong> {t('footer.notice')}
            </p>
            <a
              href="#/legal"
              className="flex-shrink-0 self-start rounded-full border border-neon-pink/60 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-neon-pink transition-colors hover:bg-neon-pink hover:text-[#0C0C0C] md:self-center"
            >
              {t('footer.legal')}
            </a>
          </div>
        </div>
      )}

      {/* Barre du bas */}
      <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/10 px-5 py-8 md:flex-row md:px-10">
        <Brand size="footer" />
        <p className="text-center text-xs text-white/30">
          © {new Date().getFullYear()} {name}. {t('footer.rights')}
        </p>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 transition-colors hover:text-neon-green"
        >
          <ArrowUp size={14} /> {t('footer.top')}
        </button>
      </div>
    </footer>
  );
}
