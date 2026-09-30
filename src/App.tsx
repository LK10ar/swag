import { useEffect, useState } from 'react';
import Splash from './components/Splash';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import MarqueeSection from './components/MarqueeSection';
import AboutSection from './components/AboutSection';
import ServicesSection from './components/ServicesSection';
import ProjectsSection from './components/ProjectsSection';
import GallerySection from './components/GallerySection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import ScrollTopButton from './components/ScrollTopButton';
import Admin from './components/Admin';
import { AlbumsProvider } from './lib/albums';
import { SettingsProvider } from './lib/settings';

const isAdminHash = () => window.location.hash.startsWith('#/admin');

export default function App() {
  const [admin, setAdmin] = useState(isAdminHash());

  useEffect(() => {
    const onHash = () => setAdmin(isAdminHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Admin accessible sur https://<user>.github.io/<repo>/#/admin
  if (admin) return <Admin />;

  return (
    <SettingsProvider>
    <AlbumsProvider>
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
      <ScrollTopButton />
    </AlbumsProvider>
    </SettingsProvider>
  );
}
