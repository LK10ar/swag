// Quels textes du site peuvent être traduits, et comment les retrouver dans l'objet des réglages.

const PATTERNS: [RegExp, string][] = [
  [/^hero\.kicker$/, 'Accueil · sur-titre'],
  [/^hero\.tagline$/, 'Accueil · phrase d’accroche'],
  [/^hero\.buttonLabel$/, 'Accueil · bouton'],
  [/^footer\.tagline$/, 'Pied de page · slogan'],
  [/^footer\.text$/, 'Pied de page · texte'],
  [/^about\.heading$/, 'À propos · titre'],
  [/^about\.paragraph$/, 'À propos · texte'],
  [/^about\.touring$/, 'À propos · ligne du dessous'],
  [/^about\.stats\.\d+\.label$/, 'À propos · chiffre'],
  [/^services\.kicker$/, 'Services · sur-titre'],
  [/^services\.title$/, 'Services · titre'],
  [/^services\.note$/, 'Services · texte à droite'],
  [/^services\.items\.\d+\.title$/, 'Service · titre'],
  [/^services\.items\.\d+\.description$/, 'Service · description'],
  [/^services\.items\.\d+\.price$/, 'Service · prix'],
  [/^marquee\.label$/, 'Carrousel · titre'],
  [/^contact\.kicker$/, 'Contact · sur-titre'],
  [/^contact\.title$/, 'Contact · titre'],
  [/^contact\.intro$/, 'Contact · texte'],
  [/^contact\.buttonLabel$/, 'Contact · bouton'],
  [/^nav\.items\.\d+\.label$/, 'Menu · lien'],
  [/^seo\.title$/, 'SEO · titre'],
  [/^seo\.description$/, 'SEO · description'],
];

export type TextField = { path: string[]; value: string; label: string };

export function collectTexts(root: unknown): TextField[] {
  const out: TextField[] = [];
  const walk = (node: unknown, path: string[]) => {
    if (typeof node === 'string') {
      const key = path.join('.');
      const hit = PATTERNS.find(([re]) => re.test(key));
      if (hit && node.trim()) out.push({ path, value: node, label: hit[1] });
    } else if (Array.isArray(node)) {
      node.forEach((v, i) => walk(v, [...path, String(i)]));
    } else if (node && typeof node === 'object') {
      for (const [k, v] of Object.entries(node)) if (k !== 'i18n') walk(v, [...path, k]);
    }
  };
  walk(root, []);
  return out;
}

export function getPath(obj: unknown, path: string[]): unknown {
  return path.reduce<unknown>((n, k) => (n && typeof n === 'object' ? (n as Record<string, unknown>)[k] : undefined), obj);
}

/** Écrit une valeur en créant les objets/tableaux manquants (les trous d'un tableau sont remplis par {}) */
export function setPath(root: Record<string, unknown>, path: string[], value: unknown): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let node: any = root;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    const nextIsIndex = /^\d+$/.test(path[i + 1]);
    if (node[key] === undefined || node[key] === null || typeof node[key] !== 'object') {
      node[key] = nextIsIndex ? [] : {};
    }
    node = node[key];
    if (Array.isArray(node) && nextIsIndex) {
      const idx = Number(path[i + 1]);
      while (node.length <= idx) node.push({});
    }
  }
  const last = path[path.length - 1];
  if (Array.isArray(node) && /^\d+$/.test(last)) {
    while (node.length < Number(last)) node.push({});
  }
  node[last] = value;
}
