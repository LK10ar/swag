import { useEffect, useState, type ReactNode } from 'react';
import Splash from './components/Splash';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import MarqueeSection from './components/MarqueeSection';
import AboutSection from './components/AboutSection';
import ServicesSection from './components/ServicesSection';
import ProjectsSection from './components/ProjectsSection';
import GallerySection from './components/GallerySection';
import GalleryPage from './components/GalleryPage';
import LegalPage from './components/LegalPage';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import ScrollTopButton from './components/ScrollTopButton';
import SiteHead from './components/SiteHead';
import Admin from './components/Admin';
import { AlbumsProvider } from './lib/albums';
import { SettingsProvider } from './lib/settings';

type Route = 'home' | 'admin' | 'gallery' | 'legal' | 'preview';

function getRoute(): Route {
  const h = window.location.hash;
  if (h.startsWith('#/admin')) return 'admin';
  if (h.startsWith('#/preview')) return 'preview';
  if (h.startsWith('#/gallery')) return 'gallery';
  if (h.startsWith('#/legal')) return 'legal';
  return 'home';
}

/** Aperçu intégré à l'admin : on bloque les liens et l'envoi du formulaire pour ne rien déclencher par erreur */
function PreviewGuard({ children }: { children: ReactNode }) {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest('a')) e.preventDefault();
    };
    const onSubmit = (e: Event) => e.preventDefault();
    document.addEventListener('click', onClick, true);
    document.addEventListener('submit', onSubmit, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('submit', onSubmit, true);
    };
  }, []);
  return <>{children}</>;
}

export default function App() {
  const [route, setRoute] = useState<Route>(getRoute);

  useEffect(() => {
    const onHash = () => setRoute(getRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Changement de page : on va à la section demandée (#gallery, #contact…) ou tout en haut
  useEffect(() => {
    if (route === 'admin' || route === 'preview') return;
    const id = window.location.hash.slice(1);
    if (route === 'home' && id && !id.startsWith('/')) {
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
    } else {
      window.scrollTo(0, 0);
    }
  }, [route]);

  // Admin : https://<user>.github.io/<repo>/#/admin — Galerie : #/gallery
  if (route === 'admin') return <Admin />;

  if (route === 'preview') {
    return (
      <SettingsProvider preview>
        <AlbumsProvider>
          <PreviewGuard>
            <Navbar />
            <main>
              <HeroSection />
              <MarqueeSection />
              <AboutSection />
              <ServicesSection />
              <ProjectsSection />
              <GallerySection />
              <ContactSection />
            </main>
            <Footer />
          </PreviewGuard>
        </AlbumsProvider>
      </SettingsProvider>
    );
  }

  return (
    <SettingsProvider>
    <SiteHead />
    <AlbumsProvider>
      {route === 'gallery' || route === 'legal' ? (
        <>
          <Navbar />
          {route === 'gallery' ? <GalleryPage /> : <LegalPage />}
          <Footer />
        </>
      ) : (
        <>
          <Splash />
          <Navbar />
          <main>
            <HeroSection />
            <MarqueeSection />
            <AboutSection />
            <ServicesSection />
            <ProjectsSection />
            <GallerySection />
            <ContactSection />
          </main>
          <Footer />
        </>
      )}
      <ScrollTopButton />
    </AlbumsProvider>
    </SettingsProvider>
  );
}
