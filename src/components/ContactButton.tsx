import { ArrowUpRight } from 'lucide-react';
import MagneticButton from './MagneticButton';
import { ACCENT_MAP, type AccentColor } from '@/lib/photos';

type Props = {
  label?: string;
  href?: string;
  accent?: AccentColor;
};

export default function ContactButton({
  label = 'Book a shoot',
  href = '#contact',
  accent = 'green',
}: Props) {
  const c = ACCENT_MAP[accent];

  return (
    <MagneticButton strength={0.2} className="inline-block">
      <a
        href={href}
        className="group relative flex items-center rounded-full border-2 bg-transparent p-1.5 transition-colors duration-300"
        style={{ borderColor: c.raw }}
      >
        <span
          className="absolute left-1.5 top-1.5 bottom-1.5 rounded-full transition-all duration-400 ease-out"
          style={{
            width: 'calc(100% - 12px - 56px)',
            background: c.raw,
          }}
        />
        <span
          className="relative z-10 px-8 py-3 text-base font-semibold whitespace-nowrap transition-colors duration-300"
          style={{ color: '#0C0C0C' }}
        >
          {label}
        </span>
        <span
          className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full flex-shrink-0 transition-transform duration-300 group-hover:rotate-45"
          style={{ background: '#0C0C0C' }}
        >
          <ArrowUpRight size={22} style={{ color: c.raw }} />
        </span>
      </a>
    </MagneticButton>
  );
}
