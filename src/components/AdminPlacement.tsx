import { useCallback, useEffect, useRef, useState } from 'react';
import { Copy, EyeOff, Monitor, Plus, Smartphone, Trash2, Upload } from 'lucide-react';
import { uploadFile, type SiteSettings } from '@/lib/api';
import { getPath } from '@/lib/translatable';
import { effectiveDecor } from './DecorLayer';
import type { Decor, DecorShape } from '@/lib/siteTypes';

const INPUT =
  'w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-neon-green focus:outline-none';
const BTN =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-40';

type Area = { id: string; label: string; path: string; scroll: string };
const AREAS: Area[] = [
  { id: 'hero', label: 'Accueil', path: 'hero.decor', scroll: 'top' },
  { id: 'marquee', label: 'Carrousel', path: 'extraDecor.marquee', scroll: 'marquee' },
  { id: 'about', label: 'À propos', path: 'about.decor', scroll: 'about' },
  { id: 'services', label: 'Services', path: 'services.decor', scroll: 'services' },
  { id: 'projects', label: 'Projets', path: 'extraDecor.projects', scroll: 'work' },
  { id: 'gallery', label: 'Galerie', path: 'extraDecor.gallery', scroll: 'gallery' },
  { id: 'contact', label: 'Contact', path: 'contact.decor', scroll: 'contact' },
  { id: 'footer', label: 'Pied de page', path: 'extraDecor.footer', scroll: 'footer' },
];

const SHAPES: [DecorShape, string][] = [
  ['circle', '● Cercle'],
  ['square', '■ Carré'],
  ['triangle', '▲ Triangle'],
  ['diamond', '◆ Losange'],
  ['star', '★ Étoile'],
  ['heart', '♥ Cœur'],
];

