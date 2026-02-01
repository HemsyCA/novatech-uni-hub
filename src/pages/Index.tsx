import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { AboutSection } from "@/components/landing/AboutSection";
import { RobotsSection } from "@/components/landing/RobotsSection";
import { CompetitionsSection } from "@/components/landing/CompetitionsSection";
import { TeamSection } from "@/components/landing/TeamSection";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <Hero />
      <AboutSection />
      <RobotsSection />
      <CompetitionsSection />
      <TeamSection />
      <Footer />
    </div>
  );
};

export default Index;
