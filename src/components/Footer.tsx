import { Camera, Copyright, Instagram } from 'lucide-react';
import { useSettings } from '@/lib/settings';

export default function Footer() {
  const { settings } = useSettings();
  const instagram = settings.contact.instagram;

  return (
    <footer className="relative bg-[#0C0C0C]">
      <div className="mx-auto max-w-7xl px-5 pb-8 md:px-10">
        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:flex-row md:items-center md:gap-6 md:p-6">
          <Copyright size={22} className="flex-shrink-0 text-neon-pink" style={{ filter: 'drop-shadow(0 0 4px #FF10A0)' }} />
          <p className="text-xs leading-relaxed text-white/50 md:text-sm">
            <strong className="font-semibold text-white/80">Photos protégées par le droit d'auteur.</strong> Toute
            reproduction, copie, capture, modification ou diffusion sans autorisation écrite préalable est interdite et
            constitue un délit de contrefaçon, puni de 3 ans d'emprisonnement et de 300 000 € d'amende (art. L335-2 du
            Code de la propriété intellectuelle), sans préjudice des dommages et intérêts. Les contenus utilisés sans
            autorisation feront l'objet d'une demande de retrait et, le cas échéant, de poursuites.
          </p>
          <a
            href="#/legal"
            className="flex-shrink-0 self-start rounded-full border border-neon-pink/60 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-neon-pink transition-colors hover:bg-neon-pink hover:text-[#0C0C0C] md:self-center"
          >
            Mentions légales
          </a>
        </div>
      </div>

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