const newDecor = (shape: DecorShape, image = ''): Decor => ({
  id: `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
  shape,
  color: '#FF10A0',
  size: shape === 'png' ? 140 : 90,
  x: 50,
  y: 40,
  rotate: 0,
  opacity: 90,
  filled: false,
  glow: true,
  float: false,
  image,
});

type Props = { s: SiteSettings; set: (path: string, value: unknown) => void; onError: (e: unknown) => void };

export default function AdminPlacement({ s, set, onError }: Props) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [areaId, setAreaId] = useState('hero');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [boxW, setBoxW] = useState(800);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const sRef = useRef(s);
  sRef.current = s;

  const area = AREAS.find((a) => a.id === areaId) ?? AREAS[0];
  const list = (getPath(s, area.path.split('.')) as Decor[] | undefined) ?? [];
  const selected = list.find((d) => d.id === selectedId) ?? null;
  const mobile = device === 'mobile';

  const post = useCallback((msg: Record<string, unknown>) => {
    iframeRef.current?.contentWindow?.postMessage({ source: 'swag-admin', ...msg }, window.location.origin);
  }, []);

  // Modifications venues de l'aperçu (glisser, redimensionner)
  const patchDecor = useCallback(
    (aId: string, id: string, patch: Record<string, unknown>) => {
      const a = AREAS.find((x) => x.id === aId);
      if (!a) return;
      const cur = (getPath(sRef.current, a.path.split('.')) as Decor[] | undefined) ?? [];
      set(
        a.path,
        cur.map((d) => (d.id === id ? { ...d, ...patch, m: patch.m ? { ...d.m, ...(patch.m as object) } : d.m } : d)),
      );
    },
    [set],
  );

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.data?.source !== 'swag-preview') return;
      if (e.source !== iframeRef.current?.contentWindow) return;
      const d = e.data;
      if (d.type === 'ready') setReady(true);
      else if (d.type === 'select') {
        if (d.selected) {
          setAreaId(d.selected.area);
          setSelectedId(d.selected.id);
        } else setSelectedId(null);
      } else if (d.type === 'decor-update') patchDecor(d.area, d.id, d.patch);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [patchDecor]);

  useEffect(() => {
    if (ready) post({ type: 'settings', settings: s });
  }, [ready, s, post]);

  useEffect(() => {
    if (ready) post({ type: 'select', selected: selectedId ? { area: areaId, id: selectedId } : null });
  }, [ready, areaId, selectedId, post]);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBoxW(el.clientWidth));
    ro.observe(el);
    setBoxW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  function goArea(id: string) {
    setAreaId(id);
    setSelectedId(null);
    const a = AREAS.find((x) => x.id === id);
    if (a) post({ type: 'scroll', id: a.scroll });
  }

  function add(shape: DecorShape, image = '') {
    const d = newDecor(shape, image);
    set(area.path, [...list, d]);
    setSelectedId(d.id);
  }

  async function addPng(file?: File | null) {
    if (!file) return;
    setBusy(true);
    try {
      const { url } = await uploadFile(file);
      add('png', url);
    } catch (e) {
      onError(e);
    } finally {
      setBusy(false);
    }
  }

  const idx = selected ? list.findIndex((d) => d.id === selected.id) : -1;
  const edit = (patch: Partial<Decor>) => selected && patchDecor(areaId, selected.id, patch);
  const editM = (patch: NonNullable<Decor['m']>) => selected && patchDecor(areaId, selected.id, { m: patch });
  const eff = selected ? effectiveDecor(selected, mobile) : null;

  const W = mobile ? 375 : 1280;
  const H = mobile ? 720 : 760;
  const scale = Math.min(1, boxW / W);

  const row = 'flex items-center gap-3 text-sm text-white/80';
  const slider = (label: string, value: number, min: number, max: number, on: (v: number) => void) => (
    <label className={row}>
      <span className="w-28 flex-shrink-0">{label}</span>
      <input type="range" min={min} max={max} value={value} onChange={(e) => on(Number(e.target.value))} className="flex-1 accent-[#39FF14]" />
      <input type="number" min={min} max={max} value={value} onChange={(e) => on(Number(e.target.value))} className={`${INPUT} !w-20`} />
    </label>
  );

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
        <div>
          <h2 className="text-lg font-bold text-white">Placement des éléments en direct</h2>
          <p className="mt-1 text-xs text-white/40">
            Tu vois le vrai site. Clique sur un élément pour le sélectionner, <strong className="text-white/70">glisse-le</strong> pour le déplacer, tire le
            <strong className="text-white/70"> point blanc</strong> pour changer sa taille. N'oublie pas d'enregistrer.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex overflow-hidden rounded-lg border border-white/20">
            <button
              type="button"
              onClick={() => setDevice('desktop')}
              className={`flex items-center gap-2 px-4 py-2 text-sm ${device === 'desktop' ? 'bg-neon-green/15 text-neon-green' : 'text-white/60 hover:bg-white/5'}`}
            >
              <Monitor size={16} /> Ordinateur
            </button>
            <button
              type="button"
              onClick={() => setDevice('mobile')}
              className={`flex items-center gap-2 px-4 py-2 text-sm ${device === 'mobile' ? 'bg-neon-green/15 text-neon-green' : 'text-white/60 hover:bg-white/5'}`}
            >
              <Smartphone size={16} /> Mobile
            </button>
          </div>
          {mobile && <span className="text-xs text-neon-green">Tu règles ici la version téléphone : l'ordinateur n'est pas modifié.</span>}
        </div>

        <div className="flex flex-wrap gap-2">
          {AREAS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => goArea(a.id)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                areaId === a.id ? 'border-neon-green bg-neon-green/10 text-neon-green' : 'border-white/15 text-white/60 hover:border-white/40'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-black/20 p-3">
          <span className="mr-1 text-sm text-white/60">Ajouter dans « {area.label} » :</span>
          {SHAPES.map(([shape, label]) => (
            <button key={shape} type="button" className={BTN} onClick={() => add(shape)}>
              {label}
            </button>
          ))}
          <label className={`${BTN} cursor-pointer`}>
            <Upload size={14} /> {busy ? 'Envoi…' : 'Mon design PNG'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                addPng(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </label>
        </div>

        <div ref={boxRef} className="w-full">
          <div
            className="relative mx-auto overflow-hidden rounded-xl border border-white/15 bg-[#0C0C0C]"
            style={{ width: W * scale, height: H * scale }}
          >
            {!ready && <p className="absolute inset-0 z-10 flex items-center justify-center text-sm text-white/40">Chargement de l'aperçu…</p>}
            <iframe
              ref={iframeRef}
              title="Aperçu du site"
              src={`${window.location.pathname}#/preview`}
              style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: 'top left', border: 0, background: '#0C0C0C' }}
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-bold text-white">
          Éléments de « {area.label} » ({list.length})
        </h3>
        {list.length === 0 && <p className="text-xs text-white/40">Aucun élément ici. Utilise les boutons « Ajouter » ci-dessus.</p>}
        <div className="flex flex-wrap gap-2">
          {list.map((d, i) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setSelectedId(d.id)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm ${
                selectedId === d.id ? 'border-neon-green bg-neon-green/10 text-white' : 'border-white/15 text-white/60 hover:border-white/40'
              }`}
            >
              <span className="h-3 w-3 rounded-full border border-white/30" style={{ background: d.color }} />
              {d.shape === 'png' ? 'PNG' : SHAPES.find(([v]) => v === d.shape)?.[1].slice(2) ?? d.shape} {i + 1}
            </button>
          ))}
        </div>

        {selected && eff && (
          <div className="mt-2 flex flex-col gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-bold text-neon-green">
                Élément sélectionné {mobile && '· version mobile'}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={BTN}
                  onClick={() => {
                    const copy = { ...selected, id: newDecor('circle').id, x: Math.min(selected.x + 5, 100), y: Math.min(selected.y + 5, 100) };
                    set(area.path, [...list, copy]);
                    setSelectedId(copy.id);
                  }}
                >
                  <Copy size={14} /> Dupliquer
                </button>
                <button
                  type="button"
                  className={`${BTN} text-neon-pink`}
                  onClick={() => {
                    set(area.path, list.filter((d) => d.id !== selected.id));
                    setSelectedId(null);
                  }}
                >
                  <Trash2 size={14} /> Supprimer
                </button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm text-white/80">
                Forme
                <select className={INPUT} value={selected.shape} onChange={(e) => edit({ shape: e.target.value as DecorShape })}>
                  {SHAPES.map(([v, l]) => (
                    <option key={v} value={v} className="bg-[#0C0C0C]">
                      {l}
                    </option>
                  ))}
                  <option value="png" className="bg-[#0C0C0C]">
                    Image PNG
                  </option>
                </select>
              </label>
              <label className={row}>
                <input
                  type="color"
                  value={/^#[0-9a-fA-F]{6}$/.test(selected.color) ? selected.color : '#ff10a0'}
                  onChange={(e) => edit({ color: e.target.value })}
                  className="h-9 w-12 cursor-pointer rounded border border-white/15 bg-transparent p-0.5"
                />
                Couleur
              </label>
              {slider(mobile ? 'Taille (mobile)' : 'Taille', Math.round(eff.size), 16, 700, (v) => (mobile ? editM({ size: v }) : edit({ size: v })))}
              {slider('Rotation', selected.rotate, -180, 180, (v) => edit({ rotate: v }))}
              {slider(mobile ? 'Gauche → droite (mobile)' : 'Gauche → droite', Math.round(eff.x), -20, 120, (v) => (mobile ? editM({ x: v }) : edit({ x: v })))}
              {slider(mobile ? 'Haut → bas (mobile)' : 'Haut → bas', Math.round(eff.y), -20, 120, (v) => (mobile ? editM({ y: v }) : edit({ y: v })))}
              {slider('Opacité', selected.opacity, 5, 100, (v) => edit({ opacity: v }))}
              <div className="flex flex-col gap-2 text-sm text-white/80">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={selected.filled} onChange={(e) => edit({ filled: e.target.checked })} className="h-4 w-4 accent-[#39FF14]" />
                  Forme pleine
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={selected.glow} onChange={(e) => edit({ glow: e.target.checked })} className="h-4 w-4 accent-[#39FF14]" />
                  Lueur néon
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={selected.float} onChange={(e) => edit({ float: e.target.checked })} className="h-4 w-4 accent-[#39FF14]" />
                  Flotte doucement
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selected.layer === 'front'}
                    onChange={(e) => edit({ layer: e.target.checked ? 'front' : 'back' })}
                    className="h-4 w-4 accent-[#39FF14]"
                  />
                  Devant le texte (sinon derrière)
                </label>
                {mobile && (
                  <label className="flex items-center gap-2 text-neon-green">
                    <input type="checkbox" checked={!!selected.m?.hide} onChange={(e) => editM({ hide: e.target.checked })} className="h-4 w-4 accent-[#39FF14]" />
                    <EyeOff size={14} /> Masquer sur mobile
                  </label>
                )}
              </div>
            </div>

            {selected.shape === 'png' && (
              <div className="flex flex-col gap-2">
                <input className={INPUT} placeholder="URL de l'image PNG" value={selected.image} onChange={(e) => edit({ image: e.target.value })} />
                <label className={`${BTN} cursor-pointer self-start`}>
                  <Upload size={14} /> Remplacer par un fichier
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      e.target.value = '';
                      if (!f) return;
                      try {
                        edit({ image: (await uploadFile(f)).url });
                      } catch (err) {
                        onError(err);
                      }
                    }}
                  />
                </label>
              </div>
            )}

            {mobile && (
              <button
                type="button"
                className={`${BTN} self-start`}
                onClick={() => patchDecor(areaId, selected.id, { m: undefined })}
              >
                Mobile : suivre l'ordinateur
              </button>
            )}
            <p className="text-xs text-white/30">Élément n°{idx + 1}</p>
          </div>
        )}
      </section>
    </div>
  );
}
