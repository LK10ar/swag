import { Fragment } from 'react';

const SPLIT = /(\*[^*\n]+\*|~[^~\n]+~|\^[^^\n]+\^)/;
const WHOLE = /^(\*[^*\n]+\*|~[^~\n]+~|\^[^^\n]+\^)$/;
const CLASSES: Record<string, string> = { '*': 'neon-text-green', '~': 'neon-text-pink', '^': 'neon-text-orange' };

/** Texte avec couleurs : *vert*  ~rose~  ^orange^ — et les retours à la ligne sont conservés */
export default function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line.split(SPLIT).map((part, j) =>
            WHOLE.test(part) ? (
              <span key={j} className={CLASSES[part[0]]}>
                {part.slice(1, -1)}
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
