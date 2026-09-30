import type { AccentColor } from './photos';

export const API_URL =
  ((import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:5000').replace(/\/$/, '');

export type PhotoType = 'image' | 'video' | 'youtube';
export type Photo = { _id: string; url: string; type?: PhotoType; caption?: string };

export type Album = {
  _id: string;
  title: string;
  year: string;
  location: string;
  accent: AccentColor;
  cover: string;
  order: number;
  frameColor?: string;
  numberColor?: string;
  buttonColor?: string;
  hoverColor?: string;
  photos: Photo[];
};

export type AlbumInput = Partial<
  Pick<Album, 'title' | 'year' | 'location' | 'accent' | 'cover' | 'order' | 'frameColor' | 'numberColor' | 'buttonColor' | 'hoverColor'>
>;

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const TOKEN_KEY = 'swag_admin_token';
export const getToken = () => localStorage.getItem(TOKEN_KEY) || '';
export const setToken = (t: string) =>
  t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY);

async function request<T>(path: string, init: RequestInit = {}, auth = false): Promise<T> {
  const headers = new Headers(init.headers);
  if (auth) headers.set('Authorization', `Bearer ${getToken()}`);
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError("Impossible de joindre l'API (elle démarre peut-être, réessaie dans 30 s).", 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || `Erreur ${res.status}`, res.status);
  return data as T;
}

const json = (method: string, body: unknown): RequestInit => ({ method, body: JSON.stringify(body) });

// --- Public ---
export const fetchAlbums = () => request<Album[]>('/api/albums');

// --- Admin ---
export const login = (password: string) =>
  request<{ token: string }>('/api/login', json('POST', { password }));

export const createAlbum = (data: AlbumInput) => request<Album>('/api/albums', json('POST', data), true);
export const updateAlbum = (id: string, data: AlbumInput) =>
  request<Album>(`/api/albums/${id}`, json('PUT', data), true);
export const deleteAlbum = (id: string) =>
  request<{ ok: true }>(`/api/albums/${id}`, { method: 'DELETE' }, true);

export const addPhotos = (id: string, photos: { url: string; type?: PhotoType; caption?: string }[]) =>
  request<Album>(`/api/albums/${id}/photos`, json('POST', { photos }), true);
export const updatePhoto = (id: string, photoId: string, data: { url?: string; caption?: string }) =>
  request<Album>(`/api/albums/${id}/photos/${photoId}`, json('PUT', data), true);
export const deletePhoto = (id: string, photoId: string) =>
  request<Album>(`/api/albums/${id}/photos/${photoId}`, { method: 'DELETE' }, true);
export const reorderPhotos = (id: string, photoIds: string[]) =>
  request<Album>(`/api/albums/${id}/reorder`, json('PUT', { photoIds }), true);

export async function uploadFile(file: File): Promise<{ url: string; type: PhotoType }> {
  const form = new FormData();
  form.append('file', file);
  return request<{ url: string; type: PhotoType }>('/api/upload', { method: 'POST', body: form }, true);
}
