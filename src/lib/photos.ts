export type AccentColor = 'green' | 'orange' | 'pink' | 'blue';

export const ACCENT_MAP: Record<
  AccentColor,
  { text: string; border: string; bg: string; raw: string }
> = {
  green: { text: 'neon-text-green', border: 'neon-border-green', bg: '#39FF14', raw: '#39FF14' },
  orange: { text: 'neon-text-orange', border: 'neon-border-orange', bg: '#FF6B00', raw: '#FF6B00' },
  pink: { text: 'neon-text-pink', border: 'neon-border-pink', bg: '#FF10A0', raw: '#FF10A0' },
  blue: { text: 'neon-text-blue', border: 'neon-border-blue', bg: '#00F0FF', raw: '#00F0FF' },
};

// Toutes les photos viennent de Pexels : px(id, largeur, extension)
function px(id: number, width: number, ext: 'jpeg' | 'png' = 'jpeg'): string {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.${ext}?auto=compress&cs=tinysrgb&w=${width}`;
}

export const PHOTOS = {
  heroBase: px(4257594, 1920),
  heroReveal: px(17610709, 1536),
  marquee: {
    topRow: [
      px(8130647, 640),
      px(5824779, 640),
      px(33418892, 640),
      px(28096553, 640),
      px(7715474, 640),
      px(32248068, 640),
      px(33923307, 640),
    ],
    bottomRow: [
      px(27972785, 640),
      px(3807096, 640),
      px(33298031, 640),
      px(14591832, 640),
      px(11963121, 640, 'png'),
      px(1416969, 640),
      px(167453, 640),
    ],
  },
  projects: [
    { title: "BACKSTAGE FIRE", year: "2025", location: "Paris, FR", image: px(33418892, 1200), accent: 'green' },
    { title: "DECIBEL KINGS", year: "2024", location: "Berlin, DE", image: px(8041217, 1200), accent: 'orange' },
    { title: "SHADOW METAL", year: "2024", location: "Oslo, NO", image: px(15129779, 1200), accent: 'pink' },
    { title: "NEON CARNAGE", year: "2023", location: "Tokyo, JP", image: px(18671362, 1200), accent: 'blue' },
  ] as {
    title: string;
    year: string;
    location: string;
    image: string;
    accent: AccentColor;
  }[],
  gallery: [
      px(16118361, 800),
      px(7715830, 800),
      px(20733964, 800),
      px(632305, 800),
      px(18004195, 800),
      px(23947891, 800),
      px(922319, 800),
      px(31020032, 800),
      px(417475, 800),
      px(15865126, 800),
      px(4073982, 800),
      px(6445429, 800),
  ],
  portraits: {
    main: px(28581218, 800),
    secondary: px(14037563, 800),
  },
};

// Image de remplacement quand un album a moins de 3 photos
export const PLACEHOLDER_IMAGE =
  'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/animated%20(36).webp';
