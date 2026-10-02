import { useState } from 'react';
import { CheckCircle2, Instagram, Mail } from 'lucide-react';
import ContactButton from './ContactButton';
import DecorLayer from './DecorLayer';
import FadeIn from './FadeIn';
import RichText from './RichText';
import { useSettings } from '@/lib/settings';
import { sendContact } from '@/lib/api';
import { handleFromUrl, safeHref } from '@/lib/helpers';

const FIELD =
  'w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/30 transition-colors focus:border-neon-green focus:outline-none';

export default function ContactSection() {
  const { settings, t } = useSettings();
  const c = settings.contact;
  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      await sendContact(form);
      setStatus('sent');
      setForm({ name: '', email: '', message: '', website: '' });
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : t('contact.error'));
      setStatus('error');
    }
  }

  return (
    <section id="contact" className="relative overflow-hidden bg-[#0C0C0C] py-24 md:py-36">
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-neon-green/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-neon-pink/10 blur-[120px]" />
      <DecorLayer items={c.decor} area="contact" />

      <div className="relative mx-auto max-w-7xl px-5 md:px-10">
        <div className="flex items-center gap-2">
          <Mail size={18} className="text-neon-green" style={{ filter: 'drop-shadow(0 0 4px #39FF14)' }} />
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-white/50">{c.kicker || t('nav.contact')}</span>
        </div>

        <FadeIn y={30}>
          <h2 className="mt-6 text-5xl font-black leading-[90%] tracking-tighter text-white md:text-8xl">
            <RichText text={c.title} />
          </h2>
        </FadeIn>

        <div className="mt-12 grid gap-12 md:mt-16 md:grid-cols-2 md:gap-16">
          <div className="flex flex-col items-start gap-8">
            {c.intro && <p className="max-w-md text-base leading-relaxed text-white/50">{c.intro}</p>}

            <ContactButton label={c.ctaLabel || t('nav.contact')} href="#contact-form" accent="green" />

            <div className="flex flex-col gap-4">
              {c.email && (
                <a href={`mailto:${c.email}`} className="flex items-center gap-3 break-all text-lg text-white/70 transition-colors hover:text-neon-green">
                  <Mail size={18} className="flex-shrink-0" /> {c.email}
                </a>
              )}
              {c.instagram && (
                <a
                  href={safeHref(c.instagram)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-lg text-white/70 transition-colors hover:text-neon-pink"
                >
                  <Instagram size={18} className="flex-shrink-0" /> {handleFromUrl(c.instagram)}
                </a>
              )}
            </div>
          </div>

          <div id="contact-form" className="scroll-mt-28 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
            {status === 'sent' ? (
              <div className="flex flex-col items-start gap-4 py-8">
                <CheckCircle2 size={40} className="text-neon-green" />
                <h3 className="text-2xl font-bold text-white">{c.sentTitle || t('contact.sentTitle')}</h3>
                <p className="text-white/60">{c.sentText || t('contact.sentText')}</p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-2 rounded-full border border-white/20 px-6 py-2 text-sm text-white transition-colors hover:bg-white/10"
                >
                  {t('contact.another')}
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="relative flex flex-col gap-4" noValidate>
                <label className="flex flex-col gap-2 text-sm text-white/60">
                  {c.nameLabel || t('contact.name')}
                  <input className={FIELD} value={form.name} onChange={set('name')} maxLength={80} autoComplete="name" required />
                </label>
                <label className="flex flex-col gap-2 text-sm text-white/60">
                  {c.emailLabel || t('contact.email')}
                  <input className={FIELD} type="email" value={form.email} onChange={set('email')} maxLength={120} autoComplete="email" required />
                </label>
                <label className="flex flex-col gap-2 text-sm text-white/60">
                  {c.messageLabel || t('contact.message')}
                  <textarea className={`${FIELD} min-h-[140px] resize-y`} value={form.message} onChange={set('message')} maxLength={3000} required />
                </label>

                {/* Champ piège : invisible pour les humains, les robots le remplissent */}
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={form.website}
                  onChange={set('website')}
                  className="absolute left-[-9999px] h-0 w-0 opacity-0"
                />

                {status === 'error' && <p className="text-sm text-neon-pink">{error}</p>}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="mt-2 rounded-full bg-neon-green px-8 py-3.5 text-base font-bold text-[#0C0C0C] transition-opacity hover:opacity-80 disabled:opacity-50"
                >
                  {status === 'sending' ? t('contact.sending') : c.buttonLabel || t('contact.send')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
