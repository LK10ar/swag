type Props = {
  label?: string;
  href?: string;
  onClick?: () => void;
};

const CLASSES =
  'inline-flex items-center justify-center rounded-full border-2 border-[#D7E2EA] bg-transparent px-8 py-3 text-sm font-medium uppercase tracking-widest text-[#D7E2EA] transition-colors duration-200 hover:bg-[#D7E2EA]/10 active:bg-[#D7E2EA]/20 sm:px-10 sm:py-3.5 sm:text-base';

export default function LiveProjectButton({ label = 'Live Project', href, onClick }: Props) {
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={CLASSES} onClick={onClick}>
        {label}
      </a>
    );
  }
  return (
    <button type="button" className={CLASSES} onClick={onClick}>
      {label}
    </button>
  );
}
