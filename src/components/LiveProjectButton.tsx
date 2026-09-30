import type { CSSProperties } from 'react';

type Props = {
  label?: string;
  href?: string;
  onClick?: () => void;
  style?: CSSProperties; // variables --btn / --hov / --hov-text (voir btnVars)
  customHover?: boolean;
};

const BASE =
  'inline-flex items-center justify-center rounded-full border-2 border-[color:var(--btn,#D7E2EA)] bg-transparent px-8 py-3 text-sm font-medium uppercase tracking-widest text-[color:var(--btn,#D7E2EA)] transition-colors duration-200 sm:px-10 sm:py-3.5 sm:text-base';
const HOVER_DEFAULT = 'hover:bg-[#D7E2EA]/10 active:bg-[#D7E2EA]/20';
const HOVER_CUSTOM =
  'hover:border-[color:var(--hov)] hover:bg-[color:var(--hov)] hover:text-[color:var(--hov-text)] active:opacity-80';

export default function LiveProjectButton({ label = 'Live Project', href, onClick, style, customHover }: Props) {
  const className = `${BASE} ${customHover ? HOVER_CUSTOM : HOVER_DEFAULT}`;
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style} onClick={onClick}>
        {label}
      </a>
    );
  }
  return (
    <button type="button" className={className} style={style} onClick={onClick}>
      {label}
    </button>
  );
}
