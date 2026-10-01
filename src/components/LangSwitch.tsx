import { LANGS } from '@/lib/i18n';
import { useSettings } from '@/lib/settings';

/** Sélecteur de langue : visible seulement si plusieurs langues sont activées dans l'admin */
export default function LangSwitch({ className = '' }: { className?: string }) {
  const { lang, langs, setLang } = useSettings();
  if (langs.length < 2) return null;
  return (
    <div className={`flex flex-wrap gap-2 ${className}`} role="group" aria-label="Language">
      {LANGS.filter((l) => langs.includes(l.code)).map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLang(l.code)}
          title={l.label}
          aria-pressed={lang === l.code}
          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
            lang === l.code
              ? 'border-neon-green bg-neon-green/10 text-neon-green'
              : 'border-white/15 text-white/50 hover:border-white/40 hover:text-white'
          }`}
        >
          {l.code}
        </button>
      ))}
    </div>
  );
}
