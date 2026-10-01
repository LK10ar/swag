import { ICONS } from '@/lib/icons';
import { useSettings } from '@/lib/settings';

/** Logo du site : icône (ou image PNG) + nom, réglables dans l'admin */
export default function Brand({ size = 'nav' }: { size?: 'nav' | 'footer' }) {
  const { settings } = useSettings();
  const b = settings.brand;
  const px = size === 'nav' ? 28 : 20;
  const Icon = ICONS[b.icon] ?? ICONS.camera;

  return (
    <span className="inline-flex items-center gap-2">
      {b.iconMode === 'icon' && (
        <Icon size={px} style={{ color: b.iconColor, filter: `drop-shadow(0 0 6px ${b.iconColor})` }} />
      )}
      {b.iconMode === 'image' && b.logoImage && (
        <img src={b.logoImage} alt="" style={{ height: 100 }} className="w-auto max-w-[250px] object-contain" />
      )}
      <span
        className={`${size === 'nav' ? 'text-xl' : 'text-lg'} font-extrabold tracking-tight text-white`}
      >
        {b.name}
      </span>
    </span>
  );
}
