export function rgba(hex: string, a: number): string {
  const n = parseInt((hex || '#ffffff').replace('#', ''), 16);
  if (Number.isNaN(n)) return `rgba(255,255,255,${a})`;
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export function glowShadow(mode: 'none' | 'neon' | 'shadow', color: string): string | undefined {
  if (mode === 'neon') return `0 0 5px ${rgba(color, 0.8)}, 0 0 20px ${rgba(color, 0.5)}, 0 0 45px ${rgba(color, 0.3)}`;
  if (mode === 'shadow') return `0.06em 0.06em 0 ${rgba(color, 0.4)}, 0.12em 0.12em 0.2em rgba(0,0,0,0.55)`;
  return undefined;
}

/** Taille du grand titre : s'adapte à la longueur du nom pour qu'il tienne toujours dans l'écran */
export function heroFontSize(text: string, scale: number): string {
  const n = Math.max(Array.from(text || '').length, 4);
  return `min(${((150 / n) * (scale / 100)).toFixed(2)}vw, 26vw)`;
}
