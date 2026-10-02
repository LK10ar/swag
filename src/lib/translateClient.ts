import { translateTexts as viaServer } from './api';

// Marques de couleur du site : *vert*  ~rose~  ^orange^  [blue:bleu]
const MARKS = /(\*[^*\n]+\*|~[^~\n]+~|\^[^^\n]+\^|\[blue:[^\]\n]+\])/;

const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const norm = (s: string) => s.replace(/\[blue:|[\]*~^\s]/g, '').toLowerCase();

/** Une phrase (3 mots ou plus) rendue à l'identique n'a pas été traduite. */
export const looksUntranslated = (src: string, out: string) =>
  !out.trim() || (wordCount(src) >= 3 && norm(out) === norm(src));

/* ----------------------- cache du navigateur ----------------------- */

const CACHE_KEY = 'swag_tr_cache_v1';
type Cache = Record<string, string>;

function readCache(): Cache {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') as Cache;
  } catch {
    return {};
  }
}
export const cachedTranslation = (to: string, text: string): string | undefined => readCache()[`${to}|${text}`];

function putCache(to: string, text: string, out: string) {
  try {
    const c = readCache();
    c[`${to}|${text}`] = out;
    const keys = Object.keys(c);
    if (keys.length > 400) for (const k of keys.slice(0, keys.length - 400)) delete c[k];
    localStorage.setItem(CACHE_KEY, JSON.stringify(c));
  } catch {
    /* stockage plein ou indisponible : pas grave */
  }
}

/* ----------------------- Google, depuis le navigateur ----------------------- */

async function gtx(text: string, to: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Google HTTP ${r.status}`);
  const j = await r.json();
  if (!Array.isArray(j?.[0])) throw new Error('Google : réponse inattendue');
  return (j[0] as unknown[][]).map((seg) => String(seg?.[0] ?? '')).join('');
}

async function plain(text: string, to: string): Promise<string> {
  const lead = text.match(/^\s*/)![0];
  const trail = text.match(/\s*$/)![0];
  const core = text.trim();
  if (!core || !/\p{L}/u.test(core)) return text;
  return lead + (await gtx(core, to)).trim() + trail;
}

/** Traduit un texte du site (couleurs et retours à la ligne conservés), directement depuis le navigateur. */
export async function translateLocal(text: string, to: string): Promise<string> {
  const hit = cachedTranslation(to, text);
  if (hit) return hit;
  const out: string[] = [];
  for (const line of text.split('\n')) {
    const parts: string[] = [];
    for (const part of line.split(MARKS)) {
      const m = part.match(/^(\*|~|\^)([^]*)\1$/);
      if (m) parts.push(m[1] + (await plain(m[2], to)) + m[1]);
      else if (/^\[blue:[^\]]+\]$/.test(part)) parts.push(`[blue:${await plain(part.slice(6, -1), to)}]`);
      else parts.push(await plain(part, to));
    }
    out.push(parts.join(''));
  }
  const res = out.join('\n');
  putCache(to, text, res);
  return res;
}

/* ----------------------- traduction fiable (admin) ----------------------- */

const msg = (e: unknown) => (e instanceof Error ? e.message : String(e));

/**
 * Traduit une liste de textes : d'abord par le serveur, puis — pour tout ce qui revient vide ou inchangé —
 * directement depuis le navigateur. `out[i]` vaut null seulement si AUCUN des deux moyens n'a fonctionné.
 */
export async function translateRobust(
  texts: string[],
  to: string,
): Promise<{ out: (string | null)[]; error: string; engines: Record<string, number> }> {
  const out: (string | null)[] = new Array(texts.length).fill(null);
  let error = '';
  let engines: Record<string, number> = {};

  try {
    const r = await viaServer('auto', to, texts);
    r.texts.forEach((t, i) => (out[i] = t));
    engines = r.engines ?? {};
    if (r.errors?.length) error = r.errors.join(' · ');
  } catch (e) {
    error = `Serveur : ${msg(e)}`;
  }

  for (let i = 0; i < texts.length; i++) {
    const cur = out[i];
    if (cur && !looksUntranslated(texts[i], cur)) continue;
    try {
      out[i] = await translateLocal(texts[i], to);
      engines.navigateur = (engines.navigateur ?? 0) + 1;
    } catch (e) {
      if (!cur) error ||= `Navigateur : ${msg(e)}`;
    }
  }
  return { out, error, engines };
}
