import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Work', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed left-0 top-6 z-50 md:top-8" style={{ mixBlendMode: 'difference' }}>
        <a href="#" className="flex items-center gap-2 pl-5 md:pl-10">
          <Camera size={28} className="text-neon-green" style={{ filter: 'drop-shadow(0 0 6px #39FF14)' }} />
          <span className="text-xl font-extrabold tracking-tight text-white">swagtrickryan</span>
        </a>
      </div>

      <div className="fixed right-0 top-4 z-50 md:top-6">
        <div className="pr-5 md:pr-10">
          <button
            onClick={() => setOpen(!open)}
            className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-md transition-colors duration-300 hover:bg-white hover:text-black"
            aria-label="Toggle menu"
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
            className="fixed right-2 top-20 z-40 w-[calc(100%-1rem)] rounded-2xl border border-white/10 bg-black/95 p-8 backdrop-blur-xl md:right-7 md:top-24 md:w-96"
          >
            <nav className="flex flex-col gap-3">
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="text-3xl font-bold tracking-tight text-white transition-colors hover:text-neon-green md:text-4xl"
                >
                  {link.label}
                </motion.a>
              ))}
            </nav>
            <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6">
              <a href="mailto:shoot@voltphoto.studio" className="text-sm text-white/60 transition-colors hover:text-white">
                shoot@voltphoto.studio
              </a>
              <div className="flex gap-5">
                {['Instagram', 'Behance', '500px'].map((s) => (
                  <a key={s} href="#" className="text-xs text-white/40 underline underline-offset-2 transition-colors hover:text-neon-pink">
                    {s}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
