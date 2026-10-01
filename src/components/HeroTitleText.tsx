import { useEffect } from 'react';
import type { HeroTitle } from '@/lib/siteTypes';
import { glowShadow, heroFontSize } from '@/lib/hero';
import { loadFont } from '@/lib/fonts';

/** Le grand nom de l'accueil : couleur par lettre, clignotement, néon / ombre, contour, police */
export default function HeroTitleText({ title, fontSize }: { title: HeroTitle; fontSize?: string }) {
  useEffect(() => {
    if (title.font) loadFont(title.font);
  }, [title.font]);

  return (
    <span
      className="block w-full select-none whitespace-nowrap text-center font-black uppercase leading-none tracking-tight"
      style={{
        fontSize: fontSize ?? heroFontSize(title.text, title.scale),
        lineHeight: 1,
        fontFamily: title.font ? `'${title.font}', sans-serif` : undefined,
      }}
    >
      {Array.from(title.text || '').map((ch, i) => {
        const L = title.letters[i];
        const color = L?.color || title.color || '#F4F1E8';
        return (
          <span
            key={i}
            className={L?.blink || title.blinkAll ? 'neon-flicker' : undefined}
            style={{
              color: title.transparentFill ? 'transparent' : color,
              WebkitTextStroke: title.outline ? `${title.outlineWidth}px ${title.outlineColor || color}` : undefined,
              textShadow: glowShadow(L?.glow ? 'neon' : title.glow, title.glowColor || color),
            }}
          >
            {ch === ' ' ? '\u00A0' : ch}
          </span>
        );
      })}
    </span>
  );
}
