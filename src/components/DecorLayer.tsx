import { motion } from 'framer-motion';
import type { Decor } from '@/lib/siteTypes';

function ShapeSvg({ d }: { d: Decor }) {
  const p = { fill: d.filled ? d.color : 'none', stroke: d.color, strokeWidth: 4, strokeLinejoin: 'round' as const };
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" overflow="visible">
      {d.shape === 'circle' && <circle cx="50" cy="50" r="46" {...p} />}
      {d.shape === 'square' && <rect x="6" y="6" width="88" height="88" rx="8" {...p} />}
      {d.shape === 'triangle' && <polygon points="50,6 94,90 6,90" {...p} />}
      {d.shape === 'diamond' && <polygon points="50,4 96,50 50,96 4,50" {...p} />}
      {d.shape === 'star' && (
        <polygon points="50,4 61,38 97,38 68,59 79,93 50,72 21,93 32,59 3,38 39,38" {...p} />
      )}
      {d.shape === 'heart' && (
        <path d="M50 88 C20 62 6 44 6 28 A22 22 0 0 1 50 26 A22 22 0 0 1 94 28 C94 44 80 62 50 88Z" {...p} />
      )}
    </svg>
  );
}

/** Formes décoratives positionnées en % dans le parent (qui doit être `relative`). */
export default function DecorLayer({ items }: { items: Decor[] }) {
  if (!items?.length) return null;
  return (
    <>
      {items.map((d) => {
        if (d.shape === 'png' && !d.image) return null;
        const inner =
          d.shape === 'png' ? (
            <img src={d.image} alt="" className="h-full w-full object-contain" draggable={false} />
          ) : (
            <ShapeSvg d={d} />
          );
        return (
          <div
            key={d.id}
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{
              left: `${d.x}%`,
              top: `${d.y}%`,
              width: d.size,
              height: d.size,
              transform: `translate(-50%, -50%) rotate(${d.rotate}deg)`,
              opacity: d.opacity / 100,
              filter: d.glow && d.shape !== 'png' ? `drop-shadow(0 0 6px ${d.color}) drop-shadow(0 0 16px ${d.color}99)` : undefined,
            }}
          >
            {d.float ? (
              <motion.div
                className="h-full w-full"
                animate={{ y: [0, -14, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                {inner}
              </motion.div>
            ) : (
              inner
            )}
          </div>
        );
      })}
    </>
  );
}
