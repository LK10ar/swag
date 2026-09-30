import { Play } from 'lucide-react';
import { mediaType, stillOf } from '@/lib/helpers';
import type { Photo } from '@/lib/api';

type Props = {
  photo: Pick<Photo, 'url' | 'type'>;
  alt: string;
  className?: string;
};

/** Vignette d'un média : image, aperçu d'un fichier vidéo ou miniature YouTube (+ icône lecture). Le parent doit être `relative`. */
export default function MediaThumb({ photo, alt, className = '' }: Props) {
  const type = mediaType(photo);

  return (
    <>
      {type === 'video' ? (
        <video
          src={`${photo.url}#t=0.1`}
          muted
          playsInline
          preload="metadata"
          aria-label={alt}
          className={className}
        />
      ) : (
        <img src={stillOf(photo) ?? photo.url} alt={alt} loading="lazy" className={className} />
      )}
      {type !== 'image' && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm">
            <Play size={24} fill="currentColor" />
          </span>
        </span>
      )}
    </>
  );
}
