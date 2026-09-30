import type { ReactNode } from 'react';
import { ArrowLeft, Copyright, Gavel, ShieldCheck } from 'lucide-react';
import { useSettings } from '@/lib/settings';
import { LEGAL } from '@/lib/legal';

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-white/10 pt-10">
      <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">{title}</h2>
      <div className="mt-5 flex flex-col gap-4 leading-relaxed text-white/60">{children}</div>
    </section>
  );
}

const List = ({ items }: { items: ReactNode[] }) => (
  <ul className="ml-5 flex list-disc flex-col gap-2 marker:text-neon-pink">
    {items.map((it, i) => (
      <li key={i}>{it}</li>
    ))}
  </ul>
);

const TOC = [
  ['editeur', 'Éditeur'],
  ['hebergement', 'Hébergement'],
  ['droits', "Droits d'auteur"],
  ['sanctions', 'Sanctions'],
  ['ia', 'IA & extraction'],
  ['image', "Droit à l'image"],
  ['donnees', 'Données personnelles'],
  ['cookies', 'Cookies'],
  ['droit', 'Droit applicable'],
] as const;

/** Page « Mentions légales & droits d'auteur » : #/legal */
export default function LegalPage() {
  const { settings } = useSettings();
  const email = settings.contact.email;
  const contact = email ? (
    <a href={`mailto:${email}`} className="text-neon-green underline underline-offset-2">
      {email}
    </a>
  ) : (
    <a href="#contact" className="text-neon-green underline underline-offset-2">
      le formulaire de contact
    </a>
  );

  return (
    <div className="min-h-screen bg-[#0C0C0C] pb-24 pt-28 md:pb-36 md:pt-36">
      <div className="mx-auto max-w-3xl px-5 md:px-10">
        <a
          href="#/"
          className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-white/60 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} /> Retour au site
        </a>

        <span className="mt-8 block text-xs font-medium uppercase tracking-[0.25em] text-white/50">Légal</span>
        <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl">
          Mentions <span className="neon-text-pink">légales</span>
        </h1>
        <p className="mt-3 text-sm text-white/40">Dernière mise à jour : {LEGAL.updated}</p>

        <nav className="mt-8 flex flex-wrap gap-2" aria-label="Sommaire">
          {TOC.map(([id, label]) => (
            <button
              key={id}
              onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
              className="rounded-full border border-white/15 px-4 py-1.5 text-sm text-white/60 transition-colors hover:border-neon-pink hover:text-neon-pink"
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Encart principal */}
        <div className="mt-10 rounded-3xl border-2 border-neon-pink/60 bg-neon-pink/5 p-6 md:p-8">
          <div className="flex items-center gap-3">
            <Copyright size={22} className="text-neon-pink" />
            <h2 className="text-xl font-bold text-white md:text-2xl">Toutes les photos sont protégées</h2>
          </div>
          <p className="mt-4 leading-relaxed text-white/70">
            Chaque photographie et chaque vidéo présentes sur ce site sont des œuvres de {LEGAL.brand}, protégées par
            le droit d'auteur. Les copier, les capturer, les recadrer, les retoucher, les republier ou les utiliser sans
            mon autorisation écrite est <strong className="text-white">interdit</strong> et constitue un{' '}
            <strong className="text-white">délit de contrefaçon</strong> : jusqu'à{' '}
            <strong className="text-white">3 ans d'emprisonnement et 300 000 € d'amende</strong>, sans compter les
            dommages et intérêts.
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-12">
          <Section id="editeur" title="Éditeur du site">
            <p>
              Le site « {LEGAL.brand} » est édité par {LEGAL.brand}, photographe
              {LEGAL.publisherName ? ` (${LEGAL.publisherName})` : ''}.
            </p>
            <List
              items={[
                ...(LEGAL.publisherName ? [`Directeur de la publication : ${LEGAL.publisherName}`] : []),
                ...(LEGAL.publisherStatus ? [`Statut : ${LEGAL.publisherStatus}`] : []),
                ...(LEGAL.siret ? [`SIRET : ${LEGAL.siret}`] : []),
                ...(LEGAL.publisherAddress ? [`Adresse : ${LEGAL.publisherAddress}`] : []),
                ...(LEGAL.publisherPhone ? [`Téléphone : ${LEGAL.publisherPhone}`] : []),
                <>Contact : {contact}</>,
              ]}
            />
          </Section>

          <Section id="hebergement" title="Hébergement et prestataires techniques">
            <List
              items={[
                'Site (pages web) : GitHub Pages — GitHub, Inc., San Francisco, Californie, États-Unis.',
                'Serveur (API, formulaire de contact) : Render — Render Services, Inc., San Francisco, Californie, États-Unis.',
                'Base de données : MongoDB Atlas — MongoDB, Inc.',
                'Stockage des images : ImgBB et/ou Cloudflare R2.',
                'Envoi des notifications par email : Resend.',
              ]}
            />
          </Section>

          <Section id="droits" title="Propriété intellectuelle et droits d'auteur">
            <p>
              Une photographie est une œuvre de l'esprit (art. L112-2 du Code de la propriété intellectuelle). Son auteur
              jouit d'un droit de propriété exclusif sur elle du seul fait de sa création (art. L111-1), sans formalité
              de dépôt ni mention particulière. La structure du site, les textes, les photographies et les vidéos
              sont protégés.
            </p>
            <p>
              Toute représentation ou reproduction, intégrale ou partielle, faite sans le consentement de l'auteur est
              illicite (art. L122-4). Sont notamment interdits, sans autorisation écrite préalable :
            </p>
            <List
              items={[
                'copier, télécharger, capturer ou enregistrer les photos et vidéos ;',
                'les republier ou les partager sur un site, un réseau social, une messagerie, un support imprimé ou numérique ;',
                'les modifier, les recadrer, les retoucher, les intégrer à un montage ou à une autre création ;',
                'supprimer ou masquer mon nom, un crédit ou un filigrane (atteinte au droit moral, art. L121-1) ;',
                'les utiliser à des fins commerciales : vente, publicité, pochette, merchandising, promotion d’un groupe, d’un lieu ou d’un événement ;',
                'les utiliser pour créer des images ou des contenus qui en dérivent.',
              ]}
            />
            <p>
              Partager le lien du site est bien sûr autorisé. Pour toute utilisation d'une photo (presse, groupe, salle,
              festival, publication…), demande-moi une autorisation via {contact}. Une licence écrite précisera l'usage,
              la durée et le crédit obligatoire « © {LEGAL.brand} ».
            </p>
          </Section>

          <Section id="sanctions" title="Vol de photos : ce que risque le contrefacteur">
            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <Gavel size={22} className="mt-0.5 flex-shrink-0 text-neon-pink" />
              <p>
                Reproduire ou diffuser une photo sans l'accord de son auteur est un délit de contrefaçon (art. L335-2 du
                Code de la propriété intellectuelle). Il est puni de{' '}
                <strong className="text-white">3 ans d'emprisonnement et de 300 000 € d'amende</strong>, et de{' '}
                <strong className="text-white">7 ans et 750 000 €</strong> lorsque les faits sont commis en bande
                organisée.
              </p>
            </div>
            <p>En plus de la sanction pénale, l'auteur peut agir au civil pour obtenir :</p>
            <List
              items={[
                'la cessation immédiate de l’utilisation et le retrait des contenus ;',
                'des dommages et intérêts couvrant le préjudice économique et le préjudice moral ;',
                'la publication de la décision de justice, aux frais du contrefacteur ;',
                'la prise en charge des frais engagés (constat par commissaire de justice, procédure).',
              ]}
            />
            <p>
              Toute utilisation non autorisée fera l'objet d'une mise en demeure, d'un signalement aux plateformes
              concernées (réseaux sociaux, hébergeurs, moteurs de recherche) et, si nécessaire, de poursuites. Le fait
              qu'une image soit accessible en ligne ne signifie jamais qu'elle est libre de droits, et l'absence de
              symbole © ne retire aucune protection.
            </p>
          </Section>

          <Section id="ia" title="Intelligence artificielle et extraction automatique">
            <p>
              {LEGAL.brand} s'oppose expressément à toute opération de moissonnage (scraping) et de fouille de textes et
              de données visant ce site et ses contenus, y compris pour l'entraînement de systèmes d'intelligence
              artificielle, au sens de l'article L122-5-3 du Code de la propriété intellectuelle. Cette opposition est
              exprimée par les présentes conditions et, pour les robots, par la balise « tdm-reservation » du site.
              Toute exploitation sans accord écrit préalable est interdite.
            </p>
          </Section>

          <Section id="image" title="Droit à l'image et demande de retrait">
            <p>
              Les photos sont prises lors de concerts, festivals et événements. Si vous êtes reconnaissable sur une
              image et souhaitez qu'elle soit retirée ou modifiée (art. 9 du Code civil), écrivez-moi via {contact} en
              indiquant la photo concernée : je la retirerai dans les meilleurs délais.
            </p>
          </Section>

          <Section id="donnees" title="Données personnelles">
            <div className="flex items-start gap-3">
              <ShieldCheck size={20} className="mt-0.5 flex-shrink-0 text-neon-green" />
              <p>
                Le site collecte uniquement les informations que vous saisissez dans le formulaire de contact : nom,
                adresse email et message.
              </p>
            </div>
            <List
              items={[
                'Finalité : répondre à votre demande. Aucune utilisation commerciale, aucune revente, aucune newsletter.',
                `Conservation : ${LEGAL.retention} maximum après le dernier échange, puis suppression.`,
                'Destinataires : uniquement l’éditeur du site et ses prestataires techniques listés plus haut (serveur, base de données, envoi d’email). Certains sont situés aux États-Unis : les transferts sont encadrés par les garanties prévues par le RGPD (clauses contractuelles types ou cadre de protection des données UE–États-Unis).',
                'Journaux techniques : l’hébergeur peut enregistrer votre adresse IP pour assurer la sécurité et le fonctionnement du service.',
              ]}
            />
            <p>
              Conformément au RGPD (articles 15 à 21), vous disposez d'un droit d'accès, de rectification, d'effacement,
              d'opposition, de limitation et de portabilité de vos données. Pour l'exercer, écrivez via {contact}. En
              cas de désaccord, vous pouvez saisir la CNIL (
              <a
                href="https://www.cnil.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neon-green underline underline-offset-2"
              >
                cnil.fr
              </a>
              ).
            </p>
          </Section>

          <Section id="cookies" title="Cookies et vidéos">
            <p>
              Ce site n'utilise aucun cookie publicitaire ni outil de mesure d'audience. Votre navigateur conserve
              seulement des données techniques (mise en cache des contenus du site pour accélérer l'affichage).
              Lorsque vous lancez une vidéo YouTube intégrée à une galerie, YouTube peut déposer ses propres cookies :
              ils relèvent de la politique de confidentialité de Google.
            </p>
          </Section>

          <Section id="droit" title="Responsabilité et droit applicable">
            <p>
              Les liens vers des sites externes (Instagram, YouTube…) sont fournis à titre d'information ; l'éditeur
              n'est pas responsable de leur contenu. Le présent site est soumis au droit français. En cas de litige, et à
              défaut de règlement amiable, les tribunaux français sont seuls compétents.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
