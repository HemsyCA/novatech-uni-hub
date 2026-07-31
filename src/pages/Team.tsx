import { Navbar } from "@/components/landing/Navbar";
import { TeamSection } from "@/components/landing/TeamSection";
import { Footer } from "@/components/landing/Footer";

const Team = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <main className="pt-20">
        <TeamSection />
      </main>
      <Footer />
    </div>
  );
};

export default Team;
