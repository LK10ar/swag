import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Plus, Rocket, Trash2, Upload, Wand2 } from 'lucide-react';
import {
  deploySite,
  fetchSettings,
  saveSettings,
  translateTexts,
  uploadFile,
  type SiteSettings,
} from '@/lib/api';
import { DEFAULT_SETTINGS, mergeSettings } from '@/lib/settings';
import { ACCENT_MAP, type AccentColor } from '@/lib/photos';
import { FONTS, loadFont } from '@/lib/fonts';
import { ICON_NAMES } from '@/lib/icons';
import { LANGS, translate, type LangCode } from '@/lib/i18n';
import { collectTexts, getPath, setPath, type TextField } from '@/lib/translatable';
import { looksUntranslated, translateLocal, translateRobust } from '@/lib/translateClient';
import type { Decor, DecorShape, ServiceItem } from '@/lib/siteTypes';
import DecorLayer from './DecorLayer';
import HeroTitleText from './HeroTitleText';
import AdminPlacement from './AdminPlacement';

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

/* ------------------------- Formulaire : contexte + champs ------------------------- */

type Ctx = { s: SiteSettings; set: (path: string, v: unknown) => void; onError: OnError };
const FormCtx = createContext<Ctx | null>(null);
function useForm(): Ctx {
  const c = useContext(FormCtx);
  if (!c) throw new Error('FormCtx manquant');
  return c;
}
const read = (s: SiteSettings, path: string) => getPath(s, path.split('.'));

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className={CARD}>
      <div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
        {hint && <p className="mt-1 text-xs text-white/40">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function TextF({
  label,
  path,
  rows,
  hint,
  placeholder,
}: {
  label: string;
  path: string;
  rows?: number;
  hint?: string;
  placeholder?: string;
}) {
  const { s, set } = useForm();
  const v = String(read(s, path) ?? '');
  return (
    <label className="flex flex-col gap-1.5 text-sm text-white/80">
      {label}
      {rows ? (
        <textarea className={INPUT} rows={rows} value={v} placeholder={placeholder} onChange={(e) => set(path, e.target.value)} />
      ) : (
        <input className={INPUT} value={v} placeholder={placeholder} onChange={(e) => set(path, e.target.value)} />
      )}
      {hint && <span className="text-xs text-white/40">{hint}</span>}
    </label>
  );
}

function ColorF({ label, path, clearable }: { label: string; path: string; clearable?: boolean }) {
  const { s, set } = useForm();
  const v = String(read(s, path) ?? '');
  return (
    <div className="flex items-center gap-2 text-sm text-white/80">
      <input
        type="color"
        value={/^#[0-9a-fA-F]{6}$/.test(v) ? v : '#ffffff'}
        onChange={(e) => set(path, e.target.value)}
        aria-label={label}
        className="h-9 w-12 flex-shrink-0 cursor-pointer rounded border border-white/15 bg-transparent p-0.5"
      />
      <span className="flex-1">{label}</span>
      <span className="font-mono text-xs text-white/40">{v || 'auto'}</span>
      {clearable && v && (
        <button type="button" className="text-xs text-white/50 underline" onClick={() => set(path, '')}>
          Réinitialiser
        </button>
      )}
    </div>
  );
}

function NumF({ label, path, min, max, step = 1 }: { label: string; path: string; min: number; max: number; step?: number }) {
  const { s, set } = useForm();
  const v = Number(read(s, path) ?? 0);
  return (
    <label className="flex items-center gap-3 text-sm text-white/80">
      <span className="w-28 flex-shrink-0">{label}</span>
      <input type="range" min={min} max={max} step={step} value={v} onChange={(e) => set(path, Number(e.target.value))} className="flex-1 accent-[#39FF14]" />
      <input type="number" min={min} max={max} step={step} value={v} onChange={(e) => set(path, Number(e.target.value))} className={`${INPUT} !w-20`} />
    </label>
  );
}

function SelF({ label, path, options }: { label: string; path: string; options: [string, string][] }) {
  const { s, set } = useForm();
  return (
    <label className="flex flex-col gap-1.5 text-sm text-white/80">
      {label}
      <select className={INPUT} value={String(read(s, path) ?? '')} onChange={(e) => set(path, e.target.value)}>
        {options.map(([v, l]) => (
          <option key={v} value={v} className="bg-[#0C0C0C]">
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}

function CheckF({ label, path, hint }: { label: string; path: string; hint?: string }) {
  const { s, set } = useForm();
  return (
    <label className="flex items-start gap-2 text-sm text-white/80">
      <input type="checkbox" checked={!!read(s, path)} onChange={(e) => set(path, e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#39FF14]" />
      <span>
        {label}
        {hint && <span className="block text-xs text-white/40">{hint}</span>}
      </span>
    </label>
  );
}

function ImgF({ label, path, clearable }: { label: string; path: string; clearable?: boolean }) {
  const { s, set, onError } = useForm();
  return <ImageField label={label} value={String(read(s, path) ?? '')} onChange={(v) => set(path, v)} onError={onError} clearable={clearable} />;
}

const ACCENTS = Object.keys(ACCENT_MAP) as AccentColor[];
const accentOptions: [string, string][] = ACCENTS.map((a) => [a, a]);

function useList<T>(path: string) {
  const { s, set } = useForm();
  const items = (read(s, path) as T[] | undefined) ?? [];
  return {
    items,
    add: (item: T) => set(path, [...items, item]),
    remove: (i: number) => set(path, items.filter((_, k) => k !== i)),
    move: (i: number, d: -1 | 1) => {
      const j = i + d;
      if (j < 0 || j >= items.length) return;
      const next = [...items];
      [next[i], next[j]] = [next[j], next[i]];
      set(path, next);
    },
  };
}

function ItemBar({ i, n, onMove, onRemove }: { i: number; n: number; onMove: (d: -1 | 1) => void; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-1">
      <button type="button" className={BTN} disabled={i === 0} onClick={() => onMove(-1)} aria-label="Monter">
        <ArrowUp size={14} />
      </button>
      <button type="button" className={BTN} disabled={i === n - 1} onClick={() => onMove(1)} aria-label="Descendre">
        <ArrowDown size={14} />
      </button>
      <button type="button" className={`${BTN} text-neon-pink`} onClick={onRemove} aria-label="Supprimer">
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function PlaceHint({ text }: { text?: string }) {
  return (
    <p className="rounded-lg border border-dashed border-white/15 p-3 text-xs text-white/50">
      {text ?? 'Pour ajouter des formes, cercles ou ton propre design PNG et les placer visuellement : onglet « Placement ».'}
    </p>
  );
}

/* ------------------------------- Panneaux ------------------------------- */

function IdentityPanel() {
  const { s } = useForm();
  return (
    <>
      <Section title="Logo & nom du site" hint="Le logo apparaît en haut à gauche et dans le pied de page.">
        <TextF label="Nom affiché" path="brand.name" />
        <SelF
          label="Pictogramme"
          path="brand.iconMode"
          options={[
            ['icon', 'Une icône'],
            ['image', 'Mon logo (image)'],
            ['none', 'Aucun (le nom seul)'],
          ]}
        />
        {s.brand.iconMode === 'icon' && (
          <div className="grid gap-3 md:grid-cols-2">
            <SelF label="Icône" path="brand.icon" options={ICON_NAMES.map((n) => [n, n])} />
            <ColorF label="Couleur de l'icône" path="brand.iconColor" />
          </div>
        )}
        {s.brand.iconMode === 'image' && <ImgF label="Logo (PNG / SVG)" path="brand.logoImage" />}
        {s.brand.iconMode !== 'none' && <NumF label="Taille du logo (px)" path="brand.logoSize" min={16} max={160} />}
        <NumF label="Taille du nom (px)" path="brand.nameSize" min={12} max={48} />
        <CheckF
          label="Adapter automatiquement la couleur du logo au fond"
          path="brand.blend"
          hint="Décoche si ton logo en image change de couleurs bizarrement selon la photo derrière."
        />
      </Section>

      <Section title="Favicon" hint="La petite icône de l'onglet du navigateur. PNG carré (512×512 conseillé), SVG ou ICO.">
        <ImgF label="Favicon" path="brand.favicon" clearable />
      </Section>

      <Section title="Police du site" hint="S'applique à tout le site (le grand nom d'accueil peut avoir sa propre police dans l'onglet Accueil).">
        <SelF label="Police" path="theme.font" options={FONTS.map((f) => [f.name, f.name])} />
        <FontPreview font={s.theme.font} />
      </Section>
    </>
  );
}

function FontPreview({ font }: { font: string }) {
  useEffect(() => {
    if (font) loadFont(font);
  }, [font]);
  return (
    <p className="rounded-lg border border-white/10 bg-black/30 p-4 text-2xl text-white" style={{ fontFamily: font ? `'${font}', sans-serif` : undefined }}>
      Raw energy. Sweat. Distortion. — 0123456789
    </p>
  );
}

function MenuPanel() {
  const { items, move } = useList<SiteSettings['nav']['items'][number]>('nav.items');
  return (
    <Section title="Menu" hint="Ordre, noms et visibilité des liens du menu burger. Un nom vide = le nom par défaut (traduit selon la langue).">
      {items.map((it, i) => (
        <div key={it.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-black/20 p-3">
          <span className="w-6 text-center text-sm font-bold text-neon-green">{i + 1}</span>
          <div className="min-w-[160px] flex-1">
            <TextF label="" path={`nav.items.${i}.label`} placeholder={translate('fr', `nav.${it.id}`)} />
          </div>
          <CheckF label="Visible" path={`nav.items.${i}.visible`} />
          <div className="flex gap-1">
            <button type="button" className={BTN} disabled={i === 0} onClick={() => move(i, -1)} aria-label="Monter">
              <ArrowUp size={14} />
            </button>
            <button type="button" className={BTN} disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="Descendre">
              <ArrowDown size={14} />
            </button>
          </div>
        </div>
      ))}
    </Section>
  );
}

function HeroPanel() {
  const { s, set } = useForm();
  const t = s.hero.title;
  const chars = Array.from(t.text || '');
  return (
    <>
      <Section title="Photos du header" hint="Si tu vides un champ, la photo par défaut du site est utilisée.">
        <ImgF label="Photo de fond" path="hero.base" />
        <ImgF label="Photo révélée sous la souris (effet projecteur)" path="hero.reveal" />
      </Section>

      <Section title="Textes & bouton">
        <TextF label="Sur-titre (vide = masqué)" path="hero.kicker" />
        <TextF
          label="Phrase d'accroche"
          path="hero.tagline"
          rows={3}
          hint="Couleurs : *mot* = vert, ~mot~ = rose, ^mot^ = orange. Un retour à la ligne crée une nouvelle ligne."
        />
        <div className="grid gap-3 md:grid-cols-2">
          <TextF label="Texte du bouton (vide = pas de bouton)" path="hero.buttonLabel" />
          <TextF label="Lien du bouton" path="hero.buttonHref" placeholder="#contact" />
        </div>
      </Section>

      <Section title="Grand nom animé" hint="Le gros texte qui bouge avec la souris, en bas du header.">
        <div className="overflow-hidden rounded-lg border border-white/10 bg-[#0C0C0C] p-4">
          <HeroTitleText title={t} fontSize="clamp(26px, 7vw, 64px)" />
        </div>
        <TextF label="Texte" path="hero.title.text" />
        <NumF label="Taille (%)" path="hero.title.scale" min={40} max={140} />
        <label className="flex flex-col gap-1.5 text-sm text-white/80">
          Police du grand nom
          <select
            className={INPUT}
            value={t.font}
            onChange={(e) => {
              set('hero.title.font', e.target.value);
              if (e.target.value) loadFont(e.target.value);
            }}
          >
            <option value="" className="bg-[#0C0C0C]">
              Police du site
            </option>
            {FONTS.map((f) => (
              <option key={f.name} value={f.name} className="bg-[#0C0C0C]">
                {f.name}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-3 md:grid-cols-2">
          <ColorF label="Couleur de toutes les lettres" path="hero.title.color" />
          <div className="flex flex-col gap-2">
            <CheckF label="Tout le nom clignote" path="hero.title.blinkAll" />
            <CheckF label="Lettres vides (seul le contour reste)" path="hero.title.transparentFill" />
          </div>
          <SelF
            label="Effet de lueur"
            path="hero.title.glow"
            options={[
              ['none', 'Aucun'],
              ['neon', 'Néon'],
              ['shadow', 'Ombre portée'],
            ]}
          />
          <ColorF label="Couleur de la lueur / ombre" path="hero.title.glowColor" clearable />
          <CheckF label="Contour" path="hero.title.outline" />
          <ColorF label="Couleur du contour" path="hero.title.outlineColor" clearable />
          <NumF label="Épaisseur contour" path="hero.title.outlineWidth" min={1} max={10} />
        </div>

        <div className="flex flex-col gap-2 rounded-lg border border-white/10 bg-black/20 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-white">Lettre par lettre</span>
            <button type="button" className={BTN} onClick={() => set('hero.title.letters', [])}>
              Tout effacer
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {chars.map((ch, i) =>
              ch.trim() ? (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2">
                  <span className="w-5 text-center text-lg font-black text-white">{ch.toUpperCase()}</span>
                  <input
                    type="color"
                    aria-label={`Couleur de la lettre ${ch}`}
                    value={/^#[0-9a-fA-F]{6}$/.test(t.letters[i]?.color ?? '') ? t.letters[i].color : /^#[0-9a-fA-F]{6}$/.test(t.color) ? t.color : '#f4f1e8'}
                    onChange={(e) => set(`hero.title.letters.${i}.color`, e.target.value)}
                    className="h-7 w-9 cursor-pointer rounded border border-white/15 bg-transparent p-0.5"
                  />
                  <label className="flex items-center gap-1 text-[11px] text-white/60" title="Clignote">
                    <input type="checkbox" checked={!!t.letters[i]?.blink} onChange={(e) => set(`hero.title.letters.${i}.blink`, e.target.checked)} className="accent-[#39FF14]" />
                    ✦
                  </label>
                  <label className="flex items-center gap-1 text-[11px] text-white/60" title="Néon">
                    <input type="checkbox" checked={!!t.letters[i]?.glow} onChange={(e) => set(`hero.title.letters.${i}.glow`, e.target.checked)} className="accent-[#39FF14]" />
                    ☼
                  </label>
                </div>
              ) : null,
            )}
          </div>
          <p className="text-xs text-white/40">✦ = la lettre clignote · ☼ = la lettre a un néon · la couleur de chaque lettre remplace la couleur générale.</p>
        </div>
      </Section>

      <Section title="Décorations du header">
        <PlaceHint />
      </Section>
    </>
  );
}

function AboutPanel() {
  const { s, set } = useForm();
  const { items: stats, add, remove } = useList<SiteSettings['about']['stats'][number]>('about.stats');
  return (
    <>
      <Section title="Photo & textes">
        <ImgF label="Photo (vide = pas de photo)" path="about.image" clearable />
        <TextF
          label="Titre"
          path="about.heading"
          rows={3}
          hint="Couleurs : *mot* = vert, ~mot~ = rose, ^mot^ = orange. Un retour à la ligne crée une nouvelle ligne."
        />
        <TextF label="Texte" path="about.paragraph" rows={5} />
        <TextF label="Ligne du dessous (vide = masquée)" path="about.touring" />
      </Section>

      <Section title={`Chiffres (${stats.length}/8)`}>
        {stats.map((st, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2">
            <div className="w-24">
              <TextF label="" path={`about.stats.${i}.value`} placeholder="250+" />
            </div>
            <div className="min-w-[140px] flex-1">
              <TextF label="" path={`about.stats.${i}.label`} placeholder="Shows Shot" />
            </div>
            <select
              className={`${INPUT} !w-auto`}
              value={st.color}
              onChange={(e) => set(`about.stats.${i}.color`, e.target.value)}
              style={{ color: ACCENT_MAP[st.color]?.raw }}
              aria-label="Couleur"
            >
              {ACCENTS.map((c) => (
                <option key={c} value={c} className="bg-[#0C0C0C]">
                  {c}
                </option>
              ))}
            </select>
            <button type="button" className={`${BTN} text-neon-pink`} onClick={() => remove(i)} aria-label="Supprimer ce chiffre">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {stats.length < 8 && (
          <button type="button" className={`${BTN} self-start`} onClick={() => add({ value: '', label: '', color: 'green' })}>
            <Plus size={14} /> Ajouter un chiffre
          </button>
        )}
      </Section>

      <Section title="Cercles & formes autour de la photo" hint="Les positions sont en % de la photo : 0 = bord gauche/haut, 100 = bord droit/bas.">
        <PlaceHint />
      </Section>
    </>
  );
}

function ServicesPanel() {
  const { items, add, remove, move } = useList<ServiceItem>('services.items');
  return (
    <>
      <Section title="Textes de la section">
        <TextF label="Sur-titre (vide = masqué)" path="services.kicker" />
        <TextF label="Titre" path="services.title" hint="Couleurs : *vert*, ~rose~, ^orange^." />
        <TextF label="Texte à droite du titre (vide = masqué)" path="services.note" rows={2} />
      </Section>

      <Section title={`Prestations (${items.length}/12)`}>
        {items.map((_, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-neon-green">#{i + 1}</span>
              <ItemBar i={i} n={items.length} onMove={(d) => move(i, d)} onRemove={() => remove(i)} />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <SelF label="Icône" path={`services.items.${i}.icon`} options={ICON_NAMES.map((n) => [n, n])} />
              <TextF label="Prix" path={`services.items.${i}.price`} placeholder="À partir de 450 €" />
              <SelF label="Couleur" path={`services.items.${i}.accent`} options={accentOptions} />
            </div>
            <TextF label="Titre" path={`services.items.${i}.title`} />
            <TextF label="Description" path={`services.items.${i}.description`} rows={2} />
          </div>
        ))}
        {items.length < 12 && (
          <button
            type="button"
            className={`${BTN} self-start`}
            onClick={() => add({ icon: 'camera', title: '', description: '', price: '', accent: 'green' })}
          >
            <Plus size={14} /> Ajouter une prestation
          </button>
        )}
      </Section>

      <Section title="Décorations de la section">
        <PlaceHint />
      </Section>
    </>
  );
}

function CarouselPanel() {
  const { s, set, onError } = useForm();
  return (
    <Section title="Carrousel" hint="Les deux rangées de photos qui défilent. Plus les vignettes sont petites sur mobile, plus on en voit à la fois.">
      <TextF label="Titre du carrousel (vide = masqué)" path="marquee.label" />
      <ImageList label="Rangée du haut" urls={s.marquee.topRow} onChange={(u) => set('marquee.topRow', u)} onError={onError} />
      <ImageList label="Rangée du bas" urls={s.marquee.bottomRow} onChange={(u) => set('marquee.bottomRow', u)} onError={onError} />
    </Section>
  );
}

function ContactPanel() {
  return (
    <>
      <Section title="Section contact">
        <TextF label="Sur-titre (vide = masqué)" path="contact.kicker" />
        <TextF label="Titre" path="contact.title" hint="Couleurs : *vert*, ~rose~, ^orange^." />
        <TextF label="Texte d'introduction" path="contact.intro" rows={3} />
        <TextF label="Texte du bouton rond (vide = « Contact »)" path="contact.ctaLabel" />
        <TextF label="Texte du bouton d'envoi (vide = « Envoyer »)" path="contact.buttonLabel" />
      </Section>
      <Section title="Formulaire" hint="Vide = texte par défaut, déjà traduit dans toutes les langues.">
        <div className="grid gap-3 md:grid-cols-3">
          <TextF label="Champ nom" path="contact.nameLabel" />
          <TextF label="Champ email" path="contact.emailLabel" />
          <TextF label="Champ message" path="contact.messageLabel" />
        </div>
        <TextF label="Titre après envoi" path="contact.sentTitle" />
        <TextF label="Texte après envoi" path="contact.sentText" rows={2} />
      </Section>
      <Section title="Coordonnées">
        <TextF label="Lien Instagram (vide = masqué)" path="contact.instagram" placeholder="https://www.instagram.com/…" />
        <TextF label="Email affiché (vide = masqué)" path="contact.email" placeholder="contact@…" />
      </Section>
      <Section title="Pied de page">
        <TextF label="Slogan (bandeau défilant)" path="footer.tagline" />
        <TextF label="Texte libre (vide = masqué)" path="footer.text" rows={2} />
        <CheckF label="Afficher l'encart « photos protégées par le droit d'auteur »" path="footer.showNotice" />
      </Section>
    </>
  );
}

function SeoPanel() {
  const { s, onError } = useForm();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const seo = s.seo;
  const url = seo.canonical || 'https://ton-site.github.io/';

  async function deploy() {
    setBusy(true);
    setNote('');
    try {
      await deploySite();
      setNote('Mise à jour lancée : le site se reconstruit (1 à 2 minutes). Pense à enregistrer avant !');
    } catch (e) {
      onError(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Section title="Référencement (SEO)" hint="Ce que Google et les réseaux sociaux affichent quand ton site est partagé ou trouvé.">
        <div className="rounded-lg border border-white/10 bg-white p-4">
          <p className="truncate text-xs text-[#202124]">{url}</p>
          <p className="truncate text-lg text-[#1a0dab]">{seo.title || s.brand.name}</p>
          <p className="line-clamp-2 text-sm text-[#4d5156]">{seo.description}</p>
        </div>
        <TextF label={`Titre de la page (${seo.title.length}/60 conseillés)`} path="seo.title" />
        <TextF label={`Description (${seo.description.length}/160 conseillés)`} path="seo.description" rows={3} />
        <TextF label="Mots-clés (séparés par des virgules)" path="seo.keywords" />
        <ImgF label="Image de partage (réseaux sociaux, 1200×630 conseillé)" path="seo.ogImage" clearable />
        <div className="grid gap-3 md:grid-cols-2">
          <TextF label="Auteur" path="seo.author" />
          <TextF label="Compte X / Twitter (ex. @nom)" path="seo.twitter" />
          <TextF label="Adresse officielle du site (canonical)" path="seo.canonical" placeholder="https://lk10ar.github.io/swag/" />
          <SelF
            label="Indexation par les moteurs de recherche"
            path="seo.robots"
            options={[
              ['index,follow', 'Oui, référencer le site'],
              ['noindex,nofollow', 'Non, cacher le site'],
            ]}
          />
        </div>
        <CheckF label="Données structurées (fiche « photographe » pour Google)" path="seo.schema" />
      </Section>

      <Section
        title="Appliquer au site"
        hint="Les visiteurs voient tes titres et ta description tout de suite. Les robots des réseaux sociaux, eux, les lisent à la reconstruction du site : lance-la après avoir enregistré."
      >
        <button type="button" className={`${BTN_PRIMARY} self-start`} disabled={busy} onClick={deploy}>
          <Rocket size={16} /> {busy ? 'Lancement…' : 'Reconstruire le site maintenant'}
        </button>
        {note && <p className="text-sm text-neon-green">{note}</p>}
      </Section>
    </>
  );
}

function LangPanel() {
  const { s, set, onError } = useForm();
  const def = s.i18n.defaultLang;
  const others = LANGS.filter((l) => l.code !== def);
  const [editRaw, setEdit] = useState<LangCode>(() => (s.i18n.enabled.find((c) => c !== def) as LangCode) ?? others[0].code);
  // si la langue principale change, la langue en cours d'édition doit rester une autre langue
  const edit: LangCode = others.some((l) => l.code === editRaw) ? editRaw : others[0].code;
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [diag, setDiag] = useState<string[]>([]);

  const enabled = new Set<LangCode>([def, ...s.i18n.enabled]);
  const toggle = (code: LangCode, on: boolean) => {
    const next = new Set(enabled);
    if (on) next.add(code);
    else next.delete(code);
    set('i18n.enabled', Array.from(next));
  };

  const fields = collectTexts(s);
  const tr = (lang: LangCode, path: string[]) => String(getPath(s.i18n.translations?.[lang], path) ?? '');
  const src = (lang: LangCode, path: string[]) => String(getPath(s.i18n.sources?.[lang], path) ?? '');
  const missing = (lang: LangCode, f: TextField) => !tr(lang, f.path).trim();
  const stale = (lang: LangCode, f: TextField) => !missing(lang, f) && !!src(lang, f.path) && src(lang, f.path) !== f.value;
  const same = (lang: LangCode, f: TextField) => !missing(lang, f) && looksUntranslated(f.value, tr(lang, f.path));
  const todoCount = (lang: LangCode) => fields.filter((f) => missing(lang, f) || stale(lang, f) || same(lang, f)).length;

  async function auto(langs: LangCode[], all: boolean) {
    setBusy(true);
    setNote('');
    try {
      let failed = 0;
      let reason = '';
      for (const lang of langs) {
        const todo = fields.filter((f) => all || missing(lang, f) || stale(lang, f) || same(lang, f));
        for (let i = 0; i < todo.length; i += 15) {
          const batch = todo.slice(i, i + 15);
          setNote(`Traduction en ${lang.toUpperCase()}… ${Math.min(i + 15, todo.length)}/${todo.length}`);
          const { out, error } = await translateRobust(batch.map((b) => b.value), lang);
          batch.forEach((b, k) => {
            const o = out[k];
            if (o) {
              set(`i18n.translations.${lang}.${b.path.join('.')}`, o);
              set(`i18n.sources.${lang}.${b.path.join('.')}`, b.value);
            } else failed++;
          });
          if (error) reason = error;
        }
      }
      setNote(
        failed
          ? `${failed} texte(s) n'ont pas pu être traduits. ${reason} — clique sur « Tester la traduction » pour voir pourquoi.`
          : 'Traduction terminée. Relis les textes, corrige si besoin, puis clique sur « Enregistrer les modifications ».',
      );
    } catch (e) {
      onError(e);
    } finally {
      setBusy(false);
    }
  }

  async function test() {
    setBusy(true);
    setDiag(['Test en cours…']);
    const sample = 'Je fige le chaos en images qui frappent plus fort que le riff.';
    const lines: string[] = [];
    try {
      const r = await translateTexts('auto', edit, [sample]);
      const used = Object.entries(r.engines ?? {})
        .map(([k, v]) => `${k} ×${v}`)
        .join(', ');
      lines.push(`Serveur : OK → « ${r.texts[0]} » (moteur : ${used || 'inconnu'})`);
      if (r.errors?.length) lines.push(`   Moteurs en échec (un autre a pris le relais) : ${r.errors.join(' · ')}`);
      if (looksUntranslated(sample, r.texts[0])) lines.push('   ⚠ Le texte est revenu inchangé : le serveur ne traduit pas vraiment.');
    } catch (e) {
      lines.push(`Serveur : ÉCHEC → ${e instanceof Error ? e.message : String(e)}`);
    }
    try {
      lines.push(`Navigateur (Google) : OK → « ${await translateLocal(sample + ' ', edit)} »`);
    } catch (e) {
      lines.push(`Navigateur (Google) : ÉCHEC → ${e instanceof Error ? e.message : String(e)}`);
    }
    setDiag(lines);
    setBusy(false);
  }

  const activeOthers = others.filter((l) => enabled.has(l.code)).map((l) => l.code);

  return (
    <>
      <Section title="Langues du site" hint="Un sélecteur de langue apparaît dans le menu et le pied de page dès que tu actives au moins une langue en plus de la principale.">
        <label className="flex flex-col gap-1.5 text-sm text-white/80">
          Langue principale (celle dans laquelle tu écris les textes)
          <select className={INPUT} value={def} onChange={(e) => set('i18n.defaultLang', e.target.value)}>
            {LANGS.map((l) => (
              <option key={l.code} value={l.code} className="bg-[#0C0C0C]">
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap gap-3">
          {others.map((l) => (
            <label key={l.code} className="flex items-center gap-2 text-sm text-white/80">
              <input type="checkbox" checked={enabled.has(l.code)} onChange={(e) => toggle(l.code, e.target.checked)} className="h-4 w-4 accent-[#39FF14]" />
              {l.label}
              {enabled.has(l.code) && todoCount(l.code) > 0 && (
                <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-[11px] text-orange-300">{todoCount(l.code)} à traduire</span>
              )}
            </label>
          ))}
        </div>
        <p className="text-xs text-white/40">
          Les textes fixes du site (menu, formulaire, boutons, galerie, pied de page) sont déjà traduits. Tes propres textes (accueil, à propos, services, contact…)
          sont traduits automatiquement quand tu enregistres. Seule la page « Mentions légales » reste en français.
        </p>
        <div className="flex flex-wrap gap-2">
          {activeOthers.length > 0 && (
            <button type="button" className={BTN_PRIMARY} disabled={busy} onClick={() => auto(activeOthers, false)}>
              <Wand2 size={16} /> Tout traduire dans toutes les langues activées
            </button>
          )}
          <button type="button" className={BTN} disabled={busy} onClick={test}>
            Tester la traduction ({edit.toUpperCase()})
          </button>
        </div>
        {note && <p className="text-sm text-neon-green">{note}</p>}
        {diag.length > 0 && (
          <pre className="whitespace-pre-wrap rounded-lg border border-white/10 bg-black/40 p-3 text-xs leading-relaxed text-white/80">{diag.join('\n')}</pre>
        )}
        <p className="text-xs text-white/40">
          Le serveur essaie DeepL (si tu as ajouté DEEPL_API_KEY sur Render), puis Google, puis MyMemory. Si le serveur échoue, le navigateur traduit
          lui-même avec Google. Et si un texte n'a vraiment aucune traduction, le navigateur du visiteur le traduit à la volée.
        </p>
      </Section>

      <Section title="Vérifier et corriger les traductions" hint="Quand tu modifies un texte, sa traduction est marquée « à retraduire ». Une traduction que tu corriges à la main est considérée comme à jour.">
        <div className="flex flex-wrap items-center gap-2">
          {others.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setEdit(l.code)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                edit === l.code ? 'border-neon-green bg-neon-green/10 text-neon-green' : 'border-white/15 text-white/60 hover:border-white/40'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={BTN} disabled={busy} onClick={() => auto([edit], false)}>
            <Wand2 size={16} /> Traduire ce qui manque ou a changé ({todoCount(edit)})
          </button>
          <button type="button" className={BTN} disabled={busy} onClick={() => confirm('Remplacer toutes les traductions de cette langue ?') && auto([edit], true)}>
            Tout retraduire
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {fields.map((f) => (
            <div key={f.path.join('.')} className="rounded-lg border border-white/10 bg-black/20 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-medium uppercase tracking-wider text-white/40">{f.label}</p>
                {missing(edit, f) && <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-[11px] text-orange-300">non traduit</span>}
                {stale(edit, f) && <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-[11px] text-yellow-300">à retraduire</span>}
                {same(edit, f) && <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[11px] text-red-300">identique au texte d'origine</span>}
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-white/50">{f.value}</p>
              <textarea
                rows={f.value.length > 90 ? 3 : 1}
                className={`${INPUT} mt-2`}
                placeholder={`Traduction (${edit})`}
                value={tr(edit, f.path)}
                onChange={(e) => {
                  set(`i18n.translations.${edit}.${f.path.join('.')}`, e.target.value);
                  set(`i18n.sources.${edit}.${f.path.join('.')}`, f.value);
                }}
              />
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

/** Traduit (dans toutes les langues activées) les textes sans traduction, modifiés ou rendus à l'identique. */
async function syncTranslations(
  cur: SiteSettings,
  progress: (m: string) => void,
): Promise<{ next: SiteSettings; failed: number; reason: string }> {
  const next = structuredClone(cur);
  const set = (path: string, v: unknown) => setPath(next as unknown as Record<string, unknown>, path.split('.'), v);
  const def = next.i18n.defaultLang;
  const langs = next.i18n.enabled.filter((l) => l !== def);
  const fields = collectTexts(next);
  let failed = 0;
  let reason = '';

  for (const lang of langs) {
    const todo: TextField[] = [];
    for (const f of fields) {
      const tr = String(getPath(next.i18n.translations?.[lang], f.path) ?? '').trim();
      const src = String(getPath(next.i18n.sources?.[lang], f.path) ?? '');
      if (!tr || looksUntranslated(f.value, tr)) todo.push(f);
      else if (!src) set(`i18n.sources.${lang}.${f.path.join('.')}`, f.value); // ancienne traduction : on la garde telle quelle
      else if (src !== f.value) todo.push(f);
    }
    for (let i = 0; i < todo.length; i += 15) {
      const batch = todo.slice(i, i + 15);
      progress(`Traduction en ${lang.toUpperCase()}… ${Math.min(i + 15, todo.length)}/${todo.length}`);
      const { out, error } = await translateRobust(batch.map((b) => b.value), lang);
      batch.forEach((b, k) => {
        const o = out[k];
        if (o) {
          set(`i18n.translations.${lang}.${b.path.join('.')}`, o);
          set(`i18n.sources.${lang}.${b.path.join('.')}`, b.value);
        } else failed++;
      });
      if (error) reason = error;
    }
  }
  return { next, failed, reason };
}

/* ------------------------------ Page « Site » ------------------------------ */

const TABS = [
  ['identity', 'Identité'],
  ['menu', 'Menu'],
  ['hero', 'Accueil'],
  ['about', 'À propos'],
  ['services', 'Services'],
  ['carousel', 'Carrousel'],
  ['contact', 'Contact & pied'],
  ['place', 'Placement'],
  ['seo', 'SEO'],
  ['langs', 'Langues'],
] as const;
type TabId = (typeof TABS)[number][0];

export default function AdminSite({ onError }: { onError: OnError }) {
  const [s, setS] = useState<SiteSettings | null>(null);
  const [tab, setTab] = useState<TabId>('identity');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    fetchSettings()
      .then((d) => setS(mergeSettings(d)))
      .catch((e) => {
        onError(e);
        setS(DEFAULT_SETTINGS);
      });
  }, [onError]);

  if (!s) return <p className="py-24 text-center text-white/40">Chargement…</p>;

  const set = (path: string, value: unknown) => {
    setSaved(false);
    setS((cur) => {
      if (!cur) return cur;
      const next = structuredClone(cur);
      setPath(next as unknown as Record<string, unknown>, path.split('.'), value);
      return next;
    });
  };

  async function save() {
    if (!s) return;
    setSaving(true);
    setNote('');
    try {
      const { next, failed, reason } = await syncTranslations(s, setNote);
      setS(mergeSettings(await saveSettings(next)));
      setSaved(true);
      setNote(
        failed
          ? `Enregistré, mais ${failed} texte(s) n'ont pas pu être traduits. ${reason} Va dans l'onglet Langues → « Tester la traduction ».`
          : '',
      );
    } catch (e) {
      onError(e);
      setNote('');
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormCtx.Provider value={{ s, set, onError }}>
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-5 py-8 md:px-10">
        <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" aria-label="Sections du site">
          {TABS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex-shrink-0 rounded-full border px-4 py-1.5 text-sm transition-colors ${
                tab === id ? 'border-neon-green bg-neon-green/10 text-neon-green' : 'border-white/15 text-white/60 hover:border-white/40 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {tab === 'identity' && <IdentityPanel />}
        {tab === 'menu' && <MenuPanel />}
        {tab === 'hero' && <HeroPanel />}
        {tab === 'about' && <AboutPanel />}
        {tab === 'services' && <ServicesPanel />}
        {tab === 'carousel' && <CarouselPanel />}
        {tab === 'contact' && <ContactPanel />}
        {tab === 'place' && <AdminPlacement s={s} set={set} onError={onError} />}
        {tab === 'seo' && <SeoPanel />}
        {tab === 'langs' && <LangPanel />}

        <div className="sticky bottom-4 z-20 flex items-center justify-end gap-3">
          {note && <span className="max-w-xs rounded-lg bg-black/80 px-3 py-2 text-xs text-white/80">{note}</span>}
          {saved && !note && <span className="rounded-lg bg-black/80 px-3 py-2 text-sm text-neon-green">Enregistré ✓</span>}
          <button className={BTN_PRIMARY} disabled={saving} onClick={save}>
            {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
          </button>
        </div>
      </div>
    </FormCtx.Provider>
  );
}
