import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { HomeHighlights } from "@/components/landing/HomeHighlights";
import { ToolsSection } from "@/components/landing/ToolsSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { Footer } from "@/components/landing/Footer";
import { useScrollToHash } from "@/hooks/use-scroll-to-hash";

const Index = () => {
  useScrollToHash();

  return (
    <div className="font-mono min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <HomeHighlights />
      <ToolsSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
