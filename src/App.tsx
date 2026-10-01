import { useEffect, useState } from 'react';
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

type Route = 'home' | 'admin' | 'gallery' | 'legal';

function getRoute(): Route {
  const h = window.location.hash;
  if (h.startsWith('#/admin')) return 'admin';
  if (h.startsWith('#/gallery')) return 'gallery';
  if (h.startsWith('#/legal')) return 'legal';
  return 'home';
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
    if (route === 'admin') return;
    const id = window.location.hash.slice(1);
    if (route === 'home' && id && !id.startsWith('/')) {
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
    } else {
      window.scrollTo(0, 0);
    }
  }, [route]);

  // Admin : https://<user>.github.io/<repo>/#/admin — Galerie : #/gallery
  if (route === 'admin') return <Admin />;

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
