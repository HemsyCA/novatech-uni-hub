import { Navbar } from "@/components/landing/Navbar";
import { CompetitionsSection } from "@/components/landing/CompetitionsSection";
import { Footer } from "@/components/landing/Footer";

const Competitions = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <main className="pt-20">
        <CompetitionsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Competitions;
