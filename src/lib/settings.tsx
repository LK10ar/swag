import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { fetchSettings, type SiteSettings } from './api';
import { PHOTOS } from './photos';

export const DEFAULT_SETTINGS: SiteSettings = {
  hero: { base: PHOTOS.heroBase, reveal: PHOTOS.heroReveal },
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
  },
};

/** Ce qui est enregistré remplace les valeurs par défaut ; ce qui n'existe pas encore garde la valeur par défaut. */
export function mergeSettings(saved?: Partial<SiteSettings> | null): SiteSettings {
  const d = DEFAULT_SETTINGS;
  const s = saved ?? {};
  const pick = <T,>(v: T | undefined, fallback: T): T => (v === undefined ? fallback : v);
  return {
    hero: { base: s.hero?.base || d.hero.base, reveal: s.hero?.reveal || d.hero.reveal },
    about: {
      image: pick(s.about?.image, d.about.image),
      heading: s.about?.heading || d.about.heading,
      paragraph: pick(s.about?.paragraph, d.about.paragraph),
      touring: pick(s.about?.touring, d.about.touring),
      stats: pick(s.about?.stats, d.about.stats),
    },
    marquee: {
      label: pick(s.marquee?.label, d.marquee.label),
      topRow: pick(s.marquee?.topRow, d.marquee.topRow),
      bottomRow: pick(s.marquee?.bottomRow, d.marquee.bottomRow),
    },
    contact: {
      instagram: pick(s.contact?.instagram, d.contact.instagram),
      email: pick(s.contact?.email, d.contact.email),
      intro: s.contact?.intro || d.contact.intro,
    },
  };
}

const CACHE_KEY = 'swag_settings_v1';

function readCache(): SiteSettings {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? mergeSettings(JSON.parse(raw)) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

const SettingsContext = createContext<{ settings: SiteSettings }>({ settings: DEFAULT_SETTINGS });

export function SettingsProvider({ children }: { children: ReactNode }) {
  // Le cache évite de voir les images par défaut clignoter à chaque visite
  const [settings, setSettings] = useState<SiteSettings>(readCache);

  useEffect(() => {
    fetchSettings()
      .then((data) => {
        setSettings(mergeSettings(data));
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch {
          /* stockage indisponible : pas grave */
        }
      })
      .catch(() => {});
  }, []);

  return <SettingsContext.Provider value={{ settings }}>{children}</SettingsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = () => useContext(SettingsContext);
