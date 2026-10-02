import { useEffect, useState } from 'react';

const QUERY = '(max-width: 767px)';

/** Vrai quand l'écran est un écran de téléphone (même seuil que le `md:` de Tailwind) */
export function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia(QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const on = () => setMobile(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return mobile;
}
