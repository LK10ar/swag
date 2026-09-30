import { useEffect, useState, type ReactNode } from 'react';

function columnCount() {
  if (window.matchMedia('(min-width: 1024px)').matches) return 3;
  if (window.matchMedia('(min-width: 640px)').matches) return 2;
  return 1;
}

/**
 * Grille en colonnes qui respecte l'ordre : 1re photo en haut à gauche, 2e à côté, etc.
 * (contrairement aux colonnes CSS qui remplissent colonne par colonne et mélangent l'ordre)
 */
export default function Masonry<T>({
  items,
  render,
  gap = 'gap-4',
}: {
  items: T[];
  render: (item: T, index: number) => ReactNode;
  gap?: string;
}) {
  const [n, setN] = useState(columnCount);

  useEffect(() => {
    const onResize = () => setN(columnCount());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const cols: { item: T; index: number }[][] = Array.from({ length: n }, () => []);
  items.forEach((item, index) => cols[index % n].push({ item, index }));

  return (
    <div className={`flex ${gap}`}>
      {cols.map((col, ci) => (
        <div key={ci} className={`flex min-w-0 flex-1 flex-col ${gap}`}>
          {col.map(({ item, index }) => render(item, index))}
        </div>
      ))}
    </div>
  );
}
