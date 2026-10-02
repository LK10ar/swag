import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Brand from './Brand';
import LangSwitch from './LangSwitch';
import { useSettings } from '@/lib/settings';
import { NAV_TARGETS } from '@/lib/nav';
import { handleFromUrl, safeHref } from '@/lib/helpers';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { settings, t, langs } = useSettings();
  const { email, instagram } = settings.contact;
  const items = settings.nav.items.filter((i) => i.visible);

  return (
    <>
      <div className="fixed left-0 top-6 z-50 md:top-8" style={{ mixBlendMode: settings.brand.blend ? 'difference' : 'normal' }}>
        <a href="#" className="flex items-center pl-5 md:pl-10" aria-label={settings.brand.name}>
          <Brand />
        </a>
      </div>

      <div className="fixed right-0 top-4 z-50 md:top-6">
        <div className="pr-5 md:pr-10">
          <button
            onClick={() => setOpen(!open)}
            className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-md transition-colors duration-300 hover:bg-white hover:text-black"
            aria-label="Menu"
            aria-expanded={open}
          >
            <AnimatePresence mode="wait">
              {open ? (
                <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                  <X size={24} />
                </motion.span>
              ) : (
                <motion.span key="bars" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} className="flex flex-col gap-1.5">
                  <span className="block h-0.5 w-6 bg-current" />
                  <span className="block h-0.5 w-6 bg-current" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed right-2 top-20 z-40 max-h-[calc(100svh-6rem)] w-[calc(100%-1rem)] overflow-y-auto rounded-2xl border border-white/10 bg-black/95 p-8 backdrop-blur-xl md:right-7 md:top-24 md:w-96"
          >
            <nav className="flex flex-col gap-3">
              {items.map((item, i) => (
                <motion.a
                  key={item.id}
                  href={NAV_TARGETS[item.id]}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="text-3xl font-bold tracking-tight text-white transition-colors hover:text-neon-green md:text-4xl"
                >
                  {item.label || t(`nav.${item.id}`)}
                </motion.a>
              ))}
            </nav>

            <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6">
              {email && (
                <a href={`mailto:${email}`} className="text-sm text-white/60 transition-colors hover:text-white">
                  {email}
                </a>
              )}
              {instagram && (
                <a
                  href={safeHref(instagram)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-white/40 underline underline-offset-2 transition-colors hover:text-neon-pink"
                >
                  Instagram {handleFromUrl(instagram)}
                </a>
              )}
              {langs.length > 1 && (
                <div className="mt-2 flex flex-col gap-2">
                  <span className="text-xs uppercase tracking-widest text-white/30">{t('menu.language')}</span>
                  <LangSwitch />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
