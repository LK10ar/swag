import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Decor } from '@/lib/siteTypes';
import { useSettings } from '@/lib/settings';
import { useIsMobile } from '@/lib/useMobile';

/** Position / taille réellement utilisées selon l'appareil (le mobile a ses propres réglages) */
export function effectiveDecor(d: Decor, mobile: boolean) {
  return {
    x: mobile && d.m?.x !== undefined ? d.m.x : d.x,
    y: mobile && d.m?.y !== undefined ? d.m.y : d.y,
    size: mobile ? d.m?.size ?? Math.max(16, Math.round(d.size * 0.7)) : d.size,
    hide: mobile && !!d.m?.hide,
  };
}

function ShapeSvg({ d }: { d: Decor }) {
  const p = { fill: d.filled ? d.color : 'none', stroke: d.color, strokeWidth: 4, strokeLinejoin: 'round' as const };
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" overflow="visible">
      {d.shape === 'circle' && <circle cx="50" cy="50" r="46" {...p} />}
      {d.shape === 'square' && <rect x="6" y="6" width="88" height="88" rx="8" {...p} />}
      {d.shape === 'triangle' && <polygon points="50,6 94,90 6,90" {...p} />}
      {d.shape === 'diamond' && <polygon points="50,4 96,50 50,96 4,50" {...p} />}
      {d.shape === 'star' && <polygon points="50,4 61,38 97,38 68,59 79,93 50,72 21,93 32,59 3,38 39,38" {...p} />}
      {d.shape === 'heart' && (
        <path d="M50 88 C20 62 6 44 6 28 A22 22 0 0 1 50 26 A22 22 0 0 1 94 28 C94 44 80 62 50 88Z" {...p} />
      )}
    </svg>
  );
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const r1 = (v: number) => Math.round(v * 10) / 10;

function Item({ d, area, mobile }: { d: Decor; area?: string; mobile: boolean }) {
  const { preview } = useSettings();
  const editing = !!preview && !!area;
  const selected = editing && preview!.selected?.id === d.id;
  const ref = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ x: number; y: number; size: number } | null>(null);
  const eff = effectiveDecor(d, mobile);

  if (d.shape === 'png' && !d.image && !editing) return null;
  if (eff.hide && !editing) return null;

  const x = drag?.x ?? eff.x;
  const y = drag?.y ?? eff.y;
  const size = drag?.size ?? eff.size;

  function start(e: React.PointerEvent, mode: 'move' | 'resize') {
    if (!editing || !preview || !ref.current) return;
    e.preventDefault();
    e.stopPropagation();
    preview.select(area!, d.id);
    const box = ref.current.offsetParent as HTMLElement | null;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const sx = e.clientX;
    const sy = e.clientY;
    const cur = { ...eff };
    let raf = 0;
    let last = { x: cur.x, y: cur.y, size: cur.size };

    const send = () => {
      raf = 0;
      const patch = mode === 'move' ? { x: r1(last.x), y: r1(last.y) } : { size: Math.round(last.size) };
      preview.update(area!, d.id, mobile ? { m: patch } : patch);
    };
    const onMove = (ev: PointerEvent) => {
      if (mode === 'move') {
        last = {
          ...last,
          x: clamp(cur.x + ((ev.clientX - sx) / rect.width) * 100, -30, 130),
          y: clamp(cur.y + ((ev.clientY - sy) / rect.height) * 100, -30, 130),
        };
      } else {
        const cx = rect.left + (rect.width * cur.x) / 100;
        const cy = rect.top + (rect.height * cur.y) / 100;
        last = { ...last, size: clamp((Math.hypot(ev.clientX - cx, ev.clientY - cy) * 2) / 1.4142, 16, 700) };
      }
      setDrag(last);
      if (!raf) raf = requestAnimationFrame(send);
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      if (raf) cancelAnimationFrame(raf);
      if (mode === 'move' ? last.x !== cur.x || last.y !== cur.y : last.size !== cur.size) send();
      setDrag(null);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  }

  const inner =
    d.shape === 'png' ? (
      d.image ? (
        <img src={d.image} alt="" className="h-full w-full object-contain" draggable={false} />
      ) : (
        <div className="flex h-full w-full items-center justify-center border border-dashed border-white/40 text-[10px] text-white/50">PNG</div>
      )
    ) : (
      <ShapeSvg d={d} />
    );

  return (
    <div
      ref={ref}
      aria-hidden="true"
      onPointerDown={editing ? (e) => start(e, 'move') : undefined}
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        transform: `translate(-50%, -50%) rotate(${d.rotate}deg)`,
        opacity: eff.hide ? 0.25 : d.opacity / 100,
        filter: d.glow && d.shape !== 'png' ? `drop-shadow(0 0 6px ${d.color}) drop-shadow(0 0 16px ${d.color}99)` : undefined,
        pointerEvents: editing ? 'auto' : 'none',
        cursor: editing ? 'move' : undefined,
        touchAction: editing ? 'none' : undefined,
        outline: editing ? (selected ? '2px dashed #ffffff' : '1px dashed rgba(255,255,255,0.35)') : undefined,
        outlineOffset: editing ? 4 : undefined,
      }}
    >
      {d.float && !editing ? (
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
      {selected && (
        <span
          onPointerDown={(e) => start(e, 'resize')}
          className="absolute -bottom-3 -right-3 h-5 w-5 rounded-full border-2 border-[#0C0C0C] bg-white"
          style={{ cursor: 'nwse-resize', touchAction: 'none' }}
        />
      )}
    </div>
  );
}

/**
 * Formes décoratives, positionnées en % de la zone parente (qui doit être `relative`).
 * `area` active le déplacement à la souris / au doigt dans l'aperçu en direct de l'admin.
 */
export default function DecorLayer({ items, area }: { items?: Decor[]; area?: string }) {
  const { preview } = useSettings();
  const mobile = useIsMobile();
  if (!items?.length) return null;
  const editing = !!preview && !!area;

  const groups: { z: number; list: Decor[] }[] = editing
    ? [{ z: 40, list: items }]
    : [
        { z: 0, list: items.filter((d) => d.layer !== 'front') },
        { z: 30, list: items.filter((d) => d.layer === 'front') },
      ];

  return (
    <>
      {groups
        .filter((g) => g.list.length)
        .map((g) => (
          <div key={g.z} aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ zIndex: g.z }}>
            {g.list.map((d) => (
              <Item key={d.id} d={d} area={area} mobile={mobile} />
            ))}
          </div>
        ))}
    </>
  );
}
