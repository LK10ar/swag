import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { fetchSettings } from './api';
import type { Decor, SiteSettings } from './siteTypes';
import { PHOTOS } from './photos';
import { LANGS, translate, type LangCode } from './i18n';
import { loadFont } from './fonts';

const decor = (id: string, color: string, size: number, x: number, y: number): Decor => ({
  id,
  shape: 'circle',
  color,
  size,
  x,
  y,
  rotate: 0,
  opacity: 60,
  filled: false,
  glow: true,
  float: false,
  image: '',
});

export const DEFAULT_SETTINGS: SiteSettings = {
  brand: { name: 'swagtrickryan', iconMode: 'icon', icon: 'camera', iconColor: '#39FF14', logoImage: '', favicon: '', logoSize: 28, nameSize: 20, blend: true },
  theme: { font: 'Kanit' },
  nav: {
    items: [
      { id: 'about', label: '', visible: true },
      { id: 'services', label: '', visible: true },
      { id: 'projects', label: '', visible: true },
      { id: 'gallery', label: '', visible: true },
      { id: 'contact', label: '', visible: true },
    ],
  },
  hero: {
    base: PHOTOS.heroBase,
    reveal: PHOTOS.heroReveal,
    kicker: 'Rock · Hard Rock · Photographie metal',
    tagline: '*Énergie* brute. ~Sueur~. ^Distorsion^.\nJe fige le chaos en images qui frappent plus fort que le riff.',
    buttonLabel: 'Démarrer un projet',
    buttonHref: '#contact',
    title: {
      text: 'Swagtrickryan',
      color: '#F4F1E8',
      letters: [{ color: '#39FF14', blink: true, glow: true }],
      blinkAll: false,
      glow: 'none',
      glowColor: '',
      outline: false,
      outlineColor: '',
      outlineWidth: 2,
      transparentFill: false,
      scale: 100,
      font: '',
    },
    decor: [],
  },
  about: {
    image: PHOTOS.portraits.main,
    heading: 'Je ne fais pas de *portraits*.\nJe capture la ~violence sonique~ en images.',
    paragraph:
      'Douze ans dans les fosses photo, en Europe et au Japon. Des concerts hardcore en sous-sol aux festivals metal dans les stades — je vis pour les trois secondes entre le riff et le chaos. Mon appareil ne bronche pas quand le pit explose. Il s’approche.',
    touring: 'En tournée avec : DEADLOCK · ASHFALL · The Vulture Cult',
    stats: [
      { value: '250+', label: 'Concerts photographiés', color: 'green' },
      { value: '12', label: 'Années dans le pit', color: 'orange' },
      { value: '40+', label: 'Groupes couverts', color: 'pink' },
      { value: '8', label: 'Pays', color: 'blue' },
    ],
    decor: [decor('d1', '#39FF14', 96, 94, 5), decor('d2', '#FF10A0', 64, 3, 98)],
  },
  services: {
    kicker: '',
    title: 'Ce que je ^propose^',
    note: 'Chaque formule comprend la retouche complète, une galerie en ligne et les droits d’usage commercial. Aucun frais caché.',
    items: [
      {
        icon: 'aperture',
        title: 'COUVERTURE DE CONCERT',
        description: 'Couverture complète du concert, des balances au dernier rappel. Plus de 200 photos retouchées livrées en 48 h.',
        price: 'À partir de 450 €',
        accent: 'green',
      },
      {
        icon: 'disc',
        title: 'POCHETTES & DOSSIERS DE PRESSE',
        description: 'Séances en studio ou en extérieur pour pochettes d’album, communiqués de presse et campagnes promo.',
        price: 'À partir de 800 €',
        accent: 'orange',
      },
      {
        icon: 'video',
        title: 'CLIPS VIDÉO',
        description: 'Sessions live cinématographiques, lyric videos et documentaires de tournée en coulisses.',
        price: 'À partir de 2 500 €',
        accent: 'pink',
      },
      {
        icon: 'zap',
        title: 'COUVERTURE DE FESTIVAL',
        description: 'Reportage sur plusieurs jours — scènes, public, coulisses et portraits d’artistes.',
        price: 'Sur devis',
        accent: 'blue',
      },
    ],
    decor: [],
  },
  marquee: {
    label: 'Live · Fort · Sans filtre',
    topRow: PHOTOS.marquee.topRow,
    bottomRow: PHOTOS.marquee.bottomRow,
  },
  contact: {
    instagram: 'https://www.instagram.com/swagtrickryan/',
    email: '',
    intro:
      'Réserver un concert, préparer une pochette d’album ou documenter toute une tournée ? Je suis disponible partout — il suffit de me contacter.',
    kicker: '',
    title: 'Faisons du *bruit* ~ensemble~.',
    buttonLabel: '',
    ctaLabel: '',
    nameLabel: '',
    emailLabel: '',
    messageLabel: '',
    sentTitle: '',
    sentText: '',
    decor: [],
  },
  extraDecor: { projects: [], gallery: [], marquee: [], footer: [] },
  footer: { tagline: 'Photographie rock & hard rock', text: '', showNotice: true },
  seo: {
    title: 'swagtrickryan — Rock & Hard Rock Photography',
    description:
      'Photographe de concerts rock, hard rock et metal. Reportages live, festivals, pochettes d’album et vidéos.',
    keywords: 'photographe concert, photo rock, metal, festival, live photography',
    ogImage: '',
    robots: 'index,follow',
    canonical: '',
    author: 'swagtrickryan',
    twitter: '',
    schema: true,
  },
  i18n: { defaultLang: 'fr', enabled: ['fr'], translations: {}, sources: {} },
};

