import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  FolderPlus,
  ImagePlus,
  LogOut,
  Pencil,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  ApiError,
  addPhotos,
  createAlbum,
  deleteAlbum,
  deletePhoto,
  fetchAlbums,
  getToken,
  login,
  reorderPhotos,
  setToken,
  updateAlbum,
  updatePhoto,
  uploadFile,
  type Album,
  type PhotoType,
} from '@/lib/api';
import { ACCENT_MAP, type AccentColor } from '@/lib/photos';
import { LIGHT, btnVars, mediaType, stillOf } from '@/lib/helpers';
import MediaThumb from './MediaThumb';
import LiveProjectButton from './LiveProjectButton';

const INPUT =
  'w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-neon-green focus:outline-none';
const BTN =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-40';
const BTN_PRIMARY =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-neon-green px-4 py-2 text-sm font-bold text-[#0C0C0C] transition-opacity hover:opacity-80 disabled:opacity-40';

/* ------------------------------ Connexion ------------------------------ */

function Login({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { token } = await login(password);
      setToken(token);
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0C0C0C] px-5">
      <form onSubmit={submit} className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-2xl font-black uppercase tracking-tight text-white">Admin</h1>
        <input
          type="password"
          autoFocus
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={INPUT}
        />
        {error && <p className="text-sm text-neon-pink">{error}</p>}
        <button type="submit" disabled={busy || !password} className={BTN_PRIMARY}>
          {busy ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}

/* --------------------------- Tuile d'une photo -------------------------- */

function PhotoTile({
  albumId,
  photo,
  isCover,
  isFirst,
  isLast,
  run,
  onMove,
}: {
  albumId: string;
  photo: Album['photos'][number];
  isCover: boolean;
  isFirst: boolean;
  isLast: boolean;
  run: (fn: () => Promise<Album>) => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState(photo.url);
  const [caption, setCaption] = useState(photo.caption || '');

  const icon = 'flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-white hover:text-black disabled:opacity-30';

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
      <div className="relative">
        <MediaThumb photo={photo} alt={photo.caption || ''} className="h-40 w-full object-cover" />
        {mediaType(photo) !== 'image' && (
          <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white">
            {mediaType(photo) === 'youtube' ? 'YouTube' : 'Vidéo'}
          </span>
        )}
        {isCover && (
          <span className="absolute left-2 top-2 rounded-full bg-neon-green px-2 py-0.5 text-xs font-bold text-[#0C0C0C]">
            Couverture
          </span>
        )}
        <div className="absolute inset-x-2 bottom-2 flex justify-between">
          <div className="flex gap-1">
            <button className={icon} disabled={isFirst} onClick={() => onMove(-1)} aria-label="Déplacer à gauche">
              <ArrowLeft size={14} />
            </button>
            <button className={icon} disabled={isLast} onClick={() => onMove(1)} aria-label="Déplacer à droite">
              <ArrowRight size={14} />
            </button>
          </div>
          <div className="flex gap-1">
            <button
              className={icon}
              disabled={!stillOf(photo)}
              onClick={() => run(() => updateAlbum(albumId, { cover: stillOf(photo) || '' }))}
              aria-label="Définir comme couverture"
              title={stillOf(photo) ? 'Définir comme couverture' : 'Un fichier vidéo ne peut pas servir de couverture'}
            >
              <Star size={14} />
            </button>
            <button className={icon} onClick={() => setEditing((v) => !v)} aria-label="Modifier">
              <Pencil size={14} />
            </button>
            <button
              className={icon}
              onClick={() => confirm('Supprimer cette photo ?') && run(() => deletePhoto(albumId, photo._id))}
              aria-label="Supprimer"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {editing ? (
        <div className="flex flex-col gap-2 p-3">
          <input className={INPUT} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL de l'image" />
          <input className={INPUT} value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Légende (optionnel)" />
          <div className="flex gap-2">
            <button
              className={BTN_PRIMARY}
              onClick={() => {
                run(() => updatePhoto(albumId, photo._id, { url, caption }));
                setEditing(false);
              }}
            >
              Enregistrer
            </button>
            <button className={BTN} onClick={() => setEditing(false)}>
              Annuler
            </button>
          </div>
        </div>
      ) : (
        photo.caption && <p className="truncate px-3 py-2 text-xs text-white/60">{photo.caption}</p>
      )}
    </div>
  );
}

/* ------------------------------ Champ couleur ------------------------------ */

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value || LIGHT}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="h-9 w-12 flex-shrink-0 cursor-pointer rounded border border-white/15 bg-transparent p-0.5"
      />
      <span className="flex-1 text-sm text-white/80">{label}</span>
      <span className="font-mono text-xs text-white/40">{value || 'défaut'}</span>
      {value && (
        <button type="button" className="text-xs text-white/50 underline" onClick={() => onChange('')}>
          Réinitialiser
        </button>
      )}
    </div>
  );
}

