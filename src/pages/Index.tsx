import { CustomCursor } from "@/components/custom-cursor.tsx";
import Navbar from "./_components/navbar.tsx";
import HeroSection from "./_components/hero-section.tsx";
import PoetrySection from "./_components/poetry-section.tsx";
import PhotographySection from "./_components/photography-section.tsx";
import AboutSection from "./_components/about-section.tsx";
import ContactSection from "./_components/contact-section.tsx";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Custom Cursor */}
      <CustomCursor />

      {/* Fixed Navigation */}
      <Navbar />

      {/* Main Content Sections */}
      <main>
        <HeroSection />
        <PoetrySection />
        <PhotographySection />
        <AboutSection />
        <ContactSection />
      </main>
    </div>
  );
}