/* ------------------------------ fusion profonde ------------------------------ */

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

type MergeOpts = { byIndex?: boolean; skipEmpty?: boolean };

/** Les valeurs de `over` remplacent celles de `base`. byIndex : les tableaux sont fusionnés élément par élément (traductions). */
export function deepMerge<T>(base: T, over: unknown, opts: MergeOpts = {}): T {
  if (over === undefined || over === null) return base;
  if (isObj(base) && isObj(over)) {
    const out: Record<string, unknown> = { ...base };
    for (const k of Object.keys(over)) out[k] = k in base ? deepMerge(base[k], over[k], opts) : over[k];
    return out as T;
  }
  if (Array.isArray(base) && Array.isArray(over) && opts.byIndex) {
    return base.map((b, i) => (i < over.length ? deepMerge(b, over[i], opts) : b)) as unknown as T;
  }
  if (opts.skipEmpty && over === '') return base;
  return over as T;
}

/** Ce qui est enregistré remplace les valeurs par défaut ; ce qui n'existe pas encore garde la valeur par défaut. */
export function mergeSettings(saved?: unknown): SiteSettings {
  const s = deepMerge(DEFAULT_SETTINGS, saved);
  // Champs essentiels : jamais vides
  const d = DEFAULT_SETTINGS;
  if (!s.hero.base) s.hero = { ...s.hero, base: d.hero.base };
  if (!s.hero.reveal) s.hero = { ...s.hero, reveal: d.hero.reveal };
  if (!s.hero.title.text.trim()) s.hero = { ...s.hero, title: { ...s.hero.title, text: d.hero.title.text } };
  if (!s.about.heading) s.about = { ...s.about, heading: d.about.heading };
  if (!s.theme.font) s.theme = { ...s.theme, font: d.theme.font };
  return s;
}

const enabledLangs = (s: SiteSettings): LangCode[] => {
  const codes = LANGS.map((l) => l.code);
  const list = [s.i18n.defaultLang, ...s.i18n.enabled].filter((c, i, a) => codes.includes(c) && a.indexOf(c) === i);
  return list.length ? list : ['fr'];
};

/* ------------------------------ contexte ------------------------------ */

const CACHE_KEY = 'swag_settings_v2';
const LANG_KEY = 'swag_lang';

