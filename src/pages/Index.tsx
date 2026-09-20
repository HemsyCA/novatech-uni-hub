import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { ToolsSection } from "@/components/landing/ToolsSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="font-mono min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <ToolsSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
