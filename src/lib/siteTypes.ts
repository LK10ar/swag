import type { AccentColor } from './photos';
import type { LangCode } from './i18n';

export type DecorShape = 'circle' | 'square' | 'triangle' | 'star' | 'diamond' | 'heart' | 'png';

export type Decor = {
  id: string;
  shape: DecorShape;
  color: string;
  size: number; // px
  x: number; // % de la largeur du conteneur
  y: number; // % de la hauteur du conteneur
  rotate: number;
  opacity: number; // 0-100
  filled: boolean;
  glow: boolean;
  float: boolean;
  image: string; // pour le type "png"
};

export type Stat = { value: string; label: string; color: AccentColor };
export type LetterStyle = { color: string; blink: boolean; glow: boolean };
export type NavId = 'about' | 'services' | 'projects' | 'gallery' | 'contact';
export type NavItem = { id: NavId; label: string; visible: boolean };
export type ServiceItem = { icon: string; title: string; description: string; price: string; accent: AccentColor };

export type HeroTitle = {
  text: string;
  color: string;
  letters: LetterStyle[];
  blinkAll: boolean;
  glow: 'none' | 'neon' | 'shadow';
  glowColor: string;
  outline: boolean;
  outlineColor: string;
  outlineWidth: number;
  transparentFill: boolean;
  scale: number;
  font: string;
};

export type SiteSettings = {
  brand: {
    name: string;
    iconMode: 'icon' | 'image' | 'none';
    icon: string;
    iconColor: string;
    logoImage: string;
    favicon: string;
  };
  theme: { font: string };
  nav: { items: NavItem[] };
  hero: {
    base: string;
    reveal: string;
    kicker: string;
    tagline: string;
    buttonLabel: string;
    buttonHref: string;
    title: HeroTitle;
    decor: Decor[];
  };
  about: { image: string; heading: string; paragraph: string; touring: string; stats: Stat[]; decor: Decor[] };
  services: { kicker: string; title: string; note: string; items: ServiceItem[]; decor: Decor[] };
  marquee: { label: string; topRow: string[]; bottomRow: string[] };
  contact: {
    instagram: string;
    email: string;
    intro: string;
    kicker: string;
    title: string;
    buttonLabel: string;
    decor: Decor[];
  };
  footer: { tagline: string; text: string; showNotice: boolean };
  seo: {
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
    robots: 'index,follow' | 'noindex,nofollow';
    canonical: string;
    author: string;
    twitter: string;
    schema: boolean;
  };
  i18n: {
    defaultLang: LangCode;
    enabled: LangCode[];
    translations: Partial<Record<LangCode, Record<string, unknown>>>;
  };
};
