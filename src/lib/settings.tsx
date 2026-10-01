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
  brand: { name: 'swagtrickryan', iconMode: 'icon', icon: 'camera', iconColor: '#39FF14', logoImage: '', favicon: '' },
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
    kicker: 'Rock · Hard Rock · Metal Photography',
    tagline: '*Raw* energy. ~Sweat~. ^Distortion^.\nI freeze the chaos into frames that hit harder than the riff.',
    buttonLabel: 'Start a project',
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
    heading: "I don't shoot *portraits*.\nI capture ~sonic violence~ in frames.",
    paragraph:
      "Twelve years in photo pits across Europe and Japan. From basement hardcore gigs to stadium metal festivals — I live for the three seconds between the riff and the chaos. My camera doesn't flinch when the mosh pit erupts. It leans in.",
    touring: 'Currently touring with: DEADLOCK · ASHFALL · The Vulture Cult',
    stats: [
      { value: '250+', label: 'Shows Shot', color: 'green' },
      { value: '12', label: 'Years In Pit', color: 'orange' },
      { value: '40+', label: 'Bands Covered', color: 'pink' },
      { value: '8', label: 'Countries', color: 'blue' },
    ],
    decor: [decor('d1', '#39FF14', 96, 94, 5), decor('d2', '#FF10A0', 64, 3, 98)],
  },
  services: {
    kicker: '',
    title: 'What I ^deliver^',
    note: 'Every package includes full editing, online gallery, and commercial usage rights. No hidden fees.',
    items: [
      {
        icon: 'aperture',
        title: 'LIVE SHOW COVERAGE',
        description: 'Full concert coverage from soundcheck to last encore. 200+ edited shots delivered in 48h.',
        price: 'From €450',
        accent: 'green',
      },
      {
        icon: 'disc',
        title: 'ALBUM & PRESS KITS',
        description: 'Studio and location shoots for album covers, press releases, and promo campaigns.',
        price: 'From €800',
        accent: 'orange',
      },
      {
        icon: 'video',
        title: 'MUSIC VIDEOS',
        description: 'Cinematic live sessions, lyric videos, and behind-the-scenes tour documentaries.',
        price: 'From €2,500',
        accent: 'pink',
      },
      {
        icon: 'zap',
        title: 'FESTIVAL COVERAGE',
        description: 'Multi-day festival documentation — stages, crowds, backstage, and artist portraits.',
        price: 'Custom',
        accent: 'blue',
      },
    ],
    decor: [],
  },
  marquee: {
    label: 'Live · Loud · Unfiltered',
    topRow: PHOTOS.marquee.topRow,
    bottomRow: PHOTOS.marquee.bottomRow,
  },
  contact: {
    instagram: 'https://www.instagram.com/swagtrickryan/',
    email: '',
    intro:
      "Booking a show, planning an album cover, or need a full tour documented? I'm available worldwide — just reach out.",
    kicker: '',
    title: "Let's make *something* ~loud~.",
    buttonLabel: '',
    decor: [],
  },
  footer: { tagline: 'Rock & Hard Rock Photography', text: '', showNotice: true },
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
  i18n: { defaultLang: 'fr', enabled: ['fr'], translations: {} },
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

type Ctx = {
  settings: SiteSettings; // déjà traduit dans la langue courante
  base: SiteSettings; // dans la langue par défaut
  lang: LangCode;
  langs: LangCode[];
  setLang: (l: LangCode) => void;
  t: (key: string) => string;
};

const defaultCtx: Ctx = {
  settings: DEFAULT_SETTINGS,
  base: DEFAULT_SETTINGS,
  lang: 'fr',
  langs: ['fr'],
  setLang: () => {},
  t: (k) => translate('fr', k),
};

const SettingsContext = createContext<Ctx>(defaultCtx);

export function SettingsProvider({ children }: { children: ReactNode }) {
  // Le cache évite de voir les valeurs par défaut clignoter à chaque visite
  const [base, setBase] = useState<SiteSettings>(readCache);
  const [chosen, setChosen] = useState<LangCode | null>(() => {
    try {
      return localStorage.getItem(LANG_KEY) as LangCode | null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    fetchSettings()
      .then((data) => {
        setBase(mergeSettings(data));
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch {
          /* stockage indisponible : pas grave */
        }
      })
      .catch(() => {});
  }, []);

  const langs = useMemo(() => enabledLangs(base), [base]);

  const lang: LangCode = useMemo(() => {
    if (chosen && langs.includes(chosen)) return chosen;
    const browser = (navigator.language || '').slice(0, 2) as LangCode;
    return langs.includes(browser) ? browser : base.i18n.defaultLang;
  }, [chosen, langs, base.i18n.defaultLang]);

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

  const value = useMemo(() => ({ settings, base, lang, langs, setLang, t }), [settings, base, lang, langs, setLang, t]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = () => useContext(SettingsContext);
