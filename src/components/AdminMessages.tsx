import { Mail, MailOpen, Trash2 } from 'lucide-react';
import { deleteMessage, setMessageRead, type Message } from '@/lib/api';

const BTN =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10';

export default function AdminMessages({
  messages,
  onChange,
  onError,
}: {
  messages: Message[];
  onChange: (m: Message[]) => void;
  onError: (e: unknown) => void;
}) {
  async function toggle(m: Message) {
    try {
      const updated = await setMessageRead(m._id, !m.read);
      onChange(messages.map((x) => (x._id === m._id ? updated : x)));
    } catch (e) {
      onError(e);
    }
  }

  async function remove(m: Message) {
    if (!confirm(`Supprimer le message de ${m.name} ?`)) return;
    try {
      await deleteMessage(m._id);
      onChange(messages.filter((x) => x._id !== m._id));
    } catch (e) {
      onError(e);
    }
  }

  if (messages.length === 0) {
    return <p className="py-24 text-center text-white/40">Aucun message pour l'instant.</p>;
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-5 py-8 md:px-10">
      {messages.map((m) => (
        <article
          key={m._id}
          className={`flex flex-col gap-3 rounded-2xl border p-5 ${m.read ? 'border-white/10 bg-white/[0.03]' : 'border-neon-green/50 bg-white/5'}`}
        >
          <header className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-bold text-white">
                {m.name} {!m.read && <span className="ml-2 rounded-full bg-neon-green px-2 py-0.5 text-xs font-bold text-[#0C0C0C]">Nouveau</span>}
              </p>
              <a href={`mailto:${m.email}`} className="text-sm text-neon-blue underline underline-offset-2">
                {m.email}
              </a>
            </div>
            <time className="text-xs text-white/40">{new Date(m.createdAt).toLocaleString('fr-FR')}</time>
          </header>
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-white/80">{m.message}</p>
          <div className="flex flex-wrap gap-2">
            <a href={`mailto:${m.email}?subject=Re: votre message`} className={BTN}>
              <Mail size={14} /> Répondre
            </a>
            <button className={BTN} onClick={() => toggle(m)}>
              <MailOpen size={14} /> {m.read ? 'Marquer non lu' : 'Marquer comme lu'}
            </button>
            <button className={`${BTN} text-neon-pink`} onClick={() => remove(m)}>
              <Trash2 size={14} /> Supprimer
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