function readCache(): SiteSettings {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? mergeSettings(JSON.parse(raw)) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export type PreviewApi = {
  selected: { area: string; id: string } | null;
  select: (area: string | null, id?: string) => void;
  update: (area: string, id: string, patch: Record<string, unknown>) => void;
};

type Ctx = {
  settings: SiteSettings; // déjà traduit dans la langue courante
  base: SiteSettings; // dans la langue par défaut
  lang: LangCode;
  langs: LangCode[];
  setLang: (l: LangCode) => void;
  t: (key: string) => string;
  /** non nul seulement dans l'aperçu en direct de l'admin */
  preview: PreviewApi | null;
};

const defaultCtx: Ctx = {
  settings: DEFAULT_SETTINGS,
  base: DEFAULT_SETTINGS,
  lang: 'fr',
  langs: ['fr'],
  setLang: () => {},
  t: (k) => translate('fr', k),
  preview: null,
};

const SettingsContext = createContext<Ctx>(defaultCtx);

const toAdmin = (msg: Record<string, unknown>) =>
  window.parent.postMessage({ source: 'swag-preview', ...msg }, window.location.origin);

export function SettingsProvider({ children, preview = false }: { children: ReactNode; preview?: boolean }) {
  // Le cache évite de voir les valeurs par défaut clignoter à chaque visite
  const [fetched, setFetched] = useState<SiteSettings>(readCache);
  const [override, setOverride] = useState<SiteSettings | null>(null); // aperçu en direct
  const [selected, setSelected] = useState<{ area: string; id: string } | null>(null);
  const [chosen, setChosen] = useState<LangCode | null>(() => {
    try {
      return localStorage.getItem(LANG_KEY) as LangCode | null;
    } catch {
      return null;
    }
  });
  const base = override ?? fetched;

  useEffect(() => {
    fetchSettings()
      .then((data) => {
        setFetched(mergeSettings(data));
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch {
          /* stockage indisponible : pas grave */
        }
      })
      .catch(() => {});
  }, []);

  // Aperçu en direct : l'admin (fenêtre parente) envoie les réglages en cours de modification
  useEffect(() => {
    if (!preview) return;
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.data?.source !== 'swag-admin') return;
      const d = e.data;
      if (d.type === 'settings') setOverride(mergeSettings(d.settings));
      else if (d.type === 'select') setSelected(d.selected ?? null);
      else if (d.type === 'scroll') {
        const el = d.id && d.id !== 'top' ? document.getElementById(d.id) : null;
        window.scrollTo({ top: el ? el.getBoundingClientRect().top + window.scrollY - 10 : 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('message', onMsg);
    toAdmin({ type: 'ready' });
    return () => window.removeEventListener('message', onMsg);
  }, [preview]);

  const langs = useMemo(() => enabledLangs(base), [base]);

  const lang: LangCode = useMemo(() => {
    if (preview) return base.i18n.defaultLang;
    if (chosen && langs.includes(chosen)) return chosen;
    const browser = (navigator.language || '').slice(0, 2) as LangCode;
    return langs.includes(browser) ? browser : base.i18n.defaultLang;
  }, [preview, chosen, langs, base.i18n.defaultLang]);

  const settings = useMemo(() => {
    if (lang === base.i18n.defaultLang) return base;
    return deepMerge(base, base.i18n.translations?.[lang], { byIndex: true, skipEmpty: true });
  }, [base, lang]);

  const setLang = useCallback((l: LangCode) => {
    setChosen(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback((key: string) => translate(lang, key), [lang]);

  // Police du site
  useEffect(() => {
    loadFont(base.theme.font);
    document.documentElement.style.setProperty('--font-site', `'${base.theme.font}'`);
  }, [base.theme.font]);

  const previewApi = useMemo<PreviewApi | null>(
    () =>
      preview
        ? {
            selected,
            select: (area, id) => {
              const next = area && id ? { area, id } : null;
              setSelected(next);
              toAdmin({ type: 'select', selected: next });
            },
            update: (area, id, patch) => toAdmin({ type: 'decor-update', area, id, patch }),
          }
        : null,
    [preview, selected],
  );

  const value = useMemo(
    () => ({ settings, base, lang, langs, setLang, t, preview: previewApi }),
    [settings, base, lang, langs, setLang, t, previewApi],
  );
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = () => useContext(SettingsContext);
