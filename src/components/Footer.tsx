import { Camera, Instagram } from 'lucide-react';
import { useSettings } from '@/lib/settings';

export default function Footer() {
  const { settings } = useSettings();
  const instagram = settings.contact.instagram;

  return (
    <footer className="relative bg-[#0C0C0C]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/10 px-5 py-8 md:flex-row md:px-10">
        <div className="flex items-center gap-2">
          <Camera size={18} className="text-neon-green" style={{ filter: 'drop-shadow(0 0 4px #39FF14)' }} />
          <span className="text-lg font-extrabold tracking-tight text-white">swagtrickryan</span>
          <span className="ml-2 text-xs text-white/30">Rock & Hard Rock Photography</span>
        </div>

        <div className="flex items-center gap-4">
          {instagram && (
            <a
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/60 transition-colors hover:border-neon-pink hover:text-neon-pink"
            >
              <Instagram size={16} />
            </a>
          )}
          <p className="text-xs text-white/30">© {new Date().getFullYear()} swagtrickryan. All frames reserved.</p>
        </div>
      </div>
    </footer>
  );
}
