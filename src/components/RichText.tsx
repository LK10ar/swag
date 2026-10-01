import { Fragment } from 'react';

const SPLIT = /(\*[^*\n]+\*|~[^~\n]+~|\^[^^\n]+\^|\[blue:[^\]\n]+\])/;
const WHOLE = /^(\*[^*\n]+\*|~[^~\n]+~|\^[^^\n]+\^|\[blue:[^\]\n]+\])$/;
const CLASSES: Record<string, string> = { '*': 'neon-text-green', '~': 'neon-text-pink', '^': 'neon-text-orange' };

/** Texte avec couleurs : *vert*  ~rose~  ^orange^  [blue:bleu] — et les retours à la ligne sont conservés */
export default function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line.split(SPLIT).map((part, j) =>
            WHOLE.test(part) ? (
              <span key={j} className={part.startsWith('[blue:') ? 'neon-text-blue' : CLASSES[part[0]]}>
                {part.startsWith('[blue:') ? part.slice(6, -1) : part.slice(1, -1)}
              </span>
            ) : (
              part
            ),
          )}
        </Fragment>
      ))}
    </>
  );
}
