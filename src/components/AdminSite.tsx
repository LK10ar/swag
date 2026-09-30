import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Plus, Trash2, Upload } from 'lucide-react';
import { fetchSettings, saveSettings, uploadFile, type SiteSettings, type Stat } from '@/lib/api';
import { mergeSettings } from '@/lib/settings';
import { ACCENT_MAP, type AccentColor } from '@/lib/photos';

const INPUT =
  'w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-neon-green focus:outline-none';
const BTN =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-40';
const BTN_PRIMARY =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-neon-green px-4 py-2 text-sm font-bold text-[#0C0C0C] transition-opacity hover:opacity-80 disabled:opacity-40';
const CARD = 'flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5';

type OnError = (e: unknown) => void;

/* Une image : URL, envoi de fichier, aperçu, bouton retirer */
function ImageField({
  label,
  value,
  onChange,
  onError,
  clearable = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onError: OnError;
  clearable?: boolean;
}) {
  const [busy, setBusy] = useState(false);

  async function pick(file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      onChange((await uploadFile(file)).url);
    } catch (e) {
      onError(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-white/80">{label}</span>
      <div className="flex items-start gap-3">
        {value ? (
          <img src={value} alt="" className="h-20 w-28 flex-shrink-0 rounded-lg border border-white/10 object-cover" />
        ) : (
          <div className="flex h-20 w-28 flex-shrink-0 items-center justify-center rounded-lg border border-dashed border-white/20 text-xs text-white/30">
            Aucune
          </div>
        )}
        <div className="flex flex-1 flex-col gap-2">
          <input className={INPUT} placeholder="URL de l'image" value={value} onChange={(e) => onChange(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            <label className={`${BTN} cursor-pointer`}>
              <Upload size={14} /> {busy ? 'Envoi…' : 'Envoyer un fichier'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={busy}
                onChange={(e) => {
                  pick(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
            </label>
            {clearable && value && (
              <button type="button" className={`${BTN} text-neon-pink`} onClick={() => onChange('')}>
                <Trash2 size={14} /> Retirer la photo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Une liste d'images (carrousel) : ajout par fichiers ou URLs, ordre, suppression */
function ImageList({
  label,
  urls,
  onChange,
  onError,
}: {
  label: string;
  urls: string[];
  onChange: (u: string[]) => void;
  onError: OnError;
}) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState('');

  function move(i: number, dir: -1 | 1) {
    const a = [...urls];
    [a[i], a[i + dir]] = [a[i + dir], a[i]];
    onChange(a);
  }

  async function onFiles(files: FileList | null) {
    if (!files) return;
    const added: string[] = [];
    try {
      for (const file of Array.from(files)) {
        setBusy(`Envoi ${added.length + 1}/${files.length}…`);
        added.push((await uploadFile(file)).url);
      }
    } catch (e) {
      onError(e);
    } finally {
      setBusy('');
      if (added.length) onChange([...urls, ...added]);
    }
  }

  const icon =
    'flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-white hover:text-black disabled:opacity-30';

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium text-white/80">
        {label} ({urls.length})
      </span>
      <div className="grid gap-3 md:grid-cols-2">
        <label className={`${BTN} cursor-pointer`}>
          <Upload size={14} /> {busy || 'Envoyer des fichiers'}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={!!busy}
            onChange={(e) => {
              onFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </label>
        <div className="flex gap-2">
          <textarea
            className={`${INPUT} h-[38px] min-h-[38px] resize-y`}
            placeholder="Ou colle des URLs (une par ligne)"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            type="button"
            className={BTN}
            disabled={!text.trim()}
            onClick={() => {
              const list = text.split('\n').map((u) => u.trim()).filter((u) => /^https?:\/\//.test(u));
              if (list.length) onChange([...urls, ...list]);
              setText('');
            }}
          >
            <Plus size={14} /> Ajouter
          </button>
        </div>
      </div>

      {urls.length === 0 ? (
        <p className="text-sm text-white/40">Aucune image : cette rangée sera masquée sur le site.</p>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {urls.map((u, i) => (
            <div key={`${u}-${i}`} className="relative overflow-hidden rounded-lg border border-white/10">
              <img src={u} alt="" className="h-24 w-full object-cover" loading="lazy" />
              <div className="absolute inset-x-1 bottom-1 flex justify-between">
                <div className="flex gap-1">
                  <button className={icon} disabled={i === 0} onClick={() => move(i, -1)} aria-label="Déplacer à gauche">
                    <ArrowLeft size={12} />
                  </button>
                  <button className={icon} disabled={i === urls.length - 1} onClick={() => move(i, 1)} aria-label="Déplacer à droite">
                    <ArrowRight size={12} />
                  </button>
                </div>
                <button className={icon} onClick={() => onChange(urls.filter((_, k) => k !== i))} aria-label="Supprimer">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Page « Site » ------------------------------ */

export default function AdminSite({ onError }: { onError: OnError }) {
  const [s, setS] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings()
      .then((d) => setS(mergeSettings(d)))
      .catch(onError);
  }, [onError]);

  if (!s) return <p className="py-24 text-center text-white/40">Chargement…</p>;

  function patch<K extends keyof SiteSettings>(key: K, value: Partial<SiteSettings[K]>) {
    setSaved(false);
    setS((cur) => (cur ? ({ ...cur, [key]: { ...cur[key], ...value } } as SiteSettings) : cur));
  }

  function setStat(i: number, value: Partial<Stat>) {
    if (!s) return;
    patch('about', { stats: s.about.stats.map((st, k) => (k === i ? { ...st, ...value } : st)) });
  }

  async function save() {
    if (!s) return;
    setSaving(true);
    try {
      setS(mergeSettings(await saveSettings(s)));
      setSaved(true);
    } catch (e) {
      onError(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-5 py-8 md:px-10">
      {/* Header */}
      <section className={CARD}>
        <h2 className="text-lg font-bold text-white">Header (haut de page)</h2>
        <ImageField label="Photo de fond" value={s.hero.base} onChange={(v) => patch('hero', { base: v })} onError={onError} />
        <ImageField
          label="Photo révélée sous la souris (effet projecteur)"
          value={s.hero.reveal}
          onChange={(v) => patch('hero', { reveal: v })}
          onError={onError}
        />
        <p className="text-xs text-white/40">Si tu vides un champ, la photo par défaut du site est utilisée.</p>
      </section>

      {/* À propos */}
      <section className={CARD}>
        <h2 className="text-lg font-bold text-white">À propos</h2>
        <ImageField
          label="Photo"
          value={s.about.image}
          onChange={(v) => patch('about', { image: v })}
          onError={onError}
          clearable
        />
        <label className="flex flex-col gap-2 text-sm text-white/80">
          Titre
          <textarea
            className={`${INPUT} min-h-[80px]`}
            value={s.about.heading}
            onChange={(e) => patch('about', { heading: e.target.value })}
          />
          <span className="text-xs text-white/40">
            Couleurs : *mot* = vert, ~mot~ = rose, ^mot^ = orange. Un retour à la ligne crée une nouvelle ligne.
          </span>
        </label>
        <label className="flex flex-col gap-2 text-sm text-white/80">
          Texte
          <textarea
            className={`${INPUT} min-h-[120px]`}
            value={s.about.paragraph}
            onChange={(e) => patch('about', { paragraph: e.target.value })}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-white/80">
          Ligne « en tournée avec… » (vide = masquée)
          <input className={INPUT} value={s.about.touring} onChange={(e) => patch('about', { touring: e.target.value })} />
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-white/80">Chiffres ({s.about.stats.length}/8)</span>
          {s.about.stats.map((st, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <input className={`${INPUT} !w-24`} placeholder="250+" value={st.value} onChange={(e) => setStat(i, { value: e.target.value })} />
              <input className={`${INPUT} min-w-[140px] flex-1`} placeholder="Shows Shot" value={st.label} onChange={(e) => setStat(i, { label: e.target.value })} />
              <select
                className={`${INPUT} !w-auto`}
                value={st.color}
                onChange={(e) => setStat(i, { color: e.target.value as AccentColor })}
                style={{ color: ACCENT_MAP[st.color]?.raw }}
              >
                {(Object.keys(ACCENT_MAP) as AccentColor[]).map((c) => (
                  <option key={c} value={c} className="bg-[#0C0C0C]">
                    {c}
                  </option>
                ))}
              </select>
              <button
                className={`${BTN} text-neon-pink`}
                onClick={() => patch('about', { stats: s.about.stats.filter((_, k) => k !== i) })}
                aria-label="Supprimer ce chiffre"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {s.about.stats.length < 8 && (
            <button
              className={`${BTN} self-start`}
              onClick={() => patch('about', { stats: [...s.about.stats, { value: '', label: '', color: 'green' }] })}
            >
              <Plus size={14} /> Ajouter un chiffre
            </button>
          )}
        </div>
      </section>

      {/* Carrousel */}
      <section className={CARD}>
        <h2 className="text-lg font-bold text-white">Carrousel</h2>
        <label className="flex flex-col gap-2 text-sm text-white/80">
          Titre du carrousel (vide = masqué)
          <input className={INPUT} value={s.marquee.label} onChange={(e) => patch('marquee', { label: e.target.value })} />
        </label>
        <ImageList label="Rangée du haut" urls={s.marquee.topRow} onChange={(u) => patch('marquee', { topRow: u })} onError={onError} />
        <ImageList label="Rangée du bas" urls={s.marquee.bottomRow} onChange={(u) => patch('marquee', { bottomRow: u })} onError={onError} />
      </section>

      {/* Contact */}
      <section className={CARD}>
        <h2 className="text-lg font-bold text-white">Contact & réseaux</h2>
        <label className="flex flex-col gap-2 text-sm text-white/80">
          Lien Instagram (vide = masqué)
          <input className={INPUT} placeholder="https://www.instagram.com/…" value={s.contact.instagram} onChange={(e) => patch('contact', { instagram: e.target.value })} />
        </label>
        <label className="flex flex-col gap-2 text-sm text-white/80">
          Email affiché (vide = masqué)
          <input className={INPUT} type="email" placeholder="contact@…" value={s.contact.email} onChange={(e) => patch('contact', { email: e.target.value })} />
        </label>
        <label className="flex flex-col gap-2 text-sm text-white/80">
          Texte d'introduction
          <textarea className={`${INPUT} min-h-[80px]`} value={s.contact.intro} onChange={(e) => patch('contact', { intro: e.target.value })} />
        </label>
      </section>

      <div className="sticky bottom-4 flex items-center justify-end gap-3">
        {saved && <span className="rounded-lg bg-black/80 px-3 py-2 text-sm text-neon-green">Enregistré ✓</span>}
        <button className={BTN_PRIMARY} disabled={saving} onClick={save}>
          {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
        </button>
      </div>
    </div>
  );
}
