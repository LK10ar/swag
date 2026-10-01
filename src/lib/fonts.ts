export const FONTS: { name: string; weights: string | null }[] = [
  { name: 'Kanit', weights: '300;400;500;600;700;800;900' },
  { name: 'Inter', weights: '300;400;500;600;700;800;900' },
  { name: 'Poppins', weights: '300;400;500;600;700;800;900' },
  { name: 'Montserrat', weights: '300;400;500;600;700;800;900' },
  { name: 'Outfit', weights: '300;400;500;600;700;800;900' },
  { name: 'Rubik', weights: '300;400;500;600;700;800;900' },
  { name: 'Sora', weights: '300;400;500;600;700;800' },
  { name: 'Space Grotesk', weights: '300;400;500;600;700' },
  { name: 'Oswald', weights: '300;400;500;600;700' },
  { name: 'Playfair Display', weights: '400;500;600;700;800;900' },
  { name: 'Bebas Neue', weights: null },
  { name: 'Anton', weights: null },
  { name: 'Archivo Black', weights: null },
  { name: 'Permanent Marker', weights: null },
];

/** Charge une police Google Fonts (Kanit est déjà chargée par index.html) */
export function loadFont(name: string) {
  const font = FONTS.find((f) => f.name === name);
  if (!font || name === 'Kanit') return;
  const id = `font-${name.replace(/\s+/g, '-')}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${name.replace(/ /g, '+')}${
    font.weights ? `:wght@${font.weights}` : ''
  }&display=swap`;
  document.head.appendChild(link);
}