/* --------------------------- Éditeur d'un album -------------------------- */

function AlbumEditor({
  album,
  onChange,
  onDeleted,
  onError,
}: {
  album: Album | null; // null = nouvel album
  onChange: (a: Album) => void;
  onDeleted: () => void;
  onError: (e: unknown) => void;
}) {
  const [form, setForm] = useState({
    title: album?.title ?? '',
    year: album?.year ?? String(new Date().getFullYear()),
    location: album?.location ?? '',
    accent: (album?.accent ?? 'green') as AccentColor,
    cover: album?.cover ?? '',
    order: String(album?.order ?? 0),
    frameColor: album?.frameColor ?? '',
    numberColor: album?.numberColor ?? '',
    buttonColor: album?.buttonColor ?? '',
    hoverColor: album?.hoverColor ?? '',
  });
  const [urls, setUrls] = useState('');
  const [busy, setBusy] = useState('');

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const setColor = (k: 'frameColor' | 'numberColor' | 'buttonColor' | 'hoverColor') => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function run(fn: () => Promise<Album>, label = 'Enregistrement…') {
    setBusy(label);
    try {
      onChange(await fn());
    } catch (e) {
      onError(e);
    } finally {
      setBusy('');
    }
  }

  const payload = () => ({ ...form, order: Number(form.order) || 0 });

  async function onFiles(files: FileList | null) {
    if (!files || !album) return;
    setBusy('Upload…');
    try {
      const uploaded: { url: string; type: PhotoType }[] = [];
      for (const file of Array.from(files)) {
        setBusy(`Upload ${uploaded.length + 1}/${files.length}…`);
        uploaded.push(await uploadFile(file));
      }
      onChange(await addPhotos(album._id, uploaded));
    } catch (e) {
      onError(e);
    } finally {
      setBusy('');
    }
  }

  function move(index: number, dir: -1 | 1) {
    if (!album) return;
    const ids = album.photos.map((p) => p._id);
    const j = index + dir;
    [ids[index], ids[j]] = [ids[j], ids[index]];
    run(() => reorderPhotos(album._id, ids));
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-lg font-bold text-white">{album ? "Modifier l'album" : 'Nouvel album'}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input className={INPUT} placeholder="Titre (ex. BACKSTAGE FIRE)" value={form.title} onChange={set('title')} />
          <input className={INPUT} placeholder="Lieu (ex. Paris, FR)" value={form.location} onChange={set('location')} />
          <input className={INPUT} placeholder="Année" value={form.year} onChange={set('year')} />
          <select className={INPUT} value={form.accent} onChange={set('accent')}>
            {(Object.keys(ACCENT_MAP) as AccentColor[]).map((a) => (
              <option key={a} value={a} className="bg-[#0C0C0C]">
                Couleur : {a}
              </option>
            ))}
          </select>
          <input className={INPUT} placeholder="Image de couverture (URL, optionnel)" value={form.cover} onChange={set('cover')} />
          <input className={INPUT} type="number" placeholder="Ordre (0 = en premier)" value={form.order} onChange={set('order')} />
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/60">Couleurs de la carte</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <ColorField label="Cadre" value={form.frameColor} onChange={setColor('frameColor')} />
            <ColorField label="Chiffre" value={form.numberColor} onChange={setColor('numberColor')} />
            <ColorField label="Bouton « Open album »" value={form.buttonColor} onChange={setColor('buttonColor')} />
            <ColorField label="Bouton au survol" value={form.hoverColor} onChange={setColor('hoverColor')} />
          </div>
          <div
            className="flex items-center justify-between gap-4 rounded-3xl border-2 bg-[#0C0C0C] p-4"
            style={{ borderColor: form.frameColor || LIGHT }}
          >
            <span className="text-5xl font-black leading-none" style={{ color: form.numberColor || LIGHT }}>
              01
            </span>
            <LiveProjectButton
              label="Open album"
              style={btnVars(form)}
              customHover={!!form.hoverColor}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className={BTN_PRIMARY}
            disabled={!form.title.trim() || !!busy}
            onClick={() => run(() => (album ? updateAlbum(album._id, payload()) : createAlbum(payload())))}
          >
            {album ? 'Enregistrer' : "Créer l'album"}
          </button>
          {album && (
            <button
              className={`${BTN} text-neon-pink`}
              disabled={!!busy}
              onClick={async () => {
                if (!confirm(`Supprimer l'album « ${album.title} » et toutes ses photos ?`)) return;
                try {
                  await deleteAlbum(album._id);
                  onDeleted();
                } catch (e) {
                  onError(e);
                }
              }}
            >
              <Trash2 size={16} /> Supprimer l'album
            </button>
          )}
        </div>
      </div>

      {album && (
        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-bold text-white">Photos ({album.photos.length})</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <label className={`${BTN} cursor-pointer`}>
              <Upload size={16} /> Envoyer photos / vidéos
              <input
                type="file"
                accept="image/*,video/mp4,video/webm,video/quicktime"
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
                placeholder="Ou colle des URLs : images, vidéos .mp4 ou liens YouTube (une par ligne)"
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
              />
              <button
                className={BTN}
                disabled={!urls.trim() || !!busy}
                onClick={() => {
                  const list = urls.split('\n').map((u) => u.trim()).filter(Boolean).map((url) => ({ url }));
                  run(() => addPhotos(album._id, list));
                  setUrls('');
                }}
              >
                <ImagePlus size={16} /> Ajouter
              </button>
            </div>
          </div>

          {busy && <p className="text-sm text-neon-green">{busy}</p>}

          {album.photos.length === 0 ? (
            <p className="py-6 text-center text-sm text-white/40">Aucune photo pour l'instant.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {album.photos.map((photo, i) => (
                <PhotoTile
                  key={photo._id + photo.url + (photo.caption || '')}
                  albumId={album._id}
                  photo={photo}
                  isCover={album.cover === stillOf(photo)}
                  isFirst={i === 0}
                  isLast={i === album.photos.length - 1}
                  run={(fn) => run(fn)}
                  onMove={(dir) => move(i, dir)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* -------------------------------- Tableau de bord ------------------------------- */

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selected, setSelected] = useState<string | 'new' | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const handleError = useCallback(
    (e: unknown) => {
      if (e instanceof ApiError && e.status === 401) {
        setToken('');
        onLogout();
        return;
      }
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
    },
    [onLogout],
  );

  useEffect(() => {
    fetchAlbums()
      .then(setAlbums)
      .catch(handleError)
      .finally(() => setLoading(false));
  }, [handleError]);

  function upsert(a: Album) {
    setError('');
    setAlbums((list) => (list.some((x) => x._id === a._id) ? list.map((x) => (x._id === a._id ? a : x)) : [a, ...list]));
    setSelected(a._id);
  }

  const current = albums.find((a) => a._id === selected) ?? null;

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-white">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#0C0C0C]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10">
          <h1 className="text-xl font-black uppercase tracking-tight">Admin · swagtrickryan</h1>
          <div className="flex gap-2">
            <a href="#/" className={BTN}>
              Voir le site
            </a>
            <button
              className={BTN}
              onClick={() => {
                setToken('');
                onLogout();
              }}
            >
              <LogOut size={16} /> Quitter
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 md:px-10 lg:grid-cols-[320px_1fr]">
        <aside className="flex flex-col gap-3">
          <button className={BTN_PRIMARY} onClick={() => setSelected('new')}>
            <FolderPlus size={16} /> Nouvel album
          </button>
          {loading && <p className="text-sm text-white/40">Chargement…</p>}
          {albums.map((a) => (
            <button
              key={a._id}
              onClick={() => setSelected(a._id)}
              className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                selected === a._id ? 'border-neon-green bg-white/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <span className="min-w-0">
                <span className="block truncate font-bold">{a.title}</span>
                <span className="block text-xs text-white/50">
                  {a.year} · {a.location} · {a.photos.length} photo{a.photos.length > 1 ? 's' : ''}
                </span>
              </span>
              <span className="h-3 w-3 flex-shrink-0 rounded-full" style={{ background: ACCENT_MAP[a.accent]?.raw }} />
            </button>
          ))}
        </aside>

        <main>
          {error && (
            <p className="mb-4 rounded-lg border border-neon-pink/40 bg-neon-pink/10 px-4 py-3 text-sm text-neon-pink">
              {error}
            </p>
          )}
          {selected === null ? (
            <p className="py-24 text-center text-white/40">Choisis un album à gauche, ou crée-en un nouveau.</p>
          ) : (
            <AlbumEditor
              key={selected}
              album={selected === 'new' ? null : current}
              onChange={upsert}
              onDeleted={() => {
                setAlbums((list) => list.filter((a) => a._id !== selected));
                setSelected(null);
              }}
              onError={handleError}
            />
          )}
        </main>
      </div>
    </div>
  );
}

/* ---------------------------------- Export ---------------------------------- */

export default function Admin() {
  const [logged, setLogged] = useState(!!getToken());
  if (!logged) return <Login onLogin={() => setLogged(true)} />;
  return <Dashboard onLogout={() => setLogged(false)} />;
}
