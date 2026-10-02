import { ICONS } from '@/lib/icons';
import { useSettings } from '@/lib/settings';

/** Logo du site : icône (ou image PNG) + nom — tailles réglables dans l'admin */
export default function Brand({ size = 'nav' }: { size?: 'nav' | 'footer' }) {
  const { settings } = useSettings();
  const b = settings.brand;
  const k = size === 'nav' ? 1 : 0.75;
  const px = Math.round((b.logoSize || 28) * k);
  const text = Math.round((b.nameSize || 20) * (size === 'nav' ? 1 : 0.85));
  const Icon = ICONS[b.icon] ?? ICONS.camera;

  return (
    <span className="inline-flex items-center gap-2">
      {b.iconMode === 'icon' && (
        <Icon size={px} style={{ color: b.iconColor, filter: `drop-shadow(0 0 6px ${b.iconColor})` }} />
      )}
      {b.iconMode === 'image' && b.logoImage && (
        <img src={b.logoImage} alt="" style={{ height: px }} className="w-auto max-w-[45vw] object-contain" />
      )}
      <span className="font-extrabold tracking-tight text-white" style={{ fontSize: text }}>
        {b.name}
      </span>
    </span>
  );
}
